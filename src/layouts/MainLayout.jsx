import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const isLoggedIn = !!localStorage.getItem("accessToken");

  const isActive = (path) => location.pathname === path;

  const logout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 px-6 py-4 flex justify-between items-center transition-all">
        {/* Logo */}
        <div
          className="text-2xl font-extrabold text-rose-900 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/")}
        >
          Trustivo
        </div>

        {/* Hamburger (mobile) */}
        <button
          className="sm:hidden px-3 py-2 rounded-md text-gray-700 hover:bg-gray-200"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                mobileOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>

        {/* Right-side items */}
        <div
          className={`sm:flex items-center space-x-4 ${
            mobileOpen
              ? "flex flex-col space-y-2 mt-2 sm:mt-0 sm:flex-row sm:space-y-0 sm:space-x-4"
              : "hidden sm:flex"
          }`}
        >
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className={`px-5 py-2 text-sm font-semibold border-2 rounded-full transition-all duration-300 ${
                  isActive("/login")
                    ? "bg-rose-100 border-rose-200"
                    : "bg-rose-50 border-transparent hover:border-rose-100 hover:bg-rose-100"
                } text-rose-900`}
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-5 py-2 text-sm font-semibold bg-rose-800 text-white rounded-full hover:bg-rose-900 hover:shadow-lg hover:shadow-rose-900/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                Sign Up
              </button>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 bg-rose-950 text-white px-3 py-2 rounded-full hover:shadow-lg hover:shadow-rose-950/40 transition-all"
              >
                <span>Profile</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3">
                  <div className="pt-1">
                    <button
                      onClick={() => { navigate("/dashboard"); setDropdownOpen(false); }}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={logout}
                      className="w-full text-left px-2 py-1 text-sm text-red-600 hover:bg-gray-100 rounded mt-1"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex flex-col animate-[fadeIn_0.5s_ease-out]">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-white text-center py-6 border-t border-gray-100 mt-auto">
        <p className="text-sm font-medium text-gray-400">
          © {new Date().getFullYear()} Trustivo. All rights reserved.
        </p>
      </footer>
    </div>
  );
}