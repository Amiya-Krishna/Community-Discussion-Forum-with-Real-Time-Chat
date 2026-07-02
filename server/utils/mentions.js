import User from "../models/User.js";

// Extracts @Name tokens from text/HTML content. Names may contain letters,
// numbers, and single internal spaces are NOT supported (keeps parsing simple
// and unambiguous) — mentions are written as @FirstLast or @First.
const MENTION_REGEX = /@([A-Za-z0-9_]{2,32})/g;

// Strips HTML tags before scanning for mentions/plain text search.
export const stripHtml = (html = "") => html.replace(/<[^>]*>/g, " ");

export const extractMentionedUsers = async (content) => {
  const text = stripHtml(content || "");
  const handles = [...text.matchAll(MENTION_REGEX)].map((m) => m[1].toLowerCase());
  if (handles.length === 0) return [];

  const uniqueHandles = [...new Set(handles)];

  // Match against user names with spaces removed (so "@JohnSmith" matches "John Smith")
  const users = await User.find({}, { name: 1 });
  const matched = users.filter((u) =>
    uniqueHandles.includes(u.name.replace(/\s+/g, "").toLowerCase())
  );

  return matched;
};
