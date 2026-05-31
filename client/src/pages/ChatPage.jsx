import { useState, useEffect } from "react";
import ChatBox from "../components/ChatBox";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/api/auth/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setUsers(res.data);
        if (res.data.length > 0) {
          setSelectedUser(res.data[0]);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`${isDark ? "bg-gradient-to-br from-gray-900 to-black" : "bg-gradient-to-br from-gray-50 to-gray-100"} h-screen flex flex-col`}>
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Users List */}
        <div className={`w-64 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-r flex flex-col`}>
          <div className={`p-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
            <h2 className={`font-bold text-lg mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
              💬 Messages
            </h2>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-3 py-2 rounded border ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500"}`}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className={`p-4 text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                No users found
              </div>
            ) : (
              filteredUsers.map(user => (
                <button
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-3 text-left border-b transition ${
                    selectedUser?._id === user._id
                      ? isDark
                        ? "bg-blue-600 border-gray-700"
                        : "bg-blue-100 border-gray-200"
                      : isDark
                      ? "hover:bg-gray-700 border-gray-700"
                      : "hover:bg-gray-100 border-gray-200"
                  }`}
                >
                  <div className={`font-medium ${selectedUser?._id === user._id ? "text-white" : isDark ? "text-white" : "text-gray-900"}`}>
                    {user.name}
                  </div>
                  <div className={`text-xs ${selectedUser?._id === user._id ? "text-blue-100" : isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {user.email}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex items-center justify-center p-6">
          {selectedUser ? (
            <ChatBox roomId={selectedUser._id} selectedUser={selectedUser} />
          ) : (
            <div className={`text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              <p className="text-lg">Select a user to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}