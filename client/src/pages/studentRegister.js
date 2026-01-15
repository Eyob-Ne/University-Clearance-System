import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  GraduationCap, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  User,
  Lock,
  AlertCircle,
  Loader2,
  Sparkles,
  Fingerprint,
  Smile,
 Building,
 Calendar,
  Shield,
  ArrowLeft,
  ChevronRight,
  Check
} from "lucide-react";

const SimpleStudentRegistration = () => {
  const navigate = useNavigate();
  
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Calculate password strength
  const calculatePasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  // Step 1: Verify Student ID exists
  const handleVerifyStudentId = async () => {
    if (!studentId.trim()) {
      setError("Please enter your Student ID");
      return;
    }

    setVerifying(true);
    setError("");
    setStudentInfo(null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/students/verify/${studentId.trim().toUpperCase()}`
      );

      if (response.data.success) {
        if (response.data.student.accountStatus === "Active") {
          setError("Account already exists. Please login instead.");
          setTimeout(() => navigate("/student-login"), 2000);
          return;
        }

        if (response.data.student.accountStatus === "PendingVerification") {
          setError("Account creation in progress. Please try again later.");
          return;
        }

        setStudentInfo(response.data.student);
        setSuccess(`Welcome, ${response.data.student.fullName}!`);
      } else {
        setError(response.data.message || "Student ID not found");
      }
    } catch (err) {
      if (err.response?.status === 400) {
        const message = err.response.data.message;
        if (message.includes("already active") || message.includes("already claimed")) {
          setError("Account already exists. Please login instead.");
          setTimeout(() => navigate("/student-login"), 2000);
        } else if (message.includes("pending verification")) {
          setError("Account creation in progress. Please try again later.");
        } else {
          setError(message);
        }
      } else if (err.response?.status === 404) {
        setError("Student ID not found. Please contact administrator.");
      } else if (err.code === "ERR_NETWORK") {
        setError("Cannot connect to server. Please check if backend is running.");
      } else {
        setError("Unable to verify Student ID. Please check your connection.");
      }
    } finally {
      setVerifying(false);
    }
  };

  // Create account with just password
  const handleCreateAccount = async () => {
    if (!password) {
      setError("Password is required");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/students/simple-register`,
        {
          studentId: studentId.trim().toUpperCase(),
          password: password
        }
      );

      if (response.data.success) {
        localStorage.setItem("studentToken", response.data.token);
        localStorage.setItem("studentProfile", JSON.stringify(response.data.student));
        
        setSuccess("Account created successfully! Redirecting to dashboard...");
        
        setTimeout(() => {
          navigate("/student-dashboard");
        }, 1500);
      } else {
        setError(response.data.message || "Failed to create account");
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data.message || "Invalid request");
      } else if (err.response?.status === 404) {
        setError("Student not found. Please verify your Student ID.");
      } else if (err.response?.status === 409) {
        setError("Account already exists. Please login instead.");
      } else if (err.code === "ERR_NETWORK") {
        setError("Cannot connect to server. Please check if backend is running.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setStudentId("");
    setPassword("");
    setConfirmPassword("");
    setStudentInfo(null);
    setError("");
    setSuccess("");
    setPasswordStrength(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl"></div>
        </div>

        {/* Main Card */}
        <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
          {/* Header with Blue Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <GraduationCap className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Student Registration
                </h1>
                
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 md:p-8">
            {/* Status Messages */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                  <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
                    <XCircle size={20} />
                  </button>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              </div>
            )}

            {/* Step 1: Student ID Verification */}
            {!studentInfo ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex p-4 bg-blue-100 rounded-2xl mb-4">
                    <Fingerprint className="text-blue-600" size={40} />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Enter Your Student ID
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Start by verifying your student identity
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Student ID
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                      <User size={20} />
                    </div>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                      placeholder="e.g., MAU2024002"
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-400 transition-all duration-200"
                      disabled={verifying}
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-2 ml-1">
                    Enter the Student ID provided by your institution
                  </p>
                </div>

                <button
                  onClick={handleVerifyStudentId}
                  disabled={verifying || !studentId.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Verifying Student ID...
                    </>
                  ) : (
                    <>
                      Verify Student ID
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            ) :(
  <div className="space-y-8">
    {/* Welcome Header */}
    <div className="text-center relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -top-10 -z-10 opacity-10">
        <div className="absolute left-1/4 top-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute right-1/4 top-10 w-24 h-24 bg-emerald-400 rounded-full blur-2xl"></div>
      </div>

      {/* Student Information Card */}
      <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 mb-6 shadow-xl border border-blue-100/50 backdrop-blur-sm overflow-hidden">
        {/* Decorative accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-400 to-blue-500"></div>

        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-grid-blue-500/[0.02] bg-[size:20px_20px]"></div>
        </div>

        <div className="relative">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-sm opacity-50"></div>
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full relative">
                <Smile className="text-white" size={22} />
              </div>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
              Welcome, {studentInfo.fullName}! 👋
            </h2>
          </div>

          <div className="mb-5">
            <p className="text-gray-600 mb-1 text-sm font-medium">Is this you?</p>
            <p className="text-gray-800 text-sm">Please verify your information below</p>
          </div>

          {/* Student Details */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 space-y-4 border border-gray-200/50 shadow-inner">
            <div className="flex items-center justify-between py-2 px-3 bg-gradient-to-r from-blue-50/50 to-transparent rounded-lg hover:bg-blue-50/80 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="text-blue-600" size={16} />
                </div>
                <span className="text-gray-600 text-sm">Student ID</span>
              </div>
              <span className="font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-lg text-sm">
                {studentInfo.studentId}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 px-3 bg-gradient-to-r from-gray-50/50 to-transparent rounded-lg hover:bg-gray-50/80 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Building className="text-gray-600" size={16} />
                </div>
                <span className="text-gray-600 text-sm">Department</span>
              </div>
              <span className="font-semibold text-gray-800">{studentInfo.department}</span>
            </div>

            <div className="flex items-center justify-between py-2 px-3 bg-gradient-to-r from-emerald-50/50 to-transparent rounded-lg hover:bg-emerald-50/80 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Calendar className="text-emerald-600" size={16} />
                </div>
                <span className="text-gray-600 text-sm">Academic Year</span>
              </div>
              <span className="font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                Year {studentInfo.year}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-full border border-blue-200/50 shadow-sm">
          <CheckCircle className="text-emerald-500" size={18} />
          <span className="text-sm font-medium text-blue-800">
            Verified successfully! Now create your password
          </span>
        </div>
      </div>
    </div>

    {/* Password Setup Section */}
    <div className="space-y-6">
      {/* Password Input */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-gray-700 text-sm font-semibold">Create Password</label>
          <span className="text-xs text-gray-500">Make it strong and secure</span>
        </div>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg group-focus-within:from-blue-200 group-focus-within:to-blue-100 transition-all duration-300">
              <Lock className="text-blue-600 group-focus-within:text-blue-700 transition-colors" size={18} />
            </div>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handlePasswordChange}
            placeholder="Create a secure password"
            className="w-full pl-14 pr-12 py-3.5 bg-white/90 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none text-gray-800 placeholder-gray-400 transition-all duration-300 shadow-sm hover:shadow-md"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
          >
            {showPassword ? (
              <EyeOff className="text-gray-600" size={18} />
            ) : (
              <Eye className="text-gray-600" size={18} />
            )}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {password && (
          <div className="mt-4 bg-gradient-to-r from-white to-gray-50/50 rounded-xl p-4 border border-gray-200/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 text-xs font-medium">Password Strength</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                passwordStrength === 0 ? 'bg-red-100 text-red-700' :
                passwordStrength <= 2 ? 'bg-amber-100 text-amber-700' :
                passwordStrength <= 3 ? 'bg-blue-100 text-blue-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                {passwordStrength === 0 ? 'Very Weak' :
                 passwordStrength <= 2 ? 'Needs Improvement' :
                 passwordStrength <= 3 ? 'Good' :
                 'Excellent'}
              </span>
            </div>
            <div className="flex gap-1.5 mb-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                    i <= passwordStrength ? 
                      passwordStrength === 0 ? 'bg-gradient-to-r from-red-400 to-red-500' :
                      passwordStrength <= 2 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                      passwordStrength <= 3 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                      'bg-gradient-to-r from-emerald-400 to-emerald-500' : 
                    'bg-gray-200'
                  } ${i <= passwordStrength ? 'shadow-lg' : ''}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-gray-700 text-sm font-semibold mb-3">Confirm Password</label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
            <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg group-focus-within:from-gray-200 group-focus-within:to-gray-100 transition-all duration-300">
              <Lock className="text-gray-600 group-focus-within:text-gray-700 transition-colors" size={18} />
            </div>
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className="w-full pl-14 pr-12 py-3.5 bg-white/90 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none text-gray-800 placeholder-gray-400 transition-all duration-300 shadow-sm hover:shadow-md"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
          >
            {showConfirmPassword ? (
              <EyeOff className="text-gray-600" size={18} />
            ) : (
              <Eye className="text-gray-600" size={18} />
            )}
          </button>
        </div>

        {/* Password Match Indicator */}
        {password && confirmPassword && (
          <div className={`mt-3 flex items-center gap-2 px-4 py-2.5 rounded-lg border ${
            password === confirmPassword 
              ? 'bg-emerald-50/50 border-emerald-200' 
              : 'bg-red-50/50 border-red-200'
          } transition-all duration-300`}>
            {password === confirmPassword ? (
              <>
                <div className="p-1.5 bg-emerald-100 rounded-full">
                  <CheckCircle className="text-emerald-600" size={16} />
                </div>
                <span className="text-emerald-700 text-sm font-medium">Passwords match! ✓</span>
              </>
            ) : (
              <>
                <div className="p-1.5 bg-red-100 rounded-full">
                  <XCircle className="text-red-600" size={16} />
                </div>
                <span className="text-red-700 text-sm font-medium">Passwords don't match ✗</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Password Requirements */}
      <div className="bg-gradient-to-br from-blue-50/80 to-emerald-50/80 rounded-xl p-5 border border-blue-200/30 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="text-blue-600" size={18} />
          <h3 className="text-blue-800 text-sm font-bold">Password Requirements</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { text: 'At least 6 characters', check: password.length >= 6 },
            { text: 'One uppercase letter', check: /[A-Z]/.test(password) },
            { text: 'One number', check: /[0-9]/.test(password) },
            { text: 'One special character', check: /[^A-Za-z0-9]/.test(password) }
          ].map((req, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                req.check ? 'bg-emerald-500 scale-125' : 'bg-gray-300'
              }`}></div>
              <span className={`text-xs transition-colors duration-300 ${
                req.check ? 'text-gray-800 font-medium' : 'text-gray-500'
              }`}>
                {req.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={handleReset}
          className="flex-1 px-6 py-3.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-300/50 text-gray-700 hover:text-gray-900 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-3 hover:-translate-x-1"
        >
          <ArrowLeft className="text-gray-600" size={18} />
          <span>Back to Previous</span>
        </button>
        <button
          onClick={handleCreateAccount}
          disabled={loading || password !== confirmPassword || password.length < 6}
          className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold transition-all duration-300 hover:shadow-xl hover:shadow-emerald-200 flex items-center justify-center gap-3 group"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <Sparkles className="group-hover:rotate-12 transition-transform duration-300" size={20} />
              <span>Complete Registration</span>
              <ChevronRight className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <div className="text-center space-y-3">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/student-login")}
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                >
                  Login here
                </button>
              </p>
              
              
              
              <p className="text-gray-400 text-xs">
                Student ID must be pre-registered by the administration
              </p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className={`flex items-center gap-2 ${!studentInfo ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${!studentInfo ? 'bg-blue-100 border border-blue-300' : 'bg-gray-100'}`}>
              {studentInfo ? <Check size={12} className="text-gray-500" /> : '1'}
            </div>
            <span className="text-sm font-medium">Verify ID</span>
          </div>
          <div className="w-8 h-1 bg-gray-200 rounded-full"></div>
          <div className={`flex items-center gap-2 ${studentInfo ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${studentInfo ? 'bg-blue-100 border border-blue-300' : 'bg-gray-100'}`}>
              2
            </div>
            <span className="text-sm font-medium">Set Password</span>
          </div>
        </div>
      </div>

      {/* Inline CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SimpleStudentRegistration;