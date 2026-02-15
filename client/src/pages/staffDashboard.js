import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  LogOut, 
  Loader2, 
  Users, 
  CornerDownRight, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield,
  Building,
  Save,
  ChevronDown,
  Settings,
  Key,
  UserCircle,
  AlertCircle,
  Info,
  Search,
  Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StaffDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "Pending", "Cleared", "Rejected"
  
  // Reject reason states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectMode, setRejectMode] = useState("single");
  const [targetStudentId, setTargetStudentId] = useState(null);
  const [rejectReasonLoading, setRejectReasonLoading] = useState(false);
  
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const staffProfile = JSON.parse(localStorage.getItem("staffProfile") || "null");
  const token = localStorage.getItem("staffToken");
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const staffSection = getStaffSection();

  const getSectionColor = () => {
    const colors = {
      library: "bg-purple-100 text-purple-800",
      department: "bg-blue-100 text-blue-800",
      dormitory: "bg-green-100 text-green-800",
      finance: "bg-yellow-100 text-yellow-800",
      registrar: "bg-indigo-100 text-indigo-800",
      cafeteria: "bg-orange-100 text-orange-800"
    };
    return colors[staffSection] || colors.library;
  };

  const badgeClass = (status) => {
    if (status === "Cleared") return "text-emerald-700 bg-emerald-50 border border-emerald-200";
    if (status === "Rejected") return "text-rose-700 bg-rose-50 border border-rose-200";
    return "text-amber-700 bg-amber-50 border border-amber-200";
  };

  // Highlight search terms
  const highlightText = (text, search) => {
    if (!search || !text) return text;
    try {
      const parts = text.split(new RegExp(`(${search})`, 'gi'));
      return parts.map((part, index) => 
        part.toLowerCase() === search.toLowerCase() 
          ? <span key={index} className="bg-yellow-200 font-semibold px-1 rounded">{part}</span>
          : part
      );
    } catch (e) {
      return text;
    }
  };

  // Filter students based on search term and status filter
  const filteredStudents = students.filter(student => {
    // First apply status filter
    if (statusFilter !== "all") {
      const currentStatus = student.clearance?.[staffSection] || "Pending";
      if (currentStatus !== statusFilter) return false;
    }
    
    // Then apply search term if exists
    if (!searchTerm.trim()) return true;
    
    const term = searchTerm.toLowerCase().trim();
    return (
      student.studentId?.toLowerCase().includes(term) ||
      student.fullName?.toLowerCase().includes(term) ||
      student.department?.toLowerCase().includes(term)
    );
  });

  // --- Data & Auth Functions ---

  useEffect(() => {
    if (!token) {
      navigate("/staff-admin/login");
      return;
    }
    fetchStudents();
    
    if (staffProfile) {
      setProfileData(prev => ({
        ...prev,
        fullName: staffProfile.name || staffProfile.fullName || "",
        email: staffProfile.email || ""
      }));
    }
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

  // --- Profile Dropdown Functions ---

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
    setShowProfileDropdown(false);
  };

  // --- Profile Modal Functions ---

  const openProfileModal = () => {
    setShowProfileModal(true);
    setProfileErrors({});
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setProfileData(prev => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }));
    setProfileErrors({});
  };

  const validateProfileForm = () => {
    const errors = {};
    
    if (!profileData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }
    
    if (!profileData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (profileData.currentPassword || profileData.newPassword || profileData.confirmPassword) {
      if (!profileData.currentPassword) {
        errors.currentPassword = "Current password is required";
      }
      
      if (profileData.newPassword && profileData.newPassword.length < 6) {
        errors.newPassword = "Password must be at least 6 characters";
      }
      
      if (profileData.newPassword !== profileData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileUpdate = async () => {
    if (!validateProfileForm()) {
      return;
    }

    setProfileLoading(true);
    
    try {
      const updateData = {
        fullName: profileData.fullName,
        email: profileData.email
      };
      
      if (profileData.currentPassword) {
        updateData.currentPassword = profileData.currentPassword;
        updateData.newPassword = profileData.newPassword;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/staff/profile`,
        updateData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const updatedProfile = {
          ...staffProfile,
          fullName: response.data.data.name || response.data.data.fullName,
          email: response.data.data.email,
          role: response.data.data.role,
          department: response.data.data.department
        };
        localStorage.setItem("staffProfile", JSON.stringify(updatedProfile));

        setProfileData(prev => ({
          ...prev,
          fullName: response.data.data.fullName || response.data.data.name,
          email: response.data.data.email
        }));

        alert(response.data.message || "Profile updated successfully!");
        closeProfileModal();
      } else {
        alert(response.data.message || "Failed to update profile");
      }
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error || 
                      "Failed to update profile";
      alert(errorMsg);
      console.error("Profile update error:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  // --- Update Functions ---

  const updateClearance = async (studentId, newStatus, reason = "") => {
    try {
      setUpdatingId(studentId);
      const response = await axios.put(
        `${API_BASE_URL}/api/staff/clear/${studentId}`,
        { 
          section: staffSection, 
          status: newStatus, 
          reason: newStatus === "Rejected" ? reason : "" 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStudents(prev => 
        prev.map(s => 
          s._id === studentId 
            ? { 
                ...s, 
                clearance: { ...s.clearance, [staffSection]: newStatus },
                clearanceReasons: {
                  ...(s.clearanceReasons || {}),
                  [staffSection]: newStatus === "Rejected" ? reason : ""
                }
              }
            : s
        )
      );

    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const bulkUpdate = async (newStatus, reason = "") => {
    if (selectedIds.length === 0) return;
    setIsBulkUpdating(true);
    
    const previousStudents = [...students]; 
    
    setStudents(prev => prev.map(s => {
      if (selectedIds.includes(s._id)) {
        return { 
          ...s, 
          clearance: { ...s.clearance, [staffSection]: newStatus },
          clearanceReasons: {
            ...(s.clearanceReasons || {}),
            [staffSection]: newStatus === "Rejected" ? reason : ""
          }
        };
      }
      return s;
    }));

    try {
      await axios.put(
        `${API_BASE_URL}/api/staff/bulk-update`, 
        { 
          ids: selectedIds, 
          section: staffSection, 
          status: newStatus,
          reason: newStatus === "Rejected" ? reason : ""
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSelectedIds([]);
      
    } catch (err) {
      setStudents(previousStudents);
      alert(err.response?.data?.message || "Bulk update failed");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // --- Rejection Functions ---

  const openRejectModal = (mode, studentId = null) => {
    setRejectMode(mode);
    setTargetStudentId(studentId);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason("");
    setTargetStudentId(null);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setRejectReasonLoading(true);
    
    try {
      if (rejectMode === "single" && targetStudentId) {
        await updateClearance(targetStudentId, "Rejected", rejectReason);
      } else if (rejectMode === "bulk") {
        await bulkUpdate("Rejected", rejectReason);
      }
      closeRejectModal();
    } catch (error) {
      console.error("Rejection failed:", error);
    } finally {
      setRejectReasonLoading(false);
    }
  };

  // --- Selection Functions ---

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s._id));
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="animate-spin text-blue-600 mx-auto" size={56} />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-xl opacity-20 animate-pulse"></div>
          </div>
          <p className="mt-6 text-lg text-gray-600 font-medium">Loading student dashboard...</p>
          <p className="text-sm text-gray-500">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6">
            <div className="mb-6 sm:mb-0">
              <div className="flex items-center">
                <div className={`p-3 rounded-xl ${getSectionColor()} shadow-sm`}>
                  <Users className="h-7 w-7" />
                </div>
                <div className="ml-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {staffSection.charAt(0).toUpperCase() + staffSection.slice(1)} Portal
                  </h1>
                  <p className="mt-2 text-lg font-medium text-gray-700">
                    Welcome <span className="text-indigo-600 font-semibold">
                      {staffProfile?.fullName || staffProfile?.name}
                    </span> 👋
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleProfileDropdown}
                className="flex items-center space-x-3 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl border border-blue-100 transition-all duration-200 shadow-sm hover:shadow"
              >
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{staffProfile?.fullName || staffProfile?.name}</div>
                  <div className="text-sm text-gray-600">{staffProfile?.role}</div>
                </div>
                <div className={`p-2 rounded-lg ${getSectionColor()}`}>
                  <UserCircle className="h-5 w-5" />
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform ${
                    showProfileDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 transform transition-all duration-200 ease-out animate-in fade-in slide-in-from-top-2">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg">
                        {staffProfile?.fullName?.charAt(0) || staffProfile?.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-base">{staffProfile?.fullName || staffProfile?.name}</div>
                        <div className="text-sm text-gray-500">{staffProfile?.email}</div>
                        <div
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getSectionColor()}`}
                        >
                          <Building className="h-3 w-3 mr-1" />
                          {staffProfile?.department || staffProfile?.role}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center w-full px-5 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150 rounded-lg"
                    >
                      <Key className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500" />
                      Change profile
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-5 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-all duration-150 rounded-lg"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-rose-400 group-hover:text-rose-600" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-white to-blue-50 rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{students.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-white to-emerald-50 rounded-xl p-6 shadow-sm border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Selected</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{selectedIds.length}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-white to-amber-50 rounded-xl p-6 shadow-sm border border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Actions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {students.filter(s => (s.clearance?.[staffSection] || "Pending") === "Pending").length}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Search and Filter Students</h3>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, ID, or department..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <XCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              {/* Status Filter Dropdown */}
              <div className="md:w-64">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Cleared">Cleared</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || statusFilter !== "all") && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-3 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 flex items-center justify-center"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Clear Filters
                </button>
              )}
            </div>

            {/* Filter and Search Summary */}
            {(searchTerm || statusFilter !== "all") && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {statusFilter !== "all" && (
                      <span className="inline-flex items-center mr-3">
                        <span className="font-medium">Status:</span>
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusFilter === "Cleared" ? "bg-emerald-100 text-emerald-700" :
                          statusFilter === "Rejected" ? "bg-rose-100 text-rose-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {statusFilter}
                        </span>
                      </span>
                    )}
                    {searchTerm && (
                      <span>
                        <span className="font-medium">Search:</span> "{searchTerm}"
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    Found <span className="font-semibold text-blue-600">{filteredStudents.length}</span> student{filteredStudents.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions Panel */}
        {selectedIds.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-lg border border-blue-200 transform transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="mb-4 sm:mb-0">
                <div className="flex items-center">
                  <CornerDownRight className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedIds.length} student{selectedIds.length !== 1 ? 's' : ''} selected
                  </h3>
                </div>
                <p className="text-gray-600 mt-1">Apply action to all selected students</p>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                {isBulkUpdating ? (
                  <div className="flex items-center px-4 py-2.5 bg-blue-100 rounded-lg">
                    <Loader2 className="animate-spin h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-blue-700 font-medium">Processing...</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => bulkUpdate("Cleared")}
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Clear Selected
                    </button>
                    <button
                      onClick={() => openRejectModal("bulk")}
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-medium rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Selected
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Students Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Student Clearance Requests</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Showing {filteredStudents.length} of {students.length} student{students.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="w-12 px-6 py-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filteredStudents.length > 0 && selectedIds.length === filteredStudents.length}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-4">
                          {searchTerm || statusFilter !== "all" ? (
                            <Search className="h-8 w-8 text-gray-400" />
                          ) : (
                            <CheckCircle className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {searchTerm || statusFilter !== "all" ? 'No matching students found' : 'All caught up!'}
                        </h3>
                        <p className="text-gray-600">
                          {searchTerm || statusFilter !== "all" 
                            ? 'Try adjusting your search or filter criteria.'
                            : 'No pending clearance requests at the moment.'}
                        </p>
                        {(searchTerm || statusFilter !== "all") && (
                          <button
                            onClick={clearFilters}
                            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Clear All Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const currentStatus = s.clearance?.[staffSection] || "Pending";
                    const isSelected = selectedIds.includes(s._id);
                    const isDisabled = updatingId === s._id;
                    const rejectionReason = s.clearanceReasons?.[staffSection];

                    return (
                      <tr 
                        key={s._id} 
                        className={`transition-all duration-200 hover:bg-blue-50 ${isSelected ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(s._id)}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 font-mono">
                            {searchTerm ? highlightText(s.studentId, searchTerm) : s.studentId}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {searchTerm ? highlightText(s.fullName, searchTerm) : s.fullName}
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {searchTerm ? highlightText(s.department, searchTerm) : s.department}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${badgeClass(currentStatus)}`}>
                              {currentStatus === "Cleared" ? <CheckCircle className="h-4 w-4 mr-1.5" /> :
                               currentStatus === "Rejected" ? <XCircle className="h-4 w-4 mr-1.5" /> :
                               <Clock className="h-4 w-4 mr-1.5" />}
                              {currentStatus}
                            </span>
                            {currentStatus === "Rejected" && rejectionReason && (
                              <div className="flex items-start text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
                                <Info className="h-3 w-3 mr-1.5 mt-0.5 flex-shrink-0" />
                                <span className="font-medium">Reason:</span>
                                <span className="ml-1">{rejectionReason}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              disabled={isDisabled || currentStatus === "Cleared"}
                              onClick={() => updateClearance(s._id, "Cleared")}
                              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isDisabled || currentStatus === "Cleared" 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-sm hover:shadow'
                              }`}
                            >
                              {isDisabled ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1.5" />
                                  Clear
                                </>
                              )}
                            </button>
                            <button
                              disabled={isDisabled || currentStatus === "Rejected"}
                              onClick={() => openRejectModal("single", s._id)}
                              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isDisabled || currentStatus === "Rejected" 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 shadow-sm hover:shadow'
                              }`}
                            >
                              {isDisabled ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-1.5" />
                                  Reject
                                </>
                              )}
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
      </div>

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm" 
              onClick={closeRejectModal}
            />

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="absolute top-4 right-4">
                <button
                  onClick={closeRejectModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={rejectReasonLoading}
                >
                  <XCircle className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                    <XCircle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {rejectMode === "single" ? "Reject Student" : "Reject Selected Students"}
                    </h3>
                    <p className="text-rose-100 mt-1">
                      {rejectMode === "single" 
                        ? "Please provide a reason for rejection" 
                        : `Please provide a reason for rejecting ${selectedIds.length} student${selectedIds.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <span className="font-semibold text-rose-600">Rejection Reason *</span>
                    <span className="text-gray-500 text-sm ml-2">
                      This will be visible to the student
                    </span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200"
                    rows={4}
                    placeholder="Enter detailed reason for rejection..."
                    disabled={rejectReasonLoading}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Be specific and clear about why the clearance is being rejected.
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={closeRejectModal}
                      disabled={rejectReasonLoading}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRejectSubmit}
                      disabled={rejectReasonLoading || !rejectReason.trim()}
                      className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-medium rounded-lg hover:from-rose-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {rejectReasonLoading ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Confirm Rejection
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm" 
              onClick={closeProfileModal}
            />

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="absolute top-4 right-4">
                <button
                  onClick={closeProfileModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Account Settings</h3>
                    <p className="text-blue-100 mt-1">Update your personal information and security</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6">
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-500" />
                    Personal Information
                  </h4>
                  
                  <div className="space-y-4">

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Mail className="h-4 w-4 mr-1.5 text-gray-500" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => {
                          setProfileData({ ...profileData, email: e.target.value });
                          setProfileErrors({ ...profileErrors, email: "" });
                        }}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          profileErrors.email ? 'border-rose-500' : 'border-gray-300'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        placeholder="Enter your email"
                      />
                      {profileErrors.email && (
                        <p className="mt-2 text-sm text-rose-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {profileErrors.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-500" />
                    Security Settings
                  </h4>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Leave blank if you don't want to change your password
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={profileData.currentPassword}
                          onChange={(e) => {
                            setProfileData({ ...profileData, currentPassword: e.target.value });
                            setProfileErrors({ ...profileErrors, currentPassword: "" });
                          }}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            profileErrors.currentPassword ? 'border-rose-500' : 'border-gray-300'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10`}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {profileErrors.currentPassword && (
                        <p className="mt-2 text-sm text-rose-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {profileErrors.currentPassword}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={profileData.newPassword}
                          onChange={(e) => {
                            setProfileData({ ...profileData, newPassword: e.target.value });
                            setProfileErrors({ ...profileErrors, newPassword: "" });
                          }}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            profileErrors.newPassword ? 'border-rose-500' : 'border-gray-300'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10`}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {profileErrors.newPassword && (
                        <p className="mt-2 text-sm text-rose-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {profileErrors.newPassword}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={profileData.confirmPassword}
                          onChange={(e) => {
                            setProfileData({ ...profileData, confirmPassword: e.target.value });
                            setProfileErrors({ ...profileErrors, confirmPassword: "" });
                          }}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            profileErrors.confirmPassword ? 'border-rose-500' : 'border-gray-300'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10`}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {profileErrors.confirmPassword && (
                        <p className="mt-2 text-sm text-rose-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {profileErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={closeProfileModal}
                      disabled={profileLoading}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProfileUpdate}
                      disabled={profileLoading}
                      className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {profileLoading ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}