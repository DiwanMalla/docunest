import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ensureUserExists } from "@/lib/user";
import { supabase } from "@/lib/supabase";
import { encryptPassword } from "@/lib/encryption";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user details from Clerk
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Ensure user exists in our database
    const dbUser = await ensureUserExists(
      userId,
      user.emailAddresses[0]?.emailAddress || "",
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || undefined
    );

    if (!dbUser) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const isPublic = formData.get("isPublic") === "true";
    const passwordEnabled = formData.get("passwordEnabled") === "true";
    const password = formData.get("password") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Check file size (50MB limit for Supabase free plan)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes (Supabase free plan limit)
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File size too large. Maximum allowed size is 50MB. Your file is ${Math.round(
            file.size / (1024 * 1024)
          )}MB. Please compress your file.`,
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();

    // Create unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const fileName = `${userId}_${timestamp}_${sanitizedFileName}`;
    const filePath = `documents/${fileName}`;

    // Upload to Supabase Storage
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, bytes, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return NextResponse.json(
          {
            error: `Upload failed: ${uploadError.message}`,
          },
          { status: 500 }
        );
      }

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      const fileUrl = urlData.publicUrl;

      // Save to database
      try {
        // Encrypt password if provided
        let encryptedPassword = null;
        if (passwordEnabled && password) {
          encryptedPassword = encryptPassword(password);
        }

        const note = await prisma.note.create({
          data: {
            title,
            description: description || null,
            fileUrl: fileUrl,
            fileType: file.type,
            fileName: file.name,
            fileSize: file.size,
            cloudinaryId: uploadData.path, // Store Supabase file path instead
            isPublic: isPublic,
            passwordEnabled: passwordEnabled,
            downloadPassword: encryptedPassword,
            userId: dbUser.id,
          },
        });

        // Revalidate the dashboard page to show the new document
        revalidatePath("/dashboard");

        return NextResponse.json({ note }, { status: 201 });
      } catch (dbError) {
        console.error("Database save error:", dbError);

        // If database save fails, clean up the uploaded file
        await supabase.storage.from("documents").remove([filePath]);

        return NextResponse.json(
          { error: "Failed to save document information" },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
