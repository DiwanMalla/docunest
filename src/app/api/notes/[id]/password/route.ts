import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUserByClerkId } from "@/lib/user";
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

    // Find the user first
    const user = await getUserByClerkId(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the note belongs to the user
    const note = await prisma.note.findFirst({
      where: {
        id: id,
        userId: user.id,
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

    // Revalidate the dashboard page to reflect password setting changes
    revalidatePath("/dashboard");

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
