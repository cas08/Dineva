const PROTECTED_PREFIX = "protected/";

export enum ApiRoutes {
  USER_REGISTRATION = "auth/register",

  MENU_ITEMS = "menu-items",
  PROTECTED_MENU_ITEMS = `${PROTECTED_PREFIX}menu-items`,

  CATEGORIES = "categories",
  PROTECTED_CATEGORIES = `${PROTECTED_PREFIX}categories`,

  PHOTOS = `${PROTECTED_PREFIX}photos`,

  REVIEWS = "reviews",

  CITIES = "cities",
  PROTECTED_CITIES = `${PROTECTED_PREFIX}cities`,

  ADDRESSES = "addresses",
  PROTECTED_ADDRESSES = `${PROTECTED_PREFIX}addresses`,

  RESTAURANTS = "restaurants",
  PROTECTED_RESTAURANTS = `${PROTECTED_PREFIX}restaurants`,

  TABLES = "tables",
  PROTECTED_TABLES = `${PROTECTED_PREFIX}tables`,

  RESERVATIONS = "reservations",
  USER_RESERVATIONS = "reservations/by-user",

  USER_PROFILE = "users/profile",
  USER_CHANGE_PASSWORD = "users/password",

  PROTECTED_USERS = `${PROTECTED_PREFIX}users`,
  PROTECTED_RESERVATIONS = `${PROTECTED_PREFIX}reservations`,
}
