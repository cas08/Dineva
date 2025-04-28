"use client";

import { SxProps, Theme } from "@mui/material";
import {
  Controller,
  Control,
  FieldValues,
  Path,
  FieldPathValue,
  FieldPath,
  ControllerRenderProps,
  ControllerFieldState,
  UseFormStateReturn,
} from "react-hook-form";
import { MuiTelInput } from "mui-tel-input";

type PhoneInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  control: Control<TFieldValues>;
  label?: string;
  sx?: SxProps<Theme>;
  disabled?: boolean;
};

function PhoneInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
  name,
  control,
  sx,
  label,
  disabled,
}: PhoneInputProps<TFieldValues, TName>) {
  const handleChange = (newValue: string) => {
    if (!newValue.startsWith("+380")) {
      return { value: "+380" };
    }
    if (newValue.length > 13) {
      return { value: newValue.slice(0, 13) };
    }

    return { value: newValue };
  };

  return (
    <Controller<TFieldValues, TName>
      name={name}
      control={control}
      defaultValue={"+380" as FieldPathValue<TFieldValues, TName>}
      render={({
        field,
        fieldState,
      }: {
        field: ControllerRenderProps<TFieldValues, TName>;
        fieldState: ControllerFieldState;
        formState: UseFormStateReturn<TFieldValues>;
      }) => (
        <MuiTelInput
          {...field}
          onChange={(value: string) =>
            field.onChange(handleChange(value).value)
          }
          defaultCountry="UA"
          onlyCountries={["UA"]}
          label={label || "Номер телефону"}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          disableFormatting
          disabled={disabled}
          fullWidth
          sx={{
            "& .MuiInputLabel-root.Mui-focused": {
              color: "var(--accent)",
            },
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": { borderColor: "var(--secondary)" },
              "&.Mui-focused fieldset": { borderColor: "var(--accent)" },
            },
            ...sx,
          }}
        />
      )}
    />
  );
}

export { PhoneInput };
