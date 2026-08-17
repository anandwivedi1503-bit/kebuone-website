export function publicApiError(error: unknown, fallback: string) {
  if (process.env.NODE_ENV !== "production" && error instanceof Error) {
    return error.message;
  }

  if (process.env.NODE_ENV !== "production") {
    return String(error);
  }

  return fallback;
}
