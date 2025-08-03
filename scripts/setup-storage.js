const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function setupStorage() {
  console.log("Setting up Supabase storage...");

  try {
    // Create the documents bucket
    const { data, error } = await supabase.storage.createBucket("documents", {
      public: true,
      allowedMimeTypes: [
        "application/pdf",
        "image/*",
        "text/*",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      fileSizeLimit: 52428800, // 50MB in bytes
    });

    if (error && error.message !== "Bucket already exists") {
      console.error("Error creating bucket:", error);
      return;
    }

    console.log("✅ Documents bucket created successfully!");

    // List all buckets to confirm
    const { data: buckets } = await supabase.storage.listBuckets();
    console.log(
      "Available buckets:",
      buckets?.map((b) => b.name)
    );
  } catch (error) {
    console.error("Setup failed:", error);
  }
}

setupStorage();
