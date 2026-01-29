import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  LogIn, Eye, EyeOff, Lock, Mail, 
  Building, Shield, User, GraduationCap, 
  Sparkles, KeyRound, School
} from "lucide-react";

const UniversalLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hoverEmail, setHoverEmail] = useState(false);
  const [hoverPassword, setHoverPassword] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL + "/api";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(""); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("🌐 Attempting Staff login...");
      
      // First try admin login
      let response;
      try {
        console.log("👑 Attempting admin login...");
        response = await axios.post(`${API_BASE_URL}/admin/login`, {
          email: formData.email,
          password: formData.password,
        });
        console.log("✅ Admin login successful");
        
        // Admin login successful
        localStorage.setItem("adminToken", response.data.token);
        localStorage.setItem("adminProfile", JSON.stringify(response.data.admin || response.data));
        console.log("🔐 Admin token saved to localStorage");
        navigate("/admin-dashboard");
        return;
      } catch (adminError) {
        console.log("🔍 Not an admin, trying staff login...");
      }
      
      // If admin login failed, try staff login
      console.log("👨‍🏫 Attempting staff login...");
      response = await axios.post(`${API_BASE_URL}/staff/login`, {
        email: formData.email,
        password: formData.password,
      });
      
      console.log("✅ Staff login successful:", response.data);

      if (response.data.token) {
        const { token, staff } = response.data;
        localStorage.setItem("staffToken", token);
        
        // Create staff profile with both name and fullName
        const staffProfile = {
          fullName: staff.name,
          name: staff.name,
          email: staff.email,
          role: staff.role,
          department: staff.department,
          id: staff._id
        };
        
        localStorage.setItem("staffProfile", JSON.stringify(staffProfile));
        console.log("📝 Staff profile saved");

        // Redirect based on role
        redirectUserByRole(staff.role);
      } else {
        setError("⚠️ No token received from server");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      
      if (err.response?.status === 401) {
        setError("❌ Invalid email or password. Please try again.");
      } else if (err.response?.data?.message) {
        setError(`❌ ${err.response.data.message}`);
      } else if (err.code === 'ECONNREFUSED') {
        setError("🌐 Cannot connect to server. Please ensure the backend is running.");
      } else {
        setError("❌ Login failed. Please check your credentials and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const redirectUserByRole = (role) => {
    const roleLower = (role || "").toLowerCase();
    
    console.log(`🎯 Redirecting user with role: ${role}`);
    
    // Admin roles
    if (roleLower.includes("super admin") || roleLower.includes("superadmin")) {
      navigate("/admin-dashboard");
    }
    // Staff roles
    else if (roleLower.includes("department")) {
      navigate("/dashboard/department");
    } else if (roleLower.includes("library")) {
      navigate("/dashboard/library");
    } else if (roleLower.includes("dormitory")) {
      navigate("/dashboard/dormitory");
    } else if (roleLower.includes("finance")) {
      navigate("/dashboard/finance");
    } else if (roleLower.includes("registrar")) {
      navigate("/dashboard/registrar");
    } else if (roleLower.includes("cafeteria")) {
      navigate("/dashboard/cafeteria");
    } else {
      // Default staff dashboard for unspecified roles
      navigate("/dashboard/staff");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-indigo-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-2000"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-4000"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f4ff_1px,transparent_1px),linear-gradient(to_bottom,#f0f4ff_1px,transparent_1px)] bg-[size:40px_40px] opacity-10"></div>
        
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-64 h-64 border-t-2 border-l-2 border-blue-200/30 rounded-tl-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 border-b-2 border-r-2 border-purple-200/30 rounded-br-3xl"></div>
      </div>

      {/* Main Login Card */}
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/30 transform transition-all duration-500 hover:shadow-3xl hover:scale-[1.005]">
       

        {/* Header */}
        <div className="text-center mb-10 pt-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Staff Portal
            </h1>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl shadow-inner transform transition-all duration-300 animate-in slide-in-from-top">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-red-500 text-sm font-bold">!</span>
              </div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Email Field */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              Email Address
            </label>
            <div className={`relative transition-all duration-300 ${hoverEmail ? 'transform scale-[1.01]' : ''}`}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform duration-300 group-focus-within:scale-110">
                <Mail className={`h-5 w-5 transition-colors duration-300 ${
                  hoverEmail ? 'text-blue-500' : 'text-gray-400'
                }`} />
              </div>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                onMouseEnter={() => setHoverEmail(true)}
                onMouseLeave={() => setHoverEmail(false)}
                className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 bg-white/80 hover:bg-white shadow-sm hover:shadow-md"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="group">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Lock className="h-4 w-4 text-gray-500" />
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors duration-200 flex items-center gap-1"
              >
                <KeyRound className="h-3.5 w-3.5" />
                {showPassword ? "Hide Password" : "Show Password"}
              </button>
            </div>
            <div className={`relative transition-all duration-300 ${hoverPassword ? 'transform scale-[1.01]' : ''}`}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform duration-300 group-focus-within:scale-110">
                <Lock className={`h-5 w-5 transition-colors duration-300 ${
                  hoverPassword ? 'text-blue-500' : 'text-gray-400'
                }`} />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                onMouseEnter={() => setHoverPassword(true)}
                onMouseLeave={() => setHoverPassword(false)}
                className="w-full pl-12 pr-14 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 bg-white/80 hover:bg-white shadow-sm hover:shadow-md"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors duration-200 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <div className="relative group/btn">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl blur opacity-25 group-hover/btn:opacity-40 transition duration-500"></div>
            <button
              type="submit"
              disabled={loading}
              className="relative w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-bold text-lg transition-all duration-500 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden"
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover/btn:animate-shine"></div>
              
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-6 w-6" />
                  <span>Access Your Dashboard</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Student Portal Link */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600 mb-4 flex items-center justify-center gap-2">
              <GraduationCap className="h-4 w-4" />
            Contact system administrator if you need account access
            </p>
            <a 
              href="/student-login" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-700 font-semibold rounded-xl border border-emerald-200 transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
            >
              <GraduationCap className="h-5 w-5" />
              Go to Student Portal
              <span className="ml-1">→</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} University Clearance System v2.0
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Built with ❤️ for educational institutions
            </p>
          </div>
        </div>
      </div>

      {/* Floating Particles Animation */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-300/30 rounded-full animate-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-particle {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) rotate(720deg); opacity: 0; }
        }
        
        @keyframes shine {
          100% { transform: translateX(100%); }
        }
        
        @keyframes slide-in-from-top {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-particle {
          animation: float-particle linear infinite;
        }
        
        .animate-shine {
          animation: shine 1.5s ease-out;
        }
        
        .animate-in {
          animation: slide-in-from-top 0.3s ease-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }
        
        /* Selection color */
        ::selection {
          background: rgba(99, 102, 241, 0.2);
        }
      `}</style>
    </div>
  );
};

export default UniversalLogin;

