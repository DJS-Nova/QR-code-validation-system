import { useState, useEffect } from "react";

function Checkpoint() {
  const [checkpoints, setCheckpoints] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    type: "SINGLE",
  });
  const [editId, setEditId] = useState(null);
  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch checkpoints
const fetchCheckpoints = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/checkpoints`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // if backend says Forbidden
    if (res.status === 403) {
      setCheckpoints([]);               // prevent map() crash
      alert("Access denied: only Super Admins can view checkpoints.");
      return;
    }

    if (!res.ok) {
      console.error("Failed to fetch checkpoints");
      setCheckpoints([]);
      return;
    }

    const data = await res.json();
    setCheckpoints(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Error fetching checkpoints:", err);
    setCheckpoints([]);
  }
};

  useEffect(() => {
    console.log("Token being sent:", token);
    fetchCheckpoints();
  }, []);

  // Handle create or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `${API_BASE_URL}/checkpoints/${editId}`
      : `${API_BASE_URL}/checkpoints`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setFormData({ name: "", type: "SINGLE"});
      setEditId(null);
      fetchCheckpoints();
    }
  };

  // Handle edit
  const handleEdit = (checkpoint) => {
    setFormData({
      name: checkpoint.name,
      type: checkpoint.type,
    });
    setEditId(checkpoint.id);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    await fetch(`${API_BASE_URL}/checkpoints/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchCheckpoints();
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Manage Checkpoints</h2>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-lg shadow-md mb-6"
      >
        <div className="mb-3">
          <label className="block mb-1 font-semibold">Checkpoint Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1 font-semibold">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="SINGLE">Single Visit</option>
            <option value="MULTIPLE">Multiple Visit</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          {editId ? "Update Checkpoint" : "Create Checkpoint"}
        </button>
      </form>

      {/* Table */}
      <table className="w-full border-collapse bg-white shadow-md">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {checkpoints.map((cp) => (
            <tr key={cp.id} className="hover:bg-gray-50">
              <td className="p-2 border">{cp.name}</td>
              <td className="p-2 border">{cp.type}</td>
              <td className="p-2 border flex gap-2">
                <button
                  onClick={() => handleEdit(cp)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cp.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Checkpoint;
