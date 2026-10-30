"use client";

import { useState } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Calendar,
  Loader2,
  Paperclip,
  ArrowRight,
  ShieldAlert,
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
import { toast } from "sonner";
import {
  useGetPortalDocumentRequestsQuery,
  useFulfillPortalDocumentRequestMutation,
} from "@/lib/services/api";
import { formatDate } from "@/lib/utils";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

export default function DocumentRequestsPage() {
  const { data: requests = [], isLoading } = useGetPortalDocumentRequestsQuery();
  const [fulfillRequest, { isLoading: isUploading }] = useFulfillPortalDocumentRequestMutation();

  const [activeRequest, setActiveRequest] = useState<any | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest || !selectedFile) {
      toast.error("Please select a document file to upload");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (selectedItem?._id) {
        formData.append("itemId", selectedItem._id);
      }

      await fulfillRequest({
        requestId: activeRequest._id,
        formData,
      }).unwrap();

      toast.success("Document uploaded successfully! Your advisory team has been notified.");
      setSelectedFile(null);
      setSelectedItem(null);
      setActiveRequest(null);
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.data?.message || "Failed to upload document");
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Document Requests" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Document Requests & Uploads
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Fulfill document requirements dispatched by your accounting team for tax verification, GST audits, or KYC.
          </p>
        </div>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <Card className="p-16 text-center border-dashed">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold">No Pending Document Requests</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            You are completely caught up! When your accountant requires records (like bank statements or vouchers), requests will appear here.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req: any) => {
            const completedCount = (req.items || []).filter((it: any) => it.status === "Uploaded").length;
            const totalCount = (req.items || []).length || 1;
            const isFinished = completedCount === totalCount;

            return (
              <Card key={req._id} className="border-border/80 shadow-xs bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={isFinished ? "outline" : "secondary"} className="text-[11px]">
                      {req.status}
                    </Badge>
                    {req.dueDate && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Due {formatDate(req.dueDate)}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-sm font-bold mt-2">
                    {req.title || "Document Submission Request"}
                  </CardTitle>
                  {req.notes && (
                    <CardDescription className="text-xs">
                      {req.notes}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-3 text-xs pt-0">
                  <div className="space-y-1.5 border-t pt-2">
                    <span className="font-semibold text-foreground text-[11px] block">
                      Requested Items ({completedCount}/{totalCount} Completed):
                    </span>
                    {(req.items || []).map((it: any) => (
                      <div
                        key={it._id}
                        className="flex items-center justify-between p-2 rounded-lg border bg-muted/20 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {it.status === "Uploaded" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                          )}
                          <span className={it.status === "Uploaded" ? "line-through text-muted-foreground" : "font-medium"}>
                            {it.name || it.documentName || "Document Item"}
                          </span>
                        </div>

                        {it.status !== "Uploaded" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveRequest(req);
                              setSelectedItem(it);
                            }}
                            className="h-7 text-[11px] gap-1"
                          >
                            <UploadCloud className="h-3 w-3" /> Upload
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50 border-emerald-200">
                            Uploaded
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload File Dialog (Phase F-129) */}
      <Dialog
        open={!!activeRequest}
        onOpenChange={() => {
          setActiveRequest(null);
          setSelectedFile(null);
          setSelectedItem(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-primary" /> Fulfill Document Request
            </DialogTitle>
            <DialogDescription className="text-xs">
              Item: <strong>{selectedItem?.name || selectedItem?.documentName || activeRequest?.title}</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-4 py-2 text-xs">
            <div className="border-2 border-dashed border-border/80 rounded-xl p-6 text-center hover:bg-muted/20 transition-colors">
              <input
                id="doc-file-input"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                required
              />
              <label htmlFor="doc-file-input" className="cursor-pointer space-y-2 block">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
                  <Paperclip className="h-6 w-6" />
                </div>
                {selectedFile ? (
                  <div>
                    <p className="font-semibold text-foreground text-xs">{selectedFile.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-foreground text-xs">
                      Click to choose file or drag & drop here
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      PDF, Excel, Word, Scanned JPG up to 25MB
                    </p>
                  </div>
                )}
              </label>
            </div>

            <Button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="w-full gap-2 text-xs shadow-xs"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              Submit Document for Verification
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

