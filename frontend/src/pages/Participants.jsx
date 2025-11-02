import { useEffect, useState } from "react";

function Participants() {
  const [participants, setParticipants] = useState([]);
  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch participants on load
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/participants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch participants");
        const data = await res.json();
        setParticipants(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchParticipants();
  }, [token]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Participants List</h2>

      {participants.length === 0 ? (
        <p className="text-gray-500">No participants found.</p>
      ) : (
        <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Year</th>
              <th className="p-3 text-left">Branch</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.year || "-"}</td>
                <td className="p-3">{p.branch || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Participants;
