"use client";

import { MyButton } from "@/components/ui";

function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold mb-4">Помилка 404</h1>
      <h2 className="text-3xl font-semibold mb-2">Сторінку не знайдено</h2>
      <p className="text-gray-600 mb-6">
        Неправильно набрано адресу або такої сторінки на сайті більше не існує.
      </p>
      <MyButton href="/">Перейти на головну сторінку</MyButton>
    </div>
  );
}

export default NotFoundPage;
