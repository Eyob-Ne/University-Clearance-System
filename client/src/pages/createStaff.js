import React, { useState, useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import { FiUserPlus, FiCheck, FiX, FiLoader } from "react-icons/fi";
import { Eye, EyeOff } from 'lucide-react';
import axios from "axios";

export default function CreateStaff() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
    department: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false); // Add this state

  const roles = [
    "Library",
    "Dormitory",
    "Finance",
    "Registrar",
    "Cafeteria",
    "Department Head",
  ];

  const [departments, setDepartments] = useState([]);
const [loadingDepartments, setLoadingDepartments] = useState(false);

useEffect(() => {
  if (formData.role === "Department Head") {
    fetchDepartments();
  }
}, [formData.role]);


const fetchDepartments = async () => {
  setLoadingDepartments(true);

  try {
    const res = await axios.get(
      `${API_BASE_URL}/admin/college-departments`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    );

    setDepartments(res.data || []);
  } catch (error) {
    console.error("Failed to fetch departments:", error);
  } finally {
    setLoadingDepartments(false);
  }
};


  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL + "/api";
  
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Prepare data for API
      const staffData = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.role === "Department Head" ? formData.department : null,
        createdAt: new Date().toISOString(),
      };

      console.log("Sending staff data:", staffData);

      // Make API call to create staff
      const response = await axios.post(`${API_BASE_URL}/admin/create-staff`, staffData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}` // If using authentication
        }
      });

      console.log("Staff created successfully:", response.data);

      // Show success message
      setMessage({
        type: 'success',
        text: 'Staff account created successfully!'
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        password: "",
        role: "",
        department: "",
      });

      // Optionally redirect after success
      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 2000);

    } catch (error) {
      console.error("Error creating staff:", error);
      
      let errorMessage = "Failed to create staff account. Please try again.";
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "Unable to connect to server. Please check your connection.";
      }

      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
      role: "",
      department: "",
    });
    setMessage({ type: '', text: '' });
    setShowPassword(false); // Also reset password visibility on reset
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <FiUserPlus size={28} className="text-blue-700" />
          <h2 className="text-2xl font-bold text-gray-800">Create Staff Account</h2>
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="text-gray-700 font-medium block mb-2">Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter full name"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-700 font-medium block mb-2">Email</label>
            <input
              type="email"
              name="email"
              placeholder="staff@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-700 font-medium block mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-12"
                required
                disabled={loading}
                minLength="6"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Staff Role */}
          <div>
            <label className="text-gray-700 font-medium block mb-2">Staff Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
              disabled={loading}
            >
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Department Dropdown (Only for department heads) */}
          {formData.role === "Department Head" && (
            <div>
              <label className="text-gray-700 font-medium block mb-2">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
                disabled={loading}
              >
                <option value="">Select Department</option>
                {loadingDepartments ? (
  <option>Loading departments...</option>
) : (
  departments.map((dep) => (
    <option key={dep._id} value={dep.departmentName}>
  {dep.departmentName}
</option>

  ))
)}

              </select>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FiUserPlus />
                  Create Staff
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="px-6 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold transition-all disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}