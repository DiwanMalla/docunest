import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const note = await prisma.note.findFirst({
      where: {
        id,
        isPublic: true, // Only allow access to public notes
      },
      select: {
        id: true,
        title: true,
        description: true,
        fileUrl: true,
        fileType: true,
        fileName: true,
        fileSize: true,
        downloadPassword: true, // Get password hash to determine if password enabled
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Document not found or not public" },
        { status: 404 }
      );
    }

    // Transform the response to include passwordEnabled status without exposing the actual password
    const responseNote = {
      ...note,
      passwordEnabled: !!note.downloadPassword, // Convert to boolean - true if password exists
      downloadPassword: undefined, // Remove from response for security
    };

    return NextResponse.json({ note: responseNote });
  } catch (error) {
    console.error("Fetch public note error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
