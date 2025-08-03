import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Download, Calendar } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getPublicNotes() {
  try {
    return await prisma.note.findMany({
      where: { isPublic: true },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching public notes:", error);
    return [];
  }
}

export default async function GuestPage() {
  const notes = await getPublicNotes();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <Link
              href="/"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <span className="ml-2 text-lg sm:text-2xl font-bold text-gray-900">
                DocuNest
              </span>
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs sm:text-sm rounded-full">
                Guest
              </span>
            </Link>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto text-sm"
                >
                  <span className="hidden sm:inline">Home</span>
                  <span className="sm:hidden">Home</span>
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="sm" className="w-full sm:w-auto text-sm">
                  <span className="hidden sm:inline">Admin Login</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Shared Documents
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Browse and view publicly shared documents from our collection.
          </p>
        </div>

        {notes.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <CardTitle>No Public Documents</CardTitle>
              <CardDescription>
                There are currently no publicly shared documents available.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Eye className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">
                  {notes.length} document{notes.length === 1 ? "" : "s"}{" "}
                  available for viewing
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <Card
                  key={note.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <span className="text-xs text-gray-500 uppercase bg-gray-100 px-2 py-1 rounded">
                        {note.fileType === "application/pdf" ? "PDF" : "DOCX"}
                      </span>
                    </div>
                    <CardTitle className="truncate" title={note.title}>
                      {note.title}
                    </CardTitle>
                    {note.description && (
                      <CardDescription className="line-clamp-3">
                        {note.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* File Info */}
                      <div className="text-sm text-gray-500 space-y-1">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            Shared{" "}
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {note.fileSize && (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            <span>{Math.round(note.fileSize / 1024)} KB</span>
                          </div>
                        )}
                        {note.user.name && (
                          <div className="text-xs text-gray-400">
                            Shared by: {note.user.name}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Link
                          href={`/guest/view/${note.id}`}
                          className="flex-1"
                        >
                          <Button size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        <a href={note.fileUrl} download={note.fileName}>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2025 DocuNest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
