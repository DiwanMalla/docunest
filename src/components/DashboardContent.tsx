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

  if (notes.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardHeader>
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <CardTitle>No documents yet</CardTitle>
          <CardDescription>
            Upload your first PDF or DOCX file to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/upload">
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Your First Document
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {notes.map((note) => (
        <Card key={note.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div className="flex items-center space-x-2">
                {note.isPublic ? (
                  <div title="Public">
                    <Globe className="h-4 w-4 text-green-600" />
                  </div>
                ) : (
                  <div title="Private">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                <span className="text-xs text-gray-500 uppercase">
                  {note.fileType === "application/pdf" ? "PDF" : "DOCX"}
                </span>
              </div>
            </div>
            <CardTitle
              className="truncate text-sm sm:text-base"
              title={note.title}
            >
              {note.title}
            </CardTitle>
            {note.description && (
              <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                {note.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="text-xs sm:text-sm text-gray-500">
                {note.fileSize && (
                  <span>{Math.round(note.fileSize / 1024)} KB</span>
                )}
                <span className="ml-2 block sm:inline">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link href={`/notes/${note.id}`} className="flex-1">
                <Button size="sm" variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </Link>
              <div className="flex gap-2">
                {note.isPublic && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 flex-1 sm:flex-none"
                    onClick={() => handleShare(note.id)}
                  >
                    {copiedId === note.id ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Share2 className="h-4 w-4 mr-1" />
                    )}
                    <span className="hidden sm:inline">
                      {copiedId === note.id ? "Copied!" : "Share"}
                    </span>
                    <span className="sm:hidden">
                      {copiedId === note.id ? "✓" : "Share"}
                    </span>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 px-3"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
