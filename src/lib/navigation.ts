export interface ReferenceLink {
  href: string;
  label: string;
}

export const withBase = (path: string) => {
  const base = import.meta.env.BASE_URL || "/";
  if (/^([a-z]+:)?\/\//i.test(path) || path.startsWith("mailto:") || path.startsWith("tel:") || path.startsWith("#")) {
    return path;
  }
  const trimmed = path.replace(/^\//, "");
  return base.endsWith("/") ? `${base}${trimmed}` : `${base}/${trimmed}`;
};

export const normalizePath = (value: string) => {
  if (!value) return "/";
  try {
    const base = import.meta.env.BASE_URL || "/";
    const tmp = new URL(value, "http://local");
    let path = tmp.pathname;
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    if (cleanBase !== "/" && path.startsWith(cleanBase)) {
      path = path.slice(cleanBase.length) || "/";
    }
    path = path.replace(/^\/en\//, "/").replace(/^\/en$/, "/");
    if (path !== "/" && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    return path || "/";
  } catch (error) {
    console.warn("Failed to normalize path", value, error);
    return value;
  }
};
