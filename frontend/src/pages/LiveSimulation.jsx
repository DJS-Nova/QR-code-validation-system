// import React from 'react'
// import PeopleSimulation from '../components/PeopleSimulation '

// const LiveSimulation = () => {
//   return (
//     <div>
//         <PeopleSimulation />
//     </div>
//   )
// }

// export default LiveSimulation


import React, { useEffect, useState } from "react";
import PeopleSimulation from "../components/PeopleSimulation";

const LiveSimulation = () => {
  const [checkpoints, setCheckpoints] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  // Fetch live data from backend
  const fetchLiveStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/live-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCheckpoints(data);
    } catch (err) {
      console.error("Failed to fetch live data:", err);
    }
  };

  useEffect(() => {
    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🎥 Live Checkpoint Simulation</h1>

      {/* Top summary */}
      <div className="mb-8 text-center space-y-1">
        {checkpoints.map(cp => (
          <p key={cp.id} className="text-lg text-gray-700">
            {cp.name} - <span className="font-semibold">{cp.count}</span> people
          </p>
        ))}
      </div>

      {/* Simulation containers */}
      <div className="flex flex-wrap justify-center gap-8">
        {checkpoints.map(cp => (
          <div key={cp.id} className="bg-white shadow-lg rounded-xl p-4">
            <h2 className="text-center text-xl font-semibold mb-2">{cp.name}</h2>
            <PeopleSimulation peopleCount={cp.count} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveSimulation;
