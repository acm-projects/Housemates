# DynamoDB Schema Reference

All tables use AWS DynamoDB. Types are DynamoDB types (String, Number, Boolean, List, Map).

---

## Announcements_HM

| Attribute       | Type   | Key           |
| --------------- | ------ | ------------- |
| house_id        | String | Partition key |
| announcement_id | String | Sort key      |
| date            | String |               |
| text            | String |               |
| user_id         | String |               |

---

## Chores_HM

| Attribute    | Type           | Key                                                            |
| ------------ | -------------- | -------------------------------------------------------------- |
| chore_id     | String         | Partition key                                                  |
| house_id     | String         | Sort key                                                       |
| current_user | String         |                                                                |
| description  | String         |                                                                |
| index        | Number         |                                                                |
| name         | String         |                                                                |
| rotation     | List\<String\> |                                                                |
| rrule        | String         | iCal recurrence rule string (e.g. `DTSTART:...RRULE:FREQ=...`) |

---

## Expenses_HM

| Attribute  | Type                  | Key                                    |
| ---------- | --------------------- | -------------------------------------- |
| expense_id | String                | Partition key                          |
| add_date   | String                |                                        |
| creator    | String                |                                        |
| due_date   | String                |                                        |
| house_id   | String                |                                        |
| is_urgent  | Boolean               |                                        |
| name       | String                |                                        |
| owers      | Map\<String, Number\> | map of user and how much they owe      |
| payers     | Map\<String, Number\> | map of user and how much they are owed |
| price      | Number                |                                        |

---

## Houses_HM

| Attribute      | Type           | Key                                  |
| -------------- | -------------- | ------------------------------------ |
| id             | String         | Partition key                        |
| date_created   | String         |                                      |
| expense_bucket | String         | S3 bucket name derived from house id |
| name           | String         |                                      |
| users          | List\<String\> |                                      |

---

## ShoppingList_HM

| Attribute | Type   | Key           |
| --------- | ------ | ------------- |
| list_id   | String | Partition key |
| house_id  | String |               |
| name      | String |               |

---

## Shopping_HM

| Attribute       | Type   | Key                            |
| --------------- | ------ | ------------------------------ |
| shoppingitem_id | String | Partition key                  |
| description     | String |                                |
| house_id        | String |                                |
| list_id         | String | Foreign ref to ShoppingList_HM |
| name            | String |                                |
| price           | String |                                |

---

## Users_HM

| Attribute              | Type    | Key                     |
| ---------------------- | ------- | ----------------------- |
| user_id                | String  | Partition key           |
| createdAt              | String  |                         |
| email                  | String  |                         |
| house_id               | String  |                         |
| name                   | String  |                         |
| pfp_url                | String  |                         |
| phone_number           | String  |                         |
| settings               | Map     | TODO: Add more settings |
| settings.notifications | Boolean |                         |
