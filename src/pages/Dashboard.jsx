import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Upload from "../components/Upload";
import api from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // Inline message state

  // Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) navigate("/login");
  }, [navigate]);

  // Build public URL for document
  const getPublicUrl = (filePath) => {
    const projectUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${projectUrl}/storage/v1/object/public/documents/${filePath}`;
  };

  // Fetch documents from API
  const fetchDocuments = async () => {
    setMessage(""); // Clear any previous messages
    try {
      setLoading(true);
      const res = await api.get("/dashboard/data", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      const docsWithUrls = res.data.map((doc) => ({
        ...doc,
        fileUrl: getPublicUrl(doc.file_path),
      }));
      setDocuments(docsWithUrls);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  return (
    <div className="p-4 sm:p-8 flex-grow">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-rose-950/5 p-6 sm:p-10 border border-gray-100">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-1">Your Dashboard</h1>
            <p className="text-gray-500 text-sm">Manage and sign your documents securely.</p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 sm:mt-0 px-5 py-2.5 bg-rose-50 text-rose-900 font-semibold rounded-xl hover:bg-rose-100 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Upload Section */}
        <div className="mb-12">
          <Upload onUploadSuccess={fetchDocuments} />
        </div>

        {/* Inline message */}
        {message && (
          <p className="mb-4 text-center text-sm text-red-600 font-medium animate-[fadeIn_0.3s_ease-out]">
            {message}
          </p>
        )}

        {/* Uploaded Documents */}
        <div>
          <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
            <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-900 flex items-center justify-center mr-3 text-sm">📄</span>
            Uploaded PDFs
          </h2>

          {loading && <div className="text-gray-400">Loading documents...</div>}

          {!loading && documents.length === 0 && (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">No documents uploaded yet.</p>
            </div>
          )}

          <ul className="space-y-3">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="group border border-gray-100 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white hover:bg-rose-50/40 hover:border-rose-200 transition-all duration-300 cursor-pointer shadow-sm"
                onClick={() => navigate("/pdf", { state: { documentId: doc.id, fileUrl: doc.fileUrl } })}
              >
                <span className="font-semibold text-gray-800 group-hover:text-rose-900 truncate w-full sm:w-auto mb-2 sm:mb-0 transition-colors">
                  {doc.title}
                </span>
                <span className="text-sm font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full group-hover:bg-white transition-colors">
                  {new Date(doc.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}