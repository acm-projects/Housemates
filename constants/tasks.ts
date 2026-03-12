export type DateItem = {
  id: string;
  month: string;
  day: string;
  weekDay: string;
};

export type TaskStatus = "Done" | "Urgent" | "To-do";

export type TaskItem = {
  id: string;
  category: string;
  title: string;
  time: string;
  status: TaskStatus;
  stickyColor: string;
};

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
const weekDayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });

export function buildCurrentDateItems(daysBefore = 2, daysAfter = 2): DateItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const items: DateItem[] = [];
  for (let offset = -daysBefore; offset <= daysAfter; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);

    items.push({
      id: date.toISOString().slice(0, 10),
      month: monthFormatter.format(date),
      day: String(date.getDate()),
      weekDay: weekDayFormatter.format(date),
    });
  }

  return items;
}

export const filters = ["All", "Weekly", "In Progress", "Completed"];

export const taskItems: TaskItem[] = [
  {
    id: "1",
    category: "Grocery shopping app design",
    title: "Market Research",
    time: "10:00 AM",
    status: "Done",
    stickyColor: "#F1D7E7",
  },
  {
    id: "2",
    category: "Recurring",
    title: "Competitive Analysis",
    time: "12:00 PM",
    status: "Urgent",
    stickyColor: "#F1D7E7",
  },
  {
    id: "3",
    category: "Uber Eats redesign challange",
    title: "Create Low-fidelity Wireframe",
    time: "07:00 PM",
    status: "To-do",
    stickyColor: "#DFD7F2",
  },
  {
    id: "4",
    category: "About design sprint",
    title: "How to pitch a Design Sprint",
    time: "09:00 PM",
    status: "To-do",
    stickyColor: "#F0DCC9",
  },
];
