import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dc = DynamoDBDocumentClient.from(client);

type SimplifyResponse = {
  payers: Record<string, number>;
  owers: Record<string, number>;
  expenses: string[];
};

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
      body: JSON.stringify({
        message: "Missing house_id",
      }),
    };
  }

  const expenses = await dc.send(
    new QueryCommand({
      TableName: "Expenses_HM",
      IndexName: "house-index",
      KeyConditionExpression: "house_id = :house_id",
      ExpressionAttributeValues: {
        ":house_id": house_id,
      },
    }),
  );

  let money: SimplifyResponse = {
    payers: {},
    owers: {},
    expenses: [],
  };

  let people: Record<string, number> = {};

  for (const ex of expenses.Items as any) {
    money.expenses.push((ex as any).expense_id);
    const payers = Object.entries((ex as any).payers) as [string, number][];
    const owers = Object.entries((ex as any).owers) as [string, number][];
    owers.forEach(([k, v]: [string, number]) => {
      people[k] = people[k] ?? 0;
      people[k] -= v;
    });
    payers.forEach(([k, v]: [string, number]) => {
      people[k] = people[k] ?? 0;
      people[k] += v;
    });
  }
  console.log(people);
  Object.entries(people).forEach(([k, v]) => {
    if (v > 0) {
      money.payers[k] = v;
    } else if (v < 0) {
      money.owers[k] = -v;
    }
  });
  console.log(money);

  return {
    statusCode: 201,
    body: JSON.stringify({ money }),
  };
};
