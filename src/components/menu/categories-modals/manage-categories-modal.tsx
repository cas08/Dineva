"use client";

import React, { useState } from "react";
import { useCategories } from "@/hooks";
import { MyButton } from "@/components/ui";
import { Category } from "@prisma/client";
import { EditCategoryModal } from "./edit-category-modal";
import { DeleteCategoryModal } from "./delete-category-modal";

const ManageCategoriesModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { data: categories, isLoading } = useCategories();

  const handleCategoryUpdate = (updatedCategory: {
    id?: number;
    name: string;
  }) => {
    if (updatedCategory.id && selectedCategory?.id === updatedCategory.id) {
      setSelectedCategory({ ...selectedCategory, name: updatedCategory.name });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-4">Редагувати категорії</h2>

        {isLoading ? (
          <p>Завантаження...</p>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Виберіть категорію
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedCategory?.id || ""}
                onChange={(e) => {
                  const selected = categories?.find(
                    (category) => category.id === Number(e.target.value),
                  );
                  setSelectedCategory(selected || null);
                }}
              >
                <option value="">Оберіть категорію</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between">
              <MyButton
                customvariant="edit"
                onClick={() => setIsEditModalOpen(true)}
                disabled={!selectedCategory}
              >
                Редагувати
              </MyButton>
              <MyButton
                customvariant="delete"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={!selectedCategory}
              >
                Видалити
              </MyButton>
              <MyButton
                customvariant="confirm"
                onClick={() => {
                  setSelectedCategory(null);
                  setIsEditModalOpen(true);
                }}
              >
                Додати нову
              </MyButton>
            </div>
          </>
        )}

        <div className="mt-4 flex justify-end">
          <MyButton customvariant="cancel" onClick={onClose}>
            Скасувати
          </MyButton>
        </div>

        {isEditModalOpen && (
          <EditCategoryModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={handleCategoryUpdate}
            initialData={selectedCategory}
          />
        )}

        {isDeleteModalOpen && selectedCategory && (
          <DeleteCategoryModal
            onClose={() => setIsDeleteModalOpen(false)}
            categoryId={selectedCategory.id}
            categoryName={selectedCategory.name}
          />
        )}
      </div>
    </div>
  );
};

export { ManageCategoriesModal };
