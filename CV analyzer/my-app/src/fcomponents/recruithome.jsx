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
    const uploadResponse = await axios.post("/upload", formData);
    console.log("File upload response:", uploadResponse.data);

    setSuccess("File uploaded successfully!");
    setError(null);

    // Second API call commented out
    // try {
    //   const scriptResponse = await axios.post("/api/run_full_script");
    //   console.log("Script execution response:", scriptResponse.data);

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
