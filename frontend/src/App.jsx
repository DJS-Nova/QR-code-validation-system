// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import LiveSimulation from "./pages/LiveSimulation";
import ScanQR from "./pages/Scanqr";

function App() {
  return (
    <>
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<LiveSimulation />} />
          <Route path="/contact" element={<ScanQR />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
