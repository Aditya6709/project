const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const mime = require("mime-types");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");

// Supabase Configuration (Use environment variables for security)
const supabaseUrl = "https://oewyazfmpcfoxwjunwpp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ld3lhemZtcGNmb3h3anVud3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MDE0NzgsImV4cCI6MjA1MDk3NzQ3OH0.wpJQbLcwvnTO-BW3D4d9R1LrLlUiBONPlzUtUU3Qb8w"; // Replace with your actual key, or use environment variables
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// CORS configuration for production and development
const corsOptions = {
  origin: [
    "https://project1-leahgi8qv-adityas-projects-5d4f1d8b.vercel.app", // Frontend URL
    "http://localhost:3000", // Local development
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true, // Allow credentials (if needed)
};

// Apply CORS middleware
app.use(cors(corsOptions));

app.use(bodyParser.json());

// POST route for file upload
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const category = req.body.category;

    // Validate file
    if (!file || file.buffer.length === 0) {
      return res.status(400).json({ message: "Invalid or empty file uploaded" });
    }

    // Validate category
    const folderMapping = {
      "web-designing": "web-designing/",
      "data-scientist": "data-scientist/",
      "database-management": "database-management/",
    };

    if (!folderMapping[category]) {
      return res.status(400).json({ message: "Invalid category selected" });
    }

    const folder = folderMapping[category];

    // Upload file to Supabase
    const { data, error } = await supabase.storage
      .from("pdf")
      .upload(`${folder}${file.originalname}`, file.buffer, {
        contentType: mime.lookup(file.originalname) || "application/octet-stream",
        cacheControl: "3600",
        upsert: false, // Avoid overwriting
      });

    if (error) {
      console.error("Supabase Upload Error:", error);
      return res.status(500).json({ message: "Failed to upload file", error: error.message });
    }

    // Generate public URL
    const { data: publicUrlData, error: publicUrlError } = supabase.storage
      .from("pdf")
      .getPublicUrl(`${folder}${file.originalname}`);

    if (publicUrlError) {
      console.error("Supabase Public URL Error:", publicUrlError);
      return res.status(500).json({ message: "Failed to generate public URL" });
    }

    // Respond with success
    res.status(200).json({
      message: "File uploaded successfully!",
      metadata: {
        fileName: file.originalname,
        downloadUrl: publicUrlData.publicUrl,
      },
    });
  } catch (error) {
    console.error("File Upload Route Error:", error);
    res.status(500).json({
      message: "An error occurred during file upload",
      error: error.message,
    });
  }
});

// POST route for leaderboard data
app.post("/api/get-data", async (req, res) => {
  const { usertype } = req.body;

  const filePathMapping = {
    "web-designing": "json/web-designing_structured_data.json",
    "data-scientist": "json/data-scientist_structured_data.json",
    "database-management": "json/database-management_structured_data.json",
  };

  const filePath = filePathMapping[usertype];
  if (!filePath) {
    return res.status(400).json({ error: "Invalid usertype provided" });
  }

  try {
    // Fetch file from Supabase
    const { data, error } = await supabase.storage.from("json").download(filePath);

    if (error) {
      console.error("Supabase Fetch Error:", error);
      return res.status(500).json({ error: "Failed to fetch leaderboard data" });
    }

    const fileContent = await data.text();
    const leaderboardData = JSON.parse(fileContent);

    res.json({ leaderboard: leaderboardData });
  } catch (err) {
    console.error("Leaderboard Fetch Error:", err);
    res.status(500).json({ error: "Internal server error while fetching leaderboard data" });
  }
});

// Export for Vercel
module.exports = app;
