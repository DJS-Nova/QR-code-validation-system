// import { useEffect, useState } from "react";

// function CheckpointParticipants() {
//   const [data, setData] = useState([]);
//   const token = localStorage.getItem("token");
//   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch(`${API_BASE_URL}/participants/with-checkpoints`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (!res.ok) throw new Error("Failed to fetch checkpoint data");
//         const result = await res.json();
//         setData(result);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchData();
//   }, []);

//   return (
//     <div className="p-4 max-w-5xl mx-auto">
//       <h2 className="text-3xl font-bold mb-6 text-center">Checkpoint Summary</h2>

//       {data.length === 0 ? (
//         <p className="text-gray-500 text-center">No data available.</p>
//       ) : (
//         data.map((cp) => (
//           <div key={cp.id} className="bg-white shadow-md rounded-xl p-5 mb-8">
//             <div className="flex justify-between items-center mb-3">
//               <h3 className="text-xl font-semibold text-blue-600">{cp.name}</h3>
//               <span className="px-3 py-1 text-sm bg-gray-100 rounded-full border">
//                 {cp.type}
//               </span>
//             </div>

//             {cp.visits.length === 0 ? (
//               <p className="text-gray-500">No participants yet.</p>
//             ) : (
//               <table className="w-full border-collapse bg-gray-50 rounded-md overflow-hidden">
//                 <thead className="bg-blue-500 text-white">
//                   <tr>
//                     <th className="p-2 text-left">Name</th>
//                     <th className="p-2 text-left">Branch</th>
//                     <th className="p-2 text-left">Year</th>
//                     <th className="p-2 text-left">Status</th>
//                     <th className="p-2 text-left">Last Scan</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {cp.visits.map((v) => (
//                     <tr key={v.id} className="border-b hover:bg-gray-100">
//                       <td className="p-2">{v.participant.name}</td>
//                       <td className="p-2">{v.participant.branch || "-"}</td>
//                       <td className="p-2">{v.participant.year || "-"}</td>
//                       <td
//                         className={`p-2 font-medium ${
//                           v.lastStatus === "INSIDE"
//                             ? "text-green-600"
//                             : v.lastStatus === "EXITED"
//                             ? "text-red-600"
//                             : "text-gray-500"
//                         }`}
//                       >
//                         {v.lastStatus}
//                       </td>
//                       <td className="p-2">
//                         {v.lastScanTime
//                           ? new Date(v.lastScanTime).toLocaleString()
//                           : "-"}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   );
// }

// export default CheckpointParticipants;


// src/components/CheckpointParticipants.jsx
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import socket from "../socket";

function CheckpointParticipants() {
  const [data, setData] = useState([]);
  // const [images, setImages] = useState({}); // map participantId -> photoUrl
  const socketRef = useRef(null);

  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // initial fetch
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/participants/with-checkpoints`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch checkpoint data");
        const result = await res.json();
        if (!mounted) return;

        // build initial images map if participants include photoUrl
        // const imgMap = {};
        // result.forEach((cp) =>
        //   cp.visits.forEach((v) => {
        //     if (v.participant?.photoUrl) imgMap[v.participant.id] = v.participant.photoUrl;
        //   })
        // );

        console.log(result);
        

        setData(result);
        // setImages(imgMap);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, [API_BASE_URL, token]);

  // socket setup
  useEffect(() => {
    if (!API_BASE_URL || !token) return;


    // scan:updated => patch the data state to reflect the latest visit and participant info
    socket.on("participant:updated", (data) => {
     console.log(data,"participant:updated")
     setData(data)
    });

    // separate image-only event (optional)
    // socket.on("scan:image:updated", ({ participantId, photoUrl }) => {
    //   if (!participantId || !photoUrl) return;
    //   setImages((prev) => ({ ...prev, [participantId]: photoUrl }));
    // });

    // live-count:updated (if you want to merge recent list into UI)


    socket.on("disconnect", () => {
      optional: console.log("Socket disconnected");
    });

    return () => {
      socket.off("participant:updated");
      socket.off("disconnect");
      socketRef.current = null;
    };
  }, [API_BASE_URL, token]);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Checkpoint Summary</h2>

      {data.length === 0 ? (
        <p className="text-gray-500 text-center">No data available.</p>
      ) : (
        data.map((cp) => (
          <div key={cp.id} className="bg-white shadow-md rounded-xl p-5 mb-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold text-blue-600">{cp.name}</h3>
              <span className="px-3 py-1 text-sm bg-gray-100 rounded-full border">
                {cp.type}
              </span>
            </div>

            {cp.visits.length === 0 ? (
              <p className="text-gray-500">No participants yet.</p>
            ) : (
              <table className="w-full border-collapse bg-gray-50 rounded-md overflow-hidden">
                <thead className="bg-blue-500 text-white">
                  <tr>
                    <th className="p-2 text-left">Photo</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Branch</th>
                    <th className="p-2 text-left">Year</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Last Scan</th>
                  </tr>
                </thead>
                <tbody>
                  {cp.visits.map((v) => {
                    const pid = v.participant?.id || v.participantId || "unknown";
                    // const imgSrc = images[pid] || v.participant?.photoUrl || "/default-avatar.png";
                    return (
                      <tr key={v.id} className="border-b hover:bg-gray-100">
                        {/* <td className="p-2">
                          <img
                            src={imgSrc}
                            alt={v.participant?.name || "participant"}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/default-avatar.png";
                            }}
                          />
                        </td> */}
                        <td className="p-2">{v.participant?.name}</td>
                        <td className="p-2">{v.participant?.branch || "-"}</td>
                        <td className="p-2">{v.participant?.year || "-"}</td>
                        <td
                          className={`p-2 font-medium ${
                            v.lastStatus === "INSIDE"
                              ? "text-green-600"
                              : v.lastStatus === "EXITED"
                              ? "text-red-600"
                              : "text-gray-500"
                          }`}
                        >
                          {v.lastStatus}
                        </td>
                        <td className="p-2">
                          {v.lastScanTime
                            ? new Date(v.lastScanTime).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default CheckpointParticipants;
