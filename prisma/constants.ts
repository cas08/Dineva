import { TableStatus } from "@prisma/client";
const categoryData = [
  { name: "Сніданки" },
  { name: "Сезонні страви" },
  { name: "Авторські закуски" },
  { name: "Фірмові страви" },
  { name: "Вулична їжа" },
  { name: "Страви з мангалу" },
  { name: "Рибні делікатеси" },
  { name: "Дитяче меню" },
  { name: "Фітнес-меню" },
  { name: "Коктейлі та напої" },
];

const menuItemData = [
  {
    name: "Яєчня з трюфелем",
    description: "Яйця пашот з трюфельною олією та мікрогріном",
    price: 340.0,
    categoryId: 1,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745506127/menu-photos/ajdycnbofiijn72sxzr9.jpg",
  },
  {
    name: "Салат із полуницею та сиром Брі",
    description: "Свіжа полуниця, мікс салатів, сир Брі, горішки",
    price: 420.0,
    categoryId: 2,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745506598/menu-photos/c7azoqde4fvde6u32azc.jpg",
  },
  {
    name: "Гуакамоле з начос",
    description: "Подача у мексиканському стилі з авокадо та лаймом",
    price: 275.0,
    categoryId: 3,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745506658/menu-photos/c4kojdkftwqdfxuchbmw.jpg",
  },
  {
    name: "Стейк томагавк",
    description: "Соковитий стейк з витриманого м’яса на кістці",
    price: 1150.0,
    categoryId: 4,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745506768/menu-photos/q9b6v3wzie5a9q6bqt7r.jpg",
  },
  {
    name: "Бургер з креветками",
    description: "Креветки в темпурі, лаймовий соус, хрустка булочка",
    price: 520.0,
    categoryId: 5,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745506828/menu-photos/v4ms2nbcux6at0c3buhf.jpg",
  },
  {
    name: "Філе дорадо на грилі",
    description: "Подано з лимонним соусом та овочами гриль",
    price: 670.0,
    categoryId: 7,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745506863/menu-photos/z5lqmwnsdogh0b1sux7s.jpg",
  },
  {
    name: "Фітнес боул з кіноа",
    description: "Кіноа, авокадо, курка гриль, овочі, легкий соус",
    price: 398.0,
    categoryId: 9,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745506910/menu-photos/zo44vvxohv1emuzwbq7w.jpg",
  },
  {
    name: "Мохіто безалкогольний",
    description: "Освіжаючий напій з м'ятою, лаймом та льодом",
    price: 165.0,
    categoryId: 10,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745506964/menu-photos/bvedjr84tl4cfskccaep.jpg",
  },
  {
    name: "Англійський сніданок",
    description: "Яйця, сосиски, тости, квасоля, бекон",
    price: 365.0,
    categoryId: 1,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745507007/menu-photos/bkzq8oyybkqimqfwridx.jpg",
  },
  {
    name: "Тост з авокадо та яйцем пашот",
    description: "Хрусткий тост, крем з авокадо, яйце пашот",
    price: 295.0,
    categoryId: 1,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745507069/menu-photos/nsbe5bcrogo6nbw0e1lo.jpg",
  },
  {
    name: "Теплий салат з качкою",
    description: "Запечена качка, мікс салатів, кедрові горішки",
    price: 455.0,
    categoryId: 2,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745507144/menu-photos/vf4tcobbbj804lqfyzzt.jpg",
  },
  {
    name: "Тартар з лосося",
    description: "Свіжий лосось, авокадо, соус понзу",
    price: 498.0,
    categoryId: 3,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745507180/menu-photos/thln3uapzgar9sjkkh95.jpg",
  },
  {
    name: "Карпачо з телятини",
    description: "Тонко нарізана телятина, пармезан, рукола",
    price: 430.0,
    categoryId: 3,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745507231/menu-photos/owv3w5td8zqfvz0sdvyf.jpg",
  },
  {
    name: "Пательня з овочами та телятиною",
    description: "Гаряча страва з сезонними овочами та м’ясом",
    price: 570.0,
    categoryId: 4,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745507268/menu-photos/kttj1bcgmcvxqav11mox.jpg",
  },
  {
    name: "Тако з куркою",
    description: "Мексиканські тако з куркою та овочами",
    price: 350.0,
    categoryId: 5,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745507346/menu-photos/mbyw5cvpo8dfqeic2kpg.jpg",
  },
  {
    name: "Хот-дог Нью-Йорк",
    description: "Сосиска, булочка, карамелізована цибуля, гірчиця",
    price: 265.0,
    categoryId: 5,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745507395/menu-photos/xskxs4rajqfmfrqlyb4r.jpg",
  },
  {
    name: "Кебаб з баранини",
    description: "Подача з лавашем та соусом",
    price: 445.0,
    categoryId: 6,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745507439/menu-photos/x7dphrllkoywqdmvppaj.jpg",
  },
  {
    name: "Стейк з тунця",
    description: "Тунець середньої прожарки з соусом теріякі",
    price: 720.0,
    categoryId: 7,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745507469/menu-photos/nnvsgyebumipl8brf6yo.jpg",
  },
  {
    name: "Філе лосося в духовці",
    description: "Лосось, запечений із лимоном та травами",
    price: 689.0,
    categoryId: 7,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745507542/menu-photos/i6wqafpukz2rfskxhukf.png",
  },
  {
    name: "Міні-бургери для дітей",
    description: "2 невеликі бургери з фрикадельками та картопля фрі",
    price: 275.0,
    categoryId: 8,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745507647/menu-photos/ywbfkzuwj9ny4feliolx.jpg",
  },
  {
    name: "Каша з бананом та медом",
    description: "Овсяна каша з фруктами",
    price: 192.0,
    categoryId: 8,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745507681/menu-photos/oegpq1vpiuxszhpnjkkr.jpg",
  },
  {
    name: "Смузі боул з ягодами",
    description: "Банан, полуниця, чорниця, грецький йогурт",
    price: 322.0,
    categoryId: 9,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745507719/menu-photos/ywr8eac8bt38sdyuhlnb.jpg",
  },
  {
    name: "Омлет з овочами та шпинатом",
    description: "Без масла, без смаження — здоровий варіант",
    price: 295.0,
    categoryId: 9,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745507796/menu-photos/vegicsjkwqedoiwr3psk.jpg",
  },
  {
    name: "Мохіто з полуницею",
    description: "Фруктовий варіант класичного коктейлю",
    price: 182.0,
    categoryId: 10,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745507863/menu-photos/mpctzlvedrd6h6tpfvqi.jpg",
  },
  {
    name: "Матча латте",
    description: "Напій на основі японського зеленого чаю",
    price: 164.0,
    categoryId: 10,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745507906/menu-photos/sjqk4pgmwm768jfzrynq.jpg",
  },
  {
    name: "Фрапе",
    description: "Охолоджена кава з молоком",
    price: 146.0,
    categoryId: 10,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745507940/menu-photos/vefl9j3lui3gdsehmfzf.jpg",
  },
  {
    name: "Фреш з грейпфрута",
    description: "Свіжий сік без додавання цукру",
    price: 155.0,
    categoryId: 10,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745507974/menu-photos/nnatjxo43aeh1h6e6lwd.jpg",
  },
  {
    name: "Теплий глінтвейн",
    description: "Безалкогольна версія з апельсином, корицею та гвоздикою",
    price: 165.0,
    categoryId: 10,
    photoUrl:
      "https://res.cloudinary.com/dkqaugzss/image/upload/v1745508073/menu-photos/b3p4mh21tlvs30jcyyag.jpg",
  },
];

const cityData = [
  { cityName: "Київ" },
  { cityName: "Львів" },
  { cityName: "Одеса" },
];
const addressData = [
  { streetName: "Хрещатик", buildingNumber: "23В", cityId: 1 },
  { streetName: "Майдан Незалежності", buildingNumber: "10", cityId: 1 },
  { streetName: "Площа Ринок", buildingNumber: "5Г", cityId: 2 },
  { streetName: "Дерибасівська", buildingNumber: "15", cityId: 3 },
];
const restaurantData = [
  { addressId: 1 },
  { addressId: 2 },
  { addressId: 3 },
  { addressId: 4 },
];
const tableData: {
  tableNumber: number;
  capacity: number;
  restaurantId: number;
  status: TableStatus;
}[] = [
  // Restaurant 1
  { tableNumber: 2, capacity: 2, restaurantId: 1, status: TableStatus.free },
  { tableNumber: 4, capacity: 4, restaurantId: 1, status: TableStatus.free },
  { tableNumber: 5, capacity: 5, restaurantId: 1, status: TableStatus.free },
  { tableNumber: 6, capacity: 6, restaurantId: 1, status: TableStatus.free },
  { tableNumber: 8, capacity: 8, restaurantId: 1, status: TableStatus.free },
  { tableNumber: 10, capacity: 10, restaurantId: 1, status: TableStatus.free },
  // Restaurant 2
  { tableNumber: 2, capacity: 2, restaurantId: 2, status: TableStatus.free },
  { tableNumber: 4, capacity: 4, restaurantId: 2, status: TableStatus.free },
  { tableNumber: 5, capacity: 5, restaurantId: 2, status: TableStatus.free },
  { tableNumber: 6, capacity: 6, restaurantId: 2, status: TableStatus.free },
  { tableNumber: 8, capacity: 8, restaurantId: 2, status: TableStatus.free },
  { tableNumber: 10, capacity: 10, restaurantId: 2, status: TableStatus.free },
  // Restaurant 3
  { tableNumber: 2, capacity: 2, restaurantId: 3, status: TableStatus.free },
  { tableNumber: 4, capacity: 4, restaurantId: 3, status: TableStatus.free },
  { tableNumber: 5, capacity: 5, restaurantId: 3, status: TableStatus.free },
  { tableNumber: 6, capacity: 6, restaurantId: 3, status: TableStatus.free },
  { tableNumber: 8, capacity: 8, restaurantId: 3, status: TableStatus.free },
  { tableNumber: 10, capacity: 10, restaurantId: 3, status: TableStatus.free },
  // Restaurant 4
  { tableNumber: 2, capacity: 2, restaurantId: 4, status: TableStatus.free },
  { tableNumber: 4, capacity: 4, restaurantId: 4, status: TableStatus.free },
  { tableNumber: 5, capacity: 5, restaurantId: 4, status: TableStatus.free },
  { tableNumber: 6, capacity: 6, restaurantId: 4, status: TableStatus.free },
  { tableNumber: 8, capacity: 8, restaurantId: 4, status: TableStatus.free },
  { tableNumber: 10, capacity: 10, restaurantId: 4, status: TableStatus.free },
];
export {
  cityData,
  categoryData,
  menuItemData,
  addressData,
  restaurantData,
  tableData,
};
