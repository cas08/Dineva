"use client";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import React, { CSSProperties, useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  useTheme,
  useMediaQuery,
  Skeleton,
} from "@mui/material";
import {
  BookOnline,
  RateReview,
  MenuBook,
  ArrowForward,
} from "@mui/icons-material";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import { promotions, popularItems } from "@/utils/home-consts";
import { MyButton } from "@/components/ui";

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ bgcolor: "--var(neutral)", pt: 2, pb: 6 }}>
        <Container>
          {loading ? (
            <Skeleton variant="rectangular" width="100%" height={400} />
          ) : (
            <Swiper
              spaceBetween={30}
              centeredSlides={true}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
              }}
              navigation={!isMobile}
              modules={[Autoplay, Pagination, Navigation]}
              className="mySwiper"
              style={
                {
                  "--swiper-pagination-color": "var(--primary)",
                  "--swiper-navigation-color": "var(--primary)",
                  borderRadius: "16px",
                  overflow: "hidden",
                } as CSSProperties & Record<string, string>
              }
            >
              {promotions.map((promo) => (
                <SwiperSlide key={promo.id}>
                  <Box
                    sx={{
                      height: { xs: "300px", md: "500px" },
                      position: "relative",
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        bgcolor: "rgba(0,0,0,0.4)",
                        zIndex: 1,
                      }}
                    />
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <Image
                        src={promo.image}
                        alt={promo.title}
                        fill
                        style={{ objectFit: "cover" }}
                        priority
                      />
                    </Box>
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: { xs: 20, md: 50 },
                        left: { xs: 20, md: 50 },
                        maxWidth: { xs: "80%", md: "60%" },
                        zIndex: 2,
                        color: "var(--background)",
                      }}
                    >
                      <Typography
                        variant="h3"
                        component="h2"
                        gutterBottom
                        sx={{ fontWeight: "bold" }}
                      >
                        {promo.title}
                      </Typography>
                      <Typography variant="h6" paragraph>
                        {promo.description}
                      </Typography>
                      <MyButton
                        component={Link}
                        href={promo.link}
                        size="large"
                        endIcon={<ArrowForward />}
                      >
                        Дізнатися більше
                      </MyButton>
                    </Box>
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </Container>
      </Box>

      <Box sx={{ width: "100%" }}>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography
            component="h1"
            variant="h2"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", mb: 6 }}
          >
            Ласкаво просимо до нашого ресторану
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            <Grid size={12}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  borderRadius: 4,
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 8,
                  },
                }}
              >
                <BookOnline
                  sx={{ fontSize: 60, color: "var(--primary)", mb: 2 }}
                />
                <Typography variant="h4" component="h2" gutterBottom>
                  Забронювати столик
                </Typography>
                <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                  Забронюйте столик онлайн на зручний для вас час. Ми гарантуємо
                  затишну атмосферу та неперевершений сервіс.
                </Typography>
                <MyButton
                  component={Link}
                  href="/reservations"
                  size="large"
                  endIcon={<ArrowForward />}
                >
                  Забронювати зараз
                </MyButton>
              </Paper>
            </Grid>

            <Grid size={12}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  borderRadius: 4,
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 8,
                  },
                }}
              >
                <MenuBook
                  sx={{ fontSize: 60, color: "var(--primary)", mb: 2 }}
                />
                <Typography variant="h4" component="h2" gutterBottom>
                  Наше меню
                </Typography>
                <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                  Відкрийте для себе різноманітні страви нашої кухні. Від
                  класичних рецептів до авторських новинок — задовольнимо
                  будь-який смак.
                </Typography>
                <MyButton
                  component={Link}
                  href="/menu"
                  size="large"
                  endIcon={<ArrowForward />}
                >
                  Переглянути меню
                </MyButton>
              </Paper>
            </Grid>

            <Grid size={12}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  borderRadius: 4,
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 8,
                  },
                }}
              >
                <RateReview
                  sx={{ fontSize: 60, color: "var(--primary)", mb: 2 }}
                />
                <Typography variant="h4" component="h2" gutterBottom>
                  Відгуки
                </Typography>
                <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                  Розкажіть нам про свої враження від візиту до нашого
                  ресторану. Ваш відгук допоможе нам стати ще кращими!
                </Typography>
                <MyButton
                  component={Link}
                  href="/reviews/new"
                  size="large"
                  endIcon={<ArrowForward />}
                >
                  Залишити відгук
                </MyButton>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 4,
            }}
          >
            <Typography variant="h3" component="h2" sx={{ fontWeight: "bold" }}>
              Популярні страви
            </Typography>
            <MyButton component={Link} href="/menu" endIcon={<ArrowForward />}>
              Повне меню
            </MyButton>
          </Box>

          <Grid container spacing={4}>
            {loading
              ? Array.from(Array(4)).map((_, index) => (
                  <Grid key={index} size={6}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Skeleton variant="rectangular" height={160} />
                      <CardContent>
                        <Skeleton height={32} width="80%" />
                        <Skeleton height={18} />
                        <Skeleton height={18} />
                        <Skeleton height={18} width="60%" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              : popularItems.map((item) => (
                  <Grid key={item.id} size={6}>
                    <Card
                      sx={{
                        backgroundColor: "white",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "transform 0.3s, box-shadow 0.3s",
                        "&:hover": {
                          transform: "scale(1.03)",
                          boxShadow: 4,
                        },
                      }}
                    >
                      <CardMedia
                        component="div"
                        sx={{
                          position: "relative",
                          height: 160,
                        }}
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </CardMedia>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography
                          gutterBottom
                          variant="h6"
                          component="h3"
                          sx={{ fontWeight: "bold" }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mb={2}
                        >
                          {item.description}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ color: "var(--primary)", fontWeight: "bold" }}
                        >
                          {item.price}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
          </Grid>
        </Container>
      </Box>

      <Box mx={2}>
        <Container
          maxWidth="lg"
          sx={{
            bgcolor: "var(--primary)",
            color: "var(--background)",
            py: { xs: 8, md: 10 },
            overflow: "hidden",
            borderRadius: 3,
          }}
        >
          <Grid
            container
            spacing={6}
            alignItems="center"
            justifyContent="space-between"
          >
            <Grid size={12}>
              <Typography
                variant="h3"
                component="h2"
                gutterBottom
                fontWeight="bold"
              >
                Забронюйте свій незабутній вечір просто зараз
              </Typography>
              <Typography variant="h6" paragraph>
                Затишна атмосфера, вишукані страви та професійне обслуговування
                — подаруйте собі ідеальний відпочинок
              </Typography>
              <Box sx={{ mt: 4 }}>
                <MyButton
                  component={Link}
                  href="/reservations"
                  customvariant="cancel"
                >
                  Забронювати столик
                </MyButton>
              </Box>
            </Grid>

            <Grid size={12}>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: { xs: 250, md: 350 },
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: 10,
                }}
              >
                <Image
                  src="/restaurant-interior.jpg"
                  alt="Restaurant interior"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
