import React, { useState } from "react";
import axios from "axios";
import "./cssfiles/recruitpage.css";

export default function RecruitHome() {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError(null);
    setSuccess(null);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setError(null);
  };

  const handleUpload = async () => {
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

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    try {
      // First API call: Upload the file
      const uploadResponse = await axios.post("/api/upload", formData);
      console.log("File upload response:", uploadResponse.data);

      setSuccess("File uploaded successfully!");
      setError(null);

      // Second API call: Trigger the backend script
      // try {
      //   const scriptResponse = await axios.post("/api/run_full_script");
      //   console.log("Script execution response:", scriptResponse.data);

      //   // Update success message to reflect both operations
      //   setSuccess("File uploaded and script executed successfully!");
      // } catch (scriptError) {
      //   console.error("Error with script execution:", scriptError);
      //   setError(
      //     scriptError.response?.data?.error ||
      //       "Error executing backend script. Please try again later."
      //   );
      //   setSuccess(null);
      // }
    } catch (uploadError) {
      console.error("Error uploading file:", uploadError);
      setError(
        uploadError.response?.data?.error || "Error uploading file. Please try again later."
      );
      setSuccess(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="recruitpage">
      <div className="file-upload-section">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="custom-button"
        />
        <select onChange={handleCategoryChange} value={category}>
          <option value="" disabled>
            Select Category
          </option>
          <option value="web-designing">Web Designing</option>
          <option value="data-scientist">Data Scientist</option>
          <option value="database-management">Database Management</option>
        </select>
        <div className="uploadbutton">
          <button onClick={handleUpload} disabled={isLoading}>
            {isLoading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: "red", marginTop: "20px" }}>
          <strong>{error}</strong>
        </div>
      )}

      {success && (
        <div style={{ color: "green", marginTop: "20px" }}>
          <strong>{success}</strong>
        </div>
      )}
    </div>
  );
}

