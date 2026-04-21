import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dc = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const qs = event.queryStringParameters;
  const body = event.body ? JSON.parse(event.body) : {};
  const user_id = qs?.user_id ?? body.user_id;

  if (!user_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "user_id is required" }),
    };
  }

  const response = await dc.send(
    new GetCommand({
      TableName: "Users_HM",
      Key: { user_id },
    }),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ response }),
  };
};
