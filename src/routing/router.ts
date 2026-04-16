import { useEffect, useState } from "react";

const rawBaseUrl = (import.meta.env.BASE_URL as string | undefined) ?? "/";

const normalizeBasePath = (basePath: string) => {
  if (!basePath || basePath.startsWith(".")) return "/";
  const withLeadingSlash = basePath.startsWith("/")
    ? basePath
    : `/${basePath}`;
  const trimmed = withLeadingSlash.replace(/\/+$/, "");
  return trimmed.length ? trimmed : "/";
};

const appBasePath = normalizeBasePath(rawBaseUrl);

export const normalizePath = (path: string) => {
  const normalized = path.replace(/\/+$/, "");
  return normalized.length ? normalized : "/";
};

const withBasePath = (appPath: string) => {
  const normalizedAppPath = normalizePath(appPath);
  if (appBasePath === "/") return normalizedAppPath;
  if (normalizedAppPath === "/") return `${appBasePath}/`;
  return `${appBasePath}${normalizedAppPath}`;
};

const stripBasePath = (pathname: string) => {
  const normalizedPathname = normalizePath(pathname);
  if (appBasePath === "/") return normalizedPathname;
  if (normalizedPathname === appBasePath) return "/";
  if (normalizedPathname.startsWith(`${appBasePath}/`)) {
    return normalizedPathname.slice(appBasePath.length) || "/";
  }
  return normalizedPathname;
};

export const resolveHref = (href: string) => {
  if (
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#")
  ) {
    return href;
  }
  if (!href.startsWith("/")) return href;
  return withBasePath(href);
};

export const navigate = (to: string) => {
  const targetPath = withBasePath(to);
  if (normalizePath(window.location.pathname) === normalizePath(targetPath)) return;
  window.history.pushState({}, "", targetPath);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "auto" });
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
    stripBasePath(window.location.pathname)
  );

  useEffect(() => {
    const onPopState = () => setPathname(stripBasePath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return pathname;
};
