import Cookies from "js-cookie";
import api from "@/lib/api";
import { AUTH_EXPIRES_KEY, AUTH_TOKEN_KEY } from "@/lib/auth-keys";
const SESSION_HOURS = 24;

type TokenResponse = {
  access_token?: string;
  AccessToken?: string;
  token?: string;
  Token?: string;
  expires_in?: number;
  ExpiresIn?: number;
};

export function setAuthSession(token: string, expiresInSeconds?: number) {
  const maxAgeMs =
    (expiresInSeconds && expiresInSeconds > 0
      ? expiresInSeconds
      : SESSION_HOURS * 60 * 60) * 1000;
  const expiresAt = Date.now() + maxAgeMs;
  const cookieDays = maxAgeMs / (24 * 60 * 60 * 1000);

  Cookies.set(AUTH_TOKEN_KEY, token, {
    expires: cookieDays,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  Cookies.set(AUTH_EXPIRES_KEY, String(expiresAt), {
    expires: cookieDays,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
}

export function getAuthToken(): string | undefined {
  const token = Cookies.get(AUTH_TOKEN_KEY);
  const expiresAt = Cookies.get(AUTH_EXPIRES_KEY);

  if (!token || !expiresAt || Date.now() > Number(expiresAt)) {
    clearAuthSession();
    return undefined;
  }

  return token;
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

export function clearAuthSession() {
  Cookies.remove(AUTH_TOKEN_KEY);
  Cookies.remove(AUTH_EXPIRES_KEY);
}

export function logout() {
  clearAuthSession();
}

function extractToken(data: TokenResponse): string | undefined {
  return data.access_token ?? data.AccessToken ?? data.token ?? data.Token;
}

export async function loginWithCredentials(username: string, password: string) {
  let response;

  try {
    response = await api.post<TokenResponse>("/api/v1/oauth/token", {
      grant_type: "password",
      username,
      password,
    });
  } catch (firstError) {
    response = await api.post<TokenResponse>("/api/v1/oauth/token", {
      Grant_type: "password",
      UserName: username,
      Password: password,
    });
  }

  const token = extractToken(response.data);
  if (!token) {
    throw new Error("Login succeeded but no access token was returned.");
  }

  setAuthSession(
    token,
    response.data.expires_in ?? response.data.ExpiresIn,
  );

  return response.data;
}
