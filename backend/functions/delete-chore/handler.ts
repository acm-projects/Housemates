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
  const { chore_id, house_id } = JSON.parse(event.body);

  if (!chore_id || !house_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing required fields: chore_id, house_id" }),
    };
  }

  await dc.send(
    new DeleteCommand({
      TableName: "Chores_HM",
      Key: {
        chore_id,
        house_id,
      },
    }),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Chore deleted", chore_id }),
  };
};
