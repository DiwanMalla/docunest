"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { useUser } from "@clerk/nextjs";
import { useEdgeStore } from "@/lib/edgestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { FileText, Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
  title: string;
  description?: string;
}

export default function EdgeStoreUploadPage() {
  const { user } = useUser();
  const { edgestore } = useEdgeStore();
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onDrop = (acceptedFiles: File[]) => {
    const newUploads: FileUpload[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending',
      title: file.name.replace(/\.[^/.]+$/, ""),
      description: "",
    }));
    
    setFileUploads(prev => [...prev, ...newUploads]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 100 * 1024 * 1024, // 100MB limit
    onDropRejected: (rejectedFiles) => {
      const file = rejectedFiles[0];
      if (file.errors.some((e) => e.code === "file-too-large")) {
        setError(
          `File size too large. Maximum allowed size is 100MB. Your file is ${Math.round(
            file.file.size / (1024 * 1024)
          )}MB. Please compress your file.`
        );
      } else if (file.errors.some((e) => e.code === "file-invalid-type")) {
        setError("Invalid file type. Please upload PDF or DOCX files only.");
      }
    },
  });

  const removeFile = (index: number) => {
    setFileUploads(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileField = (index: number, field: keyof FileUpload, value: string | number | 'pending' | 'uploading' | 'completed' | 'error') => {
    setFileUploads(prev => prev.map((upload, i) => 
      i === index ? { ...upload, [field]: value } : upload
    ));
  };

  const uploadSingleFile = async (uploadIndex: number) => {
    const upload = fileUploads[uploadIndex];
    
    try {
      // Update status to uploading
      updateFileField(uploadIndex, 'status', 'uploading');
      
      // Upload to EdgeStore
      const res = await edgestore.publicFiles.upload({
        file: upload.file,
        onProgressChange: (progress) => {
          updateFileField(uploadIndex, 'progress', progress);
        },
      });

      // Update with completed status and URL
      updateFileField(uploadIndex, 'status', 'completed');
      updateFileField(uploadIndex, 'url', res.url);

      // Save to database
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: upload.title,
          description: upload.description || undefined,
          fileUrl: res.url,
          fileName: upload.file.name,
          fileType: upload.file.type,
          fileSize: upload.file.size,
          isPublic,
          passwordEnabled,
          downloadPassword: passwordEnabled ? password : undefined,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save to database: ${response.statusText}`);
      }

    } catch (uploadError) {
      console.error(`Upload error for file ${uploadIndex}:`, uploadError);
      updateFileField(uploadIndex, 'status', 'error');
      updateFileField(uploadIndex, 'error', 
        uploadError instanceof Error ? uploadError.message : 'Upload failed'
      );
    }
  };

  const handleUploadAll = async () => {
    if (fileUploads.length === 0) {
      setError("Please select files to upload");
      return;
    }

    if (!user) {
      setError("Please sign in to upload files");
      return;
    }

    // Check if all files have titles
    const filesWithoutTitles = fileUploads.filter(upload => !upload.title.trim());
    if (filesWithoutTitles.length > 0) {
      setError("Please provide titles for all documents");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Upload all files concurrently
      const uploadPromises = fileUploads.map((_, index) => uploadSingleFile(index));
      await Promise.all(uploadPromises);

      // Check if all uploads completed successfully
      const failedUploads = fileUploads.filter(upload => upload.status === 'error');
      
      if (failedUploads.length === 0) {
        // All uploads successful, redirect to dashboard
        router.refresh();
        router.push("/dashboard");
      } else {
        setError(`${failedUploads.length} file(s) failed to upload. Please check individual file errors.`);
      }
    } catch (error) {
      console.error("Upload process error:", error);
      setError("An error occurred during the upload process");
    } finally {
      setUploading(false);
    }
  };

  const getOverallProgress = () => {
    if (fileUploads.length === 0) return 0;
    const totalProgress = fileUploads.reduce((sum, upload) => sum + upload.progress, 0);
    return Math.round(totalProgress / fileUploads.length);
  };

  const getStatusIcon = (status: FileUpload['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'uploading':
        return <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Upload Documents
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Upload multiple PDF or DOCX files to store them securely in the cloud.
            Maximum file size: 100MB per file.
          </p>
        </div>

        <div className="space-y-6">
          {/* File Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>Select Files</CardTitle>
            </CardHeader>
            <CardContent>
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
                    ? "Drop the files here"
                    : "Drag & drop files here"}
                </p>
                <p className="text-gray-500">
                  or <span className="text-blue-600 font-medium">browse</span>{" "}
                  to choose files
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Supports PDF and DOCX files (max 100MB each)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* File List */}
          {fileUploads.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Files to Upload ({fileUploads.length})</span>
                  {uploading && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Overall Progress:</span>
                      <div className="w-24">
                        <Progress value={getOverallProgress()} className="h-2" />
                      </div>
                      <span className="text-sm font-medium">{getOverallProgress()}%</span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fileUploads.map((upload, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(upload.status)}
                        <div>
                          <p className="font-medium text-gray-900">{upload.file.name}</p>
                          <p className="text-sm text-gray-500">
                            {upload.file.size > 1024 * 1024
                              ? `${Math.round(upload.file.size / (1024 * 1024))} MB`
                              : `${Math.round(upload.file.size / 1024)} KB`}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={upload.status === 'uploading'}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Progress Bar */}
                    {upload.status === 'uploading' && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{upload.progress}%</span>
                        </div>
                        <Progress value={upload.progress} className="h-2" />
                      </div>
                    )}

                    {/* Error Message */}
                    {upload.status === 'error' && upload.error && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        Error: {upload.error}
                      </div>
                    )}

                    {/* Success Message */}
                    {upload.status === 'completed' && (
                      <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                        ✅ Upload completed successfully!
                      </div>
                    )}

                    {/* Title and Description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`title-${index}`}>Title *</Label>
                        <Input
                          id={`title-${index}`}
                          type="text"
                          value={upload.title}
                          onChange={(e) => updateFileField(index, 'title', e.target.value)}
                          placeholder="Enter document title"
                          disabled={upload.status === 'uploading' || upload.status === 'completed'}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`description-${index}`}>Description (optional)</Label>
                        <Input
                          id={`description-${index}`}
                          type="text"
                          value={upload.description}
                          onChange={(e) => updateFileField(index, 'description', e.target.value)}
                          placeholder="Enter description"
                          disabled={upload.status === 'uploading' || upload.status === 'completed'}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Global Settings */}
          {fileUploads.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="isPublic">Make documents public</Label>
                    <p className="text-sm text-gray-500">
                      Public documents can be viewed by guests without login
                    </p>
                  </div>
                  <Switch
                    id="isPublic"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                    disabled={uploading}
                  />
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="space-y-1">
                    <Label htmlFor="passwordEnabled">
                      Password protect downloads
                    </Label>
                    <p className="text-sm text-gray-500">
                      Require password for downloading these documents
                    </p>
                  </div>
                  <Switch
                    id="passwordEnabled"
                    checked={passwordEnabled}
                    onCheckedChange={setPasswordEnabled}
                    disabled={uploading}
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
                      disabled={uploading}
                      required={passwordEnabled}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Upload Button */}
          {fileUploads.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <Link href="/dashboard" className="order-2 sm:order-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </Link>
              <Button
                onClick={handleUploadAll}
                disabled={uploading || fileUploads.length === 0}
                className="order-1 sm:order-2 w-full sm:w-auto"
              >
                {uploading ? `Uploading... (${getOverallProgress()}%)` : `Upload ${fileUploads.length} Document${fileUploads.length !== 1 ? 's' : ''}`}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
