import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Upload, Eye, Shield, Users, Settings } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <Link
              href="/"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm sm:text-base">
                  D
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DocuNest
              </span>
            </Link>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Link href="/guest">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Browse Documents</span>
                  <span className="sm:hidden">Browse</span>
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button
                  size="sm"
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Admin Login</span>
                  <span className="sm:hidden">Admin</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight font-extrabold text-gray-900">
            <span className="block">Document Storage &</span>
            <span className="block text-blue-600">Sharing Platform</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-sm sm:text-base lg:text-lg text-gray-500 md:mt-5 md:text-xl md:max-w-3xl px-4">
            Upload, manage, and share your PDF and DOCX files. Admin mode for
            management, guest mode for viewing shared documents.
          </p>
        </div>

        {/* Mode Selection */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          <Card className="border-2 hover:border-blue-300 transition-colors cursor-pointer">
            <Link href="/sign-in">
              <CardHeader className="text-center py-8 sm:py-12">
                <Settings className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-xl sm:text-2xl">
                  Admin Mode
                </CardTitle>
                <CardDescription className="text-base sm:text-lg mt-3 sm:mt-4 px-2">
                  Login with Google to upload, manage, and organize your
                  documents. Control sharing permissions and manage the document
                  library.
                </CardDescription>
                <div className="mt-4 sm:mt-6">
                  <Button size="lg" className="w-full text-sm sm:text-base">
                    <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Access Admin Panel
                  </Button>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="border-2 hover:border-green-300 transition-colors cursor-pointer">
            <Link href="/guest">
              <CardHeader className="text-center py-8 sm:py-12">
                <Users className="h-12 w-12 sm:h-16 sm:w-16 text-green-600 mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-xl sm:text-2xl">
                  Guest Mode
                </CardTitle>
                <CardDescription className="text-base sm:text-lg mt-3 sm:mt-4 px-2">
                  Browse and view all publicly shared documents. No login
                  required - instant access to the document library.
                </CardDescription>
                <div className="mt-4 sm:mt-6">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full text-sm sm:text-base"
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Browse Documents
                  </Button>
                </div>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-16 sm:mt-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12 px-4">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-8">
            <Card>
              <CardHeader>
                <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mb-2" />
                <CardTitle className="text-lg sm:text-xl">
                  Easy Upload
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Drag and drop PDF and DOCX files for instant upload to the
                  cloud.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mb-2" />
                <CardTitle className="text-lg sm:text-xl">
                  Online Viewer
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  View documents directly in the browser without downloading.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mb-2" />
                <CardTitle className="text-lg sm:text-xl">
                  Secure Sharing
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Control document visibility with public/private settings.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mb-2" />
                <CardTitle className="text-lg sm:text-xl">
                  Role-Based Access
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Admin controls for management, guest access for viewing.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 sm:mt-20 bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center mx-4 sm:mx-0">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Ready to get started?
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 px-2">
            Choose your access level and start managing or browsing documents.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/sign-in">
              <Button
                size="lg"
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Admin Access
              </Button>
            </Link>
            <Link href="/guest">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Guest Browse
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8 sm:mt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center text-gray-500">
            <p className="text-xs sm:text-sm">
              &copy; 2025 DocuNest. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
