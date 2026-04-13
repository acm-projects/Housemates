/**
 * Typed wrappers for Housemates API Gateway routes (see backend/template.yaml).
 * Uses GET-with-body where the backend expects a JSON body on GET.
 */
import {
  apiDelete,
  apiGet,
  apiGetWithBody,
  apiPost,
  apiPut,
  extractDynamoItems,
} from '@/utils/api';

export type DynamoItem = Record<string, unknown>;

export const housematesApi = {
  // Announcements
  getAnnouncements: (house_id: string) => apiGetWithBody('/announcements', { house_id }),
  createAnnouncement: (body: { house_id: string; user_id: string; text: string }) =>
    apiPost('/announcements', body),
  updateAnnouncement: (body: {
    house_id: string;
    announcement_id: string;
    text: string;
    date: string;
  }) => apiPut('/announcements', body),
  deleteAnnouncement: (body: { house_id: string; announcement_id: string }) =>
    apiDelete('/announcements', body),

  // Chores
  createChore: (body: Record<string, unknown>) => apiPost('/chores', body),
  getChoresByHouse: (house_id: string) => apiGetWithBody('/chores/house', { house_id }),
  getChoresByUser: (user_id: string) => apiGetWithBody('/chores/user', { user_id }),
  updateChore: (body: Record<string, unknown>) => apiPut('/chores', body),
  deleteChore: (body: Record<string, unknown>) => apiDelete('/chores', body),

  // House
  createHouse: (body: Record<string, unknown>) => apiPost('/house', body),
  updateHouse: (body: Record<string, unknown>) => apiPut('/house', body),
  deleteHouse: (body: Record<string, unknown>) => apiDelete('/house', body),
  addHouseUser: (body: Record<string, unknown>) => apiPut('/house/user', body),

  // Expenses
  createExpense: (body: Record<string, unknown>) => apiPost('/expenses', body),
  getExpensesByHouse: (body: { house_id: string; get_urgent?: boolean }) =>
    apiGetWithBody('/expenses/house', body),
  getExpensesByOwer: (body: Record<string, unknown>) => apiGetWithBody('/expenses/ower', body),
  getExpensesByPayer: (body: Record<string, unknown>) => apiGetWithBody('/expenses/payer', body),
  getExpense: (body: Record<string, unknown>) => apiGetWithBody('/expense', body),
  updateExpense: (body: Record<string, unknown>) => apiPut('/expenses', body),
  deleteExpense: (body: Record<string, unknown>) => apiDelete('/expenses', body),
  simplifyExpenses: (body: Record<string, unknown>) => apiPost('/expenses/simplify', body),

  // Shopping
  createShoppingList: (body: { name: string; house_id: string }) => apiPost('/shopping/list', body),
  getShoppingListsByHouse: (house_id: string) => apiGetWithBody('/shopping/list', { house_id }),
  updateShoppingList: (body: Record<string, unknown>) => apiPut('/shopping/list', body),
  deleteShoppingList: (body: Record<string, unknown>) => apiDelete('/shopping/list', body),
  createShoppingItem: (body: Record<string, unknown>) => apiPost('/shopping/item', body),
  getShoppingItems: (list_id: string) => apiGetWithBody('/shopping/items', { list_id }),
  updateShoppingItem: (body: Record<string, unknown>) => apiPut('/shopping/item', body),
  deleteShoppingItem: (body: Record<string, unknown>) => apiDelete('/shopping/item', body),

  // Users
  getUser: (user_id: string) => apiGetWithBody('/users', { user_id }),
  getUsersByHouse: (house_id: string) => apiGetWithBody('/users/house', { house_id }),
  updateUser: (body: Record<string, unknown>) => apiPut('/users', body),

  hello: () => apiGet('/hello'),
};

export { extractDynamoItems };
export type { DynamoItem as HousematesDynamoItem };
