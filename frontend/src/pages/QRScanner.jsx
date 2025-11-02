// import { useEffect, useState } from "react";
// import { Scanner } from "@yudiel/react-qr-scanner";

// const QRScanner = () => {
//   const [checkpoints, setCheckpoints] = useState([]);
//   const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [token, setToken] = useState("");
//   const [scanning, setScanning] = useState(false);
//   const [resultMessage, setResultMessage] = useState("");

//   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
//   const authToken = localStorage.getItem("token");

//   // Fetch checkpoints
//   useEffect(() => {
//     fetch(`${API_BASE_URL}/checkpoints`, {
//       headers: { Authorization: `Bearer ${authToken}` },
//     })
//       .then(res => res.json())
//       .then(data => setCheckpoints(data))
//       .catch(err => console.error("Failed to load checkpoints:", err));
//   }, []);

//   const handleScan = (result) => {
//     if (result && result[0]) {
//       const qrText = result[0].rawValue;
//       const parts = qrText.split("/");
//       const qrToken = parts[parts.length - 1];
//       setToken(qrToken);
//       setScanning(false);
//     }
//   };

//   const handleValidate = async (action) => {
//     if (!token || !selectedCheckpoint) return alert("Missing data");

//     try {
//       const res = await fetch(`${API_BASE_URL}/scan`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${authToken}`,
//         },
//         body: JSON.stringify({
//           token,
//           checkpointId: selectedCheckpoint.id,
//           action,
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Error validating scan");

//       setResultMessage(
//         `✅ ${data.message}. Active participants: ${data.activeCount}`
//       );
//       setToken("");
//     } catch (err) {
//       console.error(err);
//       setResultMessage(`❌ ${err.message}`);
//     }
//   };

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h1 className="text-3xl font-bold mb-6 text-center">📍 Checkpoints</h1>

//       {/* Checkpoint Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         {checkpoints.map((cp) => (
//           <div
//             key={cp.id}
//             onClick={() => {
//               setSelectedCheckpoint(cp);
//               setShowModal(true);
//               setResultMessage("");
//               setToken("");
//             }}
//             className="p-5 bg-white rounded-xl shadow-md hover:shadow-xl cursor-pointer transition-transform transform hover:-translate-y-1"
//           >
//             <h2 className="text-xl font-semibold">{cp.name}</h2>
//             <p className="text-gray-600">{cp.type}</p>
//           </div>
//         ))}
//       </div>

//       {/* Modal */}
//       {showModal && selectedCheckpoint && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
//             <button
//               onClick={() => setShowModal(false)}
//               className="absolute top-3 right-4 text-gray-500 hover:text-red-600"
//             >
//               ✖
//             </button>

//             <h2 className="text-2xl font-bold mb-4 text-center text-indigo-600">
//               {selectedCheckpoint.name}
//             </h2>

//             {/* Scanner */}
//             {scanning ? (
//               <div className="mb-4">
//                 <Scanner
//                   onScan={handleScan}
//                   onError={() => setScanning(false)}
//                   styles={{ container: { width: "100%" } }}
//                 />
//               </div>
//             ) : (
//               <button
//                 onClick={() => setScanning(true)}
//                 className="bg-green-500 text-white py-2 px-4 rounded w-full mb-4"
//               >
//                 📷 Open Camera
//               </button>
//             )}

//             {/* Manual Input */}
//             <input
//               type="text"
//               value={token}
//               onChange={(e) => setToken(e.target.value)}
//               placeholder="Enter Token Manually"
//               className="w-full p-2 border rounded mb-4"
//             />

//             {/* Buttons */}
//             <div className="flex gap-3">
//               <button
//                 onClick={() => handleValidate("entry")}
//                 className="bg-blue-500 text-white px-4 py-2 rounded w-full"
//               >
//                 Validate Entry
//               </button>
//               <button
//                 onClick={() => handleValidate("exit")}
//                 className="bg-red-500 text-white px-4 py-2 rounded w-full"
//               >
//                 Validate Exit
//               </button>
//             </div>

//             {/* Result */}
//             {resultMessage && (
//               <div className="mt-4 text-center font-semibold">
//                 {resultMessage}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default QRScanner;


import { useEffect, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import socket from "../socket";

const QRScanner = () => {
  const [checkpoints, setCheckpoints] = useState([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [token, setToken] = useState("");
  const [scanning, setScanning] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [participantStatus, setParticipantStatus] = useState(null); // INSIDE / EXITED / NOT_VISITED

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const authToken = localStorage.getItem("token");

  // ✅ Fetch checkpoints
  const fetchCheckpoints = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/checkpoints`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      setCheckpoints(data);
    } catch (err) {
      console.error("Failed to load checkpoints:", err);
    }
  };

  useEffect(() => {
    fetchCheckpoints();

    // Listen to real-time checkpoint updates
    socket.on("checkpoints:updated", (updatedCheckpoints) => {
      setCheckpoints(Array.isArray(updatedCheckpoints) ? updatedCheckpoints : []);
    });

    // Cleanup
    return () => {
      socket.off("checkpoints:updated");
    };
  }, [authToken, API_BASE_URL]);

  // ✅ Check participant status once valid token entered or scanned
  useEffect(() => {
    const fetchStatus = async () => {
      if (token.length < 5 || !selectedCheckpoint) return;

      try {
        const res = await fetch(
          `${API_BASE_URL}/participant-status/${token}/${selectedCheckpoint.id}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Status fetch failed");

        setParticipantStatus(data.status);
      } catch (err) {
        console.error("Status check failed:", err);
        setParticipantStatus(null);
      }
    };

    fetchStatus();
  }, [token, selectedCheckpoint]);

  // ✅ Handle QR Scan
  const handleScan = (result) => {
    if (result && result[0]) {
      const qrText = result[0].rawValue;
      const parts = qrText.split("/");
      const qrToken = parts[parts.length - 1];
      setToken(qrToken);
      setScanning(false);
    }
  };

  // ✅ Validate entry or exit
  const handleValidate = async (action) => {
    if (!token || !selectedCheckpoint) return alert("Missing data");

    try {
      const res = await fetch(`${API_BASE_URL}/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          token,
          checkpointId: selectedCheckpoint.id,
          action,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error validating scan");

      setResultMessage(
        `✅ ${data.message}. Active participants: ${data.activeCount}`
      );
      setParticipantStatus(
        action === "entry" ? "INSIDE" : "EXITED"
      );
      setToken("");
    } catch (err) {
      console.error(err);
      setResultMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">📍 Checkpoints</h1>

      {/* Checkpoint Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {checkpoints.map((cp) => (
          <div
            key={cp.id}
            onClick={() => {
              setSelectedCheckpoint(cp);
              setShowModal(true);
              setResultMessage("");
              setToken("");
              setParticipantStatus(null);
            }}
            className="p-5 bg-white rounded-xl shadow-md hover:shadow-xl cursor-pointer transition-transform transform hover:-translate-y-1"
          >
            <h2 className="text-xl font-semibold">{cp.name}</h2>
            <p className="text-gray-600">{cp.type}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && selectedCheckpoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-gray-500 hover:text-red-600"
            >
              ✖
            </button>

            <h2 className="text-2xl font-bold mb-4 text-center text-indigo-600">
              {selectedCheckpoint.name}
            </h2>

            {/* Scanner */}
            {scanning ? (
              <div className="mb-4">
                <Scanner
                  onScan={handleScan}
                  onError={() => setScanning(false)}
                  styles={{ container: { width: "100%" } }}
                />
              </div>
            ) : (
              <button
                onClick={() => setScanning(true)}
                className="bg-green-500 text-white py-2 px-4 rounded w-full mb-4"
              >
                📷 Open Camera
              </button>
            )}

            {/* Manual Input */}
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter Token Manually"
              className="w-full p-2 border rounded mb-4"
            />

            {/* Conditional Buttons */}
            {token.length >= 5 && participantStatus && (
              <div className="flex gap-3">
                {participantStatus !== "INSIDE" && (
                  <button
                    onClick={() => handleValidate("entry")}
                    className="bg-blue-500 text-white px-4 py-2 rounded w-full"
                  >
                    Validate Entry
                  </button>
                )}
                {participantStatus === "INSIDE" && (
                  <button
                    onClick={() => handleValidate("exit")}
                    className="bg-red-500 text-white px-4 py-2 rounded w-full"
                  >
                    Validate Exit
                  </button>
                )}
              </div>
            )}

            {/* Result Message */}
            {resultMessage && (
              <div className="mt-4 text-center font-semibold">
                {resultMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
