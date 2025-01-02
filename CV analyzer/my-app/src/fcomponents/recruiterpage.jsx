import React, { useState } from "react";
import axios from "axios";
import "./cssfiles/recruiterpage.css";

export default function RecruiterPage() {
  const [usertype, setUsertype] = useState(""); // User role selection
  const [leaderboardData, setLeaderboardData] = useState(null); // Store fetched leaderboard data
  const [error, setError] = useState(""); // Store error message

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3001/get-data", { usertype });
      setLeaderboardData(response.data.leaderboard); // Store the leaderboard data
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Axios Error: ", err);
      if (err.response) {
        console.error("Backend Error Response:", err.response.data);
        setError(`Error from backend: ${err.response.data.error}`);
      } else {
        setError("Error fetching leaderboard. Please try again.");
      }
      setLeaderboardData(null); // Clear previous data on error
    }
  };

  return (
    <div className="recruiter-page">
      <div className="logo"></div>
      <div className="section">
        <form onSubmit={handleSubmit} className="recruiter-form">
          <select value={usertype} onChange={(e) => setUsertype(e.target.value)}>
            <option value="" disabled>
              Choose an option
            </option>
            <option value="web-designing">Web Developer</option>
            <option value="data-scientist">Data Scientist</option>
            <option value="database-management">Database Handler</option>
          </select>

          <button type="submit" className="findjobs">FIND JOBS</button>
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
                  const downloadUrl = `https://oewyazfmpcfoxwjunwpp.supabase.co/storage/v1/object/pdf/public/${usertype}/${encodeURIComponent(item["File Name"])}`;
                  console.log(`Download URL for ${item["File Name"]}: ${downloadUrl}`);

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
