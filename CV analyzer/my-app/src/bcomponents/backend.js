const express = require("express");
const { createClient } = require("@supabase/supabase-js"); // Ensure proper Supabase client setup
const mime = require("mime-types");
const multer = require("multer");
const bodyparser = require("body-parser");
const cors = require("cors");

// Configure Supabase client
const supabaseUrl = 'https://oewyazfmpcfoxwjunwpp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ld3lhemZtcGNmb3h3anVud3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MDE0NzgsImV4cCI6MjA1MDk3NzQ3OH0.wpJQbLcwvnTO-BW3D4d9R1LrLlUiBONPlzUtUU3Qb8w';
const storage = createClient(supabaseUrl, supabaseKey);

const app = express();
const upload = multer({ storage: multer.memoryStorage() }); // Set up multer for handling file uploads

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyparser.json()); // Parse HTTP requests into `req.body` in JSON form

// POST route for file upload
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    // Validate uploaded file
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.file;
    const category = req.body.category;

    // Validate category
    const folderMapping = {
      "web-designing": "web-designing/",
      "data-scientist": "data-scientist/",
      "database-management": "database-management/",
    };

    if (!folderMapping[category]) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const folder = folderMapping[category];

    // Validate file content
    if (file.buffer.length === 0) {
      return res.status(400).json({ message: "File is empty" });
    }

    if (file.originalname === ".emptyfolderplaceholder") {
      return res
        .status(400)
        .json({ message: "Empty folder placeholder file is not allowed" });
    }

    // Upload file to Supabase storage
    const { data, error } = await storage.storage
      .from("pdf") // Bucket name
      .upload(`${folder}${file.originalname}`, file.buffer, {
        contentType: mime.lookup(file.originalname) || "application/octet-stream",
        cacheControl: "3600",
        upsert: false, // Avoid overwriting existing files
      });

    if (error) {
      console.error("Error uploading to Supabase:", error);
      return res.status(500).json({ message: "Failed to upload file", error: error.message });
    }

    // Generate public URL
    const { publicUrl } = storage.storage.from("pdf").getPublicUrl(`${folder}${file.originalname}`);
    if (!publicUrl) {
      return res.status(500).json({ message: "Failed to generate public URL" });
    }

    // Respond with success
    res.status(200).json({
      message: "File uploaded successfully!",
      metadata: {
        fileName: file.originalname,
        downloadUrl: publicUrl,
      },
    });
  } catch (error) {
    console.error("Error in file upload route:", error);
    res.status(500).json({
      message: "Error processing file upload",
      error: error.message,
    });
  }
});

// POST route for leaderboard data
app.post("/api/get-data", async (req, res) => {
  const { usertype } = req.body;  // Extract usertype from the body

  let filePath = '';
  switch (usertype) {
    case "web-designing":
      filePath = "json/web-designing_structured_data.json";
      break;
    case "data-scientist":
      filePath = "json/data-scientist_structured_data.json";
      break;
    case "database-management":
      filePath = "json/database-management_structured_data.json";
      break;
    default:
      return res.status(400).json({ error: "Invalid usertype" });
  }

  try {
    // Fetch file from Supabase
    const { data, error } = await storage.storage.from("json").download(filePath);

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(500).json({ error: "Failed to fetch leaderboard data" });
    }

    const text = await data.text();
    const leaderboardData = JSON.parse(text); // Parse the leaderboard JSON

    res.json({ leaderboard: leaderboardData });  // Send the data back to the frontend
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serverless function export for Vercel
module.exports = (req, res) => {
  app(req, res); // Let Vercel handle the routing
};
