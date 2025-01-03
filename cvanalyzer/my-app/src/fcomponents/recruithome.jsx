import React, { useState } from "react";
import axios from "axios";
import "./cssfiles/recruitpage.css";

export default function RecruitHome() {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile || null); // Ensure file is null if no file selected
    setError(null); // Reset error messages
    setSuccess(null); // Reset success messages
  };

  // Handle category selection
  const handleCategoryChange = (event) => {
    setCategory(event.target.value || ""); // Ensure category is valid
    setError(null); // Reset error messages
  };

  // Handle file upload
  const handleUpload = async () => {
    // Input validation
    if (!file) {
      setError("Please select a file before uploading.");
      setSuccess(null);
      return;
    }

    if (!category) {
      setError("Please select a category before uploading.");
      setSuccess(null);
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    // Start upload process
    setIsLoading(true);
    setError(null); // Clear previous errors
    setSuccess(null); // Clear previous success messages

    try {
      const uploadResponse = await axios.post("/api/upload", formData);
      console.log("File upload response:", uploadResponse.data);

      setSuccess("File uploaded successfully!");
    } catch (uploadError) {
      console.error("Error uploading file:", uploadError);

      setError(
        uploadError.response?.data?.error || "Error uploading file. Please try again later."
      );
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div className="recruitpage">
      <div className="file-upload-section">
        {/* File Input */}
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="custom-button"
        />

        {/* Category Dropdown */}
        <select onChange={handleCategoryChange} value={category}>
          <option value="" disabled>
            Select Category
          </option>
          <option value="web-designing">Web Designing</option>
          <option value="data-scientist">Data Scientist</option>
          <option value="database-management">Database Management</option>
        </select>

        {/* Upload Button */}
        <div className="uploadbutton">
          <button onClick={handleUpload} disabled={isLoading}>
            {isLoading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ color: "red", marginTop: "20px" }}>
          <strong>{error}</strong>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div style={{ color: "green", marginTop: "20px" }}>
          <strong>{success}</strong>
        </div>
      )}
    </div>
  );
}


