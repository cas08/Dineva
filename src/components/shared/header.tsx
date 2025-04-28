"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import {
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Container,
  Tooltip,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { IoMenu } from "react-icons/io5";
import { MyButton, MyLink } from "../ui";
import { signOut, useSession } from "next-auth/react";
import { TbUserCircle } from "react-icons/tb";
import toast from "react-hot-toast";
import { SITE_NAME } from "@/config";
import { useState } from "react";
import Link from "next/link";

const pages = ["Бронювання", "Меню", "Відгуки"];
const adminPages = ["Ресторан", "Усі бронювання", "Користувачі"];

const pageRoutes: Record<string, string> = {
  Бронювання: "/reservations",
  "Усі бронювання": "/admin/reservations",
  Меню: "/menu",
  Відгуки: "/reviews",
  Ресторан: "/admin/restaurant",
  Користувачі: "/admin/users",
};

function Header() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const isAdminOrManager =
    session?.user?.role === "Admin" || session?.user?.role === "Manager";

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSignOut = async () => {
    try {
      await toast.promise(
        signOut({ redirect: false }),
        {
          loading: "Виходимо...",
          success: "Ви успішно вийшли!",
          error: "Помилка при виході",
        },
        {
          style: { pointerEvents: "none" },
        },
      );
      window.location.reload();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{ zIndex: "40", backgroundColor: "var(--accent)" }}
      >
        <Container className="container">
          <Toolbar disableGutters>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {/* Мобілка */}
              <Box sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}>
                <IconButton
                  size="large"
                  aria-label="menu"
                  aria-haspopup="true"
                  onClick={handleDrawerToggle}
                  color="inherit"
                >
                  <IoMenu />
                </IconButton>
              </Box>

              <Typography
                variant="h6"
                noWrap
                component="a"
                href="/"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  letterSpacing: ".3rem",
                  color: "inherit",
                  textDecoration: "none",
                  mr: 3,
                }}
              >
                {SITE_NAME}
              </Typography>

              {/* Лінки */}
              <Box sx={{ display: { xs: "none", md: "flex" } }}>
                {pages.map((page) => (
                  <MyLink
                    key={page}
                    component="a"
                    href={pageRoutes[page]}
                    sx={{ color: "white", display: "block", mx: 1 }}
                  >
                    {page}
                  </MyLink>
                ))}
                {isAdminOrManager &&
                  adminPages.map((page) => (
                    <MyLink
                      key={page}
                      component="a"
                      href={pageRoutes[page]}
                      sx={{ color: "white", display: "block", mx: 1 }}
                    >
                      {page}
                    </MyLink>
                  ))}
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* User/Auth */}
            <Box sx={{ flexGrow: 0 }}>
              {status === "loading" ? (
                <CircularProgress
                  size={24}
                  sx={{ color: "var(--background)" }}
                />
              ) : status === "authenticated" ? (
                <>
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <TbUserCircle size={40} color="white" />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: "45px" }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <MenuItem
                      component={Link}
                      href="/profile"
                      onClick={handleCloseUserMenu}
                    >
                      <Typography sx={{ textAlign: "center" }}>
                        Профіль
                      </Typography>
                    </MenuItem>

                    <MenuItem
                      key={"sign-out"}
                      onClick={async () => {
                        handleCloseUserMenu();
                        await handleSignOut();
                      }}
                    >
                      <Typography sx={{ textAlign: "center" }}>
                        {"Вийти"}
                      </Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <MyButton
                  href="/sign-in"
                  variant="contained"
                  customsize="small"
                >
                  Увійти
                </MyButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* для мобілки */}
      <Drawer anchor="left" open={mobileOpen} onClose={handleDrawerToggle}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={handleDrawerToggle}
        >
          <List>
            {pages.map((page) => (
              <ListItem key={page} disablePadding>
                <ListItemButton component="a" href={pageRoutes[page]}>
                  <ListItemText primary={page} />
                </ListItemButton>
              </ListItem>
            ))}
            {isAdminOrManager &&
              adminPages.map((page) => (
                <ListItem key={page} disablePadding>
                  <ListItemButton component="a" href={pageRoutes[page]}>
                    <ListItemText primary={page} />
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default Header;
