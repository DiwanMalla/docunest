import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Cloudinary usage statistics
    const usage = await cloudinary.api.usage();

    // Calculate used storage in different units
    const usedBytes = usage.transformations.usage || 0;
    const usedMB = Math.round(usedBytes / (1024 * 1024));
    const usedGB = Math.round((usedBytes / (1024 * 1024 * 1024)) * 100) / 100;

    // Get plan limits (these are typical Cloudinary free tier limits)
    // You might want to adjust these based on your actual plan
    const planLimitBytes =
      usage.plan_credits_usage?.limit || 25 * 1024 * 1024 * 1024; // 25GB default
    const planLimitGB =
      Math.round((planLimitBytes / (1024 * 1024 * 1024)) * 100) / 100;

    const usagePercentage = Math.round((usedBytes / planLimitBytes) * 100);

    // Get resource counts
    const totalResources = usage.resources || 0;
    const maxResources = usage.resource_limit || 1000000; // 1M default

    return NextResponse.json({
      storage: {
        used: {
          bytes: usedBytes,
          mb: usedMB,
          gb: usedGB,
        },
        limit: {
          bytes: planLimitBytes,
          gb: planLimitGB,
        },
        percentage: usagePercentage,
      },
      resources: {
        used: totalResources,
        limit: maxResources,
      },
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
