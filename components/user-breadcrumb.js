"use client";
import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

function titleize(segment) {
  if (!segment) return "";
  return segment
    .replace(/[-_]+/g, " ")
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export function UserBreadcrumb() {
  const pathname = usePathname();

  const segments = useMemo(() => {
    if (!pathname) return [];
    return pathname.split("/").filter(Boolean);
  }, [pathname]);

  const crumbs = useMemo(() => {
    const out = [];
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const href = `/${segments.slice(0, i + 1).join("/")}`;
      out.push({ seg, href });
    }
    return out;
  }, [segments]);

  return (
    <Breadcrumb>
      <BreadcrumbList className="gap-0">
        <BreadcrumbItem>
          <BreadcrumbLink className="text-xs" href="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>

        {crumbs.length === 0 ? null : <BreadcrumbSeparator />}

        {crumbs.map((c, idx) => {
          const isLast = idx === crumbs.length - 1;
          const label = titleize(c.seg === "user" ? "User Portal" : c.seg);
          return (
            <React.Fragment key={c.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink className="text-xs" href={c.href}>
                    {label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
