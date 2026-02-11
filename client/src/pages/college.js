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
  FiRefreshCw  
} from "react-icons/fi";
import axios from "axios";

export default function CreateCollege() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    collegeName: "",
  });

  const [editFormData, setEditFormData] = useState({
    collegeName: "",
  });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL + "/api";

  // Fetch all colleges
  const fetchColleges = async () => {
    setFetching(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/colleges`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setColleges(response.data);
    } catch (error) {
      console.error("Error fetching colleges:", error);
      setMessage({
        type: 'error',
        text: 'Failed to load colleges. Please try again.'
      });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // Create new college
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/colleges`,
        { collegeName: formData.collegeName },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );

      setMessage({
        type: 'success',
        text: 'College created successfully!'
      });

      // Reset form and refresh list
      setFormData({ collegeName: "" });
      fetchColleges();
    } catch (error) {
      console.error("Error creating college:", error);
      
      let errorMessage = "Failed to create college. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Start editing a college
  const startEditing = (college) => {
    setEditingId(college.collegeId);
    setEditFormData({ collegeName: college.collegeName });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData({ collegeName: "" });
  };

  // Update college
  const handleUpdate = async (collegeId) => {
    if (!editFormData.collegeName.trim()) {
      setMessage({
        type: 'error',
        text: 'College name cannot be empty'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/colleges/${collegeId}`,
        { collegeName: editFormData.collegeName },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );

      setMessage({
        type: 'success',
        text: 'College updated successfully!'
      });

      // Refresh list and exit edit mode
      setEditingId(null);
      fetchColleges();
    } catch (error) {
      console.error("Error updating college:", error);
      
      let errorMessage = "Failed to update college. Please try again.";
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

  // Delete college
  const handleDelete = async (collegeId, collegeName) => {
    if (!window.confirm(`Are you sure you want to delete "${collegeName}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/admin/colleges/${collegeId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );

      setMessage({
        type: 'success',
        text: 'College deleted successfully!'
      });

      // Refresh list
      fetchColleges();
    } catch (error) {
      console.error("Error deleting college:", error);
      
      let errorMessage = "Failed to delete college. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        
        // Check if college has departments
        if (errorMessage.includes('departments') || errorMessage.includes('dependent')) {
          errorMessage = 'Cannot delete college because it has departments assigned. Please delete departments first.';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FiHome size={32} className="text-blue-700" />
            <h1 className="text-3xl font-bold text-gray-800">Manage Colleges</h1>
          </div>
        
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
          {/* Left Column - Create College Form */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-xl rounded-2xl p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FiPlus className="text-blue-600" />
                Add New College
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-gray-700 font-medium block mb-2">
                    College Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="collegeName"
                    placeholder="e.g., College of Computing and Informatics"
                    value={formData.collegeName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                    disabled={loading}
                    maxLength="100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !formData.collegeName.trim()}
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
                      Create College
                    </>
                  )}
                </button>
              </form>

            
            </div>
          </div>

          {/* Right Column - Colleges List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-xl rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Colleges List {colleges.length > 0 && `(${colleges.length})`}
                </h2>
                <button
                  onClick={fetchColleges}
                  disabled={fetching}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {fetching ? (
                    <FiLoader className="animate-spin" size={16} />
                  ) : (
                    <FiCheck size={16} />
                  )}
                  Refresh
                </button>
              </div>

              {fetching ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FiLoader className="animate-spin text-blue-600 mb-4" size={32} />
                  <p className="text-gray-500">Loading colleges...</p>
                </div>
              ) : colleges.length === 0 ? (
                <div className="text-center py-12">
                  <FiHome className="mx-auto text-gray-300 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Colleges Found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Start by creating your first college. Colleges are required before creating departments.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {colleges.map((college) => (
                    <div
                      key={college.collegeId}
                      className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all duration-300"
                    >
                      {editingId === college.collegeId ? (
                        // Edit Mode
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">
                              Edit College Name
                            </label>
                            <input
                              type="text"
                              name="collegeName"
                              value={editFormData.collegeName}
                              onChange={handleEditChange}
                              className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                              autoFocus
                              maxLength="100"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleUpdate(college.collegeId)}
                              disabled={loading || !editFormData.collegeName.trim()}
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
                              {college.collegeName}
                            </h3>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-gray-500">
                                Created: {new Date(college.createdAt).toLocaleDateString()}
                              </span>
                              {college.departmentCount > 0 && (
                                <span className="text-sm text-blue-600 font-medium">
                                  {college.departmentCount} department{college.departmentCount !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditing(college)}
                              disabled={loading}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit college"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(college.collegeId, college.collegeName)}
                              disabled={loading || college.departmentCount > 0}
                              className={`p-2 rounded-lg transition-colors ${
                                college.departmentCount > 0
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-red-600 hover:bg-red-50'
                              }`}
                              title={
                                college.departmentCount > 0
                                  ? 'Cannot delete college with departments'
                                  : 'Delete college'
                              }
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
            {colleges.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Colleges</p>
                      <p className="text-2xl font-bold text-blue-700">{colleges.length}</p>
                    </div>
                    <FiHome className="text-blue-400" size={24} />
                  </div>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Active</p>
                      <p className="text-2xl font-bold text-green-700">{colleges.length}</p>
                    </div>
                    <FiCheck className="text-green-400" size={24} />
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Total Departments</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {colleges.reduce((sum, college) => sum + (college.departmentCount || 0), 0)}
                      </p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-purple-400 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">D</span>
                    </div>
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