
import React, { useState } from 'react';
import axios from 'axios';
import "./cssfiles/recruitpage.css";

export default function RecruitHome() {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


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
    if (file && category) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      try {
        const response = await axios.post('/api/upload', formData);
        console.log('File upload response:', response.data);

        setSuccess('File uploaded successfully!');
        setError(null);

        // Wait for the second API call to complete
        // try {
        //   const additionalResponse = await axios.post('http://127.0.0.1:8000/api/run_full_script');
        //   console.log('Second API call response:', additionalResponse.data);
        // } catch (additionalErr) {
        //   console.error('Error with second API call:', additionalErr);
        //   setError('Error with script execution: ' + additionalErr.response?.data?.message);
        //   setSuccess(null);
        // }

      } catch (err) {
        console.error('Error uploading file:', err);
        setError(err.response?.data?.message || 'Error uploading file');
        setSuccess(null);
      }
    } else {
      setError('Please select a file and choose a category before uploading');
      setSuccess(null);
    }
  };
 
  return (
    <div className='recruitpage'>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="custom-button"
      />
      <select onChange={handleCategoryChange} value={category}>
        <option value="" disabled>Select Category</option>
        <option value="web-designing">Web Designing</option>
        <option value="data-scientist">Data Scientist</option>
        <option value="database-management">Database Management</option>
      </select>
      <div className="uploadbutton">
        <button onClick={handleUpload}>Upload</button>
      </div>

      {error && (
        <div style={{ color: 'red', marginTop: '20px' }}>
          <strong>{error}</strong>
        </div>
      )}

      {success && (
        <div style={{ color: 'green', marginTop: '20px' }}>
          <strong>{success}</strong>
        </div>
        
      )}
      
    </div>
  );
}



