"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Container, Typography, Box, CircularProgress } from "@mui/material";

import { useRouter } from "next/navigation";
import { UsersTable } from "@/components/admin/users/users-table";

export default function UsersManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      const userRole = session?.user?.role;
      if (userRole !== "Admin" && userRole !== "Manager") {
        router.push("/");
      }
      setIsLoading(false);
    } else if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, session, router]);

  if (isLoading || status !== "authenticated") {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress style={{ color: "var(--neutral)" }} size="3rem" />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Управління користувачами
      </Typography>
      <Box mt={4}>
        <UsersTable userRole={session?.user?.role || "User"} />
      </Box>
    </Container>
  );
}
