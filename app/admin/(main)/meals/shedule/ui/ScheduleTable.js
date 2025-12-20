"use client";

import { useState } from "react";
import { PencilIcon, ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function ScheduleTable({ days, schedule, getDaySchedule, onEditDay }) {
  const [expandedDays, setExpandedDays] = useState(new Set());

  const toggleDay = (day) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  const MealCard = ({ meal }) => (
    <div className="shrink-0 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        {meal.image?.url && (
          <div className="relative h-12 w-12 rounded-md overflow-hidden border border-slate-200 dark:border-slate-600">
            <Image
              src={meal.image.url}
              alt={meal.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
            {meal.name}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            PKR.{meal.price} • {meal.weight}g
          </p>
        </div>
      </div>
    </div>
  );

  const MealSection = ({ title, meal, iconColor }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className={`h-4 w-4 ${iconColor}`} />
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {title}
        </h4>
      </div>
      {meal ? (
        <MealCard meal={meal} />
      ) : (
        <div className="text-center py-6 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No meal scheduled
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-50 rounded-sm overflow-hidden border">

      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {days.map((day, index) => {
          const daySchedule = getDaySchedule(day);
          const isExpanded = expandedDays.has(day);
          const hasMeals = daySchedule.morningMeal || daySchedule.eveningMeal;
          const mealCount = (daySchedule.morningMeal ? 1 : 0) + (daySchedule.eveningMeal ? 1 : 0);

          return (
            <div key={day} className="bg-white dark:bg-slate-50">
              {/* Day Header */}
              <div
                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                onClick={() => toggleDay(day)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDownIcon className="h-5 w-5 text-slate-500" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5 text-slate-500" />
                  )}
                  <div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                      {day}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {hasMeals ? `${mealCount} meal${mealCount > 1 ? 's' : ''} scheduled` : 'No meals scheduled'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditDay(day);
                  }}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit
                </Button>
              </div>

              {/* Expandable Content */}
              {isExpanded && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MealSection
                      title="Morning Meal"
                      meal={daySchedule.morningMeal}
                      iconColor="text-orange-500"
                    />
                    <MealSection
                      title="Evening Meal"
                      meal={daySchedule.eveningMeal}
                      iconColor="text-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
