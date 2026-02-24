import { useNavigate } from "react-router-dom";

export default function OtherServices() {
  const navigate = useNavigate();

  const services = [
    { name: "Word Documents", route: "/upload/word" },
    { name: "Excel Sheets", route: "/upload/excel" },
  ];

  return (
    <div className="py-16 px-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-12">
        Additional Services
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {services.map((service, index) => (
          <div
            key={index}
            onClick={() => navigate(service.route)}
            className="bg-white shadow-md rounded-2xl p-10 text-center hover:shadow-xl hover:-translate-y-1 transition cursor-pointer"
          >
            <h3 className="text-xl font-semibold">
              {service.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}