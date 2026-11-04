"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  useGetPortalInvoicesQuery,
  useGetPortalReceiptsQuery,
  useGetPortalLedgerQuery,
  useGetPortalOutlaysQuery,
} from "@/lib/services/api";
import { formatDate } from "@/lib/utils";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { OnlineCheckoutModal } from "@/components/portal/OnlineCheckoutModal";
import { PaymentSuccessModal } from "@/components/portal/PaymentSuccessModal";

export type BillingTab = "invoices" | "receipts" | "outlays" | "ledger";

interface BillingViewProps {
  activeTab: BillingTab;
}

export function BillingView({ activeTab }: BillingViewProps) {
  const router = useRouter();
  const { data: invoices = [], isLoading: isLoadingInvoices } = useGetPortalInvoicesQuery();
  const { data: receipts = [], isLoading: isLoadingReceipts } = useGetPortalReceiptsQuery();
  const { data: ledgerData, isLoading: isLoadingLedger } = useGetPortalLedgerQuery();
  const { data: outlays = [], isLoading: isLoadingOutlays } = useGetPortalOutlaysQuery();

  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [selectedOutlay, setSelectedOutlay] = useState<any | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);

  // Compute summary totals
  const totalBilled = invoices.reduce((acc: number, inv: any) => acc + (inv.grandTotal || 0), 0);
  const totalPaid = invoices.reduce((acc: number, inv: any) => acc + (inv.amountPaid || 0), 0);
  const totalDue = invoices.reduce((acc: number, inv: any) => acc + (inv.amountDue || 0), 0);
  const unpaidInvoices = invoices.filter((inv: any) => (inv.amountDue || 0) > 0);
  const unbilledOutlays = outlays.filter((o: any) => !o.isBilled);
  const unbilledOutlaysTotal = unbilledOutlays.reduce((acc: number, o: any) => acc + (o.amount || 0), 0);

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

  const tabLabels: Record<BillingTab, string> = {
    invoices: "Invoices",
    receipts: "Receipts",
    outlays: "Outlays & Reimbursables",
    ledger: "Statement Ledger",
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Invoices & Billing", href: "/billing/invoices" },
          { label: tabLabels[activeTab] },
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

      {/* Financial Summary Cards */}
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
            {totalDue > 0
              ? "Action needed: Please settle outstanding invoices below."
              : "All issued invoices are completely settled."}
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Balance Banner */}
      {totalDue > 0 && unpaidInvoices.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-rose-200 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/20 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-900 dark:text-rose-200">
                You have {unpaidInvoices.length} unpaid bill{unpaidInvoices.length > 1 ? "s" : ""} totaling ₹{totalDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-300/70">
                Pay online using Dynamic NPCI UPI QR or bank transfer to avoid compliance filing delays.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setSelectedInvoice(unpaidInvoices[0])}
            className="text-xs shrink-0 gap-1.5 shadow-xs"
          >
            <QrCode className="h-3.5 w-3.5" /> Pay Invoice {unpaidInvoices[0]?.invoiceNo}
          </Button>
        </div>
      )}

      {/* Subpage Nav Tabs */}
      <div className="flex border-b border-border/80 space-x-1">
        <Link
          href="/billing/invoices"
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "invoices"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
          }`}
        >
          <FileText className="h-3.5 w-3.5" /> Invoices ({invoices.length})
        </Link>
        <Link
          href="/billing/receipts"
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "receipts"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
          }`}
        >
          <ReceiptIcon className="h-3.5 w-3.5" /> Receipts ({receipts.length})
        </Link>
        <Link
          href="/billing/outlays"
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "outlays"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
          }`}
        >
          <Wallet className="h-3.5 w-3.5" /> Outlays ({outlays.length})
          {unbilledOutlays.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
              {unbilledOutlays.length} Unbilled
            </span>
          )}
        </Link>
        <Link
          href="/billing/ledger"
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "ledger"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" /> Statement Ledger
        </Link>
      </div>

      {/* SECTION 1: INVOICES */}
      {activeTab === "invoices" && (
        <Card className="border-border/80 shadow-xs overflow-hidden">
          {isLoadingInvoices ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-16 px-4">
              <CreditCard className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="text-sm font-semibold">No Invoices Found</h3>
              <p className="text-xs text-muted-foreground mt-1">
                When professional fee invoices are raised, they will appear here.
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
                    <TableCell className="text-xs">
                      <span className="font-medium text-foreground block">
                        {inv.lineItems?.[0]?.description || "Professional Services"}
                      </span>
                      {inv.lineItems?.length > 1 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{inv.lineItems.length - 1} more item(s)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-right">
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
      )}

      {/* SECTION 2: RECEIPTS */}
      {activeTab === "receipts" && (
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
      )}

      {/* SECTION 3: OUTLAYS & REIMBURSABLES */}
      {activeTab === "outlays" && (
        <div className="space-y-4">
          {unbilledOutlays.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    You have {unbilledOutlays.length} pending reimbursable outlay{unbilledOutlays.length > 1 ? "s" : ""} totaling ₹{unbilledOutlaysTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-300/70">
                    These are official government challans, stamp fees, or statutory expenses paid on your behalf. Settle directly below.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setSelectedOutlay(unbilledOutlays[0])}
                className="text-xs shrink-0 gap-1.5 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <QrCode className="h-3.5 w-3.5" /> Pay Outlay {unbilledOutlays[0]?.expenseNo}
              </Button>
            </div>
          )}

          <Card className="border-border/80 shadow-xs overflow-hidden">
            {isLoadingOutlays ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : outlays.length === 0 ? (
              <div className="text-center py-16 px-4">
                <ReceiptIcon className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <h3 className="text-sm font-semibold">No Practice Outlays Recorded</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Government challans, court stampings, and statutory reimbursable expenses will be listed here.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Outlay #</TableHead>
                    <TableHead className="text-xs font-semibold">Date</TableHead>
                    <TableHead className="text-xs font-semibold">Category / Purpose</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Amount (₹)</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outlays.map((exp: any) => (
                    <TableRow key={exp._id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-foreground">
                        {exp.expenseNo}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(exp.date)}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="font-medium text-foreground block">
                          {exp.categoryName || "Miscellaneous Outlay"}
                        </span>
                        {exp.notes && (
                          <span className="text-[11px] text-muted-foreground block truncate max-w-[260px]">
                            {exp.notes}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-right">
                        ₹{(exp.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        {exp.isBilled ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 text-[11px] gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Settled / Billed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 text-[11px] gap-1">
                            <Clock className="h-3 w-3 text-amber-600" /> Unbilled Reimbursable
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!exp.isBilled && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => setSelectedOutlay(exp)}
                              className="h-7 text-xs gap-1 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <QrCode className="h-3 w-3" /> Pay Outlay
                            </Button>
                          )}
                          {exp.receiptUrl && (
                            <Button asChild variant="outline" size="sm" className="h-7 text-xs gap-1">
                              <a href={exp.receiptUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-3 w-3" /> Voucher
                              </a>
                            </Button>
                          )}
                          {exp.isBilled && !exp.receiptUrl && (
                            <span className="text-xs text-muted-foreground font-mono">—</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      )}

      {/* SECTION 4: STATEMENT OF ACCOUNT / LEDGER */}
      {activeTab === "ledger" && (
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
      )}

      {/* Digital Payment & Checkout Modal (Invoices & Outlays) */}
      <OnlineCheckoutModal
        invoice={selectedInvoice}
        outlay={selectedOutlay}
        open={!!selectedInvoice || !!selectedOutlay}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedInvoice(null);
            setSelectedOutlay(null);
          }
        }}
        onPaymentSuccess={(receipt) => {
          setSelectedInvoice(null);
          setSelectedOutlay(null);
          setSuccessReceipt(receipt);
        }}
      />

      {/* Payment Success Celebration Modal */}
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

