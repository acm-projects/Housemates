import { buildCurrentDateItems, filters, taskItems } from "../constants/tasks";

export function useTaskData() {
  return {
    dateItems: buildCurrentDateItems(),
    filters,
    taskItems,
  };
}
