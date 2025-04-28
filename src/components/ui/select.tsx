import {
  SxProps,
  FormControl,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
  SelectChangeEvent,
  CircularProgress,
  Theme,
} from "@mui/material";
import { ReactNode } from "react";
import {
  Controller,
  Control,
  ControllerRenderProps,
  FieldValues,
  Path,
  PathValue,
} from "react-hook-form";

type SelectOption<T> = {
  value: T;
  label: string | ReactNode;
};

type MySelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
  TValue = string | number | null,
> = {
  name?: TName;
  label: string | ReactNode;
  value?: TValue;
  onChange?: (event: SelectChangeEvent<TValue>) => void;
  options: SelectOption<TValue extends null ? string | number : TValue>[];
  control?: Control<TFieldValues>;
  sx?: SxProps<Theme>;
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
};

function MySelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
  TValue extends string | number | null = string | number | null,
>({
  name,
  label,
  value,
  onChange,
  options,
  control,
  sx,
  disabled,
  fullWidth = false,
  loading = false,
}: MySelectProps<TFieldValues, TName, TValue>) {
  const renderSelect = ({
    field,
  }: {
    field: ControllerRenderProps<TFieldValues, TName>;
  }) => (
    <FormControl
      fullWidth={fullWidth}
      sx={{
        position: "relative",
        minWidth: 120,
        "& .MuiInputLabel-root": {
          color: "var(--primary)",
          "&.Mui-focused": {
            color: "var(--primary)",
          },
        },
        "&:hover .MuiInputLabel-root": {
          color: "var(--secondary)",
        },
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "var(--neutral)",
          },
          "&:hover fieldset": {
            borderColor: "var(--secondary)",
          },
          "&.Mui-focused fieldset": {
            borderColor: "var(--primary)",
          },
        },
        "& .MuiMenuItem-root": {
          color: "var(--primary)",
          "&:hover": {
            backgroundColor: "var(--secondary)",
          },
          "&.Mui-selected": {
            backgroundColor: "var(--primary)",
            color: "var(--background)",
          },
        },
        ...sx,
      }}
    >
      <InputLabel>{label}</InputLabel>
      <MuiSelect
        {...field}
        value={field ? field.value : (value ?? "")}
        onChange={field ? field.onChange : onChange}
        label={label}
        disabled={disabled}
      >
        {options.map((option) => (
          <MenuItem key={String(option.value)} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>

      {loading && (
        <CircularProgress
          size={20}
          sx={{
            position: "absolute",
            right: "50%",
            top: "50%",
            marginTop: "-10px",
            color: "var(--neutral)",
          }}
        />
      )}
    </FormControl>
  );

  if (control && name) {
    return (
      <Controller<TFieldValues, TName>
        name={name}
        control={control}
        defaultValue={"" as unknown as PathValue<TFieldValues, TName>}
        render={({ field }) => renderSelect({ field })}
      />
    );
  }

  return renderSelect({
    field: {
      name: (name || "") as TName,
      value: (value ?? "") as PathValue<TFieldValues, TName>,
      onChange: (onChange ?? (() => {})) as (
        event: SelectChangeEvent<unknown>,
      ) => void,
      onBlur: () => {},
      ref: () => {},
    },
  });
}

export { MySelect };
