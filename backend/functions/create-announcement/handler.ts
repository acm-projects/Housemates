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
  console.log(event);
  if (event.body === null) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Body is missing" }),
    };
  }
  //maybe add image?
  const { house_id, text, user_id } = JSON.parse(event.body);
  const announcement_id = crypto.randomUUID();
  await dc.send(
    new PutCommand({
      TableName: "Announcements_HM",
      Item: {
        announcement_id,
        house_id,
        text,
        user_id,
        date: new Date().toISOString(),
      },
    }),
  );

  return {
    statusCode: 201,
    body: JSON.stringify({ message: "Annoucement created", announcement_id }),
  };
};
