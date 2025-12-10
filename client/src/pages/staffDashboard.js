import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Clock, LogOut, Loader2, Users, CornerDownRight } from "lucide-react"; // Added LogOut and Loader2 icons
import { useNavigate } from "react-router-dom";

export default function StaffDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false); // New state for bulk loading
  const navigate = useNavigate();

  const staffProfile = JSON.parse(localStorage.getItem("staffProfile") || "null");
  const token = localStorage.getItem("staffToken");
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  // --- Utility Functions ---

  const getStaffSection = () => {
    if (!staffProfile) return "library";

    const role = staffProfile.role.toLowerCase();
    if (role.includes("department")) return "department";
    if (role.includes("library")) return "library";
    if (role.includes("dormitory")) return "dormitory";
    if (role.includes("finance")) return "finance";
    if (role.includes("registrar")) return "registrar";
    if (role.includes("cafeteria")) return "cafeteria";

    return "library";
  };

  const staffSection = getStaffSection(); // Calculate once

  const badgeClass = (status) => {
    if (status === "Cleared") return "text-green-800 bg-green-50 border border-green-300";
    if (status === "Rejected") return "text-red-800 bg-red-50 border border-red-300";
    return "text-yellow-800 bg-yellow-50 border border-yellow-300";
  };

  // --- Data & Auth Functions ---

  useEffect(() => {
    if (!token) {
      navigate("/staff-admin/login"); // Use correct route from your App.js
      return;
    }
    fetchStudents();
  }, [token, navigate]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/staff/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data.students || []);
    } catch (err) {
      console.error("Error fetching students:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("staffToken");
    localStorage.removeItem("staffProfile");
    navigate("/staff-admin/login");
  };

  // --- Update Functions ---

  const updateClearance = async (studentId, newStatus) => {
    try {
      setUpdatingId(studentId);
      await axios.put(
        `${API_BASE_URL}/api/staff/clear/${studentId}`,
        { section: staffSection, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Simple local state update instead of refetching for better UX
      setStudents(prev => 
        prev.map(s => 
          s._id === studentId 
            ? { ...s, clearance: { ...s.clearance, [staffSection]: newStatus } }
            : s
        )
      );

    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const bulkUpdate = async (newStatus) => {
    if (selectedIds.length === 0) return;
    setIsBulkUpdating(true);
    
    // Optimistic UI update (optional, but good for UX)
    const previousStudents = [...students]; 
    setStudents(prev => prev.map(s => {
        if (selectedIds.includes(s._id)) {
            return { ...s, clearance: { ...s.clearance, [staffSection]: newStatus } };
        }
        return s;
    }));

    try {
      await axios.put(
        `${API_BASE_URL}/api/staff/bulk-update`, 
        { ids: selectedIds, section: staffSection, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSelectedIds([]);
      // Success message is optional since the optimistic update worked
      
    } catch (err) {
      setStudents(previousStudents); // Revert on error
      alert(err.response?.data?.message || "Bulk update failed");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // --- Selection Functions ---

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map((s) => s._id));
    }
  };


  // --- Render Logic ---

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="ml-4 text-xl text-gray-700">Loading student data...</p>
        </div>
    );
  }

  // --- Main Component JSX ---
  return (
    <div className="max-w-7xl mx-auto p-8 bg-gray-50 min-h-screen">

      {/* HEADER: Title, Profile & Logout */}
      <div className="flex items-start justify-between border-b pb-6 mb-6 border-blue-200">
        <div>
          <h1 className="text-4xl font-extrabold text-blue-900 flex items-center">
            <Users className="mr-3 text-yellow-500" size={32} />
            {staffSection.charAt(0).toUpperCase() + staffSection.slice(1)} Clearance Portal
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Manage student sign-offs for the current batch.</p>
        </div>

        <div className="flex flex-col items-end">
            <div className="text-right p-3 bg-white rounded-lg shadow-md border border-gray-200">
                <div className="font-bold text-blue-900">{staffProfile?.fullName}</div>
                <div className="text-sm text-gray-700">{staffProfile?.role}</div>
                <div className="text-xs text-yellow-600 font-semibold">{staffProfile?.department}</div>
            </div>
            
            {/* LOGOUT BUTTON (NEW FEATURE) */}
            <button
                onClick={handleLogout}
                className="mt-3 flex items-center px-4 py-2 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 transition duration-150 shadow-lg"
            >
                <LogOut className="mr-2" size={16} /> Logout
            </button>
        </div>
      </div>

      {/* BULK ACTION BAR */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow flex items-center justify-between border-l-4 border-yellow-500">
        <p className="text-gray-700 font-medium flex items-center">
          <CornerDownRight className="mr-2 text-blue-600" size={20} />
          {selectedIds.length} student(s) selected for action.
        </p>
        <div className="flex gap-3">
            {isBulkUpdating && <span className="text-blue-600 flex items-center"><Loader2 className="animate-spin mr-2" size={18} /> Processing...</span>}

            <button
                disabled={selectedIds.length === 0 || isBulkUpdating}
                onClick={() => bulkUpdate("Cleared")}
                className="flex items-center px-5 py-2 bg-green-600 text-white rounded-full disabled:bg-green-300 hover:bg-green-700 transition shadow-md"
            >
                <CheckCircle className="mr-2" size={18} /> Clear All
            </button>

            <button
                disabled={selectedIds.length === 0 || isBulkUpdating}
                onClick={() => bulkUpdate("Rejected")}
                className="flex items-center px-5 py-2 bg-red-600 text-white rounded-full disabled:bg-red-300 hover:bg-red-700 transition shadow-md"
            >
                <XCircle className="mr-2" size={18} /> Reject All
            </button>
        </div>
      </div>

      {/* STUDENTS TABLE */}
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-900 text-white sticky top-0">
            <tr>
              <th className="w-12 px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={students.length > 0 && selectedIds.length === students.length}
                  onChange={toggleSelectAll}
                  className="rounded text-yellow-500 bg-gray-700 border-gray-600 focus:ring-yellow-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">ID Number</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Full Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {students.length === 0 ? (
                <tr>
                    <td colSpan="6" className="py-10 text-center text-gray-500 text-lg">
                        🎉 All caught up! No pending students for your section.
                    </td>
                </tr>
            ) : (
                students.map((s) => {
                  const currentStatus = s.clearance?.[staffSection] || "Pending";
                  const isSelected = selectedIds.includes(s._id);
                  const isDisabled = updatingId === s._id;

                  return (
                    <tr key={s._id} 
                        className={`hover:bg-blue-50 transition duration-100 ${isSelected ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''}`}
                    >
                      <td className="w-12 px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(s._id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      <td className="px-6 py-3 font-medium text-gray-800">{s.studentId}</td>
                      <td className="px-6 py-3 text-gray-700">{s.fullName}</td>
                      <td className="px-6 py-3 text-gray-700">{s.department}</td>

                      <td className="px-6 py-3 text-center">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${badgeClass(currentStatus)}`}>
                          {currentStatus === "Cleared" ? <CheckCircle size={16} /> :
                            currentStatus === "Rejected" ? <XCircle size={16} /> :
                            <Clock size={16} />}
                          {currentStatus}
                        </span>
                      </td>

                      <td className="px-6 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            disabled={isDisabled || currentStatus === "Cleared"}
                            onClick={() => updateClearance(s._id, "Cleared")}
                            className="flex items-center px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 disabled:bg-gray-300 transition"
                          >
                            {isDisabled ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} className="mr-1"/>}
                            {isDisabled ? "" : "Clear"}
                          </button>

                          <button
                            disabled={isDisabled || currentStatus === "Rejected"}
                            onClick={() => updateClearance(s._id, "Rejected")}
                            className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 disabled:bg-gray-300 transition"
                          >
                            {isDisabled ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} className="mr-1"/>}
                            {isDisabled ? "" : "Reject"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
