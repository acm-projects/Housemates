export type Task = {
  id: string; title: string; note: string; time: string;
  dateKey: string; status: 'Done' | 'Urgent' | 'To-do';
  color: string; done: boolean; urgent: boolean;
};

// No seed announcements — starts empty, user posts their own
export type Announcement = {
  id: string; announcement_id?: string;
  message: string; time: string; dateLabel: string;
};

export type ShoppingItem = {
  id: string; name: string; price: string;
  checked: boolean; shoppingitem_id?: string; color: string;
};

export type ShoppingList = {
  id: string; title: string; list_id?: string;
  items: ShoppingItem[]; collapsed: boolean;
};

// ── Generic listener store factory ──────────────────────────────────────────
function makeStore<T>(initial: T[]) {
  const _items: T[] = [...initial];
  const _listeners: Array<() => void> = [];
  const notify = () => _listeners.forEach(l => l());
  return {
    getAll:    ()         => _items as T[],
    add:       (item: T)  => { _items.unshift(item); notify(); },
    remove:    (pred: (item: T) => boolean) => {
      const i = _items.findIndex(pred);
      if (i >= 0) { _items.splice(i, 1); notify(); }
    },
    update:    (pred: (item: T) => boolean, patch: Partial<T>) => {
      const item = _items.find(pred);
      if (item) { Object.assign(item, patch); notify(); }
    },
    subscribe: (listener: () => void) => {
      _listeners.push(listener);
      return () => {
        const i = _listeners.indexOf(listener);
        if (i >= 0) _listeners.splice(i, 1);
      };
    },
  };
}

// ── Task Store ───────────────────────────────────────────────────────────────
function getTodayDateKey(): string {
  const today = new Date();
  return [today.getFullYear(), `${today.getMonth()+1}`.padStart(2,'0'), `${today.getDate()}`.padStart(2,'0')].join('-');
}

function getDateKey(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return [date.getFullYear(), `${date.getMonth()+1}`.padStart(2,'0'), `${date.getDate()}`.padStart(2,'0')].join('-');
}

const SWATCH = ['#c9b8e8','#f5c6d0','#fde5b0','#b8e0d2','#aed6f1','#f9e0c0'];
const SEED_TASKS: Task[] = [
  { id:'t1', title:'Clean Kitchen', note:'Wipe counters & sink', time:'09:00 AM', dateKey:getTodayDateKey(), status:'To-do', color:SWATCH[0], done:false, urgent:false },
  { id:'t2', title:'Buy Groceries', note:'Milk, eggs, bread', time:'10:30 AM', dateKey:getTodayDateKey(), status:'Urgent', color:SWATCH[1], done:false, urgent:true },
  { id:'t3', title:'Pay Utilities', note:'Electric & water bills', time:'02:00 PM', dateKey:getTodayDateKey(), status:'Done', color:SWATCH[2], done:true, urgent:false },
  { id:'t4', title:'Laundry', note:'Wash & dry clothes', time:'03:00 PM', dateKey:getTodayDateKey(), status:'To-do', color:SWATCH[3], done:false, urgent:false },
  { id:'t5', title:'House Meeting', note:'Discuss expenses', time:'06:00 PM', dateKey:getTodayDateKey(), status:'To-do', color:SWATCH[4], done:false, urgent:false },
  { id:'t6', title:'Vacuum Living Room', note:'Deep clean', time:'11:00 AM', dateKey:getDateKey(1), status:'To-do', color:SWATCH[5], done:false, urgent:false },
  { id:'t7', title:'Fix Bathroom Faucet', note:'Water leak', time:'01:00 PM', dateKey:getDateKey(-1), status:'Urgent', color:SWATCH[0], done:false, urgent:true },
];

const _taskBase = makeStore<Task>(SEED_TASKS);
export const taskStore = {
  ..._taskBase,
  getTasks: () => _taskBase.getAll(),
  addTask:  (t: Task) => _taskBase.add(t),
  toggleDone: (id: string) => {
    const t = _taskBase.getAll().find(t => t.id === id);
    if (t) _taskBase.update(x => x.id === id, {
      done:   !t.done,
      status: !t.done ? 'Done' : t.urgent ? 'Urgent' : 'To-do',
    });
  },
};

// ── Announcement Store — starts EMPTY ───────────────────────────────────────
export const announcementStore = makeStore<Announcement>([]);

// ── Shopping List Store ──────────────────────────────────────────────────────
const SEED_LISTS: ShoppingList[] = [
  { id:'g1', title:'Grocery List', collapsed:false, items:[
    { id:'1', name:'Tomatoes',  price:'$31.00', checked:false, color:SWATCH[0] },
    { id:'2', name:'Milk',      price:'$31.00', checked:false, color:SWATCH[1] },
  ]},
  { id:'g2', title:'Utilities List', collapsed:false, items:[
    { id:'3', name:'Water Bill',       price:'$31.00', checked:false, color:SWATCH[2] },
    { id:'4', name:'Electricity Bill', price:'$31.00', checked:false, color:SWATCH[3] },
  ]},
];

const _listBase = makeStore<ShoppingList>(SEED_LISTS);
const _listListeners: Array<() => void> = [];
const notifyLists = () => _listListeners.forEach(l => l());

export const shoppingStore = {
  getLists: () => _listBase.getAll(),

  addList: (list: ShoppingList) => {
    _listBase.add(list);
    notifyLists();
  },

  mergeLists: (apiLists: Array<{id:string; title:string; list_id:string}>) => {
    const current = _listBase.getAll();
    const map = new Map(current.map(g => [g.id, g]));
    for (const row of apiLists) {
      if (!row.id) continue;
      const ex = map.get(row.id);
      if (ex) { ex.title = row.title; ex.list_id = row.list_id; }
      else     { current.push({ id:row.id, title:row.title, list_id:row.list_id, items:[], collapsed:false }); }
    }
    notifyLists();
  },

  setItems: (listId: string, items: ShoppingItem[]) => {
    const list = _listBase.getAll().find(g => g.id === listId);
    if (list) { list.items = items; notifyLists(); }
  },

  addItem: (listId: string, item: ShoppingItem) => {
    const list = _listBase.getAll().find(g => g.id === listId);
    if (list) { list.items.push(item); notifyLists(); }
  },

  removeItem: (listId: string, itemId: string) => {
    const list = _listBase.getAll().find(g => g.id === listId);
    if (list) { list.items = list.items.filter(i => i.id !== itemId); notifyLists(); }
  },

  toggleItem: (listId: string, itemId: string) => {
    const list = _listBase.getAll().find(g => g.id === listId);
    const item = list?.items.find(i => i.id === itemId);
    if (item) { item.checked = !item.checked; notifyLists(); }
  },

  toggleCollapse: (listId: string) => {
    const list = _listBase.getAll().find(g => g.id === listId);
    if (list) { list.collapsed = !list.collapsed; notifyLists(); }
  },

  removeList: (listId: string) => {
    _listBase.remove(g => g.id === listId);
    notifyLists();
  },

  subscribe: (listener: () => void) => {
    _listListeners.push(listener);
    const unsubBase = _listBase.subscribe(listener);
    return () => {
      const i = _listListeners.indexOf(listener);
      if (i >= 0) _listListeners.splice(i, 1);
      unsubBase();
    };
  },
};
