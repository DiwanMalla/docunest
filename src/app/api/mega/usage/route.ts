import { NextResponse } from "next/server";
import { getMegaClient } from "@/lib/mega-client";

export async function GET() {
  try {
    const megaClient = getMegaClient();
    const usage = await megaClient.getStorageUsage();

    // Convert bytes to MB and GB for display
    const usedMB = Math.round((usage.used / (1024 * 1024)) * 100) / 100;
    const usedGB = Math.round((usage.used / (1024 * 1024 * 1024)) * 100) / 100;
    const totalGB =
      Math.round((usage.total / (1024 * 1024 * 1024)) * 100) / 100;

    // Get file count by listing files
    const files = await megaClient.listFiles("DocuNest");
    const fileCount = files.length;

    return NextResponse.json({
      storage: {
        used: {
          bytes: usage.used,
          mb: usedMB,
          gb: usedGB,
        },
        limit: {
          bytes: usage.total,
          gb: totalGB,
        },
        percentage: Math.round(usage.percentage * 100) / 100,
      },
      resources: {
        used: fileCount,
        limit: 1000000, // MEGA doesn't have a file count limit, so use a large number
      },
      plan: "MEGA Free",
      lastUpdated: new Date().toISOString(),
      warning: usage.percentage > 80 ? "Storage usage is high" : undefined,
    });
  } catch (error) {
    console.error("Failed to fetch MEGA usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch storage usage" },
      { status: 500 }
    );
  }
}
