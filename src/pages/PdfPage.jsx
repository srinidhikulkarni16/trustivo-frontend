import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import api from "../services/api";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

const FONTS = [
  { 
    label: "Signature Script", 
    value: "'Dancing Script', cursive",
    url: "https://fonts.gstatic.com/s/dancingscript/v24/If2cXTr6YS-zF4S-kcSWSVi_sxjsohD9F50Ruu7BMSo3Sup8.ttf"
  },
  { 
    label: "Elegant Italic", 
    value: "'Pacifico', cursive",
    url: "https://fonts.gstatic.com/s/pacifico/v22/FwZY7-Qmy14u9lezJ96A4sijpFu_.ttf"
  },
  { 
    label: "Classic Serif", 
    value: "'Playfair Display', serif",
    url: "https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQZNLo_U2r.ttf"
  },
  { 
    label: "Clean Sans", 
    value: "'Inter', sans-serif",
    url: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.ttf"
  },
  { 
    label: "Typewriter", 
    value: "'Courier New', monospace",
    url: null // Built-in font
  },
];

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Pacifico&family=Playfair+Display:ital@1&family=Inter:wght@600&display=swap";

export default function PdfPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [docData, setDocData] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(!!documentId);

  const [signatures, setSignatures] = useState([]);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [pdfScale, setPdfScale] = useState(1.0);
  const [downloading, setDownloading] = useState(false);

  const [sigConfig, setSigConfig] = useState({
    name: "",
    font: FONTS[0].value,
    showDate: true,
    date: new Date().toLocaleDateString(),
  });

  const containerRef = useRef();
  const fileInputRef = useRef();

  // If documentId is in the URL, load the document from backend
  useEffect(() => {
    if (!documentId) return;
    const fetchDoc = async () => {
      try {
        setLoadingDoc(true);
        const res = await api.get("/docs/my-documents");
        const doc = res.data.find((d) => d.id === documentId);
        if (!doc) return navigate("/dashboard");
        setDocData(doc);
        setFileUrl(doc.public_url);
        setFileName(doc.title || doc.file_name);
      } catch (err) {
        console.error(err);
        navigate("/dashboard");
      } finally {
        setLoadingDoc(false);
      }
    };
    fetchDoc();
  }, [documentId]);

  /* ── FILE HANDLERS (local upload, only when no documentId) ── */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setFileUrl(URL.createObjectURL(file));
    setSignatures([]);
  };

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop      = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      setFileName(file.name);
      setFileUrl(URL.createObjectURL(file));
      setSignatures([]);
    }
  };

  /* ── SAVE SIGNATURE TO BACKEND ── */
  const saveSignature = async (signatureData) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      // Always include documentId so it shows in SignatureManager
      await api.post("/signatures", {
        ...signatureData,
        documentId: documentId || null,
      });
    } catch (err) {
      console.warn("Signature not saved to server:", err.response?.data?.message);
    }
  };

  /* ── PLACE SIGNATURE ON CLICK ── */
  const handleClick = async (e) => {
    if (!containerRef.current) return;
    if (e.target.closest(".rnd-sig-box")) return;

    const rect = containerRef.current.getBoundingClientRect();
    const newSig = {
      id: Date.now(),
      x: e.clientX - rect.left - 90,
      y: e.clientY - rect.top - 35,
      width: 200,
      height: 70,
      page: currentPage,
      name: sigConfig.name || "Your Name",
      font: sigConfig.font,
      showDate: sigConfig.showDate,
      date: sigConfig.date,
    };

    setSignatures((prev) => [...prev, newSig]);
    await saveSignature(newSig);
  };

  const updateSignature = (id, data) =>
    setSignatures((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));

  const removeSignature = (id, e) => {
    e.stopPropagation();
    setSignatures((prev) => prev.filter((s) => s.id !== id));
  };

  /* ── DOWNLOAD SIGNED PDF ── */
  const handleDownloadSigned = async () => {
    if (!fileUrl || signatures.length === 0) return;
    try {
      setDownloading(true);
      const existingPdfBytes = await fetch(fileUrl).then((r) => r.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      // Register fontkit to handle custom fonts
      pdfDoc.registerFontkit(fontkit);
      
      const pages = pdfDoc.getPages();
      
      // Cache embedded fonts so we don't fetch/embed the same font multiple times
      const embeddedFonts = {};

      for (const sig of signatures) {
        const page = pages[sig.page - 1];
        if (!page) continue;
        const { height } = page.getSize();
        const scale = page.getWidth() / pdfWidth;

        // Determine and embed the appropriate font
        let font;
        const fontInfo = FONTS.find(f => f.value === sig.font);
        
        if (!fontInfo || !fontInfo.url) {
          // Fallback or Typewriter built-in font
          font = await pdfDoc.embedFont("Courier");
        } else {
          // Fetch and embed the custom font
          if (!embeddedFonts[sig.font]) {
            try {
              const fontBytes = await fetch(fontInfo.url).then(r => r.arrayBuffer());
              embeddedFonts[sig.font] = await pdfDoc.embedFont(fontBytes);
            } catch (err) {
              console.warn(`Failed to load font ${sig.font}, using Helvetica fallback`);
              embeddedFonts[sig.font] = await pdfDoc.embedFont("Helvetica");
            }
          }
          font = embeddedFonts[sig.font];
        }

        page.drawText(sig.name, {
          x: sig.x * scale,
          y: height - (sig.y + sig.height * 0.6) * scale,
          size: Math.max(10, 14 * scale),
          font, // Apply the embedded font
          color: rgb(0.1, 0.1, 0.1),
        });

        if (sig.showDate) {
          page.drawText(sig.date, {
            x: sig.x * scale,
            y: height - (sig.y + sig.height * 0.85) * scale,
            size: Math.max(7, 8 * scale),
            font, // Apply the embedded font to date as well
            color: rgb(0.4, 0.4, 0.4),
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `signed_${fileName}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to generate signed PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const pdfWidth = Math.round(700 * pdfScale);
  const pageSignatures = signatures.filter((s) => s.page === currentPage);

  if (loadingDoc) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/20 to-gray-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <div className="w-10 h-10 border-4 border-rose-100 border-t-rose-700 rounded-full animate-spin" />
        <p className="text-sm">Loading document…</p>
      </div>
    </div>
  );

  return (
    <>
      <link rel="stylesheet" href={GOOGLE_FONTS_URL} />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/20 to-gray-100 p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">

          {/* HEADER */}
          <div className="mb-8">
            {documentId && (
              <button onClick={() => navigate("/dashboard")}
                className="text-sm text-gray-400 hover:text-rose-700 font-medium transition-colors mb-4 flex items-center gap-1">
                ← Back to Dashboard
              </button>
            )}
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                PDF <span className="text-rose-800">Signature</span> Placer
              </h1>
              <p className="text-gray-500 text-sm">
                {documentId ? `Signing: ${fileName}` : "Upload a PDF · Customize your signature · Click to place"}
              </p>
            </div>
          </div>

          {/* SIGNATURE CONFIG — visible once file is loaded */}
          {fileUrl && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">✍ Signature Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Signer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Smith"
                    value={sigConfig.name}
                    onChange={(e) => setSigConfig((c) => ({ ...c, name: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Signature Font</label>
                  <select
                    value={sigConfig.font}
                    onChange={(e) => setSigConfig((c) => ({ ...c, font: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-rose-400 outline-none text-sm transition-all cursor-pointer"
                  >
                    {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      onChange={(e) => {
                        const d = new Date(e.target.value);
                        setSigConfig((c) => ({ ...c, date: d.toLocaleDateString(), showDate: true }));
                      }}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-rose-400 outline-none text-sm transition-all"
                    />
                    <button
                      onClick={() => setSigConfig((c) => ({ ...c, showDate: !c.showDate }))}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        sigConfig.showDate
                          ? "bg-rose-50 border-rose-200 text-rose-700"
                          : "bg-gray-100 border-gray-200 text-gray-400"
                      }`}
                    >
                      {sigConfig.showDate ? "On" : "Off"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4 pt-4 border-t border-gray-50">
                <p className="text-xs text-gray-400 mb-2 font-medium">Preview</p>
                <div className="inline-flex flex-col items-start bg-rose-50/80 border-2 border-rose-300 rounded-xl px-5 py-3 min-w-[200px]">
                  <span style={{ fontFamily: sigConfig.font, fontSize: "1.25rem", color: "#1c1917" }}>
                    {sigConfig.name || "Your Name"}
                  </span>
                  {sigConfig.showDate && (
                    <span className="text-[10px] text-gray-400 mt-0.5">{sigConfig.date}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* UPLOAD ZONE — only when no documentId */}
          {!fileUrl && !documentId && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full max-w-2xl mx-auto p-16 rounded-3xl border-2 border-dashed cursor-pointer
                flex flex-col items-center gap-4 transition-all duration-300
                ${isDragging
                  ? "border-rose-500 bg-rose-50 scale-[1.02] shadow-xl"
                  : "border-gray-200 bg-white hover:border-rose-300 hover:bg-rose-50/50 hover:shadow-lg"
                }`}
            >
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl transition-all
                ${isDragging ? "bg-rose-200 scale-110" : "bg-rose-100"}`}>📄</div>
              <div className="text-center">
                <p className="font-bold text-gray-800 text-xl">
                  {isDragging ? "Drop it!" : "Upload PDF Document"}
                </p>
                <p className="text-gray-400 text-sm mt-1">Drag & drop or click to browse</p>
              </div>
              <div className="px-5 py-2.5 bg-rose-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-900/20">
                Choose File
              </div>
              <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
            </div>
          )}

          {/* TOOLBAR */}
          {fileUrl && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">📄</div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate max-w-[200px]">{fileName}</p>
                  <p className="text-xs text-gray-400">{numPages} page{numPages !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {numPages > 1 && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 font-bold text-gray-600 transition-all">‹</button>
                  <span className="text-sm font-semibold text-gray-700 min-w-[80px] text-center">{currentPage} / {numPages}</span>
                  <button onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))} disabled={currentPage === numPages}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 font-bold text-gray-600 transition-all">›</button>
                </div>
              )}

              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-100">
                <button onClick={() => setPdfScale((s) => Math.max(0.5, +(s - 0.25).toFixed(2)))}
                  className="w-6 h-6 rounded hover:bg-gray-200 font-bold text-gray-500 transition-all">−</button>
                <span className="text-sm font-semibold text-gray-700 w-12 text-center">{Math.round(pdfScale * 100)}%</span>
                <button onClick={() => setPdfScale((s) => Math.min(2, +(s + 0.25).toFixed(2)))}
                  className="w-6 h-6 rounded hover:bg-gray-200 font-bold text-gray-500 transition-all">+</button>
              </div>

              <div className="flex items-center gap-3">
                {signatures.length > 0 && (
                  <span className="text-xs bg-rose-100 text-rose-800 font-bold px-3 py-1.5 rounded-full">
                    ✍ {signatures.length} placed
                  </span>
                )}
                {/* Only show "Change file" if not viewing a stored document */}
                {!documentId && (
                  <button onClick={() => { setFileUrl(null); setSignatures([]); setFileName(""); setCurrentPage(1); }}
                    className="text-xs text-gray-400 hover:text-rose-700 underline font-medium transition-colors">
                    Change file
                  </button>
                )}
              </div>
            </div>
          )}

          {/* HINT */}
          {fileUrl && (
            <div className="mb-3 flex items-center gap-2 text-xs text-gray-400 bg-white/70 px-4 py-2 rounded-xl border border-gray-100">
              <span>💡</span>
              <span>Click anywhere on the PDF to stamp your signature · Drag to reposition · Resize from corner · Hover ✕ to remove</span>
            </div>
          )}

          {/* PDF VIEWER */}
          {fileUrl && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 overflow-auto">
              <div ref={containerRef} onClick={handleClick} className="relative inline-block cursor-crosshair" style={{ userSelect: "none" }}>
                <Document
                  file={fileUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={
                    <div className="flex items-center justify-center" style={{ width: pdfWidth, height: 500 }}>
                      <div className="flex flex-col items-center gap-3 text-gray-300">
                        <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-700 rounded-full animate-spin" />
                        <span className="text-sm">Loading PDF…</span>
                      </div>
                    </div>
                  }
                >
                  <Page pageNumber={currentPage} width={pdfWidth} renderTextLayer={false} renderAnnotationLayer={false} />
                </Document>

                {pageSignatures.map((sig) => (
                  <Rnd
                    key={sig.id}
                    className="rnd-sig-box z-10"
                    bounds="parent"
                    size={{ width: sig.width, height: sig.height }}
                    position={{ x: sig.x, y: sig.y }}
                    onDragStop={(e, d) => updateSignature(sig.id, { x: d.x, y: d.y })}
                    onResizeStop={(e, dir, ref, delta, pos) =>
                      updateSignature(sig.id, { width: ref.offsetWidth, height: ref.offsetHeight, ...pos })
                    }
                    enableResizing={{ bottomRight: true }}
                    minWidth={120} minHeight={50}
                  >
                    <div className="group relative w-full h-full border-2 border-rose-600 bg-white/95 rounded-xl shadow-lg flex flex-col items-start justify-center px-3 cursor-move hover:border-rose-800 hover:shadow-xl transition-all overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-600 rounded-l-xl" />
                      <span style={{ fontFamily: sig.font, fontSize: "1.1rem", color: "#1c1917", lineHeight: 1.2 }}
                        className="ml-3 pointer-events-none truncate w-full">
                        {sig.name}
                      </span>
                      {sig.showDate && (
                        <span className="ml-3 text-[10px] text-gray-400 mt-0.5 pointer-events-none">{sig.date}</span>
                      )}
                      <button
                        onClick={(e) => removeSignature(sig.id, e)}
                        className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-rose-700 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-rose-900 hover:scale-110"
                      >✕</button>
                      <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-rose-400 opacity-50 pointer-events-none" />
                    </div>
                  </Rnd>
                ))}
              </div>
            </div>
          )}

          {/* SIGNATURES SUMMARY */}
          {signatures.length > 0 && (
            <div className="mt-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">
                  Placed Signatures ({signatures.length})
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownloadSigned}
                    disabled={downloading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-lg transition-all
                      ${downloading ? "bg-gray-400 cursor-not-allowed" : "bg-rose-800 hover:bg-rose-900 hover:shadow-rose-900/20 active:scale-[0.98]"}`}
                  >
                    {downloading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating…
                      </>
                    ) : "⬇ Download Signed PDF"}
                  </button>
                  {documentId && (
                    <button
                      onClick={() => navigate(`/signatures/${documentId}`)}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                    >
                      Manage ✍
                    </button>
                  )}
                  <button onClick={() => setSignatures([])}
                    className="text-xs text-gray-300 hover:text-rose-600 transition-colors font-medium">
                    Clear all
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {signatures.map((sig, i) => (
                  <div key={sig.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 hover:border-rose-100 transition-all">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-rose-100 text-rose-800 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <div>
                        <span style={{ fontFamily: sig.font }} className="text-gray-800 font-medium">{sig.name}</span>
                        <span className="text-gray-400 text-xs ml-2">
                          Page {sig.page} · ({Math.round(sig.x)}, {Math.round(sig.y)})
                          {sig.showDate ? ` · ${sig.date}` : ""}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setSignatures((prev) => prev.filter((s) => s.id !== sig.id))}
                      className="text-gray-200 hover:text-rose-500 transition-colors font-bold text-base">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}