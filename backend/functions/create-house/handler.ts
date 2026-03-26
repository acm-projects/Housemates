import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

import {
  BucketAlreadyExists,
  CreateBucketCommand,
  S3Client,
  waitUntilBucketExists,
} from "@aws-sdk/client-s3";

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

  const { user_id, name } = JSON.parse(event.body);

  if (!user_id || !name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing at least 1 required fields: user_id, name" }),
    };
  }

  const id = crypto.randomUUID();
  const bucketName = encodeURI(id + "Expense_bucket");

  const bclient = new S3Client({});
  try {
    const newBucket = await bclient.send(
      new CreateBucketCommand({ Bucket: bucketName }),
    );
    await waitUntilBucketExists(
      { client: bclient, maxWaitTime: 15 },
      { Bucket: bucketName },
    );
    //TODO: Add bucket perms
  } catch (er) {
    if (er instanceof BucketAlreadyExists) {
      return {
        statusCode: 503,
        body: JSON.stringify({ error: "Error: bucket is missing" }),
      };
    }
  }

  await dc.send(
    new PutCommand({
      TableName: "Houses_HM",
      Item: {
        id,
        name,
        date_created: new Date().toISOString(),
        users: [user_id],
        expense_bucket: bucketName,
      },
    }),
  );

  return {
    statusCode: 201,
    body: JSON.stringify({ message: "House Created", id }),
  };
};
