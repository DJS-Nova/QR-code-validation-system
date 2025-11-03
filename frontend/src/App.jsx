import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import LiveSimulation from "./pages/LiveSimulation";
import QRScanner from "./pages/QRScanner";
import CheckPoint from "./pages/Checkpoint";
import Participants from "./pages/Participants";
import socket from "./socket";
import CheckpointParticipants from "./pages/CheckpointParticipants";
import LoginModal from "./components/LoginModal";

function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Ensure socket is connected when authenticated
  useEffect(() => {
    if (isAuthenticated && !socket.connected) {
      socket.connect();
    }
  }, [isAuthenticated]);

  // ✅ Restore session on first load (no redirect here)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (token && storedRole) {
      setRole(storedRole);
      setShowLogin(false);
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  // ✅ Redirect only after successful login
  const handleLoginSuccess = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    setRole(role);
    setShowLogin(false);
    setIsAuthenticated(true);

    if (role === "superadmin") navigate("/dashboard");
    else if (role === "admin") navigate("/scan-qr");
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600 font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <>
      {showLogin && <LoginModal onLoginSuccess={handleLoginSuccess} />}

      {isAuthenticated && (
        <>
          <Navbar role={role} />
          <div className="p-4">
            <Routes>
              {/* ✅ Super Admin Routes */}
              <Route
                path="/dashboard"
                element={
                  role === "superadmin" ? (
                    <Home />
                  ) : (
                    <div className="text-center text-red-600 p-10 font-bold">
                      ❌ Access denied: Super Admins only
                    </div>
                  )
                }
              />
              <Route
                path="/checkpoints"
                element={
                  role === "superadmin" ? (
                    <CheckPoint />
                  ) : (
                    <div className="text-center text-red-600 p-10 font-bold">
                      ❌ Access denied: Super Admins only
                    </div>
                  )
                }
              />
              <Route
                path="/participants"
                element={
                  (role === "superadmin" || role === "showadmin") ? (
                    <CheckpointParticipants />
                  ) : (
                    <div className="text-center text-red-600 p-10 font-bold">
                      ❌ Access denied: Super Admins only
                    </div>
                  )
                }
              />

              {/* ✅ Admin Routes */}
              {/* <Route path="/simulation" element={<LiveSimulation />} /> */}

                            <Route
                path="/scan-qr"
                element={
                  role === "superadmin" ? (
                    <QRScanner />
                  ) : (
                    <div className="text-center text-red-600 p-10 font-bold">
                      ❌ Access denied: Super Admins only
                    </div>
                  )
                }
              />

              {/* ✅ Default Route */}
              <Route
                path="/"
                element={role === "superadmin" ? <Home /> : role==="admin" ? <QRScanner /> : role==="showadmin" ? <CheckpointParticipants /> : <div className="text-center text-red-600 p-10 font-bold">
                      ❌ Access denied: only Authorized user can access
                    </div>}
              />

              <Route
                path="/simulation"
                element={
                  (role === "superadmin" || role === "showadmin") ? (
                    <LiveSimulation />
                  ) : (
                    <div className="text-center text-red-600 p-10 font-bold">
                      ❌ Access denied: Super Admins only
                    </div>
                  )
                }
              />

              {/* ✅ Fallback */}
              <Route
                path="*"
                element={
                  <div className="text-center text-gray-600 p-10 font-semibold">
                    ⚠️ Page not found
                  </div>
                }
              />
            </Routes>
          </div>
        </>
      )}
    </>
  );
}

export default App;
