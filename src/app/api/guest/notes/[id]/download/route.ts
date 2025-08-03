import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/encryption";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { password } = await request.json();

    // Find the public note
    const note = await prisma.note.findFirst({
      where: {
        id: id,
        isPublic: true,
      },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check if password protection is enabled
    if (note.passwordEnabled && note.downloadPassword) {
      if (!password) {
        return NextResponse.json(
          { error: "Password required for download" },
          { status: 401 }
        );
      }

      // Verify the password
      const isValidPassword = verifyPassword(password, note.downloadPassword);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 401 }
        );
      }
    }

    // Return the download URL if password is correct or no password required
    return NextResponse.json({
      success: true,
      downloadUrl: note.fileUrl,
      fileName: note.fileName,
      fileType: note.fileType,
    });
  } catch (error) {
    console.error("Error processing download:", error);
    return NextResponse.json(
      { error: "Failed to process download" },
      { status: 500 }
    );
  }
}
