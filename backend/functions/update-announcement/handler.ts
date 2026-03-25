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

  const { house_id, announcement_id, ...updates } = JSON.parse(event.body);

  if (!house_id || !announcement_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "house_id and announcement_id are required",
      }),
    };
  }

  const allowedFields = ["text", "date"];
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
      TableName: "Announcements_HM",
      Key: { house_id, announcement_id },
      UpdateExpression: `SET ${expressionParts.join(", ")}`,
      ExpressionAttributeNames: exprAttrNames,
      ExpressionAttributeValues: exprAttrValues,
    }),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Announcement updated" }),
  };
};
