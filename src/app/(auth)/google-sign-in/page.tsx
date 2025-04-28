import GooglePopupSignInPage from "@/components/auth/google-pop-up";
import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";

export default async function MenuPage() {
  return (
    <Suspense
      fallback={
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress style={{ color: "var(--primary)" }} />
        </Box>
      }
    >
      <GooglePopupSignInPage />
    </Suspense>
  );
}
