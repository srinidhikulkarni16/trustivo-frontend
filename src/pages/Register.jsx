import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import AuthWrapper from "./AuthWrapper";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // New field

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // 1. Basic Validation
    if (password.length < 6) {
      return setErrorMsg("Password must be at least 6 characters long.");
    }
    if (password !== confirmPassword) {
      return setErrorMsg("Passwords do not match.");
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      localStorage.setItem("accessToken", res.data.accessToken);
      navigate("/dashboard");

    } catch (err) {
      if (err.response?.data?.message === "User already exists") {
        setErrorMsg("User already exists. Please login.");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }
      setErrorMsg(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper
      title="Create Account"
      subtitle="Join Trustivo to start managing your documents."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl animate-shake">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="John Doe"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-800 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@company.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-800 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-800 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-800 outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rose-800 hover:bg-rose-900 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-rose-900/20 transition-all disabled:opacity-60"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500 font-medium">
        Already have an account?{" "}
        <Link to="/login" className="text-rose-900 font-bold hover:underline">
          Log In
        </Link>
      </p>
    </AuthWrapper>
  );
}