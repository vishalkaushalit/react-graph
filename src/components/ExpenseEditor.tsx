import { useState } from "react";
import { NavLink } from "react-router-dom";
import type { MonthlyFinance } from "../interfaces";
import { currency } from "../data/demo";
import { isExpenseDate } from "../lib/financeStorage";

type Expenses = MonthlyFinance["expenses"];

export default function ExpenseEditor({ month, mode, defaultDate, onSave }: {
  month: MonthlyFinance;
  defaultDate: string;
  mode: "add" | "view" | "edit";
  onSave: (expenses: Expenses) => void;
}) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [draft, setDraft] = useState(() => month.expenses.map((expense) => ({ name: expense.name, amount: String(expense.amount), date: expense.date ?? "" })));
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  function save(expenses: Expenses) {
    setError("");
    setStatus("");
    if (expenses.some((expense) => expense.date !== undefined && !isExpenseDate(expense.date))) {
      setError("Enter a valid expense date.");
      return false;
    }
    if (expenses.some((expense) => !expense.name || !Number.isFinite(expense.amount) || expense.amount <= 0)) {
      setError("Enter a category and an amount greater than zero for every expense.");
      return false;
    }
    if (!Number.isFinite(expenses.reduce((total, expense) => total + expense.amount, 0))) {
      setError("The total is too large. Enter a smaller amount.");
      return false;
    }
    try {
      onSave(expenses);
      setStatus(`Expenses saved for ${month.month}.`);
      return true;
    } catch {
      setError("Could not save expenses. Check browser storage and try again.");
      return false;
    }
  }

  return (
    <>
      <nav className="expense-navigation" aria-label="Expense screens">
        <NavLink to="/finances" end className={({ isActive }) => `logout${isActive ? " expense-tab-active" : ""}`}>View expenses</NavLink>
        <NavLink to="/finances/add" className={({ isActive }) => `logout${isActive ? " expense-tab-active" : ""}`}>Add expenses</NavLink>
        <NavLink to="/finances/edit" className={({ isActive }) => `logout${isActive ? " expense-tab-active" : ""}`}>Edit expenses</NavLink>
      </nav>
      <section className="panel finance-editor">
        <h2>{mode === "add" ? "Add an expense" : mode === "edit" ? "Edit expense breakdown" : `${month.month} expenses`}</h2>
        {mode === "add" && (
          <>
            <p className="muted">Saved in this browser. Entries with the same category and date are combined.</p>
            <form className="expense-form" onSubmit={(event) => {
              event.preventDefault();
              const name = category.trim();
              const value = Math.round(Number(amount) * 100) / 100;
              if (!name || !Number.isFinite(value) || value <= 0) {
                setStatus("");
                setError("Enter a category and an amount greater than zero.");
                return;
              }
              const existing = month.expenses.findIndex((expense) => expense.name.toLowerCase() === name.toLowerCase() && expense.date === date);
              const updated = existing < 0 ? [...month.expenses, { name, amount: value, date }] : month.expenses.map((expense, index) => index === existing ? { ...expense, amount: Math.round((expense.amount + value) * 100) / 100 } : expense);
              if (save(updated)) { setCategory(""); setAmount(""); }
            }}>
              <div className="editor-row">
                <label htmlFor="expense-category">Category
                  <input id="expense-category" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="e.g. Food" required maxLength={80} />
                </label>
                <label htmlFor="expense-amount">Amount (INR)
                  <input id="expense-amount" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" required />
                </label>
                <label htmlFor="expense-date">Date
                  <input id="expense-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
                </label>
                <button type="submit" className="primary">Add expense</button>
              </div>
            </form>
          </>
        )}
        {mode === "edit" && (
          <>
            <p className="muted">Update or delete expenses, then save your changes. Reset changes restores unsaved deletions.</p>
            {(
              <form className="expense-form" onSubmit={(event) => {
                event.preventDefault();
                const updated = draft.map((expense) => ({ name: expense.name.trim(), amount: Math.round(Number(expense.amount) * 100) / 100, date: expense.date || undefined }));
                if (new Set(updated.map((expense) => JSON.stringify([expense.name.toLowerCase(), expense.date]))).size !== updated.length) {
                  setStatus("");
                  setError("Use a unique category and date combination for each expense.");
                  return;
                }
                save(updated);
              }}>
                {draft.length === 0 && <p className="muted">No expenses remaining. Save changes to apply deletions, or reset to restore them.</p>}
                {draft.map((expense, index) => (
                  <div className="editor-row" key={index}>
                    <label htmlFor={`category-${index}`}>Category {index + 1}
                      <input id={`category-${index}`} value={expense.name} required maxLength={80} onChange={(event) => setDraft(draft.map((item, row) => row === index ? { ...item, name: event.target.value } : item))} />
                    </label>
                    <label htmlFor={`amount-${index}`}>Amount (INR)
                      <input id={`amount-${index}`} type="number" min="0.01" step="0.01" value={expense.amount} required onChange={(event) => setDraft(draft.map((item, row) => row === index ? { ...item, amount: event.target.value } : item))} />
                    </label>
                    <label htmlFor={`date-${index}`}>Date
                      <input id={`date-${index}`} type="date" value={expense.date} onChange={(event) => setDraft(draft.map((item, row) => row === index ? { ...item, date: event.target.value } : item))} />
                    </label>
                    <button type="button" className="logout expense-delete" aria-label={`Delete ${expense.name || "expense"} ${expense.date || "with no date"}`} onClick={() => {
                      setDraft(draft.filter((_, row) => row !== index));
                      setError("");
                      setStatus("Expense removed. Save changes to apply the deletion.");
                    }}>Delete</button>
                  </div>
                ))}
                <div className="expense-navigation">
                  <button type="submit" className="primary">Save changes</button>
                  <button type="button" className="logout" onClick={() => {
                    setDraft(month.expenses.map((expense) => ({ name: expense.name, amount: String(expense.amount), date: expense.date ?? "" })));
                    setError(""); setStatus("Unsaved changes discarded.");
                  }}>Reset changes</button>
                </div>
              </form>
            )}
          </>
        )}
        {mode === "view" && (month.expenses.length === 0 ? <p className="muted">No expenses yet. Use Add expenses to get started.</p> : (
          <div className="table-scroll">
            <table>
              <thead><tr><th scope="col">Category</th><th scope="col">Date</th><th scope="col">Amount</th><th scope="col">Actions</th></tr></thead>
              <tbody>{month.expenses.map((expense, index) => (
                <tr key={`${expense.name}-${index}`}><td>{expense.name}</td><td>{expense.date || "Not set"}</td><td className="expense-amount-cell">{currency(expense.amount)}</td><td>
                  <button type="button" className="logout expense-delete" aria-label={`Delete ${expense.name} ${expense.date || "with no date"}`} onClick={() => {
                    if (save(month.expenses.filter((_, row) => row !== index))) {
                      setStatus(`${expense.name} deleted from ${month.month}.`);
                    }
                  }}>Delete</button>
                </td></tr>
              ))}</tbody>
              <tfoot><tr><th scope="row" colSpan={2}>Total expenses</th><td className="expense-amount-cell">{currency(month.expenses.reduce((total, expense) => total + expense.amount, 0))}</td><td /></tr></tfoot>
            </table>
          </div>
        ))}
        {error && <p className="form-error" role="alert">{error}</p>}
        <p className="muted" role="status">{status}</p>
      </section>
    </>
  );
}
