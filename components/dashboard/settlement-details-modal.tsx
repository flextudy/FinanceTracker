"use client";

import React, { useState } from "react";
import { Attachment } from "@/types";
import { AttachmentSection } from "@/components/ui/attachment-section";
import { Button } from "@/components/ui/button";
import {
  X,
  ArrowLeftRight,
  Calendar,
  CheckCircle2,
  Clock,
} from "lucide-react";

export type DetailedSettlement = {
  id: string;
  fromUser?: string;
  from?: string;
  toUser?: string;
  to?: string;
  amount: number;
  formattedAmount?: string;
  date: string;
  status?: string;
  attachments?: Attachment[];
};

interface SettlementDetailsModalProps {
  settlement: DetailedSettlement | null;
  onClose: () => void;
  onUpdateSettlement?: (updated: DetailedSettlement) => void;
}

export function SettlementDetailsModal({
  settlement,
  onClose,
  onUpdateSettlement,
}: SettlementDetailsModalProps) {
  const [currentSettlement, setCurrentSettlement] = useState<DetailedSettlement | null>(settlement);

  React.useEffect(() => {
    setCurrentSettlement(settlement);
  }, [settlement]);

  if (!currentSettlement) return null;

  const sender = currentSettlement.fromUser || currentSettlement.from || "Partner";
  const receiver = currentSettlement.toUser || currentSettlement.to || "Partner";
  const formattedAmt = currentSettlement.formattedAmount || `₹${currentSettlement.amount.toLocaleString("en-IN")}`;

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`/api/settlements/${currentSettlement.id}/attachments`, {
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
      ...currentSettlement,
      attachments: [newAtt, ...(currentSettlement.attachments || [])],
    };
    setCurrentSettlement(updated);
    if (onUpdateSettlement) {
      onUpdateSettlement(updated);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-[#1d1e1c]/50 backdrop-blur-md p-0 sm:p-4 transition-all duration-300 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Settlement Details"
    >
      <div className="w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] border border-[#e3d6c5] bg-white p-5 sm:p-7 shadow-2xl space-y-6 max-h-[90dvh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#e3d6c5]/70 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200 shadow-sm">
              <ArrowLeftRight className="size-5" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100/70 text-emerald-800 mb-1">
                Settlement Record
              </span>
              <h2 className="text-xl font-bold text-[#1d1e1c] leading-tight text-balance">
                Settlement Details
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-2 text-[#8e8b87] hover:bg-[#fff8f1] hover:text-[#1d1e1c] transition-colors cursor-pointer shrink-0"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Sender & Receiver Card */}
        <div className="rounded-[20px] border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-emerald-100/30 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e8b87]">
                Payer
              </span>
              <p className="font-bold text-[#1d1e1c] text-sm sm:text-base">
                {sender}
              </p>
            </div>

            <div className="flex items-center justify-center size-8 rounded-full bg-emerald-600 text-white shadow-sm font-bold text-xs shrink-0">
              →
            </div>

            <div className="space-y-1 text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e8b87]">
                Recipient
              </span>
              <p className="font-bold text-[#1d1e1c] text-sm sm:text-base">
                {receiver}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-200/60 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#615f5c]">
              Amount Cleared
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tabular-nums">
              {formattedAmt}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-[#fff8f1]/50 p-4 rounded-[20px] border border-[#e3d6c5]/60 text-xs sm:text-sm">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#8e8b87] flex items-center gap-1">
              <CheckCircle2 className="size-3 text-emerald-600" /> Status
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
              Completed
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#8e8b87] flex items-center gap-1">
              <Calendar className="size-3 text-[#fa5d00]" /> Date Settled
            </span>
            <p className="font-semibold text-[#1d1e1c] flex items-center gap-1">
              <Clock className="size-3 text-[#8e8b87]" /> {currentSettlement.date}
            </p>
          </div>
        </div>

        {/* Attachment Section */}
        <AttachmentSection
          attachments={currentSettlement.attachments}
          onUpload={handleUpload}
          title="Payment Receipts & Proofs"
        />

        {/* Footer Actions */}
        <div className="flex justify-end pt-3 border-t border-[#e3d6c5]">
          <Button variant="secondary" size="md" onClick={onClose} className="px-6">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
