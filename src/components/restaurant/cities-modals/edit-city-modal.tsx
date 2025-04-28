import React, { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from "@mui/material";
import toast from "react-hot-toast";
import { CitiesApi } from "@/services";
import { MyButton, MyTextField } from "@/components/ui";
import { getErrorMessage } from "@/utils/error-utils";
import { CitySchema } from "@/zod-schemas";
import type { CityFormData, City } from "@/@types";

interface EditCityModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onUpdateAction: (updatedCity: City) => void;
  initialData?: City | null;
}

export const EditCityModal: React.FC<EditCityModalProps> = ({
  isOpen,
  onCloseAction,
  onUpdateAction,
  initialData = null,
}) => {
  const queryClient = useQueryClient();

  const { data: existingCities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: CitiesApi.getAll,
    enabled: isOpen,
  });

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<CityFormData>({
    resolver: zodResolver(CitySchema),
    defaultValues: {
      name: "",
    },
  });

  const cityName = watch("name");

  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialData?.cityName || "",
      });
      clearErrors();
    }
  }, [isOpen, initialData, reset, clearErrors]);

  const validateCityName = useCallback(
    (name: string) => {
      if (!name) return;

      const normalizedName = name.trim().toLowerCase();
      if (!normalizedName) return;

      if (existingCities.length > 0) {
        const cityExists = existingCities.some(
          (city) =>
            city.cityName.toLowerCase() === normalizedName &&
            (!initialData || city.id !== initialData.id),
        );

        if (cityExists) {
          setError("name", {
            message: "Місто з такою назвою вже існує",
          });
        } else {
          clearErrors("name");
        }
      }
    },
    [existingCities, initialData, setError, clearErrors],
  );

  useEffect(() => {
    validateCityName(cityName);
  }, [cityName, validateCityName]);

  const mutation = useMutation<City, Error, CityFormData>({
    mutationFn: async (data: CityFormData) => {
      const normalizedName = data.name.trim().toLowerCase();
      const cityExists = existingCities.some(
        (city) =>
          city.cityName.toLowerCase() === normalizedName &&
          (!initialData || city.id !== initialData.id),
      );

      if (cityExists) {
        throw new Error("Місто з такою назвою вже існує");
      }

      if (initialData?.id && typeof initialData.id === "number") {
        const response = await CitiesApi.update(initialData.id, data.name);
        return {
          id: response.id,
          cityName: response.cityName,
        };
      } else {
        const response = await CitiesApi.create(data.name);
        return {
          id: response.id,
          cityName: response.cityName,
        };
      }
    },
    onSuccess: async (updatedCity) => {
      await queryClient.invalidateQueries({ queryKey: ["cities"] });
      onUpdateAction(updatedCity);
      onCloseAction();
    },
    onError: (error: Error) => {
      setError("name", {
        message: getErrorMessage(error) || "Помилка при збереженні",
      });
    },
  });

  const onSubmit = async (data: CityFormData) => {
    try {
      await toast.promise(mutation.mutateAsync({ name: data.name.trim() }), {
        loading: "Збереження міста...",
        success: initialData
          ? "Місто успішно оновлено!"
          : "Місто успішно додано!",
        error: (err: Error) =>
          getErrorMessage(err) || "Помилка при збереженні міста",
      });
    } catch (err) {
      console.log(getErrorMessage(err) || "Щось пішло не так");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onCloseAction} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? "Редагувати місто" : "Додати місто"}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <MyTextField
              name="name"
              label="Назва міста *"
              control={control}
              sx={{ "& input": { placeholder: "Введіть назву міста" } }}
              disabled={mutation.isPending || isSubmitting}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <MyButton
            customvariant="cancel"
            onClick={onCloseAction}
            disabled={mutation.isPending || isSubmitting}
          >
            Скасувати
          </MyButton>
          <MyButton
            customvariant="confirm"
            type="submit"
            disabled={mutation.isPending || isSubmitting || !!errors.name}
          >
            {mutation.isPending || isSubmitting
              ? "Збереження..."
              : initialData
                ? "Оновити"
                : "Додати"}
          </MyButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
