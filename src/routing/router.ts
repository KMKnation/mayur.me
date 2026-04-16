import { useEffect, useState } from "react";

export const navigate = (to: string) => {
  if (window.location.pathname === to) return;
  window.history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "auto" });
};

export const normalizePath = (path: string) => {
  const normalized = path.replace(/\/+$/, "");
  return normalized.length ? normalized : "/";
};

export const matchPath = (path: string, pattern: string) => {
  const normalizedPath = normalizePath(path);
  const normalizedPattern = normalizePath(pattern);
  if (!normalizedPattern.includes(":")) {
    return normalizedPath === normalizedPattern
      ? { matched: true, params: {} as Record<string, string> }
      : { matched: false, params: {} as Record<string, string> };
  }

  const pathParts = normalizedPath.split("/").filter(Boolean);
  const patternParts = normalizedPattern.split("/").filter(Boolean);
  if (pathParts.length !== patternParts.length) {
    return { matched: false, params: {} as Record<string, string> };
  }

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i += 1) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];
    if (patternPart.startsWith(":")) {
      params[patternPart.slice(1)] = decodeURIComponent(pathPart);
    } else if (patternPart !== pathPart) {
      return { matched: false, params: {} as Record<string, string> };
    }
  }
  return { matched: true, params };
};

export const useCurrentPath = () => {
  const [pathname, setPathname] = useState<string>(
    normalizePath(window.location.pathname)
  );

  useEffect(() => {
    const onPopState = () => setPathname(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return pathname;
};

