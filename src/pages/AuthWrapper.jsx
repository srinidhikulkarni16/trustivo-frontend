import React from "react";

export default function AuthWrapper({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:p-8">

      <div className="bg-white shadow-2xl shadow-rose-950/10 rounded-3xl w-full sm:max-w-md p-8 sm:p-10 flex flex-col justify-center transform transition-all animate-[slideUp_0.4s_ease-out]">
      
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-3">
            {title}
          </h1>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}