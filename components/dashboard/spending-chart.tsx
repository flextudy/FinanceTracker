"use client";

import { useState } from "react";
import { Calendar, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

const fallbackData = [
  { month: "Jan", amount: 0 }, { month: "Feb", amount: 0 },
  { month: "Mar", amount: 0 }, { month: "Apr", amount: 0 },
  { month: "May", amount: 8000 }, { month: "Jun", amount: 12500 },
  { month: "Jul", amount: 9800 }, { month: "Aug", amount: 24500 },
  { month: "Sep", amount: 0 }, { month: "Oct", amount: 0 },
  { month: "Nov", amount: 0 }, { month: "Dec", amount: 0 },
];
const format = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

export function SpendingChart({ monthlyData }: { monthlyData?: { month: string; amount: number }[] }) {
  const data = monthlyData?.length ? monthlyData : fallbackData;
  const [active, setActive] = useState(7);
  const max = 30000;
  // A zero amount intentionally resolves to the baseline, so months without
  // spending remain visible in the complete history rather than being omitted.
  const chartBottom = 242;
  const xFor = (index: number) => 54 + index * (1080 / (data.length - 1));
  const yFor = (amount: number) => chartBottom - (Math.max(0, amount) / max) * 184;
  const points = data.map((item, index) => `${xFor(index)},${yFor(item.amount)}`).join(" ");
  const area = `M ${xFor(0)} ${chartBottom} L ${points.split(" ").map((point) => point.replace(",", " ")).join(" L ")} L ${xFor(data.length - 1)} ${chartBottom} Z`;
  const item = data[active];
  return <Card variant="paper" className="overflow-hidden border-[#e3d6c5] p-5 shadow-sm sm:p-7">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-bold text-[#1d1e1c] sm:text-2xl">Spending Overview</h2><span className="inline-flex items-center gap-1 rounded-full bg-[#fa5d00]/10 px-2.5 py-1 text-xs font-semibold text-[#fa5d00]"><TrendingUp className="h-3.5 w-3.5" /> +150% in Aug</span></div><p className="mt-1 text-sm text-[#615f5c]">Monthly shared expenses across your workspace</p></div><div className="flex items-center gap-1.5 self-start rounded-full border border-[#e3d6c5] bg-[#fff8f1] px-3 py-1.5 text-xs font-medium text-[#615f5c]"><Calendar className="h-3.5 w-3.5 text-[#fa5d00]" /> Jan – Dec 2026</div></div>
    <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-[16px] border border-[#e3d6c5]/70 bg-[#fff8f1]/50 p-4 sm:p-5"><div className="min-w-0 overflow-x-auto"><svg viewBox="0 0 1200 300" className="h-52 min-w-[680px] w-full sm:h-64" role="img" aria-label="Complete monthly expenses chart"><defs><linearGradient id="expense-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fa5d00" stopOpacity=".28" /><stop offset="1" stopColor="#fa5d00" stopOpacity="0" /></linearGradient></defs>{[[58, "₹30k"], [119, "₹20k"], [181, "₹10k"], [242, "₹0"]].map(([y, label]) => <g key={String(label)}><line x1="54" x2="1134" y1={Number(y)} y2={Number(y)} stroke="#e3d6c5" strokeDasharray="3 5" /><text x="0" y={Number(y) + 4} fill="#8e8b87" fontSize="13" fontWeight="500">{label}</text></g>)}<path d={area} fill="url(#expense-area)" /><polyline points={points} fill="none" stroke="#fa5d00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />{data.map((point, index) => { const x = xFor(index); const y = yFor(point.amount); return <g key={point.month} onMouseEnter={() => setActive(index)} onClick={() => setActive(index)} className="cursor-pointer"><circle cx={x} cy={y} r={active === index ? 9 : 6} fill="#fff8f1" stroke="#fa5d00" strokeWidth="3" /><text x={x} y="282" textAnchor="middle" fill={active === index ? "#fa5d00" : "#615f5c"} fontSize="13" fontWeight="700">{point.month}</text></g>; })}</svg></div><div className="flex min-w-[108px] flex-col justify-center border-l border-[#e3d6c5] pl-4 sm:min-w-[126px]"><p className="text-xs font-semibold uppercase tracking-wider text-[#8e8b87]">{item.month} 2026</p><p className="mt-1 text-lg font-bold text-[#1d1e1c] sm:text-xl">{format(item.amount)}</p><p className="mt-1 text-xs text-[#615f5c]">Shared expenses</p></div></div>
  </Card>;
}
