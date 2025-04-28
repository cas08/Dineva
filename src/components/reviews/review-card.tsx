"use client";

import { FaEdit, FaTrash } from "react-icons/fa";
import { PiBowlFood, PiBowlFoodFill } from "react-icons/pi";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import React, { useState } from "react";
import type { ExtendedReview } from "@/@types";

interface ReviewCardProps {
  review: ExtendedReview;
  onEdit: (review: ExtendedReview) => void;
  onDelete: (reviewId: number) => void;
  currentUser: { id: string } | null;
  isManagerOrAdmin: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
  currentUser,
  isManagerOrAdmin,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 500;

  const renderStars = (rating: number) => (
    <div className="flex items-center text-2xl space-x-1">
      {Array.from({ length: 5 }, (_, index) => index + 1).map((star) => (
        <span key={star}>
          {star <= rating ? (
            <PiBowlFoodFill size={24} className="text-warning" />
          ) : (
            <PiBowlFood size={24} className="text-gray-400" />
          )}
        </span>
      ))}
    </div>
  );

  const comment = review.comment || "";
  const shouldTruncate = comment.length > maxLength && !isExpanded;
  const displayedText = shouldTruncate
    ? comment.slice(0, maxLength) + "..."
    : comment;

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-white relative space-y-4 max-w-4xl mx-auto break-words">
      <div className="absolute top-2 right-3 text-gray-500 text-sm text-right">
        <div>
          {format(new Date(review.lastUpdatedAt), "dd MMM, yyyy, p", {
            locale: uk,
          })}
        </div>
        {review.editedAt && <div>змінено</div>}
      </div>

      <div className="text-gray-700 font-semibold text-2xl break-words">
        {review.user?.name || "Анонім"}
      </div>

      <div className="flex items-center">{renderStars(review.rating)}</div>

      <div className="text-gray-800 text-lg font-medium break-words">
        {displayedText}
        {shouldTruncate && (
          <div className="mt-2 ml-0 text-blue-500 hover:underline">
            <span
              onClick={() => setIsExpanded(!isExpanded)}
              className="cursor-pointer"
            >
              {isExpanded ? "Згорнути" : "Читати далі"}
            </span>
          </div>
        )}
      </div>

      {(currentUser?.id === review.userId || isManagerOrAdmin) && (
        <div className="flex justify-end space-x-4 mt-3">
          <button
            onClick={() => onEdit(review)}
            className="text-warning hover:text-yellow-700 transition-transform transform hover:scale-110"
            title="Редагувати"
          >
            <FaEdit size={22} />
          </button>
          <button
            onClick={() => onDelete(review.id)}
            className="text-red-500 hover:text-red-700 transition-transform transform hover:scale-110"
            title="Видалити"
          >
            <FaTrash size={22} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
