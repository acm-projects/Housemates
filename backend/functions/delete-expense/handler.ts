import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import {
  DynamoDBDocumentClient,
  DeleteCommand,
  GetCommand,
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
  const { expense_id } = JSON.parse(event.body);

  if (!expense_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing required field: expense_id" }),
    };
  }

  const { Item: expense } = await dc.send(
    new GetCommand({
      TableName: "Expenses_HM",
      Key: { expense_id },
    }),
  );

  if (expense?.expenses?.length) {
    await Promise.all(
      (expense.expenses as string[]).map((ref_id) =>
        dc.send(
          new DeleteCommand({
            TableName: "Expenses_HM",
            Key: { expense_id: ref_id },
          }),
        ),
      ),
    );
  }

  await dc.send(
    new DeleteCommand({
      TableName: "Expenses_HM",
      Key: { expense_id },
    }),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Expense deleted",
      expense_id,
      was_simplified: expense?.expenses?.length,
    }),
  };
};
