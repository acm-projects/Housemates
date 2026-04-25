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
  const user_id = qs?.user_id ?? body.user_id;

  if (!user_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "user_id is required" }),
    };
  }

  const response = await dc.send(
    new QueryCommand({
      TableName: "Chores_HM",
      IndexName: "current-user-index",
      KeyConditionExpression: "current_user = :current_user",
      ExpressionAttributeValues: {
        ":current_user": user_id,
      },
    }),
  );

  console.log(response);
  if (response.$metadata.httpStatusCode == 200) {
    return {
      statusCode: 200,
      body: JSON.stringify({ count: response.Count, items: response.Items }),
    };
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
