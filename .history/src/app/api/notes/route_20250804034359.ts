import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      isPublic,
      passwordEnabled,
      downloadPassword,
    } = body;

    // Validate required fields
    if (!title || !fileUrl || !fileName) {
      return NextResponse.json(
        { error: "Missing required fields: title, fileUrl, fileName" },
        { status: 400 }
      );
    }

    // Create note in database
    const note = await prisma.note.create({
      data: {
        title,
        description: description || null,
        fileName,
        fileUrl,
        fileType: fileType || null,
        fileSize: fileSize || null,
        isPublic: isPublic || false,
        passwordEnabled: passwordEnabled || false,
        downloadPassword: passwordEnabled ? downloadPassword : null,
        userId,
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        note: {
          id: note.id,
          title: note.title,
          fileName: note.fileName,
          createdAt: note.createdAt,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const notes = await prisma.note.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined,
      select: {
        id: true,
        title: true,
        description: true,
        fileName: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
        isPublic: true,
        passwordEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ notes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
