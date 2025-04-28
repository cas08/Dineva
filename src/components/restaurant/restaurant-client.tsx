"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, Switch, FormControlLabel } from "@mui/material";
import { CreateRestaurantModal } from "./restaurant-modal";
import { MyButton, MySelect } from "@/components/ui";
import { CitiesApi, AddressesApi } from "@/services";
import { DeleteRestaurantModal } from "./delete-restaurant-modal";
import { TablesTable } from "@/components/restaurant/table-components/tables-table";
import { EditCityModal } from "@/components/restaurant/cities-modals/edit-city-modal";
import { EditAddressModal } from "@/components/restaurant/address-modals/edit-address-modal";
import { useQueryClient } from "@tanstack/react-query";
import type { AddressOption, CityOption } from "@/@types";

function RestaurantClient() {
  const [editMode, setEditMode] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<number | string>("");
  const [selectedAddress, setSelectedAddress] = useState<number | string>("");
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [addressOptions, setAddressOptions] = useState<AddressOption[]>([]);
  const [cityEditModalOpen, setCityEditModalOpen] = useState(false);
  const [addressEditModalOpen, setAddressEditModalOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const savedEditMode = localStorage.getItem("restaurantEditMode");
    if (savedEditMode !== null) {
      setEditMode(savedEditMode === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("restaurantEditMode", String(editMode));
  }, [editMode]);

  const { data: cities = [], isLoading: isCitiesLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: CitiesApi.getAll,
  });

  const { data: addresses = [], isLoading: isAddressesLoading } = useQuery({
    queryKey: ["addresses", selectedCity],
    queryFn: () => AddressesApi.getAll(),
    enabled: !!selectedCity,
  });

  useEffect(() => {
    if (cities && Array.isArray(cities)) {
      const newCityOptions = cities.map((city) => ({
        value: city.id,
        label: city.cityName,
      }));

      setCityOptions((prev) => {
        if (
          prev.length === newCityOptions.length &&
          prev.every(
            (prevCity, index) => prevCity.value === newCityOptions[index].value,
          )
        ) {
          return prev;
        }
        return newCityOptions;
      });
    }
  }, [cities]);

  useEffect(() => {
    if (addresses && Array.isArray(addresses)) {
      const filteredAddresses = selectedCity
        ? addresses.filter((address) => address.cityId === Number(selectedCity))
        : addresses;
      const newAddressOptions = filteredAddresses.map((address) => ({
        value: address.id,
        label: `${address.streetName}, ${address.buildingNumber}`,
        cityId: address.cityId,
      }));
      setAddressOptions((prev) => {
        if (
          prev.length === newAddressOptions.length &&
          prev.every(
            (prevAddress, index) =>
              prevAddress.value === newAddressOptions[index].value,
          )
        ) {
          return prev;
        }
        return newAddressOptions;
      });
    }
  }, [addresses, selectedCity]);

  const selectedAddressObj = addressOptions.find(
    (addr) => addr.value === selectedAddress,
  );
  const addressName = selectedAddressObj?.label || "";
  const cityId = selectedAddressObj?.cityId || 0;

  const selectedCityObj = cityOptions.find(
    (city) => city.value === selectedCity,
  );
  const cityName = selectedCityObj?.label || "";

  const handleEditModeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditMode(event.target.checked);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1">
          Управління ресторанами
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <FormControlLabel
            control={
              <Switch
                checked={editMode}
                onChange={handleEditModeToggle}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "var(--primary)",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "var(--primary)",
                  },
                }}
              />
            }
            label="Режим редагування"
            sx={{
              mr: 2,
              ".MuiFormControlLabel-label": {
                fontWeight: editMode ? "bold" : "normal",
                color: editMode ? "var(--accent)" : "inherit",
              },
            }}
          />

          {editMode && (
            <>
              <MyButton
                customvariant="confirm"
                onClick={() => setOpenCreateModal(true)}
              >
                Додати ресторан
              </MyButton>
              <MyButton
                onClick={() => setOpenDeleteModal(true)}
                customvariant="delete"
                color="error"
                disabled={!selectedCity || !selectedAddress}
              >
                Видалити ресторан
              </MyButton>
            </>
          )}
        </Box>
      </Box>

      {/* Фільтри */}
      <Box sx={{ display: "flex", gap: 4, mb: 4, alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MySelect
            label="Місто"
            value={selectedCity}
            onChange={(event) => {
              setSelectedCity(event.target.value);
              setSelectedAddress("");
            }}
            options={cityOptions}
            sx={{ minWidth: 200 }}
            disabled={isCitiesLoading}
            loading={isCitiesLoading}
          />
          {editMode && selectedCity && (
            <MyButton
              onClick={() => setCityEditModalOpen(true)}
              customvariant="default"
            >
              ✎
            </MyButton>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MySelect
            label="Адреса"
            value={selectedAddress}
            onChange={(event) => setSelectedAddress(event.target.value)}
            options={addressOptions}
            sx={{ minWidth: 200 }}
            disabled={!selectedCity || isAddressesLoading}
            loading={isAddressesLoading}
          />
          {editMode && selectedAddress && (
            <MyButton
              onClick={() => setAddressEditModalOpen(true)}
              customvariant="default"
            >
              ✎
            </MyButton>
          )}
        </Box>
      </Box>

      {selectedCity && selectedAddress ? (
        <TablesTable
          restaurantId={Number(selectedAddress)}
          editMode={editMode}
        />
      ) : (
        <Box sx={{ mt: 4 }}>
          <Typography variant="body1">
            Виберіть місто та адресу, щоб завантажити таблицю зі столиками.
          </Typography>
        </Box>
      )}

      <CreateRestaurantModal
        open={openCreateModal}
        onCloseAction={() => setOpenCreateModal(false)}
      />

      {selectedAddress && (
        <DeleteRestaurantModal
          isOpen={openDeleteModal}
          onCloseAction={() => {
            setOpenDeleteModal(false);
            setSelectedCity("");
            setSelectedAddress("");
          }}
          addressId={Number(selectedAddress)}
          addressName={addressName}
          cityId={cityId}
          cityName={cityName}
        />
      )}

      {selectedCity && (
        <EditCityModal
          isOpen={cityEditModalOpen}
          onCloseAction={() => setCityEditModalOpen(false)}
          onUpdateAction={(updatedCity) => {
            setCityOptions((prev) =>
              prev.map((c) =>
                c.value === updatedCity.id
                  ? { ...c, label: updatedCity.cityName }
                  : c,
              ),
            );
          }}
          initialData={{
            id:
              typeof selectedCity === "string"
                ? parseInt(selectedCity, 10)
                : selectedCity,
            cityName:
              cityOptions.find((c) => c.value === selectedCity)?.label || "",
          }}
        />
      )}

      {selectedAddress && (
        <EditAddressModal
          isOpen={addressEditModalOpen}
          onCloseAction={() => setAddressEditModalOpen(false)}
          onUpdateAction={async (updated) => {
            await queryClient.invalidateQueries({
              queryKey: ["addresses", selectedCity],
            });

            setAddressOptions((prev) =>
              prev.map((addr) =>
                addr.value === updated.id
                  ? {
                      ...addr,
                      label: `${updated.streetName}, ${updated.buildingNumber}`,
                    }
                  : addr,
              ),
            );

            if (updated.id) {
              setSelectedAddress(updated.id);
            }
          }}
          initialData={{
            id: selectedAddress,
            streetName:
              addressOptions
                .find((a) => a.value === selectedAddress)
                ?.label?.split(",")[0]
                ?.trim() || "",
            buildingNumber:
              addressOptions
                .find((a) => a.value === selectedAddress)
                ?.label?.split(",")[1]
                ?.trim() || "",
          }}
        />
      )}
    </Box>
  );
}

export default RestaurantClient;
