import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

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
      body: JSON.stringify({ message: "Body is missing" }),
    };
  }
  const { house_id } = JSON.parse(event.body);
  const response = await dc.send(
    new QueryCommand({
      TableName: "ShoppingList_HM",
      IndexName: "house-index",
      KeyConditionExpression: "house_id = :house_id",
      ExpressionAttributeValues: {
        ":house_id": house_id,
      },
    }),
  );

  console.log(response);
  if (response.$metadata.httpStatusCode == 200) {
    return {
      statusCode: 200,
      body: JSON.stringify({ response }),
    };
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
