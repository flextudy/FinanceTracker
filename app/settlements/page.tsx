"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/components/providers/current-user-provider";
import { Attachment } from "@/types";
import { AttachmentSection } from "@/components/ui/attachment-section";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  HandCoins,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  Wallet,
  X,
} from "lucide-react";

import { CustomSelect } from "@/components/ui/custom-select";

type Settlement = {
  id: string;
  from: string;
  to: string;
  amount: number;
  date: string;
  status: "Completed";
  attachments?: Attachment[];
};

type PartnerBalance = {
  name: string;
  amount: number;
  status: "Receives" | "Owes";
  receives: boolean;
};

const partners = ["Aditya Sharma", "Vishal Kumar Singh", "Ujjwal Kumar Singh"];
const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

const money = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  return (
    <span
      className={`${small ? "h-7 w-7 text-[10px]" : "h-10 w-10 text-xs"
        } inline-flex shrink-0 items-center justify-center rounded-full bg-[#fa5d00] font-bold text-white`}
    >
      {initials(name)}
    </span>
  );
}

export default function SettlementsPage() {
  const { user } = useCurrentUser();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [balances, setBalances] = useState<PartnerBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("All dates");
  const [partner, setPartner] = useState("All partners");
  const [modalOpen, setModalOpen] = useState(false);
  const [details, setDetails] = useState<Settlement | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetch("/api/settlements"), fetch("/api/summary")])
      .then(async ([settlementResponse, summaryResponse]) => {
        if (!settlementResponse.ok || !summaryResponse.ok)
          throw new Error("Failed to load data");
        const [settlementData, summaryData] = await Promise.all([
          settlementResponse.json(),
          summaryResponse.json(),
        ]);

        setSettlements(
          settlementData.map(
            (item: {
              id: string;
              amountPaid: number;
              status: string;
              settledAt: string | null;
              fromUser: { name: string };
              toUser: { name: string };
              attachments?: Attachment[];
            }) => ({
              id: item.id,
              from: item.fromUser.name,
              to: item.toUser.name,
              amount: item.amountPaid,
              status: "Completed" as const,
              date: item.settledAt
                ? new Date(item.settledAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                : "Pending",
              attachments: item.attachments || [],
            })
          )
        );

        setBalances(
          (summaryData.balance ?? []).map(
            (item: { name: string; balance: number }) => {
              const isReceiving = item.balance > 0;
              return {
                name: item.name,
                amount: Math.abs(item.balance),
                status: isReceiving ? "Receives" : ("Owes" as const),
                receives: isReceiving,
              };
            }
          )
        );
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return settlements.filter(
      (settlement) =>
        `${settlement.from} ${settlement.to}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (partner === "All partners" ||
          settlement.from === partner ||
          settlement.to === partner) &&
        (date === "All dates" || settlement.date.includes("Aug 2026"))
    );
  }, [settlements, query, partner, date]);

  // Dynamic values based on active user context
  const summaryStats = useMemo(() => {
    const totalSettled = settlements.reduce((acc, curr) => acc + curr.amount, 0);

    const currentUserBalance = balances.find((b) => b.name === user?.name);
    let pendingToPay = 0;
    let pendingToReceive = 0;

    if (currentUserBalance) {
      if (currentUserBalance.receives) {
        pendingToReceive = currentUserBalance.amount;
      } else {
        pendingToPay = currentUserBalance.amount;
      }
    }

    return {
      totalSettled: money(totalSettled),
      pendingToPay: money(pendingToPay),
      pendingToReceive: money(pendingToReceive),
    };
  }, [settlements, balances, user]);

  const filtersActive =
    Boolean(query) || date !== "All dates" || partner !== "All partners";

  const clearFilters = () => {
    setQuery("");
    setDate("All dates");
    setPartner("All partners");
  };

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
                Settlements
              </h1>
              <p className="mt-1 text-sm text-[#615f5c] sm:text-base">
                Track payments and settlements between partners.
              </p>
            </div>
            <Button onClick={() => setModalOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Record Settlement
            </Button>
          </header>

          {/* Dynamic Summary Cards with Skeleton */}
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
                <Card className="border-[#e3d6c5] p-5 shadow-sm">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8e8b87]">
                        Total Settled
                      </p>
                      <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl text-[#fa5d00]">
                        {summaryStats.totalSettled}
                      </p>
                      <p className="mt-1 text-xs font-medium text-[#615f5c]">
                        Total settlements recorded
                      </p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e3d6c5] bg-[#fff8f1] text-[#fa5d00]">
                      <HandCoins className="h-4 w-4" />
                    </div>
                  </div>
                </Card>

                <Card className="border-[#e3d6c5] p-5 shadow-sm">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8e8b87]">
                        Pending to Pay
                      </p>
                      <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl text-[#fa5d00]">
                        {summaryStats.pendingToPay}
                      </p>
                      <p className="mt-1 text-xs font-medium text-[#615f5c]">
                        Your remaining balance
                      </p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e3d6c5] bg-[#fff8f1] text-[#fa5d00]">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Card>

                <Card className="border-[#e3d6c5] p-5 shadow-sm">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8e8b87]">
                        Pending to Receive
                      </p>
                      <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl text-emerald-600">
                        {summaryStats.pendingToReceive}
                      </p>
                      <p className="mt-1 text-xs font-medium text-[#615f5c]">
                        Amount partners owe you
                      </p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e3d6c5] bg-[#fff8f1] text-emerald-600">
                      <ArrowDownLeft className="h-4 w-4" />
                    </div>
                  </div>
                </Card>
              </>
            )}
          </section>

          {/* Current Partner Balances with Skeleton */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-[#1d1e1c]">Current Partner Balances</h2>
              <p className="mt-0.5 text-sm text-[#615f5c]">
                See who should receive or settle the remaining balance.
              </p>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="border border-[#e3d6c5] p-5 shadow-sm animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#e3d6c5]/40" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-28 bg-[#e3d6c5]/60 rounded" />
                        <div className="h-3 w-36 bg-[#e3d6c5]/30 rounded" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {balances.map((p) => (
                  <BalanceCard
                    key={p.name}
                    name={p.name}
                    amount={money(p.amount)}
                    status={p.status}
                    receives={p.receives}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Settlement History Table / Search with Skeleton */}
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#1d1e1c]">Settlement History</h2>
                <p className="mt-0.5 text-sm text-[#615f5c]">Payments recorded between partners.</p>
              </div>
              <span className="hidden text-xs font-semibold text-[#8e8b87] sm:block">
                {filtered.length} records shown
              </span>
            </div>

            <div className="mb-4 rounded-[20px] border border-[#e3d6c5] bg-white p-3 shadow-sm sm:p-4">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e8b87]" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search settlements..."
                    className="py-2.5 pl-10 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <CustomSelect
                    options={["All dates", "September 2026", "August 2026"]}
                    value={date}
                    onChange={setDate}
                    ariaLabel="Filter by date"
                  />
                  <CustomSelect
                    options={["All partners", ...partners]}
                    value={partner}
                    onChange={setPartner}
                    ariaLabel="Filter by partner"
                  />
                </div>
                {filtersActive && (
                  <button
                    onClick={clearFilters}
                    className="self-center whitespace-nowrap text-xs font-semibold text-[#fa5d00] hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {isLoading ? (
              <Card className="p-0 overflow-hidden border border-[#e3d6c5] shadow-sm animate-pulse">
                <div className="h-48 bg-[#fff8f1]/30" />
              </Card>
            ) : filtered.length ? (
              <>
                <Card className="hidden overflow-hidden p-0 md:block border border-[#e3d6c5] shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#e3d6c5] text-xs font-semibold uppercase tracking-wider text-[#8e8b87]">
                        <th className="px-6 py-4">From</th>
                        <th className="px-4 py-4">To</th>
                        <th className="px-4 py-4">Amount</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-4 py-4">Date</th>
                        <th className="w-12 px-4 py-4">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((settlement) => (
                        <SettlementRow
                          key={settlement.id}
                          settlement={settlement}
                          onView={() => setDetails(settlement)}
                        />
                      ))}
                    </tbody>
                  </table>
                </Card>
                <div className="space-y-3 md:hidden">
                  {filtered.map((settlement) => (
                    <SettlementMobileCard
                      key={settlement.id}
                      settlement={settlement}
                      onView={() => setDetails(settlement)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <Empty
                onRecord={() => setModalOpen(true)}
                filtersActive={Boolean(filtersActive)}
                onClear={clearFilters}
              />
            )}
          </section>

          {/* Activity Section */}
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_0.65fr]">
            <Card className="border-[#e3d6c5] p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#1d1e1c]">Recent activity</h2>
                  <p className="mt-0.5 text-sm text-[#615f5c]">Latest settlement updates</p>
                </div>
                <Clock3 className="h-5 w-5 text-[#fa5d00]" />
              </div>
              <div className="mt-5 space-y-0">
                {isLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 w-3/4 bg-[#e3d6c5]/40 rounded" />
                    <div className="h-4 w-2/3 bg-[#e3d6c5]/40 rounded" />
                  </div>
                ) : settlements.length ? (
                  settlements.slice(0, 3).map((s, idx) => (
                    <Activity
                      key={s.id}
                      day={s.date}
                      from={s.from.split(" ")[0]}
                      to={s.to.split(" ")[0]}
                      amount={money(s.amount)}
                      last={idx === Math.min(settlements.length, 3) - 1}
                    />
                  ))
                ) : (
                  <p className="text-xs text-[#8e8b87]">No settlement activity logged.</p>
                )}
              </div>
            </Card>

            <Card className="border-[#fee3b5] bg-[#fff8f1] p-5 sm:p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fa5d00]/10 text-[#fa5d00]">
                <Wallet className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-[#1d1e1c]">Ready to settle?</h2>
              <p className="mt-1 text-sm leading-relaxed text-[#615f5c]">
                Record a payment in seconds and keep each partner&apos;s balance up to date.
              </p>
              <Button size="sm" onClick={() => setModalOpen(true)} className="mt-5 w-full">
                Record Settlement
              </Button>
            </Card>
          </section>
        </div>
      </main>

      {details && (
        <SettlementDetails
          settlement={details}
          onClose={() => setDetails(null)}
          onUpdateSettlement={(updated) => {
            setSettlements((current) =>
              current.map((s) => (s.id === updated.id ? updated : s))
            );
            setDetails(updated);
          }}
        />
      )}
      {modalOpen && (
        <RecordSettlementModal
          onClose={() => setModalOpen(false)}
          onRecord={(settlement) => {
            setSettlements((current) => [settlement, ...current]);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function BalanceCard({
  name,
  amount,
  status,
  receives = false,
}: {
  name: string;
  amount: string;
  status: string;
  receives?: boolean;
}) {
  const accent = receives ? "text-emerald-600" : "text-[#fa5d00]";
  return (
    <Card className={`border p-5 shadow-sm ${receives ? "border-emerald-200" : "border-[#e3d6c5]"}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={name} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-[#1d1e1c]">{name}</p>
            <p className={`mt-0.5 text-sm font-semibold ${accent}`}>
              {status} <span className="font-bold">{amount}</span>
            </p>
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${receives ? "bg-emerald-50 text-emerald-700" : "bg-[#fa5d00]/10 text-[#fa5d00]"
            }`}
        >
          {status}
        </span>
      </div>
    </Card>
  );
}

function PartnerCell({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar name={name} small />
      <span className="text-sm font-semibold text-[#1d1e1c]">{name}</span>
    </div>
  );
}

function SettlementRow({
  settlement,
  onView,
}: {
  settlement: Settlement;
  onView?: () => void;
}) {
  return (
    <tr
      onClick={onView}
      className="border-b border-[#e3d6c5]/70 last:border-0 hover:bg-[#fff8f1] cursor-pointer transition-all duration-150 group"
    >
      <td className="px-6 py-4">
        <PartnerCell name={settlement.from} />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <ArrowRight className="h-3.5 w-3.5 text-[#fa5d00]" />
          <PartnerCell name={settlement.to} />
        </div>
      </td>
      <td className="px-4 py-4 text-sm font-bold text-[#1d1e1c]">
        <div className="flex items-center gap-2">
          <span className="tabular-nums">{money(settlement.amount)}</span>
          {settlement.attachments && settlement.attachments.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fa5d00]/10 border border-[#fa5d00]/20 px-2 py-0.5 text-[10px] font-bold text-[#fa5d00]">
              <Paperclip className="h-3 w-3" />
              {settlement.attachments.length}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {settlement.status}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-sm text-[#615f5c]">
        {settlement.date}
      </td>
      <td className="relative px-4 py-4 text-right">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onView) onView();
          }}
          className="inline-flex items-center gap-1 rounded-xl border border-[#e3d6c5] bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm cursor-pointer"
          aria-label="View settlement details"
        >
          <Eye className="h-3.5 w-3.5" /> Details
        </button>
      </td>
    </tr>
  );
}

function SettlementMobileCard({
  settlement,
  onView,
}: {
  settlement: Settlement;
  onView?: () => void;
}) {
  return (
    <Card
      onClick={onView}
      className="p-4 border border-[#e3d6c5] shadow-sm hover:border-emerald-400 transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={settlement.from} small />
          <ArrowRight className="h-4 w-4 shrink-0 text-[#fa5d00]" />
          <Avatar name={settlement.to} small />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-[#1d1e1c] tabular-nums">{money(settlement.amount)}</p>
          {onView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="inline-flex items-center gap-1 rounded-[12px] border border-[#e3d6c5] bg-[#fff8f1] px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
              aria-label={`View settlement details`}
            >
              <Eye className="h-3.5 w-3.5" /> View
            </button>
          )}
        </div>
      </div>
      <div className="mt-3">
        <p className="font-semibold text-[#1d1e1c]">{settlement.from}</p>
        <div className="my-1 flex items-center gap-1.5 text-xs text-[#fa5d00]">
          <ArrowDownLeft className="h-3.5 w-3.5" /> paid to
        </div>
        <p className="font-semibold text-[#1d1e1c]">{settlement.to}</p>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[#e3d6c5]/70 pt-3">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> Completed
        </span>
        <div className="flex items-center gap-2">
          {settlement.attachments && settlement.attachments.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fa5d00]/10 px-2 py-0.5 text-[10px] font-bold text-[#fa5d00]">
              <Paperclip className="h-3 w-3" />
              {settlement.attachments.length}
            </span>
          )}
          <span className="text-xs text-[#8e8b87]">{settlement.date}</span>
        </div>
      </div>
    </Card>
  );
}

function Activity({
  day,
  from,
  to,
  amount,
  last = false,
}: {
  day: string;
  from: string;
  to: string;
  amount: string;
  last?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#fa5d00]" />
        {!last && <span className="my-1 h-full w-px bg-[#e3d6c5]" />}
      </div>
      <div className="flex-1 pb-5">
        <p className="text-xs font-semibold text-[#8e8b87]">{day}</p>
        <p className="mt-0.5 text-sm text-[#1d1e1c]">
          <span className="font-semibold">{from}</span> paid{" "}
          <span className="font-semibold">{amount}</span> to{" "}
          <span className="font-semibold">{to}</span>
        </p>
      </div>
    </div>
  );
}

function Empty({
  onRecord,
  filtersActive,
  onClear,
}: {
  onRecord: () => void;
  filtersActive: boolean;
  onClear: () => void;
}) {
  return (
    <Card className="py-14 text-center border border-[#e3d6c5] shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff8f1] text-[#fa5d00]">
        <ArrowLeftRight className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-[#1d1e1c]">No settlements yet</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-[#615f5c]">
        {filtersActive
          ? "No settlements match your current filters."
          : "Settlement payments between partners will appear here."}
      </p>
      <div className="mt-5 flex justify-center gap-3">
        {filtersActive && (
          <Button variant="secondary" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        )}
        <Button size="sm" onClick={onRecord}>
          <Plus className="h-4 w-4" /> Record First Settlement
        </Button>
      </div>
    </Card>
  );
}

function SettlementDetails({
  settlement,
  onClose,
  onUpdateSettlement,
}: {
  settlement: Settlement;
  onClose: () => void;
  onUpdateSettlement?: (updated: Settlement) => void;
}) {
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`/api/settlements/${settlement.id}/attachments`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || "Failed to upload attachment.");
    }

    const data = await response.json();
    const newAtt = data.attachment as Attachment;
    const updated = {
      ...settlement,
      attachments: [newAtt, ...(settlement.attachments || [])],
    };
    if (onUpdateSettlement) {
      onUpdateSettlement(updated);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end bg-[#1d1e1c]/45 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Settlement details"
    >
      <div className="w-full max-w-lg rounded-t-[24px] border border-[#e3d6c5] bg-white p-5 shadow-2xl sm:rounded-[24px] sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-[#e3d6c5] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1d1e1c]">Settlement details</h2>
            <p className="mt-1 text-sm text-[#615f5c]">Direct payment record between partners.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-1.5 text-[#8e8b87] hover:bg-[#fff8f1] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 py-5 max-h-[75vh] overflow-y-auto pr-1">
          <div className="rounded-[16px] border border-emerald-200 bg-emerald-50/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8e8b87]">
              Transfer Amount
            </p>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-2xl font-bold text-emerald-700">{money(settlement.amount)}</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {settlement.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8e8b87]">Paid by (From)</p>
              <p className="mt-1 font-semibold text-[#1d1e1c]">{settlement.from}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8e8b87]">Paid to (Recipient)</p>
              <p className="mt-1 font-semibold text-[#1d1e1c]">{settlement.to}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8e8b87]">Settled Date</p>
              <p className="mt-1 font-semibold text-[#1d1e1c]">{settlement.date}</p>
            </div>
          </div>

          {/* Attachment Section */}
          <AttachmentSection
            attachments={settlement.attachments}
            onUpload={handleUpload}
            title="Settlement Attachments"
          />

          <div className="flex justify-end border-t border-[#e3d6c5] pt-4">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecordSettlementModal({
  onClose,
  onRecord,
}: {
  onClose: () => void;
  onRecord: (settlement: Settlement) => void;
}) {
  const [from, setFrom] = useState("Vishal Kumar Singh");
  const [to, setTo] = useState("Aditya Sharma");
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setUsers(data))
      .catch(() => { });
  }, []);

  const valid = Number(amount) > 0 && from !== to;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const fromUserObj = users.find((u) => u.name === from);
      const toUserObj = users.find((u) => u.name === to);

      let createdSettlementId = Date.now().toString();
      let createdAttachments: Attachment[] = [];

      if (fromUserObj && toUserObj) {
        const response = await fetch("/api/settlements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromUserId: fromUserObj.id,
            toUserId: toUserObj.id,
            amount: Number(amount),
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || "Failed to create settlement.");
        }

        const data = await response.json();
        const createdObj = data.settlement || data;
        createdSettlementId = createdObj.id;

        if (file) {
          const formData = new FormData();
          formData.append("file", file);
          const attRes = await fetch(`/api/settlements/${createdSettlementId}/attachments`, {
            method: "POST",
            body: formData,
          });
          if (attRes.ok) {
            const attData = await attRes.json();
            if (attData.attachment) {
              createdAttachments.push(attData.attachment);
            }
          }
        }
      }

      onRecord({
        id: createdSettlementId,
        from,
        to,
        amount: Number(amount),
        status: "Completed",
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        attachments: createdAttachments,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end bg-[#1d1e1c]/45 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Record settlement"
    >
      <div className="w-full max-w-lg rounded-t-[24px] border border-[#e3d6c5] bg-white p-5 shadow-2xl sm:rounded-[24px] sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-[#e3d6c5] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1d1e1c]">Record settlement</h2>
            <p className="mt-1 text-sm text-[#615f5c]">Record a payment between partners.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-1.5 text-[#8e8b87] hover:bg-[#fff8f1] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 pt-5 max-h-[75vh] overflow-y-auto pr-1">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Paid by">
              <select
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="w-full rounded-[16px] border border-[#c0bbb6] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#fa5d00]"
              >
                {partners.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Paid to">
              <select
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className="w-full rounded-[16px] border border-[#c0bbb6] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#fa5d00]"
              >
                {partners
                  .filter((name) => name !== from)
                  .map((name) => (
                    <option key={name}>{name}</option>
                  ))}
              </select>
            </FormField>
          </div>
          <FormField label="Amount (₹)">
            <Input
              type="number"
              min="1"
              placeholder="e.g. 1000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </FormField>
          {from === to && (
            <p className="text-xs font-medium text-red-600">
              Choose two different partners for this settlement.
            </p>
          )}

          {/* Optional File Attachment Input */}
          <FormField label="Attachment (Optional Proof / Receipt)">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-[#615f5c] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#fa5d00]/10 file:text-[#fa5d00] hover:file:bg-[#fa5d00]/20 cursor-pointer"
            />
          </FormField>

          <div className="rounded-[16px] border border-[#e3d6c5] bg-[#fff8f1] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8e8b87]">
              Settlement Summary
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#1d1e1c]">
                {from.split(" ")[0]}{" "}
                <ArrowRight className="mx-1 inline h-3.5 w-3.5 text-[#fa5d00]" />{" "}
                {to.split(" ")[0]}
              </p>
              <p className="text-base font-bold text-[#fa5d00]">
                {valid ? money(Number(amount)) : "₹0"}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-[#e3d6c5] pt-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!valid || isSubmitting}>
              {isSubmitting ? "Recording..." : <><CheckCircle2 className="h-4 w-4" /> Confirm Settlement</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1d1e1c]">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

