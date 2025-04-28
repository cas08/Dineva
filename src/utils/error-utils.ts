import { isAxiosError } from "axios";

export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error) && error.response?.data?.error) {
    return error.response.data.error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  ) {
    return (error as Record<string, unknown>).message as string;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function isPrismaError(
  error: unknown,
): error is { code: string; meta?: { field_name?: string } } {
  return typeof error === "object" && error !== null && "code" in error;
}
