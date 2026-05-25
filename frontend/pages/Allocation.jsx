import React, { useCallback, useEffect, useRef, useState } from "react";
import allocationService from "../features/allocation/allocationService";
import { get } from "../api/api";

function unwrap(res) {
  if (res == null) return null;
  if (typeof res === "object" && "data" in res && "success" in res) {
    return res.data ?? null;
  }
  return res;
}

export default function Allocation() {
  const [allocations, setAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [formData, setFormData] = useState({
    studentId: "",
    roomId: "",
    assignedOn: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const reqIdRef = useRef(0);

  const loadData = useCallback(async () => {
    const myId = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const [allocResult, studentsRes, roomsRes] = await Promise.all([
        allocationService.list({ size: 200 }),
        get("/students?size=200"),
        get("/rooms?size=200"),
      ]);
      if (myId !== reqIdRef.current) return;

      setAllocations(allocResult.items || []);

      // Students response: may be envelope { success, data: { content } } or already unwrapped page
      const studentsPage = unwrap(studentsRes);
      setStudents(
        Array.isArray(studentsPage?.content)
          ? studentsPage.content
          : Array.isArray(studentsPage)
            ? studentsPage
            : []
      );

      // Rooms response: same pattern
      const roomsPage = unwrap(roomsRes);
      setRooms(
        Array.isArray(roomsPage?.content)
          ? roomsPage.content
          : Array.isArray(roomsPage)
            ? roomsPage
            : []
      );
    } catch (err) {
      if (myId !== reqIdRef.current) return;
      setError(err?.message || "Failed to load data.");
    } finally {
      if (myId === reqIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshAllocations = useCallback(async () => {
    try {
      const result = await allocationService.list({ size: 200 });
      setAllocations(result.items || []);
    } catch (err) {
      setError(err?.message || "Failed to refresh allocations.");
    }
  }, []);

  const handleAddAllocation = () => {
    setEditingAllocation(null);
    setFormData({
      studentId: "",
      roomId: "",
      assignedOn: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setShowForm(true);
  };

  const handleEditAllocation = (allocation) => {
    setEditingAllocation(allocation);
    setFormData({
      studentId: String(allocation.studentId || ""),
      roomId: String(allocation.roomId || ""),
      assignedOn: allocation.assignedOn || new Date().toISOString().split("T")[0],
      notes: allocation.notes || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      studentId: Number(formData.studentId),
      roomId: Number(formData.roomId),
      assignedOn: formData.assignedOn,
      notes: formData.notes,
    };
    try {
      if (editingAllocation) {
        await allocationService.update(editingAllocation.id, payload);
      } else {
        await allocationService.create(payload);
      }
      setShowForm(false);
      setEditingAllocation(null);
      await refreshAllocations();
    } catch (err) {
      setError(err?.message || "Failed to save allocation.");
    }
  };

  const handleDeleteAllocation = async (id) => {
    if (!window.confirm("Are you sure you want to remove this allocation?")) {
      return;
    }
    try {
      await allocationService.remove(id);
      await refreshAllocations();
    } catch (err) {
      setError(err?.message || "Failed to delete allocation.");
    }
  };

  // Derive course from selected student
  const selectedStudent = students.find(
    (s) => String(s.id) === String(formData.studentId)
  );
  const derivedCourse = selectedStudent?.course || "";

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>
              Room Allocation
            </h1>
            <p className="mt-2" style={{ color: "var(--muted)" }}>
              Loading allocation data...
            </p>
          </div>
        </div>
        <div
          className="rounded-xl shadow-sm border p-12 text-center"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--accent)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              width: 32,
              height: 32,
              border: "3px solid var(--muted)",
              borderTopColor: "var(--accent)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p className="mt-4 text-sm" style={{ color: "var(--muted)" }}>
            Loading allocations...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Error state
  if (error && allocations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>
              Room Allocation
            </h1>
            <p className="mt-2" style={{ color: "var(--muted)" }}>
              Manage student room assignments and allocation history.
            </p>
          </div>
        </div>
        <div
          className="rounded-xl shadow-sm border p-8 text-center"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--accent)",
          }}
        >
          <div className="text-4xl mb-4">&#9888;&#65039;</div>
          <h3 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
            Could not load allocations
          </h3>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            {error}
          </p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 rounded-lg text-white font-medium transition-colors"
            style={{ backgroundColor: "var(--accent)" }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>
            Room Allocation
          </h1>
          <p className="mt-2" style={{ color: "var(--muted)" }}>
            Manage student room assignments and allocation history.
          </p>
        </div>
        <button
          onClick={handleAddAllocation}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Allocate Room
        </button>
      </div>

      {error && (
        <div
          className="rounded-lg p-3 text-sm"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          }}
        >
          {error}
        </div>
      )}

      <div
        className="rounded-xl shadow-sm border overflow-hidden"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--accent)",
        }}
      >
        <div
          className="px-6 py-4 border-b"
          style={{
            borderColor: "var(--accent)",
            backgroundColor: "var(--background)",
          }}
        >
          <h3 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
            Current Allocations
          </h3>
        </div>

        {allocations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">&#128203;</div>
            <h3
              className="text-lg font-semibold"
              style={{ color: "var(--text)" }}
            >
              No allocations yet
            </h3>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              Click "Allocate Room" to assign a student to a room.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: "var(--background)" }}>
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--muted)" }}
                  >
                    Student
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--muted)" }}
                  >
                    Room
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--muted)" }}
                  >
                    Course
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--muted)" }}
                  >
                    Assigned On
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--muted)" }}
                  >
                    Notes
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--muted)" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: "var(--surface)" }}>
                {allocations.map((allocation) => (
                  <tr
                    key={allocation.id}
                    className="hover:shadow-md"
                    style={{ borderBottom: "1px solid var(--accent)" }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
                          {(allocation.studentName || "?")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div
                          className="text-sm font-medium"
                          style={{ color: "var(--text)" }}
                        >
                          {allocation.studentName || "Unknown"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Room {allocation.roomNumber || "N/A"}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm"
                      style={{ color: "var(--text)" }}
                    >
                      {allocation.course || "-"}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm"
                      style={{ color: "var(--muted)" }}
                    >
                      {allocation.assignedOn || "-"}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm"
                      style={{ color: "var(--muted)" }}
                    >
                      {allocation.notes || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditAllocation(allocation)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAllocation(allocation.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-xl shadow-xl max-w-md w-full"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--accent)",
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: "var(--text)" }}
                >
                  {editingAllocation ? "Edit Allocation" : "Allocate Room"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="transition-colors"
                  style={{ color: "var(--muted)" }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text)" }}
                  >
                    Student
                  </label>
                  <select
                    value={formData.studentId}
                    onChange={(e) =>
                      setFormData({ ...formData, studentId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: "var(--background)",
                      color: "var(--text)",
                      border: "1px solid var(--accent)",
                    }}
                    required
                  >
                    <option value="">Select student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>
                {derivedCourse && (
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: "var(--text)" }}
                    >
                      Course
                    </label>
                    <p
                      className="text-sm px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: "var(--background)",
                        color: "var(--muted)",
                        border: "1px solid var(--accent)",
                      }}
                    >
                      {derivedCourse}
                    </p>
                  </div>
                )}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text)" }}
                  >
                    Room
                  </label>
                  <select
                    value={formData.roomId}
                    onChange={(e) =>
                      setFormData({ ...formData, roomId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: "var(--background)",
                      color: "var(--text)",
                      border: "1px solid var(--accent)",
                    }}
                    required
                  >
                    <option value="">Select room</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.roomNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text)" }}
                  >
                    Assignment Date
                  </label>
                  <input
                    type="date"
                    value={formData.assignedOn}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedOn: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: "var(--background)",
                      color: "var(--text)",
                      border: "1px solid var(--accent)",
                    }}
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text)" }}
                  >
                    Notes (optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: "var(--background)",
                      color: "var(--text)",
                      border: "1px solid var(--accent)",
                    }}
                    rows={3}
                    placeholder="Any additional notes..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                    style={{
                      backgroundColor: "var(--background)",
                      color: "var(--text)",
                      border: "1px solid var(--accent)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    {editingAllocation ? "Update" : "Allocate"} Room
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
