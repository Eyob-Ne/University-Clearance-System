import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  LogOut,
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
  ChevronRight
} from "lucide-react";
import axios from "axios";
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
  const [newDeptName, setNewDeptName] = useState("");
  const [editingDept, setEditingDept] = useState(null);
  const [editDeptName, setEditDeptName] = useState("");

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // Fetch all data for dashboard
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

  // Add new department
  const addDepartment = async () => {
    if (!newDeptName.trim()) {
      alert("Please enter a department name");
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `${API_BASE_URL}/admin/departments`,
        { name: newDeptName },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        setDepartments([...departments, { name: newDeptName, studentCount: 0 }]);
        setNewDeptName("");
        alert("Department added successfully");
      }
    } catch (error) {
      console.error("Error adding department:", error);
      alert("Error adding department");
    }
  };

  // Update department
  const updateDepartment = async () => {
    if (!editDeptName.trim()) {
      alert("Please enter a department name");
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `${API_BASE_URL}/admin/departments/${editingDept.name}`,
        { newName: editDeptName },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        setDepartments(departments.map(dept => 
          dept.name === editingDept.name ? { ...dept, name: editDeptName } : dept
        ));
        setEditingDept(null);
        setEditDeptName("");
        alert("Department updated successfully");
      }
    } catch (error) {
      console.error("Error updating department:", error);
      alert("Error updating department");
    }
  };

  // Delete department
  const deleteDepartment = async (deptName) => {
    if (!window.confirm(`Are you sure you want to delete ${deptName}? This will affect all students in this department.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.delete(
        `${API_BASE_URL}/admin/departments/${deptName}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        setDepartments(departments.filter(dept => dept.name !== deptName));
        alert("Department deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      alert("Error deleting department");
    }
  };

  // Filter students based on search text (name and student ID only)
  const filteredStudents = students.filter(student =>
    student.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
    student.studentId?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Update student clearance status
  const handleUpdateClearance = async (studentId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await axios.put(
        `${API_BASE_URL}/admin/students/${studentId}/clearance`,
        { clearanceStatus: newStatus },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setStudents(students.map(student => 
          student._id === studentId 
            ? { ...student, clearanceStatus: newStatus }
            : student
        ));
        alert("Clearance status updated successfully");
      }
    } catch (error) {
      console.error("Error updating clearance:", error);
      alert("Error updating clearance status");
    }
  };

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
    { id: "staff", label: "Create Staff", icon: UserPlus, view: "create-staff" },
    { id: "manage-staff", label: "Manage Staff", icon: Users, view: "manage-staff" },
    { id: "students", label: "Students List", icon: Users, view: "students-list" },
    { id: "departments", label: "Departments", icon: Building, view: "departments" },
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

  const handleManageStaff = () => {
    setActiveNav("manage-staff");
    setCurrentView("manage-staff");
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/staff-admin/login';
  };

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        
        const response = await axios.delete(`${API_BASE_URL}/admin/staff/${staffId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setStaffMembers(staffMembers.filter(staff => staff._id !== staffId));
        alert(response.data.message || "Staff member deleted successfully");
        
      } catch (error) {
        console.error("Error deleting staff:", error);
        alert(error.response?.data?.message || "Error deleting staff member");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewStaff = (staffId) => {
    const staff = staffMembers.find(s => s._id === staffId);
    if (staff) {
      alert(`Staff Details:\n\nName: ${staff.name}\nEmail: ${staff.email}\nRole: ${staff.role}\nDepartment: ${staff.department || 'N/A'}\nStatus: ${staff.isActive ? 'Active' : 'Inactive'}`);
    }
  };

  const handleToggleStatus = async (staffId) => {
    try {
      setLoading(true);
      const staff = staffMembers.find(s => s._id === staffId);
      const newStatus = !staff.isActive;
      const token = localStorage.getItem('adminToken');

      const response = await axios.put(
        `${API_BASE_URL}/admin/staff/${staffId}/status`,
        { isActive: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setStaffMembers(staffMembers.map(staff => 
          staff._id === staffId 
            ? { ...staff, isActive: newStatus }
            : staff
        ));
      } else {
        alert("Failed to update staff status");
      }
    } catch (error) {
      console.error("Error updating staff status:", error);
      alert("Error updating staff status");
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

  const getStatusBadge = (isActive) => {
    return isActive 
      ? "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium"
      : "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium";
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
                          Status
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusBadge(staff.isActive)}>
                              {staff.isActive ? "active" : "inactive"}
                            </span>
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
            {/* PAGE HEADER */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Dashboard Overview
                </h1>
                <p className="text-gray-600 text-lg">
                  Welcome back! Here's what's happening with your clearance system today.
                </p>
              </div>
              <button 
                onClick={fetchAllData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                Refresh Data
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <span>{error}</span>
                  <button 
                    onClick={fetchAllData}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
              {statsData.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={index}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${getColorClasses(stat.color)}`}>
                        <Icon size={24} />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      {stat.title}
                    </h3>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500">
                      {stat.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        );
    }
  };

return (
  <div className="flex min-h-screen bg-gray-50">

    {/* FIXED FULL-HEIGHT SIDEBAR - EXTENDS WITH CONTENT */}
    <aside
    className={`sticky top-20 left-0 self-start bg-gradient-to-b from-blue-700 via-blue-950 to-blue-950 text-white shadow-2xl flex flex-col transition-all duration-500 ease-in-out
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
          <div className="p-4 border-t border-indigo-700/30">
            {sidebarOpen ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 bg-red-900/20 hover:bg-red-500/30 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={22} className="text-red-300" />
                  <span className="font-medium">Logout</span>
                </div>
                <ArrowRight className="text-red-300" size={16} />
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="w-12 h-12 bg-red-500/20 hover:bg-red-500/30 rounded-xl flex items-center justify-center"
                title="Logout"
              >
                <LogOut size={22} className="text-red-300" />
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