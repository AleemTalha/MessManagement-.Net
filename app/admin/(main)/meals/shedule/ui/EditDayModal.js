"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  XMarkIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { CalendarIcon, Clock } from "lucide-react";
import Image from "next/image";

export default function EditDayModal({
  isOpen,
  onClose,
  day,
  schedule,
  meals,
  onSave,
  isPending,
}) {
  const initialMorningMeal = schedule?.morningMeal || null;
  const initialEveningMeal = schedule?.eveningMeal || null;

  const [selectedMorningMeal, setSelectedMorningMeal] =
    useState(initialMorningMeal);
  const [selectedEveningMeal, setSelectedEveningMeal] =
    useState(initialEveningMeal);

  const handleSave = () => {
    onSave(
      day,
      selectedMorningMeal?.id || null,
      selectedEveningMeal?.id || null
    );
  };

  const availableMeals = meals?.filter((m) => m.isAvailable) || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CalendarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Edit {day} Schedule
              </h2>
              <p className="text-sm text-slate-600">
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
          {/* Morning Meal */}
          <MealSection
            title="Morning Meal"
            iconColor="text-orange-500"
            selectedMeal={selectedMorningMeal}
            onSelect={setSelectedMorningMeal}
            onClear={() => setSelectedMorningMeal(null)}
            meals={availableMeals}
            disabled={isPending}
          />

          {/* Evening Meal */}
          <MealSection
            title="Evening Meal"
            iconColor="text-indigo-500"
            selectedMeal={selectedEveningMeal}
            onSelect={setSelectedEveningMeal}
            onClear={() => setSelectedEveningMeal(null)}
            meals={availableMeals}
            disabled={isPending}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 h-11"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
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

function MealSection({
  title,
  iconColor,
  selectedMeal,
  onSelect,
  onClear,
  meals,
  disabled,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={`h-5 w-5 ${iconColor}`} />
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        </div>

        {!selectedMeal && meals.length > 0 && (
          <MealSelector meals={meals} onSelect={onSelect} disabled={disabled} />
        )}
      </div>

      {!selectedMeal ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <Clock className="h-12 w-12 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-500">No meal selected.</p>
        </div>
      ) : (
        <MealCard meal={selectedMeal} onRemove={onClear} disabled={disabled} />
      )}
    </div>
  );
}

function MealCard({ meal, onRemove, disabled }) {
  return (
    <div className="p-5 bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
      <div className="flex items-center gap-4">
        {meal.image?.url && (
          <div className="relative h-20 w-20 rounded-xl overflow-hidden">
            <Image
              src={meal.image.url}
              alt={meal.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        <div className="flex-1">
          <p className="text-lg font-bold">{meal.name}</p>
          <p className="text-sm text-slate-600">
            PKR {meal.price} • {meal.weight}g
          </p>
        </div>

        <button
          onClick={onRemove}
          disabled={disabled}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function MealSelector({ meals, onSelect, disabled }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        size="sm"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="bg-blue-600 hover:bg-blue-700 text-white flex gap-2"
      >
        <PlusIcon className="h-4 w-4" />
        Select Meal
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white border rounded-xl shadow-2xl z-20 max-h-112 overflow-y-auto">
            {meals.map((meal) => (
              <button
                key={meal.id}
                onClick={() => {
                  onSelect(meal);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-blue-50"
              >
                {meal.image?.url && (
                  <div className="relative h-14 w-14 rounded-lg overflow-hidden">
                    <Image
                      src={meal.image.url}
                      alt={meal.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div>
                  <p className="font-semibold">{meal.name}</p>
                  <p className="text-xs text-slate-500">
                    PKR {meal.price} • {meal.weight}g
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
