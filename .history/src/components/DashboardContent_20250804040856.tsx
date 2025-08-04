"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Upload,
  Eye,
  Trash2,
  Share2,
  Globe,
  Lock,
  Check,
  Grid3X3,
  List,
  Calendar,
  HardDrive,
} from "lucide-react";
import Link from "next/link";

interface Note {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  fileType: string;
  fileName: string;
  fileSize?: number | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  cloudinaryId: string | null;
  downloadPassword?: string | null;
  passwordEnabled?: boolean;
}

interface DashboardContentProps {
  notes: Note[];
}

export default function DashboardContent({ notes }: DashboardContentProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleShare = async (noteId: string) => {
    const shareUrl = `${window.location.origin}/guest/view/${noteId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(noteId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedId(noteId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${Math.round(bytes / (1024 * 1024))} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  if (notes.length === 0) {
    return (
      <Card className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 border-dashed border-2 border-blue-200">
        <CardHeader>
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <FileText className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">No documents yet</CardTitle>
          <CardDescription className="text-lg text-gray-600 max-w-md mx-auto">
            Upload your first PDF or DOCX file to get started with your secure document storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/upload-edgestore">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
              <Upload className="h-5 w-5 mr-2" />
              Upload Your First Document
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Toggle Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {notes.length} Document{notes.length !== 1 ? "s" : ""}
          </h2>
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 px-3"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Documents Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {notes.map((note) => (
            <Card key={note.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex items-center space-x-2">
                    {note.isPublic ? (
                      <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-full">
                        <Globe className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-medium text-green-700">Public</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-full">
                        <Lock className="h-3 w-3 text-gray-500" />
                        <span className="text-xs font-medium text-gray-600">Private</span>
                      </div>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {note.title}
                </CardTitle>
                {note.description && (
                  <CardDescription className="line-clamp-2 text-sm text-gray-600">
                    {note.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <HardDrive className="h-4 w-4" />
                    <span>{note.fileSize ? formatFileSize(note.fileSize) : "Unknown"}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded text-xs font-medium text-gray-700">
                  <span>{note.fileType === "application/pdf" ? "PDF" : "DOCX"}</span>
                </div>
                <div className="flex space-x-2">
                  <Link href={`/notes/${note.id}`} className="flex-1">
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  {note.isPublic && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShare(note.id)}
                      className="border-green-200 text-green-600 hover:bg-green-50"
                    >
                      {copiedId === note.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Share2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{note.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>{note.fileSize ? formatFileSize(note.fileSize) : "Unknown"}</span>
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                          {note.fileType === "application/pdf" ? "PDF" : "DOCX"}
                        </span>
                        {note.isPublic ? (
                          <div className="flex items-center space-x-1 text-green-600">
                            <Globe className="h-3 w-3" />
                            <span className="text-xs">Public</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Lock className="h-3 w-3" />
                            <span className="text-xs">Private</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/notes/${note.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    {note.isPublic && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShare(note.id)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        {copiedId === note.id ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </>
                        )}
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
