import { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

// Curated emoji set grouped by category — enough variety for a chat app
// without pulling in a heavy third-party emoji-data package.
const CATEGORIES = [
  {
    label: "Smileys",
    icon: "😀",
    emojis: ["😀", "😁", "😂", "🤣", "😊", "😍", "😘", "😜", "🤔", "😎", "🥳", "😇", "🙂", "😉", "😢", "😭", "😡", "🥺", "😴", "🤯", "😱", "🤗", "🙄", "😏"],
  },
  {
    label: "Gestures",
    icon: "👍",
    emojis: ["👍", "👎", "👏", "🙌", "🙏", "👋", "✌️", "🤝", "💪", "🤟", "👌", "🤞", "✋", "🫶", "👊", "🖐️"],
  },
  {
    label: "Hearts",
    icon: "❤️",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💕", "💖", "💔", "💯", "🔥", "✨", "⭐", "🎉"],
  },
  {
    label: "Objects",
    icon: "🎁",
    emojis: ["🎁", "🎂", "🎊", "🎈", "📷", "🎵", "☕", "🍕", "🍔", "🍺", "⚽", "🏆", "💻", "📱", "🚀", "🌟"],
  },
];

// Small set shown as instant "quick react" bubbles above a message bubble
export const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export default function EmojiPicker({ onSelect, onClose, style }) {
  const { isDark } = useTheme();
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <>
      <style>{`
        .emoji-picker {
          position: absolute; z-index: 1300; width: 280px; max-width: calc(100vw - 24px);
          background: ${isDark ? "#0f0d16" : "#fff"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(108,71,255,0.15)"};
          border-radius: 16px; box-shadow: 0 16px 40px rgba(0,0,0,0.35);
          padding: 10px; animation: emojiPopIn 0.15s ease forwards;
          font-family: 'DM Sans', sans-serif;
        }
        @keyframes emojiPopIn { from { opacity:0; transform: scale(0.92) translateY(6px); } to { opacity:1; transform: scale(1) translateY(0); } }
        .emoji-picker-tabs { display: flex; gap: 4px; margin-bottom: 8px; }
        .emoji-picker-tab {
          flex: 1; text-align: center; padding: 6px 0; border-radius: 8px; cursor: pointer;
          font-size: 16px; background: transparent; border: none;
        }
        .emoji-picker-tab:hover { background: ${isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.08)"}; }
        .emoji-picker-grid {
          display: grid; grid-template-columns: repeat(6, 1fr); gap: 2px;
          max-height: 180px; overflow-y: auto;
        }
        .emoji-picker-item {
          font-size: 20px; padding: 6px 0; border-radius: 8px; cursor: pointer;
          text-align: center; transition: transform 0.1s, background 0.1s; background: none; border: none;
        }
        .emoji-picker-item:hover { background: ${isDark ? "rgba(108,71,255,0.15)" : "rgba(108,71,255,0.1)"}; transform: scale(1.15); }
        .emoji-picker-cat-label {
          font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
          color: ${isDark ? "rgba(255,255,255,0.35)" : "rgba(15,10,30,0.4)"}; margin: 4px 2px 6px;
        }
      `}</style>
      <div
        className="emoji-picker"
        ref={ref}
        style={style}
      >
        {CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <div className="emoji-picker-cat-label">{cat.label}</div>
            <div className="emoji-picker-grid" style={{ marginBottom: 8 }}>
              {cat.emojis.map((e) => (
                <button
                  key={e}
                  type="button"
                  className="emoji-picker-item"
                  onClick={() => onSelect?.(e)}
                  title={e}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
