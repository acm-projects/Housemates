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
  if (event.body === null) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Body is missing" }),
    };
  }

  const { name, house_id } = JSON.parse(event.body);
  const list_id = crypto.randomUUID();
  await dc.send(
    new PutCommand({
      TableName: "ShoppingList_HM",
      Item: {
        list_id,
        house_id,
        name,
      },
    }),
  );

  return {
    statusCode: 201,
    body: JSON.stringify({ message: "Shopping List Created", list_id }),
  };
};
