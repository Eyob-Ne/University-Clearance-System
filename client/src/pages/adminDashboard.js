import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  LogOut,
  Upload,
  UserPlus,
  Home,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Building,
  ChevronLeft,
  ChevronRight,
   AlertTriangle,
  AlertCircle,
  Calendar,
 
} from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import CSVUpload from "./CSVUpload";
import CreateStaff from "./createStaff"; 

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [currentView, setCurrentView] = useState("dashboard");
  const [staffMembers, setStaffMembers] = useState([]);
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentLoading, setStudentLoading] = useState(false);
  const [deptLoading, setDeptLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL + "/api";
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      // Fetch staff data
      const staffResponse = await axios.get(`${API_BASE_URL}/admin/staff`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch student data
      const studentResponse = await axios.get(`${API_BASE_URL}/admin/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (staffResponse.data.success) {
        setStaffMembers(staffResponse.data.data || []);
      }

      if (studentResponse.data.success) {
        const studentsData = studentResponse.data.data || [];
        setStudents(studentsData);
        
        // Extract departments from students as fallback
        const uniqueDepts = [...new Set(studentsData.map(s => s.department))].filter(Boolean);
        setDepartments(uniqueDepts.map(name => ({ 
          name, 
          studentCount: studentsData.filter(s => s.department === name).length 
        })));
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
        handleLogout();
      } else {
        setError("Failed to fetch data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff data from backend
  const fetchStaffData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/admin/staff`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setStaffMembers(response.data.data || []);
      } else {
        setError("Failed to fetch staff data");
      }
    } catch (error) {
      console.error("Error fetching staff data:", error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setError("Session expired. Please login again.");
          handleLogout();
        } else {
          setError(error.response.data?.message || "Server error");
        }
      } else if (error.request) {
        setError("No response from server. Check if backend is running.");
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch student data from backend
  const fetchStudentData = async () => {
    try {
      setStudentLoading(true);
      setError("");
      
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/admin/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setStudents(response.data.data || []);
      } else {
        setError("Failed to fetch student data");
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      setError("Unable to fetch student data");
    } finally {
      setStudentLoading(false);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setDeptLoading(true);
      const token = localStorage.getItem('adminToken');
      
      // This endpoint needs to be created in backend
      const response = await axios.get(`${API_BASE_URL}/admin/departments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDepartments(response.data.data || []);
      } else {
        // Fallback: extract departments from students
        const uniqueDepts = [...new Set(students.map(s => s.department))].filter(Boolean);
        setDepartments(uniqueDepts.map(name => ({ name, studentCount: students.filter(s => s.department === name).length })));
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      // Fallback: extract departments from students
      const uniqueDepts = [...new Set(students.map(s => s.department))].filter(Boolean);
      setDepartments(uniqueDepts.map(name => ({ name, studentCount: students.filter(s => s.department === name).length })));
    } finally {
      setDeptLoading(false);
    }
  };

  // Filter students based on search text (name and student ID only)
  const filteredStudents = students.filter(student =>
    student.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
    student.studentId?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Fetch data when component mounts or view changes
  useEffect(() => {
    if (currentView === "dashboard") {
      fetchAllData();
    } else if (currentView === "manage-staff") {
      fetchStaffData();
    } else if (currentView === "students-list") {
      fetchStudentData();
    } else if (currentView === "departments") {
      fetchDepartments();
    }
  }, [currentView]);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, view: "dashboard" },
    { id: "csv-upload", label: "Upload Students", icon: Upload, view: "csv-upload" }, 
    { id: "staff", label: "Create Staff", icon: UserPlus, view: "create-staff" },
    { id: "manage-staff", label: "Manage Staff", icon: Users, view: "manage-staff" },
    { id: "students", label: "Students List", icon: Users, view: "students-list" },
    { id: "departments", label: "Departments", icon: Building, view: "departments" },
    { id: "clearance-settings", label: "Clearance Settings", icon: Clock, view: "clearance-settings" },
  ];

  const statsData = [
    {
      title: "Total Students",
      value: students.length.toString(),
      icon: Users,
      color: "blue",
      description: "Registered students"
    },
    {
      title: "Staff Members",
      value: staffMembers.length.toString(),
      icon: UserPlus,
      color: "green",
      description: "Active staff"
    },
    {
      title: "Departments",
      value: departments.length.toString(),
      icon: Building,
      color: "purple",
      description: "Academic departments"
    },
    {
      title: "Pending Clearance",
      value: students.filter(s => s.clearanceStatus === "Pending").length.toString(),
      icon: Clock,
      color: "orange",
      description: "Awaiting approval"
    },
    {
      title: "Approved Clearance",
      value: students.filter(s => s.clearanceStatus === "Approved").length.toString(),
      icon: CheckCircle,
      color: "green",
      description: "Cleared students"
    },
    {
      title: "Rejected Clearance",
      value: students.filter(s => s.clearanceStatus === "Rejected").length.toString(),
      icon: XCircle,
      color: "red",
      description: "Rejected applications"
    }
  ];

  const handleNavigation = (view, id) => {
    setActiveNav(id);
    setCurrentView(view);
  };

  const handleCreateStaff = () => {
    setActiveNav("staff");
    setCurrentView("create-staff");
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/staff-admin/login';
  };

const handleDeleteStaff = async (staffId) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This staff will be permanently deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    customClass: {
      popup: "my-popup",
      confirmButton: "my-confirm",
      cancelButton: "my-cancel"
    }
  });

  if (!result.isConfirmed) return;

  try {
    setLoading(true);
    const token = localStorage.getItem("adminToken");

    const response = await axios.delete(
      `${API_BASE_URL}/admin/staff/${staffId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setStaffMembers(staffMembers.filter(staff => staff._id !== staffId));

    Swal.fire("Deleted!", response.data.message, "success");

  } catch (error) {
    console.error(error);
    Swal.fire("Error", "Failed to delete staff", "error");
  } finally {
    setLoading(false);
  }
};



  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      green: "bg-green-50 text-green-600 border-green-200",
      purple: "bg-purple-50 text-purple-600 border-purple-200",
      orange: "bg-orange-50 text-orange-600 border-orange-200",
      red: "bg-red-50 text-red-600 border-red-200"
    };
    return colors[color] || colors.blue;
  };
  const getClearanceBadge = (status) => {
    const styles = {
      Approved: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Rejected: "bg-red-100 text-red-800"
    };
    
    const icons = {
      Approved: <CheckCircle size={14} className="inline mr-1" />,
      Pending: <Clock size={14} className="inline mr-1" />,
      Rejected: <XCircle size={14} className="inline mr-1" />
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  // Render different content based on current view
  const renderContent = () => {
    switch (currentView) {
      case "create-staff":
        return <CreateStaff onBack={() => handleNavigation("dashboard", "dashboard")} />;
        case "clearance-settings":
  return <ClearanceSettings onBack={() => handleNavigation("dashboard", "dashboard")} />;

        case "csv-upload":
    return <CSVUpload onBack={() => handleNavigation("dashboard", "dashboard")}/>;
      
      case "manage-staff":
        return (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Staff</h1>
                <p className="text-gray-600 mt-2">
                  View and manage all staff accounts in the system
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={fetchStaffData}
                  disabled={loading}
                  className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
                >
                  <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
                <button 
                  onClick={handleCreateStaff}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
                >
                  <UserPlus size={20} />
                  Add New Staff
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>{error}</span>
                  <button 
                    onClick={fetchStaffData}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Staff Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Staff Members ({staffMembers.length})
                </h3>
              </div>

              {loading && staffMembers.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading staff members...</p>
                </div>
              ) : staffMembers.length === 0 ? (
                <div className="p-8 text-center">
                  <Users size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first staff account.</p>
                  <button 
                    onClick={handleCreateStaff}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                  >
                    Create Staff Account
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Staff Member
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {staffMembers.map((staff) => (
                        <tr key={staff._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                              <div className="text-sm text-gray-500">{staff.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {staff.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {staff.department || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(staff.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDeleteStaff(staff._id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                                title="Delete Staff"
                                disabled={loading}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      
      case "students-list":
        return (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Students List</h1>
                <p className="text-gray-600 mt-2">
                  Manage all student accounts and clearance status
                </p>
              </div>
              <div className="flex gap-3">
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or student ID..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-64 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={fetchStudentData}
                  disabled={studentLoading}
                  className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
                >
                  <RefreshCw size={18} className={studentLoading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>{error}</span>
                  <button 
                    onClick={fetchStudentData}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredStudents.length}</p>
                  </div>
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {filteredStudents.filter(s => s.clearanceStatus === 'Approved').length}
                    </p>
                  </div>
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {filteredStudents.filter(s => s.clearanceStatus === 'Pending').length}
                    </p>
                  </div>
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {filteredStudents.filter(s => s.clearanceStatus === 'Rejected').length}
                    </p>
                  </div>
                  <XCircle className="text-red-600" size={24} />
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Students ({filteredStudents.length})
                </h3>
              </div>

              {studentLoading && filteredStudents.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-8 text-center">
                  <Users size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchText ? 'No students found' : 'No students found'}
                  </h3>
                  <p className="text-gray-600">
                    {searchText ? 'Try adjusting your search terms' : 'No student data available.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Academic
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Clearance
                        </th>
                       
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.map((student) => (
                        <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                              <div className="text-sm text-gray-500">ID: {student.studentId}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.department}</div>
                            <div className="text-sm text-gray-500">Year {student.year}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getClearanceBadge(student.clearanceStatus)}
                          </td>
                          
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      
      case "departments":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
              </div>
              <button 
                onClick={fetchDepartments}
                disabled={deptLoading}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <RefreshCw size={18} className={deptLoading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {/* Departments List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Departments ({departments.length})</h3>
              </div>

              {deptLoading && departments.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading departments...</p>
                </div>
              ) : departments.length === 0 ? (
                <div className="p-8 text-center">
                  <Building size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
                  <p className="text-gray-600">Add your first department using the form above.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clearance Stats</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {departments.map((dept) => (
                        <tr key={dept.name} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <Building className="text-gray-400" size={20} />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                                <div className="text-sm text-gray-500">Department</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-2xl font-bold text-blue-600">{dept.studentCount || 0}</div>
                            <div className="text-sm text-gray-500">students</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ {students.filter(s => s.department === dept.name && s.clearanceStatus === 'Approved').length}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                ⏱ {students.filter(s => s.department === dept.name && s.clearanceStatus === 'Pending').length}
                              </span>
                            </div>
                          </td>
                          
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return (
  <>
    {/* PAGE HEADER - Enhanced */}
    <div className="relative mb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl">
            Welcome back! Here's what's happening with your clearance system today.
          </p>
        </div>
        <button 
          onClick={fetchAllData}
          disabled={loading}
          className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity"></div>
          <RefreshCw size={20} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
          <span className="relative">Refresh Data</span>
        </button>
      </div>
    </div>

    {/* Error Message - Enhanced */}
    {error && (
      <div className="mb-8 animate-slideDown">
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-800 p-5 rounded-r-xl shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">{error}</span>
            </div>
            <button 
              onClick={fetchAllData}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow"
            >
              Retry Now
            </button>
          </div>
        </div>
      </div>
    )}

    {/* STATS GRID - Colorful and Beautiful */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        
        // Color gradients for each card based on stat color
        const colorGradients = {
          blue: "from-blue-50 to-blue-100 border-blue-200",
          green: "from-emerald-50 to-teal-100 border-emerald-200",
          purple: "from-purple-50 to-violet-100 border-purple-200",
          orange: "from-orange-50 to-amber-100 border-orange-200",
          red: "from-rose-50 to-pink-100 border-rose-200",
          indigo: "from-indigo-50 to-blue-100 border-indigo-200",
          cyan: "from-cyan-50 to-sky-100 border-cyan-200",
        };

        // Icon background gradients
        const iconGradients = {
          blue: "bg-gradient-to-br from-blue-500 to-blue-600",
          green: "bg-gradient-to-br from-emerald-500 to-teal-600",
          purple: "bg-gradient-to-br from-purple-500 to-violet-600",
          orange: "bg-gradient-to-br from-orange-500 to-amber-600",
          red: "bg-gradient-to-br from-rose-500 to-pink-600",
          indigo: "bg-gradient-to-br from-indigo-500 to-blue-600",
          cyan: "bg-gradient-to-br from-cyan-500 to-sky-600",
        };

        const gradientClass = colorGradients[stat.color] || colorGradients.blue;
        const iconGradientClass = iconGradients[stat.color] || iconGradients.blue;

        return (
          <div 
            key={index}
            className={`group relative bg-gradient-to-br ${gradientClass} border rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] overflow-hidden`}
          >
            {/* Animated background element */}
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
            
            {/* Top section with icon and value */}
            <div className="flex items-start justify-between mb-6">
              <div className="relative">
                <div className={`${iconGradientClass} p-4 rounded-2xl shadow-lg`}>
                  <Icon size={28} className="text-white" />
                </div>
              </div>
              
              {/* Optional badge or trend indicator */}
              {stat.trend && (
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${
                  stat.trend === 'up' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
                </div>
              )}
            </div>
            
            {/* Content section */}
            <div className="relative z-10">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-2">
                {stat.title}
              </p>
              <h3 className="text-4xl font-bold text-gray-900 mb-3">
                {stat.value}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {stat.description}
              </p>
              
              {/* Optional progress bar */}
              {stat.progress !== undefined && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Progress</span>
                    <span>{stat.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        stat.color === 'green' ? 'bg-emerald-500' :
                        stat.color === 'blue' ? 'bg-blue-500' :
                        stat.color === 'purple' ? 'bg-purple-500' :
                        stat.color === 'orange' ? 'bg-orange-500' : 'bg-gray-500'
                      }`}
                      style={{ width: `${stat.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Decorative corner */}
            <div className="absolute bottom-0 right-0 h-16 w-16 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
              <div className="absolute bottom-0 right-0 h-8 w-8 border-r-2 border-b-2 border-gray-400 rounded-br-2xl"></div>
            </div>
          </div>
        );
      })}
    </div>
  </>
);
    }
  };

  const ClearanceSettings = ({ onBack }) => {
  const [settings, setSettings] = useState({
    startDate: '',
    endDate: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch current settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/admin/clearance-settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const data = response.data.data;
        setSettings({
          startDate: data.startDate ? data.startDate.split('T')[0] : '',
          endDate: data.endDate ? data.endDate.split('T')[0] : '',
          isActive: data.isActive !== false
        });
        
        // Check current status
        checkSystemStatus();
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setError("Failed to load clearance settings");
    } finally {
      setLoading(false);
    }
  };

  // Check current system status
  const checkSystemStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/system/status`);
      if (response.data.success) {
        setCurrentStatus(response.data.data);
      }
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  // Save settings
  const saveSettings = async (e) => {
    e.preventDefault();
    
    if (!settings.startDate || !settings.endDate) {
      setError("Please select both start and end dates");
      return;
    }
    
    const start = new Date(settings.startDate);
    const end = new Date(settings.endDate);
    
    if (start >= end) {
      setError("End date must be after start date");
      return;
    }
    
    if (end < new Date()) {
      const confirmed = window.confirm(
        "The end date is in the past. This will immediately close the system. Continue?"
      );
      if (!confirmed) return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `${API_BASE_URL}/admin/clearance-settings`,
        {
          startDate: settings.startDate + 'T00:00:00',
          endDate: settings.endDate + 'T23:59:59',
          isActive: settings.isActive
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setSuccess("Clearance settings saved successfully!");
        await checkSystemStatus();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setError(error.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Emergency toggle
  const handleEmergencyToggle = async (action) => {
    const confirmMessage = action === 'open' 
      ? "Are you sure you want to force open the system? This will override the schedule."
      : "Are you sure you want to force close the system? All active sessions will be terminated.";
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `${API_BASE_URL}/admin/emergency-toggle`,
        { action },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccess(`System ${action}ed successfully!`);
        await fetchSettings();
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update system status");
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Calculate time remaining
  const calculateTimeRemaining = () => {
    if (!currentStatus?.endDate) return null;
    
    const end = new Date(currentStatus.endDate);
    const now = new Date();
    const diffMs = end - now;
    
    if (diffMs <= 0) return null;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
  <div className="space-y-6 animate-fadeIn">
    {/* Status Banner - Enhanced */}
    {currentStatus && (
      <div className={`relative overflow-hidden rounded-2xl shadow-lg transform transition-all duration-500 hover:scale-[1.01] ${currentStatus.isOpen ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-rose-500 to-red-600'}`}>
        <div className="absolute inset-0 bg-white/5"></div>
        <div className="relative p-8 text-white">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-2xl backdrop-blur-sm ${currentStatus.isOpen ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                {currentStatus.isOpen ? (
                  <CheckCircle className="text-green-300" size={36} />
                ) : (
                  <XCircle className="text-red-300" size={36} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-3xl font-bold">
                    System is {currentStatus.isOpen ? 'OPEN' : 'CLOSED'}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentStatus.isOpen ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
                    {currentStatus.isOpen ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <p className="text-white/90 text-lg">
                  {currentStatus.isOpen 
                    ? 'Students can currently submit clearance requests'
                    : 'Clearance submissions are currently disabled'
                  }
                </p>
              </div>
            </div>
            
            {currentStatus.isOpen && calculateTimeRemaining() && (
              <div className="lg:text-right bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-w-[200px]">
                <div className="flex lg:flex-col items-center lg:items-end gap-4 lg:gap-2">
                  <div>
                    <p className="text-white/70 text-sm uppercase tracking-wider">Closes in</p>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-bold tracking-tight">{calculateTimeRemaining()}</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Clock className="text-white" size={20} />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Progress bar for time remaining */}
          {currentStatus.isOpen && currentStatus.endDate && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-white/80 mb-2">
                <span>Time remaining</span>
                <span>{Math.round((new Date() - new Date(currentStatus.startDate)) / (new Date(currentStatus.endDate) - new Date(currentStatus.startDate)) * 100)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${Math.max(0, Math.min(100, 100 - Math.round((new Date() - new Date(currentStatus.startDate)) / (new Date(currentStatus.endDate) - new Date(currentStatus.startDate)) * 100)))}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Messages with Animation */}
    {error && (
      <div className="animate-slideDown bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="text-red-600" size={20} />
            </div>
            <span className="text-red-800 font-medium">{error}</span>
          </div>
          <button 
            onClick={() => setError('')}
            className="p-2 hover:bg-red-200 rounded-lg transition-colors"
          >
            <XCircle className="text-red-600" size={18} />
          </button>
        </div>
      </div>
    )}
    
    {success && (
      <div className="animate-slideDown bg-gradient-to-r from-emerald-50 to-green-100 border-l-4 border-emerald-500 p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle className="text-emerald-600" size={20} />
            </div>
            <span className="text-emerald-800 font-medium">{success}</span>
          </div>
          <button 
            onClick={() => setSuccess('')}
            className="p-2 hover:bg-emerald-200 rounded-lg transition-colors"
          >
            <XCircle className="text-emerald-600" size={18} />
          </button>
        </div>
      </div>
    )}

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Schedule Form - Enhanced */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
          <div className="bg-gradient-to-r from-gray-50 to-white p-8 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="text-blue-600" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Set Clearance Window
              </h3>
            </div>
            <p className="text-gray-600">
              Define the exact dates when students can submit clearance requests
            </p>
          </div>
          
          <form onSubmit={saveSettings} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Start Date Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white p-6 rounded-2xl border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Start Date *
                    </span>
                  </label>
                  <input
                    type="date"
                    value={settings.startDate}
                    onChange={(e) => setSettings({...settings, startDate: e.target.value})}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg font-medium bg-gray-50"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                    <Clock size={14} />
                    System opens at 00:00 on this date
                  </p>
                </div>
              </div>

              {/* End Date Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white p-6 rounded-2xl border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      End Date *
                    </span>
                  </label>
                  <input
                    type="date"
                    value={settings.endDate}
                    onChange={(e) => setSettings({...settings, endDate: e.target.value})}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-lg font-medium bg-gray-50"
                    required
                    min={settings.startDate || new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                    <Clock size={14} />
                    System closes at 23:59 on this date
                  </p>
                </div>
              </div>
            </div>

            {/* Toggle Switch - Enhanced */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200 mb-8">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm border">
                  <RefreshCw className="text-blue-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Automatic Scheduling</h4>
                  <p className="text-sm text-gray-600">System opens/closes automatically based on schedule</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={settings.isActive}
                  onChange={(e) => setSettings({...settings, isActive: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="group relative flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-center gap-3"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={22} />
                    <span>Save Schedule</span>
                  </>
                )}
                <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              </button>
              
              <button
                type="button"
                onClick={fetchSettings}
                className="px-6 py-4 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 rounded-2xl font-semibold transition-all duration-300 hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column - Enhanced */}
      <div className="space-y-6">
        {/* Schedule Info Card */}
        {settings.startDate && settings.endDate && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 p-6 transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar className="text-indigo-600" size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Scheduled Window
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">Opens</p>
                  <p className="font-bold text-gray-900">{formatDate(settings.startDate + 'T00:00:00')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="text-purple-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-purple-700 font-medium">Closes</p>
                  <p className="font-bold text-gray-900">{formatDate(settings.endDate + 'T23:59:59')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Clock className="text-emerald-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-emerald-700 font-medium">Duration</p>
                  <p className="font-bold text-gray-900">
                    {Math.ceil((new Date(settings.endDate) - new Date(settings.startDate)) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Controls - Enhanced */}
        <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-xl border border-red-100 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 border-b border-red-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Emergency Controls
              </h3>
            </div>
            <p className="text-red-600 text-sm mt-2">
              Override the schedule in urgent situations
            </p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-amber-700">
                  ⚠️ Use these controls only in emergencies. They will override all scheduled settings.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => handleEmergencyToggle('open')}
              disabled={loading || (currentStatus?.isOpen === true)}
              className="group relative w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:hover:transform-none flex items-center justify-center gap-3"
            >
              <div className="absolute inset-0 bg-white/20 rounded-xl blur-md group-hover:blur-xl transition-all duration-300"></div>
              <CheckCircle size={22} className="relative z-10" />
              <span className="relative z-10">Force Open System</span>
            </button>
            
            <button
              onClick={() => handleEmergencyToggle('close')}
              disabled={loading || (currentStatus?.isOpen === false)}
              className="group relative w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:hover:transform-none flex items-center justify-center gap-3"
            >
              <div className="absolute inset-0 bg-white/20 rounded-xl blur-md group-hover:blur-xl transition-all duration-300"></div>
              <XCircle size={22} className="relative z-10" />
              <span className="relative z-10">Force Close System</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Add these styles to your CSS or Tailwind config */}
    <style jsx>{`
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.6s ease-out;
      }
      
      .animate-slideDown {
        animation: slideDown 0.4s ease-out;
      }
    `}</style>
  </div>
);
};

return (
  <div className="flex min-h-screen bg-gray-50">

    {/* FIXED FULL-HEIGHT SIDEBAR - EXTENDS WITH CONTENT */}
    <aside
    className={`sticky top-0 left-0 self-start bg-gradient-to-b from-blue-700 via-blue-950 to-blue-950 text-white shadow-2xl flex flex-col transition-all duration-500 ease-in-out
    ${sidebarOpen ? "w-80" : "w-24"}
      `}
    >
      {/* SIDEBAR HEADER */}
      <div className={`p-6 border-b border-blue-700/40 flex items-center ${!sidebarOpen ? "justify-center" : "justify-between"}`}>
        <div className={`flex items-center ${sidebarOpen ? "gap-4" : "flex-col gap-2"}`}>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg">
            <BarChart3 className="text-purple-300" size={28} />
          </div>

          {sidebarOpen && (
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Admin Dashboard</h2>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>

      {/* COLLAPSE BUTTON */}
      {!sidebarOpen && (
        <div className="p-4 border-b border-indigo-700/20 flex justify-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* NAVIGATION - FLEXIBLE HEIGHT */}
      <div className="flex-1">
        <nav className="h-full flex flex-col">
          <div className="px-3 py-6 space-y-3">

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.view, item.id)}
                  className={`group relative w-full flex items-center rounded-xl transition-all duration-300
                    ${sidebarOpen ? "px-4 py-4 gap-4" : "justify-center py-4"}
                    ${isActive ? "bg-white/15 shadow-lg" : "hover:bg-white/10"}
                  `}
                  title={!sidebarOpen ? item.label : ""}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-purple-400 rounded-r-full"></div>
                  )}

                  <Icon size={24} className={`${isActive ? "text-white" : "text-indigo-300 group-hover:text-white"}`} />

                  {sidebarOpen && (
                    <span className="font-medium text-lg tracking-tight text-white">{item.label}</span>
                  )}

                  {/* Tooltip */}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-3 bg-black/80 text-xs rounded-md px-3 py-1 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* SPACER TO PUSH FOOTER DOWN */}
          <div className="flex-1"></div>
          
          {/* FOOTER - ALWAYS AT BOTTOM */}
      <div className="p-3 border-t border-white/10">
  {sidebarOpen ? (
    <button
      onClick={handleLogout}
      className="
        w-full group relative overflow-hidden
        flex items-center justify-between
        px-4 py-3 rounded-xl
        bg-gradient-to-r from-red-500 to-red-600
        hover:from-red-600 hover:to-red-700
        transition-all duration-500
        shadow-lg shadow-red-500/20
        hover:shadow-red-500/30
        hover:-translate-y-0.5
        before:absolute before:inset-0 
        before:bg-gradient-to-r before:from-white/0 before:via-white/10 before:to-white/0
        before:translate-x-[-100%] hover:before:translate-x-[100%]
        before:transition-transform before:duration-700
      "
    >
      {/* Animated background shine */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="
          absolute -inset-full
          bg-gradient-to-r from-transparent via-white/15 to-transparent
          group-hover:translate-x-full
          transition-transform duration-700
        "></div>
      </div>

      <div className="relative flex items-center gap-3">
        {/* Icon container */}
        <div className="
          relative w-9 h-9 rounded-lg
          flex items-center justify-center
          bg-white/20
          group-hover:scale-110
          transition-all duration-300
          ring-1 ring-white/30
        ">
          <LogOut size={18} className="text-white relative z-10" />
        </div>

        <div className="text-left">
          <span className="
            font-semibold text-sm tracking-wide
            text-white
            block
          ">
            Logout
          </span>
          <span className="
            text-xs text-white/80
            opacity-0 group-hover:opacity-100
            transition-opacity duration-300
            block mt-0.5
          ">
            Sign out securely
          </span>
        </div>
      </div>

      {/* Animated arrow */}
      <div className="relative">
        <ArrowRight
          size={16}
          className="
            text-white/90
            group-hover:translate-x-1.5
            transition-transform duration-300
          "
        />
      </div>

      {/* Ripple effect on click */}
      <div className="
        absolute inset-0
        bg-white/10
        opacity-0 group-active:opacity-100
        transition-opacity duration-200
      "></div>
    </button>
  ) : (
    <button
      onClick={handleLogout}
      title="Logout"
      className="
        relative w-10 h-10 rounded-xl
        flex items-center justify-center
        bg-gradient-to-br from-red-500 to-red-600
        hover:from-red-600 hover:to-red-700
        shadow-lg shadow-red-500/20
        transition-all duration-300
        hover:scale-105
        group
        overflow-hidden
      "
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="
          absolute inset-0
          bg-gradient-to-r from-transparent via-white/15 to-transparent
          -translate-x-full
          group-hover:translate-x-full
          transition-transform duration-500
        "></div>
      </div>

      {/* Icon container */}
      <div className="relative">
        <LogOut size={18} className="text-white" />
        
        {/* Glow effect */}
        <div className="
          absolute -inset-1.5
          bg-red-400/20 rounded-full
          blur-sm
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
        "></div>
      </div>

      {/* Simple tooltip */}
      <div className="
        absolute left-full ml-2
        px-2 py-1 rounded-md
        bg-gray-900 text-white text-xs
        font-medium whitespace-nowrap
        opacity-0 group-hover:opacity-100
        transition-opacity duration-300
        shadow-md
        pointer-events-none
        border border-gray-700
        before:absolute before:left-[-4px] before:top-1/2 before:-translate-y-1/2
        before:border-3 before:border-transparent before:border-r-gray-900
      ">
        Logout
      </div>
    </button>
  )}
</div>
        </nav>
      </div>
    </aside>

    {/* MAIN CONTENT - DETERMINES OVERALL HEIGHT */}
    <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
      {renderContent()}
    </div>

  </div>
);

};

export default AdminDashboard;