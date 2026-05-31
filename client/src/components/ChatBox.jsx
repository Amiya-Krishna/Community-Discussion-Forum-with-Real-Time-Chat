import { useEffect, useState, useRef } from "react";
import socket from "../socket";
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
useEffect(() => {
  socket.emit("joinRoom", roomId);

  const receiveHandler = (data) => {
    setMessages(prev => [...prev, data]);
  };

  const typingHandler = () => {
    setIsTyping(true);
  };

  const stopTypingHandler = () => {
    setIsTyping(false);
  };

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

  // ADD auto-scroll
  useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

 const sendMessage = () => {
  if (!message.trim()) return;

  const msgData = {
    roomId,
    message,
    user: user?.name || "User",
    userId: user?._id,
    timestamp: new Date().toISOString(),
  };

  socket.emit("sendMessage", msgData);
  setMessage("");
};

  const handleTyping = (e) => {
    setMessage(e.target.value);

    socket.emit("typing", roomId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", roomId);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`w-full h-full rounded-lg flex flex-col ${isDark ? "bg-gray-800" : "bg-white"} border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-100"} rounded-t-lg`}>
        <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          {selectedUser?.name}
        </h3>
        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          {selectedUser?.email}
        </p>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${isDark ? "bg-gray-800" : "bg-white"}`}>
        {messages.length === 0 ? (
          <div className={`text-center py-8 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.userId === user?._id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.userId === user?._id
                    ? isDark
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : isDark
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <p className={`text-xs font-semibold mb-1 ${msg.userId === user?._id ? "text-blue-100" : isDark ? "text-gray-300" : "text-gray-600"}`}>
                  {msg.user}
                </p>
                <p className="break-words">{msg.message}</p>
                <p className={`text-xs mt-1 ${msg.userId === user?._id ? "text-blue-100" : isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className={`px-4 py-2 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
              <p className={`text-sm italic ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {selectedUser?.name} is typing...
              </p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={`p-4 border-t ${isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-100"} rounded-b-lg flex gap-2`}>
        <input
          type="text"
          value={message}
          onChange={handleTyping}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className={`flex-1 px-3 py-2 rounded border ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}`}
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}