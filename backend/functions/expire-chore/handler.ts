import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dc = DynamoDBDocumentClient.from(client);

export const handler = async (event: {
  chore_id: string;
  house_id: string;
}): Promise<void> => {
  const { chore_id, house_id } = event;

  await dc.send(
    new UpdateCommand({
      TableName: "Chores_HM",
      Key: { chore_id, house_id },
      UpdateExpression: "SET overdue = :overdue",
      ExpressionAttributeValues: { ":overdue": true },
    }),
  );
};
