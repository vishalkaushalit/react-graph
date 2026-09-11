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
} from "react-icons/fi";
import { currency } from "../data/demo";
import { readFinances } from "../lib/financeStorage";
import FinanceChart from "./FinanceChart";

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

  const [monthlyFinances] = useState(readFinances);
  const [monthIndex, setMonthIndex] = useState(monthlyFinances.length - 1);
  const editing = useLocation().pathname === "/finances";
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
        <Link className="nav-active" to="/dashboard" onClick={() => setSidebarOpen(false)}>
          <FiGrid /> Overview
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
            Personal finance <span className="muted">/ Overview</span>
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
                  ? "Manage monthly finances"
                  : "Your money, at a glance"}
              </h1>
              <p className="muted">
                A simple overview of your income, spending, and what’s left.
              </p>
            </div>
            <label className="month-select">
              <span>Reporting month</span>
              <select
                value={monthIndex}
                onChange={(event) => setMonthIndex(Number(event.target.value))}
              >
                {monthlyFinances.map((item, index) => (
                  <option key={item.month} value={index}>
                    {item.month}
                  </option>
                ))}
              </select>
            </label>
          </div>
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
                  <FinanceChart
                    chartType="ColumnChart"
                    data={overview}
                    options={{ legend: { position: "none" } }}
                  />
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
                  <span>{month.expenses.length} categories</span>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Share of expenses</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {month.expenses.map((expense, index) => (
                        <tr key={expense.name}>
                          <td>
                            <span className={`category-dot color-${index}`} />
                            {expense.name}
                          </td>
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
                        <th>Total expenses</th>
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
