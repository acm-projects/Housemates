import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  SchedulerClient,
  DeleteScheduleCommand,
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

function parseUntilDate(s: string): Date {
  if (s.length === 8) {
    return new Date(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T00:00:00Z`);
  }
  const m = s.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)/);
  if (!m) return new Date(s);
  const [, year, month, day, hour, min, sec, utc] = m;
  return new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}${utc ? "Z" : ""}`);
}

function getNextOccurrence(rrule: string, after: Date): Date | null {
  const dtStart = parseDtStart(rrule);
  if (!dtStart) return null;

  const rrulePartMatch = rrule.match(/RRULE:([^\n\r]*)/i);
  if (!rrulePartMatch) return null;

  const params: Record<string, string> = {};
  for (const part of rrulePartMatch[1].split(";")) {
    const [key, value] = part.split("=");
    params[key.toUpperCase()] = value;
  }

  const freq = params["FREQ"]?.toUpperCase();
  const interval = parseInt(params["INTERVAL"] ?? "1", 10);
  const count = params["COUNT"] ? parseInt(params["COUNT"], 10) : null;
  const until = params["UNTIL"] ? parseUntilDate(params["UNTIL"]) : null;

  let current = new Date(dtStart);
  const MAX_ITER = 10_000;

  for (let i = 0; i < MAX_ITER; i++) {
    if (count !== null && i >= count) return null;
    if (until !== null && current > until) return null;

    if (current > after) return current;

    const next = new Date(current);
    switch (freq) {
      case "DAILY":
        next.setUTCDate(next.getUTCDate() + interval);
        break;
      case "WEEKLY":
        next.setUTCDate(next.getUTCDate() + 7 * interval);
        break;
      case "MONTHLY":
        next.setUTCMonth(next.getUTCMonth() + interval);
        break;
      case "YEARLY":
        next.setUTCFullYear(next.getUTCFullYear() + interval);
        break;
      default:
        return null;
    }
    current = next;
  }

  return null;
}

function toScheduleExpression(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `at(${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())})`;
}

function updateDtStart(rrule: string, newDate: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const newDtStart = `DTSTART:${newDate.getUTCFullYear()}${pad(newDate.getUTCMonth() + 1)}${pad(newDate.getUTCDate())}T${pad(newDate.getUTCHours())}${pad(newDate.getUTCMinutes())}${pad(newDate.getUTCSeconds())}Z`;
  return rrule.replace(/DTSTART(?:;[^:]*)?:[^\n\r]*/i, newDtStart);
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

  const { chore_id, house_id } = JSON.parse(event.body);

  if (!chore_id || !house_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing required fields: chore_id, house_id",
      }),
    };
  }

  const result = await dc.send(
    new GetCommand({ TableName: "Chores_HM", Key: { chore_id, house_id } }),
  );

  if (!result.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Chore not found" }),
    };
  }

  const chore = result.Item;
  const scheduleName = `chore-expiry-${chore_id}`;

  // Delete the expiry schedule. It may already be gone if it fired and self-deleted.
  try {
    await scheduler.send(new DeleteScheduleCommand({ Name: scheduleName }));
  } catch (e: any) {
    if (e.name !== "ResourceNotFoundException") throw e;
  }

  const rrule: string = chore.rrule ?? "";
  const isRecurring = /RRULE:/i.test(rrule);

  if (!isRecurring) {
    await dc.send(
      new UpdateCommand({
        TableName: "Chores_HM",
        Key: { chore_id, house_id },
        UpdateExpression: "SET completed = :completed, overdue = :overdue",
        ExpressionAttributeValues: { ":completed": true, ":overdue": false },
      }),
    );
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Chore completed" }),
    };
  }

  // Advance past whichever is later: the current due date or now.
  // This ensures early completions still step to the next cycle rather than
  // returning the same due date again.
  const dtStart = parseDtStart(rrule);
  const after = dtStart && dtStart > new Date() ? dtStart : new Date();
  const nextDate = getNextOccurrence(rrule, after);

  if (!nextDate) {
    // COUNT or UNTIL reached — no more occurrences
    await dc.send(
      new UpdateCommand({
        TableName: "Chores_HM",
        Key: { chore_id, house_id },
        UpdateExpression: "SET completed = :completed, overdue = :overdue",
        ExpressionAttributeValues: { ":completed": true, ":overdue": false },
      }),
    );
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Chore completed (no more occurrences)" }),
    };
  }

  // Advance rotation
  const rotation: string[] = chore.rotation ?? [];
  const newIndex =
    rotation.length > 0 ? ((chore.index ?? 0) + 1) % rotation.length : 0;
  const newCurrentUser = rotation[newIndex] ?? chore.current_user;
  const updatedRrule = updateDtStart(rrule, nextDate);

  await dc.send(
    new UpdateCommand({
      TableName: "Chores_HM",
      Key: { chore_id, house_id },
      UpdateExpression:
        "SET #index = :index, current_user = :current_user, rrule = :rrule, overdue = :overdue",
      ExpressionAttributeNames: { "#index": "index" },
      ExpressionAttributeValues: {
        ":index": newIndex,
        ":current_user": newCurrentUser,
        ":rrule": updatedRrule,
        ":overdue": false,
      },
    }),
  );

  await scheduler.send(
    new CreateScheduleCommand({
      Name: scheduleName,
      ScheduleExpression: toScheduleExpression(nextDate),
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

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Chore completed",
      next_due: nextDate.toISOString(),
      next_user: newCurrentUser,
    }),
  };
};
