"use client";

import { IconButton, Divider, Typography, Container, Box } from "@mui/material";
import { FaFacebook, FaInstagram, FaPhone } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "var(--accent)",
        color: "white",
        py: 3,
        mt: 5,
      }}
    >
      <Container className="container">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Години роботи */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Години роботи
            </Typography>
            <Typography variant="body1">Пн-Нд: 10:00 - 23:00</Typography>
          </Box>

          {/* Контакти */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Контакти
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <IconButton color="inherit" href="tel:+380123456789">
                <FaPhone />
              </IconButton>
              <IconButton color="inherit" href="mailto:info@restaurant.com">
                <MdEmail />
              </IconButton>
            </Box>
          </Box>

          {/* Соціальні мережі */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Ми в соцмережах
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <IconButton
                color="inherit"
                href="https://www.facebook.com"
                target="_blank"
              >
                <FaFacebook />
              </IconButton>
              <IconButton
                color="inherit"
                href="https://www.instagram.com/casz1k/"
                target="_blank"
              >
                <FaInstagram />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2, backgroundColor: "white" }} />

        <Typography variant="body2" sx={{ textAlign: "center" }}>
          &copy; {new Date().getFullYear()} Всі права захищені
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
