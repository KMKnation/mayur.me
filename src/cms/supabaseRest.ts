const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;
const APP_BASE_URL = import.meta.env.BASE_URL as string | undefined;

const SESSION_STORAGE_KEY = "mk_admin_session";

const getAppBasePrefix = () => {
  if (!APP_BASE_URL || APP_BASE_URL.startsWith(".")) return "";
  return APP_BASE_URL.endsWith("/") ? APP_BASE_URL.slice(0, -1) : APP_BASE_URL;
};

export interface SupabaseSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  email?: string;
}

export class SupabaseConfigError extends Error {
  constructor() {
    super("Supabase environment variables are not configured.");
  }
}

export const isSupabaseConfigured = () =>
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const assertConfig = () => {
  if (!isSupabaseConfigured()) {
    throw new SupabaseConfigError();
  }
};

const getBaseHeaders = (token?: string) => {
  assertConfig();
  return {
    apikey: SUPABASE_ANON_KEY!,
    Authorization: `Bearer ${token ?? SUPABASE_ANON_KEY!}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
};

export const restSelect = async <T>(
  table: string,
  query = "*",
  filters = "",
  token?: string
): Promise<T[]> => {
  assertConfig();
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(
    query
  )}${filters ? `&${filters}` : ""}`;
  const response = await fetch(url, {
    headers: getBaseHeaders(token),
  });
  if (!response.ok) {
    throw new Error(`Failed to read ${table}: ${response.status}`);
  }
  return (await response.json()) as T[];
};

export const restUpsert = async <T>(
  table: string,
  payload: T | T[],
  onConflict: string,
  token: string
) => {
  assertConfig();
  const url = `${SUPABASE_URL}/rest/v1/${table}?on_conflict=${encodeURIComponent(
    onConflict
  )}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...getBaseHeaders(token),
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to upsert ${table}: ${response.status}`);
  }
  return response.json();
};

export const restInsert = async <T>(table: string, payload: T, token: string) => {
  assertConfig();
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const response = await fetch(url, {
    method: "POST",
    headers: getBaseHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to insert ${table}: ${response.status}`);
  }
  return response.json();
};

export const restDelete = async (
  table: string,
  filter: string,
  token: string
) => {
  assertConfig();
  const url = `${SUPABASE_URL}/rest/v1/${table}?${filter}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: getBaseHeaders(token),
  });
  if (!response.ok) {
    throw new Error(`Failed to delete from ${table}: ${response.status}`);
  }
};

export const parseAuthHashSession = (): SupabaseSession | null => {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  if (!hash.includes("access_token")) return null;
  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const expiresIn = Number(params.get("expires_in") || "0");
  if (!accessToken || !refreshToken || !expiresIn) return null;
  return {
    accessToken,
    refreshToken,
    expiresAt: Date.now() + expiresIn * 1000,
  };
};

export const saveSession = (session: SupabaseSession) => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const readSession = (): SupabaseSession | null => {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SupabaseSession;
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.expiresAt) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

export const getCurrentUser = async (accessToken: string) => {
  assertConfig();
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: getBaseHeaders(accessToken),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch current user.");
  }
  return response.json() as Promise<{
    id: string;
    email: string;
  }>;
};

export const getGoogleSignInUrl = (redirectPath: string) => {
  assertConfig();
  const path = redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`;
  const redirectTo = `${window.location.origin}${getAppBasePrefix()}${path}`;
  const query = new URLSearchParams({
    provider: "google",
    redirect_to: redirectTo,
  });
  return `${SUPABASE_URL}/auth/v1/authorize?${query.toString()}`;
};

export const uploadMediaAsset = async (
  bucket: string,
  path: string,
  file: File,
  token: string
) => {
  assertConfig();
  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${token}`,
        "x-upsert": "true",
      },
      body: file,
    }
  );
  if (!response.ok) {
    throw new Error(`Media upload failed: ${response.status}`);
  }
};

export const deleteMediaAssetObject = async (
  bucket: string,
  path: string,
  token: string
) => {
  assertConfig();
  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`,
    {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(`Media delete failed: ${response.status}`);
  }
};

export const getStoragePublicUrl = (bucket: string, path: string) => {
  assertConfig();
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
};
