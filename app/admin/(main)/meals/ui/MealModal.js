"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XMarkIcon, CheckIcon, PhotoIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Utensils } from "lucide-react";
import { toast } from "react-toastify";
import { uploadImageToBackend } from "@/utils/uploadImage";

export default function MealModal({ isOpen, onClose, meal, onSubmit, isPending }) {
  const [formData, setFormData] = useState({
    name: "",
    weight: "",
    price: "",
    isAvailable: true,
    description: "",
    image: null,
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        weight: "",
        price: "",
        isAvailable: true,
        description: "",
        image: null,
      });
      setIsUploading(false);
      return;
    }

    if (meal) {
      const existingImage = meal.image && meal.image.url 
        ? { url: meal.image.url, publicId: meal.image.publicId || "" }
        : null;
        
      setFormData({
        name: meal.name,
        weight: meal.weight.toString(),
        price: meal.price.toString(),
        isAvailable: meal.isAvailable ?? true,
        description: meal.description || "",
        image: existingImage,
      });
    } else {
      setFormData({
        name: "",
        weight: "",
        price: "",
        isAvailable: true,
        description: "",
        image: null,
      });
    }
  }, [isOpen, meal]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadImageToBackend(file);
      
      if (result.success) {
        setFormData(prev => ({ 
          ...prev, 
          image: { url: result.data.url, publicId: result.data.publicId }
        }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(result.message || "Failed to upload image");
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Meal name is required");
      return;
    }

    const weight = parseFloat(formData.weight);
    if (isNaN(weight) || weight <= 0) {
      toast.error("Weight must be a positive number");
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error("Price must be a positive number");
      return;
    }

    const mealData = {
      name: formData.name.trim(),
      weight,
      price,
      isAvailable: formData.isAvailable,
      description: formData.description.trim(),
      image: formData.image?.url ? { url: formData.image.url, publicId: formData.image.publicId || "" } : null,
    };

    onSubmit(mealData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed h-screen inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Utensils className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              {meal ? "Edit Meal" : "Add New Meal"}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isPending} className="rounded-full">
            <XMarkIcon className="h-6 w-6" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div className="flex justify-center">
            {formData.image?.url ? (
              <div className="relative w-56 h-56 rounded-lg overflow-hidden border-2 border-slate-300">
                <Image src={formData.image.url} alt="Meal preview" fill className="object-cover" unoptimized />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
                  </div>
                )}
                {!isUploading && (
                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={isPending}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                )}
              </div>
            ) : (
              <label className={`w-56 h-56 flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer ${
                isPending || isUploading
                  ? "border-slate-200 bg-slate-50 opacity-50"
                  : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50"
              }`}>
                <div className="p-4 bg-blue-100 rounded-full mb-2">
                  <PhotoIcon className="h-10 w-10 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  Click to upload
                </span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={isPending || isUploading} />
              </label>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">
                Meal Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isPending}
                className="h-10"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">
                Weight (grams) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                required
                disabled={isPending}
                className="h-10"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">
                Price <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                disabled={isPending}
                className="h-10"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">
                Availability
              </label>
              <select
                value={formData.isAvailable ? "available" : "unavailable"}
                onChange={(e) =>
                  setFormData({ ...formData, isAvailable: e.target.value === "available" })
                }
                disabled={isPending}
                className="h-10 w-full px-3 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isPending}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="3"
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 h-11 border-slate-300 hover:bg-slate-50 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || isUploading}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 font-medium transition-colors"
            >
              {isPending || isUploading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  {isUploading ? "Uploading..." : meal ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <CheckIcon className="h-5 w-5" />
                  {meal ? "Update Meal" : "Create Meal"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
