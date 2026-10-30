"use client";

import { useState } from "react";
import {
  FolderOpen,
  FileText,
  Download,
  Search,
  Filter,
  Eye,
  FileSpreadsheet,
  FileArchive,
  FileCheck,
  ShieldCheck,
  Calendar,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useGetPortalDocumentsQuery } from "@/lib/services/api";
import { formatDate } from "@/lib/utils";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

const FOLDER_CATEGORIES = [
  { id: "all", label: "All Returns & Vault", icon: FolderOpen },
  { id: "GST", label: "GST Returns (3B, 1)", icon: FileCheck },
  { id: "Income Tax", label: "Income Tax & ITR-V", icon: FileText },
  { id: "ROC", label: "ROC / MCA Annual Filings", icon: ShieldCheck },
  { id: "Audit", label: "Audited Financials", icon: FileSpreadsheet },
  { id: "Certificates", label: "Registrations & DSC", icon: FileArchive },
];

export default function FiledDocumentsPage() {
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  const { data: documents = [], isLoading } = useGetPortalDocumentsQuery({
    folder: selectedFolder === "all" ? undefined : selectedFolder,
    search: searchQuery ? searchQuery : undefined,
  });

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileText className="h-4 w-4 text-rose-500" />;
    if (ext === "xls" || ext === "xlsx" || ext === "csv") return <FileSpreadsheet className="h-4 w-4 text-emerald-600" />;
    if (ext === "zip" || ext === "rar") return <FileArchive className="h-4 w-4 text-amber-500" />;
    return <FileText className="h-4 w-4 text-blue-500" />;
  };

  const handleDownload = (doc: any) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("portalAccessToken");
      const downloadUrl = `/api/v1/portal/documents/${doc._id}/download`;
      // Open direct download link or trigger blob fetch
      const a = document.createElement("a");
      a.href = doc.fileUrl?.startsWith("http") ? doc.fileUrl : `${window.location.origin}${downloadUrl}`;
      a.download = doc.fileName || "document";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Filed Documents Vault" },
        ]}
      />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Filed Documents Vault
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Centralized repository of filed returns, government challans, audited statements, and statutory acknowledgments.
          </p>
        </div>
      </div>

      {/* Folder Categories Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {FOLDER_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedFolder === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedFolder(cat.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card hover:bg-muted/40 text-muted-foreground hover:text-foreground border-border/80"
              }`}
            >
              <Icon className="h-5 w-5 mb-1.5" />
              <span className="text-xs font-semibold leading-tight line-clamp-2">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-card p-3 rounded-xl border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents by return name, acknowledgment number, or filing period..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
        <Badge variant="outline" className="text-xs">
          {documents.length} Files Found
        </Badge>
      </div>

      {/* Documents Table */}
      <Card className="border-border/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FolderOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No Filed Documents in this Vault</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Government acknowledgment documents will appear here automatically once your returns or audit filings are finalized.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-semibold">Document Name</TableHead>
                <TableHead className="text-xs font-semibold">Filing Category</TableHead>
                <TableHead className="text-xs font-semibold">Date Uploaded</TableHead>
                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc: any) => (
                <TableRow key={doc._id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 shrink-0">
                        {getFileIcon(doc.fileName)}
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-foreground block">
                          {doc.fileName}
                        </span>
                        {doc.description && (
                          <span className="text-[11px] text-muted-foreground block">
                            {doc.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[11px]">
                      {doc.category || "Statutory Return"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(doc.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:bg-primary/10"
                        onClick={() => setPreviewDoc(doc)}
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 h-8 text-xs shadow-xs"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Document Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> {previewDoc?.fileName}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Category: {previewDoc?.category} • Uploaded on {previewDoc && formatDate(previewDoc.createdAt)}
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-muted/20 border rounded-lg text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
              <FileCheck className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">{previewDoc?.fileName}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Official acknowledgment file verified by your advisory practice.
              </p>
            </div>

            <Button
              className="gap-2 text-xs shadow-xs"
              onClick={() => {
                if (previewDoc) handleDownload(previewDoc);
              }}
            >
              <Download className="h-4 w-4" /> Download Official Return Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

