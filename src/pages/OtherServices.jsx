import { useNavigate } from "react-router-dom";

export default function OtherServices() {
  const navigate = useNavigate();

  const services = [
    { name: "Word Documents", route: "/upload/word", icon: "📝", ext: ".doc, .docx" },
    { name: "Excel Sheets", route: "/upload/excel", icon: "📊", ext: ".xls, .xlsx" },
  ];

  return (
    <div className="py-16 px-8 flex-grow">
      <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Additional Services</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">

        {services.map((service, index) => (
          <div
            key={index}
            onClick={() => navigate(service.route)}

            className="group bg-white shadow-sm border border-gray-100 rounded-3xl p-10 text-center hover:shadow-xl hover:shadow-rose-950/5 hover:-translate-y-2 hover:border-rose-200 transition-all duration-300 cursor-pointer"
          >

            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{service.icon}</div>

            <h3 className="text-xl font-bold text-gray-800 group-hover:text-rose-900 transition-colors">{service.name}</h3>
            
            <p className="text-sm text-gray-400 mt-2">{service.ext}</p>
          </div>
        ))}
      </div>
    </div>
  );
}