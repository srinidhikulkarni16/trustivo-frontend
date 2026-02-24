import { useNavigate } from "react-router-dom";

export default function Documents() {
  const navigate = useNavigate();

  const documentTypes = [
    { name: "PDF Documents", route: "/upload/pdf", icon: "📄" },
    { name: "Photo", route: "/upload/photo", icon: "🖼️" },
    { name: "Other Services", route: "/upload/other", icon: "✨" },
  ];

  return (
    <div className="py-16 px-4 sm:px-8 flex-grow">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 text-gray-900 animate-[fadeIn_0.4s_ease-out]">
        Choose a Service
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {documentTypes.map((doc, index) => (
          <div
            key={index}
            onClick={() => navigate(doc.route)}
            className="group cursor-pointer bg-white border border-gray-100 shadow-sm rounded-3xl p-10 text-center hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2 hover:border-blue-200 transition-all duration-300 animate-[slideUp_0.5s_ease-out]"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {doc.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
              {doc.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}