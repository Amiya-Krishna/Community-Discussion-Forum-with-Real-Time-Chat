import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white p-4 space-y-4">

      <Link to="/dashboard" className="block hover:text-blue-400">
        📊 Dashboard
      </Link>

      <Link to="/profile" className="block hover:text-blue-400">
        👤 Profile
      </Link>

      <Link to="/discussion/123" className="block hover:text-blue-400">
        💬 Discussion
      </Link>

    </div>
  );
}
