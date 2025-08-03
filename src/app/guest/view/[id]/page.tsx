"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Download,
  ArrowLeft,
  Eye,
  ZoomIn,
  ZoomOut,
  X,
} from "lucide-react";
import Link from "next/link";
import { Document, Page, pdfjs } from "react-pdf";
import { PasswordDialog } from "@/components/PasswordDialog";
import "../../../styles/document-viewer.css";

// Set up PDF.js worker
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

interface Note {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  fileSize?: number;
  passwordEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string | null;
    email: string;
  };
}

export default function GuestViewPage() {
  const params = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"info" | "viewer">("info"); // Default to info for guest
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/guest/notes/${params.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch note");
        }

        const data = await response.json();
        setNote(data.note);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchNote();
    }
  }, [params.id]);

  const handleDownload = () => {
    if (!note) return;

    // If password protection is enabled, show password dialog
    if (note.passwordEnabled) {
      setShowPasswordDialog(true);
    } else {
      // Direct download if no password protection
      window.open(note.fileUrl, "_blank");
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!note) return;

    setPasswordLoading(true);
    setPasswordError("");

    try {
      const response = await fetch(`/api/guest/notes/${note.id}/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Invalid password");
      }

      const data = await response.json();

      // Download the file if password is correct
      window.open(data.downloadUrl, "_blank");
      setShowPasswordDialog(false);
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to download document"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale((prevScale) => Math.min(prevScale + 0.2, 3.0));
  const zoomOut = () => setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));

  const getViewerUrl = (fileUrl: string, fileType: string) => {
    if (fileType.toLowerCase() === "pdf") {
      return fileUrl; // We'll handle PDF with react-pdf
    }

    // For other document types, use Google Docs Viewer or Office Online
    if (
      ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(
        fileType.toLowerCase()
      )
    ) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        fileUrl
      )}`;
    }

    // Fallback to Google Docs Viewer for other formats
    return `https://docs.google.com/gview?url=${encodeURIComponent(
      fileUrl
    )}&embedded=true`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/guest">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Documents
            </Button>
          </Link>

          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-red-500 text-xl mb-2">⚠️</div>
                <h2 className="text-lg font-semibold text-red-800 mb-2">
                  Document Not Found
                </h2>
                <p className="text-red-600">
                  {error ||
                    "The requested document could not be found or is not shared publicly."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/guest">
          <Button variant="outline" className="mb-4 sm:mb-6" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back to Documents</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>

        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <FileText className="h-5 w-5 text-green-600" />
              <span className="truncate">{note.title}</span>
            </CardTitle>
            {note.description && (
              <p className="text-sm sm:text-base text-gray-600">
                {note.description}
              </p>
            )}
            <div className="text-xs sm:text-sm text-green-600 font-medium">
              📖 Public Document
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <span className="font-medium">File Name:</span>
                  <p className="text-gray-600 truncate">{note.fileName}</p>
                </div>
                <div>
                  <span className="font-medium">File Type:</span>
                  <p className="text-gray-600">{note.fileType.toUpperCase()}</p>
                </div>
                <div>
                  <span className="font-medium">File Size:</span>
                  <p className="text-gray-600">
                    {formatFileSize(note.fileSize)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => {
                    if (viewMode === "viewer") {
                      setViewMode("info");
                      setIsFullscreen(false);
                    } else {
                      setViewMode("viewer");
                      setIsFullscreen(true); // Open directly in fullscreen
                    }
                  }}
                  variant={viewMode === "viewer" ? "default" : "outline"}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {viewMode === "viewer" ? "Close Viewer" : "View Document"}
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">
                    {note.passwordEnabled ? "Download (Protected)" : "Download"}
                  </span>
                  <span className="sm:hidden">Download</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {viewMode === "viewer" && isFullscreen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col">
            {/* Fullscreen Header */}
            <div className="bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-green-600" />
                <h1 className="font-semibold text-gray-900 truncate max-w-md">
                  {note.title}
                </h1>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Guest View
                </span>
              </div>

              <div className="flex items-center gap-2">
                {note.fileType.toLowerCase() === "pdf" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={zoomOut}
                      disabled={scale <= 0.5}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600 min-w-[60px] text-center bg-gray-100 px-2 py-1 rounded">
                      {Math.round(scale * 100)}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={zoomIn}
                      disabled={scale >= 3.0}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-300 mx-2" />
                  </>
                )}

                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsFullscreen(false);
                    setViewMode("info");
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Close Viewer
                </Button>
              </div>
            </div>

            {/* Fullscreen Document Content */}
            <div className="flex-1 bg-gray-100 overflow-auto">
              {note.fileType.toLowerCase() === "pdf" ? (
                <div className="pdf-viewer-fullscreen h-full flex flex-col">
                  <Document
                    file={note.fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="flex-1 flex justify-center items-center p-4"
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      className="shadow-2xl"
                    />
                  </Document>

                  {numPages > 0 && (
                    <div className="bg-white border-t px-6 py-3 flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        onClick={previousPage}
                        disabled={pageNumber <= 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                        Page {pageNumber} of {numPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={nextPage}
                        disabled={pageNumber >= numPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full p-4">
                  <iframe
                    src={getViewerUrl(note.fileUrl, note.fileType)}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    className="rounded-lg shadow-lg bg-white"
                    title={`${note.title} - Document Viewer`}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === "info" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg text-green-800">
                Document Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Document Ready
                </h3>
                <p className="text-gray-600 mb-4">
                  This {note.fileType.toUpperCase()} document has been shared
                  with you. Click the download button above to view this{" "}
                  {note.fileType.toUpperCase()} document.
                </p>
                <div className="text-sm text-gray-500">
                  Shared on {new Date(note.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Password Dialog for Protected Downloads */}
        <PasswordDialog
          isOpen={showPasswordDialog}
          onClose={() => {
            setShowPasswordDialog(false);
            setPasswordError("");
          }}
          onSubmit={handlePasswordSubmit}
          loading={passwordLoading}
          error={passwordError}
          documentTitle={note?.title}
        />
      </div>
    </div>
  );
}
