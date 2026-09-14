import { useState } from "react";

export default function SalaryEditor({ month, salary, onSave }: {
  month: string;
  salary: number;
  onSave: (salary: number) => void;
}) {
  const [amount, setAmount] = useState(String(salary));
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  return (
    <section className="panel finance-editor monthly-salary">
      <h2>Monthly salary</h2>
      <p className="muted">Set your total salary for {month}. Saved in this browser.</p>
      <form className="salary-form" onSubmit={(event) => {
        event.preventDefault();
        setError("");
        setStatus("");
        const value = Math.round(Number(amount) * 100) / 100;
        if (!amount.trim() || !Number.isFinite(value) || value < 0) {
          setError("Enter a valid salary of zero or more.");
          return;
        }
        try {
          onSave(value);
          setAmount(String(value));
          setStatus(`Salary saved for ${month}.`);
        } catch {
          setError("Could not save your salary. Check browser storage and try again.");
        }
      }}>
        <label htmlFor="monthly-salary">Total salary (INR)
          <input id="monthly-salary" type="number" min="0" step="0.01" required value={amount} onChange={(event) => {
            setAmount(event.target.value);
            setStatus("");
            setError("");
          }} />
        </label>
        <button type="submit" className="primary">Save salary</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      <p className="muted" role="status">{status}</p>
    </section>
  );
}
