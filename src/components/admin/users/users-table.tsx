"use client";

import React, { useState } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { Box, IconButton, Tooltip, Chip } from "@mui/material";
import { Delete, AdminPanelSettings, Info } from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DeleteUserModal } from "./modals/delete-user";
import { PromoteUserModal } from "./modals/promote-user";
import { UserReservationsModal } from "./modals/user-reservations";
import { toast } from "react-hot-toast";
import { UsersApi } from "@/services";
import type { User } from "@/@types";

interface UsersTableProps {
  userRole: string;
}

const ROLE_TRANSLATIONS: Record<string, string> = {
  User: "Користувач",
  Manager: "Менеджер",
  Admin: "Адміністратор",
};

const ROLE_COLORS: Record<
  string,
  "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
> = {
  User: "default",
  Manager: "primary",
  Admin: "error",
};

export const UsersTable: React.FC<UsersTableProps> = ({ userRole }) => {
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [reservationsModalOpen, setReservationsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const isAdmin = userRole === "Admin";

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      return isAdmin ? UsersApi.getAllUsers() : UsersApi.getUsersByRole("User");
    },
  });

  const handleDeleteClick = (user: User) => {
    if (isAdmin && user.userRole === "Admin") {
      toast.error("Адміністратор не може видалити іншого адміністратора");
      return;
    }

    if (!isAdmin && user.userRole !== "User") {
      toast.error("У вас немає прав для видалення цього користувача");
      return;
    }

    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handlePromoteClick = (user: User) => {
    if (!isAdmin) {
      toast.error("У вас немає прав для підвищення ролі користувача");
      return;
    }

    if (user.userRole !== "User") {
      toast.error("Цей користувач вже має роль менеджера або адміністратора");
      return;
    }

    setSelectedUser(user);
    setPromoteModalOpen(true);
  };

  const handleViewReservations = (user: User) => {
    setSelectedUser(user);
    setReservationsModalOpen(true);
  };

  const handleUpdate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const columns: MRT_ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Ім'я",
    },
    {
      accessorKey: "surname",
      header: "Прізвище",
      Cell: ({ cell }) => {
        return cell.getValue<string | null>() || "—";
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phoneNumber",
      header: "Телефон",
      Cell: ({ cell }) => {
        return cell.getValue<string | null>() || "—";
      },
    },
    {
      accessorKey: "userRole",
      header: "Роль",
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        const role = value || "User";

        return (
          <Chip
            label={ROLE_TRANSLATIONS[role]}
            color={ROLE_COLORS[role]}
            variant="outlined"
          />
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Дата реєстрації",
      Cell: ({ cell }) => {
        const value = cell.getValue<string | Date>();
        if (!value) return "—";

        const date = typeof value === "string" ? new Date(value) : value;
        return date.toLocaleDateString("uk-UA", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
  ];

  return (
    <>
      <MaterialReactTable
        muiCircularProgressProps={{
          sx: {
            color: "var(--primary)",
          },
        }}
        columns={columns}
        data={users}
        state={{ isLoading }}
        enableRowActions
        positionActionsColumn="last"
        renderRowActions={({ row }) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Переглянути бронювання">
              <IconButton
                onClick={() => handleViewReservations(row.original)}
                color="info"
              >
                <Info />
              </IconButton>
            </Tooltip>

            {isAdmin && row.original.userRole === "User" && (
              <Tooltip title="Зробити менеджером">
                <IconButton onClick={() => handlePromoteClick(row.original)}>
                  <AdminPanelSettings />
                </IconButton>
              </Tooltip>
            )}

            {(isAdmin && row.original.userRole !== "Admin") ||
            (!isAdmin && row.original.userRole === "User") ? (
              <Tooltip title="Видалити користувача">
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
        muiTableContainerProps={{
          sx: { maxHeight: 700 },
        }}
        localization={{
          actions: "Дії",
          noRecordsToDisplay: "Користувачів не знайдено",
        }}
        initialState={{
          density: "compact",
          pagination: { pageSize: 25, pageIndex: 0 },
        }}
      />

      {selectedUser && (
        <>
          <DeleteUserModal
            isOpen={deleteModalOpen}
            onCloseAction={() => {
              setDeleteModalOpen(false);
              setSelectedUser(null);
            }}
            onUpdateAction={handleUpdate}
            userId={selectedUser.id}
            userName={`${selectedUser.name}${selectedUser.surname ? " " + selectedUser.surname : ""}`}
            userRole={selectedUser.userRole}
          />

          <PromoteUserModal
            isOpen={promoteModalOpen}
            onCloseAction={() => {
              setPromoteModalOpen(false);
              setSelectedUser(null);
            }}
            onUpdateAction={handleUpdate}
            userId={selectedUser.id}
            userName={`${selectedUser.name}${selectedUser.surname ? " " + selectedUser.surname : ""}`}
          />

          <UserReservationsModal
            isOpen={reservationsModalOpen}
            onCloseAction={() => {
              setReservationsModalOpen(false);
              setSelectedUser(null);
            }}
            userId={selectedUser.id}
            userEmail={selectedUser.email}
          />
        </>
      )}
    </>
  );
};
