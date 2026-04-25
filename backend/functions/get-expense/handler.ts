import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dc = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const expense_id =
    event.queryStringParameters?.expense_id ??
    (event.body ? JSON.parse(event.body).expense_id : undefined);

  if (!expense_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "expense_id is required" }),
    };
  }

  const response = await dc.send(
    new GetCommand({
      TableName: "Expenses_HM",
      Key: { expense_id },
    }),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ response }),
  };
};
