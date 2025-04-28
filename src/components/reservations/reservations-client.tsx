"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Alert, Grid, CircularProgress } from "@mui/material";
import { CitiesApi, AddressesApi, ReservationsApi } from "@/services";
import { uk } from "date-fns/locale";
import { addDays, addMonths } from "date-fns";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import {
  calculateEndTime,
  MAX_RESERVATION_AHEAD_MONTHS,
} from "@/utils/reservation-utils";
import { ReservationModal } from "./reservation-modal";
import { MySelect } from "@/components/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { City, Address, TimeSlot } from "@/@types";
import { formatDateToDDMMYYYY } from "@/utils/date-utils";

const ReservationsPageClient = () => {
  const queryClient = useQueryClient();

  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [peopleCount, setPeopleCount] = useState<string>("2");
  const [duration, setDuration] = useState<string>("1");
  const [today, setToday] = useState<Date | null>(null);
  const [tomorrow, setTomorrow] = useState<Date | null>(null);
  const [maxDate, setMaxDate] = useState<Date | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setTomorrow(addDays(now, 1));
    setMaxDate(addMonths(now, MAX_RESERVATION_AHEAD_MONTHS));
  }, []);

  const { data: cities = [], isLoading: isCitiesLoading } = useQuery<City[]>({
    queryKey: ["cities"],
    queryFn: CitiesApi.getAll,
  });

  const { data: addresses = [], isLoading: isAddressesLoading } = useQuery<
    Address[]
  >({
    queryKey: ["addresses", selectedCity],
    queryFn: async () => {
      if (!selectedCity) return [];
      return AddressesApi.getByCity(Number(selectedCity));
    },
    enabled: !!selectedCity,
  });

  const {
    data: timeSlots = [],
    isLoading: isSlotsLoading,
    isFetching: isSlotsFetching,
  } = useQuery<TimeSlot[]>({
    queryKey: [
      "availableTimeSlots",
      selectedAddress,
      selectedDate,
      peopleCount,
      duration,
    ],
    queryFn: async () => {
      if (!selectedAddress || !selectedDate || !peopleCount || !duration)
        return [];

      const formattedDate = formatDateToDDMMYYYY(selectedDate);
      return ReservationsApi.getAvailableTimeSlots(
        Number(selectedAddress),
        formattedDate,
        Number(peopleCount),
        duration,
      );
    },
    enabled: !!(selectedAddress && selectedDate && peopleCount && duration),
  });

  const handleConfirm = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["availableTimeSlots"],
    });

    setOpen(false);
    setSelectedTime(null);
    setSelectedTable(null);
  };

  const handleTimeSlotClick = (time: string, tableIds: number[]) => {
    if (tableIds.length > 0) {
      setSelectedTime(time);
      setSelectedTable(tableIds[0]);
      setOpen(true);
    }
  };

  const endTime =
    selectedTime && duration ? calculateEndTime(selectedTime, duration) : "";
  const durationOptions = ["1", "1.5", "2", "2.5", "3"];

  if (!today || !tomorrow || !maxDate) return null;

  const availableTimeSlots = timeSlots.filter((slot) => slot.available);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={uk}>
      <>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            px: { xs: 3, sm: 6 },
            py: 6,
          }}
        >
          <Box
            sx={{
              maxWidth: 450,
              width: "100%",
              mx: "auto",
              px: 3,
              py: 4,
              boxShadow: 2,
              borderRadius: 3,
              bgcolor: "#fff",
            }}
          >
            <Grid container spacing={2}>
              <Grid size={12}>
                <MySelect
                  label="Місто"
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSelectedAddress("");
                  }}
                  options={cities.map((city: City) => ({
                    value: city.id.toString(),
                    label: city.cityName,
                  }))}
                  disabled={isCitiesLoading}
                  loading={isCitiesLoading}
                  fullWidth
                />
              </Grid>

              <Grid size={12}>
                <MySelect
                  label={selectedCity ? "Адреса" : "Виберіть місто"}
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  options={addresses.map((addr: Address) => ({
                    value: addr.id.toString(),
                    label: `${addr.streetName}, ${addr.buildingNumber}`,
                  }))}
                  disabled={!selectedCity || isAddressesLoading}
                  loading={isAddressesLoading}
                  fullWidth
                />
              </Grid>

              <Grid size={6}>
                <MySelect
                  label="Люди"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(e.target.value)}
                  options={[...Array(10)].map((_, i) => ({
                    value: String(i + 1),
                    label: String(i + 1),
                  }))}
                  fullWidth
                />
              </Grid>

              <Grid size={6}>
                <MySelect
                  label="Тривалість (години)"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  options={durationOptions.map((opt) => ({
                    value: opt,
                    label: opt,
                  }))}
                  fullWidth
                />
              </Grid>

              <Grid size={12}>
                <DatePicker
                  label="Дата"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  minDate={tomorrow}
                  maxDate={maxDate}
                  format="dd.MM.yyyy"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                      sx: {
                        "& .MuiInputBase-root": {
                          height: "56px",
                          borderColor: selectedDate
                            ? "var(--primary)"
                            : "rgba(0, 0, 0, 0.23)",
                          "&:hover": {
                            borderColor: selectedDate
                              ? "var(--primary)"
                              : "rgba(0, 0, 0, 0.87)",
                          },
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: selectedDate
                            ? "var(--primary) !important"
                            : "rgba(0, 0, 0, 0.23)",
                        },
                        "& .MuiInputLabel-root": {
                          color: selectedDate
                            ? "var(--primary)"
                            : "rgba(0, 0, 0, 0.6)",
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "var(--primary)",
                        },
                        "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                          {
                            borderColor: "var(--primary) !important",
                          },
                      },
                    },
                    day: {
                      sx: {
                        "&.MuiPickersDay-root.Mui-selected": {
                          backgroundColor: "var(--primary)",
                          color: "var(--background)",
                          "&:hover": {
                            backgroundColor: "var(--primary)",
                            opacity: 0.9,
                          },
                        },
                      },
                    },
                  }}
                />
              </Grid>

              {!selectedCity ||
              !selectedAddress ||
              !selectedDate ||
              !peopleCount ||
              !duration ? (
                <Grid size={12}>
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography fontWeight="bold">
                      Будь ласка, виберіть всі поля.
                    </Typography>
                    Для перегляду доступних таймслотів виберіть місто, адресу,
                    дату, кількість гостей та тривалість.
                  </Alert>
                </Grid>
              ) : (
                <Grid size={12}>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Доступні години:
                  </Typography>
                  {isSlotsLoading || isSlotsFetching ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                    >
                      <CircularProgress
                        style={{ color: "var(--primary)" }}
                        size={30}
                      />
                    </Box>
                  ) : availableTimeSlots.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Немає доступних столиків для вибраних параметрів.
                    </Alert>
                  ) : (
                    <Grid container spacing={1} mt={2}>
                      {availableTimeSlots.map((slot) => (
                        <Grid size={3} key={slot.time}>
                          <Box
                            sx={{
                              px: 2,
                              py: 1,
                              borderRadius: 2,
                              backgroundColor: "#eee",
                              fontWeight: 500,
                              textAlign: "center",
                              cursor: "pointer",
                              userSelect: "none",
                              ":hover": { backgroundColor: "#ddd" },
                            }}
                            onClick={() =>
                              handleTimeSlotClick(
                                slot.time,
                                slot.availableTables,
                              )
                            }
                          >
                            {slot.time}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Grid>
              )}
            </Grid>
          </Box>
        </Box>

        {selectedTable && (
          <ReservationModal
            open={open}
            onCloseAction={() => {
              setOpen(false);
              setSelectedTime(null);
              setSelectedTable(null);
            }}
            onConfirmAction={handleConfirm}
            restaurantName={
              selectedCity && selectedAddress
                ? `м.${cities.find((c: City) => c.id === +selectedCity)?.cityName}, ${
                    addresses.find((a: Address) => a.id === +selectedAddress)
                      ?.streetName
                  }, ${
                    addresses.find((a: Address) => a.id === +selectedAddress)
                      ?.buildingNumber
                  }`
                : ""
            }
            date={selectedDate ? formatDateToDDMMYYYY(selectedDate) : ""}
            startTime={selectedTime || ""}
            endTime={endTime}
            people={peopleCount}
            tableId={selectedTable}
          />
        )}
      </>
    </LocalizationProvider>
  );
};

export default ReservationsPageClient;
