import React from "react";
import { Modal, Paper, Box, Typography } from "@mui/material";
import { MyButton } from "@/components/ui";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import type { Table } from "@/@types";

interface FreeTablesModalProps {
  open: boolean;
  onClose: () => void;
  freeTables: Table[];
}

export const FreeTablesModal: React.FC<FreeTablesModalProps> = ({
  open,
  onClose,
  freeTables,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="free-tables-modal-title"
    >
      <Paper
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: 500,
          width: "100%",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          outline: "none",
        }}
      >
        <Typography
          id="free-tables-modal-title"
          variant="h6"
          component="h2"
          sx={{ mb: 2, fontWeight: "bold", color: "var(--primary)" }}
        >
          Доступні столики на даний момент
        </Typography>

        {freeTables.length > 0 ? (
          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                Знайдено {freeTables.length} доступних столиків:
              </Typography>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 2,
              }}
            >
              {freeTables.map((table) => (
                <Paper
                  key={table.id}
                  sx={{
                    p: 2,
                    textAlign: "center",
                    backgroundColor: "var(--background-secondary)",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ color: "var(--primary)", fontWeight: "bold" }}
                  >
                    №{table.tableNumber}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {table.capacity}{" "}
                    {table.capacity === 1
                      ? "місце"
                      : table.capacity < 5
                        ? "місця"
                        : "місць"}
                  </Typography>
                </Paper>
              ))}
            </Box>
            <Typography variant="body2" sx={{ mt: 3, color: "text.secondary" }}>
              Останнє оновлення:{" "}
              {format(new Date(), "HH:mm:ss", { locale: uk })}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              На даний момент немає доступних столиків
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <MyButton onClick={onClose} customvariant="cancel">
            Закрити
          </MyButton>
        </Box>
      </Paper>
    </Modal>
  );
};
