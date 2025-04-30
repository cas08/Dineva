import { menuItemData } from "@/../prisma/constants";
export const promotions = [
  {
    id: 1,
    title: "-30% у будні дні",
    description:
      "Забронюйте столик з понеділка по четвер і отримайте знижку 30% на все меню",
    image: "/promotion-1.jpg",
    link: "/reservations",
  },
  {
    id: 2,
    title: "Сімейні вихідні",
    description:
      "Приходьте всією родиною по вихідних та отримайте десерт у подарунок для кожного",
    image: "/promotion-2.jpg",
    link: "/reservations",
  },
  {
    id: 3,
    title: "Шеф рекомендує",
    description: "Спробуйте нове сезонне меню від нашого шеф-кухаря",
    image: "/promotion-3.jpg",
    link: "/menu",
  },
];

export const popularItems = menuItemData.slice(0, 6).map((item, index) => ({
  id: index + 1,
  name: item.name,
  description: item.description,
  image: item.photoUrl,
  price: `${item.price} грн`,
}));
