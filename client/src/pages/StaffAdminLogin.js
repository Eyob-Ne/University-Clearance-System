import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User, Shield, LogIn, Eye, EyeOff, Lock, Mail } from "lucide-react";

const StaffAdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: "staff" // "staff" or "admin"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL + "/api";
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let response;
      let endpoint = "";

      if (formData.userType === "admin") {
        endpoint = `${API_BASE_URL}/admin/login`;
        console.log("Attempting admin login...");
      } else {
        endpoint = `${API_BASE_URL}/staff/login`;
        console.log("Attempting staff login...");
      }

      response = await axios.post(endpoint, {
        email: formData.email,
        password: formData.password,
      });

      console.log("Login response:", response.data);

      if (response.data.token) {
        if (formData.userType === "admin") {
          localStorage.setItem("adminToken", response.data.token);
          localStorage.setItem("adminProfile", JSON.stringify(response.data.admin || response.data));
          console.log("Admin token saved to localStorage");
          navigate("/admin-dashboard");
        } else {
          const { token, staff } = response.data;
          localStorage.setItem("staffToken", token);
          localStorage.setItem("staffProfile", JSON.stringify(staff));
          console.log("Staff token saved to localStorage");

          const role = (staff.role || "").toLowerCase();
          redirectStaffByRole(role);
        }
      } else {
        setError("No token received from server");
      }
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ECONNREFUSED') {
        setError("Cannot connect to server. Make sure backend is running on port 5000.");
      } else {
        setError("Login failed. Please check your credentials and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const redirectStaffByRole = (role) => {
    if (role.includes("department")) {
      navigate("/dashboard/department");
    } else if (role.includes("library")) {
      navigate("/dashboard/library");
    } else if (role.includes("dormitory")) {
      navigate("/dashboard/dormitory");
    } else if (role.includes("finance")) {
      navigate("/dashboard/finance");
    } else if (role.includes("registrar")) {
      navigate("/dashboard/registrar");
    } else if (role.includes("cafeteria")) {
      navigate("/dashboard/cafeteria");
    } else {
      navigate("/dashboard/staff");
    }
  };

  const getUserTypeConfig = (type) => {
    const configs = {
      staff: {
        icon: User,
        label: "Staff Member",
        gradient: "from-indigo-600 to-purple-700",
        buttonGradient: "from-indigo-600 to-purple-600",
        cardGradient: "from-indigo-50 to-purple-50",
        activeCard: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white",
        inactiveCard: "bg-white text-gray-700 border border-gray-200"
      },
      admin: {
        icon: Shield,
        label: "Administrator",
        gradient: "from-blue-700 to-cyan-600",
        buttonGradient: "from-blue-600 to-cyan-600",
        cardGradient: "from-blue-50 to-cyan-50",
        activeCard: "bg-gradient-to-r from-blue-500 to-cyan-600 text-white",
        inactiveCard: "bg-white text-gray-700 border border-gray-200"
      }
    };
    return configs[type] || configs.staff;
  };

  const currentConfig = getUserTypeConfig(formData.userType);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* User Type Selector */}
        <div className="flex gap-4 mb-8">
          {["staff", "admin"].map((type) => {
            const config = getUserTypeConfig(type);
            const Icon = config.icon;
            const isActive = formData.userType === type;
            
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, userType: type })}
                className={`flex-1 p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  isActive ? config.activeCard + " shadow-lg" : config.inactiveCard + " hover:shadow-md"
                }`}
              >
                <div className="flex flex-col items-center">
                  <Icon size={24} className="mb-2" />
                  <span className="text-sm font-semibold">
                    {config.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-500 text-sm">!</span>
            </div>
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50/50"
                placeholder={
                  formData.userType === "admin" 
                    ? "admin@university.edu" 
                    : "staff@university.edu"
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50/50"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r ${currentConfig.buttonGradient} hover:opacity-90 disabled:opacity-50 text-white py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <LogIn size={20} />
                <span>Login as {currentConfig.label}</span>
              </>
            )}
          </button>
        </form>

        {/* Additional Links */}
           {/* Footer Information */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Contact system administrator if you need account access
          </p>
        </div>

        {/* Student Login Link */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Student?{" "}
            <a 
              href="/student-login" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Student Login
            </a>
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} University Clearance System. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default StaffAdminLogin;