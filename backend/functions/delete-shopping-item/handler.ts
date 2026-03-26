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
  const { shoppingitem_id } = JSON.parse(event.body);

  if (!shoppingitem_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing required field: shoppingitem_id" }),
    };
  }

  await dc.send(
    new DeleteCommand({
      TableName: "Shopping_HM",
      Key: {
        shoppingitem_id,
      },
    }),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Shopping item deleted", shoppingitem_id }),
  };
};
