import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  CheckCircle, 
  ArrowLeft,
  Key,
  Shield,
  Smartphone,
  Clock,
  AlertCircle,
  ArrowRight,
  XCircle,
  ShieldCheck,
} from "lucide-react";

function StudentLogin() {
  const navigate = useNavigate();

  // ✨ Login states
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✨ Forgot Password + OTP states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL + "/api";

  // ✅ Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setSuccessMessage(""); setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/student/auth/login`, {
        studentId, password
      });

      localStorage.setItem("studentToken", res.data.token);
      localStorage.setItem("studentData", JSON.stringify(res.data.student));
      navigate("/student-dashboard");

    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Check credentials");
    } finally { setLoading(false); }
  };

  // 🔹 Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(""); setSuccessMessage(""); setForgotPasswordLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/student/auth/forgot-password`, {
        email: forgotPasswordEmail,
      });

      setSuccessMessage(res.data.message);
      setStep(2); // move to OTP input
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP");
    } finally { setForgotPasswordLoading(false); }
  };

  // 🔹 Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(""); setSuccessMessage(""); setForgotPasswordLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/student/auth/verify-otp`, {
        email: forgotPasswordEmail,
        otp
      });

      setSuccessMessage(res.data.message);
      setStep(3); // move to new password input
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP");
    } finally { setForgotPasswordLoading(false); }
  };

  // 🔹 Step 3: Set new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(""); setSuccessMessage(""); setForgotPasswordLoading(true);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setForgotPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/student/auth/reset-password`, {
        email: forgotPasswordEmail,
        otp,
        newPassword
      });

      setSuccessMessage(res.data.message);
      setTimeout(() => {
        setShowForgotPassword(false);
        setStep(1);
        setForgotPasswordEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setSuccessMessage("");
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally { setForgotPasswordLoading(false); }
  };

  // 🔹 Reset Forgot Password form
  const resetForgotPasswordForm = () => {
    setShowForgotPassword(false);
    setStep(1);
    setForgotPasswordEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccessMessage("");
  };

  // 🔹 Go back to previous step
  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError("");
      setSuccessMessage("");
    } else {
      resetForgotPasswordForm();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Forgot Password Fullscreen Modal */}
      {showForgotPassword ? (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Key className="text-white h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">
                        {step === 1 && "Reset Your Password"}
                        {step === 2 && "Verify Your Identity"}
                        {step === 3 && "Create New Password"}
                      </h2>
                      <p className="text-blue-100 mt-1">
                        {step === 1 && "Enter your email to receive OTP"}
                        {step === 2 && "Enter the 6-digit code sent to your email"}
                        {step === 3 && "Create a strong new password"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={goBack}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="text-white h-6 w-6" />
                  </button>
                </div>

                {/* Progress Steps */}
                <div className="mt-8 flex items-center justify-center space-x-4">
                  {[1, 2, 3].map((stepNum) => (
                    <div key={stepNum} className="flex items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        step >= stepNum 
                          ? 'bg-white border-white text-blue-600' 
                          : 'border-white/30 text-white'
                      } font-semibold`}>
                        {step > stepNum ? <CheckCircle className="h-5 w-5" /> : stepNum}
                      </div>
                      {stepNum < 3 && (
                        <div className={`w-16 h-1 ${step > stepNum ? 'bg-white' : 'bg-white/30'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="px-8 py-10">
                {/* Success Message */}
                {successMessage && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
                      <span className="text-emerald-700 font-medium">{successMessage}</span>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-xl">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-rose-600 mr-2" />
                      <span className="text-rose-700 font-medium">{error}</span>
                    </div>
                  </div>
                )}

                {/* Step 1: Email Input */}
                {step === 1 && (
                  <form onSubmit={handleSendOtp} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="inline h-4 w-4 mr-1 text-gray-500" />
                        Registered Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="student@gmail.com"
                          required
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        We'll send a 6-digit verification code to this email
                      </p>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={forgotPasswordLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {forgotPasswordLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Sending OTP...
                          </>
                        ) : (
                          <>
                            <Smartphone className="h-5 w-5" />
                            Send Verification Code
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 2: OTP Input */}
                {step === 2 && (
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Shield className="inline h-4 w-4 mr-1 text-gray-500" />
                        6-Digit Verification Code
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl outline-none text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="000000"
                          maxLength="6"
                          required
                        />
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          Expires in 5 minutes
                        </div>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Resend Code
                        </button>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={forgotPasswordLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {forgotPasswordLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Verifying...
                          </>
                        ) : (
                          <>
                            <Shield className="h-5 w-5" />
                            Verify & Continue
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

{/* Step 3: New Password - Modern Compact Design */}
{step === 3 && (
  <div className="space-y-6">
  

    <form onSubmit={handleResetPassword} className="space-y-4">
      {/* Password Inputs */}
      <div className="space-y-3">
        {/* New Password */}
        <div className="group">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200 group-hover:border-blue-300"
              placeholder="Enter new password"
              required
            />
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {/* Password Strength Indicator */}
          {newPassword && (
            <div className="mt-1.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Strength</span>
                <span className={`text-xs font-semibold ${
                  newPassword.length >= 8 ? 'text-emerald-600' : 
                  newPassword.length >= 6 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {newPassword.length >= 8 ? 'Strong' : 
                   newPassword.length >= 6 ? 'Medium' : 'Weak'}
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    newPassword.length >= 8 ? 'bg-emerald-500 w-full' : 
                    newPassword.length >= 6 ? 'bg-amber-500 w-2/3' : 'bg-rose-500 w-1/3'
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="group">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full pl-10 pr-10 py-3 bg-gray-50 border rounded-lg outline-none focus:ring-2 transition-all duration-200 ${
                confirmPassword && newPassword !== confirmPassword
                  ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-500'
                  : confirmPassword && newPassword === confirmPassword
                  ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500'
                  : 'border-gray-300 focus:border-blue-400 focus:ring-blue-500'
              }`}
              placeholder="Confirm new password"
              required
            />
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            
            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                {newPassword === confirmPassword ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-500" />
                )}
              </div>
            )}
          </div>
          
          {/* Password Match Status */}
          {confirmPassword && (
            <div className={`mt-1.5 flex items-center text-xs font-medium ${
              newPassword === confirmPassword ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {newPassword === confirmPassword ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Passwords match
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Passwords don't match
                </>
              )}
            </div>
          )}
        </div>
      </div>

     

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={forgotPasswordLoading || newPassword !== confirmPassword || newPassword.length < 6}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-lg font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {forgotPasswordLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>Securing Account...</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>Update Password</span>
            </>
          )}
        </button>
        
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Back to verification
          </button>
        </div>
      </div>
    </form>
  </div>
)}


                
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Original Login Form (unchanged) */
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="text-white" size={36} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Student Portal
              </h2>
              <p className="text-gray-600">Sign in to your account</p>
            </div>

            {/* Success */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4">
                <CheckCircle className="w-5 h-5 mr-2 inline" />
                {successMessage}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-center">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Student ID"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Password"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="text-right">
                <button type="button" onClick={() => setShowForgotPassword(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Forgot password?
                </button>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg flex items-center justify-center gap-2">
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Lock size={18} />}
                Sign In
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button onClick={() => navigate("/student-register")}
                  className="text-blue-600 hover:text-blue-700 font-medium">
                  Create Account
                </button>
              </p>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} University Clearance System
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentLogin;