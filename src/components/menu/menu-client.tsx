"use client";

import MenuLoading from "./menu-loading";
import MenuItemCard from "./menu-item";
import { useState } from "react";
import { useCategories, useMenuItemsGrouped } from "@/hooks";
import { MyButton, MyLink } from "../ui";
import { ManageCategoriesModal } from "./categories-modals/manage-categories-modal";
import { ManageMenuItemsModal } from "./menu-items-modals/manage-menu-item-modal";
import { useSession } from "next-auth/react";

function MenuPageClient() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: menuItemsData, isLoading: isMenuLoading } =
    useMenuItemsGrouped();
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [isManageMenuItemsOpen, setIsManageMenuItemsOpen] = useState(false);
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useCategories();
  const { data: session } = useSession();

  const scrollToElement = (id: string, offset: number = 60) => {
    const element = document.getElementById(id);
    if (element) {
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
    setIsSidebarOpen(false);
  };

  if (isMenuLoading || isCategoriesLoading) {
    return <MenuLoading />;
  }

  if (!menuItemsData || menuItemsData.length === 0) {
    return <p>Немає доступних елементів меню.</p>;
  }

  const isAdminOrManager =
    session?.user.role === "Admin" || session?.user?.role === "Manager";
  return (
    <div className="py-12 flex flex-col md:flex-row">
      {isAdminOrManager && (
        <>
          <ManageCategoriesModal
            isOpen={isManageCategoriesOpen}
            onClose={() => setIsManageCategoriesOpen(false)}
          />
          <ManageMenuItemsModal
            isOpen={isManageMenuItemsOpen}
            onClose={() => setIsManageMenuItemsOpen(false)}
          />
        </>
      )}

      {/* Мобілка */}
      <div className="md:hidden fixed top-12 sm:top-14 left-0 w-full bg-white shadow-lg z-40 p-4">
        <button
          className="w-full text-lg font-semibold p-2 bg-gray-200 rounded-lg"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? "Закрити категорії" : "Показати категорії"}
        </button>
        {isSidebarOpen && (
          <ul className="mt-2 space-y-2 max-h-[calc(100vh-112px)] overflow-y-auto">
            {categoriesData?.map((category) => (
              <MyLink key={category.id}>
                <button
                  onClick={() => scrollToElement(category.name)}
                  className="block py-2 px-4 rounded-lg hover:bg-gray-100 w-full text-left"
                >
                  {category.name}
                </button>
              </MyLink>
            ))}
          </ul>
        )}
      </div>

      {/* Комп */}
      <div className="hidden md:block md:sticky md:top-14 md:h-fit p-4 bg-white shadow-lg md:w-1/5 max-h-[calc(100vh-60px)] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Категорії</h2>
        <ul className="space-y-2">
          {categoriesData?.map((category) => (
            <MyLink key={category.id}>
              <button
                onClick={() => scrollToElement(category.name)}
                className="block py-2 px-4 rounded-lg hover:bg-gray-100 w-full text-left break-words"
              >
                {category.name}
              </button>
            </MyLink>
          ))}
        </ul>
      </div>

      {/* Основний контент */}
      <div className="w-full md:w-3/4 container mx-auto px-4 mt-16 md:mt-0">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-center">Меню</h1>
          {isAdminOrManager && (
            <div className="flex space-x-4">
              <MyButton onClick={() => setIsManageCategoriesOpen(true)}>
                Керувати категоріями
              </MyButton>
              <MyButton onClick={() => setIsManageMenuItemsOpen(true)}>
                Керувати меню
              </MyButton>
            </div>
          )}
        </div>
        {menuItemsData?.map(({ category, items }) => (
          <div key={category} id={category} className="mb-12">
            <h2 className="text-3xl font-semibold mb-6">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  description={item.description || "Опис відсутній"}
                  price={Number(item.price)}
                  image={item.photoUrl || "/highlight-1.jpg"}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuPageClient;
