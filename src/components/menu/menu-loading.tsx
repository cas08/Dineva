import React from "react";

const MenuLoading: React.FC = () => {
  return (
    <div className="py-12 flex flex-col md:flex-row">
      {/* Бокова панель */}
      <div className="hidden md:block md:w-1/5 p-4 bg-white shadow-lg sticky top-0 h-screen flex-col">
        <h2 className="text-2xl font-bold mb-8">Категорії</h2>
        <ul className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <li key={i}>
              <span className="block py-3 px-4 rounded-lg bg-gray-200 animate-pulse w-full"></span>
            </li>
          ))}
        </ul>
      </div>

      {/* Меню */}
      <div className="w-full md:w-3/4 container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center md:text-left">
          Меню
        </h1>
        {[...Array(3)].map((_, categoryIndex) => (
          <div key={categoryIndex} className="mb-12">
            <h2 className="text-3xl font-semibold mb-6 bg-gray-200 w-1/3 h-6 animate-pulse"></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, itemIndex) => (
                <div
                  key={itemIndex}
                  className="bg-white shadow-lg rounded-lg p-4 animate-pulse"
                >
                  <div className="w-full aspect-square bg-gray-200 rounded-t-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuLoading;
