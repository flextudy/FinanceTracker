"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ArrowLeftRight, CheckCircle2 } from "lucide-react";

interface RecordSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (settlement: any) => void;
}

export function RecordSettlementModal({
  isOpen,
  onClose,
  onSuccess,
}: RecordSettlementModalProps) {
  const [fromUser, setFromUser] = useState("Vishal Kumar Singh");
  const [toUser, setToUser] = useState("Aditya Sharma");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("2026-08-31");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const newSettlement = {
      id: Date.now().toString(),
      fromUser,
      toUser,
      amount: parseInt(amount, 10),
      formattedAmount: `₹${parseInt(amount, 10).toLocaleString("en-IN")}`,
      date: new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      if (onSuccess) onSuccess(newSettlement);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1d1e1c]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#e3d6c5] rounded-[24px] max-w-lg w-full p-5 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e3d6c5]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#fa5d00]/10 text-[#fa5d00] flex items-center justify-center shrink-0">
              <ArrowLeftRight className="size-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1d1e1c] text-balance">Record Partner Settlement</h3>
              <p className="text-xs text-[#615f5c] text-pretty">Record a direct payment between partners</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[#8e8b87] hover:text-[#1d1e1c] p-1.5 rounded-full hover:bg-[#fff8f1] transition-colors cursor-pointer shrink-0"
          >
            <X className="size-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-[#1d1e1c]">Settlement Recorded!</h4>
            <p className="text-sm text-[#615f5c]">Partner balances updated accordingly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1d1e1c] mb-1.5">
                  Payer (From)
                </label>
                <select
                  value={fromUser}
                  onChange={(e) => setFromUser(e.target.value)}
                  className="w-full bg-white border border-[#c0bbb6] text-[#1d1e1c] rounded-[16px] px-4 py-3.5 text-sm focus:outline-none focus:border-[#fa5d00] focus:ring-2 focus:ring-[#fa5d00]/20"
                >
                  <option value="Vishal Kumar Singh">Vishal Kumar Singh</option>
                  <option value="Ujjwal Kumar Singh">Ujjwal Kumar Singh</option>
                  <option value="Aditya Sharma">Aditya Sharma</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1d1e1c] mb-1.5">
                  Recipient (To)
                </label>
                <select
                  value={toUser}
                  onChange={(e) => setToUser(e.target.value)}
                  className="w-full bg-white border border-[#c0bbb6] text-[#1d1e1c] rounded-[16px] px-4 py-3.5 text-sm focus:outline-none focus:border-[#fa5d00] focus:ring-2 focus:ring-[#fa5d00]/20"
                >
                  <option value="Aditya Sharma">Aditya Sharma</option>
                  <option value="Vishal Kumar Singh">Vishal Kumar Singh</option>
                  <option value="Ujjwal Kumar Singh">Ujjwal Kumar Singh</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1d1e1c] mb-1.5">
                  Amount (₹)
                </label>
                <Input
                  type="number"
                  placeholder="₹ 1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1d1e1c] mb-1.5">
                  Payment Date
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="bg-emerald-50 p-3.5 rounded-[16px] border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
              <span>Transfer summary:</span>
              <span className="font-bold">
                {fromUser.split(" ")[0]} → {toUser.split(" ")[0]}
              </span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e3d6c5]">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Record Payment
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
