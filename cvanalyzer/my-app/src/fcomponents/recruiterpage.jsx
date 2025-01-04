import React, { useState } from "react";
import axios from "axios";
import "./cssfiles/recruiterpage.css";

export default function RecruiterPage() {
  const [usertype, setUsertype] = useState(""); // User role selection
  const [leaderboardData, setLeaderboardData] = useState(null); // Store fetched leaderboard data
  const [error, setError] = useState(""); // Store error message
  const [loading, setLoading] = useState(false); // Show loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading
    setError(""); // Clear any previous errors

    try {
      const response = await axios.post("/api/get-data", { usertype });
      setLeaderboardData(response.data.leaderboard); // Store the leaderboard data
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      if (err.response && err.response.data) {
        setError(`Error: ${err.response.data.error}`);
      } else {
        setError("Network error. Please try again later.");
      }
      setLeaderboardData(null); // Clear previous data on error
    } finally {
      setLoading(false); // Hide loading
    }
  };

  return (
    <div className="recruiter-page">
      <div className="logo"></div>
      <div className="section">
        <form onSubmit={handleSubmit} className="recruiter-form">
          <select
            value={usertype}
            onChange={(e) => setUsertype(e.target.value)}
            required
          >
            <option value="" disabled>
              Choose an option
            </option>
            <option value="web-designing">Web Developer</option>
            <option value="data-scientist">Data Scientist</option>
            <option value="database-management">Database Handler</option>
          </select>

          <button type="submit" className="findjobs" disabled={loading}>
            {loading ? "Loading..." : "FIND JOBS"}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        {leaderboardData && (
          <div className="leaderboard">
            <h2 className="leaderboardhead">Leaderboard</h2>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Score</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((item, index) => {
                  const downloadUrl = `https://oewyazfmpcfoxwjunwpp.supabase.co/storage/v1/object/pdf/public/${usertype}/${encodeURIComponent(
                    item["File Name"]
                  )}`;

                  return (
                    <tr key={index}>
                      <td>{item["File Name"]}</td>
                      <td>{item.Score}</td>
                      <td>
                        <a
                          href={downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
