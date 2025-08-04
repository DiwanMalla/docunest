import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureUserExists } from "@/lib/user";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Globe } from "lucide-react";
import Link from "next/link";
import DashboardContent from "@/components/DashboardContent";
import StorageUsageCard from "@/components/StorageUsageCard";

async function getUserNotes(clerkUserId: string) {
  try {
    // Find the database user by Clerk ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!dbUser) {
      console.log("User not found in database after creation attempt");
      return [];
    }

    return await prisma.note.findMany({
      where: { userId: dbUser.id }, // Use database user ID
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Database error:", error);
    // Return empty array instead of mock data for better UX
    return [];
  }
}

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get current user details from Clerk
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Ensure user exists in our database
  await ensureUserExists(
    userId,
    user.emailAddresses[0]?.emailAddress || "",
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || undefined
  );

  const notes = await getUserNotes(userId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link
              href="/"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <div className="p-2 bg-blue-600 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DocuNest
              </span>
            </Link>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link href="/guest">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Guest View</span>
                  <span className="sm:hidden">Guest</span>
                </Button>
              </Link>
              <Link href="/upload-edgestore">
                <Button size="sm" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Upload File</span>
                  <span className="sm:hidden">Upload</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent mb-4">
              Your Document Library
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {notes.length === 0
                ? "Ready to get started? Upload your first document to begin building your secure digital library."
                : `Managing ${notes.length} document${
                    notes.length === 1 ? "" : "s"
                  } in your secure cloud storage.`}
            </p>
          </div>

          {/* Storage Usage Card */}
          <div className="max-w-md mx-auto mb-8">
            <StorageUsageCard />
          </div>
        </div>

        <DashboardContent notes={notes} />
      </main>
    </div>
  );
}
