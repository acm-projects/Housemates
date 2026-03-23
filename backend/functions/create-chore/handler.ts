import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

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
  const { rotation, name, rrule, description, house_id } = JSON.parse(
    event.body,
  );
  await dc.send(
    new PutCommand({
      TableName: "Chores_HM",
      Item: {
        chore_id: crypto.randomUUID(),
        house_id,
        name,
        description,
        rotation,
        index: 0,
        current_user: rotation[0],
        //Store RRULE date
        //TODO: Add EventBridge Scheduler to auto-expire tasks
        rrule,
      },
    }),
  );

  return {
    statusCode: 201,
    body: JSON.stringify({ message: "Chore created" }),
  };
};
