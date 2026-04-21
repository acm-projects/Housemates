import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dc = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const qs = event.queryStringParameters;
  const body = event.body ? JSON.parse(event.body) : {};
  const house_id = qs?.house_id ?? body.house_id;

  if (!house_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "house_id is required" }),
    };
  }

  const response = await dc.send(
    new QueryCommand({
      TableName: "Users_HM",
      IndexName: "house-index",
      KeyConditionExpression: "house_id = :house_id",
      ExpressionAttributeValues: {
        ":house_id": house_id,
      },
    }),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ response }),
  };
};
