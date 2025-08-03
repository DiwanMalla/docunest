import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    console.log("Testing Cloudinary URL:", url);

    // Test fetch with different options
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error response:", errorText);
      return NextResponse.json(
        {
          error: "Failed to fetch file",
          status: response.status,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    return NextResponse.json({
      success: true,
      contentType,
      contentLength,
      status: response.status,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      {
        error: "Network error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
