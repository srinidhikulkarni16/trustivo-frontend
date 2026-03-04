import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import { PDFDocument, rgb } from "pdf-lib";
import api from "../services/api";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

const FONTS = [
  { label: "Signature Script", value: "'Dancing Script', cursive" },
  { label: "Elegant Italic", value: "'Pacifico', cursive" },
  { label: "Classic Serif", value: "'Playfair Display', serif" },
  { label: "Clean Sans", value: "'Inter', sans-serif" },
  { label: "Typewriter", value: "'Courier New', monospace" },
];

export default function PublicSignPage() {
  const { token } = useParams();
  const [tokenData, setTokenData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [fileUrl, setFileUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sig, setSig] = useState({ x: 100, y: 200, width: 200, height: 70 });
  const [sigConfig, setSigConfig] = useState({
    name: "",
    font: FONTS[0].value,
    showDate: true,
    date: new Date().toLocaleDateString(),
  });

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/signatures/public/${token}`);
        setTokenData(res.data);
        setSigConfig((c) => ({ ...c, name: res.data.signerName || "" }));
        if (res.data.document?.public_url) {
          setFileUrl(res.data.document.public_url);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Invalid or expired signing link");
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token]);

  const handleSubmit = async () => {
    if (!sigConfig.name.trim()) return alert("Please enter your name");
    try {
      setSubmitting(true);
      await api.post(`/signatures/public/${token}/sign`, {
        x: sig.x, y: sig.y,
        width: sig.width, height: sig.height,
        page: currentPage,
        name: sigConfig.name,
        font: sigConfig.font,
        showDate: sigConfig.showDate,
        date: sigConfig.date,
      });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit signature");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/20 to-gray-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <div className="w-10 h-10 border-4 border-rose-100 border-t-rose-700 rounded-full animate-spin" />
        <p className="text-sm">Verifying signing link…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/20 to-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Invalid Link</h2>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/20 to-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Signed!</h2>
        <p className="text-gray-500 text-sm">Your signature has been submitted successfully. You may close this window.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/20 to-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            Sign <span className="text-rose-800">Document</span>
          </h1>
          <p className="text-gray-500 text-sm">
            You've been invited to sign this document · Drag the signature box to position it · Click Submit when ready
          </p>
        </div>

        {/* Signer Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Signing as</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-800 font-bold">
              {tokenData?.signerName?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{tokenData?.signerName}</p>
              <p className="text-xs text-gray-400">{tokenData?.signerEmail}</p>
            </div>
          </div>
        </div>

        {/* Signature Config */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">✍ Signature Settings</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={sigConfig.name}
                onChange={(e) => setSigConfig((c) => ({ ...c, name: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-rose-400 outline-none text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Signature Font</label>
              <select
                value={sigConfig.font}
                onChange={(e) => setSigConfig((c) => ({ ...c, font: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-rose-400 outline-none text-sm transition-all"
              >
                {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>
          {/* Preview */}
          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-xs text-gray-400 mb-2">Preview</p>
            <div className="inline-flex flex-col items-start bg-rose-50/80 border-2 border-rose-300 rounded-xl px-5 py-3 min-w-[200px]">
              <span style={{ fontFamily: sigConfig.font, fontSize: "1.25rem", color: "#1c1917" }}>
                {sigConfig.name || "Your Name"}
              </span>
              {sigConfig.showDate && <span className="text-[10px] text-gray-400 mt-0.5">{sigConfig.date}</span>}
            </div>
          </div>
        </div>

        {/* PDF Viewer */}
        {fileUrl && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-4">
            <p className="text-xs text-gray-400 mb-3 flex items-center gap-2">
              <span>💡</span> Drag the signature box to where you want to sign
            </p>

            {numPages > 1 && (
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 font-bold text-gray-600">‹</button>
                <span className="text-sm font-semibold text-gray-700">{currentPage} / {numPages}</span>
                <button onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))} disabled={currentPage === numPages}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 font-bold text-gray-600">›</button>
              </div>
            )}

            <div className="relative inline-block" style={{ userSelect: "none" }}>
              <Document file={fileUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                <Page pageNumber={currentPage} width={700} renderTextLayer={false} renderAnnotationLayer={false} />
              </Document>

              <Rnd
                bounds="parent"
                size={{ width: sig.width, height: sig.height }}
                position={{ x: sig.x, y: sig.y }}
                onDragStop={(e, d) => setSig((s) => ({ ...s, x: d.x, y: d.y }))}
                onResizeStop={(e, dir, ref, delta, pos) =>
                  setSig({ width: ref.offsetWidth, height: ref.offsetHeight, ...pos })
                }
                enableResizing={{ bottomRight: true }}
                minWidth={120} minHeight={50}
                className="z-10"
              >
                <div className="group relative w-full h-full border-2 border-rose-600 bg-white/95 rounded-xl shadow-lg flex flex-col items-start justify-center px-3 cursor-move overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-600 rounded-l-xl" />
                  <span style={{ fontFamily: sigConfig.font, fontSize: "1.1rem", color: "#1c1917" }}
                    className="ml-3 pointer-events-none truncate w-full">
                    {sigConfig.name || "Your Name"}
                  </span>
                  {sigConfig.showDate && (
                    <span className="ml-3 text-[10px] text-gray-400 mt-0.5 pointer-events-none">{sigConfig.date}</span>
                  )}
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-rose-400 opacity-50 pointer-events-none" />
                </div>
              </Rnd>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-8 py-3.5 rounded-xl text-white font-bold shadow-lg transition-all
              ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-rose-800 hover:bg-rose-900 hover:shadow-rose-900/20 active:scale-[0.98]"}`}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting…
              </span>
            ) : "✍ Submit Signature"}
          </button>
        </div>
      </div>
    </div>
  );
}