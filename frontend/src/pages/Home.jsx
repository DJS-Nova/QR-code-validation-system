import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import socket from "../socket";
const COLORS = ["#4ade80", "#f97316", "#3b82f6", "#ef4444"];

const Home = () => {
  const [stats, setStats] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      }
    };

    // Initial fetch
    fetchStats();

    // Setup socket listeners
    const handleDashboardStatsUpdate = (updatedStats) => {
      console.log("Dashboard stats updated via socket:", updatedStats);
      setStats(updatedStats);
    };

    const handleScanUpdate = (scanData) => {
      console.log("Scan updated via socket:", scanData);
      fetchStats(); // Fetch fresh stats when scan happens
    };

    const handleLiveStatusUpdate = () => {
      fetchStats();
    };

    // Setup listeners
    socket.on("dashboard-stats:updated", handleDashboardStatsUpdate);
    socket.on("scan:updated", handleScanUpdate);
    socket.on("live-status:updated", handleLiveStatusUpdate);

    // Log connection status
    console.log("Socket connected:", socket.connected);
    if (!socket.connected) {
      socket.once("connect", () => {
        console.log("Socket connected, dashboard listeners active");
      });
    }

    // Cleanup
    return () => {
      socket.off("dashboard-stats:updated", handleDashboardStatsUpdate);
      socket.off("scan:updated", handleScanUpdate);
      socket.off("live-status:updated", handleLiveStatusUpdate);
    };
  }, [API_BASE_URL, token]);

  if (!stats) {
    return <div className="text-center p-10">Loading dashboard...</div>;
  }

  const pieData = [
    { name: "Checked-in", value: stats.checkedIn },
    { name: "Exited", value: stats.exited },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        📊 Event Dashboard
      </h1>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Total Registered
          </h2>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {stats.totalParticipants}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-700">Checked-in</h2>
          <p className="text-3xl font-bold text-green-500 mt-2">
            {stats.checkedIn}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-700">Exited</h2>
          <p className="text-3xl font-bold text-red-500 mt-2">{stats.exited}</p>
        </div>
      </div>

      {/* Live Users per Checkpoint */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Live Users per Checkpoint
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.checkpointData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Participation Overview
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Home;
