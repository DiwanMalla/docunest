import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureUserExists } from "@/lib/user";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Globe } from "lucide-react";
import Link from "next/link";
import DashboardContent from "@/components/DashboardContent";

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link
              href="/"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl sm:text-2xl font-bold text-gray-900">
                DocuNest
              </span>
            </Link>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Link href="/guest">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Guest View</span>
                  <span className="sm:hidden">Guest</span>
                </Button>
              </Link>
              <Link href="/upload">
                <Button size="sm" className="w-full sm:w-auto">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Your Documents
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            {notes.length === 0
              ? "You haven't uploaded any documents yet."
              : `You have ${notes.length} document${
                  notes.length === 1 ? "" : "s"
                } stored.`}
          </p>
        </div>

        <DashboardContent notes={notes} />
      </main>
    </div>
  );
}
