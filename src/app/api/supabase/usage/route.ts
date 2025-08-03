import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Supabase storage usage
    // Note: Supabase doesn't provide detailed usage statistics via API for free tier
    // We'll calculate approximate usage based on our stored files
    try {
      const { data: files, error } = await supabase.storage
        .from("documents")
        .list("", {
          limit: 1000,
          offset: 0,
        });

      if (error) {
        throw error;
      }

      // Calculate total size from our files
      const totalSizeBytes =
        files?.reduce((total, file) => {
          return total + (file.metadata?.size || 0);
        }, 0) || 0;

      const totalSizeMB = Math.round(totalSizeBytes / (1024 * 1024));
      const totalSizeGB =
        Math.round((totalSizeBytes / (1024 * 1024 * 1024)) * 100) / 100;

      // Supabase free tier limits
      const limitBytes = 1 * 1024 * 1024 * 1024; // 1GB
      const limitGB = 1;

      const usagePercentage = Math.round((totalSizeBytes / limitBytes) * 100);

      return NextResponse.json({
        storage: {
          used: {
            bytes: totalSizeBytes,
            mb: totalSizeMB,
            gb: totalSizeGB,
          },
          limit: {
            bytes: limitBytes,
            gb: limitGB,
          },
          percentage: usagePercentage,
        },
        resources: {
          used: files?.length || 0,
          limit: 50000, // Approximate limit for free tier
        },
        plan: "Free",
        lastUpdated: new Date().toISOString(),
        provider: "Supabase",
      });
    } catch (storageError) {
      console.error("Supabase storage error:", storageError);

      // Return mock data if storage API fails
      return NextResponse.json({
        storage: {
          used: {
            bytes: 0,
            mb: 0,
            gb: 0,
          },
          limit: {
            bytes: 1 * 1024 * 1024 * 1024, // 1GB
            gb: 1,
          },
          percentage: 0,
        },
        resources: {
          used: 0,
          limit: 50000,
        },
        plan: "Free",
        lastUpdated: new Date().toISOString(),
        provider: "Supabase",
        warning: "Unable to fetch real-time usage data",
      });
    }
  } catch (error) {
    console.error("Error fetching storage usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch storage usage" },
      { status: 500 }
    );
  }
}
