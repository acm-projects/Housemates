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
  const list_id = qs?.list_id ?? body.list_id;

  if (!list_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "list_id is required" }),
    };
  }

  const response = await dc.send(
    new QueryCommand({
      TableName: "Shopping_HM",
      IndexName: "list-index",
      KeyConditionExpression: "list_id = :list_id",
      ExpressionAttributeValues: {
        ":list_id": list_id,
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
