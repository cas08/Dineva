import React from "react";
import { Dialog, DialogTitle, DialogContent, Box, Grid } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { uk } from "date-fns/locale";
import { MyButton } from "@/components/ui";

interface FiltersModalProps {
  open: boolean;
  onClose: () => void;
  filters: {
    dateFrom: Date | null;
    dateTo: Date | null;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      dateFrom: Date | null;
      dateTo: Date | null;
    }>
  >;
  onApply: () => void;
  onReset: () => void;
}

const FiltersModal: React.FC<FiltersModalProps> = ({
  open,
  onClose,
  filters,
  setFilters,
  onApply,
  onReset,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Фільтри резервацій</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={uk}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={6}>
              {" "}
              <DatePicker
                label="Дата від"
                value={filters.dateFrom}
                onChange={(newValue) =>
                  setFilters({ ...filters, dateFrom: newValue })
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                  },
                }}
              />
            </Grid>
            <Grid size={6}>
              {" "}
              <DatePicker
                label="Дата до"
                value={filters.dateTo}
                onChange={(newValue) =>
                  setFilters({ ...filters, dateTo: newValue })
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                  },
                }}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}
        >
          <MyButton customvariant="cancel" onClick={onReset}>
            Скинути фільтри
          </MyButton>
          <MyButton customvariant="default" onClick={onApply}>
            Застосувати
          </MyButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FiltersModal;
