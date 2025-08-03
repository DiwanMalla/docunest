"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { FileText, Upload, X } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    if (acceptedFiles.length > 0 && !title) {
      setTitle(acceptedFiles[0].name.replace(/\.[^/.]+$/, ""));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
  });

  const removeFile = () => {
    setFiles([]);
    setTitle("");
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      setError("Please select a file to upload");
      return;
    }

    if (!title.trim()) {
      setError("Please provide a title for your document");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("isPublic", isPublic.toString());
      formData.append("passwordEnabled", passwordEnabled.toString());
      if (passwordEnabled && password) {
        formData.append("password", password);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      // Refresh the router cache and navigate to dashboard
      router.refresh();
      router.push("/dashboard");
    } catch {
      setError("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <Link
              href="/dashboard"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <span className="ml-2 text-lg sm:text-2xl font-bold text-gray-900">
                DocuNest
              </span>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="text-sm">
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Upload Document
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Upload your PDF or DOCX files to store them securely in the cloud.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Select File</CardTitle>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {isDragActive
                      ? "Drop the file here"
                      : "Drag & drop your file here"}
                  </p>
                  <p className="text-gray-500">
                    or <span className="text-blue-600 font-medium">browse</span>{" "}
                    to choose a file
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Supports PDF and DOCX files
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {files[0].name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {Math.round(files[0].size / 1024)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Details */}
          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter document title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description for your document"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="isPublic">Make document public</Label>
                  <p className="text-sm text-gray-500">
                    Public documents can be viewed by guests without login
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <div className="space-y-1">
                  <Label htmlFor="passwordEnabled">
                    Password protect downloads
                  </Label>
                  <p className="text-sm text-gray-500">
                    Require password for downloading this document
                  </p>
                </div>
                <Switch
                  id="passwordEnabled"
                  checked={passwordEnabled}
                  onCheckedChange={setPasswordEnabled}
                />
              </div>
              {passwordEnabled && (
                <div>
                  <Label htmlFor="password">Download Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password for downloads"
                    required={passwordEnabled}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <Link href="/dashboard" className="order-2 sm:order-1">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={uploading || files.length === 0}
              className="order-1 sm:order-2 w-full sm:w-auto"
            >
              {uploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
