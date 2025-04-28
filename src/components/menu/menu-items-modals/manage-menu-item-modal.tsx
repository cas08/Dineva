"use client";

import React, { useState, useEffect } from "react";
import { useCategories, useMenuItemsGrouped } from "@/hooks";
import { MyButton } from "@/components/ui";
import { EditMenuItemModal } from "./edit-menu-item-modal";
import { DeleteMenuItemModal } from "./delete-menu-item-modal";
import { useQueryClient } from "@tanstack/react-query";
import type { MenuItem } from "@/@types";

const ManageMenuItemsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const {
    data: groupedMenuItems,
    isLoading: isMenuItemsLoading,
    isFetching: isMenuItemsFetching,
  } = useMenuItemsGrouped();

  const allMenuItems: MenuItem[] = React.useMemo(() => {
    return (
      groupedMenuItems?.flatMap((group) =>
        group.items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description ?? undefined,
          price: item.price,
          categoryId: item.categoryId,
          photoUrl: item.photoUrl ?? undefined,
        })),
      ) || []
    );
  }, [groupedMenuItems]);

  const filteredMenuItems: MenuItem[] = selectedCategoryId
    ? allMenuItems.filter((item) => item.categoryId === selectedCategoryId)
    : allMenuItems;

  useEffect(() => {
    if (selectedMenuItem && !isMenuItemsLoading && !isMenuItemsFetching) {
      const stillExists = allMenuItems.some(
        (item) => item.id === selectedMenuItem.id,
      );
      if (!stillExists) {
        setSelectedMenuItem(null);
      }
    }
  }, [allMenuItems, selectedMenuItem, isMenuItemsLoading, isMenuItemsFetching]);

  const handleMenuItemUpdate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["menuItems"] });
    setIsEditModalOpen(false);
  };

  const handleDeleteSuccess = () => {
    setSelectedMenuItem(null);
    setIsDeleteModalOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-4">Керувати пунктами меню</h2>

        {isCategoriesLoading || isMenuItemsLoading ? (
          <p>Завантаження...</p>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Фільтрувати за категорією
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedCategoryId}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : "";
                  setSelectedCategoryId(value);
                  setSelectedMenuItem(null);
                }}
              >
                <option value="">Усі категорії</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Виберіть пункт меню
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedMenuItem?.id?.toString() || ""}
                onChange={(e) => {
                  const selectedId = Number(e.target.value);
                  const selected = filteredMenuItems.find(
                    (item) => item.id === selectedId,
                  );
                  setSelectedMenuItem(selected || null);
                }}
              >
                <option value="">Оберіть пункт меню</option>
                {filteredMenuItems
                  .filter((item) => item.id !== undefined)
                  .map((item) => (
                    <option key={item.id} value={item.id.toString()}>
                      {item.name}
                    </option>
                  ))}
              </select>

              {isMenuItemsFetching && (
                <p className="text-sm text-blue-600 mt-1">Оновлення даних...</p>
              )}
            </div>

            <div className="flex justify-between">
              <MyButton
                customvariant="edit"
                onClick={() => setIsEditModalOpen(true)}
                disabled={!selectedMenuItem}
              >
                Редагувати
              </MyButton>
              <MyButton
                customvariant="delete"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={!selectedMenuItem}
              >
                Видалити
              </MyButton>
              <MyButton
                customvariant="confirm"
                onClick={() => {
                  setSelectedMenuItem(null);
                  setIsEditModalOpen(true);
                }}
              >
                Додати новий
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
          <EditMenuItemModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={handleMenuItemUpdate}
            initialData={
              selectedMenuItem
                ? {
                    ...selectedMenuItem,
                    price: selectedMenuItem.price,
                  }
                : undefined
            }
            categories={categories || []}
          />
        )}

        {isDeleteModalOpen && selectedMenuItem && (
          <DeleteMenuItemModal
            onClose={() => setIsDeleteModalOpen(false)}
            menuItemId={selectedMenuItem.id}
            menuItemName={selectedMenuItem.name}
            categoryName={
              categories?.find((cat) => cat.id === selectedMenuItem.categoryId)
                ?.name || ""
            }
            onDeleteSuccess={handleDeleteSuccess}
          />
        )}
      </div>
    </div>
  );
};

export { ManageMenuItemsModal };
