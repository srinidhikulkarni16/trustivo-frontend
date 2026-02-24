import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import Upload from "../components/Upload";
import api from "../services/api";
// import supabase from "../config/supabase";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function FileDashboard({ type }) {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [numPages, setNumPages] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) navigate("/login");
  }, [navigate]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/dashboard/${type}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [type]);

  const getPublicUrl = (filePath) => {
    const { data } = supabase.storage
      .from("documents")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold capitalize">
            {type} Dashboard
          </h1>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Upload */}
        <Upload fileType={type} onUploadSuccess={fetchDocuments} />

        {/* File List */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Uploaded {type}s
          </h2>

          {loading && <p>Loading...</p>}
          {!loading && documents.length === 0 && (
            <p>No {type}s uploaded yet.</p>
          )}

          <ul className="space-y-3">
            {documents.map((doc) => (
              <li
                key={doc.id}
                onClick={() =>
                  setSelectedFile(getPublicUrl(doc.file_path))
                }
                className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
              >
                {doc.title}
              </li>
            ))}
          </ul>
        </div>

        {/*PDF Preview*/}
        {type === "pdf" && selectedFile && (
          <div className="mt-6">
            <Document
              file={selectedFile}
              onLoadSuccess={onDocumentLoadSuccess}
            >
              {Array.from(new Array(numPages), (_, index) => (
                <Page
                  key={index}
                  pageNumber={index + 1}
                  width={600}
                />
              ))}
            </Document>
          </div>
        )}

        {/* Image Preview */}
        {type === "photo" && selectedFile && (
          <div className="mt-6">
            <img
              src={selectedFile}
              alt="Preview"
              className="max-w-full rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}