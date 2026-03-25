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

  const { shoppingitem_id, ...updates } = JSON.parse(event.body);

  if (!shoppingitem_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "shoppingitem_id is required" }),
    };
  }

  const allowedFields = ["name", "description", "price", "list_id"];
  const expressionParts: string[] = [];
  const exprAttrNames: Record<string, string> = {};
  const exprAttrValues: Record<string, any> = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      expressionParts.push(`#${field} = :${field}`);
      exprAttrNames[`#${field}`] = field;
      exprAttrValues[`:${field}`] = updates[field];
    }
  }

  if (expressionParts.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No valid fields to update" }),
    };
  }

  await dc.send(
    new UpdateCommand({
      TableName: "Shopping_HM",
      Key: { shoppingitem_id },
      UpdateExpression: `SET ${expressionParts.join(", ")}`,
      ExpressionAttributeNames: exprAttrNames,
      ExpressionAttributeValues: exprAttrValues,
    }),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Shopping item updated" }),
  };
};
