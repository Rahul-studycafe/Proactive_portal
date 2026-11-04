"use client";

import { useState } from "react";
import {
  QrCode,
  Building2,
  Copy,
  Check,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  SendHorizontal,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DynamicUPIQRCode } from "@/components/invoices/DynamicUPIQRCode";
import {
  useGetInvoiceUpiQrQuery,
  useConfirmPortalPaymentMutation,
  useGetOutlayUpiQrQuery,
  useConfirmOutlayPaymentMutation,
} from "@/lib/services/api";

interface OnlineCheckoutModalProps {
  invoice?: any;
  outlay?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess?: (receipt: any) => void;
}

export function OnlineCheckoutModal({
  invoice,
  outlay,
  open,
  onOpenChange,
  onPaymentSuccess,
}: OnlineCheckoutModalProps) {
  const [activeTab, setActiveTab] = useState<"upi" | "bank">("upi");
  const [utrNumber, setUtrNumber] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isOutlay = !!outlay;
  const item = outlay || invoice;

  const { data: invoiceQrData, isLoading: isLoadingInvoiceQr } = useGetInvoiceUpiQrQuery(
    invoice?._id || "",
    { skip: !invoice?._id || isOutlay }
  );

  const { data: outlayQrData, isLoading: isLoadingOutlayQr } = useGetOutlayUpiQrQuery(
    outlay?._id || "",
    { skip: !outlay?._id }
  );

  const qrData = isOutlay ? outlayQrData : invoiceQrData;
  const isLoadingQr = isOutlay ? isLoadingOutlayQr : isLoadingInvoiceQr;

  const [confirmInvoicePayment, { isLoading: isConfirmingInvoice }] =
    useConfirmPortalPaymentMutation();
  const [confirmOutlayPayment, { isLoading: isConfirmingOutlay }] =
    useConfirmOutlayPaymentMutation();

  const isConfirming = isConfirmingInvoice || isConfirmingOutlay;

  if (!item) return null;

  const handleCopy = (text: string, fieldName: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const itemNo = outlay ? outlay.expenseNo : invoice.invoiceNo;
  const payableAmount = outlay
    ? outlay.amount || 0
    : invoice.amountDue || invoice.grandTotal || 0;

  const handleConfirm = async () => {
    try {
      let res: any;
      if (isOutlay) {
        res = await confirmOutlayPayment({
          outlayId: outlay._id,
          utrNumber: utrNumber.trim() || undefined,
        }).unwrap();
      } else {
        res = await confirmInvoicePayment({
          invoiceId: invoice._id,
          utrNumber: utrNumber.trim() || undefined,
        }).unwrap();
      }

      toast.success("Payment confirmed successfully! Official receipt issued.");
      onOpenChange(false);
      setUtrNumber("");

      if (onPaymentSuccess) {
        onPaymentSuccess(
          res?.receipt || {
            receiptNo: `RCT-${Math.floor(1000 + Math.random() * 9000)}`,
            totalAmount: payableAmount,
            amount: payableAmount,
            invoiceNo: itemNo,
            date: new Date().toISOString(),
          }
        );
      }
    } catch (err: any) {
      toast.error(
        err?.data?.error?.message ||
          err?.data?.message ||
          "Failed to record payment"
      );
    }
  };

  const bank = qrData?.bankDetails;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[92vh] flex flex-col p-4 sm:p-5 gap-2.5 overflow-hidden">
        <DialogHeader className="space-y-1 pb-0.5 shrink-0">
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                {isOutlay ? `Outlay #${itemNo}` : `#${itemNo}`}
              </Badge>
              <Badge
                variant="secondary"
                className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 border-emerald-200"
              >
                0% Fee
              </Badge>
            </div>
            <span className="text-base font-bold text-foreground">
              ₹
              {payableAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <DialogTitle className="text-sm font-semibold">
            {isOutlay ? "Settle Practice Outlay" : "Direct Firm Settlement"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isOutlay
              ? `Reimburse ${outlay.categoryName || "statutory expense"} directly via Dynamic UPI QR or Bank Transfer.`
              : "Pay directly via Dynamic UPI QR or Direct Bank Transfer."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-0.5 space-y-2">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as any)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 text-xs h-8">
              <TabsTrigger value="upi" className="gap-1.5 text-xs py-1">
                <QrCode className="h-3.5 w-3.5" /> Scan & Pay (UPI)
              </TabsTrigger>
              <TabsTrigger value="bank" className="gap-1.5 text-xs py-1">
                <Building2 className="h-3.5 w-3.5" /> Bank Transfer
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Dynamic NPCI UPI QR */}
            <TabsContent value="upi" className="pt-1.5 mt-0">
              <DynamicUPIQRCode
                invoiceId={invoice?._id}
                invoiceNo={itemNo}
                amountDue={payableAmount}
                qrData={qrData}
                isLoading={isLoadingQr}
              />
            </TabsContent>

            {/* TAB 2: Direct Bank Details */}
            <TabsContent value="bank" className="pt-1.5 mt-0">
              <div className="p-3 bg-muted/20 border border-border/70 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary" /> Bank Account Details
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-primary/5 text-primary border-primary/20"
                  >
                    NEFT / RTGS / IMPS
                  </Badge>
                </div>

                {bank ? (
                  <div className="space-y-2 text-[11px]">
                    {bank.bankName && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Bank:</span>
                        <span className="font-medium text-foreground">
                          {bank.bankName}
                        </span>
                      </div>
                    )}

                    {bank.accountNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Account No:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-semibold text-foreground">
                            {bank.accountNumber}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleCopy(bank.accountNumber, "Account Number")
                            }
                            className="h-5 w-5 text-muted-foreground hover:text-foreground"
                            title="Copy Account Number"
                          >
                            {copiedField === "Account Number" ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {bank.ifsc && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">IFSC Code:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-semibold text-foreground">
                            {bank.ifsc}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(bank.ifsc, "IFSC Code")}
                            className="h-5 w-5 text-muted-foreground hover:text-foreground"
                            title="Copy IFSC Code"
                          >
                            {copiedField === "IFSC Code" ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {bank.branch && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Branch:</span>
                        <span className="text-foreground">{bank.branch}</span>
                      </div>
                    )}

                    {bank.upiId && (
                      <div className="flex items-center justify-between pt-1 border-t">
                        <span className="text-muted-foreground">UPI VPA:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-semibold text-primary">
                            {bank.upiId}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(bank.upiId, "UPI ID")}
                            className="h-5 w-5 text-muted-foreground hover:text-foreground"
                            title="Copy UPI ID"
                          >
                            {copiedField === "UPI ID" ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-3 text-center text-muted-foreground text-xs">
                    Bank details not configured for this billing entity. Please
                    use the Dynamic UPI QR code.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Payment Confirmation Section (Fixed at bottom) */}
        <div className="pt-2 border-t space-y-1.5 shrink-0">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-foreground block">
              Already transferred or paid via UPI?
            </span>
            <div className="flex items-center gap-2">
              <Input
                placeholder="12-digit UPI UTR / Reference No."
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                className="text-xs h-8 font-mono"
              />
              <Button
                onClick={handleConfirm}
                disabled={isConfirming}
                size="sm"
                className="h-8 text-xs shrink-0 gap-1.5 shadow-xs"
              >
                {isConfirming ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                )}
                Confirm Payment
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
            <span>
              Zero intermediary transaction fees • Direct settlement into firm account
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
