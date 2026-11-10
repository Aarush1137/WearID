"use client";

import React from "react";

export default function RootGlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF8F5] text-[#111622] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xl mb-4">
          !
        </div>
        <h1 className="text-2xl font-bold mb-2">WearID System Error</h1>
        <p className="text-sm text-gray-600 max-w-sm mb-6">
          A critical rendering error occurred. Please refresh or reset the application.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="px-6 py-2.5 rounded-lg bg-[#1B2A4A] hover:bg-[#121D34] text-white font-semibold text-xs shadow transition-colors"
        >
          Reload WearID
        </button>
      </body>
    </html>
  );
}
