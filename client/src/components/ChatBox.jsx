import { useEffect, useState, useRef } from "react";
import { socket } from "../socket";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function ChatBox({ roomId, selectedUser }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const { isDark } = useTheme();
  const bottomRef = useRef();
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef();

  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "??";

  const AVATAR_COLORS = ["#6c47ff", "#a855f7", "#ec4899", "#10b981", "#f59e0b"];
  const getColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    socket.emit("joinRoom", roomId);
    const receiveHandler = (data) => setMessages((prev) => [...prev, data]);
    const typingHandler = () => setIsTyping(true);
    const stopTypingHandler = () => setIsTyping(false);
    socket.on("receiveMessage", receiveHandler);
    socket.on("showTyping", typingHandler);
    socket.on("hideTyping", stopTypingHandler);
    return () => {
      socket.off("receiveMessage", receiveHandler);
      socket.off("showTyping", typingHandler);
      socket.off("hideTyping", stopTypingHandler);
      socket.emit("leaveRoom", roomId);
    };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("sendMessage", {
      roomId, message,
      user: user?.name || "User",
      userId: user?._id,
      timestamp: new Date().toISOString(),
    });
    setMessage("");
    inputRef.current?.focus();
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", roomId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socket.emit("stopTyping", roomId), 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const isMine = (msg) => msg.userId === user?._id;

  const showDateSeparator = (messages, i) => {
    if (i === 0) return true;
    const prev = new Date(messages[i - 1].timestamp).toDateString();
    const curr = new Date(messages[i].timestamp).toDateString();
    return prev !== curr;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes msgIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }

        .chatbox {
          font-family: 'DM Sans', sans-serif;
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          background: ${isDark ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.85)"};
          backdrop-filter: blur(20px);
          border: 1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.1)"};
          border-radius: 24px;
          overflow: hidden;
          box-shadow: ${isDark ? "0 20px 60px rgba(0,0,0,0.4)" : "0 10px 40px rgba(108,71,255,0.08)"};
        }

        /* HEADER */
        .cb-header {
          display: flex; align-items: center; gap: 12px;
          padding: 16px 20px;
          background: ${isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.9)"};
          border-bottom: 1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.09)"};
          flex-shrink: 0;
        }
        .cb-header-av {
          width: 42px; height: 42px; border-radius: 13px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #fff;
          box-shadow: 0 4px 12px rgba(108,71,255,0.35);
        }
        .cb-header-info { flex: 1; min-width: 0; }
        .cb-header-name {
          font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700;
          color: ${isDark ? "#fff" : "#0f0a1e"}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .cb-header-status {
          display: flex; align-items: center; gap: 5px;
          font-size: 12px; color: #10b981; margin-top: 1px;
        }
        .cb-online-dot { width: 7px; height: 7px; background: #10b981; border-radius: 50%; }
        .cb-header-actions { display: flex; gap: 4px; }
        .cb-hdr-btn {
          width: 34px; height: 34px; border-radius: 9px; border: none;
          background: ${isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.07)"};
          color: ${isDark ? "rgba(255,255,255,0.45)" : "rgba(15,10,30,0.45)"};
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 15px; transition: all 0.15s;
        }
        .cb-hdr-btn:hover {
          background: ${isDark ? "rgba(108,71,255,0.15)" : "rgba(108,71,255,0.12)"};
          color: #a78bfa;
        }

        /* MESSAGES */
        .cb-messages {
          flex: 1; overflow-y: auto; padding: 20px 16px;
          display: flex; flex-direction: column; gap: 4px;
          background: transparent;
        }
        .cb-messages::-webkit-scrollbar { width: 4px; }
        .cb-messages::-webkit-scrollbar-track { background: transparent; }
        .cb-messages::-webkit-scrollbar-thumb { background: rgba(151, 143, 181, 0.66); border-radius: 4px; }

        .cb-empty {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          color: ${isDark ? "rgba(196, 176, 176, 0.3)" : "rgba(15,10,30,0.25)"};
          gap: 10px; animation: fadeIn 0.4s ease;
        }
        .cb-empty-icon { font-size: 40px; }
        .cb-empty-text { font-size: 14px; text-align: center; }

        /* DATE SEP */
        .cb-date-sep {
          display: flex; align-items: center; gap: 10px;
          margin: 12px 0 8px; color: ${isDark ? "rgba(255,255,255,0.2)" : "rgba(15,10,30,0.25)"};
          font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
        }
        .cb-date-line { flex: 1; height: 1px; background: currentColor; opacity: 0.4; }

        /* MESSAGE ROW */
        .msg-row {
          display: flex; gap: 8px;
          animation: msgIn 0.25s ease forwards;
          margin-bottom: 2px;
        }
        .msg-row.mine { flex-direction: row-reverse; }

        .msg-av {
          width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; color: #fff;
          align-self: flex-end; margin-bottom: 2px;
        }
        .msg-av.hidden { visibility: hidden; }

        .msg-bubble {
          max-width: 68%; padding: 10px 14px;
          border-radius: 18px;
          font-size: 14px; line-height: 1.5;
          word-break: break-word;
          position: relative;
        }
        .msg-bubble.theirs {
          background: ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.08)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.12)"};
          color: ${isDark ? "rgba(255,255,255,0.85)" : "#0f0a1e"};
          border-bottom-left-radius: 6px;
        }
        .msg-bubble.mine {
          background: linear-gradient(135deg, #6c47ff, #a855f7);
          color: #fff;
          border-bottom-right-radius: 6px;
          box-shadow: 0 4px 14px rgba(108,71,255,0.3);
        }
        .msg-sender {
          font-size: 11px; font-weight: 600; margin-bottom: 3px;
          color: ${isDark ? "rgba(255,255,255,0.4)" : "rgba(15,10,30,0.4)"};
        }
        .msg-time {
          font-size: 10px; margin-top: 5px; opacity: 0.55; text-align: right;
        }

        /* TYPING */
        .typing-row {
          display: flex; align-items: center; gap: 8px; padding: 4px 0;
          animation: fadeIn 0.2s ease;
        }
        .typing-av {
          width: 30px; height: 30px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: #fff;
        }
        .typing-bubble {
          background: ${isDark ? "rgba(255,255,255,0.07)" : "rgba(108,71,255,0.08)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.1)"};
          border-radius: 18px; border-bottom-left-radius: 6px;
          padding: 12px 16px; display: flex; gap: 4px; align-items: center;
        }
        .typing-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${isDark ? "rgba(255,255,255,0.4)" : "rgba(108,71,255,0.5)"};
          animation: blink 1.4s infinite ease-in-out;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        .typing-label { font-size: 12px; color: ${isDark ? "rgba(255,255,255,0.35)" : "rgba(15,10,30,0.4)"}; margin-left: 4px; }

        /* INPUT */
        .cb-input-area {
          padding: 14px 16px;
          background: ${isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.95)"};
          border-top: 1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(108,71,255,0.09)"};
          flex-shrink: 0;
        }
        .cb-input-row { display: flex; gap: 8px; align-items: flex-end; }
        .cb-textarea {
          flex: 1; min-height: 42px; max-height: 100px; resize: none;
          background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(108,71,255,0.04)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(108,71,255,0.12)"};
          border-radius: 14px; padding: 11px 14px;
          color: ${isDark ? "#fff" : "#0f0a1e"};
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          outline: none; transition: all 0.2s; line-height: 1.4;
        }
        .cb-textarea::placeholder { color: ${isDark ? "rgba(255,255,255,0.2)" : "rgba(15,10,30,0.25)"}; }
        .cb-textarea:focus { border-color: rgba(108,71,255,0.45); box-shadow: 0 0 0 3px rgba(108,71,255,0.09); }
        .cb-send-btn {
          width: 42px; height: 42px; border-radius: 13px; border: none;
          background: linear-gradient(135deg, #6c47ff, #a855f7);
          color: #fff; font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(108,71,255,0.35);
        }
        .cb-send-btn:hover:not(:disabled) { transform: scale(1.08) rotate(-5deg); box-shadow: 0 6px 20px rgba(108,71,255,0.45); }
        .cb-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
        .cb-hint { font-size: 11px; color: ${isDark ? "rgba(255,255,255,0.18)" : "rgba(15,10,30,0.25)"}; text-align: right; margin-top: 6px; }
      `}</style>

      <div className="chatbox">
        {/* Header */}
        <div className="cb-header">
          <div className="cb-header-av" style={{ background: getColor(selectedUser?.name) }}>
            {getInitials(selectedUser?.name)}
          </div>
          <div className="cb-header-info">
            <div className="cb-header-name">{selectedUser?.name || "Chat"}</div>
            <div className="cb-header-status">
              <span className="cb-online-dot" />
              Online now
            </div>
          </div>
          <div className="cb-header-actions">
            <button className="cb-hdr-btn" title="Search in chat">🔍</button>
            <button className="cb-hdr-btn" title="More options">⋯</button>
          </div>
        </div>

        {/* Messages */}
        <div className="cb-messages">
          {messages.length === 0 ? (
            <div className="cb-empty">
              <div className="cb-empty-icon">👋</div>
              <div className="cb-empty-text">
                Start a conversation with<br /><strong>{selectedUser?.name}</strong>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const mine = isMine(msg);
              const nextSame = messages[i + 1]?.userId === msg.userId;
              return (
                <div key={i}>
                  {showDateSeparator(messages, i) && (
                    <div className="cb-date-sep">
                      <span className="cb-date-line" />
                      {new Date(msg.timestamp).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
                      <span className="cb-date-line" />
                    </div>
                  )}
                  <div className={`msg-row ${mine ? "mine" : ""}`}>
                    <div className={`msg-av ${nextSame ? "hidden" : ""}`} style={{ background: mine ? "linear-gradient(135deg,#6c47ff,#a855f7)" : getColor(msg.user) }}>
                      {getInitials(msg.user)}
                    </div>
                    <div className={`msg-bubble ${mine ? "mine" : "theirs"}`}>
                      {!mine && !nextSame && <div className="msg-sender">{msg.user}</div>}
                      {msg.message}
                      <div className="msg-time">{formatTime(msg.timestamp)}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {isTyping && (
            <div className="typing-row">
              <div className="typing-av" style={{ background: getColor(selectedUser?.name) }}>
                {getInitials(selectedUser?.name)}
              </div>
              <div className="typing-bubble">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
                <span className="typing-label">{selectedUser?.name} is typing</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="cb-input-area">
          <div className="cb-input-row">
            <textarea
              ref={inputRef}
              className="cb-textarea"
              value={message}
              onChange={handleTyping}
              onKeyDown={handleKeyPress}
              placeholder={`Message ${selectedUser?.name || ""}...`}
              rows={1}
            />
            <button className="cb-send-btn" onClick={sendMessage} disabled={!message.trim()}>
              ➤
            </button>
          </div>
          <div className="cb-hint">Enter to send · Shift+Enter for new line</div>
        </div>
      </div>
    </>
  );
}