import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

const EMOJIS = ["😀", "😂", "😍", "🔥", "🎉", "👍", "🙏", "😢", "😮", "🚀", "💡", "❤️"];

// A small, dependency-free rich text editor: bold/italic/underline/link/code,
// an emoji picker, @mention autocomplete, and a single attached image.
export default function RichEditor({
  value,
  onChange,
  image,
  onImageChange,
  placeholder = "Share your thoughts...",
  users = [],
  minHeight = 90,
  autoFocus = false,
}) {
  const { isDark } = useTheme();
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [mentionQuery, setMentionQuery] = useState(null); // string when actively typing @mention
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (autoFocus && editorRef.current) editorRef.current.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep contentEditable in sync when value is reset externally (e.g. after posting)
  useEffect(() => {
    if (editorRef.current && value === "" && editorRef.current.innerHTML !== "") {
      editorRef.current.innerHTML = "";
    }
  }, [value]);

  const emitChange = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const exec = (command, arg = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    emitChange();
  };

  const handleLink = () => {
    const url = prompt("Paste a URL");
    if (!url) return;
    exec("createLink", url.startsWith("http") ? url : `https://${url}`);
  };

  const insertEmoji = (emoji) => {
    editorRef.current?.focus();
    document.execCommand("insertText", false, emoji);
    setShowEmoji(false);
    emitChange();
  };

  const detectMention = () => {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode) return setMentionQuery(null);
    const text = sel.anchorNode.textContent || "";
    const caret = sel.anchorOffset;
    const before = text.slice(0, caret);
    const match = before.match(/@([A-Za-z0-9_]{0,32})$/);
    setMentionQuery(match ? match[1] : null);
  };

  const insertMention = (name) => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && sel.anchorNode) {
      const node = sel.anchorNode;
      const text = node.textContent || "";
      const caret = sel.anchorOffset;
      const before = text.slice(0, caret).replace(/@([A-Za-z0-9_]{0,32})$/, "");
      const after = text.slice(caret);
      node.textContent = before + after;
      const range = document.createRange();
      range.setStart(node, before.length);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    document.execCommand("insertText", false, `@${name.replace(/\s+/g, "")} `);
    setMentionQuery(null);
    emitChange();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be under 5MB");
      return;
    }
    setUploadError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      onImageChange(data.url);
    } catch (err) {
      setUploadError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const matchingUsers =
    mentionQuery !== null
      ? users.filter((u) => u.name.toLowerCase().replace(/\s+/g, "").startsWith(mentionQuery.toLowerCase())).slice(0, 5)
      : [];

  return (
    <div className="rich-editor">
      <style>{`
        .rich-editor { position: relative; }
        .re-toolbar {
          display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
          margin-bottom: 8px;
        }
        .re-btn {
          width: 30px; height: 30px; border-radius: 8px; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; font-size: 14px;
          background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(108,71,255,0.06)"};
          color: ${isDark ? "rgba(255,255,255,0.6)" : "rgba(15,10,30,0.55)"};
          transition: all 0.15s;
        }
        .re-btn:hover { background: rgba(108,71,255,0.18); color: #a78bfa; }
        .re-btn.busy { opacity: 0.5; pointer-events: none; }
        .re-editable {
          min-height: ${minHeight}px; padding: 12px 14px;
          background: ${isDark ? "rgba(255,255,255,0.04)" : "rgba(108,71,255,0.04)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.1)"};
          border-radius: 12px; color: ${isDark ? "#fff" : "#0f0a1e"};
          font-family: 'DM Sans', sans-serif; font-size: 14px; line-height: 1.6;
          outline: none; transition: border-color 0.2s; overflow-wrap: anywhere;
        }
        .re-editable:focus { border-color: rgba(108,71,255,0.4); box-shadow: 0 0 0 3px rgba(108,71,255,0.08); }
        .re-editable:empty::before {
          content: attr(data-placeholder);
          color: ${isDark ? "rgba(255,255,255,0.2)" : "rgba(15,10,30,0.3)"};
        }
        .re-editable a { color: #a78bfa; }
        .re-emoji-pop {
          position: absolute; z-index: 20; margin-top: 4px;
          display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px;
          padding: 8px; border-radius: 12px;
          background: ${isDark ? "#15121f" : "#fff"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(108,71,255,0.15)"};
          box-shadow: 0 12px 32px rgba(0,0,0,0.35);
        }
        .re-emoji-item { font-size: 18px; cursor: pointer; padding: 4px; border-radius: 6px; }
        .re-emoji-item:hover { background: rgba(108,71,255,0.15); }
        .re-mention-pop {
          position: absolute; z-index: 20; margin-top: 2px; width: 220px;
          border-radius: 12px; overflow: hidden;
          background: ${isDark ? "#15121f" : "#fff"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(108,71,255,0.15)"};
          box-shadow: 0 12px 32px rgba(0,0,0,0.35);
        }
        .re-mention-item {
          padding: 8px 12px; font-size: 13px; cursor: pointer;
          color: ${isDark ? "rgba(255,255,255,0.8)" : "#0f0a1e"};
          display: flex; align-items: center; gap: 8px;
        }
        .re-mention-item:hover { background: rgba(108,71,255,0.12); }
        .re-image-preview {
          position: relative; margin-top: 10px; display: inline-block;
        }
        .re-image-preview img {
          max-width: 100%; max-height: 260px; border-radius: 12px;
          border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(108,71,255,0.12)"};
          display: block;
        }
        .re-image-remove {
          position: absolute; top: 6px; right: 6px;
          width: 24px; height: 24px; border-radius: 50%; border: none; cursor: pointer;
          background: rgba(0,0,0,0.6); color: #fff; font-size: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .re-upload-error { font-size: 12px; color: #f87171; margin-top: 6px; }
        .mention-chip {
          color: #a78bfa; font-weight: 600; background: rgba(108,71,255,0.14);
          padding: 0 4px; border-radius: 4px;
        }
      `}</style>

      <div className="re-toolbar">
        <button type="button" className="re-btn" title="Bold" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")}><b>B</b></button>
        <button type="button" className="re-btn" title="Italic" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")}><i>I</i></button>
        <button type="button" className="re-btn" title="Underline" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("underline")}><u>U</u></button>
        <button type="button" className="re-btn" title="Code" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("formatBlock", "<pre>")}>{"</>"}</button>
        <button type="button" className="re-btn" title="Link" onMouseDown={(e) => e.preventDefault()} onClick={handleLink}>🔗</button>
        <button type="button" className="re-btn" title="Emoji" onMouseDown={(e) => e.preventDefault()} onClick={() => setShowEmoji((s) => !s)}>🙂</button>
        <button
          type="button"
          className={`re-btn ${uploading ? "busy" : ""}`}
          title="Add photo"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? "⏳" : "📷"}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileSelect} />

        {showEmoji && (
          <div className="re-emoji-pop">
            {EMOJIS.map((e) => (
              <span key={e} className="re-emoji-item" onClick={() => insertEmoji(e)}>{e}</span>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: "relative" }}>
        <div
          ref={editorRef}
          className="re-editable"
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={() => { emitChange(); detectMention(); }}
          onKeyUp={detectMention}
          onClick={detectMention}
          dangerouslySetInnerHTML={value ? { __html: value } : undefined}
        />
        {mentionQuery !== null && matchingUsers.length > 0 && (
          <div className="re-mention-pop">
            {matchingUsers.map((u) => (
              <div key={u._id} className="re-mention-item" onMouseDown={(e) => { e.preventDefault(); insertMention(u.name); }}>
                @{u.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {uploadError && <div className="re-upload-error">{uploadError}</div>}

      {image && (
        <div className="re-image-preview">
          <img src={image} alt="attachment" />
          <button type="button" className="re-image-remove" onClick={() => onImageChange(null)} title="Remove image">✕</button>
        </div>
      )}
    </div>
  );
}
