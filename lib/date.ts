import type { BudgetExpense } from "@/lib/types";

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function getWeekStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - 6);

  return date.toISOString().slice(0, 10);
}

export function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabel(date: Date) {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function shiftMonth(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function compareExpenses(a: BudgetExpense, b: BudgetExpense) {
  return `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`);
}

export function getLatestExpenseDate(expenses: BudgetExpense[]) {
  return [...expenses].sort(compareExpenses).at(0)?.date;
}

export function parseMonthFromDate(date: string) {
  const [year, month] = date.split("-").map(Number);
  return new Date(year, month - 1, 1);
}
