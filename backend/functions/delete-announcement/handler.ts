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
  const { house_id, announcement_id } = JSON.parse(event.body);

  if (!house_id || !announcement_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing required fields: house_id, announcement_id" }),
    };
  }

  await dc.send(
    new DeleteCommand({
      TableName: "Announcements_HM",
      Key: {
        house_id,
        announcement_id,
      },
    }),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Announcement deleted", announcement_id }),
  };
};
