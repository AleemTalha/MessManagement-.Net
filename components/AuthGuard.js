"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AuthGuard({ children, requiredRole }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      const loginPath = pathname.startsWith("/admin") ? "/admin/login" : "/login";
      router.push(loginPath);
      return;
    }

    if (requiredRole) {
      try {
        const userData = JSON.parse(user);
        if (userData.role !== requiredRole) {
          const loginPath = pathname.startsWith("/admin") ? "/admin/login" : "/login";
          router.push(loginPath);
        }
      } catch {
        const loginPath = pathname.startsWith("/admin") ? "/admin/login" : "/login";
        router.push(loginPath);
      }
    }
  }, [pathname, router, requiredRole]);

  return <>{children}</>;
}
