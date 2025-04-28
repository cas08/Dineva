"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import toast from "react-hot-toast";
import { AddressesApi, CitiesApi, RestaurantsApi } from "@/services";
import { MyButton, MySelect, MyTextField } from "../ui";
import { EditCityModal } from "./cities-modals/edit-city-modal";
import { getErrorMessage } from "@/utils/error-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CityOption, RestaurantFormData } from "@/@types";
import { RestaurantFormSchema } from "@/zod-schemas";

interface CreateRestaurantModalProps {
  open: boolean;
  onCloseAction: () => void;
}

export const CreateRestaurantModal = ({
  open,
  onCloseAction,
}: CreateRestaurantModalProps) => {
  const [isEditCityOpen, setIsEditCityOpen] = useState(false);
  const queryClient = useQueryClient();
  const [creationInProgress, setCreationInProgress] = useState(false);

  const { control, handleSubmit, setValue, reset, watch } =
    useForm<RestaurantFormData>({
      resolver: zodResolver(RestaurantFormSchema),
      defaultValues: {
        cityId: "",
        streetName: "",
        buildingNumber: "",
        newCityName: "",
      },
      mode: "onChange",
    });

  const cityId = watch("cityId");
  const streetName = watch("streetName");
  const buildingNumber = watch("buildingNumber");
  const isFormComplete = !!cityId && !!streetName && !!buildingNumber;
  const [localCities, setLocalCities] = useState<CityOption[]>([]);
  const [tempCities, setTempCities] = useState<CityOption[]>([]);
  const { data: cities = [], isLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: CitiesApi.getAll,
  });

  useEffect(() => {
    if (open) {
      reset({
        cityId: "",
        streetName: "",
        buildingNumber: "",
        newCityName: "",
      });
      setTempCities([]);
    }
  }, [open, reset]);

  useEffect(() => {
    if (cities && Array.isArray(cities)) {
      const dbCities = cities.map((city) => ({
        value: city.id,
        label: city.cityName,
      }));

      const filteredTempCities = tempCities.filter(
        (tempCity) =>
          !dbCities.some(
            (dbCity) =>
              dbCity.label.toLowerCase() === tempCity.label.toLowerCase(),
          ),
      );

      const newLocalCities = [...dbCities, ...filteredTempCities];

      if (JSON.stringify(newLocalCities) !== JSON.stringify(localCities)) {
        setLocalCities(newLocalCities);
      }
    }
  }, [cities, tempCities, localCities]);

  const handleAddCity = () => {
    setIsEditCityOpen(true);
  };

  const handleCityUpdate = (updatedCity: { id: number; cityName: string }) => {
    const normalizedName = updatedCity.cityName.trim().toLowerCase();

    const cityNameExistsInDB = cities.some(
      (city) => city.cityName.toLowerCase() === normalizedName,
    );

    const cityNameExistsInTemp = tempCities.some(
      (city) => city.label.toLowerCase() === normalizedName,
    );

    if (cityNameExistsInDB || cityNameExistsInTemp) {
      toast.error("Місто з такою назвою вже існує");
      return;
    }

    const newCityOption = {
      value: updatedCity.id,
      label: updatedCity.cityName,
    };

    setTempCities([newCityOption]);
    setValue("cityId", updatedCity.id, { shouldValidate: true });
    setValue("newCityName", updatedCity.cityName, { shouldValidate: true });
  };

  const createCityMutation = useMutation({
    mutationFn: (cityName: string) => CitiesApi.create(cityName),
  });

  const createAddressMutation = useMutation({
    mutationFn: (data: {
      cityId: number;
      streetName: string;
      buildingNumber: string;
    }) => AddressesApi.create(data),
  });

  const createRestaurantMutation = useMutation({
    mutationFn: (addressId: number) => RestaurantsApi.create(addressId),
  });

  const onSubmit: SubmitHandler<RestaurantFormData> = async (data) => {
    if (creationInProgress) {
      return;
    }

    setCreationInProgress(true);

    try {
      let actualCityId: number;

      if (typeof data.cityId === "string") {
        if (data.cityId.startsWith("new-") && data.newCityName) {
          const normalizedName = data.newCityName.trim().toLowerCase();

          const existingCity = cities.find(
            (city) => city.cityName.toLowerCase() === normalizedName,
          );

          if (existingCity) {
            actualCityId = existingCity.id;
          } else {
            toast.loading("Створення міста...", { id: "city-creation" });
            const newCity = await createCityMutation.mutateAsync(
              data.newCityName.trim(),
            );
            toast.success("Місто успішно створено", { id: "city-creation" });
            actualCityId = newCity.id;
          }
        } else {
          actualCityId = parseInt(data.cityId, 10);
        }
      } else {
        actualCityId = data.cityId as number;
      }

      if (isNaN(actualCityId)) {
        throw new Error("Невірний ID міста");
      }

      toast.loading("Створення адреси...", { id: "address-creation" });

      const address = await createAddressMutation.mutateAsync({
        cityId: actualCityId,
        streetName: data.streetName.trim(),
        buildingNumber: data.buildingNumber.trim(),
      });

      toast.success("Адресу успішно створено", { id: "address-creation" });

      toast.loading("Створення ресторану...", { id: "restaurant-creation" });

      await createRestaurantMutation.mutateAsync(address.id);

      toast.success("Ресторан успішно створено!", {
        id: "restaurant-creation",
      });

      await queryClient.invalidateQueries({ queryKey: ["cities"] });
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      await queryClient.invalidateQueries({ queryKey: ["restaurants"] });

      setTempCities([]);
      onCloseAction();
      reset();
    } catch (error) {
      console.error("Error in restaurant creation:", error);
      const errorMessage = getErrorMessage(error);

      if (createCityMutation.isError) {
        toast.error(`Помилка при створенні міста: ${errorMessage}`, {
          id: "city-creation",
        });
      } else if (createAddressMutation.isError) {
        toast.error(`Помилка при створенні адреси: ${errorMessage}`, {
          id: "address-creation",
        });
      } else {
        toast.error(`Помилка при створенні ресторану: ${errorMessage}`, {
          id: "restaurant-creation",
        });
      }

      console.error("Error in restaurant creation flow:", error);
    } finally {
      setCreationInProgress(false);
    }
  };
  return (
    <>
      <Dialog open={open} onClose={onCloseAction} maxWidth="sm" fullWidth>
        <DialogTitle>Додати новий ресторан</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <MySelect
                name="cityId"
                label="Місто *"
                control={control}
                options={localCities}
                fullWidth
                disabled={isLoading || creationInProgress}
              />
              <MyButton
                customvariant="default"
                onClick={handleAddCity}
                disabled={creationInProgress}
              >
                +
              </MyButton>
            </div>

            <MyTextField
              name="streetName"
              label="Назва вулиці *"
              control={control}
              placeholder="Введіть назву вулиці"
              disabled={creationInProgress}
            />

            <MyTextField
              name="buildingNumber"
              label="Номер будинку *"
              control={control}
              placeholder="Введіть номер будинку"
              disabled={creationInProgress}
            />
          </DialogContent>

          <DialogActions>
            <MyButton
              customvariant="cancel"
              onClick={onCloseAction}
              disabled={creationInProgress}
            >
              Скасувати
            </MyButton>
            <MyButton
              type="submit"
              customvariant="confirm"
              disabled={creationInProgress || !isFormComplete}
              title={
                !isFormComplete
                  ? "Заповніть всі обов'язкові поля"
                  : "Створити ресторан"
              }
            >
              {creationInProgress ? "Створення..." : "Створити"}
            </MyButton>
          </DialogActions>
        </form>
      </Dialog>

      <EditCityModal
        isOpen={isEditCityOpen}
        onCloseAction={() => setIsEditCityOpen(false)}
        onUpdateAction={handleCityUpdate}
        initialData={null}
      />
    </>
  );
};
