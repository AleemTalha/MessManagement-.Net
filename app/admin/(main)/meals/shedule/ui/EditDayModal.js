"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { XMarkIcon, CheckIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CalendarIcon, Clock } from "lucide-react";
import Image from "next/image";

export default function EditDayModal({ isOpen, onClose, day, schedule, meals, onSave, isPending }) {
  const initialMorningMeal = schedule?.morningMeal || null;
  const initialEveningMeal = schedule?.eveningMeal || null;
  
  const [selectedMorningMeal, setSelectedMorningMeal] = useState(initialMorningMeal);
  const [selectedEveningMeal, setSelectedEveningMeal] = useState(initialEveningMeal);

  // Reset meals when modal opens with new day
  useEffect(() => {
    if (isOpen) {
      setSelectedMorningMeal(schedule?.morningMeal || null);
      setSelectedEveningMeal(schedule?.eveningMeal || null);
    }
  }, [isOpen, day, schedule?.morningMeal, schedule?.eveningMeal]);

  const handleSave = () => {
    const morningMealId = selectedMorningMeal?.id || null;
    const eveningMealId = selectedEveningMeal?.id || null;
    onSave(day, morningMealId, eveningMealId);
  };

  const setMorningMeal = (meal) => {
    setSelectedMorningMeal(meal);
  };

  const clearMorningMeal = () => {
    setSelectedMorningMeal(null);
  };

  const setEveningMeal = (meal) => {
    setSelectedEveningMeal(meal);
  };

  const clearEveningMeal = () => {
    setSelectedEveningMeal(null);
  };

  const availableMorningMeals = meals?.filter(m => m.isAvailable) || [];
  const availableEveningMeals = meals?.filter(m => m.isAvailable) || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <CalendarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                Edit {day} Schedule
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Select meals for morning and evening
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isPending}
            className="rounded-full"
          >
            <XMarkIcon className="h-6 w-6" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Morning Meal Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Morning Meal
                </h3>
              </div>
              {!selectedMorningMeal && availableMorningMeals.length > 0 && (
                <MealSelector
                  meals={availableMorningMeals}
                  onSelect={setMorningMeal}
                  disabled={isPending}
                  label="Select Meal"
                />
              )}
            </div>

            {!selectedMorningMeal ? (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
                <Clock className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500 dark:text-slate-400">
                  No morning meal selected.
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Click &quot;Select Meal&quot; to choose a meal
                </p>
              </div>
            ) : (
              <MealCard
                meal={selectedMorningMeal}
                onRemove={clearMorningMeal}
                onReplace={() => setSelectedMorningMeal(null)}
                disabled={isPending}
              />
            )}
          </div>

          {/* Evening Meal Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-500" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Evening Meal
                </h3>
              </div>
              {!selectedEveningMeal && availableEveningMeals.length > 0 && (
                <MealSelector
                  meals={availableEveningMeals}
                  onSelect={setEveningMeal}
                  disabled={isPending}
                  label="Select Meal"
                />
              )}
            </div>

            {!selectedEveningMeal ? (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
                <Clock className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500 dark:text-slate-400">
                  No evening meal selected.
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Click &quot;Select Meal&quot; to choose a meal
                </p>
              </div>
            ) : (
              <MealCard
                meal={selectedEveningMeal}
                onRemove={clearEveningMeal}
                onReplace={() => setSelectedEveningMeal(null)}
                disabled={isPending}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 h-11 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 font-medium transition-colors"
          >
            {isPending ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="h-5 w-5" />
                Save Schedule
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MealCard({ meal, onRemove, onReplace, disabled }) {
  return (
    <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border-2 border-blue-200 dark:border-blue-700 rounded-xl shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        {meal.image?.url && (
          <div className="relative h-20 w-20 rounded-xl overflow-hidden shrink-0 border-2 border-white dark:border-slate-700 shadow-md">
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
          <p className="text-lg font-bold text-slate-800 dark:text-slate-200 truncate mb-1">
            {meal.name}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            PKR {meal.price} • {meal.weight}g
          </p>
          {meal.description && (
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 line-clamp-2">
              {meal.description}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReplace}
            disabled={disabled}
            className="px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Change
          </button>
          <button
            onClick={onRemove}
            disabled={disabled}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MealSelector({ meals, onSelect, disabled, label = "Select Meal" }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!meals || meals.length === 0) return null;

  const handleSelect = (meal) => {
    onSelect(meal);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        type="button"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
      >
        <PlusIcon className="h-4 w-4" />
        {label}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-20 max-h-[28rem] overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Choose a Meal
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select one meal for this time
              </p>
            </div>
            <div className="overflow-y-auto max-h-80 p-2">
              {meals.map((meal) => (
                <button
                  key={`selector-${meal.id}`}
                  onClick={() => handleSelect(meal)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors rounded-lg text-left group"
                >
                  {meal.image?.url && (
                    <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0 border-2 border-slate-200 dark:border-slate-700 group-hover:border-blue-400 transition-colors">
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
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {meal.name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      PKR {meal.price} • {meal.weight}g
                    </p>
                    {meal.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 line-clamp-1">
                        {meal.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
