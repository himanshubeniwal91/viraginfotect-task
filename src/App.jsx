import React, { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) return alert("Please select a file");

    try {
      
      const res = await axios.post("http://localhost:5000/generate-url", {
        fileName: file.name,
        fileType: file.type,
      });

      const { url } = res.data;
      console.log("Pre-signed URL:", url); // Added logging for debugging

      // this is for file upload on s3 
      await axios.put(url, file, {
        headers: { "Content-Type": file.type },
        timeout: 60000, // 60 seconds timeout
        onUploadProgress: (p) => {
          const percent = Math.round((p.loaded * 100) / p.total);
          setProgress(percent);
          setStatus(`${(p.loaded / (1024 * 1024)).toFixed(2)} MB uploaded`);
        },
      });

      setStatus("✅ Upload complete!");
    } catch (err) {
      console.error("Upload error:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      console.error("Error response:", err.response);
      setStatus(`❌ Upload failed: ${err.code || err.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-amber-200 gap-4">
    <h1 className="bg-green-400 text-red-500">task of virag-infotech </h1>
      <h1 className="text-2xl font-bold"> Upload Video to S3</h1>

      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="border p-2 bg-white"
      />

      <button
        onClick={uploadFile}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Upload
      </button>

      {progress > 0 && (
        <div className="w-1/2 bg-gray-300 rounded-full h-4 mt-2">
          <div
            className="bg-green-500 h-4 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      <p className="mt-2 text-gray-700">{status}</p>
    </div>
  );
}
