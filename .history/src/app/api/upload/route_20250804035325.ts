// Legacy Supabase upload route - DEPRECATED
// Use /upload-edgestore page instead for new uploads
import { NextRequest, NextResponse } from "next/server";

export async function POST(_request: NextRequest) {
  // Redirect to EdgeStore upload page
  return NextResponse.json(
    { 
      error: "This upload endpoint is deprecated. Please use the EdgeStore upload page.",
      redirectTo: "/upload-edgestore"
    }, 
    { status: 410 } // Gone
  );
}

export async function GET() {
  return NextResponse.json(
    { 
      message: "This upload endpoint is deprecated. Please use the EdgeStore upload page.",
      redirectTo: "/upload-edgestore"
    }, 
    { status: 410 }
  );
}
