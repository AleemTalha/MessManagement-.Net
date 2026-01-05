"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Utensils } from "lucide-react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function EmptyState({ onButtonClick }) {
  return (
    <div className="bg-white px-6 pt-20 flex flex-col items-center justify-center">
      <div className="mb-4 h-30 w-30 bg-blue-100 rounded-full flex items-center justify-center">
        <Utensils className="h-16 w-16 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        No meals yet
      </h3>
      <p className="text-slate-600 text-center mb-6 max-w-md">
        Get started by adding your first meal to the menu. Create delicious
        options for your customers.
      </p>
      {onButtonClick && (
        <Button
          onClick={onButtonClick}
          className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-sm text-sm md:text-base shadow-sm transition-colors shrink-0"
        >
          <PlusIcon className="h-4 w-4" />
          Add New Meal
        </Button>
      )}
    </div>
  );
}

function ErrorState({ onButtonClick, errorMessage }) {
  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-sm px-6 py-12 flex flex-col items-center justify-center">
      <div className="mb-4">
        <ExclamationTriangleIcon className="h-16 w-16 text-red-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        Something went wrong
      </h3>
      <p className="text-slate-600 text-center mb-6 max-w-md">
        {errorMessage}
      </p>
      {onButtonClick && (
        <Button
          onClick={onButtonClick}
          variant="outline"
          className="flex items-center gap-2 px-6 py-2"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}

function TableSkeleton() {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="bg-white shadow-sm border border-slate-200 rounded-sm overflow-x-auto">
        <table className="w-full min-w-200 table-fixed">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="w-6 px-2 py-3 text-center border text-xs font-semibold text-slate-700 uppercase tracking-wider">
                #
              </th>
              <th className="w-65 px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Meal
              </th>
              <th className="w-32 px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Weight
              </th>
              <th className="w-24 px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Price
              </th>
              <th className="w-24 px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Status
              </th>
              <th className="w-24 px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                <td className="border w-6 px-2 py-4 text-center">
                  <Skeleton width={16} height={16} className="mx-auto" />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <Skeleton width={48} height={48} className="rounded-sm" />
                    <div className="flex-1 space-y-2">
                      <Skeleton width="75%" height={16} />
                      <Skeleton width="50%" height={12} />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Skeleton width={64} height={16} />
                </td>
                <td className="px-4 py-4">
                  <Skeleton width={48} height={16} />
                </td>
                <td className="px-4 py-4">
                  <Skeleton width={80} height={24} className="rounded-sm" />
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton width={32} height={32} className="rounded" />
                    <Skeleton width={32} height={32} className="rounded" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SkeletonTheme>
  );
}

export default function MealTable({
  meals,
  isLoading,
  onEdit,
  onDelete,
  isDeleting,
  error,
  onAdd,
  onRetry,
}) {
  if (error) {
    return (
      <ErrorState
        onButtonClick={onRetry}
        errorMessage={
          error?.message ||
          "We encountered an error while loading the meals. Please try again."
        }
      />
    );
  }

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (!meals || meals.length === 0) {
    return <EmptyState onButtonClick={onAdd} />;
  }

  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-sm overflow-x-auto">
      <table className="w-full min-w-200 table-fixed">
        <thead className="bg-slate-100 border-b border-slate-200">
          <tr>
            <th className="w-6 px-2 py-3 text-center border text-xs font-semibold text-slate-700 uppercase tracking-wider">
              #
            </th>
            <th className="w-65 px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Meal
            </th>
            <th className="w-32 px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Weight
            </th>
            <th className="w-24 px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Price
            </th>
            <th className="w-24 px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Status
            </th>
            <th className="w-24 px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {meals.map((meal, index) => (
            <tr
              key={meal.id}
              className="hover:bg-slate-50"
            >
              <td className="border w-6 px-2 text-center py-4 text-sm text-slate-700">
                {index + 1}
              </td>
              <td className="px-4 py-4 text-sm text-slate-900">
                <div className="flex items-start gap-3">
                  {meal.image?.url && (
                    <div className="relative h-12 w-12 rounded-sm overflow-hidden bg-slate-100 shrink-0">
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
                    <div className="font-semibold truncate">{meal.name}</div>
                    <div className="text-xs pt-1 text-slate-600 truncate">
                      {meal.description || "No description available"}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-slate-700">
                {meal.weight}g
              </td>
              <td className="px-4 py-4 text-sm font-medium text-slate-900">
                {meal.price}
              </td>
              <td className="px-4 py-4 text-sm ">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-sm ${
                    meal.isAvailable
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {meal.isAvailable ? "Available" : "Unavailable"}
                </span>
              </td>
              <td className="px-4 py-4 text-right flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(meal)}
                  disabled={meal.isDeleting || meal.isOptimistic || isDeleting}
                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-transparent rounded-none"
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(meal.id)}
                  disabled={meal.isDeleting || meal.isOptimistic || isDeleting}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-transparent rounded-none"
                >
                  {meal.isDeleting ? (
                    <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                  ) : (
                    <TrashIcon className="h-4 w-4" />
                  )}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
