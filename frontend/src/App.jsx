// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import LiveSimulation from "./pages/LiveSimulation";
import QRScanner from "./pages/QRScanner";

function App() {
  return (
    <>
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<LiveSimulation />} />
          <Route path="/contact" element={<QRScanner />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
