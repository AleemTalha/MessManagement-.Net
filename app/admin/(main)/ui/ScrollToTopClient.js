"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function ScrollToTopClient({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const locationKey = `${pathname ?? ""}${searchParams ? `?${searchParams.toString()}` : ""}`;

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.scrollTo({ top: 0, left: 0 });
      } catch (e) {
        window.scrollTo(0, 0);
      }
    }
  }, [locationKey]);

  return <>{children}</>;
}
