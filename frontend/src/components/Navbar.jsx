// import { Link, NavLink } from "react-router-dom";

// function Navbar({ role }) {
//   const linkClass =
//     "px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 hover:text-white transition";

//   return (
//     <nav className="bg-blue-500 text-white p-3 shadow-md flex items-center justify-between">
//       <Link to="/" className="text-lg font-bold">
//          QR Scanning System
//       </Link>

//       <div className="flex gap-4">
//         {/* SUPER ADMIN NAV ITEMS */}
//         {role === "superadmin" && (
//           <>
//             <NavLink
//               to="/dashboard"
//               className={({ isActive }) =>
//                 isActive ? `${linkClass} bg-blue-700` : linkClass
//               }
//             >
//               Dashboard
//             </NavLink>
//             <NavLink
//               to="/checkpoints"
//               className={({ isActive }) =>
//                 isActive ? `${linkClass} bg-blue-700` : linkClass
//               }
//             >
//               Checkpoints
//             </NavLink>
//             <NavLink
//               to="/participants"
//               className={({ isActive }) =>
//                 isActive ? `${linkClass} bg-blue-700` : linkClass
//               }
//             >
//               Participants
//             </NavLink>
//           </>
//         )}

//         {/* NORMAL ADMIN NAV ITEMS */}
//         {role === "admin" && (
//           <>
//             <NavLink
//               to="/scan-qr"
//               className={({ isActive }) =>
//                 isActive ? `${linkClass} bg-blue-700` : linkClass
//               }
//             >
//               Scan QR
//             </NavLink>
//             <NavLink
//               to="/simulation"
//               className={({ isActive }) =>
//                 isActive ? `${linkClass} bg-blue-700` : linkClass
//               }
//             >
//               Live Simulation
//             </NavLink>
//           </>
//         )}
//       </div>
//     </nav>
//   );
// }

// export default Navbar;


import { Link, NavLink, useNavigate } from "react-router-dom";

function Navbar({ role }) {
  const linkClass =
    "px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 hover:text-white transition";
  const navigate = useNavigate();

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/"); // redirect to root (login modal will show)
    window.location.reload(); // force reload to clear state
  };

  return (
    <nav className="bg-blue-500 text-white p-3 shadow-md flex items-center justify-between">
      <Link to="/" className="text-lg font-bold">
        QR Scanning System
      </Link>

      <div className="flex items-center gap-4">
        {/* SUPER ADMIN NAV ITEMS */}
        {role === "superadmin" && (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? `${linkClass} bg-blue-700` : linkClass
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/checkpoints"
              className={({ isActive }) =>
                isActive ? `${linkClass} bg-blue-700` : linkClass
              }
            >
              Checkpoints
            </NavLink>
            <NavLink
              to="/participants"
              className={({ isActive }) =>
                isActive ? `${linkClass} bg-blue-700` : linkClass
              }
            >
              Participants
            </NavLink>
            <NavLink
              to="/simulation"
              className={({ isActive }) =>
                isActive ? `${linkClass} bg-blue-700` : linkClass
              }
            >
              Live Simulation
            </NavLink>
          </>
        )}

        {/* NORMAL ADMIN NAV ITEMS */}
        {role === "admin" && (
          <>
            <NavLink
              to="/scan-qr"
              className={({ isActive }) =>
                isActive ? `${linkClass} bg-blue-700` : linkClass
              }
            >
              Scan QR
            </NavLink>
          </>
        )}

        {role === "showadmin" && (
          <>
           <NavLink
              to="/simulation"
              className={({ isActive }) =>
                isActive ? `${linkClass} bg-blue-700` : linkClass
              }
            >
              Live Simulation
            </NavLink>
          </>
        )}

        {/* ✅ Logout Button (Visible to all) */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
