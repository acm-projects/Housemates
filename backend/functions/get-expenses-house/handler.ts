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
  const house_id = qs?.house_id ?? body.house_id;
  const get_urgent = qs?.get_urgent === "true" || body.get_urgent === true;

  if (!house_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "house_id is required" }),
    };
  }
  let params: any;
  //terrible implementation. If anyone would like to suggest something better I'm all ears
  if (get_urgent) {
    params = new QueryCommand({
      TableName: "Expenses_HM",
      IndexName: "house-index",
      FilterExpression: "is_urgent = :is_urgent",
      KeyConditionExpression: "house_id = :house_id",
      ExpressionAttributeValues: {
        ":house_id": house_id,
        ":is_urgent": true,
      },
    });
  } else {
    params = new QueryCommand({
      TableName: "Expenses_HM",
      IndexName: "house-index",
      KeyConditionExpression: "house_id = :house_id",
      ExpressionAttributeValues: {
        ":house_id": house_id,
      },
    });
  }

  console.log(params);
  const response = await dc.send(params);

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
