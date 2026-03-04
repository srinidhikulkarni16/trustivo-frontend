import { useNavigate } from "react-router-dom";

export default function Documents() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login");
    } else {
      navigate("/upload/pdf");   // ✅ go to upload
    }
  };

  const features = [
    {
      icon: "✍️",
      title: "Place Signatures",
      desc: "Drag and drop signature fields anywhere on your PDF with pixel-perfect precision.",
    },
    {
      icon: "🔗",
      title: "Send Sign Links",
      desc: "Generate secure signing links and email them to external signers instantly.",
    },
    {
      icon: "📋",
      title: "Audit Trail",
      desc: "Every action is logged — who signed, when, and from which IP address.",
    },
    {
      icon: "✅",
      title: "Track Status",
      desc: "Monitor signature status in real time: Pending, Signed, or Rejected.",
    },
  ];

  return (
    <div className="flex-grow bg-gradient-to-br from-gray-50 via-rose-50/20 to-gray-100 py-16 px-4 sm:px-10">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            PDF <span className="text-rose-800">Document Signing</span>
          </h2>
          <p className="text-gray-400 mt-3 text-sm max-w-md mx-auto">
            Everything you need to upload, sign, and manage your PDF documents securely in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

          <div
            onClick={handleGetStarted}
            className="group cursor-pointer bg-white border border-gray-100 shadow-sm rounded-3xl p-12 text-center hover:shadow-xl hover:-translate-y-2 hover:border-rose-200 transition-all duration-300"
          >
            <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center text-5xl mx-auto mb-6 group-hover:scale-110 transition-all duration-300">
              📄
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              PDF Documents
            </h3>
            <p className="text-sm text-gray-400 mb-8">
              Upload, sign & manage your PDF files securely.
            </p>
            <div className="inline-flex items-center gap-2 bg-rose-800 text-white text-sm font-bold px-6 py-3 rounded-full shadow-lg">
              Get Started →
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-xl">
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}