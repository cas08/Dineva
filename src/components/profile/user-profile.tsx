"use client";

import { Container, Typography } from "@mui/material";
import { UserProfileTabs } from "@/components/profile/user-profile-tabs";

export default function ProfilePageClient() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Особистий кабінет
      </Typography>

      <UserProfileTabs />
    </Container>
  );
}
