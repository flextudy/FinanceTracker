"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { AddExpenseModal } from "@/components/dashboard/add-expense-modal";
import { RecordSettlementModal } from "@/components/dashboard/record-settlement-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCurrentUser } from "@/components/providers/current-user-provider";
import {
  Plus,
  ArrowLeftRight,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Wallet,
  Clock,
  ArrowRight,
} from "lucide-react";

type DashboardExpense = {
  id: string; description: string; paidBy: string; amount: number; formattedAmount: string; date: string; category: string;
};
type DashboardSettlement = { id: string; fromUser: string; toUser: string; amount: number; formattedAmount: string; date: string; };
type DashboardBalance = { id: string; name: string; email: string; initials: string; status: "receives" | "owes"; balance: string; subtitle: string; isCurrentUser: boolean; };

const initialExpenses: DashboardExpense[] = [
  {
    id: "1",
    description: "One LiveKit Subscription",
    paidBy: "Aditya Sharma",
    amount: 5000,
    formattedAmount: "₹5,000",
    date: "30 Aug 2026",
    category: "Software/SaaS",
  },
  {
    id: "2",
    description: "Vercel Hosting",
    paidBy: "Vishal Kumar Singh",
    amount: 2500,
    formattedAmount: "₹2,500",
    date: "28 Aug 2026",
    category: "Infrastructure",
  },
  {
    id: "3",
    description: "Domain Renewal",
    paidBy: "Ujjwal Kumar Singh",
    amount: 1200,
    formattedAmount: "₹1,200",
    date: "25 Aug 2026",
    category: "Domain & Ops",
  },
];

const initialSettlements: DashboardSettlement[] = [
  {
    id: "s1",
    fromUser: "Vishal Kumar Singh",
    toUser: "Aditya Sharma",
    amount: 1000,
    formattedAmount: "₹1,000",
    date: "30 Aug 2026",
  },
  {
    id: "s2",
    fromUser: "Ujjwal Kumar Singh",
    toUser: "Aditya Sharma",
    amount: 1000,
    formattedAmount: "₹1,000",
    date: "28 Aug 2026",
  },
  {
    id: "s3",
    fromUser: "Aditya Sharma",
    toUser: "Vishal Kumar Singh",
    amount: 1334,
    formattedAmount: "₹1,334",
    date: "25 Aug 2026",
  },
];

const partnerBalances: DashboardBalance[] = [
  {
    id: "p1",
    name: "Aditya Sharma",
    email: "aditya@partner.com",
    initials: "AS",
    status: "receives",
    balance: "₹4,334",
    subtitle: "Should receive from partners",
    isCurrentUser: true,
  },
  {
    id: "p2",
    name: "Vishal Kumar Singh",
    email: "vishal@partner.com",
    initials: "VK",
    status: "owes",
    balance: "₹2,667",
    subtitle: "Pending amount to pay",
    isCurrentUser: false,
  },
  {
    id: "p3",
    name: "Ujjwal Kumar Singh",
    email: "ujjwal@partner.com",
    initials: "UK",
    status: "owes",
    balance: "₹1,667",
    subtitle: "Pending amount to pay",
    isCurrentUser: false,
  },
];

export default function DashboardPage() {
  const { user } = useCurrentUser();
  const [selectedMonth, setSelectedMonth] = useState("August 2026");
  const [expenses, setExpenses] = useState<DashboardExpense[]>([]);
  const [settlements, setSettlements] = useState<DashboardSettlement[]>([]);
  const [partnerBalances, setPartnerBalances] = useState<DashboardBalance[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<{ month: string; amount: number }[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  }, []);
  const currentBalance = partnerBalances.find((partner) => partner.isCurrentUser);
  const paidByCurrentUser = expenses.filter((expense) => expense.paidBy === user?.name).reduce((total, expense) => total + expense.amount, 0);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetch("/api/summary"), fetch("/api/expenses"), fetch("/api/settlements")])
      .then(async ([summaryResponse, expenseResponse, settlementResponse]) => {
        if (!summaryResponse.ok || !expenseResponse.ok || !settlementResponse.ok) throw new Error("Unable to load dashboard data");
        const [summary, expenseData, settlementData] = await Promise.all([summaryResponse.json(), expenseResponse.json(), settlementResponse.json()]);
        setTotalSpent(summary.totalSpent ?? 0);
        setMonthlyExpenses(summary.monthlyExpenses ?? []);
        setPartnerBalances((summary.balance ?? []).map((item: { userId: string; name: string; balance: number; }) => {
          const isReceiving = item.balance > 0;
          return { id: item.userId, name: item.name, email: "", initials: item.name.split(" ").map((part: string) => part[0]).join("").slice(0, 2), status: isReceiving ? "receives" : "owes", balance: `₹${Math.abs(item.balance).toLocaleString("en-IN")}`, subtitle: isReceiving ? "Should receive from partners" : "Pending amount to pay", isCurrentUser: item.userId === user?.id };
        }));
        setExpenses(expenseData.map((item: { id: string; description: string; amountPaid: number; transactionId: string; category: string | null; expenseDate: string; paidBy: { name: string } }) => ({ id: item.id, description: item.description, paidBy: item.paidBy.name, amount: item.amountPaid, formattedAmount: `₹${item.amountPaid.toLocaleString("en-IN")}`, date: new Date(item.expenseDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), category: item.category ?? "Uncategorised" })));
        setSettlements(settlementData.map((item: { id: string; amountPaid: number; settledAt: string | null; fromUser: { name: string }; toUser: { name: string } }) => ({ id: item.id, fromUser: item.fromUser.name, toUser: item.toUser.name, amount: item.amountPaid, formattedAmount: `₹${item.amountPaid.toLocaleString("en-IN")}`, date: item.settledAt ? new Date(item.settledAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Pending" })));
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [user?.id]);

  const handleAddExpense = (newExpense: DashboardExpense) => {
    setExpenses((current) => [newExpense, ...current]);
  };

  const handleAddSettlement = (newSettlement: DashboardSettlement) => {
    setSettlements((current) => [newSettlement, ...current]);
  };

  return (
    <div className="min-h-screen bg-[#fff8f1] flex flex-col md:flex-row selection:bg-[#fee3b5] selection:text-[#1d1e1c]">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Mobile Top Navigation */}
      <MobileNav />

      {/* Main Dashboard Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e3d6c5]/70">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-[#1d1e1c]">
                {greeting}, {user?.name?.split(" ")[0] ?? "there"} 👋
              </h1>
            </div>
            <p className="text-sm sm:text-base text-[#615f5c] mt-1">
              Here&apos;s an overview of your shared finances.
            </p>
          </div>

          {/* Right Header Options (Month selector & User Pill) */}
          <div className="flex items-center gap-3">
            {/* Month Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-white border border-[#c0bbb6] text-[#1d1e1c] text-sm font-semibold rounded-[16px] pl-10 pr-10 py-2.5 shadow-sm hover:border-[#fa5d00] transition-colors cursor-pointer"
              >
                <option value="August 2026">August 2026</option>
                <option value="July 2026">July 2026</option>
                <option value="June 2026">June 2026</option>
                <option value="May 2026">May 2026</option>
              </select>
              <Calendar className="w-4 h-4 text-[#fa5d00] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-[#8e8b87] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Profile Avatar Pill */}
            <div className="hidden sm:flex items-center gap-2.5 bg-white border border-[#e3d6c5] rounded-full p-1.5 pr-4 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#fa5d00] text-white font-bold flex items-center justify-center text-xs">
                {user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2) ?? "--"}
              </div>
              <span className="text-sm font-semibold text-[#1d1e1c]">
                {user?.name?.split(" ")[0] ?? "Partner"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#e3d6c5] rounded-[20px] p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#fa5d00] animate-pulse" />
            <span className="text-sm font-semibold text-[#1d1e1c]">
              Quick Actions
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex-1 sm:flex-none"
            >
              <Plus className="w-4 h-4" /> Add Expense
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsSettlementModalOpen(true)}
              className="flex-1 sm:flex-none border-[#c0bbb6]"
            >
              <ArrowLeftRight className="w-4 h-4 text-[#fa5d00]" /> Record Settlement
            </Button>
          </div>
        </div>

        {/* Financial Summary Cards Grid (4 Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} variant="paper" className="p-5 border border-[#e3d6c5] shadow-sm relative overflow-hidden animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-3 w-20 bg-[#e3d6c5]/50 rounded" />
                  <div className="w-8 h-8 rounded-xl bg-[#e3d6c5]/40" />
                </div>
                <div className="h-7 w-24 bg-[#e3d6c5]/70 rounded mb-2" />
                <div className="h-3 w-36 bg-[#e3d6c5]/30 rounded" />
              </Card>
            ))
          ) : (
            <>
              {/* Card 1: Total Spent */}
              <Card variant="paper" className="p-5 border border-[#e3d6c5] shadow-sm relative overflow-hidden group hover:border-[#fa5d00]/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8e8b87]">
                    Total Spent
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#fff8f1] border border-[#e3d6c5] flex items-center justify-center text-[#1d1e1c]">
                    <Receipt className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#1d1e1c] tracking-tight">
                  ₹{totalSpent.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-[#615f5c] mt-1.5 font-medium">
                  Total expenses this month
                </p>
              </Card>

              {/* Card 2: Your Contribution */}
              <Card variant="paper" className="p-5 border border-[#e3d6c5] shadow-sm relative overflow-hidden group hover:border-[#fa5d00]/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8e8b87]">
                    Your Contribution
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#fff8f1] border border-[#e3d6c5] flex items-center justify-center text-[#fa5d00]">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#1d1e1c] tracking-tight">
                  ₹{paidByCurrentUser.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-[#615f5c] mt-1.5 font-medium">
                  Amount paid by you
                </p>
              </Card>

              {/* Card 3: You Owe */}
              <Card variant="paper" className="p-5 border border-[#fee3b5] bg-white shadow-sm relative overflow-hidden group hover:border-[#fa5d00]/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#fa5d00]">
                    You Owe
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#fee3b5]/60 text-[#fa5d00] flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#fa5d00] tracking-tight">
                  {currentBalance?.status === "owes" ? currentBalance.balance : "₹0"}
                </p>
                <p className="text-xs text-[#615f5c] mt-1.5 font-medium">
                  Pending amount to settle
                </p>
              </Card>

              {/* Card 4: You Receive */}
              <Card variant="paper" className="p-5 border border-emerald-200 bg-white shadow-sm relative overflow-hidden group hover:border-emerald-400 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    You Receive
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-emerald-600 tracking-tight">
                  {currentBalance?.status === "receives" ? currentBalance.balance : "₹0"}
                </p>
                <p className="text-xs text-[#615f5c] mt-1.5 font-medium">
                  Amount others owe you
                </p>
              </Card>
            </>
          )}
        </section>

        {/* Spending Overview Chart */}
        <section>
          {isLoading ? (
            <Card variant="paper" className="h-64 border border-[#e3d6c5] shadow-sm animate-pulse flex items-center justify-center text-[#8e8b87] text-sm">
              Loading Spending Overview...
            </Card>
          ) : (
            <SpendingChart monthlyData={monthlyExpenses} />
          )}
        </section>

        {/* Partner Balances Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1d1e1c]">
                Partner Balances
              </h2>
              <p className="text-sm text-[#615f5c]">
                Real-time financial standing across all 3 business partners
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} variant="paper" className="p-6 border border-[#e3d6c5] shadow-sm animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#e3d6c5]/40" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-24 bg-[#e3d6c5]/60 rounded" />
                      <div className="h-3 w-36 bg-[#e3d6c5]/30 rounded" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#e3d6c5]/60 flex items-center justify-between">
                    <div className="h-4 w-16 bg-[#e3d6c5]/50 rounded" />
                    <div className="h-6 w-20 bg-[#e3d6c5]/40 rounded-full" />
                  </div>
                </Card>
              ))
            ) : (
              partnerBalances.map((partner) => {
                const isReceiving = partner.status === "receives";

                return (
                  <Card
                    key={partner.id}
                    variant="paper"
                    className={`p-6 border transition-all duration-200 ${partner.isCurrentUser
                      ? "border-[#fa5d00]/40 shadow-[0px_4px_16px_rgba(250,93,0,0.1)] bg-[#fff8f1]/30"
                      : "border-[#e3d6c5] shadow-sm"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-full font-bold flex items-center justify-center text-sm shadow-sm ${isReceiving
                            ? "bg-emerald-600 text-white"
                            : "bg-[#fa5d00] text-white"
                            }`}
                        >
                          {partner.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-semibold text-[#1d1e1c] text-base">
                              {partner.name}
                            </h3>
                            {partner.isCurrentUser && (
                              <span className="bg-[#fa5d00]/10 text-[#fa5d00] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#8e8b87]">{partner.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#e3d6c5]/60 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#8e8b87]">{partner.subtitle}</p>
                        <p
                          className={`text-xl font-bold mt-0.5 ${isReceiving ? "text-emerald-600" : "text-[#fa5d00]"
                            }`}
                        >
                          {partner.balance}
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border ${isReceiving
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-[#fee3b5]/60 text-[#fa5d00] border-[#fee3b5]"
                          }`}
                      >
                        {isReceiving ? (
                          <>
                            <ArrowDownLeft className="w-3.5 h-3.5" /> Receives {partner.balance}
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5" /> Owes {partner.balance}
                          </>
                        )}
                      </span>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </section>

        {/* Two-Column Grid: Recent Expenses & Recent Settlements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Recent Expenses Section */}
          <section className="flex flex-col space-y-4">
            <div className="flex items-center justify-between h-9">
              <div>
                <h2 className="text-xl font-bold text-[#1d1e1c]">Recent Expenses</h2>
                <p className="text-xs text-[#615f5c]">Latest transactions paid by partners</p>
              </div>
              <Link
                href="/expenses"
                className="text-xs font-semibold text-[#fa5d00] hover:underline flex items-center gap-1 shrink-0"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <Card variant="paper" className="p-0 border border-[#e3d6c5] shadow-sm overflow-hidden flex-1 flex flex-col justify-between">
              {isLoading ? (
                <div className="p-4 space-y-4 animate-pulse">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#e3d6c5]/40" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-[#e3d6c5]/60 rounded" />
                          <div className="h-3 w-20 bg-[#e3d6c5]/30 rounded" />
                        </div>
                      </div>
                      <div className="h-4 w-12 bg-[#e3d6c5]/50 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#fff8f1] border-b border-[#e3d6c5] text-xs font-semibold text-[#8e8b87] uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-3.5">Description</th>
                          <th className="px-5 py-3.5">Paid By</th>
                          <th className="px-5 py-3.5">Amount</th>
                          <th className="px-5 py-3.5 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e3d6c5]/50">
                        {expenses.slice(0, 5).map((expense) => (
                          <tr key={expense.id} className="hover:bg-[#fff8f1]/50 transition-colors">
                            <td className="px-5 py-4 font-semibold text-[#1d1e1c]">
                              {expense.description}
                              <span className="block text-[11px] font-normal text-[#8e8b87]">
                                {expense.category}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-[#615f5c]">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#fa5d00]" />
                                {expense.paidBy}
                              </span>
                            </td>
                            <td className="px-5 py-4 font-bold text-[#1d1e1c]">
                              {expense.formattedAmount}
                            </td>
                            <td className="px-5 py-4 text-right text-xs text-[#8e8b87]">
                              {expense.date}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card List View */}
                  <div className="sm:hidden divide-y divide-[#e3d6c5]/60">
                    {expenses.slice(0, 5).map((expense) => (
                      <div key={expense.id} className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-[#1d1e1c] text-sm">
                            {expense.description}
                          </h4>
                          <span className="font-bold text-[#1d1e1c] text-base">
                            {expense.formattedAmount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#615f5c]">
                          <span>Paid by <b>{expense.paidBy}</b></span>
                          <span className="text-[#8e8b87]">{expense.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </section>

          {/* Recent Settlements Section */}
          <section className="flex flex-col space-y-4">
            <div className="flex items-center justify-between h-9">
              <div>
                <h2 className="text-xl font-bold text-[#1d1e1c]">Recent Settlements</h2>
                <p className="text-xs text-[#615f5c]">Direct payments cleared between partners</p>
              </div>
              <Link
                href="/settlements"
                className="text-xs font-semibold text-[#fa5d00] hover:underline flex items-center gap-1 shrink-0"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <Card variant="paper" className="p-5 border border-[#e3d6c5] shadow-sm flex-1 flex flex-col justify-between">
              {isLoading ? (
                <div className="space-y-3.5 animate-pulse">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-[#e3d6c5]/40 rounded-[16px]" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3.5">
                  {settlements.slice(0, 5).map((settlement) => (
                    <div
                      key={settlement.id}
                      className="bg-[#fff8f1] border border-[#e3d6c5]/70 rounded-[16px] p-4 flex items-center justify-between hover:border-[#fa5d00]/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                          <ArrowLeftRight className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-[#1d1e1c]">
                            <span>{settlement.fromUser}</span>
                            <span className="text-[#fa5d00] font-bold">→</span>
                            <span>{settlement.toUser}</span>
                          </div>
                          <p className="text-xs text-[#8e8b87] flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-[#8e8b87]" /> {settlement.date}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-bold text-emerald-600 block">
                          {settlement.formattedAmount}
                        </span>
                        <span className="inline-block bg-emerald-100/60 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Settled
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </section>
        </div>
      </main>

      {/* Add Expense Dialog Modal */}
      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={handleAddExpense}
      />

      {/* Record Settlement Dialog Modal */}
      <RecordSettlementModal
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
        onSuccess={handleAddSettlement}
      />
    </div>
  );
}
