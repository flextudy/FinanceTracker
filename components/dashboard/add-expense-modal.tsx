"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Receipt, CheckCircle2, Loader2 } from "lucide-react";

import { CustomSelect } from "@/components/ui/custom-select";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess?: (expense: any) => void;
}

export function AddExpenseModal({ isOpen, onClose, onSuccess }: AddExpenseModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("Aditya Sharma");
  const [date, setDate] = useState("2026-08-31");
  const [category, setCategory] = useState("Infrastructure");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/users")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setUsers(data))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const parsedAmount = parseInt(amount, 10);
      const selectedUser = users.find((u) => u.name === paidBy) || users[0];
      const paidById = selectedUser?.id;

      let createdExpenseId = Date.now().toString();
      let createdAttachments: any[] = [];

      if (paidById) {
        const response = await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountPaid: parsedAmount,
            transactionId: `TXN-${Date.now().toString().slice(-6)}`,
            description,
            category,
            paidById,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || "Failed to create expense.");
        }

        const data = await response.json();
        createdExpenseId = data.id;

        if (file) {
          const formData = new FormData();
          formData.append("file", file);
          const attRes = await fetch(`/api/expenses/${data.id}/attachments`, {
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

      const newExpense = {
        id: createdExpenseId,
        description,
        paidBy,
        amount: parsedAmount,
        formattedAmount: `₹${parsedAmount.toLocaleString("en-IN")}`,
        date: new Date(date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        category,
        attachments: createdAttachments,
      };

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsSubmitting(false);
        if (onSuccess) onSuccess(newExpense);
        onClose();
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1d1e1c]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#e3d6c5] rounded-[24px] max-w-lg w-full p-5 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e3d6c5]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#fa5d00]/10 text-[#fa5d00] flex items-center justify-center shrink-0">
              <Receipt className="size-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1d1e1c] text-balance">Add Shared Expense</h3>
              <p className="text-xs text-[#615f5c] text-pretty">Record a new expense split equally among 3 partners</p>
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
            <CheckCircle2 className="w-12 h-12 text-[#fa5d00] mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-[#1d1e1c]">Expense Added Successfully!</h4>
            <p className="text-sm text-[#615f5c]">Partner balances have been recalculated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                {error}
              </div>
            )}
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
                <CustomSelect
                  options={["Aditya Sharma", "Vishal Kumar Singh", "Ujjwal Kumar Singh"]}
                  value={paidBy}
                  onChange={setPaidBy}
                />
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
                <CustomSelect
                  options={["Infrastructure", "Software/SaaS", "Domain & Ops", "Office & Food"]}
                  value={category}
                  onChange={setCategory}
                />
              </div>
            </div>

            {/* Optional File Attachment Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1d1e1c] mb-1.5">
                Attachment (Optional Receipt / Invoice)
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-[#615f5c] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#fa5d00]/10 file:text-[#fa5d00] hover:file:bg-[#fa5d00]/20 cursor-pointer"
              />
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
              <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" showArrow disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </span>
                ) : (
                  "Save Expense"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

