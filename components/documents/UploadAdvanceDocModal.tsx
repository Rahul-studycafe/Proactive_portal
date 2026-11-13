"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  FileCheck,
  ShieldCheck,
  FileSpreadsheet,
  FileArchive,
  FolderOpen,
  X,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUploadPortalDocumentMutation } from "@/lib/services/api";
import { toast } from "sonner";

interface UploadAdvanceDocModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function UploadAdvanceDocModal({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
  onSuccess,
}: UploadAdvanceDocModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (isControlled) {
      setControlledOpen?.(val);
    } else {
      setInternalOpen(val);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [uploadDoc, { isLoading: isUploading }] = useUploadPortalDocumentMutation();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!documentTitle) {
      // Pre-fill clean title without extension
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      setDocumentTitle(nameWithoutExt);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setDocumentTitle("");
    setNotes("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a document file to upload");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (documentTitle.trim()) {
        formData.append("title", documentTitle.trim());
      }
      formData.append("category", "document");
      if (notes.trim()) {
        formData.append("notes", notes.trim());
      }

      await uploadDoc(formData).unwrap();

      toast.success("Document uploaded successfully! Your CA practice has received it.");
      resetForm();
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(
        err?.data?.error?.message ||
        err?.data?.message ||
        "Failed to upload document. Please try again."
      );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="max-w-lg w-[95vw] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-xl">
        <DialogHeader className="p-4 pb-3 border-b shrink-0 pr-12">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UploadCloud className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Submit Document to CA Practice</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Upload business records, tax notices, bank statements, or receipts in advance.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-3.5 space-y-3">
            {/* File Picker Zone */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground">
                Select Document File <span className="text-destructive">*</span>
              </Label>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv,.doc,.docx,.zip"
              />

              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl py-4 px-4 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-primary bg-primary/5 scale-[0.99]"
                      : "border-border/80 hover:border-primary/60 hover:bg-muted/40"
                  }`}
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-1.5">
                    <UploadCloud className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-medium text-foreground">
                    Click to choose a file or drag and drop
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Supported formats: PDF, Excel, Word, Images, ZIP (Max 25MB)
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate text-foreground">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Document Title */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground">
                Document Title (Optional)
              </Label>
              <Input
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="e.g. Bank Statement Q3 / July Sales Register"
                className="h-8 text-xs"
              />
            </div>

            {/* Notes / Instructions */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground">
                Notes for your Advisory Team (Optional)
              </Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please check this July statement for turnover reconciliation or GST filing."
                className="text-xs min-h-[50px] max-h-[70px] resize-none"
              />
            </div>

            {/* Notification Info Notice */}
            <div className="flex items-start gap-2 p-2 rounded-lg border border-border/70 bg-muted/30 text-[11px] text-muted-foreground">
              <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <p className="leading-snug">
                Once uploaded, this document will be instantly shared with your assigned CA advisory team in their portal and archived in your filed documents vault.
              </p>
            </div>
          </div>

          <DialogFooter className="p-3.5 px-5 border-t bg-muted/20 shrink-0 flex items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              disabled={isUploading}
              className="text-xs h-8"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={!selectedFile || isUploading}
              className="gap-2 text-xs font-medium h-8"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="h-3.5 w-3.5" />
                  Upload & Submit to Practice
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
