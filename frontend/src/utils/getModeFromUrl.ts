// utils/getModeFromUrl.ts
export function getModeFromUrl(): "demo " | "server" | "edit" | "view" {
  if (typeof window === "undefined") return "view";
  const url = new URL(window.location.href);
  const mode = url.searchParams.get("mode");
  if (mode === "server" || mode === "edit" || mode === "view" || mode === "demo") return mode;
  return "demo";
}
