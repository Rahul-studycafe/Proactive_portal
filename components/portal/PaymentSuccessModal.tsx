"use client";

import {
  CheckCircle2,
  Download,
  Receipt,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface PaymentSuccessModalProps {
  receipt: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentSuccessModal({
  receipt,
  open,
  onOpenChange,
}: PaymentSuccessModalProps) {
  if (!receipt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader className="space-y-3">
          {/* Animated Celebration Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mx-auto shadow-sm animate-in zoom-in-75 duration-300">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>

          <div>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs mb-1">
              Payment Verified
            </Badge>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              Payment Received Successfully!
            </DialogTitle>
          </div>

          <DialogDescription className="text-xs text-muted-foreground">
            Thank you! Your payment has been reconciled atomically and an official receipt has been issued.
          </DialogDescription>
        </DialogHeader>

        {/* Receipt Details Card */}
        <div className="p-4 rounded-xl border bg-muted/20 space-y-3 text-xs my-2 text-left">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Receipt Number</span>
            <span className="font-mono font-bold text-primary">{receipt.receiptNo || "RCT-AUTO"}</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Settled Invoice</span>
            <span className="font-semibold text-foreground">{receipt.invoiceNo || "Invoice"}</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Amount Credited</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              ₹{(receipt.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Transaction Time</span>
            <span className="text-foreground">{formatDate(receipt.date || new Date())}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1 text-xs gap-1.5 shadow-xs"
            onClick={() => onOpenChange(false)}
          >
            Back to Dashboard
          </Button>
          <Button
            className="flex-1 text-xs gap-1.5 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => {
              onOpenChange(false);
              window.location.href = "/portal/billing";
            }}
          >
            <Receipt className="h-3.5 w-3.5" /> View Receipts
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

