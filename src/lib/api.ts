import axios from "axios";
import Cookies from "js-cookie";
import {
  AUTH_EXPIRES_KEY,
  ACCESS_TOKEN_KEY,
  AUTH_COOKIE_KEYS,
} from "@/lib/auth-keys";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_KEY,
  headers: {
    "Content-Type": "application/json",
    "api-security-key": process.env.NEXT_PUBLIC_SECURITY_KEY,
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = Cookies.get(ACCESS_TOKEN_KEY);
    const expiresAt = Cookies.get(AUTH_EXPIRES_KEY);

    if (token && expiresAt && Date.now() <= Number(expiresAt)) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

type AxiosLikeError = {
  isAxiosError?: boolean;
  response?: {
    status: number;
    data: unknown;
  };
  message?: string;
};

function isAxiosError(
  error: unknown,
): error is AxiosLikeError & { isAxiosError: true } {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as AxiosLikeError).isAxiosError === true
  );
}

const MESSAGE_KEYS = [
  "message",
  "Message",
  "error",
  "Error",
  "detail",
  "Detail",
  "title",
  "Title",
] as const;

function collectValidationMessages(errors: unknown): string[] {
  if (!errors || typeof errors !== "object") return [];

  return Object.values(errors as Record<string, unknown>).flatMap((value) => {
    if (Array.isArray(value)) {
      return value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      );
    }
    if (typeof value === "string" && value.trim()) return [value.trim()];
    return [];
  });
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (isAxiosError(error)) {
    const { response } = error;

    if (!response) {
      return "Unable to connect to the server. Please check your internet and try again.";
    }

    const { data, status } = response;

    if (typeof data === "string" && data.trim()) {
      return data.trim();
    }

    if (data && typeof data === "object") {
      const body = data as Record<string, unknown>;

      for (const key of MESSAGE_KEYS) {
        const value = body[key];
        if (typeof value === "string" && value.trim()) {
          return value.trim();
        }
      }

      const validationMessages = collectValidationMessages(body.errors);
      if (validationMessages.length > 0) {
        return validationMessages.join(" ");
      }

      if (body.success === false) {
        for (const key of MESSAGE_KEYS) {
          const value = body[key];
          if (typeof value === "string" && value.trim()) {
            return value.trim();
          }
        }
      }
    }

    if (status === 409) {
      return "An account with these details already exists. Please login or use different information.";
    }

    if (status === 400) {
      return fallback;
    }

    if (status === 401 || status === 403) {
      return "You are not authorized to perform this action.";
    }

    if (status >= 500) {
      return "Server error. Please try again later.";
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
}

export default api;
