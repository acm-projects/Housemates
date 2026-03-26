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

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  if (event.body === null) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Body is missing" }),
    };
  }
  const { list_id } = JSON.parse(event.body);

  if (!list_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing required field: list_id" }),
    };
  }

  // Query all shopping items in this list
  const itemsResponse = await dc.send(
    new QueryCommand({
      TableName: "Shopping_HM",
      IndexName: "list-index",
      KeyConditionExpression: "list_id = :list_id",
      ExpressionAttributeValues: {
        ":list_id": list_id,
      },
    }),
  );

  // Delete all shopping items in batches of 25
  const items = itemsResponse.Items || [];
  for (let i = 0; i < items.length; i += 25) {
    const batch = items.slice(i, i + 25);
    await dc.send(
      new BatchWriteCommand({
        RequestItems: {
          Shopping_HM: batch.map((item) => ({
            DeleteRequest: {
              Key: { shoppingitem_id: item.shoppingitem_id },
            },
          })),
        },
      }),
    );
  }

  // Delete the shopping list itself
  await dc.send(
    new DeleteCommand({
      TableName: "ShoppingList_HM",
      Key: {
        list_id,
      },
    }),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Shopping list and all items deleted",
      list_id,
      items_deleted: items.length,
    }),
  };
};
