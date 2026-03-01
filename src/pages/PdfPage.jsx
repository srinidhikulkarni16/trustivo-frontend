import { useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import api from "../services/api";

/* PDF WORKER */
pdfjs.GlobalWorkerOptions.workerSrc =
  new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

export default function PdfPage() {

  const [fileUrl, setFileUrl] = useState(null);
  const [signatures, setSignatures] = useState([]);

  const containerRef = useRef();

  /* FILE SELECT */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileUrl(URL.createObjectURL(file));
  };

  /* ADD SIGNATURE ON CLICK */
  const handleClick = async (e) => {

    if (!containerRef.current) return;

    const rect =
      containerRef.current.getBoundingClientRect();

    const newSig = {
      id: Date.now(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      width: 150,
      height: 60,
      pageNumber: 1,
    };

    setSignatures(prev => [...prev, newSig]);

    try {
      await api.post("/api/signatures", newSig);
    } catch {
      console.log("signature save failed");
    }
  };

  /* UPDATE POSITION */
  const updateSignature = (id, data) => {
    setSignatures(prev =>
      prev.map(sig =>
        sig.id === id ? { ...sig, ...data } : sig
      )
    );
  };

  return (
    <div className="p-6 flex flex-col items-center">

      <h1 className="text-3xl font-bold mb-6">
        Upload & Place Signature
      </h1>

      {/* UPLOAD */}
      <label className="
        w-full max-w-xl
        mb-8
        p-8
        bg-gray-50
        border-2 border-dashed
        rounded-2xl
        text-center
        cursor-pointer
      ">
        Upload PDF
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {!fileUrl && (
        <p>Upload a PDF to start signing</p>
      )}

      {/* PDF */}
      {fileUrl && (
        <div
          ref={containerRef}
          onClick={handleClick}
          className="
            relative
            bg-white
            p-4
            shadow-xl
            rounded-xl
          "
        >

          <Document file={fileUrl}>
            <Page pageNumber={1} width={700} />
          </Document>

          {/* SIGNATURE BOXES */}
          {signatures.map(sig => (

            <Rnd
              key={sig.id}
              bounds="parent"
              size={{
                width: sig.width,
                height: sig.height,
              }}
              position={{
                x: sig.x,
                y: sig.y,
              }}

              onDragStop={(e, d) =>
                updateSignature(sig.id, {
                  x: d.x,
                  y: d.y,
                })
              }

              onResizeStop={(e, dir, ref, delta, pos) =>
                updateSignature(sig.id, {
                  width: ref.offsetWidth,
                  height: ref.offsetHeight,
                  ...pos,
                })
              }
            >
              <div className="
                w-full
                h-full
                border-2
                border-rose-900
                bg-rose-400/30
                rounded-md
                flex
                items-center
                justify-center
                text-sm
                font-semibold
              ">
                Sign Here
              </div>
            </Rnd>

          ))}

        </div>
      )}
    </div>
  );
}