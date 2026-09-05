"use client";

import React, { useState, useRef } from "react";
import { Calendar, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ActiveElement,
} from "chart.js";
import { Bar, getElementAtEvent } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const fallbackData = [
  { month: "Jan", amount: 0 },
  { month: "Feb", amount: 0 },
  { month: "Mar", amount: 0 },
  { month: "Apr", amount: 0 },
  { month: "May", amount: 8000 },
  { month: "Jun", amount: 12500 },
  { month: "Jul", amount: 9800 },
  { month: "Aug", amount: 16000 },
  { month: "Sep", amount: 0 },
  { month: "Oct", amount: 0 },
  { month: "Nov", amount: 0 },
  { month: "Dec", amount: 0 },
];

const fullMonthNames: Record<string, string> = {
  Jan: "January",
  Feb: "February",
  Mar: "March",
  Apr: "April",
  May: "May",
  Jun: "June",
  Jul: "July",
  Aug: "August",
  Sep: "September",
  Oct: "October",
  Nov: "November",
  Dec: "December",
};

const formatAmount = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

export function SpendingChart({
  monthlyData,
}: {
  monthlyData?: { month: string; amount: number }[];
}) {
  const data = monthlyData?.length ? monthlyData : fallbackData;
  const [active, setActive] = useState(7); // Default to August (index 7)
  const chartRef = useRef<ChartJS<"bar"> | null>(null);

  const activeItem = data[active] ?? data[0];
  const activeMonthFull = fullMonthNames[activeItem.month] ?? activeItem.month;

  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        data: data.map((d) => d.amount),
        backgroundColor: data.map((_, idx) =>
          idx === active ? "#fa5d00" : "rgba(250, 93, 0, 0.45)"
        ),
        hoverBackgroundColor: "#fa5d00",
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 28,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#1d1e1c",
        titleColor: "#fff8f1",
        bodyColor: "#fa5d00",
        bodyFont: {
          family: "var(--font-sans), sans-serif",
          size: 13,
          weight: "bold",
        },
        titleFont: {
          family: "var(--font-sans), sans-serif",
          size: 11,
          weight: "normal",
        },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            const label = tooltipItems[0]?.label ?? "";
            return `${fullMonthNames[label] ?? label} 2026`;
          },
          label: (context) => {
            const val = context.raw as number;
            return ` ${formatAmount(val)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: (context) =>
            context.index === active ? "#fa5d00" : "#615f5c",
          font: {
            family: "var(--font-sans), sans-serif",
            size: 11,
            weight: 600,
          },
        },
      },
      y: {
        beginAtZero: true,
        max: 30000,
        grid: {
          color: "#e3d6c5",
        },
        border: {
          dash: [4, 4],
          display: false,
        },
        ticks: {
          stepSize: 10000,
          color: "#8e8b87",
          font: {
            family: "var(--font-sans), sans-serif",
            size: 11,
            weight: 500,
          },
          callback: (value) => {
            const val = Number(value);
            if (val === 0) return "₹0";
            return `₹${val / 1000}K`;
          },
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const clickedIndex = elements[0].index;
        setActive(clickedIndex);
      }
    },
  };

  const handleChartClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chartRef.current) return;
    const elements: ActiveElement[] = getElementAtEvent(
      chartRef.current,
      event
    );
    if (elements.length > 0) {
      setActive(elements[0].index);
    }
  };

  return (
    <Card
      variant="paper"
      className="overflow-hidden border-[#e3d6c5] p-4 sm:p-7 shadow-sm space-y-4"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1d1e1c]">
              Spending Overview
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fa5d00]/10 px-2.5 py-1 text-xs font-semibold text-[#fa5d00]">
              <TrendingUp className="h-3.5 w-3.5" /> +150% in Aug
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#615f5c]">
            Monthly shared expenses across your workspace
          </p>
        </div>

        {/* Date Selector Pill */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-full border border-[#e3d6c5] bg-[#fff8f1] px-3 py-1.5 text-xs font-medium text-[#615f5c]">
          <Calendar className="h-3.5 w-3.5 text-[#fa5d00]" /> Jan – Dec 2026
        </div>
      </div>

      {/* Dynamic Contextual Selected Info Bar (replaces permanent side panel) */}
      <div className="flex items-center justify-between bg-[#fff8f1] border border-[#e3d6c5] rounded-xl px-3.5 py-2.5 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#fa5d00]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8e8b87]">
            {activeMonthFull} 2026
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-bold text-[#1d1e1c]">
            {formatAmount(activeItem.amount)}
          </span>
          <span className="text-xs text-[#615f5c] hidden min-[380px]:inline">
            • Shared expenses
          </span>
        </div>
      </div>

      {/* Full-width Responsive Chart Container */}
      <div className="w-full h-56 sm:h-64 pt-2">
        <Bar
          ref={chartRef}
          data={chartData}
          options={options}
          onClick={handleChartClick}
        />
      </div>
    </Card>
  );
}
