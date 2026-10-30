"use client";

import { useState } from "react";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Info,
  ShieldCheck,
  FileText,
  Building2,
  CalendarDays,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetComplianceCalendarQuery } from "@/lib/services/api";
import { formatDate } from "@/lib/utils";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ComplianceCalendarPage() {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeItem, setActiveItem] = useState<any | null>(null);

  const { data: timeline = [], isLoading } = useGetComplianceCalendarQuery({
    year: selectedYear,
    month: selectedMonth,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 gap-1 text-[11px]">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Filed / Completed
          </Badge>
        );
      case "In Progress":
      case "Under Review":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 gap-1 text-[11px]">
            <Clock className="h-3 w-3 text-amber-600" /> In Verification
          </Badge>
        );
      case "Overdue":
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 gap-1 text-[11px]">
            <AlertTriangle className="h-3 w-3 text-rose-600" /> Overdue
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 gap-1 text-[11px]">
            <CalendarDays className="h-3 w-3 text-blue-600" /> Upcoming Filing
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Compliance Calendar" },
        ]}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Compliance Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Transparent tracking of government filings (GST, TDS, Income Tax, ROC) and statutory acknowledgment milestones.
          </p>
        </div>

        {/* Month Switcher Controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-card rounded-md border text-xs font-semibold">
            <span>{MONTH_NAMES[selectedMonth - 1]}</span>
            <span>{selectedYear}</span>
          </div>

          <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-xl border">
        <div className="flex items-center gap-1.5">
          <Filter className="h-4 w-4 text-muted-foreground mr-1" />
          <Button
            variant={statusFilter === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("all")}
            className="h-7 text-xs"
          >
            All Milestones
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("pending")}
            className="h-7 text-xs"
          >
            Pending / Action Required
          </Button>
          <Button
            variant={statusFilter === "completed" ? "default" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("completed")}
            className="h-7 text-xs"
          >
            Filed & Completed
          </Button>
        </div>

        <div className="text-xs text-muted-foreground font-medium">
          Showing <strong>{timeline.length}</strong> compliance events
        </div>
      </div>

      {/* Timeline Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : timeline.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3 opacity-80" />
          <h3 className="text-sm font-semibold text-foreground">No Compliance Deadlines for This Period</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            All statutory obligations for {MONTH_NAMES[selectedMonth - 1]} {selectedYear} are settled or none are scheduled.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timeline.map((item: any, idx: number) => (
            <Card
              key={item.taskId || idx}
              onClick={() => setActiveItem(item)}
              className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md border-border/80 bg-card group"
            >
              <CardHeader className="pb-2.5">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider">
                    {item.serviceCategory}
                  </Badge>
                  {getStatusBadge(item.status)}
                </div>
                <CardTitle className="text-sm font-bold group-hover:text-primary transition-colors mt-2">
                  {item.complianceName}
                </CardTitle>
                {item.period && (
                  <CardDescription className="text-xs">
                    Period: {item.period}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="text-xs space-y-2 pt-1">
                <div className="flex items-center justify-between text-muted-foreground pt-2 border-t">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" /> Statutory Due Date:
                  </span>
                  <span className="font-semibold text-foreground">
                    {item.dueDate ? formatDate(item.dueDate) : "N/A"}
                  </span>
                </div>

                {item.completedAt && (
                  <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Filed Date:
                    </span>
                    <span className="font-semibold">
                      {formatDate(item.completedAt)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Compliance Particulars Dialog */}
      <Dialog open={!!activeItem} onOpenChange={() => setActiveItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">
                {activeItem?.serviceCategory}
              </Badge>
              {activeItem && getStatusBadge(activeItem.status)}
            </div>
            <DialogTitle className="text-base font-bold">
              {activeItem?.complianceName}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Statutory filing metadata and compliance tracking log.
            </DialogDescription>
          </DialogHeader>

          {activeItem && (
            <div className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border bg-muted/20">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Due Date:</span>
                  <span className="font-semibold text-foreground">{formatDate(activeItem.dueDate)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Period / Cycle:</span>
                  <span className="font-semibold text-foreground">{activeItem.period || "Monthly"}</span>
                </div>
              </div>

              {activeItem.completedAt ? (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Return Filed Successfully
                  </div>
                  <p className="text-[11px]">
                    Filed on {formatDate(activeItem.completedAt)}. You can download the government acknowledgment from the <strong>Filed Documents</strong> vault.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Info className="h-4 w-4" /> Assigned CA Advisory Team
                  </div>
                  <p className="text-[11px]">
                    Our accountants are preparing your computation. If documents are requested, check the <strong>Document Requests</strong> tab.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

