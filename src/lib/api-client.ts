type EnvLike = Record<string, string | undefined>;

export type PublicConfig = {
  appName: string;
  apiOrigin: string;
  appScheme: string;
};

export type ApiQueryValue = string | number | boolean | null | undefined;
export type ApiQuery = Record<string, ApiQueryValue>;

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  query?: ApiQuery;
  body?: unknown;
  cookie?: string | null;
  headers?: HeadersInit;
  fetcher?: typeof fetch;
  signal?: AbortSignal;
};

const DEFAULT_API_ORIGIN = "https://watchlog.tv";
const MOBILE_CLIENT = "watchlog-mobile";

export class ApiError extends Error {
  readonly status: number;
  readonly userMessage: string;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.userMessage = toUserMessage(status, message);
  }
}

export function getPublicConfig(env: EnvLike = process.env): PublicConfig {
  const apiOrigin = normalizeOrigin(
    env.EXPO_PUBLIC_API_ORIGIN ?? DEFAULT_API_ORIGIN,
  );
  if (!apiOrigin) {
    throw new Error("EXPO_PUBLIC_API_ORIGIN is required");
  }

  return {
    appName: env.EXPO_PUBLIC_APP_NAME?.trim() || "Watchlog",
    apiOrigin,
    appScheme: env.EXPO_PUBLIC_APP_SCHEME?.trim() || "watchlog",
  };
}

export function buildApiUrl(
  path: string,
  query?: ApiQuery,
  config = getPublicConfig(),
) {
  const normalizedPath = normalizeApiPath(path);
  const url = new URL(`/api/v1/${normalizedPath}`, config.apiOrigin);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === null || value === undefined || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

export function createApiHeaders({
  cookie,
  json = false,
  headers,
}: {
  cookie?: string | null;
  json?: boolean;
  headers?: HeadersInit;
} = {}) {
  const output: Record<string, string> = {
    Accept: "application/json",
    ...headersToObject(headers),
    "x-watchlog-client": MOBILE_CLIENT,
  };
  if (json) output["Content-Type"] = "application/json";
  if (cookie) output.Cookie = cookie;
  return output;
}

export async function apiRequest<TResponse = unknown>(
  path: string,
  {
    method = "GET",
    query,
    body,
    cookie,
    headers,
    fetcher = fetch,
    signal,
  }: ApiRequestOptions = {},
) {
  const isJsonMutation = method !== "GET" && body !== undefined;
  const response = await fetcher(buildApiUrl(path, query), {
    method,
    headers: createApiHeaders({ cookie, json: isJsonMutation, headers }),
    body: isJsonMutation ? JSON.stringify(body) : undefined,
    credentials: "omit",
    signal,
  });

  const data = await readJson(response);
  if (!response.ok) {
    const message =
      extractErrorMessage(data) ?? (response.statusText || "Request failed");
    throw new ApiError(response.status, message);
  }

  return data as TResponse;
}

function normalizeOrigin(origin: string) {
  return origin.trim().replace(/\/+$/, "");
}

function headersToObject(headers: HeadersInit | undefined) {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return headers;
}

function normalizeApiPath(path: string) {
  const trimmed = path.trim();
  if (!trimmed || trimmed === "/") return "";
  if (trimmed.startsWith("/api/")) {
    throw new Error(
      "Use /api/v1 app data paths through buildApiUrl, not raw /api paths",
    );
  }
  if (trimmed.startsWith("api/")) {
    throw new Error(
      "Use /api/v1 app data paths through buildApiUrl, not raw /api paths",
    );
  }
  return trimmed.replace(/^\/+/, "");
}

async function readJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function extractErrorMessage(data: unknown) {
  if (typeof data !== "object" || data === null || !("error" in data))
    return null;
  const error = (data as { error?: unknown }).error;
  return typeof error === "string" ? error : null;
}

function toUserMessage(status: number, fallback: string) {
  if (status === 401) return "Please sign in again.";
  if (status === 403) return "You do not have access to that item.";
  if (status === 404) return "That item is no longer available.";
  if (status === 415) return "The app sent an unsupported request.";
  if (status === 429) return "Too many requests. Try again shortly.";
  if (status >= 500) return "Watchlog is having trouble. Try again shortly.";
  return fallback || "Request failed.";
}
