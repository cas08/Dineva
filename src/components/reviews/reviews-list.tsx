"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import LoadingReviewsList from "./review-loading";
import { ReviewsApi } from "@/services";
import ReviewCard from "./review-card";
import { BiSortDown, BiSortUp } from "react-icons/bi";
import { motion } from "framer-motion";
import { PiBowlFoodFill } from "react-icons/pi";
import { MyButton, MySelect } from "../ui";
import { SelectChangeEvent, Typography } from "@mui/material";
import type { Review } from "@/@types";

interface ReviewsListProps {
  refreshTrigger: boolean;
  currentUser: { id: string } | null;
  onEdit: (review: Review) => void;
  onDelete: (reviewId: number) => void;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  refreshTrigger,
  currentUser,
  onEdit,
  onDelete,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [userOnly, setUserOnly] = useState<boolean>(false);
  const { data: session } = useSession();
  const reviewsPerPage = 10;
  const isManagerOrAdmin =
    session?.user.role === "Manager" || session?.user.role === "Admin";

  const { data, isLoading } = useQuery({
    queryKey: [
      "reviews",
      currentPage,
      filterRating,
      sortOrder,
      userOnly,
      refreshTrigger,
    ],
    queryFn: () =>
      ReviewsApi.get({
        page: currentPage,
        limit: reviewsPerPage,
        rating: filterRating ?? undefined,
        sort: sortOrder,
        userOnly,
        userId: currentUser?.id.toString(),
      }),
  });

  const reviews = data?.reviews || [];
  const totalPages = data?.totalPages || 0;

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    pages.push(
      <MyButton
        key="prev"
        onClick={() => changePage(currentPage - 1)}
        disabled={currentPage === 1}
        customvariant="default"
        customsize="small"
        sx={{
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
          },
          "&:disabled": {
            opacity: 0.5,
            boxShadow: "none",
          },
        }}
      >
        Попередня
      </MyButton>,
    );

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <MyButton
          key={i}
          onClick={() => changePage(i)}
          customvariant={currentPage === i ? "default" : "cancel"}
          customsize="small"
          sx={{
            minWidth: "36px",
            borderRadius: "8px",
            boxShadow:
              currentPage === i
                ? "0 2px 4px rgba(0, 0, 0, 0.2)"
                : "0 1px 2px rgba(0, 0, 0, 0.1)",
            "&:hover": {
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
            },
          }}
        >
          {i}
        </MyButton>,
      );
    }

    pages.push(
      <MyButton
        key="next"
        onClick={() => changePage(currentPage + 1)}
        disabled={currentPage === totalPages}
        customvariant="default"
        customsize="small"
        sx={{
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
          },
          "&:disabled": {
            opacity: 0.5,
            boxShadow: "none",
          },
        }}
      >
        Наступна
      </MyButton>,
    );

    return pages;
  };

  const handleUserFilterChange = (event: SelectChangeEvent<"all" | "mine">) => {
    const value = event.target.value;
    if (value === "all") {
      setUserOnly(false);
    } else if (value === "mine") {
      setUserOnly(true);
    }
  };

  const handleRatingFilterChange = (
    event: SelectChangeEvent<number | "all">,
  ) => {
    const value = event.target.value;
    setFilterRating(value === "all" ? null : Number(value));
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center justify-between">
        <div className="flex gap-4">
          <MySelect
            label="Перегляд"
            value={userOnly ? "mine" : "all"}
            onChange={handleUserFilterChange}
            options={
              [
                { value: "all", label: "Усі" },
                ...(currentUser ? [{ value: "mine", label: "Мої" }] : []),
              ] as Array<{ value: "all" | "mine"; label: string }>
            }
          />

          <MySelect
            label="Рейтинг"
            value={filterRating ?? "all"}
            onChange={handleRatingFilterChange}
            options={[
              { value: "all", label: "Усі" },
              ...[1, 2, 3, 4, 5].map((rating) => ({
                value: rating,
                label: (
                  <>
                    {rating}{" "}
                    <PiBowlFoodFill
                      size={24}
                      className="text-warning inline-block ml-1"
                    />
                  </>
                ),
              })),
            ]}
          />
        </div>

        <div className="flex items-center gap-2">
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Дата:
          </Typography>
          <motion.button
            onClick={toggleSortOrder}
            className={`p-2 border rounded ${
              sortOrder === "desc" ? "bg-gray-200" : "bg-gray-100"
            }`}
            title={sortOrder === "desc" ? "Новіші" : "Старіші"}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              key={sortOrder}
              initial={{ rotate: 180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {sortOrder === "desc" ? (
                <BiSortDown size={20} />
              ) : (
                <BiSortUp size={20} />
              )}
            </motion.div>
          </motion.button>
        </div>
      </div>

      {isLoading ? (
        <LoadingReviewsList />
      ) : reviews.length === 0 ? (
        <div className="text-center text-gray-500">Відгуків не існує</div>
      ) : (
        reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onEdit={onEdit}
            onDelete={onDelete}
            currentUser={currentUser}
            isManagerOrAdmin={isManagerOrAdmin}
          />
        ))
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {renderPagination()}
        </div>
      )}
      {totalPages > 0 && (
        <div className="text-center text-gray-500">
          Сторінка {currentPage} з {totalPages}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
