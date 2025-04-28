import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { Edit, Delete, Done, Update, TableBar } from "@mui/icons-material";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { TablesApi, ReservationsApi } from "@/services";
import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { MyButton } from "@/components/ui";
import { EditTableModal } from "./edit-table-modal";
import { DeleteTableConfirmModal } from "@/components/restaurant/table-components/delete-table-modal";
import { BookingsPanel } from "@/components/restaurant/table-components/booking-panel";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { toast } from "react-hot-toast";
import type { Table } from "@/@types";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { FreeTablesModal } from "@/components/restaurant/table-components/free-tables-modal";

const STATUS_TRANSLATIONS: Record<"free" | "reserved" | "occupied", string> = {
  free: "Вільний",
  reserved: "Заброньований",
  occupied: "Зайнятий",
};

interface TablesTableProps {
  restaurantId: number;
  editMode?: boolean;
}

export const TablesTable: React.FC<TablesTableProps> = ({
  restaurantId,
  editMode,
}) => {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(false);

  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState<Table | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmCompleteAllOpen, setConfirmCompleteAllOpen] = useState(false);
  const [isCompletingAll, setIsCompletingAll] = useState(false);
  const [freeTables, setFreeTables] = useState<Table[]>([]);
  const [freeTablesModalOpen, setFreeTablesModalOpen] = useState(false);
  const [isCheckingFreeTables, setIsCheckingFreeTables] = useState(false);

  const today = useMemo(() => {
    const now = new Date();
    return format(now, "dd.MM.yyyy");
  }, []);

  const formattedDate = useMemo(() => {
    return format(new Date(), "dd MMMM yyyy", { locale: uk });
  }, []);

  const updateTableStatusMutation = useMutation({
    mutationFn: () => TablesApi.updateTablesStatus(restaurantId),
    onSuccess: (data) => {
      if (data.updatedTables && data.updatedTables.length > 0) {
        toast.success(
          `Статус столиків оновлено (${data.updatedTables.length})`,
        );
      }
    },
    onError: (error) => {
      toast.error(`Помилка оновлення статусу столиків: ${error.message}`);
    },
  });

  const completeExpiredReservationsMutation = useMutation({
    mutationFn: () => ReservationsApi.completeExpiredReservations(restaurantId),
    onSuccess: (data) => {
      if (data.completedCount > 0) {
        toast.success(
          `Успішно завершено ${data.completedCount} минулих резервацій`,
        );
      } else {
        toast.success("Немає резервацій для завершення");
      }
      setConfirmCompleteAllOpen(false);
      setIsCompletingAll(false);
    },
    onError: (error) => {
      toast.error(`Помилка при завершенні резервацій: ${error.message}`);
      setIsCompletingAll(false);
    },
  });

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ["tables", restaurantId],
    queryFn: () => TablesApi.getByRestaurant(restaurantId),
    enabled: !!restaurantId,
  });

  const { data: allReservationsCount = 0, isLoading: reservationsLoading } =
    useQuery({
      queryKey: ["allReservationsCount", restaurantId, today],
      queryFn: async () => {
        const reservations = await ReservationsApi.getByRestaurantAndDate(
          restaurantId,
          today,
        );
        return reservations.length;
      },
      enabled: !!restaurantId,
    });

  const refreshData = useCallback(async () => {
    if (!restaurantId || isUpdating) return;

    setIsUpdating(true);
    try {
      await updateTableStatusMutation.mutateAsync();

      await queryClient.invalidateQueries({
        queryKey: ["tables", restaurantId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["allReservationsCount", restaurantId, today],
      });
      await queryClient.invalidateQueries({
        queryKey: ["tableReservations"],
      });
    } catch (error) {
      console.error("Помилка при оновленні даних:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [restaurantId, today, isUpdating, queryClient, updateTableStatusMutation]);

  const handleCompleteExpiredReservations = useCallback(() => {
    setConfirmCompleteAllOpen(true);
  }, []);

  const confirmCompleteExpiredReservations = async () => {
    setIsCompletingAll(true);
    try {
      await completeExpiredReservationsMutation.mutateAsync();

      await queryClient.invalidateQueries({
        queryKey: ["tables", restaurantId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["allReservationsCount", restaurantId, today],
      });
      await queryClient.invalidateQueries({
        queryKey: ["tableReservations"],
      });
    } catch (error) {
      console.error("Помилка при завершенні минулих резервацій:", error);
    }
  };

  const handleRefresh = useCallback(() => {
    void refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (!initialLoadRef.current && restaurantId) {
      initialLoadRef.current = true;
      void refreshData();

      intervalRef.current = setInterval(
        () => {
          void refreshData();
        },
        1 * 60 * 1000,
      ); // 1 хвилина для тесту
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [restaurantId, refreshData]);

  const handleDeleteClick = (row: Table) => {
    setSelectedTable(row);
    setDeleteModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditData(null);
    setOpenModal(true);
  };

  const handleOpenEditModal = (row: Table) => {
    setEditData(row);
    setOpenModal(true);
  };

  const handleUpdate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
    await queryClient.invalidateQueries({
      queryKey: ["allReservationsCount", restaurantId],
    });
  };

  const handleCheckFreeTables = async () => {
    setIsCheckingFreeTables(true);
    try {
      await updateTableStatusMutation.mutateAsync();

      await queryClient.invalidateQueries({
        queryKey: ["tables", restaurantId],
      });

      const updatedTables = await TablesApi.getByRestaurant(restaurantId);
      const availableTables = updatedTables.filter(
        (table) => table.status === "free",
      );

      setFreeTables(availableTables);
      setFreeTablesModalOpen(true);

      if (availableTables.length === 0) {
        toast("На даний момент немає доступних столиків");
      }
    } catch (error) {
      console.error("Помилка при перевірці доступних столиків:", error);
      toast.error("Не вдалося отримати інформацію про доступні столики");
    } finally {
      setIsCheckingFreeTables(false);
    }
  };

  const columns: MRT_ColumnDef<Table>[] = [
    {
      accessorKey: "tableNumber",
      header: "Номер столика",
    },
    {
      accessorKey: "capacity",
      header: "Місткість",
    },
    {
      accessorKey: "status",
      header: "Статус",
      Cell: ({ cell }) => {
        const value = cell.getValue<"free" | "reserved" | "occupied">();
        const color =
          value === "free" ? "green" : value === "reserved" ? "orange" : "red";

        return (
          <span style={{ color, fontWeight: 600 }}>
            {STATUS_TRANSLATIONS[value]}
          </span>
        );
      },
    },
  ];

  return (
    <Box sx={{ mt: 4 }}>
      <Box
        sx={{
          p: 2,
          mb: 2,
          bgcolor: "white",
          borderRadius: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Резервації на сьогодні ({formattedDate})
          {!reservationsLoading && (
            <Typography
              component="span"
              sx={{
                ml: 2,
                fontSize: "0.9rem",
                backgroundColor: "var(--primary)",
                color: "var(--background)",
                px: 1.5,
                py: 0.5,
                borderRadius: 10,
              }}
            >
              Всього: {allReservationsCount}
            </Typography>
          )}
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <MyButton
            customvariant="cancel"
            size="small"
            onClick={handleCompleteExpiredReservations}
            disabled={isCompletingAll}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Done fontSize="small" />
            {isCompletingAll ? "Виконується..." : "Завершити минулі резервації"}
          </MyButton>

          <MyButton
            customvariant="default"
            size="small"
            onClick={handleRefresh}
            disabled={isUpdating}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Update sx={{ color: "var(--background" }} fontSize="small" />
            {isUpdating ? "Оновлення..." : "Оновити дані"}
          </MyButton>
        </Box>
      </Box>

      <MaterialReactTable
        muiCircularProgressProps={{
          sx: {
            color: "var(--primary)",
          },
        }}
        columns={columns}
        data={tables}
        state={{ isLoading }}
        enableRowActions
        enableExpandAll
        positionActionsColumn="last"
        renderTopToolbarCustomActions={() => (
          <Box sx={{ display: "flex", gap: 2 }}>
            {editMode && (
              <MyButton customvariant="confirm" onClick={handleOpenAddModal}>
                Додати столик
              </MyButton>
            )}
            <MyButton
              onClick={handleCheckFreeTables}
              disabled={isCheckingFreeTables}
              customvariant="cancel"
            >
              <TableBar sx={{ color: "white" }} fontSize="small" />
              {isCheckingFreeTables ? "Перевірка..." : "Доступні столики"}
            </MyButton>
          </Box>
        )}
        renderRowActions={({ row }) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Редагувати">
              <IconButton onClick={() => handleOpenEditModal(row.original)}>
                <Edit />
              </IconButton>
            </Tooltip>
            {editMode ? (
              <Tooltip title="Видалити">
                <IconButton
                  color="error"
                  onClick={() => handleDeleteClick(row.original)}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            ) : null}
          </Box>
        )}
        renderDetailPanel={({ row }) => (
          <BookingsPanel
            tableId={row.original.id}
            restaurantId={restaurantId}
            today={today}
          />
        )}
        muiTableContainerProps={{ sx: { maxHeight: 600 } }}
      />

      <FreeTablesModal
        open={freeTablesModalOpen}
        onClose={() => setFreeTablesModalOpen(false)}
        freeTables={freeTables}
      />

      <ConfirmActionDialog
        open={confirmCompleteAllOpen}
        onCloseAction={() => setConfirmCompleteAllOpen(false)}
        onConfirmAction={confirmCompleteExpiredReservations}
        title="Завершення минулих резервацій"
        message="Ви впевнені, що хочете завершити всі минулі резервації? Це дія позначить всі активні резервації, які мали завершитись до поточного часу, як 'Завершено'."
        confirmButtonText="Так, завершити всі"
        actionType="complete"
        isLoading={isCompletingAll}
      />

      <EditTableModal
        isOpen={openModal}
        onCloseAction={() => setOpenModal(false)}
        onUpdateAction={handleUpdate}
        restaurantId={restaurantId}
        initialData={editData}
      />

      {selectedTable && (
        <DeleteTableConfirmModal
          isOpen={deleteModalOpen}
          onCloseAction={() => {
            setDeleteModalOpen(false);
            setSelectedTable(null);
          }}
          tableId={selectedTable.id}
          tableNumber={selectedTable.tableNumber}
          restaurantId={restaurantId}
        />
      )}
    </Box>
  );
};
