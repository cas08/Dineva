import { SxProps, TextField, Theme } from "@mui/material";
import { JSX } from "react";
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

type MyTextFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  label: string | JSX.Element;
  control: Control<TFieldValues>;
  type?: string;
  placeholder?: string;
  sx?: SxProps<Theme>;
  disabled?: boolean;
};

function MyTextField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
  name,
  label,
  control,
  type = "text",
  placeholder,
  sx,
  disabled,
}: MyTextFieldProps<TFieldValues, TName>) {
  return (
    <Controller<TFieldValues, TName>
      name={name}
      control={control}
      defaultValue={"" as FieldPathValue<TFieldValues, TName>}
      render={({
        field,
        fieldState,
      }: {
        field: ControllerRenderProps<TFieldValues, TName>;
        fieldState: ControllerFieldState;
        formState: UseFormStateReturn<TFieldValues>;
      }) => (
        <TextField
          {...field}
          label={label}
          type={type}
          margin="normal"
          variant="outlined"
          placeholder={placeholder}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          fullWidth
          disabled={disabled}
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

export { MyTextField };
