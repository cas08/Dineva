"use client";

import { MyButton } from "@/components/ui";
import { ReviewsApi } from "@/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { PiBowlFood, PiBowlFoodFill } from "react-icons/pi";
import { IoCloseOutline } from "react-icons/io5";
import { ReviewFormSchema } from "@/zod-schemas";
import type {
  CreateReviewData,
  ReviewFormData,
  UpdateReviewData,
} from "@/@types";

interface AddReviewFormProps {
  userId: string;
  onReviewAdded: () => void;
  initialData?: ReviewFormData;
  onClose: () => void;
}

const AddReviewForm = ({
  userId,
  onReviewAdded,
  initialData,
  onClose,
}: AddReviewFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(ReviewFormSchema),
    defaultValues: initialData || { rating: 0, comment: undefined },
  });

  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const currentRating = watch("rating", initialData?.rating || 0);
  const isEditMode = !!initialData;
  const queryClient = useQueryClient();

  const { mutateAsync: submitReview, isPending } = useMutation({
    mutationFn: (data: CreateReviewData | UpdateReviewData) => {
      if ("id" in data) {
        return ReviewsApi.update(data as UpdateReviewData);
      }
      return ReviewsApi.create(data as CreateReviewData);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reviews"] });
      onReviewAdded();
    },
    onError: (error) => {
      console.error("Review submission error:", error);
    },
  });

  useEffect(() => {
    if (initialData?.rating) {
      setValue("rating", initialData.rating);
    }
  }, [initialData, setValue]);

  const onSubmit = async (data: ReviewFormData) => {
    if (!isValid) {
      toast.error("Будь ласка, вкажіть рейтинг від 1 до 5!");
      return;
    }

    const cleanData = {
      ...data,
      comment: data.comment?.trim() || undefined,
    };

    try {
      await toast.promise(
        submitReview(
          isEditMode
            ? { id: initialData!.id!, ...cleanData }
            : { userId, ...cleanData },
        ),
        {
          loading: isEditMode ? "Оновлення відгуку..." : "Додавання відгуку...",
          success: isEditMode ? "Відгук оновлено!" : "Відгук додано!",
          error: (err) => {
            console.log(err);
            if (err.response?.status === 400) {
              return "Не вдалося зберегти відгук: можливо, відгук уже існує або дані некоректні";
            }
            return (
              err.response?.data?.error ||
              err?.message ||
              "Помилка при збереженні відгуку"
            );
          },
        },
        {
          style: { pointerEvents: "none" },
        },
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleRatingClick = (rating: number) => {
    setValue("rating", rating, { shouldValidate: true });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-full sm:min-w-[300px] md:min-w-[400px] lg:min-w-[500px] max-w-2xl max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 text-xl"
        >
          <IoCloseOutline size={30} />
        </button>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-4">
          <div>
            <label className="block mb-3 font-semibold text-lg sm:text-xl">
              Рейтинг <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-3">
              {Array.from({ length: 5 }, (_, index) => index + 1).map(
                (star) => (
                  <span
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => handleRatingClick(star)}
                    className="cursor-pointer transition-colors duration-200 ease-in-out"
                  >
                    {star <= (hoverRating || currentRating) ? (
                      <PiBowlFoodFill size={30} className="text-warning" />
                    ) : (
                      <PiBowlFood size={30} className="text-gray-400" />
                    )}
                  </span>
                ),
              )}
            </div>
            <input
              type="hidden"
              {...register("rating", { required: "Рейтинг обов'язковий" })}
            />
            {errors.rating && (
              <p className="text-red-500 text-sm mt-2">
                {errors.rating.message}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-3 font-semibold text-lg sm:text-xl">
              Коментар
            </label>
            <textarea
              {...register("comment")}
              className="w-full p-4 border rounded-lg min-h-[150px] text-base sm:text-lg"
              placeholder="Напишіть ваш коментар тут..."
            />
          </div>
          <MyButton
            customvariant="default"
            type="submit"
            disabled={isPending || !isValid}
            className="w-full sm:w-auto py-3 px-6 text-lg"
          >
            {isEditMode ? "Оновити" : "Надіслати"}
          </MyButton>
        </form>
      </div>
    </div>
  );
};

export default AddReviewForm;
