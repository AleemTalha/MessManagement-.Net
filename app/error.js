"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeIcon, ArrowPathIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function Error({ error, reset }) {
  const [errorId, setErrorId] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setErrorId(Date.now().toString(36));
    setCurrentTime(new Date().toLocaleString());
  }, []);

  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Illustration */}
        <div className="relative mb-8">
          <div className="text-9xl font-bold text-red-200 dark:text-red-800 select-none">
            500
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-sanchez">
          Something Went Wrong
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
          We&apos;re experiencing some technical difficulties. Our team has been notified and is working to fix this issue.
        </p>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8 text-left">
            <div className="flex items-center gap-2 mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-800 dark:text-red-200">
                Error Details (Development Only)
              </span>
            </div>
            <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto max-h-32">
              {error?.message || "Unknown error"}
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button
            onClick={reset}
            size="lg"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Try Again
          </Button>

          <Button asChild variant="outline" size="lg" className="flex items-center gap-2">
            <Link href="/">
              <HomeIcon className="w-5 h-5" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Help Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Need Help?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            If this problem persists, please contact our support team or try refreshing the page.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => window.location.reload()}
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Refresh Page
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/contact">
                Contact Support
              </Link>
            </Button>
          </div>
        </div>

        {/* Status Information */}
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Error ID: {errorId}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Time: {currentTime}
          </p>
        </div>
      </div>
    </div>
  );
}