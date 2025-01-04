const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const mime = require("mime-types");
const multer = require("multer");
const bodyParser = require("body-parser");

// Supabase Configuration (Use environment variables for security)
const supabaseUrl = "https://oewyazfmpcfoxwjunwpp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ld3lhemZtcGNmb3h3anVud3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MDE0NzgsImV4cCI6MjA1MDk3NzQ3OH0.wpJQbLcwvnTO-BW3D4d9R1LrLlUiBONPlzUtUU3Qb8w"; // Replace with your actual key
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