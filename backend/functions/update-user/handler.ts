import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

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

  const { user_id, ...updates } = JSON.parse(event.body);

  if (!user_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "user_id is required" }),
    };
  }

  const allowedFields = [
    "name",
    "email",
    "phone_number",
    "pfp_url",
    "settings",
  ];
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
      TableName: "Users_HM",
      Key: { user_id },
      UpdateExpression: `SET ${expressionParts.join(", ")}`,
      ExpressionAttributeNames: exprAttrNames,
      ExpressionAttributeValues: exprAttrValues,
    }),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "User updated" }),
  };
};
