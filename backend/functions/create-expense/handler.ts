import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

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
  const { house_id, name, payers, owers, creator, price, is_urgent, due_date } =
    JSON.parse(event.body);
  const expense_id = crypto.randomUUID();
  await dc.send(
    new PutCommand({
      TableName: "Expenses_HM",
      Item: {
        expense_id,
        house_id,
        name,
        price,
        add_date: new Date().toISOString(),
        due_date,
        is_urgent,
        payers: {
          payers,
        },
        owers: {
          owers,
        },
        creator,
      },
    }),
  );

  return {
    statusCode: 201,
    body: JSON.stringify({ message: "Expense created", expense_id }),
  };
};
