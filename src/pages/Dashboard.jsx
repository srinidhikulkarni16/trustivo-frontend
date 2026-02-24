import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import Upload from "../components/Upload";
import api from "../services/api";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [numPages, setNumPages] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) navigate("/login");
  }, [navigate]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard/data", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  const getPublicUrl = (filePath) => {
    const { data } = supabase.storage.from("documents").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  return (
    <div className="p-4 sm:p-8 flex-grow">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 sm:p-10 border border-gray-100 animate-[fadeIn_0.4s_ease-out]">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-1">
              Your Dashboard
            </h1>
            <p className="text-gray-500 text-sm">Manage and view your documents securely.</p>
          </div>

          <button
            onClick={handleLogout}
            className="mt-4 sm:mt-0 px-5 py-2.5 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 hover:text-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Upload Section */}
        <div className="mb-12">
          <Upload onUploadSuccess={fetchDocuments} />
        </div>

        {/* Uploaded PDFs */}
        <div>
          <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm">📄</span>
            Uploaded PDFs
          </h2>

          {loading && (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-12 bg-gray-100 rounded-xl"></div>
                <div className="h-12 bg-gray-100 rounded-xl"></div>
              </div>
            </div>
          )}

          {!loading && documents.length === 0 && (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">No documents uploaded yet.</p>
            </div>
          )}

          <ul className="space-y-3">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="group border border-gray-100 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white hover:bg-blue-50/50 hover:border-blue-200 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                onClick={() => setSelectedPdf(getPublicUrl(doc.file_path))}
              >
                <span className="font-semibold text-gray-800 group-hover:text-blue-700 truncate w-full sm:w-auto mb-2 sm:mb-0 transition-colors">
                  {doc.title}
                </span>
                <span className="text-sm font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full group-hover:bg-white transition-colors">
                  {new Date(doc.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* PDF Preview */}
        {selectedPdf && (
          <div className="mt-10 p-6 border border-gray-100 rounded-3xl bg-gray-50 shadow-inner animate-[slideUp_0.4s_ease-out]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800">Document Preview</h3>
              <button
                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
                onClick={() => setSelectedPdf(null)}
              >
                Close
              </button>
            </div>

            <div className="overflow-auto max-h-[600px] flex justify-center bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <Document
                file={selectedPdf}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div className="animate-pulse text-gray-400">Loading PDF...</div>}
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={Math.min(window.innerWidth * 0.8, 700)}
                    className="mb-4 shadow-md rounded-lg overflow-hidden"
                  />
                ))}
              </Document>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}