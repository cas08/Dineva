"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { EditProfileForm } from "@/components/profile/modal-components/edit-user-form";
import { ChangePasswordForm } from "@/components/profile/modal-components/change-password-form";
import { DeleteAccountDialog } from "@/components/profile/modal-components/delete-acc-dialog";
import { MyButton } from "@/components/ui";

export function UserProfileInfo() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!session || !session.user) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress style={{ color: "var(--primary)" }} />
      </Box>
    );
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setIsChangingPassword(false);
  };

  const handlePasswordToggle = () => {
    setIsChangingPassword(!isChangingPassword);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  return (
    <Box>
      <Card elevation={3}>
        <CardContent>
          {!isEditing && !isChangingPassword && (
            <>
              <Typography variant="h5" gutterBottom>
                Особисті дані
              </Typography>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Імʼя
                  </Typography>
                  <Typography variant="body1">
                    {session.user.name || "Не вказано"}
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Прізвище
                  </Typography>
                  <Typography variant="body1">
                    {session.user.surname || "Не вказано"}
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{session.user.email}</Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Телефон
                  </Typography>
                  <Typography variant="body1">
                    {session.user.phoneNumber || "Не вказано"}
                  </Typography>
                </Grid>
              </Grid>

              <Box mt={4}>
                <Grid container spacing={2}>
                  <Grid>
                    <MyButton
                      customvariant="edit"
                      size="small"
                      onClick={handleEditToggle}
                    >
                      Редагувати інформацію
                    </MyButton>
                  </Grid>
                  <Grid>
                    {session.user.hasPassword && (
                      <MyButton
                        customvariant="default"
                        size="small"
                        onClick={handlePasswordToggle}
                      >
                        Змінити пароль
                      </MyButton>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </>
          )}

          {isEditing && <EditProfileForm onCancelAction={handleEditToggle} />}
          {isChangingPassword && (
            <ChangePasswordForm onCancelAction={handlePasswordToggle} />
          )}
        </CardContent>
      </Card>

      <Box mt={4} display="flex" justifyContent="center">
        <MyButton customvariant="delete" onClick={handleDeleteClick}>
          Видалити акаунт
        </MyButton>
      </Box>

      <DeleteAccountDialog
        open={isDeleteDialogOpen}
        onCloseAction={() => setIsDeleteDialogOpen(false)}
      />
    </Box>
  );
}
