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
      plan: usage.plan || "Free",
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching Cloudinary usage:", error);

    // Return mock data if API call fails
    return NextResponse.json({
      storage: {
        used: {
          bytes: 0,
          mb: 0,
          gb: 0,
        },
        limit: {
          bytes: 25 * 1024 * 1024 * 1024, // 25GB
          gb: 25,
        },
        percentage: 0,
      },
      resources: {
        used: 0,
        limit: 1000000,
      },
      plan: "Free",
      lastUpdated: new Date().toISOString(),
      warning: "Unable to fetch real-time usage data",
    });
  }
}
