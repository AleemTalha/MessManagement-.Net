"use client";

import { useState, useEffect, useCallback } from "react";
import { useMeals, useCreateMeal, useUpdateMeal, useDeleteMeal } from "@/utils/useMeals";
import { toast } from "react-toastify";
import MealModal from "./ui/MealModal";
import MealTable from "./ui/MealTable";

export default function MealsClient() {
  const { data: meals, isLoading, error, refetch } = useMeals();
  const createMeal = useCreateMeal();
  const updateMeal = useUpdateMeal();
  const deleteMeal = useDeleteMeal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);

  const openAddModal = useCallback(() => {
    setEditingMeal(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = (meal) => {
    setEditingMeal(meal);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const handleOpenAddModal = () => openAddModal();
    window.addEventListener('openAddMealModal', handleOpenAddModal);
    return () => window.removeEventListener('openAddMealModal', handleOpenAddModal);
  }, [openAddModal]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMeal(null);
  };

  const handleSubmit = async (mealData) => {
    try {
      if (editingMeal) {
        // Update existing meal with image URL and publicId
        await updateMeal.mutateAsync({ id: editingMeal.id, data: mealData });
        toast.success("Meal updated successfully!");
      } else {
        // Create new meal with image URL and publicId
        await createMeal.mutateAsync(mealData);
        toast.success("Meal created successfully!");
      }
      closeModal();
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this meal?")) {
      return;
    }

    try {
      await deleteMeal.mutateAsync(id);
      toast.success("Meal deleted successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to delete meal");
    }
  };

  return (
    <div className="space-y-6">
      <MealModal
        isOpen={isModalOpen}
        onClose={closeModal}
        meal={editingMeal}
        onSubmit={handleSubmit}
        isPending={createMeal.isPending || updateMeal.isPending}
      />

      <MealTable
        meals={meals}
        isLoading={isLoading}
        onEdit={openEditModal}
        onDelete={handleDelete}
        isDeleting={deleteMeal.isPending}
        error={error}
        onAdd={() => window.dispatchEvent(new CustomEvent("openAddMealModal"))}
        onRetry={refetch}
      />
    </div>
  );
}
