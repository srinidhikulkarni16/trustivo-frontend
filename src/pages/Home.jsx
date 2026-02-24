import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center flex-grow py-20 px-4 text-center">
      <div className="max-w-3xl mx-auto animate-[fadeIn_0.6s_ease-out]">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-gray-900">
          Welcome to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Trustivo
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          A secure and reliable platform for managing and signing your important documents digitally.
        </p>

        <button
          onClick={() => navigate("/documents")}
          className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-300"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}