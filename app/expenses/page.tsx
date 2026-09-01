"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CalendarDays,
  ChevronDown,
  CreditCard,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  Receipt,
  Search,
  UserRound,
  X,
} from "lucide-react";

type Expense = {
  id: string;
  description: string;
  transactionId: string;
  paidBy: string;
  amount: number;
  date: string;
  category: string;
};

const partners = ["Aditya Sharma", "Vishal Kumar Singh", "Ujjwal Kumar Singh"];
const categories = ["Software", "Hosting", "Marketing", "Operations"];

const formatAmount = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

function SelectControl({
  children,
  value,
  onChange,
  ariaLabel,
}: {
  children: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className="relative min-w-0">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="appearance-none w-full bg-white border border-[#c0bbb6] text-[#615f5c] text-sm font-medium rounded-[14px] py-2.5 pl-3 pr-8 outline-none focus:border-[#fa5d00] focus:ring-2 focus:ring-[#fa5d00]/15 cursor-pointer"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e8b87]" />
    </div>
  );
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [paidBy, setPaidBy] = useState("All partners");
  const [category, setCategory] = useState("All categories");
  const [dateFilter, setDateFilter] = useState("All dates");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [details, setDetails] = useState<Expense | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/expenses")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((items) => {
        setExpenses(
          items.map(
            (item: {
              id: string;
              description: string;
              transactionId: string;
              amountPaid: number;
              expenseDate: string;
              category: string | null;
              paidBy: { name: string };
            }) => ({
              id: item.id,
              description: item.description,
              transactionId: item.transactionId,
              amount: item.amountPaid,
              date: new Date(item.expenseDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              category: item.category || "Operations",
              paidBy: item.paidBy.name,
            })
          )
        );
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesQuery = `${expense.description} ${expense.transactionId}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesPayer = paidBy === "All partners" || expense.paidBy === paidBy;
      const matchesCategory =
        category === "All categories" || expense.category === category;
      const matchesDate =
        dateFilter === "All dates" ||
        (dateFilter === "August 2026" && expense.date.includes("Aug 2026"));
      return matchesQuery && matchesPayer && matchesCategory && matchesDate;
    });
  }, [expenses, query, paidBy, category, dateFilter]);

  // Dynamic calculations for summary cards
  const stats = useMemo(() => {
    const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const thisMonthTotal = expenses
      .filter((e) => e.date.includes("Aug 2026"))
      .reduce((acc, curr) => acc + curr.amount, 0);
    const count = expenses.length;

    return {
      total: formatAmount(total),
      thisMonth: formatAmount(thisMonthTotal),
      count: count.toString(),
    };
  }, [expenses]);

  const resetFilters = () => {
    setQuery("");
    setPaidBy("All partners");
    setCategory("All categories");
    setDateFilter("All dates");
  };

  const hasFilters =
    Boolean(query) ||
    paidBy !== "All partners" ||
    category !== "All categories" ||
    dateFilter !== "All dates";

  return (
    <div className="min-h-screen bg-[#fff8f1] selection:bg-[#fee3b5] selection:text-[#1d1e1c] md:flex">
      <Sidebar />
      <MobileNav />
      <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 md:p-8 lg:p-10">
        <div className="mx-auto max-w-7xl space-y-7">
          <header className="flex flex-col gap-4 border-b border-[#e3d6c5]/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#fa5d00]">
                Partner finance
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-[#1d1e1c] sm:text-4xl">
                Expenses
              </h1>
              <p className="mt-1 text-sm text-[#615f5c] sm:text-base">
                Track and manage all shared expenses.
              </p>
            </div>
            <Button onClick={() => setIsAddOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Add Expense
            </Button>
          </header>

          {/* Summary Cards with Skeleton State */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-5 border-[#e3d6c5] shadow-sm animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2.5">
                      <div className="h-3 w-28 bg-[#e3d6c5]/50 rounded" />
                      <div className="h-7 w-20 bg-[#e3d6c5]/70 rounded" />
                      <div className="h-3 w-36 bg-[#e3d6c5]/30 rounded" />
                    </div>
                    <div className="h-9 w-9 bg-[#e3d6c5]/40 rounded-xl" />
                  </div>
                </Card>
              ))
            ) : (
              <>
                <Card className="p-5 border-[#e3d6c5] shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8e8b87]">
                        Total Expenses
                      </p>
                      <p className="mt-2 text-2xl font-bold tracking-tight text-[#1d1e1c] sm:text-3xl">
                        {stats.total}
                      </p>
                      <p className="mt-1 text-xs font-medium text-[#615f5c]">
                        Across all shared spending
                      </p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e3d6c5] bg-[#fff8f1] text-[#fa5d00]">
                      <Receipt className="h-4 w-4" />
                    </div>
                  </div>
                </Card>

                <Card className="p-5 border-[#e3d6c5] shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8e8b87]">
                        This Month
                      </p>
                      <p className="mt-2 text-2xl font-bold tracking-tight text-[#1d1e1c] sm:text-3xl">
                        {stats.thisMonth}
                      </p>
                      <p className="mt-1 text-xs font-medium text-[#615f5c]">
                        August 2026
                      </p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e3d6c5] bg-[#fff8f1] text-[#fa5d00]">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                  </div>
                </Card>

                <Card className="p-5 border-[#e3d6c5] shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8e8b87]">
                        Total Transactions
                      </p>
                      <p className="mt-2 text-2xl font-bold tracking-tight text-[#1d1e1c] sm:text-3xl">
                        {stats.count}
                      </p>
                      <p className="mt-1 text-xs font-medium text-[#615f5c]">
                        Recorded by all partners
                      </p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e3d6c5] bg-[#fff8f1] text-[#fa5d00]">
                      <CreditCard className="h-4 w-4" />
                    </div>
                  </div>
                </Card>
              </>
            )}
          </section>

          {/* Filters Row */}
          <section className="rounded-[20px] border border-[#e3d6c5] bg-white p-3 shadow-sm sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e8b87]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search expenses..."
                  className="py-2.5 pl-10 text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
                <SelectControl value={dateFilter} onChange={setDateFilter} ariaLabel="Filter by date">
                  <option>All dates</option>
                  <option>August 2026</option>
                </SelectControl>
                <SelectControl value={paidBy} onChange={setPaidBy} ariaLabel="Filter by paid by">
                  <option>All partners</option>
                  {partners.map((partner) => (
                    <option key={partner}>{partner}</option>
                  ))}
                </SelectControl>
                <SelectControl value={category} onChange={setCategory} ariaLabel="Filter by category">
                  <option>All categories</option>
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </SelectControl>
              </div>
              {hasFilters && (
                <button
                  onClick={resetFilters}
                  className="self-center whitespace-nowrap text-xs font-semibold text-[#fa5d00] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </section>

          {/* Expenses Table / Cards with Skeleton Loader */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#1d1e1c]">All expenses</h2>
                <p className="mt-0.5 text-sm text-[#615f5c]">
                  {isLoading ? "Loading..." : `${filteredExpenses.length} expense${filteredExpenses.length === 1 ? "" : "s"} shown`}
                </p>
              </div>
              <div className="hidden items-center gap-2 text-xs font-semibold text-[#8e8b87] sm:flex">
                <Filter className="h-3.5 w-3.5" /> Refine your results
              </div>
            </div>

            {isLoading ? (
              <Card className="p-0 overflow-hidden border border-[#e3d6c5] shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#e3d6c5] text-xs uppercase tracking-wider text-[#8e8b87]">
                        <th className="px-6 py-4 font-semibold">Expense</th>
                        <th className="px-4 py-4 font-semibold">Paid by</th>
                        <th className="px-4 py-4 font-semibold">Amount</th>
                        <th className="px-4 py-4 font-semibold">Date</th>
                        <th className="w-16 px-4 py-4"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="border-b border-[#e3d6c5]/50 animate-pulse">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#e3d6c5]/40" />
                              <div className="space-y-2">
                                <div className="h-4 w-44 bg-[#e3d6c5]/60 rounded" />
                                <div className="h-3 w-28 bg-[#e3d6c5]/30 rounded" />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="h-4 w-28 bg-[#e3d6c5]/50 rounded" />
                          </td>
                          <td className="px-4 py-4">
                            <div className="h-4 w-16 bg-[#e3d6c5]/60 rounded" />
                          </td>
                          <td className="px-4 py-4">
                            <div className="h-4 w-20 bg-[#e3d6c5]/40 rounded" />
                          </td>
                          <td className="px-4 py-4">
                            <div className="h-4 w-6 bg-[#e3d6c5]/30 rounded" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : filteredExpenses.length ? (
              <>
                <Card className="hidden overflow-visible p-0 md:block border border-[#e3d6c5] shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-[#e3d6c5] text-xs uppercase tracking-wider text-[#8e8b87]">
                          <th className="px-6 py-4 font-semibold">Expense</th>
                          <th className="px-4 py-4 font-semibold">Paid by</th>
                          <th className="px-4 py-4 font-semibold">Amount</th>
                          <th className="px-4 py-4 font-semibold">Date</th>
                          <th className="w-16 px-4 py-4">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExpenses.map((expense) => (
                          <ExpenseTableRow
                            key={expense.id}
                            expense={expense}
                            menuOpen={menuId === expense.id}
                            onToggle={() =>
                              setMenuId(menuId === expense.id ? null : expense.id)
                            }
                            onView={() => {
                              setDetails(expense);
                              setMenuId(null);
                            }}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
                <div className="space-y-3 md:hidden">
                  {filteredExpenses.map((expense) => (
                    <ExpenseMobileCard
                      key={expense.id}
                      expense={expense}
                      onView={() => setDetails(expense)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                onAdd={() => setIsAddOpen(true)}
                compact={hasFilters}
                onClear={resetFilters}
              />
            )}
          </section>
        </div>
      </main>
      {details && <ExpenseDetails expense={details} onClose={() => setDetails(null)} />}
      {isAddOpen && (
        <AddExpenseForm
          onClose={() => setIsAddOpen(false)}
          onAdd={(expense) => {
            setExpenses((current) => [expense, ...current]);
            setIsAddOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ExpenseTableRow({
  expense,
  menuOpen,
  onToggle,
  onView,
}: {
  expense: Expense;
  menuOpen: boolean;
  onToggle: () => void;
  onView: () => void;
}) {
  return (
    <tr className="border-b border-[#e3d6c5]/70 last:border-0 hover:bg-[#fff8f1]/60">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="hidden h-9 w-9 items-center justify-center rounded-xl border border-[#e3d6c5] bg-[#fff8f1] text-[#fa5d00] lg:flex">
            <Receipt className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-[#1d1e1c]">{expense.description}</p>
            <p className="mt-0.5 text-xs text-[#8e8b87]">{expense.transactionId}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm font-medium text-[#1d1e1c]">{expense.paidBy}</p>
        <span className="mt-1 inline-flex rounded-full bg-[#fa5d00]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#fa5d00]">
          {expense.category}
        </span>
      </td>
      <td className="px-4 py-4 text-sm font-bold text-[#1d1e1c]">
        {formatAmount(expense.amount)}
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-sm text-[#615f5c]">
        {expense.date}
      </td>
      <td className="relative px-4 py-4">
        <button
          onClick={onToggle}
          className="rounded-lg p-2 text-[#8e8b87] hover:bg-[#fff8f1] hover:text-[#fa5d00] cursor-pointer"
          aria-label={`Actions for ${expense.description}`}
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
        {menuOpen && (
          <div className="absolute right-5 top-12 z-20 w-36 rounded-xl border border-[#e3d6c5] bg-white p-1.5 shadow-lg">
            <button
              onClick={onView}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#1d1e1c] hover:bg-[#fff8f1] cursor-pointer"
            >
              <Eye className="h-4 w-4 text-[#fa5d00]" /> View details
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

function ExpenseMobileCard({ expense, onView }: { expense: Expense; onView: () => void }) {
  return (
    <Card className="p-4 border border-[#e3d6c5] shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-[#1d1e1c]">{expense.description}</p>
          <p className="mt-1 text-xs text-[#8e8b87]">{expense.transactionId}</p>
        </div>
        <p className="shrink-0 text-lg font-bold text-[#1d1e1c]">
          {formatAmount(expense.amount)}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[#e3d6c5]/70 pt-3">
        <div>
          <p className="text-sm font-medium text-[#615f5c]">{expense.paidBy}</p>
          <p className="mt-0.5 text-xs text-[#8e8b87]">{expense.date}</p>
        </div>
        <button
          onClick={onView}
          className="rounded-[12px] border border-[#e3d6c5] bg-[#fff8f1] p-2 text-[#fa5d00] cursor-pointer"
          aria-label={`View ${expense.description}`}
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>
      <span className="mt-3 inline-flex rounded-full bg-[#fa5d00]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#fa5d00]">
        {expense.category}
      </span>
    </Card>
  );
}

function EmptyState({
  onAdd,
  compact,
  onClear,
}: {
  onAdd: () => void;
  compact: boolean;
  onClear: () => void;
}) {
  return (
    <Card className="py-14 text-center border border-[#e3d6c5] shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff8f1] text-[#fa5d00]">
        <FileText className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-[#1d1e1c]">No expenses yet</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-[#615f5c]">
        {compact
          ? "No expenses match your current filters."
          : "Your shared expenses will appear here once they are added."}
      </p>
      <div className="mt-5 flex justify-center gap-3">
        {compact && (
          <Button variant="secondary" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        )}
        <Button size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4" /> Add First Expense
        </Button>
      </div>
    </Card>
  );
}

function ModalShell({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end bg-[#1d1e1c]/45 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-lg rounded-t-[24px] border border-[#e3d6c5] bg-white p-5 shadow-2xl sm:rounded-[24px] sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-[#e3d6c5] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1d1e1c]">{title}</h2>
            <p className="mt-1 text-sm text-[#615f5c]">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-1.5 text-[#8e8b87] hover:bg-[#fff8f1] hover:text-[#1d1e1c] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ExpenseDetails({ expense, onClose }: { expense: Expense; onClose: () => void }) {
  const share = formatAmount(Math.floor(expense.amount / 3));
  return (
    <ModalShell
      title="Expense details"
      subtitle="A shared expense split equally between partners."
      onClose={onClose}
    >
      <div className="space-y-5 py-5">
        <div className="rounded-[16px] border border-[#fee3b5] bg-[#fff8f1] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8e8b87]">
            Description
          </p>
          <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-lg font-bold text-[#1d1e1c]">{expense.description}</p>
            <p className="text-xl font-bold text-[#fa5d00]">{formatAmount(expense.amount)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4 text-sm">
          <Detail label="Transaction ID" value={expense.transactionId} />
          <Detail label="Category" value={expense.category} />
          <Detail label="Paid by" value={expense.paidBy} />
          <Detail label="Date" value={expense.date} />
        </div>
        <div className="rounded-[16px] border border-[#e3d6c5] bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1d1e1c]">
            <UserRound className="h-4 w-4 text-[#fa5d00]" /> Equal split among all 3 partners
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {partners.map((partner) => (
              <div key={partner} className="rounded-xl bg-[#fff8f1] p-2 text-center">
                <p className="truncate text-[11px] text-[#615f5c]">{partner.split(" ")[0]}</p>
                <p className="mt-1 text-sm font-bold text-[#1d1e1c]">{share}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end border-t border-[#e3d6c5] pt-4">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-[#8e8b87]">{label}</p>
      <p className="mt-1 font-semibold text-[#1d1e1c]">{value}</p>
    </div>
  );
}

function AddExpenseForm({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (expense: Expense) => void;
}) {
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Software");
  const [paidBy, setPaidBy] = useState(partners[0]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!description || !transactionId || !Number.isFinite(parsedAmount) || parsedAmount <= 0)
      return;
    onAdd({
      id: Date.now().toString(),
      description,
      transactionId,
      category,
      paidBy,
      amount: parsedAmount,
      date: "31 Aug 2026",
    });
  };

  return (
    <ModalShell
      title="Add expense"
      subtitle="This expense will be split equally among all 3 partners."
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4 pt-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Amount (₹)">
            <Input
              type="number"
              min="1"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </Field>
          <Field label="Transaction ID">
            <Input
              placeholder="e.g. TXN-2026-082"
              value={transactionId}
              onChange={(event) => setTransactionId(event.target.value)}
              required
            />
          </Field>
        </div>
        <Field label="Description">
          <Input
            placeholder="What was this expense for?"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Category">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-[16px] border border-[#c0bbb6] bg-white px-4 py-3.5 text-sm text-[#1d1e1c] outline-none focus:border-[#fa5d00]"
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="Paid by">
            <select
              value={paidBy}
              onChange={(event) => setPaidBy(event.target.value)}
              className="w-full rounded-[16px] border border-[#c0bbb6] bg-white px-4 py-3.5 text-sm text-[#1d1e1c] outline-none focus:border-[#fa5d00]"
            >
              {partners.map((partner) => (
                <option key={partner}>{partner}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="rounded-[14px] border border-[#e3d6c5] bg-[#fff8f1] px-3.5 py-3 text-xs text-[#615f5c]">
          Equal split:{" "}
          <span className="font-bold text-[#fa5d00]">
            {amount && Number(amount) > 0
              ? `${formatAmount(Number(amount) / 3)} per partner`
              : "Enter an amount to preview the split"}
          </span>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#e3d6c5] pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            <Plus className="h-4 w-4" /> Add Expense
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1d1e1c]">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
