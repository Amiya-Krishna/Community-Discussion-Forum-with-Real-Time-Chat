import DOMPurify from "dompurify";

// Allowlist for the lightweight rich-text editor's output — enough for
// bold/italic/underline/links/code/emoji spans, nothing that can execute JS.
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "a", "code", "pre", "br", "span", "p", "ul", "ol", "li"],
  ALLOWED_ATTR: ["href", "target", "rel", "class", "data-mention"],
};

export const sanitizeHtml = (html = "") => DOMPurify.sanitize(html, SANITIZE_CONFIG);

// Turns plain "@Name" tokens that aren't already inside a tag into
// highlighted mention spans for display.
export const highlightMentions = (html = "") =>
  html.replace(
    /(^|[\s(])@([A-Za-z0-9_]{2,32})/g,
    (match, prefix, handle) => `${prefix}<span class="mention-chip" data-mention="${handle}">@${handle}</span>`
  );

export const renderPostHtml = (html = "") => sanitizeHtml(highlightMentions(html || ""));

export const stripHtml = (html = "") => (html || "").replace(/<[^>]*>/g, " ").trim();
