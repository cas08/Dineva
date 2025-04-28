"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { MyButton } from "../ui";
import ReviewsList from "./reviews-list";
import AddReviewForm from "./modals/review-add-modal";
import type { Review } from "@/@types";
import DeleteReviewModal from "./modals/review-delete-modal";

const ReviewsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<{
    type: "add" | "edit" | "delete";
    review?: Review;
    reviewId?: number;
  }>({ type: "add" });
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const { data: session } = useSession();

  const handleAddReviewClick = () => {
    if (!session) {
      toast.error("Ви повинні увійти, щоб залишити відгук.");
      return;
    }
    setModalContext({ type: "add" });
    setIsModalOpen(true);
  };

  const handleEditClick = (review: Review) => {
    setModalContext({ type: "edit", review });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (reviewId: number) => {
    setModalContext({ type: "delete", reviewId });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContext({ type: "add" });
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => !prev);
    closeModal();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mx-auto mb-4 max-w-4xl">
        <h1 className="text-4xl font-bold">Відгуки</h1>
        <MyButton customvariant="default" onClick={handleAddReviewClick}>
          Написати відгук
        </MyButton>
      </div>

      <ReviewsList
        refreshTrigger={refreshTrigger}
        currentUser={session?.user?.id ? { id: session.user.id } : null}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {isModalOpen && session?.user?.id && (
        <>
          {modalContext.type === "add" && (
            <AddReviewForm
              userId={session.user.id}
              onReviewAdded={triggerRefresh}
              onClose={closeModal}
            />
          )}
          {modalContext.type === "edit" && modalContext.review && (
            <AddReviewForm
              userId={session.user.id}
              onReviewAdded={triggerRefresh}
              initialData={modalContext.review}
              onClose={closeModal}
            />
          )}
          {modalContext.type === "delete" && modalContext.reviewId && (
            <DeleteReviewModal
              onClose={closeModal}
              reviewId={modalContext.reviewId}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ReviewsPage;
