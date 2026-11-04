"use client";

import Link from "next/link";
import {
  Building2,
  CalendarDays,
  Files,
  CreditCard,
  ArrowUpRight,
  UploadCloud,
  FileUp,
  Receipt,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Palmtree,
  Loader2,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useGetPortalProfileQuery,
  useGetComplianceCalendarQuery,
  useGetPortalDocumentsQuery,
  useGetPortalInvoicesQuery,
  useGetPortalDocumentRequestsQuery,
  useGetPortalOutlaysQuery,
} from "@/lib/services/api";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function PortalOverviewPage() {
  const { data: profileData, isLoading: loadingProfile } = useGetPortalProfileQuery();
  const { data: complianceList = [], isLoading: loadingCompliance } = useGetComplianceCalendarQuery();
  const { data: documents = [], isLoading: loadingDocs } = useGetPortalDocumentsQuery();
  const { data: invoices = [], isLoading: loadingInvoices } = useGetPortalInvoicesQuery();
  const { data: docRequests = [], isLoading: loadingRequests } = useGetPortalDocumentRequestsQuery();
  const { data: outlays = [], isLoading: loadingOutlays } = useGetPortalOutlaysQuery();

  const client = profileData?.client;
  const user = profileData?.user;
  const practice = profileData?.practice;

  // Calculate totals
  const totalBilled = invoices.reduce(
    (acc: number, inv: any) => acc + (inv.grandTotal || 0),
    0
  );
  const totalPaid = invoices.reduce(
    (acc: number, inv: any) => acc + (inv.amountPaid || 0),
    0
  );
  const totalDue = invoices.reduce(
    (acc: number, inv: any) => acc + (inv.amountDue ?? inv.balanceDue ?? 0),
    0
  );
  const unpaidInvoices = invoices.filter(
    (inv: any) => (inv.amountDue ?? inv.balanceDue ?? 0) > 0
  );
  const unbilledOutlays = outlays.filter((o: any) => !o.isBilled);
  const unbilledOutlaysTotal = unbilledOutlays.reduce(
    (acc: number, o: any) => acc + (o.amount || 0),
    0
  );
  const pendingFilings = complianceList.filter(
    (c: any) => c.status !== "Filed" && c.status !== "Completed"
  );
  const pendingRequests = docRequests.filter(
    (r: any) => r.status !== "Fulfilled" && r.status !== "Completed"
  );

  const cards = [
    {
      label: "Statutory Milestones",
      value: pendingFilings.length.toString(),
      icon: CalendarDays,
      delta: `${complianceList.length} total obligations`,
      tone: "text-primary",
      href: "/compliance",
    },
    {
      label: "Filed Documents Vault",
      value: documents.length.toString(),
      icon: Files,
      delta: "Returns & Certificates",
      tone: "text-emerald-500",
      href: "/documents",
    },
    {
      label: "Outstanding Balance",
      value: formatCurrency(totalDue),
      icon: CreditCard,
      delta:
        totalDue > 0
          ? `${unpaidInvoices.length} unpaid bill(s)`
          : "All bills settled",
      tone: totalDue > 0 ? "text-rose-500" : "text-emerald-500",
      href: "/billing",
    },
    {
      label: "Document Requests",
      value: pendingRequests.length.toString(),
      icon: FileUp,
      delta:
        pendingRequests.length > 0
          ? "Requested by CA team"
          : "All requests fulfilled",
      tone: "text-amber-500",
      href: "/requests",
    },
  ];

  if (loadingProfile || loadingCompliance || loadingDocs || loadingInvoices) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-card rounded-2xl border border-border" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={`loading-stat-${i}`} className="h-28 bg-card rounded-xl border border-border" />
          ))}
        </div>
        <div className="h-32 bg-card rounded-xl border border-border" />
      </div>
    );
  }

  const upcomingFiling = complianceList.find(
    (c: any) => c.status !== "Completed" && c.status !== "Filed"
  ) || complianceList[0];

  return (
    <div className="space-y-6">
      {/* ─── Hero Welcome Banner ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary/10 via-primary/5 to-transparent border border-primary/15 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold"
              >
                Client Portal Active
              </Badge>
              {user?.isPrimaryContact && (
                <Badge variant="secondary" className="text-xs">
                  Primary Representative
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Welcome back, {user?.name || "Client"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Your real-time statutory compliance workspace for{" "}
              <strong className="text-foreground">{client?.name}</strong>. Access
              filed returns, monitor upcoming tax milestones, and settle professional
              invoices with instant digital receipts.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Link href="/billing">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
                <span>Pay Invoices</span>
              </Button>
            </Link>
            <Link href="/requests">
              <Button
                size="sm"
                className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
              >
                <UploadCloud className="h-3.5 w-3.5 text-primary-foreground" />
                <span>Upload Documents</span>
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <User className="h-3.5 w-3.5" />
                <span>Account Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      {upcomingFiling && (
        <div className="flex items-center justify-between rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-2.5 text-xs text-sky-800 dark:text-sky-300">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>
              Active Filing Milestone:{" "}
              <strong className="font-semibold text-foreground">
                {upcomingFiling.complianceName || upcomingFiling.title}
              </strong>{" "}
              (Due {upcomingFiling.dueDate ? formatDate(upcomingFiling.dueDate) : "16 Oct 2026"})
            </span>
          </div>
          <Link
            href="/compliance"
            className="font-medium hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View Calendar</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* 1. Quick Stats Ribbon (4 Cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              className="group rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/50 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {c.label}
                </span>
                <div className="p-2 rounded-lg bg-muted/60">
                  <Icon className={`h-4 w-4 ${c.tone}`} />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {c.value}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span className="text-[11px]">{c.delta}</span>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Client Billing & Settlement Overview Bar */}
      <div className="rounded-xl border border-border/70 bg-card p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  Billing & Settlement Overview
                </h2>
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {invoices.length} invoices
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Itemized professional fee bills, advance credits, and settled receipts
              </p>
            </div>
          </div>
          <Link
            href="/billing"
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View All Invoices</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-3">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/60 bg-muted/20">
            <div className="h-7 w-7 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Receipt className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight text-foreground">
                {formatCurrency(totalBilled)}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Total Billed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/60 bg-muted/20">
            <div className="h-7 w-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalPaid)}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Total Settled
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/60 bg-muted/20">
            <div className={`h-7 w-7 rounded-md ${totalDue > 0 ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"} flex items-center justify-center shrink-0`}>
              <CreditCard className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-bold tracking-tight ${totalDue > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {formatCurrency(totalDue)}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Outstanding Balance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/60 bg-muted/20">
            <div className="h-7 w-7 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight text-purple-600 dark:text-purple-400">
                {totalBilled > 0 ? `${Math.round((totalPaid / totalBilled) * 100)}%` : "100%"}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Settlement Rate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Row Grid: Profile + Compliance (7 cols) & Invoices + Firm Info (5 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column (7 Columns / ~60%) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          {/* Registered Company Profile Card */}
          <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  Registered Company Profile
                </h2>
              </div>
              <span className="font-mono text-[11px] rounded bg-muted px-2 py-0.5 text-muted-foreground border">
                {client?.fileNo || "F-2026-007"}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[11px] text-muted-foreground block uppercase font-medium">
                  Entity Type
                </span>
                <span className="text-xs font-semibold text-foreground mt-0.5 block">
                  {client?.entityType || "Private Limited"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block uppercase font-medium">
                  Permanent Account Number (PAN)
                </span>
                <span className="font-mono text-xs font-semibold text-foreground mt-0.5 block">
                  {client?.pan || "AACZ78901J"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block uppercase font-medium">
                  GSTIN
                </span>
                <span className="font-mono text-xs font-semibold text-foreground mt-0.5 block truncate">
                  {client?.gstin || "27AACZ78901J1Z4"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block uppercase font-medium">
                  Client File Ref.
                </span>
                <span className="text-xs font-semibold text-foreground mt-0.5 block">
                  {client?.fileNo || "F-2026-007"}
                </span>
              </div>
            </div>
          </div>

          {/* Statutory Filing Milestones Card */}
          <div className="rounded-xl border bg-card shadow-sm flex flex-col">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">
                    Statutory Filing Milestones
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Track upcoming statutory tax dates, GST returns, and advance taxes
                  </p>
                </div>
              </div>
              <Link
                href="/compliance"
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
              >
                <span>View Full Calendar</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="divide-y p-0">
              {complianceList.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No compliance obligations registered yet.
                </div>
              ) : (
                complianceList.slice(0, 3).map((item: any, idx: number) => {
                  const itemKey = item.taskId || item._id || item.complianceName || `milestone-${idx}`;
                  const title = item.complianceName || item.title || "Statutory Obligation";
                  const dueDate = item.dueDate ? new Date(item.dueDate) : null;

                  return (
                    <div
                      key={itemKey}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/10 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex flex-col items-center justify-center h-10 w-10 rounded-lg border bg-muted/30 font-mono shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {dueDate ? dueDate.getDate() : "16"}
                          </span>
                          <span className="text-[9px] text-muted-foreground uppercase">
                            {dueDate
                              ? dueDate.toLocaleString("en-US", {
                                  month: "short",
                                })
                              : "OCT"}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-foreground truncate">
                            {title}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Due: {item.dueDate ? formatDate(item.dueDate) : "-"} &bull;{" "}
                            {item.period || item.frequency || "Monthly"}
                          </div>
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-[10px] shrink-0 ${
                          item.status === "Completed" || item.status === "Filed"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 font-medium"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-600 font-medium"
                        }`}
                      >
                        {item.status || "Pending"}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 Columns / ~40%) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Invoices Card */}
          <div className="rounded-xl border bg-card shadow-sm flex flex-col">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">
                    Recent Invoices
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Direct online settlement
                  </p>
                </div>
              </div>
              <Link
                href="/billing"
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
              >
                <span>Billing</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="divide-y">
              {invoices.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No professional fee invoices found.
                </div>
              ) : (
                invoices.slice(0, 3).map((inv: any, idx: number) => {
                  const invKey = inv._id || inv.invoiceNo || `invoice-${idx}`;
                  return (
                    <div
                      key={invKey}
                      className="flex items-center justify-between px-5 py-3 hover:bg-muted/10 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <Link
                          href="/billing"
                          className="font-mono text-xs font-semibold hover:underline text-foreground block truncate"
                        >
                          {inv.invoiceNo}
                        </Link>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {formatDate(inv.date)}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-xs font-semibold">
                          {formatCurrency(inv.grandTotal)}
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] mt-0.5 ${
                            inv.status === "Paid"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {inv.status || "Unpaid"}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chartered Accountancy Firm Card */}
          <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b pb-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  Chartered Accountancy Firm
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Direct support and consultation team
                </p>
              </div>
            </div>
            <div className="space-y-2 pt-1">
              <div className="text-sm font-bold text-foreground">
                {practice?.name || "Rahul and co"}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For urgent compliances, tax assessments, or statutory document filing, reach out directly to your assigned engagement partner.
              </p>
              <div className="pt-2">
                <Link href="/support">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Contact Advisory Team
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
