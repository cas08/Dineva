"use client";

import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Tab,
  Tabs,
  FormControlLabel,
  Switch,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ReservationsApi } from "@/services";
import { toast } from "react-hot-toast";
import { Edit, Cancel, Done, Search, FilterList } from "@mui/icons-material";
import {
  parseDateString,
  formatDateToDDMMYYYY,
  formatTime,
} from "@/utils/date-utils";
import type {
  UserReservation,
  ReservationsResponse,
  ReservationDetails,
} from "@/@types";
import { UpdateContactModal } from "@/components/profile/modal-components/update-contact-info";
import ConfirmActionModal from "@/components/admin/reservations/modals/reservation-conf-action";
import FiltersModal from "@/components/admin/reservations/modals/filters-modal";
import ReservationDetailsModal from "@/components/admin/reservations/modals/reservation-details";
import { getErrorMessage } from "@/utils/error-utils";

export default function ReservationsManagementPage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<string>("active");
  const [showPast, setShowPast] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
  });

  const [selectedFilters, setSelectedFilters] = useState({
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
  });

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<UserReservation | null>(null);
  const [confirmActionOpen, setConfirmActionOpen] = useState(false);
  const [actionType, setActionType] = useState<"cancel" | "complete">("cancel");
  const [updateContactOpen, setUpdateContactOpen] = useState(false);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedReservationDetails, setSelectedReservationDetails] =
    useState<ReservationDetails | null>(null);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 15,
  });

  const {
    data: reservationsData,
    isLoading,
    isFetching,
  } = useQuery<ReservationsResponse, Error>({
    queryKey: [
      "allReservations",
      activeTab,
      showPast,
      activeFilters.dateFrom,
      activeFilters.dateTo,
      pagination.pageIndex,
      pagination.pageSize,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("showPast", showPast.toString());
      params.append("status", activeTab);
      params.append("page", String(pagination.pageIndex + 1));
      params.append("limit", String(pagination.pageSize));

      if (activeFilters.dateFrom) {
        params.append("dateFrom", formatDateToDDMMYYYY(activeFilters.dateFrom));
      }
      if (activeFilters.dateTo) {
        params.append("dateTo", formatDateToDDMMYYYY(activeFilters.dateTo));
      }

      return ReservationsApi.getAllReservations(params);
    },
  });

  const reservations = reservationsData?.reservations || [];
  const totalCount = reservationsData?.pagination?.total || 0;

  const handleShowDetails = async (id: number) => {
    try {
      const toastId = toast.loading("Завантаження деталей...");
      const details = await ReservationsApi.getReservationDetails(id);
      setSelectedReservationDetails(details);
      setDetailsModalOpen(true);
      toast.dismiss(toastId);
    } catch (error) {
      toast.error(`Не вдалося завантажити деталі: ${getErrorMessage(error)}`);
    }
  };

  const cancelMutation = useMutation({
    mutationFn: (reservationId: number) =>
      ReservationsApi.cancelReservation(reservationId),
    onSuccess: async () => {
      toast.success("Бронювання успішно скасовано");
      await queryClient.invalidateQueries({ queryKey: ["allReservations"] });
      setConfirmActionOpen(false);
      setSelectedReservation(null);
    },
    onError: (error) => {
      toast.error(
        `Помилка при скасуванні бронювання: ${getErrorMessage(error)}`,
      );
    },
  });

  const completeMutation = useMutation({
    mutationFn: (reservationId: number) =>
      ReservationsApi.completeReservation(reservationId),
    onSuccess: async () => {
      toast.success("Бронювання позначено як завершене");
      await queryClient.invalidateQueries({ queryKey: ["allReservations"] });
      setConfirmActionOpen(false);
      setSelectedReservation(null);
    },
    onError: (error) => {
      toast.error(
        `Помилка при завершенні бронювання: ${getErrorMessage(error)}`,
      );
    },
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const handleAction = (
    reservation: UserReservation,
    action: "cancel" | "complete",
  ) => {
    setSelectedReservation(reservation);
    setActionType(action);
    setConfirmActionOpen(true);
  };

  const handleEditContact = (reservation: UserReservation) => {
    setSelectedReservation(reservation);
    setUpdateContactOpen(true);
  };

  const confirmAction = async () => {
    if (selectedReservation) {
      if (actionType === "cancel") {
        await cancelMutation.mutateAsync(selectedReservation.id);
      } else {
        await completeMutation.mutateAsync(selectedReservation.id);
      }
    }
  };

  const openFiltersModal = () => {
    setSelectedFilters({ ...activeFilters });
    setFiltersOpen(true);
  };

  const applyFilters = () => {
    setActiveFilters({ ...selectedFilters });
    setFiltersOpen(false);
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const resetFilters = () => {
    setSelectedFilters({
      dateFrom: null,
      dateTo: null,
    });
  };

  const STATUS_TRANSLATIONS: Record<string, string> = {
    active: "Активне",
    cancelled: "Скасоване",
    completed: "Завершене",
  };

  const STATUS_COLORS: Record<
    string,
    "success" | "error" | "warning" | "default"
  > = {
    active: "success",
    cancelled: "error",
    completed: "default",
  };

  const columns: MRT_ColumnDef<UserReservation>[] = [
    {
      accessorKey: "id",
      header: "ID",
      size: 60,
    },
    {
      accessorKey: "customerName",
      header: "Ім'я",
      Cell: ({ cell }) => cell.getValue<string>() || "—",
      size: 120,
    },
    {
      accessorKey: "customerSurname",
      header: "Прізвище",
      Cell: ({ cell }) => cell.getValue<string>() || "—",
      size: 120,
    },
    {
      accessorKey: "date",
      header: "Дата",
      Cell: ({ cell }) => {
        const dateValue = cell.getValue<string>();
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateValue)) {
          return dateValue;
        }
        try {
          const date = parseDateString(dateValue);
          return date.toLocaleDateString("uk-UA", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        } catch (error) {
          console.error(error);
          return dateValue || "—";
        }
      },
      size: 120,
      sortingFn: "datetime",
    },
    {
      accessorKey: "startTime",
      header: "Початок",
      Cell: ({ cell }) => formatTime(cell.getValue<string>()),
      size: 85,
    },
    {
      accessorKey: "endTime",
      header: "Кінець",
      Cell: ({ cell }) => formatTime(cell.getValue<string>()),
      size: 85,
    },

    {
      accessorKey: "tableNumber",
      header: "№ столу",
      size: 85,
    },
    {
      accessorKey: "peopleCount",
      header: "К-сть людей",
      size: 85,
    },
    {
      accessorKey: "restaurantAddress",
      header: "Ресторан",
      Cell: ({ cell }) => (
        <div style={{ whiteSpace: "normal", lineHeight: "1.3" }}>
          {cell.getValue<string>()}
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: "status",
      header: "Статус",
      Cell: ({ cell }) => {
        const status = cell.getValue<string>();
        return (
          <Chip
            label={STATUS_TRANSLATIONS[status] || status}
            color={STATUS_COLORS[status] || "default"}
            variant="outlined"
            size="small"
          />
        );
      },
      size: 100,
    },
    {
      accessorKey: "customerPhone",
      header: "Телефон",
      Cell: ({ cell }) => cell.getValue<string>() || "—",
      size: 140,
    },
    {
      accessorKey: "email",
      header: "Email",
      Cell: ({ cell }) => cell.getValue<string>() || "—",
      size: 180,
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Управління резерваціями
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 1,
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                maxWidth: "100%",
                flexShrink: 1,
                ".MuiTab-root.Mui-selected": {
                  color: "var(--primary)",
                },
                ".MuiTabs-indicator": {
                  backgroundColor: "var(--primary)",
                },
              }}
            >
              <Tab value="active" label="Активні" />
              <Tab value="completed" label="Завершені" />
              <Tab value="cancelled" label="Скасовані" />
              <Tab value="all" label="Усі" />
            </Tabs>

            <Tooltip title="Додаткові фільтри">
              <IconButton
                onClick={openFiltersModal}
                sx={{ color: "var(--accent)" }}
              >
                <FilterList />
              </IconButton>
            </Tooltip>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={showPast}
                onChange={(e) => {
                  setShowPast(e.target.checked);
                  setPagination({ ...pagination, pageIndex: 0 });
                }}
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
            label="Показати минулі бронювання"
            sx={{
              margin: 0,
              width: { xs: "100%", sm: "auto" },
            }}
          />
        </Box>
        <MaterialReactTable
          muiCircularProgressProps={{
            sx: {
              color: "var(--primary)",
            },
          }}
          columns={columns}
          data={reservations}
          enableRowActions
          positionActionsColumn="last"
          manualPagination
          rowCount={totalCount}
          onPaginationChange={setPagination}
          state={{
            pagination,
            isLoading: isLoading || isFetching,
          }}
          renderRowActions={({ row }) => (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Деталі бронювання">
                <IconButton onClick={() => handleShowDetails(row.original.id)}>
                  <Search />
                </IconButton>
              </Tooltip>

              {row.original.status === "active" && (
                <>
                  <Tooltip title="Редагувати контактну інформацію">
                    <IconButton
                      onClick={() => handleEditContact(row.original)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Завершити бронювання">
                    <IconButton
                      onClick={() => handleAction(row.original, "complete")}
                      color="success"
                    >
                      <Done />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Скасувати бронювання">
                    <IconButton
                      onClick={() => handleAction(row.original, "cancel")}
                      color="error"
                    >
                      <Cancel />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          )}
          initialState={{
            density: "compact",
            sorting: [
              { id: "date", desc: false },
              { id: "startTime", desc: false },
            ],
          }}
          localization={{
            actions: "Дії",
            noRecordsToDisplay: "Немає бронювань для відображення",
            rowsPerPage: "Рядків на сторінці",
            of: "з",
          }}
          muiTableContainerProps={{
            sx: {
              minHeight: "500px",
              maxHeight: "700px",
              overflowX: "auto",
            },
          }}
          muiToolbarAlertBannerProps={{
            color: "info",
            children: `Показано ${reservations.length} з ${totalCount} бронювань`,
          }}
        />
      </Box>

      <FiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={selectedFilters}
        setFilters={setSelectedFilters}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      <ConfirmActionModal
        open={confirmActionOpen}
        onClose={() => setConfirmActionOpen(false)}
        onConfirm={confirmAction}
        actionType={actionType}
        reservation={selectedReservation}
        isLoading={
          actionType === "cancel"
            ? cancelMutation.isPending
            : completeMutation.isPending
        }
      />

      {selectedReservation && (
        <UpdateContactModal
          open={updateContactOpen}
          onCloseAction={() => {
            setUpdateContactOpen(false);
            setSelectedReservation(null);
          }}
          reservation={{
            id: selectedReservation.id,
            customerName: selectedReservation.customerName || "",
            customerSurname: selectedReservation.customerSurname || "",
            customerPhone: selectedReservation.customerPhone || "",
            date: selectedReservation.date,
            startTime: selectedReservation.startTime || "",
            endTime: selectedReservation.endTime || "",
          }}
        />
      )}

      <ReservationDetailsModal
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedReservationDetails(null);
        }}
        reservation={selectedReservationDetails}
      />
    </Container>
  );
}
