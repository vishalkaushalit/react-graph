import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiArrowDownLeft,
  FiArrowUpRight,
  FiBarChart2,
  FiGrid,
  FiLogOut,
  FiCreditCard,
  FiMenu,
  FiX,
  FiPieChart,
} from "react-icons/fi";
import { currency } from "../data/demo";
import { isExpenseDate, readFinances, storageKey } from "../lib/financeStorage";
import FinanceChart from "./FinanceChart";
import ExpenseEditor from "./ExpenseEditor";
import SalaryEditor from "./SalaryEditor";

const reportingDateKey = "balance.reporting-date.v1";

function readDashboard() {
  const finances = readFinances();
  try {
    const savedDate = localStorage.getItem(reportingDateKey);
    if (isExpenseDate(savedDate)) {
      const selectedMonth = new Date(`${savedDate}T12:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });
      const index = finances.findIndex((item) => item.month === selectedMonth);
      return {
        finances: index === -1 ? [...finances, { month: selectedMonth, salary: 0, expenses: [] }] : finances,
        monthIndex: index === -1 ? finances.length : index,
        reportingDate: savedDate,
      };
    }
  } catch { /* Use the default month if browser storage is unavailable. */ }
  const initialMonth = new Date(`1 ${finances[finances.length - 1].month}`);
  return {
    finances,
    monthIndex: finances.length - 1,
    reportingDate: `${initialMonth.getFullYear()}-${String(initialMonth.getMonth() + 1).padStart(2, "0")}-01`,
  };
}

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const sidebar = sidebarRef.current;
    const trigger = menuButtonRef.current;
    sidebar?.querySelector<HTMLButtonElement>("button")?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
      if (event.key !== "Tab") return;
      const items = sidebar?.querySelectorAll<HTMLElement>("a[href], button");
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const media = window.matchMedia("(max-width: 760px)");
    const handleResize = () => {
      if (!media.matches) setSidebarOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    media.addEventListener("change", handleResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      media.removeEventListener("change", handleResize);
      trigger?.focus();
    };
  }, [sidebarOpen]);

  const [initialDashboard] = useState(readDashboard);
  const [monthlyFinances, setMonthlyFinances] = useState(initialDashboard.finances);
  const [monthIndex, setMonthIndex] = useState(initialDashboard.monthIndex);
  const [reportingDate, setReportingDate] = useState(initialDashboard.reportingDate);
  const pathname = useLocation().pathname;
  const editing = pathname.startsWith("/finances");
  const expenseMode = pathname === "/finances/add" ? "add" : pathname === "/finances/edit" ? "edit" : "view";
  const expenseTitle = expenseMode === "add" ? "Add expenses" : expenseMode === "edit" ? "Edit expenses" : "View expenses";
  const month = monthlyFinances[monthIndex];
  const expenses =
    Math.round(
      month.expenses.reduce((total, expense) => total + expense.amount, 0) *
        100,
    ) / 100;
  const balance = Math.round((month.salary - expenses) * 100) / 100;
  const breakdown = useMemo(
    () => [
      ["Category", "Amount"],
      ...month.expenses.map((expense) => [expense.name, expense.amount]),
    ],
    [month],
  );
  const overview = useMemo(
    () => [
      ["Overview", "Amount", { role: "style" }],
      ["Salary", month.salary, "color: #4f46e5"],
      ["Expenses", expenses, "color: #f59e0b"],
      ["Balance", balance, "color: #14b8a6"],
    ],
    [month.salary, expenses, balance],
  );
  return (
    <div className="dashboard-layout">
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}
      <aside
        id="dashboard-sidebar"
        ref={sidebarRef}
        className={`sidebar${sidebarOpen ? " sidebar-open" : ""}`}
        role={sidebarOpen ? "dialog" : undefined}
        aria-modal={sidebarOpen || undefined}
        aria-label="Workspace navigation"
      >
        <button type="button" className="mobile-menu-button sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close navigation">
          <FiX aria-hidden="true" />
        </button>
        <Link to="/dashboard" className="brand" onClick={() => setSidebarOpen(false)}>
          <span className="brand-icon">
            <FiBarChart2 />
          </span>
          Balance<span className="brand-dot">.</span>
        </Link>
        <span className="nav-label">WORKSPACE</span>
        <Link className={`nav-link${!editing ? " nav-active" : ""}`} aria-current={!editing ? "page" : undefined} to="/dashboard" onClick={() => setSidebarOpen(false)}>
          <FiGrid /> Overview
        </Link>
        <Link className={`nav-link${editing ? " nav-active" : ""}`} aria-current={editing ? "page" : undefined} to="/finances" onClick={() => setSidebarOpen(false)}>
          <FiPieChart aria-hidden="true" /> Expense breakdown
        </Link>
        <div className="sidebar-bottom">
          <span className="avatar">D</span>
          <div>
            <strong>Demo user</strong>
            <small>Personal workspace</small>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="logout sidebar-signout"
        >
          <FiLogOut aria-hidden="true" /> Sign out
        </button>
      </aside>
      <div className="dashboard-main" inert={sidebarOpen}>
        <header className="topbar">
          <div className="topbar-start">
            <button
              ref={menuButtonRef}
              type="button"
              className="mobile-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              aria-expanded={sidebarOpen}
              aria-controls="dashboard-sidebar"
            >
              <FiMenu aria-hidden="true" />
            </button>
            <span>
            Personal finance <span className="muted">/ {editing ? expenseTitle : "Overview"}</span>
            </span>
          </div>
          <button type="button" onClick={onLogout} className="logout">
            <FiLogOut aria-hidden="true" /> Sign out
          </button>
        </header>
        <main className="dashboard-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">A CLEARER PICTURE</span>
              <h1>
                {editing
                  ? expenseTitle
                  : "Your money, at a glance"}
              </h1>
              <p className="muted">
                {editing ? "Manage your expense breakdown for the selected reporting month." : "A simple overview of your income, spending, and what’s left."}
              </p>
            </div>
            <label className="month-select">
              <span>Reporting date</span>
              <input
                type="date"
                value={reportingDate}
                onChange={(event) => {
                  const selectedDate = event.target.value;
                  if (!isExpenseDate(selectedDate)) return;
                  const selectedMonth = new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });
                  const index = monthlyFinances.findIndex((item) => item.month === selectedMonth);
                  if (index === -1) {
                    setMonthlyFinances([...monthlyFinances, { month: selectedMonth, salary: 0, expenses: [] }]);
                    setMonthIndex(monthlyFinances.length);
                  } else {
                    setMonthIndex(index);
                  }
                  setReportingDate(selectedDate);
                  try {
                    localStorage.setItem(reportingDateKey, selectedDate);
                  } catch { /* Keep the selection for this session if storage is unavailable. */ }
                }}
              />
              <small className="reporting-date-note">Showing {month.month}</small>
            </label>
          </div>
          <SalaryEditor
            key={month.month}
            month={month.month}
            salary={month.salary}
            onSave={(salary) => {
              const updated = monthlyFinances.map((item, index) =>
                index === monthIndex ? { ...item, salary } : item,
              );
              localStorage.setItem(storageKey, JSON.stringify(updated));
              setMonthlyFinances(updated);
            }}
          />
          {editing && (
            <ExpenseEditor
              key={`${reportingDate}-${expenseMode}`}
              month={month}
              mode={expenseMode}
              defaultDate={reportingDate}
              onSave={(updatedExpenses) => {
                const updated = monthlyFinances.map((item, index) =>
                  index === monthIndex ? { ...item, expenses: updatedExpenses } : item,
                );
                localStorage.setItem(storageKey, JSON.stringify(updated));
                setMonthlyFinances(updated);
              }}
            />
          )}
          {!editing && (
            <>
              <section className="stat-grid" aria-label="Financial summary">
                {[
                  {
                    label: "Total salary",
                    value: month.salary,
                    icon: <FiArrowDownLeft />,
                    note: "Income this month",
                    className: "income",
                  },
                  {
                    label: "Total expenses",
                    value: expenses,
                    icon: <FiArrowUpRight />,
                    note:
                      month.salary > 0
                        ? `${Math.round((expenses / month.salary) * 100)}% of your income spent`
                        : "No salary recorded",
                    className: "expenses",
                  },
                  {
                    label: "Balance left",
                    value: balance,
                    icon: <FiCreditCard />,
                    note:
                      month.salary > 0
                        ? `${Math.round((balance / month.salary) * 100)}% of your income remaining`
                        : "Add your salary to get started",
                    className: "balance",
                  },
                ].map((stat) => (
                  <article
                    key={stat.label}
                    className={`stat-card ${stat.className}`}
                  >
                    <div>
                      <span>{stat.label}</span>
                      <span className="stat-icon">{stat.icon}</span>
                    </div>
                    <strong>{currency(stat.value)}</strong>
                    <small>{stat.note}</small>
                  </article>
                ))}
              </section>
              <section className="charts-grid">
                <article className="panel">
                  <div className="panel-heading">
                    <h2>Monthly overview</h2>
                    <span>Income & spending</span>
                  </div>
                  <p className="muted">How your salary adds up this month.</p>
                  {month.salary === 0 && expenses === 0 ? (
                    <p className="empty-expenses">
                      No income or expenses recorded for this month yet.
                    </p>
                  ) : (
                  <FinanceChart
                    chartType="ColumnChart"
                    data={overview}
                    options={{
                      legend: { position: "none" },
                      vAxis: {
                        baseline: 0,
                        viewWindow: {
                          min: 0,
                          max: Math.max(month.salary, expenses, balance, 1) * 1.1,
                        },
                      },
                    }}
                  />
                  )}
                </article>
                <article className="panel">
                  <div className="panel-heading">
                    <h2>Where your money goes</h2>
                    <span>By category</span>
                  </div>
                  <p className="muted">Your expenses, broken down.</p>
                  {expenses === 0 ? (
                    <p className="empty-expenses">
                      No expenses yet. Add a category and amount to see your
                      chart.
                    </p>
                  ) : (
                    <FinanceChart chartType="PieChart" data={breakdown} />
                  )}
                </article>
              </section>
              <section className="panel expense-panel">
                <div className="panel-heading">
                  <h2>Expense breakdown</h2>
                  <span>{new Set(month.expenses.map((expense) => expense.name.toLowerCase())).size} categories</span>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Share of expenses</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {month.expenses.map((expense, index) => (
                        <tr key={`${expense.name}-${index}`}>
                          <td>
                            <span className={`category-dot color-${index}`} />
                            {expense.name}
                          </td>
                          <td>{expense.date || "Not set"}</td>
                          <td>
                            <div className="share">
                              <div>
                                <i
                                  style={{
                                    width: `${(expense.amount / expenses) * 100}%`,
                                  }}
                                />
                              </div>
                              <span>
                                {Math.round((expense.amount / expenses) * 100)}%
                              </span>
                            </div>
                          </td>
                          <td>{currency(expense.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th colSpan={2}>Total expenses</th>
                        <td>{expenses > 0 ? "100%" : "0%"}</td>
                        <td>{currency(expenses)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>
              <footer className="dashboard-footer">
                Balance = total salary − total expenses{" "}
                <span>Visualizations powered by React Google Charts</span>
              </footer>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
