export type Task = {
    id: string; title: string; note: string; time: string;
    dateKey: string; status: 'Done' | 'Urgent' | 'To-do';
    color: string; done: boolean; urgent: boolean;
  };
  export type Announcement = {
    id: string; announcement_id?: string;
    message: string; time: string; dateLabel: string;
  };
  
  // ── Tasks ──────────────────────────────────────────────────────────────
  const _tasks: Task[] = [];
  const _taskListeners: Array<() => void> = [];
  export const taskStore = {
    getTasks(): Task[] { return _tasks },
    addTask(task: Task) { _tasks.unshift(task); _taskListeners.forEach(l => l()) },
    toggleDone(id: string) {
      const t = _tasks.find(t => t.id === id);
      if (t) { t.done = !t.done; t.status = t.done ? 'Done' : t.urgent ? 'Urgent' : 'To-do'; _taskListeners.forEach(l => l()) }
    },
    subscribe(listener: () => void): () => void {
      _taskListeners.push(listener);
      return () => { const i = _taskListeners.indexOf(listener); if (i>=0) _taskListeners.splice(i,1) }
    },
  };
  
  // ── Announcements ──────────────────────────────────────────────────────
  const _anns: Announcement[] = [
    { id:'seed-1', message:'Welcome to Housemates', time:'9:00 AM', dateLabel:'Apr 13' },
  ];
  const _annListeners: Array<() => void> = [];
  export const announcementStore = {
    getAll(): Announcement[] { return _anns },
    add(ann: Announcement) { _anns.unshift(ann); _annListeners.forEach(l => l()) },
    remove(id: string) {
      const i = _anns.findIndex(a => a.id === id);
      if (i>=0) { _anns.splice(i,1); _annListeners.forEach(l => l()) }
    },
    subscribe(listener: () => void): () => void {
      _annListeners.push(listener);
      return () => { const i = _annListeners.indexOf(listener); if (i>=0) _annListeners.splice(i,1) }
    },
  };
  