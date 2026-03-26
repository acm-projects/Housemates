import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

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

  const { id, user_id } = JSON.parse(event.body);

  if (!id || !user_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "id and user_id are required" }),
    };
  }

  await dc.send(
    new UpdateCommand({
      TableName: "Houses_HM",
      Key: { id },
      UpdateExpression: "SET #users = list_append(#users, :new_user)",
      ExpressionAttributeNames: { "#users": "users" },
      ExpressionAttributeValues: { ":new_user": [user_id] },
    }),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "User added to house" }),
  };
};
