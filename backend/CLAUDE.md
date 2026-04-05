# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build (must run before testing locally or deploying)
sam build --profile housemates

# Run locally at http://127.0.0.1:3000 (requires Docker running)
sam local start-api --profile housemates

# Deploy (ONLY USE GUIDED)
sam build --profile housemates && sam deploy --guided --profile housemates
```

There are no tests in this project.

## Architecture

This is an AWS SAM (Serverless Application Model) backend consisting of several Lambda functions written in TypeScript, exposed via a single API Gateway (`HousematesApi`).

**Key architectural facts:**

- Every Lambda function lives in `functions/<name>/handler.ts` and exports a single `handler` function
- All functions are built with esbuild (bundled, minified, targeting ES2022); `@aws-sdk/*` is excluded from bundles (provided by Lambda runtime)
- All functions hardcode table names directly (e.g. `"Expenses_HM"`)

**DynamoDB tables** (see `DB_SCHEMA.md` for full schema):

| Table              | Partition Key     | Sort Key          | Notes                                                           |
| ------------------ | ----------------- | ----------------- | --------------------------------------------------------------- |
| `Users_HM`         | `user_id`         | —                 |                                                                 |
| `Houses_HM`        | `id`              | —                 | `expense_bucket` holds S3 bucket name                           |
| `Expenses_HM`      | `expense_id`      | —                 | `payers`/`owers` are `Map<String, Number>`                      |
| `Chores_HM`        | `chore_id`        | `house_id`        | `rrule` is iCal recurrence string; `rotation` is `List<String>` |
| `Announcements_HM` | `house_id`        | `announcement_id` |                                                                 |
| `ShoppingList_HM`  | `list_id`         | —                 |                                                                 |
| `Shopping_HM`      | `shoppingitem_id` | —                 | `list_id` references `ShoppingList_HM`                          |

**S3:** Each house has an associated expenses bucket stored as `expense_bucket` on the `Houses_HM` item.

**Adding a new function:**

1. Create `functions/<name>/handler.ts` with a `handler` export
2. Add the function resource in `template.yaml` using the `*lambda-build` metadata anchor
3. Run `sam build --profile housemates`

**Testing:**
Run `npm run api` in a background process and interact w/ the api via curl & bash commands

## Configuration

`samconfig.toml` is gitignored. Copy `samconfig.toml.example` and fill in the DynamoDB table name and ARN under `parameter_overrides`. AWS profile must be `housemates` (region `us-east-2`).
