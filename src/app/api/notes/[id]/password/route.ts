import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { encryptPassword } from "@/lib/encryption";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password, passwordEnabled } = await request.json();

    // Verify the note belongs to the user
    const note = await prisma.note.findFirst({
      where: {
        id: id,
        user: {
          clerkId: userId,
        },
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Update the note with password protection
    const updateData: {
      passwordEnabled: boolean;
      downloadPassword?: string | null;
    } = {
      passwordEnabled: passwordEnabled,
    };

    if (passwordEnabled && password) {
      updateData.downloadPassword = encryptPassword(password);
    } else if (!passwordEnabled) {
      updateData.downloadPassword = null;
    }

    const updatedNote = await prisma.note.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Password settings updated successfully",
      passwordEnabled: updatedNote.passwordEnabled,
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { error: "Failed to update password settings" },
      { status: 500 }
    );
  }
}
