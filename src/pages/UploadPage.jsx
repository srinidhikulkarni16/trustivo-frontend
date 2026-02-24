import { useParams } from "react-router-dom";
import Upload from "../components/Upload";

export default function UploadPage() {
  const { type } = useParams();

  const config = {
    word: { formats: ".doc,.docx", label: "Word Document" },
    excel: { formats: ".xls,.xlsx", label: "Excel File" },
  };

  const current = config[type] || { formats: "*", label: "File" };

  return (
    <div className="p-6 flex-grow flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 animate-[fadeIn_0.4s_ease-out]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Upload {current.label}
          </h1>
          <p className="text-gray-500">Securely upload your files to the vault.</p>
        </div>

        <Upload
          acceptedFormats={current.formats}
          label={current.label}
        />
      </div>
    </div>
  );
}