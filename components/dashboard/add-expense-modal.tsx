"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Receipt, CheckCircle2 } from "lucide-react";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (expense: any) => void;
}

export function AddExpenseModal({ isOpen, onClose, onSuccess }: AddExpenseModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("Aditya Sharma");
  const [date, setDate] = useState("2026-08-31");
  const [category, setCategory] = useState("Infrastructure");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newExpense = {
      id: Date.now().toString(),
      description,
      paidBy,
      amount: parseInt(amount, 10),
      formattedAmount: `₹${parseInt(amount, 10).toLocaleString("en-IN")}`,
      date: new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      category,
    };

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      if (onSuccess) onSuccess(newExpense);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1d1e1c]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#e3d6c5] rounded-[24px] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e3d6c5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fa5d00]/10 text-[#fa5d00] flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1d1e1c]">Add Shared Expense</h3>
              <p className="text-xs text-[#615f5c]">Record a new expense split equally among 3 partners</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8e8b87] hover:text-[#1d1e1c] p-1.5 rounded-full hover:bg-[#fff8f1] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#fa5d00] mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-[#1d1e1c]">Expense Added Successfully!</h4>
            <p className="text-sm text-[#615f5c]">Partner balances have been recalculated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1d1e1c] mb-1.5">
                Expense Description
              </label>
              <Input
                placeholder="e.g. AWS Cloud Hosting, Office Coffee"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1d1e1c] mb-1.5">
                  Amount (₹)
                </label>
                <Input
                  type="number"
                  placeholder="₹ 5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1d1e1c] mb-1.5">
                  Paid By
                </label>
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
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
                  Date
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1d1e1c] mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-[#c0bbb6] text-[#1d1e1c] rounded-[16px] px-4 py-3.5 text-sm focus:outline-none focus:border-[#fa5d00] focus:ring-2 focus:ring-[#fa5d00]/20"
                >
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Software/SaaS">Software/SaaS</option>
                  <option value="Domain & Ops">Domain & Ops</option>
                  <option value="Office & Food">Office & Food</option>
                </select>
              </div>
            </div>

            {/* Split Info */}
            <div className="bg-[#fff8f1] p-3.5 rounded-[16px] border border-[#e3d6c5] text-xs text-[#615f5c] flex items-center justify-between">
              <span>Split Rule: <b>Split equally (1/3 each)</b></span>
              <span className="font-bold text-[#fa5d00]">
                {amount ? `₹${(parseInt(amount, 10) / 3).toFixed(2)} / partner` : "₹0 / partner"}
              </span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e3d6c5]">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" showArrow>
                Save Expense
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
