import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import {
  DynamoDBDocumentClient,
  DeleteCommand,
  QueryCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dc = DynamoDBDocumentClient.from(client);

async function batchDelete(tableName: string, keys: Record<string, any>[]) {
  for (let i = 0; i < keys.length; i += 25) {
    const batch = keys.slice(i, i + 25);
    await dc.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: batch.map((key) => ({
            DeleteRequest: { Key: key },
          })),
        },
      }),
    );
  }
}

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  if (event.body === null) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Body is missing" }),
    };
  }
  const { house_id } = JSON.parse(event.body);

  if (!house_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing required field: house_id" }),
    };
  }

  // Delete all announcements (house_id is partition key)
  const announcements = await dc.send(
    new QueryCommand({
      TableName: "Announcements_HM",
      KeyConditionExpression: "house_id = :house_id",
      ExpressionAttributeValues: { ":house_id": house_id },
    }),
  );
  await batchDelete(
    "Announcements_HM",
    (announcements.Items || []).map((item) => ({
      house_id: item.house_id,
      announcement_id: item.announcement_id,
    })),
  );

  // Delete all chores (house_id is sort key, use GSI)
  const chores = await dc.send(
    new QueryCommand({
      TableName: "Chores_HM",
      IndexName: "house-id-index",
      KeyConditionExpression: "house_id = :house_id",
      ExpressionAttributeValues: { ":house_id": house_id },
    }),
  );
  await batchDelete(
    "Chores_HM",
    (chores.Items || []).map((item) => ({
      chore_id: item.chore_id,
      house_id: item.house_id,
    })),
  );

  // Delete all expenses
  const expenses = await dc.send(
    new QueryCommand({
      TableName: "Expenses_HM",
      IndexName: "house-index",
      KeyConditionExpression: "house_id = :house_id",
      ExpressionAttributeValues: { ":house_id": house_id },
    }),
  );
  await batchDelete(
    "Expenses_HM",
    (expenses.Items || []).map((item) => ({
      expense_id: item.expense_id,
    })),
  );

  // Delete all shopping lists and their items
  const shoppingLists = await dc.send(
    new QueryCommand({
      TableName: "ShoppingList_HM",
      IndexName: "house-index",
      KeyConditionExpression: "house_id = :house_id",
      ExpressionAttributeValues: { ":house_id": house_id },
    }),
  );
  for (const list of shoppingLists.Items || []) {
    const items = await dc.send(
      new QueryCommand({
        TableName: "Shopping_HM",
        IndexName: "list-index",
        KeyConditionExpression: "list_id = :list_id",
        ExpressionAttributeValues: { ":list_id": list.list_id },
      }),
    );
    await batchDelete(
      "Shopping_HM",
      (items.Items || []).map((item) => ({
        shoppingitem_id: item.shoppingitem_id,
      })),
    );
  }
  await batchDelete(
    "ShoppingList_HM",
    (shoppingLists.Items || []).map((item) => ({
      list_id: item.list_id,
    })),
  );

  // Delete the house itself
  await dc.send(
    new DeleteCommand({
      TableName: "Houses_HM",
      Key: { id: house_id },
    }),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "House and all related data deleted", house_id }),
  };
};
