"use client";

import { useState } from "react";
import {
  HelpCircle,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Loader2,
  Calendar,
  User,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import {
  useGetPortalQueryTicketsQuery,
  useCreatePortalQueryTicketMutation,
} from "@/lib/services/api";
import { formatDate } from "@/lib/utils";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

const TICKET_CATEGORIES = [
  { value: "Service Request", label: "New Service Request (GST, Trademark, DSC, ROC)" },
  { value: "Query", label: "Tax Notice / Statutory Query" },
  { value: "Billing Inquiry", label: "Invoice & Payment Question" },
  { value: "Document Submission", label: "Document or Certificate Clarification" },
  { value: "Other", label: "General Advisory" },
];

export default function PortalSupportPage() {
  const { data: tickets = [], isLoading } = useGetPortalQueryTicketsQuery();
  const [createTicket, { isLoading: isCreating }] = useCreatePortalQueryTicketMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ticketCategory, setTicketCategory] = useState("Service Request");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please enter both subject and message");
      return;
    }

    try {
      await createTicket({
        type: ticketCategory,
        subject: subject.trim(),
        message: message.trim(),
      }).unwrap();

      toast.success("Query submitted! Your assigned accountant will respond shortly.");
      setSubject("");
      setMessage("");
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.data?.message || "Failed to submit query");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Resolved":
      case "Closed":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 gap-1 text-[11px]">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Resolved
          </Badge>
        );
      case "In Review":
      case "In Progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 gap-1 text-[11px]">
            <Clock className="h-3 w-3 text-blue-600" /> In Review
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 gap-1 text-[11px]">
            <AlertCircle className="h-3 w-3 text-amber-600" /> Open
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Support & Queries" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Service Requests & Queries
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Submit new statutory compliance requests or ask questions to your designated advisory accountants.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2 text-xs shadow-xs"
        >
          <Plus className="h-4 w-4" /> New Service Request / Query
        </Button>
      </div>

      {/* Tickets List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tickets.length === 0 ? (
        <Card className="p-16 text-center border-dashed">
          <MessageSquare className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-sm font-semibold">No Support Tickets Raised</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Need to add a new company, file an ad-hoc trademark, or inquire about an IT notice? Click below to request.
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            size="sm"
            className="mt-4 gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Submit First Request
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((t: any) => (
            <Card key={t._id} className="border-border/80 shadow-xs bg-card hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-primary">{t.ticketNo}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {t.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      {t.subject}
                    </CardTitle>
                  </div>
                  {getStatusBadge(t.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs pt-0">
                <p className="text-muted-foreground bg-muted/20 p-3 rounded-lg text-xs leading-relaxed">
                  {t.message}
                </p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Submitted on {formatDate(t.createdAt)}
                  </span>
                  {t.status === "Open" && (
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      Under review by practice team
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Query / Request Modal (Phase F-130) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" /> Submit Service Request or Query
            </DialogTitle>
            <DialogDescription className="text-xs">
              Your inquiry will be logged directly into the firm practice management queue.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTicket} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Request Category</Label>
              <Select value={ticketCategory} onValueChange={setTicketCategory}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-xs">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ticket-subject" className="text-xs font-semibold">Subject / Title *</Label>
              <Input
                id="ticket-subject"
                required
                placeholder="e.g. Need assistance with MCA AGM filing"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ticket-message" className="text-xs font-semibold">Description / Particulars *</Label>
              <Textarea
                id="ticket-message"
                required
                rows={4}
                placeholder="Please describe the requirement or question in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isCreating}
                className="gap-1.5 text-xs shadow-xs"
              >
                {isCreating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Submit Request
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

