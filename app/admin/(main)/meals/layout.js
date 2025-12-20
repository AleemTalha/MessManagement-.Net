"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusIcon, Utensils } from "lucide-react";
import Link from "next/link";

export default function MealLayout({ children }) {
  const pathname = usePathname();
  const showButton = pathname === "/admin/meals";

  return (
    <div className="min-h-screen">
      <div className="bg-white dark:bg-slate-50 py-2 md:py-4 border-slate-200 dark:border-slate-300">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="p-3 bg-blue-600 rounded-sm flex items-center justify-center shadow-sm shrink-0">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 dark:text-slate-700 truncate">
                Meals Management
              </h1>
              <p className="text-xs md:text-base text-slate-600 dark:text-slate-500 mt-1 truncate">
                Manage your mess meals, pricing, and availability Manage your
                mess meals, pricing, and availability
              </p>
            </div>
          </div>

          {showButton && (
            <Button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("openAddMealModal"))
              }
              className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-sm text-sm md:text-base shadow-sm transition-colors shrink-0"
              size="lg"
            >
              <PlusIcon className="h-4 w-4 md:h-5 md:w-5" />
              Add <span className="hidden md:inline-block">New Meal</span>
            </Button>
          )}
        </div>
      </div>

      <nav className="sticky top-15 z-20 bg-white dark:bg-slate-50 border-b border-slate-200 dark:border-slate-300">
        <div className="flex gap-3">
          <Link
            href="/admin/meals"
            className={`relative text-slate-700 dark:text-slate-600 font-medium px-3 py-2 transition-colors duration-200 text-sm md:text-base ${
              pathname === "/admin/meals"
                ? "text-blue-500 border-b-2 border-blue-400"
                : "hover:text-blue-500"
            }`}
          >
            Meals List
          </Link>

          <Link
            href="/admin/meals/shedule"
            className={`relative text-slate-700 dark:text-slate-600 font-medium px-3 py-2 transition-colors duration-200 text-sm md:text-base ${
              pathname === "/admin/meals/shedule"
                ? "text-blue-500 border-b-2 border-blue-400"
                : "hover:text-blue-500"
            }`}
          >
            Mess Shedule
          </Link>
        </div>
      </nav>

      <div className="pt-6">{children}</div>
    </div>
  );
}
