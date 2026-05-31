import { useEffect, useState } from "react";
import axios from "axios";

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);

  const fetchNotifs = async () => {
    const res = await axios.get("/api/notifications", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    setNotifs(res.data);
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Notifications 🔔</h1>

      <div className="mt-4 space-y-3">
        {notifs.map((n, i) => (
          <div key={i} className="p-3 bg-gray-800 rounded">
            {n.message}
          </div>
        ))}
      </div>
    </div>
  );
}