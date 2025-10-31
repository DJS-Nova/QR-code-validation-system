// src/components/Navbar.jsx
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  const linkClass =
    "px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 hover:text-white transition";

  return (
    <nav className="bg-blue-500 text-white p-3 shadow-md flex items-center justify-between">
      <Link to="/" className="text-lg font-bold">
        🌾 Wheat App
      </Link>
      <div className="flex gap-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? `${linkClass} bg-blue-700` : linkClass
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive ? `${linkClass} bg-blue-700` : linkClass
          }
        >
          About
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            isActive ? `${linkClass} bg-blue-700` : linkClass
          }
        >
          Contact
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
