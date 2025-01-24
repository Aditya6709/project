const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const mime = require("mime-types");
const multer = require("multer");
const bodyParser = require("body-parser");

// Supabase Configuration (Use environment variables for security)
const supabaseUrl = "https://vbgxuijebobixzrqgvys.supabase.co/";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiZ3h1aWplYm9iaXh6cnFndnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4ODk1MjIsImV4cCI6MjA1MTQ2NTUyMn0.xchbHvyHL3Y1EQ5SQbKMA--CtVlRXsPNUieXTSRZYPY"; // Replace with your actual key
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware for JSON and CORS
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");  // Allow all origins
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS"); // Allow specific methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type"); // Allow headers
  next();
});

app.post("/api/getdata", async (req, res) => {
  const { usertype } = req.body;

  // Map usertype to file paths
  const fileMap = {
    "web-designing": "json/web-designing_structured_data.json",
    "data-scientist": "json/data-scientist_structured_data.json",
    "database-management": "json/database-management_structured_data.json",
  };

  const filePath = fileMap[usertype];
  if (!filePath) {
    return res.status(400).json({ error: "Invalid usertype" });
  }

  try {
    const storage = supabase.storage.from("pdf"); 
    const { data, error } = await storage.download(filePath);

    if (error) {
      console.error("Supabase Storage Error:", error);
      return res.status(500).json({ error: "Failed to fetch leaderboard data" });
    }

    const text = await data.text();
    const leaderboardData = JSON.parse(text);
    res.json({ leaderboard: leaderboardData });
  } catch (err) {
    console.error("Internal Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
  // Export for Vercel
  module.exports = app;