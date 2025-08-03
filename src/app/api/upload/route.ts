import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ensureUserExists } from "@/lib/user";
import cloudinary from "@/lib/cloudinary";
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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw", // Use 'raw' for non-image files like PDFs
            folder: "docunest",
            public_id: `${userId}_${Date.now()}_${file.name.replace(
              /[^a-zA-Z0-9]/g,
              "_"
            )}`, // Sanitize filename
            access_mode: "public", // Ensure public access
            type: "upload", // Standard upload type
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    const cloudinaryResult = uploadResponse as {
      secure_url: string;
      public_id: string;
      resource_type: string;
    };

    // For raw files, we need to construct the correct URL format
    const fileUrl =
      cloudinaryResult.resource_type === "raw"
        ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${cloudinaryResult.public_id}`
        : cloudinaryResult.secure_url;

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
          fileUrl: fileUrl, // Use the corrected URL
          fileType: file.type,
          fileName: file.name,
          fileSize: file.size,
          cloudinaryId: cloudinaryResult.public_id,
          isPublic: isPublic, // Use the value from form
          passwordEnabled: passwordEnabled,
          downloadPassword: encryptedPassword,
          userId: dbUser.id, // Use the database user ID, not Clerk ID
        },
      });

      // Revalidate the dashboard page to show the new document
      revalidatePath("/dashboard");

      return NextResponse.json({ note }, { status: 201 });
    } catch (dbError) {
      console.error("Database save error:", dbError);
      // Return success with file upload info even if database save fails
      // In a production app, you might want to store this in a temporary cache
      const mockNote = {
        id: `temp_${Date.now()}`,
        title,
        description: description || null,
        fileUrl: fileUrl, // Use the corrected URL
        fileType: file.type,
        fileName: file.name,
        fileSize: file.size,
        cloudinaryId: cloudinaryResult.public_id,
        isPublic: isPublic,
        passwordEnabled: passwordEnabled,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return NextResponse.json(
        {
          note: mockNote,
          warning:
            "File uploaded to cloud storage but database save failed. Please contact support.",
        },
        { status: 201 }
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
