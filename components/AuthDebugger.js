/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { debugAuthData, getAuthData } from "@/utils/cookieHelper";
import { X, ChevronDown, ChevronUp } from "lucide-react";

/**
 * Debug component to show authentication data status
 * Only visible in development mode
 * Shows cookies, localStorage, and auth data status
 */
export default function AuthDebugger() {
  const [isOpen, setIsOpen] = useState(false);
  const [debugData, setDebugData] = useState(null);
  const [authData, setAuthData] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = debugAuthData();
      const auth = getAuthData();
      setDebugData(data);
      setAuthData(auth);
    }
  }, [isOpen]);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors z-50"
        title="Open Auth Debugger"
      >
        Auth Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-blue-600 rounded-lg shadow-2xl z-50 max-w-md max-h-96 overflow-y-auto">
      <div className="sticky top-0 bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
        <h3 className="font-bold">🔐 Auth Debugger</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-blue-700 p-1 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 text-xs font-mono">
        {/* Authentication Status */}
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <div className="font-bold text-blue-600 mb-2">Authentication Status</div>
          <div className={`${authData?.hasToken ? "text-green-600" : "text-red-600"}`}>
            Token: {authData?.hasToken ? "✓ Present" : "✗ Missing"}
          </div>
          <div className={`${authData?.hasSession ? "text-green-600" : "text-orange-600"}`}>
            Session: {authData?.hasSession ? "✓ Present" : "⚠ Missing"}
          </div>
          <div className={`${authData?.hasUser ? "text-green-600" : "text-orange-600"}`}>
            User: {authData?.hasUser ? "✓ Present" : "⚠ Missing"}
          </div>
        </div>

        {/* Cookies Status */}
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <div className="font-bold text-blue-600 mb-2">Cookies</div>
          <div className={debugData?.cookies?.accessToken?.includes("✓") ? "text-green-600" : "text-red-600"}>
            accessToken: {debugData?.cookies?.accessToken || "Error"}
          </div>
          <div className={debugData?.cookies?.sessionId?.includes("✓") ? "text-green-600" : "text-orange-600"}>
            sessionId: {debugData?.cookies?.sessionId || "Error"}
          </div>
        </div>

        {/* LocalStorage Status */}
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <div className="font-bold text-blue-600 mb-2">LocalStorage</div>
          <div className={debugData?.localStorage?.accessToken?.includes("✓") ? "text-green-600" : "text-red-600"}>
            accessToken: {debugData?.localStorage?.accessToken || "Error"}
          </div>
          <div className={debugData?.localStorage?.user?.includes("✓") ? "text-green-600" : "text-orange-600"}>
            user: {debugData?.localStorage?.user || "Error"}
          </div>
          <div className={debugData?.localStorage?.userId?.includes("✓") ? "text-green-600" : "text-orange-600"}>
            userId: {debugData?.localStorage?.userId || "Error"}
          </div>
        </div>

        {/* Token Preview */}
        {authData?.token && (
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <div className="font-bold text-blue-600 mb-2">Token Preview</div>
            <div className="break-all text-gray-700 max-h-24 overflow-y-auto">
              {authData.token.substring(0, 50)}...
              <br />
              <span className="text-gray-500">(Length: {authData.token.length})</span>
            </div>
          </div>
        )}

        {/* User Data Preview */}
        {authData?.user && (
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <div className="font-bold text-blue-600 mb-2">User Data</div>
            <div className="break-all text-gray-700 max-h-24 overflow-y-auto">
              <pre className="text-xs">{JSON.stringify(authData.user, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-gray-500 text-center text-xs">
          Updated: {debugData?.timestamp || "N/A"}
        </div>
      </div>
    </div>
  );
}
