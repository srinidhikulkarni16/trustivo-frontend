import Upload from "../components/Upload";

export default function PdfPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Upload PDF</h1>

      <Upload
        acceptedFormats="application/pdf"
        label="PDF"
        fileFieldName="pdf"
      />
    </div>
  );
}