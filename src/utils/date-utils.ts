import { format, parse } from "date-fns";
import { uk } from "date-fns/locale";

// в формат "дд.мм.рррр"
export const formatDateToDDMMYYYY = (date: Date | null): string => {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

// Парсинг "дд.мм.рррр" в об'єкт Date
export const parseDateString = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const [day, month, year] = dateStr.split(".").map(Number);
  return new Date(year, month - 1, day);
};

// Перетворення часу в форматі "гг:хх" в кількість хвилин
export const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

export const formatDateToReadableString = (dateString: string) => {
  try {
    const parsedDate = parse(dateString, "dd.MM.yyyy", new Date());
    return format(parsedDate, "EEEE, d MMMM yyyy", { locale: uk });
  } catch (error) {
    console.error(error);
    return dateString;
  }
};

export const isDateInPast = (dateStr: string): boolean => {
  try {
    const today = new Date();
    const [day, month, year] = dateStr.split(".").map(Number);
    const reservationDate = new Date(year, month - 1, day);
    today.setHours(0, 0, 0, 0);
    reservationDate.setHours(0, 0, 0, 0);
    return reservationDate < today;
  } catch (error) {
    console.error(error);
    return false;
  }
};

// Форматування часу в формат "гг:хх"
export const formatTime = (timeValue: string): string => {
  if (!timeValue) return "—";

  try {
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeValue)) {
      return timeValue.substring(0, 5);
    }

    const time = new Date(`1970-01-01T${timeValue}`);
    return time.toLocaleTimeString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Time formatting error:", error);
    return timeValue;
  }
};

// в формат "дд.мм.рррр гг:хх"
export const formatDateTime = (
  dateTime: string | Date | null | undefined,
): string => {
  if (!dateTime) return "—";

  try {
    const date = typeof dateTime === "string" ? new Date(dateTime) : dateTime;
    return date.toLocaleString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("DateTime formatting error:", error);
    return String(dateTime);
  }
};
