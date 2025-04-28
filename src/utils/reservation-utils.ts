import type { UserReservation } from "@/@types";

export const RESTAURANT_OPEN_HOUR = 10;
export const RESTAURANT_CLOSE_HOUR = 23;
export const SLOT_INTERVAL_MINUTES = 15;
export const MAX_RESERVATION_DURATION_HOURS = 3;
export const MAX_RESERVATION_AHEAD_MONTHS = 3;

export const generateTimeSlots = (
  startHour = RESTAURANT_OPEN_HOUR,
  endHour = RESTAURANT_CLOSE_HOUR - 1,
  interval = SLOT_INTERVAL_MINUTES,
): string[] => {
  const timeSlots: string[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let min = 0; min < 60; min += interval) {
      if (hour === endHour && min > 0) break;
      const time = `${hour.toString().padStart(2, "0")}:${min
        .toString()
        .padStart(2, "0")}`;
      timeSlots.push(time);
    }
  }
  return timeSlots;
};

export const calculateEndTime = (
  startTime: string,
  duration: string,
): string => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const durationMinutes = parseFloat(duration) * 60;
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, "0")}:${endMinutes
    .toString()
    .padStart(2, "0")}`;
};

export const isSlotWithinWorkingHours = (
  startTime: string,
  duration: string,
  restaurantCloseHour: number,
): boolean => {
  const [endH, endM] = calculateEndTime(startTime, duration)
    .split(":")
    .map(Number);
  return endH * 60 + endM <= restaurantCloseHour * 60;
};

export const sortReservations = (
  resA: UserReservation,
  resB: UserReservation,
  onlyActive: boolean,
): number => {
  try {
    if (onlyActive) {
      const [dayA, monthA, yearA] = resA.date.split(".").map(Number);
      const [dayB, monthB, yearB] = resB.date.split(".").map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);

      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      return resA.startTime.localeCompare(resB.startTime);
    } else {
      if (resA.status === "active" && resB.status !== "active") return -1;
      if (resA.status !== "active" && resB.status === "active") return 1;
      if (resA.status === "active" && resB.status === "active") {
        const [dayA, monthA, yearA] = resA.date.split(".").map(Number);
        const [dayB, monthB, yearB] = resB.date.split(".").map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const aIsFuture = dateA >= today;
        const bIsFuture = dateB >= today;

        if (aIsFuture && !bIsFuture) return -1;
        if (!aIsFuture && bIsFuture) return 1;
        return dateA.getTime() - dateB.getTime();
      }
      const [dayA, monthA, yearA] = resA.date.split(".").map(Number);
      const [dayB, monthB, yearB] = resB.date.split(".").map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateB.getTime() - dateA.getTime();
    }
  } catch (error) {
    console.error("Error sorting reservations:", error);
    return 0;
  }
};
