import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dc = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  if (event.body === null) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Body is missing" }),
    };
  }

  const { house_id, user_id } = JSON.parse(event.body);

  const response = await dc.send(
    new QueryCommand({
      TableName: "Expenses_HM",
      IndexName: "house-index",
      FilterExpression: "contains(owers, :user_id)",
      KeyConditionExpression: "house_id = :house_id",
      ExpressionAttributeValues: {
        ":house_id": house_id,
        ":user_id": user_id,
      },
    }),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ response }),
  };
};
