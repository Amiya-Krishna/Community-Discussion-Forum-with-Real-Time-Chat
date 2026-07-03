const rawList = (import.meta.env?.VITE_API_BASE_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const strip = (u) => u.replace(/\/$/, "");

export function pickApiBase() {
  if (rawList.length === 0) return "";
  if (rawList.length === 1) return strip(rawList[0]);
  const host =
    typeof window !== "undefined" && window.location && window.location.hostname
      ? window.location.hostname
      : "";

  // Resolve only valid URLs
  const valid = rawList
    .map((s) => {
      try {
        const url = new URL(s);
        return { raw: s, href: strip(url.href), hostname: url.hostname };
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);

  if (valid.length === 0) return strip(rawList[0]);

  const exact = valid.find((v) => v.hostname === host);
  if (exact) return exact.href;

  if (host === "localhost" || host === "127.0.0.1") {
    const local = valid.find(
      (v) => v.hostname === "localhost" || v.hostname === "127.0.0.1",
    );
    if (local) return local.href;
  }

  return valid[0].href;
}

export const API_BASE = pickApiBase();

export default API_BASE;
