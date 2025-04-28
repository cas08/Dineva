import { Review, User } from "@prisma/client";
import { z } from "zod";
import { ReviewFormSchema } from "@/zod-schemas";

export type ExtendedReview = Review & {
  user: Pick<User, "id" | "name"> | null;
};

export type CreateReviewData = {
  userId: string;
  rating: number;
  comment?: string;
};

export type UpdateReviewData = {
  id: number;
  rating: number;
  comment?: string;
};

export type ReviewFormData = z.infer<typeof ReviewFormSchema>;
