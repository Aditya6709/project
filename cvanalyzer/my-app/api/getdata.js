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
    const { data, error } = await storage.download(filePath);

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
  
  // Export for Vercel
  module.exports = app;