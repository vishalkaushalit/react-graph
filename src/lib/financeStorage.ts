import type { MonthlyFinance } from "../interfaces";
export const sampleFinances: MonthlyFinance[] = [
  {
    month: "July 2026",
    salary: 75000,
    expenses: [
      { name: "Housing", amount: 20000 },
      { name: "Food", amount: 8500 },
      { name: "Transport", amount: 4000 },
      { name: "Shopping", amount: 6500 },
      { name: "Utilities", amount: 3500 },
    ],
  },
  {
    month: "August 2026",
    salary: 75000,
    expenses: [
      { name: "Housing", amount: 20000 },
      { name: "Food", amount: 9000 },
      { name: "Transport", amount: 4500 },
      { name: "Shopping", amount: 8000 },
      { name: "Utilities", amount: 3500 },
    ],
  },
  {
    month: "September 2026",
    salary: 80000,
    expenses: [
      { name: "Housing", amount: 20000 },
      { name: "Food", amount: 8000 },
      { name: "Transport", amount: 4000 },
      { name: "Shopping", amount: 5000 },
      { name: "Utilities", amount: 3000 },
    ],
  },
];

export const storageKey = "balance.monthly-finances.v1";
export function isExpenseDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
export function readFinances(): MonthlyFinance[] {
  try {
    const data = JSON.parse(
      localStorage.getItem(storageKey) || "null",
    );
    if (
      Array.isArray(data) &&
      data.length &&
      data.every(
        (item: MonthlyFinance) =>
          item &&
          typeof item.month === "string" &&
          Number.isFinite(item.salary) &&
          item.salary >= 0 &&
          Array.isArray(item.expenses) &&
          item.expenses.every(
            (expense) =>
              expense &&
              typeof expense.name === "string" &&
              Number.isFinite(expense.amount) &&
              expense.amount > 0 &&
              (expense.date === undefined || isExpenseDate(expense.date)),
          ),
      )
    )
      return data;
  } catch (error) {
    console.warn("Could not load saved finances. Using sample data.", error);
  }

  return sampleFinances;
}
