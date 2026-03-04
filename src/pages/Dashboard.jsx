import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Upload from "../components/Upload";
import api from "../services/api";

const STATUS_LABEL = { draft: "Draft", completed: "Completed" };
const STATUS_STYLE = {
  draft:     "bg-yellow-100 text-yellow-700 border-yellow-200",
  completed: "bg-green-100 text-green-700 border-green-200",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) navigate("/login");
  }, [navigate]);

  const getFileIcon = (filePath = "") => {
    const ext = filePath.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "🖼️";
    if (["doc", "docx"].includes(ext)) return "📝";
    if (["xls", "xlsx"].includes(ext)) return "📊";
    return "📄";
  };

  const fetchDocuments = async () => {
    setMessage("");
    try {
      setLoading(true);
      const res = await api.get("/docs/my-documents");
      setDocuments(res.data || []);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const total     = documents.length;
  const completed = documents.filter((d) => d.status === "completed").length;
  const drafts    = documents.filter((d) => d.status === "draft").length;

  const filtered = documents
    .filter((d) => filter === "All" || d.status === filter)
    .filter((d) =>
      !search.trim() ||
      (d.title || d.file_name || "").toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/20 to-gray-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            Your <span className="text-rose-800">Dashboard</span>
          </h1>
          <p className="text-gray-500 text-sm">Manage and sign your documents securely.</p>
        </div>

        {/* STATS */}
        {total > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total",     value: total,     icon: "📁", color: "bg-rose-50   text-rose-800"   },
              { label: "Completed", value: completed,  icon: "✅", color: "bg-green-50  text-green-700"  },
              { label: "Drafts",    value: drafts,     icon: "📝", color: "bg-yellow-50 text-yellow-700" },
            ].map((s) => (
              <div key={s.label} className={`${s.color} rounded-2xl p-4 flex items-center gap-3 shadow-sm`}>
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="text-2xl font-extrabold leading-none">{s.value}</p>
                  <p className="text-xs font-medium mt-0.5 opacity-70">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* UPLOAD */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">📤 Upload Document</h3>
          <Upload onUploadSuccess={fetchDocuments} />
        </div>

        {message && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-rose-700 font-medium text-center">
            {message}
          </div>
        )}

        {/* DOCUMENTS */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h2 className="text-lg font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center text-sm">📄</span>
              Uploaded Documents
              {total > 0 && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-normal normal-case">
                  {filtered.length}/{total}
                </span>
              )}
            </h2>
            <button onClick={fetchDocuments} className="text-xs text-gray-400 hover:text-rose-700 underline font-medium transition-colors self-end sm:self-auto">
              Refresh
            </button>
          </div>

          {/* SEARCH + FILTER */}
          {total > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <input
                type="text"
                placeholder="🔍  Search documents…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-rose-400 outline-none text-sm transition-all"
              />
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1 self-start">
                {["All", "draft", "completed"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      filter === f ? "bg-white text-rose-800 shadow-sm" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {f === "All" ? "All" : STATUS_LABEL[f]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-3 text-gray-400 py-12">
              <div className="w-8 h-8 border-4 border-rose-100 border-t-rose-700 rounded-full animate-spin" />
              <span className="text-sm">Loading documents…</span>
            </div>
          )}

          {!loading && total > 0 && filtered.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-10">No documents match your search.</p>
          )}

          {!loading && filtered.length > 0 && (
            <ul className="space-y-3">
              {filtered.map((doc) => (
                <li
                  key={doc.id}
                  className="group flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 hover:bg-rose-50/40 border border-gray-100 hover:border-rose-200 rounded-2xl px-5 py-4 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div
                    className="flex items-center gap-3 min-w-0 cursor-pointer"
                    onClick={() => window.open(doc.public_url, "_blank")}
                  >
                    <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      {getFileIcon(doc.file_path)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-800 group-hover:text-rose-900 truncate transition-colors">
                          {doc.title || doc.file_name}
                        </p>
                        {doc.status && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_STYLE[doc.status] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                            {STATUS_LABEL[doc.status] || doc.status}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(doc.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 sm:mt-0 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/pdf/${doc.id}`)}
                      className="text-xs font-bold text-white bg-rose-800 hover:bg-rose-900 px-3 py-1.5 rounded-full transition-colors shadow-sm"
                    >
                      Sign
                    </button>
                    <button
                      onClick={() => navigate(`/signatures/${doc.id}`)}
                      className="text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => navigate(`/audit/${doc.id}`)}
                      className="text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
                    >
                      Audit
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => { localStorage.removeItem("accessToken"); navigate("/"); }}
            className="text-sm text-gray-400 hover:text-rose-700 underline font-medium transition-colors"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}