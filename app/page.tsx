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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useGetPortalProfileQuery,
  useGetComplianceCalendarQuery,
  useGetPortalDocumentsQuery,
  useGetPortalInvoicesQuery,
  useGetPortalDocumentRequestsQuery,
} from "@/lib/services/api";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function PortalOverviewPage() {
  const { data: profileData, isLoading: loadingProfile } = useGetPortalProfileQuery();
  const { data: complianceList = [], isLoading: loadingCompliance } = useGetComplianceCalendarQuery();
  const { data: documents = [], isLoading: loadingDocs } = useGetPortalDocumentsQuery();
  const { data: invoices = [], isLoading: loadingInvoices } = useGetPortalInvoicesQuery();
  const { data: docRequests = [], isLoading: loadingRequests } = useGetPortalDocumentRequestsQuery();

  const client = profileData?.client;
  const user = profileData?.user;
  const practice = profileData?.practice;

  // Calculate totals
  const totalDue = invoices.reduce(
    (acc: number, inv: any) =>
      acc + (inv.balanceDue ?? (inv.grandTotal - (inv.amountPaid || 0))),
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
      label: "Total Receivables",
      value: formatCurrency(totalDue),
      icon: TrendingUp,
      delta: totalDue > 0 ? `${invoices.length} total invoice(s)` : "Collections healthy",
      tone: "text-purple-500",
      href: "/billing",
    },
    {
      label: "Pending Outlays",
      value: pendingRequests.length.toString(),
      icon: FileUp,
      delta: "Requested by CA team",
      tone: "text-amber-500",
      href: "/requests",
    },
  ];

  if (loadingProfile || loadingCompliance || loadingDocs || loadingInvoices) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-card rounded-xl border border-border" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-card rounded-xl border border-border" />
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
      {/* Top Header Command Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Client Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Unified statutory compliance, document returns & digital billing hub.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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
                {upcomingFiling.title}
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

      {/* Practice Outlays KPI & Expense Summary Bar */}
      <div className="rounded-xl border border-border/70 bg-card p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  Practice Outlays & Reimbursables
                </h2>
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {invoices.length} records
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Government challans, court stampings, and client-reimbursable expenses
              </p>
            </div>
          </div>
          <Link
            href="/billing"
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Master Outlays Directory</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-3">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/60 bg-muted/20">
            <div className="h-7 w-7 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <CreditCard className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight text-foreground">
                {formatCurrency(totalDue)}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Total Outlays
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/60 bg-muted/20">
            <div className="h-7 w-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                ₹0
              </p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Billed Recoveries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/60 bg-muted/20">
            <div className="h-7 w-7 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight text-amber-600 dark:text-amber-400">
                {formatCurrency(totalDue)}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Unbilled Exposure
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/60 bg-muted/20">
            <div className="h-7 w-7 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight text-purple-600 dark:text-purple-400">
                0%
              </p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Recovery Rate
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
                complianceList.slice(0, 3).map((item: any) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex flex-col items-center justify-center h-10 w-10 rounded-lg border bg-muted/30 font-mono shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {item.dueDate ? new Date(item.dueDate).getDate() : "16"}
                        </span>
                        <span className="text-[9px] text-muted-foreground uppercase">
                          {item.dueDate
                            ? new Date(item.dueDate).toLocaleString("en-US", {
                                month: "short",
                              })
                            : "OCT"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-foreground truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Due: {item.dueDate ? formatDate(item.dueDate) : "-"} &bull;{" "}
                          {item.frequency || "Monthly"}
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
                ))
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
                invoices.slice(0, 3).map((inv: any) => (
                  <div
                    key={inv._id}
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
                ))
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
