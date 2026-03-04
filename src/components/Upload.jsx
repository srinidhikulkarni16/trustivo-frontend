import { useState, useRef } from "react";
import { uploadDocument } from "../services/api";

const TYPE_CONFIG = {
  pdf:   { accept: "application/pdf", extensions: ".pdf", label: "PDF Document", icon: "📄" },
  photo: { accept: "image/png,image/jpeg,image/webp,image/gif", extensions: ".png,.jpg,.jpeg,.webp,.gif", label: "Image", icon: "🖼️" },
  word:  { accept: "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document", extensions: ".doc,.docx", label: "Word Document", icon: "📝" },
  excel: { accept: "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", extensions: ".xls,.xlsx", label: "Excel File", icon: "📊" },
};

export default function Upload({ type = "pdf", onUploadSuccess }) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.pdf;

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedMimes = config.accept.split(",");
    if (!allowedMimes.includes(selectedFile.type)) {
      setStatus({ type: "error", msg: `Only ${config.label} files are allowed (${config.extensions})` });
      e.target.value = null;
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setStatus({ type: "error", msg: "File too large (Max 5MB)" });
      e.target.value = null;
      return;
    }

    setFile(selectedFile);
    setStatus({ type: "", msg: "" });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      setStatus({ type: "error", msg: "Title and file are required" });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);

      await uploadDocument(formData);

      setStatus({ type: "success", msg: "Upload successful ✅" });

      if (onUploadSuccess) onUploadSuccess();

      setFile(null);
      setTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setStatus({
        type: "error",
        msg: error.response?.data?.message || "Upload failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-white shadow-xl rounded-2xl border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{config.icon}</span>
        <h2 className="text-2xl font-bold text-gray-800">Upload {config.label}</h2>
      </div>

      <div className="mb-5 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-700 font-medium">
        Only <span className="font-bold">{config.extensions}</span> files accepted
      </div>

      <form onSubmit={handleUpload} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Document Title</label>
          <input
            type="text"
            placeholder="Enter document title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-800 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">File Attachment</label>
          <input
            type="file"
            ref={fileInputRef}
            accept={config.accept}
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-rose-50 file:text-rose-900 hover:file:bg-rose-100 transition-all cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg transition-all 
            ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-rose-800 hover:bg-rose-900 shadow-rose-900/20 active:scale-[0.98]"}`}
        >
          {loading ? "Uploading..." : "Upload Document"}
        </button>
      </form>

      {status.msg && (
        <div className={`mt-6 p-4 rounded-xl text-sm font-medium border 
          ${status.type === "error" ? "bg-red-50 border-red-100 text-rose-700" : "bg-green-50 border-green-100 text-green-700"}`}>
          {status.msg}
        </div>
      )}
    </div>
  );
}