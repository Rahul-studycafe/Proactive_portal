"use client";

import { useState } from "react";
import {
  CreditCard,
  Download,
  IndianRupee,
  Receipt as ReceiptIcon,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Building2,
  Calendar,
  Wallet,
  Loader2,
  QrCode,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetPortalInvoicesQuery,
  useGetPortalReceiptsQuery,
  useGetPortalLedgerQuery,
} from "@/lib/services/api";
import { formatDate } from "@/lib/utils";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { OnlineCheckoutModal } from "@/components/portal/OnlineCheckoutModal";
import { PaymentSuccessModal } from "@/components/portal/PaymentSuccessModal";

export default function PortalBillingPage() {
  const { data: invoices = [], isLoading: isLoadingInvoices } = useGetPortalInvoicesQuery();
  const { data: receipts = [], isLoading: isLoadingReceipts } = useGetPortalReceiptsQuery();
  const { data: ledgerData, isLoading: isLoadingLedger } = useGetPortalLedgerQuery();

  const [activeTab, setActiveTab] = useState<"invoices" | "receipts" | "ledger">("invoices");
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);

  // Compute summary totals
  const totalBilled = invoices.reduce((acc: number, inv: any) => acc + (inv.grandTotal || 0), 0);
  const totalPaid = invoices.reduce((acc: number, inv: any) => acc + (inv.amountPaid || 0), 0);
  const totalDue = invoices.reduce((acc: number, inv: any) => acc + (inv.amountDue || 0), 0);
  const unpaidInvoices = invoices.filter((inv: any) => inv.amountDue > 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 text-[11px] gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Paid
          </Badge>
        );
      case "Partially Paid":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 text-[11px] gap-1">
            <Clock className="h-3 w-3 text-amber-600" /> Partially Paid
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 text-[11px] gap-1">
            <AlertCircle className="h-3 w-3 text-rose-600" /> Unpaid
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Invoices & Billing" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Invoices & Billing
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review professional service bills, download official GST tax invoices, inspect payment receipts, and verify statements.
          </p>
        </div>
      </div>

      {/* Financial Summary Cards (Phase F-128) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/80 shadow-xs bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Professional Outlay
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground flex items-center">
              ₹{totalBilled.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            Cumulative itemized fee invoices billed to date.
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Settled Payments
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              ₹{totalPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            Successfully received and credited receipts.
          </CardContent>
        </Card>

        <Card className={`border-border/80 shadow-xs ${totalDue > 0 ? "border-rose-300/80 bg-rose-50/20 dark:bg-rose-950/10" : "bg-card"}`}>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Outstanding Balance Due
            </CardDescription>
            <CardTitle className={`text-2xl font-bold flex items-center ${totalDue > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>
              ₹{totalDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            {totalDue > 0 ? "Action needed: Please settle outstanding invoices below." : "All accounts are clear and fully up to date."}
          </CardContent>
        </Card>
      </div>

      {/* Unpaid Invoices Quick Action Banner */}
      {unpaidInvoices.length > 0 && (
        <div className="p-4 rounded-xl border border-rose-300/60 bg-rose-500/10 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold">
                You have {unpaidInvoices.length} unpaid bill{unpaidInvoices.length > 1 ? "s" : ""} totaling ₹{totalDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Pay online using Dynamic NPCI UPI QR or bank transfer to avoid compliance filing delays.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setSelectedInvoice(unpaidInvoices[0])}
            className="gap-2 text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-xs shrink-0"
          >
            <QrCode className="h-3.5 w-3.5" /> Pay Invoice {unpaidInvoices[0].invoiceNo}
          </Button>
        </div>
      )}

      {/* Tabs Layout: Invoices, Receipts, Statement */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="invoices" className="text-xs">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="receipts" className="text-xs">Receipts ({receipts.length})</TabsTrigger>
          <TabsTrigger value="ledger" className="text-xs">Ledger Statement</TabsTrigger>
        </TabsList>

        {/* TAB 1: Invoices */}
        <TabsContent value="invoices" className="pt-4">
          <Card className="border-border/80 shadow-xs overflow-hidden">
            {isLoadingInvoices ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-16 px-4">
                <FileText className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <h3 className="text-sm font-semibold">No Invoices Issued</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Professional fee invoices will be posted here as work milestones are reached.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Invoice #</TableHead>
                    <TableHead className="text-xs font-semibold">Invoice Date</TableHead>
                    <TableHead className="text-xs font-semibold">Service Particulars</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Total (₹)</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Balance Due (₹)</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv: any) => (
                    <TableRow key={inv._id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-primary">
                        {inv.invoiceNo}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(inv.date)}
                      </TableCell>
                      <TableCell className="text-xs max-w-[240px] truncate" title={inv.itemsSummary}>
                        {inv.itemsSummary || "Statutory Professional Fees"}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-right">
                        ₹{(inv.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-right">
                        {inv.amountDue > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400">
                            ₹{inv.amountDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">₹0.00</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(inv.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.amountDue > 0 && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => setSelectedInvoice(inv)}
                              className="h-7 text-xs gap-1 shadow-xs"
                            >
                              <QrCode className="h-3 w-3" /> Pay
                            </Button>
                          )}
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                          >
                            <a href={`/api/v1/portal/invoices/${inv._id}/pdf`} target="_blank" rel="noreferrer">
                              <Download className="h-3 w-3" /> PDF
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        {/* TAB 2: Receipts */}
        <TabsContent value="receipts" className="pt-4">
          <Card className="border-border/80 shadow-xs overflow-hidden">
            {isLoadingReceipts ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : receipts.length === 0 ? (
              <div className="text-center py-16 px-4">
                <ReceiptIcon className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <h3 className="text-sm font-semibold">No Payment Receipts Found</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Official receipts are generated automatically upon confirmation of payment.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Receipt #</TableHead>
                    <TableHead className="text-xs font-semibold">Payment Date</TableHead>
                    <TableHead className="text-xs font-semibold">Mode</TableHead>
                    <TableHead className="text-xs font-semibold">Reference / UTR</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Amount Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((rct: any) => (
                    <TableRow key={rct._id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        {rct.receiptNo}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(rct.date)}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="text-[10px]">
                          {rct.paymentMode || "Bank Transfer"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {rct.referenceNumber || "—"}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-right text-emerald-600 dark:text-emerald-400">
                        ₹{(rct.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        {/* TAB 3: Statement of Account / Ledger */}
        <TabsContent value="ledger" className="pt-4">
          <Card className="border-border/80 shadow-xs overflow-hidden">
            {isLoadingLedger ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !ledgerData?.entries?.length ? (
              <div className="text-center py-16 px-4">
                <Wallet className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <h3 className="text-sm font-semibold">No Transactions Recorded</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Your running statement of account will appear here as debit invoices and credit receipts are logged.
                </p>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
                  <span className="text-xs font-semibold text-foreground">Closing Balance</span>
                  <span className="text-base font-bold text-foreground">
                    ₹{(ledgerData.closingBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="text-xs font-semibold">Date</TableHead>
                      <TableHead className="text-xs font-semibold">Reference Document</TableHead>
                      <TableHead className="text-xs font-semibold">Description</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Debit (₹)</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Credit (₹)</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Running Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerData.entries.map((e: any, idx: number) => (
                      <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(e.date)}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-medium">
                          {e.refNumber || e.type}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {e.particulars || e.notes || "Professional fees / receipt"}
                        </TableCell>
                        <TableCell className="text-xs text-right font-medium">
                          {e.debit > 0 ? `₹${e.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
                        </TableCell>
                        <TableCell className="text-xs text-right font-medium text-emerald-600 dark:text-emerald-400">
                          {e.credit > 0 ? `₹${e.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
                        </TableCell>
                        <TableCell className="text-xs text-right font-bold">
                          ₹{(e.balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Digital Payment & Checkout Modal (Phase F-133) */}
      <OnlineCheckoutModal
        invoice={selectedInvoice}
        open={!!selectedInvoice}
        onOpenChange={(open) => {
          if (!open) setSelectedInvoice(null);
        }}
        onPaymentSuccess={(receipt) => {
          setSelectedInvoice(null);
          setSuccessReceipt(receipt);
        }}
      />

      {/* Payment Success Celebration Modal (Phase F-134) */}
      <PaymentSuccessModal
        receipt={successReceipt}
        open={!!successReceipt}
        onOpenChange={(open) => {
          if (!open) setSuccessReceipt(null);
        }}
      />
    </div>
  );
}

