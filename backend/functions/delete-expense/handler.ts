import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

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
  const { expense_id } = JSON.parse(event.body);

  if (!expense_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing required field: expense_id" }),
    };
  }

  await dc.send(
    new DeleteCommand({
      TableName: "Expenses_HM",
      Key: {
        expense_id,
      },
    }),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Expense deleted", expense_id }),
  };
};
