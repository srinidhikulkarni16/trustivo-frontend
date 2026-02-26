import React, { useState } from "react";
import api from "../services/api";

export default function Upload({
  acceptedFormats = "*",
  label = "File",
  fileFieldName = "file",
  uploadEndpoint = "/docs/upload",
  onUploadSuccess
}) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      return setMessage(`Please select a ${label} first`);
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append(fileFieldName, file);

      const res = await api.post(uploadEndpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      setMessage(res.data.message || `${label} uploaded successfully`);
      setFile(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setMessage(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-100 rounded-3xl p-8 w-full max-w-md mx-auto bg-white shadow-xl shadow-rose-950/10 transition-all hover:scale-[1.01] duration-300">

      {/* File selection */}
      <div className="flex flex-col items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-rose-50 hover:border-rose-800 transition-all duration-300">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-10 h-10 mb-3 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-rose-900">Click to upload</span> or drag & drop
            </p>
          </div>
          <input
            type="file"
            accept={acceptedFormats}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Selected file */}
      {file && (
        <div className="mt-4 p-3 bg-rose-50 rounded-xl flex items-center justify-between border border-rose-100 shadow-sm animate-[fadeIn_0.3s_ease-out]">
          <span className="text-sm text-rose-900 font-medium truncate pr-4">{file.name}</span>
          <button
            onClick={() => setFile(null)}
            className="text-rose-900 hover:text-rose-700 transition-colors font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-rose-900 text-white font-bold px-4 py-3 mt-6 rounded-xl w-full hover:bg-rose-950 hover:shadow-lg hover:shadow-rose-900/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
      >
        {loading ? <span className="animate-pulse">Uploading...</span> : `Upload ${label}`}
      </button>

      {/* Feedback message */}
      {message && (
        <p className={`mt-4 text-sm text-center font-medium ${message.includes("failed") || message.includes("Please select") ? "text-red-700" : "text-rose-800"} animate-[fadeIn_0.3s_ease-out]`}>
          {message}
        </p>
      )}
    </div>
  );
}