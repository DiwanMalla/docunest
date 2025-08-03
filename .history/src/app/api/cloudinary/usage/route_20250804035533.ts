// Legacy Cloudinary usage route - DEPRECATED
// EdgeStore is now the primary storage solution
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { 
      message: "Cloudinary storage is deprecated. Using EdgeStore now.",
      storage: {
        used: { bytes: 0, mb: 0, gb: 0 },
        limit: { bytes: 0, gb: 0 },
        percentage: 0
      },
      resources: {
        used: 0,
        limit: 0
      },
      plan: "EdgeStore",
      lastUpdated: new Date().toISOString()
    }, 
    { status: 410 } // Gone
  );
}
