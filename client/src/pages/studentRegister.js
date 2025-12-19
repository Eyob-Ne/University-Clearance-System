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
  BadgeCheck,
  Smile,
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
                <p className="text-blue-100 text-sm mt-1">
                  Quick and secure account setup
                </p>
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
            ) : (
              /* Step 2: Student Information & Password Setup */
              <div className="space-y-6">
                {/* Welcome and Student Info */}
                <div className="text-center">
                  <div className="inline-flex p-4 bg-blue-50 rounded-2xl mb-4">
                    <div className="relative">
                      <BadgeCheck className="text-green-500" size={40} />
                      <div className="absolute -top-1 -right-1 bg-green-100 rounded-full p-1">
                        <Check className="text-green-600" size={14} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 mb-4 border border-blue-200">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Smile className="text-blue-600" size={24} />
                      <h2 className="text-xl font-bold text-blue-900">
                        Welcome, {studentInfo.fullName}!
                      </h2>
                    </div>
                    
                    <p className="text-gray-700 mb-4 text-sm">
                      <span className="font-medium text-blue-800">Is this you?</span> Please verify your information below
                    </p>
                    
                    <div className="bg-white rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Student ID</span>
                        <span className="font-semibold text-blue-700">{studentInfo.studentId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Department</span>
                        <span className="font-semibold text-gray-800">{studentInfo.department}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Year</span>
                        <span className="font-semibold text-gray-800">Year {studentInfo.year}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">
                    <span className="font-medium text-blue-700">Verified successfully!</span> Now create your password
                  </p>
                </div>

                {/* Password Setup */}
                <div className="space-y-5">
                  {/* Password */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Create Password
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                        <Lock size={20} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="Enter a secure password"
                        className="w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-400 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600 text-xs">Password strength</span>
                          <span className={`text-xs font-medium ${
                            passwordStrength === 0 ? 'text-red-500' :
                            passwordStrength <= 2 ? 'text-amber-500' :
                            passwordStrength <= 3 ? 'text-blue-500' :
                            'text-green-500'
                          }`}>
                            {passwordStrength === 0 ? 'Very weak' :
                             passwordStrength <= 2 ? 'Weak' :
                             passwordStrength <= 3 ? 'Good' :
                             'Strong'}
                          </span>
                        </div>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                i <= passwordStrength ? 
                                  passwordStrength === 0 ? 'bg-red-400' :
                                  passwordStrength <= 2 ? 'bg-amber-400' :
                                  passwordStrength <= 3 ? 'bg-blue-400' :
                                  'bg-green-500' : 
                                'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                        <Lock size={20} />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-400 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    
                    {/* Password Match Indicator */}
                    {password && confirmPassword && (
                      <div className="mt-2 flex items-center gap-2">
                        {password === confirmPassword ? (
                          <>
                            <CheckCircle size={16} className="text-green-500" />
                            <span className="text-green-600 text-xs font-medium">Passwords match</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={16} className="text-red-500" />
                            <span className="text-red-600 text-xs font-medium">Passwords don't match</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <p className="text-blue-800 text-sm font-medium mb-2">Password Requirements:</p>
                    <ul className="text-gray-600 text-xs space-y-1">
                      <li className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        At least 6 characters
                      </li>
                      <li className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        One uppercase letter
                      </li>
                      <li className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        One number
                      </li>
                      <li className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${/[^A-Za-z0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        One special character
                      </li>
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleReset}
                      className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 hover:text-gray-900 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="rotate-180" size={16} />
                      Back
                    </button>
                    <button
                      onClick={handleCreateAccount}
                      disabled={loading || password !== confirmPassword || password.length < 6}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          Complete Registration
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
              
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-500 text-xs">
                  Backend connected: <span className="font-medium text-blue-600">localhost:5000</span>
                </span>
              </div>
              
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