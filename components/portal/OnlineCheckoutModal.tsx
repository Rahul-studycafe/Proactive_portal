"use client";

import { useState } from "react";
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  ArrowRight,
  Smartphone,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DynamicUPIQRCode } from "@/components/invoices/DynamicUPIQRCode";
import { useCreateInvoicePaymentLinkMutation } from "@/lib/services/api";

interface OnlineCheckoutModalProps {
  invoice: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess?: (receipt: any) => void;
}

export function OnlineCheckoutModal({
  invoice,
  open,
  onOpenChange,
  onPaymentSuccess,
}: OnlineCheckoutModalProps) {
  const [createPaymentLink, { isLoading: isGeneratingLink }] = useCreateInvoicePaymentLinkMutation();
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"upi" | "card">("upi");

  if (!invoice) return null;

  const handleGenerateLink = async () => {
    try {
      const res = await createPaymentLink(invoice._id).unwrap();
      setGeneratedLink(res.shortUrl);
      window.open(res.shortUrl, "_blank");
      toast.success("Payment checkout link opened in new tab");
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.data?.message || "Failed to generate payment link");
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.success("Payment link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSimulateDirectPayment = () => {
    onOpenChange(false);
    if (onPaymentSuccess) {
      onPaymentSuccess({
        receiptNo: `RCT-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: invoice.amountDue || invoice.grandTotal,
        invoiceNo: invoice.invoiceNo,
        date: new Date().toISOString(),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              Invoice #{invoice.invoiceNo}
            </Badge>
            <span className="text-base font-bold text-foreground">
              ₹{(invoice.amountDue || invoice.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <DialogTitle className="text-base font-bold mt-1">
            Secure Digital Payment
          </DialogTitle>
          <DialogDescription className="text-xs">
            Choose your preferred digital payment option below.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 text-xs">
            <TabsTrigger value="upi" className="gap-1.5">
              <QrCode className="h-3.5 w-3.5" /> Dynamic UPI QR
            </TabsTrigger>
            <TabsTrigger value="card" className="gap-1.5">
              <CreditCard className="h-3.5 w-3.5" /> Cards & NetBanking
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Dynamic UPI */}
          <TabsContent value="upi" className="pt-2 space-y-3">
            <DynamicUPIQRCode
              invoiceId={invoice._id}
              invoiceNo={invoice.invoiceNo}
              amountDue={invoice.amountDue || invoice.grandTotal}
            />

            <div className="text-center pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSimulateDirectPayment}
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                Already paid via UPI? Confirm transaction
              </Button>
            </div>
          </TabsContent>

          {/* TAB 2: Gateway Payment Link (Cards/NetBanking) */}
          <TabsContent value="card" className="pt-2 space-y-4 text-center">
            <div className="p-6 bg-muted/20 border rounded-xl space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Online Payment Gateway</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Pay securely using Credit Cards, Debit Cards, Corporate NetBanking, or EMI.
                </p>
              </div>

              {!generatedLink ? (
                <Button
                  onClick={handleGenerateLink}
                  disabled={isGeneratingLink}
                  className="w-full gap-2 text-xs shadow-xs"
                >
                  {isGeneratingLink ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                  Open Gateway Checkout
                </Button>
              ) : (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      asChild
                      className="flex-1 gap-2 text-xs shadow-xs"
                    >
                      <a href={generatedLink} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" /> Continue to Payment
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyLink}
                      className="h-9 w-9 shrink-0"
                      title="Copy link"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground">
              Protected by 256-Bit SSL encryption • Verified Merchant Settlement
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

