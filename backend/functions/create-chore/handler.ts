import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import {
  SchedulerClient,
  CreateScheduleCommand,
  FlexibleTimeWindowMode,
  ActionAfterCompletion,
} from "@aws-sdk/client-scheduler";

const client = new DynamoDBClient({});
const dc = DynamoDBDocumentClient.from(client);
const scheduler = new SchedulerClient({});

function parseDtStart(rrule: string): Date | null {
  const match = rrule.match(
    /DTSTART(?:;[^:]*)?:(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)/,
  );
  if (!match) return null;
  const [, year, month, day, hour, min, sec, utc] = match;
  return new Date(
    `${year}-${month}-${day}T${hour}:${min}:${sec}${utc ? "Z" : ""}`,
  );
}

function toScheduleExpression(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `at(${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())})`;
}

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

  if (!rotation || !name || !rrule || !description || !house_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message:
          "Missing required fields: rotation, name, rrule, description, house_id",
      }),
    };
  }

  const chore_id = crypto.randomUUID();
  await dc.send(
    new PutCommand({
      TableName: "Chores_HM",
      Item: {
        chore_id,
        house_id,
        name,
        description,
        rotation,
        index: 0,
        current_user: rotation[0],
        rrule,
        overdue: false,
      },
    }),
  );

  const dueDate = parseDtStart(rrule);
  if (dueDate) {
    await scheduler.send(
      new CreateScheduleCommand({
        Name: `chore-expiry-${chore_id}`,
        ScheduleExpression: toScheduleExpression(dueDate),
        ScheduleExpressionTimezone: "UTC",
        FlexibleTimeWindow: { Mode: FlexibleTimeWindowMode.OFF },
        Target: {
          Arn: process.env.EXPIRE_CHORE_FUNCTION_ARN!,
          RoleArn: process.env.SCHEDULER_ROLE_ARN!,
          Input: JSON.stringify({ chore_id, house_id }),
        },
        ActionAfterCompletion: ActionAfterCompletion.DELETE,
      }),
    );
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ message: "Chore created", chore_id }),
  };
};
