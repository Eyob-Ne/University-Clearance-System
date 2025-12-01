import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Copy, CheckCircle } from "lucide-react";

function StudentLogin() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setResetUrl("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/student/auth/login`, {
        studentId,
        password,
      });

      localStorage.setItem("studentToken", res.data.token);
      localStorage.setItem("studentData", JSON.stringify(res.data.student));
      navigate("/student-dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setResetUrl("");
    setCopied(false);
    setForgotPasswordLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/student/auth/forgot-password`, {
        email: forgotPasswordEmail,
      });

      if (res.data.message && res.data.message.includes("If an account with that email exists")) {
        // This is the security message when email doesn't exist
        setSuccessMessage("If an account with that email exists, reset instructions have been sent.");
      } else {
        setSuccessMessage("Password reset link generated successfully");
      }
      
      if (res.data.resetUrl) {
        setResetUrl(res.data.resetUrl);
      }
    } catch (err) {
      // Check if it's a 404 error (email not found)
      if (err.response?.status === 404) {
        setError("No student account found with this email address.");
      } else {
        setError(err.response?.data?.error || "Failed to send reset instructions. Please try again.");
      }
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetForgotPasswordForm = () => {
    setShowForgotPassword(false);
    setError("");
    setSuccessMessage("");
    setResetUrl("");
    setForgotPasswordEmail("");
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="text-white" size={36} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Student Portal
            </h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {/* Reset URL Display */}
          {resetUrl && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-800 text-sm font-medium">Reset Link:</span>
                <button
                  onClick={() => copyToClipboard(resetUrl)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm transition-colors"
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
              <a
                href={resetUrl}
                className="text-blue-600 underline text-sm break-all hover:text-blue-800 transition-colors"
              >
                {resetUrl}
              </a>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-center">
              {error}
            </div>
          )}

          {/* Forgot Password Form */}
          {showForgotPassword ? (
            <div className="space-y-6">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter your registered email"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {forgotPasswordLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Mail size={18} />
                    )}
                    Get Reset Link
                  </button>
                  <button
                    type="button"
                    onClick={resetForgotPasswordForm}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-all duration-200"
                  >
                    Back
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Main Login Form */
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Student ID */}
              <div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Student ID"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Lock size={18} />
                )}
                Sign In
              </button>
            </form>
          )}

          {/* Register Link */}
          {!showForgotPassword && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/student-register")}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Create Account
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} University Clearance System
          </p>
        </div>
      </div>
    </div>
  );
}

export default StudentLogin;