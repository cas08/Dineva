import { SignInForm } from "@/components/auth";
import { SITE_NAME } from "@/config";
import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
export const metadata = {
  title: `${SITE_NAME} | Авторизація`,
};

export default async function Page() {
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
      <SignInForm />
    </Suspense>
  );
}
