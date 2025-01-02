const express = require("express");
const storage = require("../bcomponents/database"); // Your Supabase setup file
const mime = require("mime-types");
const multer = require("multer");
const router = express.Router();
const mimeType = "application/pdf";

// Set up multer for file handling in serverless functions
const storageEngine = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storageEngine }).single("file"); // Expecting a single file upload with the field name 'file'

// POST route for file upload
router.post("/", upload, async (req, res) => {
  try {
    // Check if a file is sent
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.file; // The uploaded file object from req.file
    const category = req.body.category; // Get category from request body

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

    // Check if the file is empty
    if (file.buffer.length === 0) {
      return res.status(400).json({ message: "File is empty" });
    }

    // Check for the .emptyfolderplaceholder file and skip it
    if (file.originalname === ".emptyfolderplaceholder") {
      return res
        .status(400)
        .json({ message: "Empty folder placeholder file is not allowed" });
    }

    // Upload file directly to the Supabase Storage
    const { data, error } = await storage.upload(
      `public/${folder}${file.originalname}`,
      file.buffer,
      {
        contentType: mimeType,
        cacheControl: "3600",
        upsert: false, // Prevent overwriting existing files
      }
    );

    if (error) {
      console.error("Error uploading to Supabase:", error);
      return res
        .status(500)
        .json({ message: "Error uploading file to Supabase", error: error.message });
    }

    const fileUrl = `${storage.supabaseUrl}/storage/v1/object/public/${data.Key}`;

    // Respond with the file's metadata
    res.status(200).json({
      message: "File uploaded successfully!",
      metadata: {
        fileName: data.name,
        downloadUrl: fileUrl,
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
