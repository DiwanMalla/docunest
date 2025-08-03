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
