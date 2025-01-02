const express = require("express");
const { createClient } = require("@supabase/supabase-js"); // Ensure proper Supabase client setup
const mime = require("mime-types");
const multer = require("multer");
const router = express.Router();

// Configure Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const storage = createClient(supabaseUrl, supabaseKey);

// Set up multer for handling file uploads
const storageEngine = multer.memoryStorage();
const upload = multer({ storage: storageEngine }).single("file");

// POST route for file upload
router.post("/", upload, async (req, res) => {
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

// Export the router as a serverless function for Vercel
module.exports = (req, res) => {
  router(req, res);
};
