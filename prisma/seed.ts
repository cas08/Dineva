import {
  addressData,
  categoryData,
  cityData,
  menuItemData,
  restaurantData,
  tableData,
} from "./constants";
import db from "../src/lib/prisma-client";

async function fillWithData() {
  await db.category.createMany({ data: categoryData });
  await db.menuItem.createMany({ data: menuItemData });
  await db.city.createMany({ data: cityData });
  await db.address.createMany({ data: addressData });
  await db.restaurant.createMany({ data: restaurantData });
  await db.table.createMany({ data: tableData });
}

async function clearData() {
  //users
  await db.$executeRaw`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE`;
  await db.$executeRaw`TRUNCATE TABLE "sessions" RESTART IDENTITY CASCADE`;
  await db.$executeRaw`TRUNCATE TABLE "accounts" RESTART IDENTITY CASCADE`;

  //restaurant
  await db.$executeRaw`TRUNCATE TABLE "tables" RESTART IDENTITY CASCADE`;
  await db.$executeRaw`TRUNCATE TABLE "restaurants" RESTART IDENTITY CASCADE`;
  await db.$executeRaw`TRUNCATE TABLE "addresses" RESTART IDENTITY CASCADE`;
  await db.$executeRaw`TRUNCATE TABLE "cities" RESTART IDENTITY CASCADE`;

  //review
  await db.$executeRaw`TRUNCATE TABLE "reviews" RESTART IDENTITY CASCADE`;

  //reservations
  await db.$executeRaw`TRUNCATE TABLE "reservations" RESTART IDENTITY CASCADE`;

  //menu
  await db.$executeRaw`TRUNCATE TABLE "menu_items" RESTART IDENTITY CASCADE`;
  await db.$executeRaw`TRUNCATE TABLE "categories" RESTART IDENTITY CASCADE`;
}

async function main() {
  try {
    await clearData();
    await fillWithData();
  } catch (e) {
    console.error(e);
  }
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
