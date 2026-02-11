import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiLoader,
  FiSave,
  FiHome,
  FiRefreshCw,
  FiList
} from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import axios from "axios";

export default function CreateDepartment() {
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingColleges, setFetchingColleges] = useState(true);
  const [fetchingDepts, setFetchingDepts] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    departmentName: "",
    collegeId: ""
  });

  const [editFormData, setEditFormData] = useState({
    departmentName: "",
    collegeId: ""
  });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL + "/api";

  // Fetch all colleges
  const fetchColleges = async () => {
    setFetchingColleges(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/admin/colleges`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setColleges(response.data);
      
      // Auto-select first college if none selected
      if (response.data.length > 0 && !selectedCollege) {
        setSelectedCollege(response.data[0].collegeId);
        setFormData(prev => ({ ...prev, collegeId: response.data[0].collegeId }));
      }
    } catch (error) {
      console.error("Error fetching colleges:", error);
      setMessage({
        type: 'error',
        text: 'Failed to load colleges. Please try again.'
      });
    } finally {
      setFetchingColleges(false);
    }
  };

 // Fetch departments (all or filtered by college)
const fetchDepartments = async (collegeId = null) => {
  setFetchingDepts(true);
  try {
    const token = localStorage.getItem('adminToken');
    let url = `${API_BASE_URL}/admin/college-departments`;
    
    if (collegeId) {
      url += `?collegeId=${collegeId}`;
    }
    
    console.log('📡 Fetching departments from:', url);
    
    const response = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('📦 Departments API response:', response.data);
    console.log('📊 Response type:', typeof response.data);
    console.log('🔢 Is array?', Array.isArray(response.data));
    
    if (response.data && !Array.isArray(response.data)) {
      console.log('⚠️ Response is NOT an array. Structure:', JSON.stringify(response.data, null, 2));
      // If it's an error object, set empty array
      if (response.data.message || response.data.error) {
        console.error('API returned error:', response.data.message || response.data.error);
        setDepartments([]);
        return;
      }
    }
    
    // Ensure we always set an array
    setDepartments(Array.isArray(response.data) ? response.data : []);
    
  } catch (error) {
    console.error("❌ Error fetching departments:", error);
    console.error("🔍 Error response data:", error.response?.data);
    console.error("⚡ Error status:", error.response?.status);
    setMessage({
      type: 'error',
      text: `Failed to load departments. ${error.response?.data?.message || 'Please try again.'}`
    });
    setDepartments([]); // Set to empty array on error
  } finally {
    setFetchingDepts(false);
  }
};

  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    if (selectedCollege) {
      fetchDepartments(selectedCollege);
    } else {
      fetchDepartments(); // Fetch all departments if no college selected
    }
  }, [selectedCollege]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'collegeId') {
      setSelectedCollege(value);
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // Create new department
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.collegeId) {
      setMessage({
        type: 'error',
        text: 'Please select a college first'
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `${API_BASE_URL}/admin/college-departments`,
        {
          departmentName: formData.departmentName.trim(),
          collegeId: formData.collegeId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setMessage({
        type: 'success',
        text: 'Department created successfully!'
      });

      // Reset form and refresh list
      setFormData({
        departmentName: "",
        collegeId: selectedCollege // Keep the same college selected
      });
      fetchDepartments(selectedCollege);
    } catch (error) {
      console.error("Error creating department:", error);
      
      let errorMessage = "Failed to create department. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Start editing a department
  const startEditing = (department) => {
    setEditingId(department.departmentId);
    setEditFormData({
      departmentName: department.departmentName,
      collegeId: department.collegeId
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData({
      departmentName: "",
      collegeId: ""
    });
  };

  // Update department
  const handleUpdate = async (departmentId) => {
    if (!editFormData.departmentName.trim()) {
      setMessage({
        type: 'error',
        text: 'Department name cannot be empty'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `${API_BASE_URL}/admin/college-departments/${departmentId}`,
        { departmentName: editFormData.departmentName.trim() },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setMessage({
        type: 'success',
        text: 'Department updated successfully!'
      });

      // Refresh list and exit edit mode
      setEditingId(null);
      fetchDepartments(selectedCollege);
    } catch (error) {
      console.error("Error updating department:", error);
      
      let errorMessage = "Failed to update department. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete department
  const handleDelete = async (departmentId, departmentName) => {
    if (!window.confirm(`Are you sure you want to delete "${departmentName}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.delete(
        `${API_BASE_URL}/admin/college-departments/${departmentId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setMessage({
        type: 'success',
        text: 'Department deleted successfully!'
      });

      // Refresh list
      fetchDepartments(selectedCollege);
    } catch (error) {
      console.error("Error deleting department:", error);
      
      let errorMessage = "Failed to delete department. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        
        // Check if department has students/staff
        if (errorMessage.includes('students') || errorMessage.includes('staff') || errorMessage.includes('dependent')) {
          errorMessage = 'Cannot delete department because it has students or staff assigned.';
        }
      }

      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Get college name by ID
  const getCollegeName = (collegeId) => {
    const college = colleges.find(c => c.collegeId === collegeId);
    return college ? college.collegeName : 'Unknown College';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MdSchool size={32} className="text-blue-700" />
            <h1 className="text-3xl font-bold text-gray-800">Manage Departments</h1>
          </div>
          <p className="text-gray-600">
            Create and manage departments under specific colleges.
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <FiCheck size={20} /> : <FiX size={20} />}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Create Department Form */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-xl rounded-2xl p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FiPlus className="text-blue-600" />
                Add New Department
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* College Selection */}
                <div>
                  <label className="text-gray-700 font-medium block mb-2">
                    Select College <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="collegeId"
                    value={formData.collegeId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                    disabled={fetchingColleges || loading}
                  >
                    <option value="">Select a College</option>
                    {colleges.map((college) => (
                      <option key={college.collegeId} value={college.collegeId}>
                        {college.collegeName}
                      </option>
                    ))}
                  </select>
                  {fetchingColleges && (
                    <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                      <FiLoader className="animate-spin" size={14} />
                      Loading colleges...
                    </div>
                  )}
                </div>

                {/* Department Name */}
                <div>
                  <label className="text-gray-700 font-medium block mb-2">
                    Department Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="departmentName"
                    placeholder="e.g., Software Engineering"
                    value={formData.departmentName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                    disabled={loading}
                    maxLength="100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !formData.collegeId || !formData.departmentName.trim()}
                  className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiPlus />
                      Create Department
                    </>
                  )}
                </button>
              </form>

              {/* Filter Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Filter Departments</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedCollege("")}
                    className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
                      !selectedCollege 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    All Departments
                  </button>
                  
                  {colleges.slice(0, 5).map((college) => (
                    <button
                      key={college.collegeId}
                      onClick={() => setSelectedCollege(college.collegeId)}
                      className={`w-full px-4 py-2 text-left rounded-lg transition-colors flex items-center justify-between ${
                        selectedCollege === college.collegeId
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <span className="truncate">{college.collegeName}</span>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        {college.departmentCount || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Departments List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-xl rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                 <h2 className="text-xl font-bold text-gray-800">
  {selectedCollege 
    ? `Departments in ${getCollegeName(selectedCollege)}`
    : 'All Departments'
  }
  {Array.isArray(departments) && departments.length > 0 && ` (${departments.length})`}
</h2>
                  {selectedCollege && (
                    <p className="text-sm text-gray-500 mt-1">
                      Showing departments for selected college
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={fetchColleges}
                    disabled={fetchingColleges}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                    title="Refresh colleges list"
                  >
                    {fetchingColleges ? (
                      <FiLoader className="animate-spin" size={16} />
                    ) : (
                      <FiHome size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => fetchDepartments(selectedCollege)}
                    disabled={fetchingDepts}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                    title="Refresh departments"
                  >
                    {fetchingDepts ? (
                      <FiLoader className="animate-spin" size={16} />
                    ) : (
                      <FiRefreshCw size={16} />
                    )}
                    Refresh
                  </button>
                </div>
              </div>

              {fetchingDepts ? (
  <div className="flex flex-col items-center justify-center py-12">
    <FiLoader className="animate-spin text-blue-600 mb-4" size={32} />
    <p className="text-gray-500">Loading departments...</p>
  </div>
) : !Array.isArray(departments) || departments.length === 0 ? (
  <div className="text-center py-12">
    <FiList className="mx-auto text-gray-300 mb-4" size={48} />
    <h3 className="text-lg font-medium text-gray-700 mb-2">
      {!Array.isArray(departments) 
        ? 'Error Loading Departments'
        : selectedCollege 
          ? 'No Departments Found' 
          : 'No Departments Created'
      }
    </h3>
    <p className="text-gray-500 max-w-md mx-auto">
      {!Array.isArray(departments)
        ? 'There was an error loading departments. Please check console for details.'
        : selectedCollege
          ? `Start by creating departments under ${getCollegeName(selectedCollege)}.`
          : 'Create departments by selecting a college first.'
      }
    </p>
  </div>
) : (
                <div className="space-y-4">
                  {departments.map((department) => (
                    <div
                      key={department.departmentId}
                      className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all duration-300"
                    >
                      {editingId === department.departmentId ? (
                        // Edit Mode
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">
                              Edit Department Name
                            </label>
                            <input
                              type="text"
                              name="departmentName"
                              value={editFormData.departmentName}
                              onChange={handleEditChange}
                              className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                              autoFocus
                              maxLength="100"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleUpdate(department.departmentId)}
                              disabled={loading || !editFormData.departmentName.trim()}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                              <FiSave size={16} />
                              Save Changes
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={loading}
                              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {department.departmentName}
                            </h3>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <FiHome size={14} />
                                {getCollegeName(department.collegeId)}
                              </span>
                              <span className="text-sm text-gray-500">
                                Created: {new Date(department.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditing(department)}
                              disabled={loading}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit department"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(department.departmentId, department.departmentName)}
                              disabled={loading}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete department"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats Card */}
            {Array.isArray(departments) && departments.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Departments</p>
                      <p className="text-2xl font-bold text-blue-700">{departments.length}</p>
                    </div>
                    <FiList className="text-blue-400" size={24} />
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Colleges Covered</p>
                      <p className="text-2xl font-bold text-purple-700">
{Array.isArray(departments) ? [...new Set(departments.map(d => d.collegeId))].length : 0}                      </p>
                    </div>
                    <MdSchool className="text-purple-400" size={24} />
                  </div>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Active</p>
                      <p className="text-2xl font-bold text-green-700">{departments.length}</p>
                    </div>
                    <FiCheck className="text-green-400" size={24} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}