// import React, { useEffect, useState } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
// } from "recharts";
// import socket from "../socket";
// const COLORS = ["#4ade80", "#f97316", "#3b82f6", "#ef4444"];

// const Home = () => {
//   const [stats, setStats] = useState(null);
//   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await fetch(`${API_BASE_URL}/dashboard-stats`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (!res.ok) {
//           throw new Error(`HTTP error! status: ${res.status}`);
//         }

//         const data = await res.json();
//         setStats(data);
//       } catch (err) {
//         console.error("Failed to fetch dashboard stats:", err);
//       }
//     };

//     // Initial fetch
//     fetchStats();

//     // Setup socket listeners
//     const handleDashboardStatsUpdate = (updatedStats) => {
//       console.log("Dashboard stats updated via socket:", updatedStats);
//       setStats(updatedStats);
//     };

//     const handleScanUpdate = (scanData) => {
//       console.log("Scan updated via socket:", scanData);
//       fetchStats(); // Fetch fresh stats when scan happens
//     };

//     const handleLiveStatusUpdate = () => {
//       fetchStats();
//     };

//     // Setup listeners
//     socket.on("dashboard-stats:updated", handleDashboardStatsUpdate);
//     socket.on("scan:updated", handleScanUpdate);
//     socket.on("live-status:updated", handleLiveStatusUpdate);

//     // Log connection status
//     console.log("Socket connected:", socket.connected);
//     if (!socket.connected) {
//       socket.once("connect", () => {
//         console.log("Socket connected, dashboard listeners active");
//       });
//     }

//     // Cleanup
//     return () => {
//       socket.off("dashboard-stats:updated", handleDashboardStatsUpdate);
//       socket.off("scan:updated", handleScanUpdate);
//       socket.off("live-status:updated", handleLiveStatusUpdate);
//     };
//   }, [API_BASE_URL, token]);

//   if (!stats) {
//     return <div className="text-center p-10">Loading dashboard...</div>;
//   }

//   const pieData = [
//     { name: "Checked-in", value: stats.checkedIn },
//     { name: "Exited", value: stats.exited },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <h1 className="text-3xl font-bold text-center mb-8">
//         📊 Event Dashboard
//       </h1>

//       {/* Top Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
//         <div className="bg-white p-6 rounded-lg shadow-md text-center">
//           <h2 className="text-xl font-semibold text-gray-700">
//             Total Registered
//           </h2>
//           <p className="text-3xl font-bold text-indigo-600 mt-2">
//             {stats.totalParticipants}
//           </p>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow-md text-center">
//           <h2 className="text-xl font-semibold text-gray-700">Checked-in</h2>
//           <p className="text-3xl font-bold text-green-500 mt-2">
//             {stats.checkedIn}
//           </p>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow-md text-center">
//           <h2 className="text-xl font-semibold text-gray-700">Exited</h2>
//           <p className="text-3xl font-bold text-red-500 mt-2">{stats.exited}</p>
//         </div>
//       </div>

//       {/* Live Users per Checkpoint */}
//       <div className="bg-white p-6 rounded-lg shadow-md mb-8">
//         <h2 className="text-2xl font-semibold mb-4 text-center">
//           Live Users per Checkpoint
//         </h2>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={stats.checkpointData}>
//             <XAxis dataKey="name" />
//             <YAxis />
//             <Tooltip />
//             <Bar dataKey="count" fill="#3b82f6" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Pie Chart */}
//       <div className="bg-white p-6 rounded-lg shadow-md">
//         <h2 className="text-2xl font-semibold mb-4 text-center">
//           Participation Overview
//         </h2>
//         <ResponsiveContainer width="100%" height={300}>
//           <PieChart>
//             <Pie
//               data={pieData}
//               cx="50%"
//               cy="50%"
//               labelLine={false}
//               outerRadius={100}
//               fill="#8884d8"
//               dataKey="value"
//               label={({ name, value }) => `${name}: ${value}`}
//             >
//               {pieData.map((entry, index) => (
//                 <Cell
//                   key={`cell-${index}`}
//                   fill={COLORS[index % COLORS.length]}
//                 />
//               ))}
//             </Pie>
//             <Tooltip />
//             <Legend />
//           </PieChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default Home;

// import React, { useEffect, useState } from "react";
// import {
//   PieChart, Pie, Cell, Tooltip,
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
// } from "recharts";
// import { motion } from "framer-motion";
// import socket from "../socket";

// export default function Home() {
//   const [stats, setStats] = useState({
//     totalRegistered: 0,
//     checkedIn: 0,
//     exited: 0,
//     activeCheckpoints: 0,
//   });

//   const [checkpointActivity, setCheckpointActivity] = useState([]);
//   const [recentScans, setRecentScans] = useState([]);
//   const [connected, setConnected] = useState(socket.connected);

//   // Socket setup
//   useEffect(() => {
//     // connection status
//     socket.on("connect", () => setConnected(true));
//     socket.on("disconnect", () => setConnected(false));

//     // when dashboard stats update
//     socket.on("dashboard-stats:updated", (data) => {
//       setStats((prev) => ({ ...prev, ...data }));
//     });

//     // when checkpoint activity changes
//     socket.on("checkpoint:updated", (data) => {
//       setCheckpointActivity(data);
//     });

//     // when new scan happens
//     socket.on("scan:updated", (data) => {
//       setRecentScans((prev) => {
//         const updated = [data, ...prev];
//         return updated.slice(0, 10); // keep last 10
//       });
//     });

//     // cleanup
//     return () => {
//       socket.off("connect");
//       socket.off("disconnect");
//       socket.off("dashboard-stats:updated");
//       socket.off("checkpoint:updated");
//       socket.off("scan:updated");
//     };
//   }, []);

//   const pieData = [
//     { name: "Checked In", value: stats.checkedIn },
//     { name: "Exited", value: stats.exited },
//   ];

//   const COLORS = ["#22c55e", "#ef4444"];

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold text-white">📊 Event Dashboard</h1>
//         <span className={`text-sm font-semibold ${connected ? "text-green-400" : "text-red-400"}`}>
//           {connected ? "🟢 Live" : "🔴 Offline"}
//         </span>
//       </div>

//       {/* Top Stats */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <StatCard title="Registered" value={stats.totalRegistered} color="from-blue-500 to-cyan-400" />
//         <StatCard title="Checked In" value={stats.checkedIn} color="from-green-500 to-emerald-400" />
//         <StatCard title="Exited" value={stats.exited} color="from-red-500 to-pink-400" />
//         <StatCard title="Active Checkpoints" value={stats.activeCheckpoints} color="from-purple-500 to-indigo-400" />
//       </div>

//       {/* Charts Section */}
//       <div className="grid md:grid-cols-2 gap-6">
//         {/* Checkpoint Bar Chart */}
//         <div className="bg-gray-900 p-4 rounded-2xl shadow-md">
//           <h2 className="text-lg text-white font-semibold mb-2">Checkpoint Activity</h2>
//           <ResponsiveContainer width="100%" height={250}>
//             <BarChart data={checkpointActivity}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#444" />
//               <XAxis dataKey="checkpoint" stroke="#aaa" />
//               <YAxis stroke="#aaa" />
//               <Tooltip />
//               <Bar dataKey="insideCount" fill="#22c55e" />
//               <Bar dataKey="exitCount" fill="#ef4444" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Participation Pie Chart */}
//         <div className="bg-gray-900 p-4 rounded-2xl shadow-md">
//           <h2 className="text-lg text-white font-semibold mb-2">Participation Status</h2>
//           <ResponsiveContainer width="100%" height={250}>
//             <PieChart>
//               <Pie
//                 data={pieData}
//                 cx="50%"
//                 cy="50%"
//                 outerRadius={90}
//                 label
//                 dataKey="value"
//               >
//                 {pieData.map((entry, i) => (
//                   <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Recent Scans Feed */}
//       <div className="bg-gray-900 p-4 rounded-2xl shadow-md">
//         <h2 className="text-lg text-white font-semibold mb-4">Recent Scans</h2>
//         <ul className="space-y-2 max-h-72 overflow-y-auto">
//           {recentScans.length === 0 ? (
//             <p className="text-gray-400 text-sm">No recent scans yet</p>
//           ) : (
//             recentScans.map((scan, i) => (
//               <motion.li
//                 key={i}
//                 initial={{ opacity: 0, y: 5 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="flex justify-between bg-gray-800 p-3 rounded-xl text-sm text-gray-200"
//               >
//                 <span className="font-semibold">{scan.participantName}</span>
//                 <span>{scan.checkpointName}</span>
//                 <span className={`font-medium ${scan.status === "INSIDE" ? "text-green-400" : "text-red-400"}`}>
//                   {scan.status}
//                 </span>
//                 <span className="text-gray-400">{new Date(scan.time).toLocaleTimeString()}</span>
//               </motion.li>
//             ))
//           )}
//         </ul>
//       </div>
//     </div>
//   );
// }

// function StatCard({ title, value, color }) {
//   return (
//     <motion.div
//       whileHover={{ scale: 1.03 }}
//       className={`bg-gradient-to-br ${color} text-white p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center`}
//     >
//       <h3 className="text-sm font-semibold">{title}</h3>
//       <p className="text-2xl font-bold">{value}</p>
//     </motion.div>
//   );
// }

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import socket from "../socket";

export default function Home() {
  const [stats, setStats] = useState({
    totalRegistered: 0,
    checkedIn: 0,
    exited: 0,
    activeCheckpoints: 0,
  });

  const [checkpointActivity, setCheckpointActivity] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [connected, setConnected] = useState(socket.connected);

  // 🚀 Fetch initial data + set up live updates
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [statsRes, scansRes] = await Promise.all([
          fetch(`${API_BASE_URL}/dashboard-stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/recent-scans`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!statsRes.ok || !scansRes.ok)
          throw new Error("Failed to fetch initial dashboard data");

        const statsData = await statsRes.json();
        const scansData = await scansRes.json();

        console.log(scansData);

        // ✅ Convert timestamps properly (fix Invalid Date)
        const formattedScans = scansData.map((s) => ({
          participantName: s.participantName || "Unknown",
          checkpointName: s.checkpointName || "Unknown",
          status: s.status || "N/A",
          time: s.time ? new Date(s.time).toLocaleTimeString() : "—",
        }));

        const formattedActivity = formatCheckpointActivity(scansData);
        setCheckpointActivity(formattedActivity);

        setStats(statsData);
        setRecentScans(formattedScans);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchInitialData();

    // 🔌 Socket connection
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    // 🔄 Live dashboard stats
    socket.on("dashboard-stats:updated", (data) => {
      console.log(data, " dashboard-stats:updated from live");

      setStats((prev) => ({ ...prev, ...data }));
    });

    // 🔄 Checkpoint updates
    // socket.on("checkpoint:updated", (data) => setCheckpointActivity(data));

    // 🔄 New scan updates
    socket.on("scan:updated", (data) => {
      console.log(data);

      const formatted = {
        participantName: data.participant?.name || "Unknown",
        checkpointName: data.checkpointName || "Unknown",
        status: data.visit?.lastStatus || "N/A",
        time: data.visit?.lastScanTime
          ? new Date(data.visit.lastScanTime).toLocaleTimeString()
          : "—",
      };

      setRecentScans((prev) => [formatted, ...prev].slice(0, 10));

      console.log("Incoming scan update:", data);
    });

    socket.on("live-count:updated", (data) => {
      const formattedActivity = formatCheckpointActivity(data);
      setCheckpointActivity(formattedActivity);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("dashboard-stats:updated");
      socket.off("checkpoint:updated");
      socket.off("scan:updated");
      socket.on("live-count:updated");
    };
  }, [API_BASE_URL, token]);

  const pieData = [
    { name: "Checked In", value: stats.checkedIn },
    { name: "Exited", value: stats.exited },
  ];

  const COLORS = ["#22c55e", "#ef4444"];

  function formatCheckpointActivity(scans) {
    if (!Array.isArray(scans)) return [];

    const grouped = scans.reduce((acc, scan) => {
      const name = scan.checkpointName || "Unknown";
      if (!acc[name]) acc[name] = { name, inside: 0, exited: 0 };

      if (scan.status === "INSIDE") acc[name].inside++;
      else if (scan.status === "EXITED") acc[name].exited++;

      return acc;
    }, {});

    return Object.values(grouped);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">📊 Event Dashboard</h1>
        <span
          className={`text-sm font-semibold ${
            connected ? "text-green-400" : "text-red-400"
          }`}
        >
          {connected ? "🟢 Live" : "🔴 Offline"}
        </span>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Registered"
          value={stats.totalRegistered}
          color="from-blue-500 to-cyan-400"
        />
        <StatCard
          title="Registration Desk Checked In"
          value={stats.checkedIn}
          color="from-green-500 to-emerald-400"
        />
        <StatCard
          title="Registration Desk Exited"
          value={stats.exited}
          color="from-red-500 to-pink-400"
        />
        <StatCard
          title="Active Checkpoints"
          value={stats.activeCheckpoints}
          color="from-purple-500 to-indigo-400"
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-1 gap-6">
        <div className="bg-gray-900 p-4 rounded-2xl shadow-md">
          <h2 className="text-lg text-white font-semibold mb-2">
            Checkpoint Activity
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={checkpointActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Bar dataKey="inside" stackId="a" fill="#22c55e" name="Inside" />
              <Bar dataKey="exited" stackId="a" fill="#ef4444" name="Exited" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* 
        <div className="bg-gray-900 p-4 rounded-2xl shadow-md">
          <h2 className="text-lg text-white font-semibold mb-2">
            Participation Status
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div> */}
      </div>

      {/* Recent Scans */}
      <div className="bg-gray-900 p-4 rounded-2xl shadow-md">
        <h2 className="text-lg text-white font-semibold mb-4">Recent Scans</h2>
        <ul className="space-y-2 max-h-72 overflow-y-auto">
          {recentScans.length === 0 ? (
            <p className="text-gray-400 text-sm">No recent scans yet</p>
          ) : (
            recentScans.map((scan, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between bg-gray-800 p-3 rounded-xl text-sm text-gray-200"
              >
                <span className="font-semibold">{scan.participantName}</span>
                <span>{scan.checkpointName}</span>
                <span
                  className={`font-medium ${
                    scan.status === "INSIDE" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {scan.status}
                </span>
                <span className="text-gray-400">{scan.time}</span>
              </motion.li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`bg-gradient-to-br ${color} text-white p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center`}
    >
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </motion.div>
  );
}
