// Legacy MEGA upload route - DEPRECATED
// Use /upload-edgestore page instead for new uploads
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { 
      error: "This MEGA upload endpoint is deprecated. Please use the EdgeStore upload page.",
      redirectTo: "/upload-edgestore"
    }, 
    { status: 410 } // Gone
  );
}

export async function GET() {
  return NextResponse.json(
    { 
      message: "This MEGA upload endpoint is deprecated. Please use the EdgeStore upload page.",
      redirectTo: "/upload-edgestore"
    }, 
    { status: 410 }
  );
}
    }

    console.log(`Processing upload: ${file.name} (${file.size} bytes)`);

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to MEGA
    const megaClient = getMegaClient();
    const uploadResult = await megaClient.uploadFile(
      buffer,
      file.name,
      "DocuNest"
    );

    console.log(`MEGA upload successful: ${uploadResult.url}`);

    // Create or update user in database
    const user = await ensureUserExists(clerkId, userEmail);
    if (!user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Encrypt password if provided
    let encryptedPassword = null;
    let passwordEnabled = false;
    if (password) {
      encryptedPassword = await encryptPassword(password);
      passwordEnabled = true;
    }

    // Save note to database
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      const note = await prisma.note.create({
        data: {
          title,
          description: description || "",
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileUrl: uploadResult.url,
          downloadPassword: encryptedPassword,
          passwordEnabled,
          userId: user.id,
          cloudinaryId: uploadResult.fileId, // Reuse this field for MEGA file ID
        },
      });

      console.log(`Note created successfully: ${note.id}`);

      // Revalidate the dashboard to show the new upload
      revalidatePath("/dashboard");

      return NextResponse.json({
        success: true,
        noteId: note.id,
        fileUrl: uploadResult.url,
        message: "File uploaded successfully to MEGA",
      });
    } catch (dbError) {
      console.error("Database error:", dbError);

      // If database save fails, delete the uploaded file from MEGA
      try {
        await megaClient.deleteFile(uploadResult.fileId);
        console.log("Cleaned up MEGA file after database error");
      } catch (cleanupError) {
        console.error("Failed to cleanup MEGA file:", cleanupError);
      }

      return NextResponse.json(
        { error: "Failed to save note to database" },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error("MEGA upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
