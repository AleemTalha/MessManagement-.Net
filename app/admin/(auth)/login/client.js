"use client";

const backend_uri = process.env.NEXT_PUBLIC_BACKEND_URI || "http://localhost:5205";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { setAuthCookies } from "@/utils/cookieHelper";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${backend_uri}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          // Set authentication cookies properly for middleware compatibility
          setAuthCookies(data.token, data.sessionId, data.user);
        }
        toast.success("Login successful! Redirecting...");
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1000);
      } else if (response.status === 401) {
        toast.error("Invalid email or password");
      } else if (response.status === 403) {
        toast.error("Account is inactive. Please contact admin.");
      } else {
        toast.error(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Unable to connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-screen w-screen overflow-hidden">
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-8">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl px-10 py-12 relative">
          {/* Back to Home Button */}
          <button
            onClick={() => router.push('/')}
            className="absolute cursor-pointer top-4 left-4 p-2 rounded-lg hover:bg-slate-100 transition-colors group"
            title="Back to Home"
          >
            <ArrowLeft className="w-8 h-8 text-slate-600 group-hover:text-slate-800" />
          </button>

          <div className="pb-8">
            <div className="mx-auto inline-flex items-center justify-center w-full h-40">
              <Image
                src="/assets/logo.webp"
                className=""
                alt="Admin Logo"
                width={200}
                height={200}
              />
            </div>

            <h1 className="text-4xl font-bold text-[#f86e58]">Login Now</h1>
            <p className="text-slate-600 text-md pt-3">
              Sign in to your management account.
            </p>
          </div>

          <div className="relative pb-6">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className="peer w-full px-5 pt-3.5 pb-3.5 text-base rounded-xl border-2 bg-white shadow-sm focus:outline-none border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder=" "
            />

            <label
              htmlFor="email"
              className="absolute left-4 top-1/3 -translate-y-1/2 bg-white px-2 text-sm text-slate-500 transition-all duration-200 pointer-events-none
    peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#f86e58
    peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs"
            >
              Email address
            </label>
          </div>

          <div className="relative pb-4">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="peer w-full px-3.5 pt-3.5 pb-5 text-base rounded-xl border-2 bg-white shadow-sm focus:outline-none border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder=" "
            />

            <label
              htmlFor="password"
              className="absolute left-4 top-1/3 -translate-y-1/2 bg-white px-2 text-sm text-slate-500 transition-all duration-200 pointer-events-none
    peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#f86e58
    peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs"
            >
              Password
            </label>

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-2/5 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-6 h-6" />
              ) : (
                <Eye className="w-6 h-6" />
              )}
            </button>
          </div>

          <div className="text-right pb-12">
            <a
              href="#"
              className="text-[#f86e58] hover:text-slate-900 text-sm transition-colors"
            >
              Forgot your password?
            </a>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-[#f86e58] text-white py-3.5 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative h-full overflow-hidden">
        <Image
          src="/assets/login-right.jpg"
          alt="Delicious food"
          className="absolute inset-0 w-full h-full object-cover"
          height={400}
          width={400}
        />

        <div className="absolute inset-0 bg-black/70 bg-opacity-50"></div>

        <div className="relative z-10 flex flex-col items-start justify-center h-full px-16 max-w-2xl">
          <div className="space-y-6">
            <h2 className="text-6xl font-bold text-white leading-tight">
              Manage Your Mess
              <span className="block text-[#f86e58 mt-2">Effortlessly</span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              Simplify mess operations with comprehensive tools for meal planning, 
              attendance tracking, and billing management.
            </p>
            <div className="pt-4 space-y-3 text-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#f86e58]"></div>
                <span className="text-base">Real-time attendance monitoring</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#f86e58]"></div>
                <span className="text-base">Automated billing system</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#f86e58]"></div>
                <span className="text-base">Weekly menu scheduling</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
