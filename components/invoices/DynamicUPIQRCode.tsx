"use client";

import { useState } from "react";
import {
  QrCode,
  Copy,
  Check,
  Download,
  Smartphone,
  Loader2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useGetInvoiceUpiQrQuery } from "@/lib/services/api";

interface DynamicUPIQRCodeProps {
  invoiceId?: string;
  invoiceNo?: string;
  amountDue?: number;
  qrData?: any;
  isLoading?: boolean;
}

export function DynamicUPIQRCode({
  invoiceId,
  invoiceNo,
  amountDue,
  qrData: customQrData,
  isLoading: customLoading,
}: DynamicUPIQRCodeProps) {
  const { data: fetchedQrData, isLoading: fetchLoading, error: fetchError } = useGetInvoiceUpiQrQuery(
    invoiceId || "",
    { skip: !invoiceId || !!customQrData }
  );

  const qrData = customQrData || fetchedQrData;
  const isLoading = customLoading !== undefined ? customLoading : fetchLoading;
  const error = customQrData ? null : fetchError;
  const [copied, setCopied] = useState(false);

  const qrImageUrl = qrData?.qrDataUrl || qrData?.qrBase64;
  const upiId = qrData?.upiId || qrData?.upiVpa;
  const npciUri = qrData?.npciUri || qrData?.upiUri;
  const payableAmount = amountDue ?? qrData?.amount ?? qrData?.amountDue ?? 0;

  const handleCopyUpi = () => {
    if (upiId) {
      navigator.clipboard.writeText(upiId);
      setCopied(true);
      toast.success("UPI ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQr = () => {
    if (qrImageUrl) {
      const a = document.createElement("a");
      a.href = qrImageUrl;
      a.download = `UPI-QR-${invoiceNo || invoiceId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("QR code downloaded");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-5 bg-card border rounded-xl space-y-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Generating Dynamic UPI QR...</span>
      </div>
    );
  }

  if (error || !qrData || !qrImageUrl) {
    return (
      <div className="p-3 bg-muted/40 border border-dashed rounded-xl text-center text-xs text-muted-foreground space-y-1">
        <QrCode className="h-5 w-5 mx-auto text-muted-foreground/60" />
        <p className="font-medium text-foreground">Direct Bank Transfer</p>
        <p className="text-[11px]">Direct UPI not yet configured for this billing entity.</p>
      </div>
    );
  }

  return (
    <div className="p-3 bg-muted/20 border border-border/70 rounded-xl space-y-2 text-center text-xs">
      {/* QR Code Image */}
      <div className="p-1.5 bg-white rounded-lg border inline-block mx-auto shadow-xs">
        {qrImageUrl ? (
          <img
            src={qrImageUrl}
            alt="UPI QR Code"
            className="h-32 w-32 object-contain mx-auto"
          />
        ) : (
          <div className="h-32 w-32 flex items-center justify-center text-muted-foreground">
            <QrCode className="h-16 w-16" />
          </div>
        )}
      </div>

      {/* VPA Copy Pill */}
      {upiId && (
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-mono text-[11px] text-muted-foreground bg-background/80 border px-2 py-0.5 rounded">
            {upiId}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyUpi}
            className="h-5 w-5 text-muted-foreground hover:text-foreground"
            title="Copy UPI ID"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-2 pt-0.5">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadQr}
          className="h-6 text-[11px] px-2.5 gap-1"
        >
          <Download className="h-3 w-3" /> Save QR
        </Button>
        {npciUri && (
          <Button
            asChild
            size="sm"
            variant="default"
            className="h-6 text-[11px] px-2.5 gap-1"
          >
            <a href={npciUri}>
              <Smartphone className="h-3 w-3" /> Pay with App
            </a>
          </Button>
        )}
      </div>

      {/* Supported Apps Footer */}
      <div className="pt-1.5 border-t border-border/50 text-[10px] text-muted-foreground flex items-center justify-center gap-1.5">
        <span>Supported:</span>
        <span className="font-medium text-foreground/80">GPay • PhonePe • Paytm • BHIM</span>
      </div>
    </div>
  );
}

