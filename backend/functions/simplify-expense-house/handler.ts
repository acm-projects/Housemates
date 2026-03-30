import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
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
  const { house_id, creator } = JSON.parse(event.body);

  if (!house_id || !creator == null) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message:
          "Missing required fields: house_id,  creator, due_date, is_urgent",
      }),
    };
  }

  const result = await dc.send(
    new QueryCommand({
      TableName: "Expenses_HM",
      IndexName: "house-index",
      KeyConditionExpression: "house_id = :house_id",
      ExpressionAttributeValues: {
        ":house_id": house_id,
      },
    }),
  );

  let expenseIds: string[] = [];
  let people: Record<string, number> = {};
  let is_urgent = false;
  let due_date = new Date().toISOString();
  for (const ex of result.Items as any[]) {
    expenseIds.push(ex.expense_id);
    is_urgent = is_urgent || (ex.is_urgent as boolean);
    due_date =
      due_date > (ex.due_date as string) ? (ex.due_date as string) : due_date;
    const payers = Object.entries(ex.payers) as [string, number][];
    const owers = Object.entries(ex.owers) as [string, number][];
    owers.forEach(([k, v]: [string, number]) => {
      people[k] = people[k] ?? 0;
      people[k] -= v;
    });
    payers.forEach(([k, v]: [string, number]) => {
      people[k] = people[k] ?? 0;
      people[k] += v;
    });
  }

  const payers: Record<string, number> = {};
  const owers: Record<string, number> = {};

  Object.entries(people).forEach(([k, v]) => {
    if (v > 0) {
      payers[k] = v;
    } else if (v < 0) {
      owers[k] = -v;
    }
  });

  const price = Object.values(owers).reduce((sum, v) => sum + v, 0);

  const expense_id = crypto.randomUUID();
  await dc.send(
    new PutCommand({
      TableName: "Expenses_HM",
      Item: {
        expense_id,
        house_id,
        name: "Simplified Expense: " + new Date().toUTCString(),
        price,
        add_date: new Date().toISOString(),
        due_date,
        is_urgent,
        payers,
        owers,
        creator,
        expenses: expenseIds,
      },
    }),
  );

  return {
    statusCode: 201,
    body: JSON.stringify({ expense_id, payers, owers, expenses: expenseIds }),
  };
};
