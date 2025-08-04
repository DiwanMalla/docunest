"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  FileText,
  Download,
  ArrowLeft,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  X,
  Shield,
  Globe,
  Share2,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Document, Page, pdfjs } from "react-pdf";
import { PasswordSettingsDialog } from "@/components/PasswordSettingsDialog";
import "../../styles/document-viewer.css";

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
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"info" | "viewer">("info");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/notes/${params.id}`);

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
    if (note?.fileUrl) {
      window.open(note.fileUrl, "_blank");
    }
  };

  const handleTogglePublic = async () => {
    if (!note) return;

    setIsTogglingPublic(true);
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPublic: !note.isPublic,
        }),
      });

      if (response.ok) {
        setNote({ ...note, isPublic: !note.isPublic });
      }
    } catch (error) {
      console.error("Error toggling public status:", error);
    } finally {
      setIsTogglingPublic(false);
    }
  };

  const handleShare = async () => {
    if (!note || !note.isPublic) return;

    const guestUrl = `${window.location.origin}/guest/view/${note.id}`;

    try {
      await navigator.clipboard.writeText(guestUrl);
      // You could add a toast notification here if you have one
      alert("Guest link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy link:", err);
      // Fallback - show the link in a prompt
      prompt("Copy this link:", guestUrl);
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

  const handlePasswordSettings = async (settings: {
    passwordEnabled: boolean;
    password?: string;
  }) => {
    setPasswordLoading(true);
    setPasswordError("");

    try {
      const response = await fetch(`/api/notes/${params.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to update password settings");
      }

      const data = await response.json();

      // Update the note with new password status
      if (note) {
        setNote({
          ...note,
          passwordEnabled: data.passwordEnabled,
        });
      }

      setShowPasswordDialog(false);
    } catch (err) {
      setPasswordError(
        err instanceof Error
          ? err.message
          : "Failed to update password settings"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/4 mb-4 sm:mb-6"></div>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="h-4 sm:h-6 bg-gray-200 rounded w-1/3 mb-3 sm:mb-4"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-4 sm:mb-6" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
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
                  {error || "The requested document could not be found."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                </Button>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm sm:text-base">
                      D
                    </span>
                  </div>
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    DocuNest
                  </span>
                </div>
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handleTogglePublic}
                variant={note.isPublic ? "default" : "outline"}
                disabled={isTogglingPublic}
                size="sm"
                className="whitespace-nowrap"
              >
                {isTogglingPublic ? (
                  <span className="flex items-center gap-1 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">Loading...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 sm:gap-2">
                    {note.isPublic ? (
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    <span className="text-xs sm:text-sm">
                      {note.isPublic ? "Public" : "Private"}
                    </span>
                  </span>
                )}
              </Button>
              {note.isPublic && (
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Share2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              )}
              <Button
                onClick={() => router.push("/upload")}
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Upload New</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>
        </div>

        <Card className="mb-4 sm:mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="break-words">{note.title}</span>
            </CardTitle>
            {note.description && (
              <p className="text-gray-600 text-sm sm:text-base break-words">
                {note.description}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                <div>
                  <span className="font-medium">File Name:</span>
                  <p className="text-gray-600 break-all">{note.fileName}</p>
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

              {/* Public Access Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t pt-4 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-sm sm:text-base">
                      Public Access
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Allow guests to view this document without login
                  </p>
                </div>
                <Switch
                  checked={note.isPublic || false}
                  onCheckedChange={handleTogglePublic}
                />
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 pt-4">
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
                  className="flex-1 sm:flex-none"
                  size="sm"
                >
                  <Eye className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">
                    {viewMode === "viewer" ? "Close Viewer" : "View Document"}
                  </span>
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  size="sm"
                >
                  <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Download</span>
                </Button>
                <Button
                  onClick={() => setShowPasswordDialog(true)}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  size="sm"
                >
                  <Shield className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">
                    {note.passwordEnabled ? "Update Password" : "Set Password"}
                  </span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {viewMode === "viewer" && isFullscreen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col">
            {/* Fullscreen Header */}
            <div className="bg-white border-b shadow-sm px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <h1 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                  {note.title}
                </h1>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {note.fileType.toLowerCase() === "pdf" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={zoomOut}
                      disabled={scale <= 0.5}
                      className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                    >
                      <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <span className="text-xs sm:text-sm text-gray-600 min-w-[45px] sm:min-w-[60px] text-center bg-gray-100 px-1 sm:px-2 py-1 rounded">
                      {Math.round(scale * 100)}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={zoomIn}
                      disabled={scale >= 3.0}
                      className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                    >
                      <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <div className="w-px h-4 sm:h-6 bg-gray-300 mx-1 sm:mx-2" />
                  </>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Download</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsFullscreen(false);
                    setViewMode("info");
                  }}
                  className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Close</span>
                </Button>
              </div>
            </div>

            {/* Fullscreen Document Content */}
            <div className="flex-1 bg-gray-100 overflow-auto">
              {note.fileType.toLowerCase() === "pdf" ? (
                <div className="pdf-viewer-fullscreen h-full flex flex-col">
                  {/* Show warning for large files but still allow viewing */}
                  {note.fileSize && note.fileSize > 10 * 1024 * 1024 && (
                    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-yellow-800">
                            Large file ({formatFileSize(note.fileSize)}) - Loading may take longer
                          </span>
                        </div>
                        <Button
                          onClick={handleDownload}
                          size="sm"
                          variant="outline"
                          className="text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download Instead
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <Document
                    file={note.fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={(error) => {
                      console.error("PDF load error:", error);
                    }}
                    loading={
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading PDF...</p>
                          {note.fileSize && note.fileSize > 10 * 1024 * 1024 && (
                            <p className="text-xs text-gray-500 mt-2">
                              Large file - This may take a moment
                            </p>
                          )}
                        </div>
                      </div>
                    }
                    error={
                      <div className="flex items-center justify-center h-full">
                        <Card className="max-w-md w-full text-center">
                          <CardContent className="pt-8 pb-8">
                            <FileText className="h-16 w-16 text-red-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                              Preview Not Available
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Unable to load PDF preview. This might be due to file size or format issues.
                            </p>
                            <Button
                              onClick={handleDownload}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download File
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    }
                    className="flex-1 flex justify-center items-center p-2 sm:p-4"
                    options={{
                      // Optimize for large files
                      cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                      cMapPacked: true,
                      disableStream: note.fileSize ? note.fileSize > 20 * 1024 * 1024 : false, // Disable streaming for very large files
                      disableAutoFetch: note.fileSize ? note.fileSize > 20 * 1024 * 1024 : false, // Disable auto-fetch for very large files
                    }}
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      className="shadow-2xl max-w-full"
                      loading={
                        <div className="w-96 h-96 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-gray-500 text-sm">Loading page {pageNumber}...</p>
                          </div>
                        </div>
                      }
                      error={
                        <div className="w-96 h-96 bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-red-600 mb-2">Failed to load page {pageNumber}</p>
                            <Button
                              onClick={handleDownload}
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      }
                      renderTextLayer={false} // Disable text layer for better performance with large files
                      renderAnnotationLayer={false} // Disable annotation layer for better performance
                    />
                  </Document>

                  {numPages > 0 && (
                    <div className="bg-white border-t px-2 sm:px-6 py-2 sm:py-3 flex items-center justify-center gap-2 sm:gap-4">
                      <Button
                        variant="outline"
                        onClick={previousPage}
                        disabled={pageNumber <= 1}
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                      </Button>
                      <span className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded whitespace-nowrap">
                        {pageNumber} / {numPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={nextPage}
                        disabled={pageNumber >= numPages}
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <span className="sm:hidden">Next</span>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  {/* Show warning for large non-PDF files */}
                  {note.fileSize && note.fileSize > 25 * 1024 * 1024 && (
                    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-yellow-800">
                            Large {note.fileType.toUpperCase()} file ({formatFileSize(note.fileSize)}) - May load slowly
                          </span>
                        </div>
                        <Button
                          onClick={handleDownload}
                          size="sm"
                          variant="outline"
                          className="text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download Instead
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex-1 p-2 sm:p-4 relative">
                    <iframe
                      src={getViewerUrl(note.fileUrl, note.fileType)}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      className="rounded-lg shadow-lg bg-white"
                      title={`${note.title} - Document Viewer`}
                      onLoad={() => {
                        console.log("Document loaded successfully");
                        setIframeLoaded(true);
                      }}
                      onError={() => {
                        console.error("Failed to load document in iframe");
                        setIframeLoaded(true); // Hide loading even on error
                      }}
                    />
                    
                    {/* Loading overlay for large files */}
                    {note.fileSize && note.fileSize > 25 * 1024 * 1024 && !iframeLoaded && (
                      <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-lg">
                        <div className="text-center bg-white p-6 rounded-lg shadow-lg border">
                          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                          <p className="text-gray-700 font-medium">Loading large document...</p>
                          <p className="text-xs text-gray-500 mt-1">This may take a moment</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === "info" && (
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-center py-6 sm:py-8">
                <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  Document Ready
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 px-2">
                  Click &ldquo;View Document&rdquo; above to preview your{" "}
                  {note.fileType.toUpperCase()} document online, or download it
                  to your device.
                </p>
                <div className="text-xs sm:text-sm text-gray-500">
                  Uploaded on {new Date(note.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Password Settings Dialog */}
        <PasswordSettingsDialog
          isOpen={showPasswordDialog}
          onClose={() => {
            setShowPasswordDialog(false);
            setPasswordError("");
          }}
          onSave={handlePasswordSettings}
          loading={passwordLoading}
          error={passwordError}
          documentTitle={note?.title}
          currentPasswordEnabled={note?.passwordEnabled || false}
        />
      </div>
    </div>
  );
}
