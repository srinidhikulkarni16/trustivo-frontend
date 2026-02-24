import React from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function MainLayout() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("accessToken");

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-900">

      {/*NAVBAR*/}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 px-8 py-4 flex justify-between items-center transition-all">

        {/* Logo */}
        <div 
          className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/")}
        >
          Trustivo
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          {/* Language Selector */}
          <span className="border border-gray-200 rounded-full px-4 py-1.5 bg-gray-50 text-sm font-medium text-gray-600 cursor-default shadow-sm">
            English
          </span>

          {/* Auth Buttons */}
          {!isLoggedIn ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2 text-sm font-semibold text-blue-600 border-2 border-transparent hover:border-blue-100 bg-blue-50 rounded-full hover:bg-blue-100 transition-all duration-300"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/register")}
                className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                Sign Up
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              Dashboard
            </button>
          )}
        </div>
      </nav>

      {/*MAIN CONTENT*/}
      <main className="flex-grow flex flex-col animate-[fadeIn_0.5s_ease-out]">
        <Outlet />
      </main>

      {/*FOOTER*/}
      <footer className="bg-white text-center py-6 border-t border-gray-100 mt-auto">
        <p className="text-sm font-medium text-gray-400">
          © {new Date().getFullYear()} Trustivo. All rights reserved.
        </p>
      </footer>
    </div>
  );
}