import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  CheckCircle,
  XCircle,
  User,
  GraduationCap,
  Calendar,
  Clock,
  Shield,
  Award,
  Fingerprint,
  Mail,
  Phone,
  Building2,
  Hash,
  BadgeCheck,
  FileCheck,
  AlertCircle,
  BookOpen,
  Users,
  CheckSquare,
  Download,
  Printer,
  Share2,
  Sparkles
} from "lucide-react";

const statusStyle = (status) => {
  switch(status) {
    case "Cleared":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    case "Rejected":
      return "bg-rose-100 text-rose-700 border border-rose-200";
    default:
      return "bg-amber-100 text-amber-700 border border-amber-200";
  }
};

const Verification = () => {
  const { certificateCode } = useParams();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [showShareOptions, setShowShareOptions] = useState(false);

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/certificates/verify/${certificateCode}`
        );
        setVerification(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Verification failed");
      } finally {
        setLoading(false);
      }
    };

    if (certificateCode) verifyCertificate();
  }, [certificateCode]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (days > 30) return { text: `${days} days`, color: 'text-emerald-600' };
    if (days > 7) return { text: `${days} days`, color: 'text-amber-600' };
    return { text: `${days} days`, color: 'text-rose-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <Sparkles className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Verifying Certificate</h3>
          <p className="text-slate-600">Please wait while we validate the authenticity...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border border-red-100">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <XCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Verification Failed</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <p className="text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Please check the certificate code and try again
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { valid, certificate, message, summary } = verification;
  const history = certificate?.approvalHistory || [];
  const expiryInfo = getDaysUntilExpiry(certificate?.expiryDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header with University Branding */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border border-white/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  Mekdela Amba University
                </h1>
                <p className="text-slate-600 flex items-center gap-2 mt-1">
                  <Shield className="w-4 h-4" />
                  Certificate Verification System 
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 px-4 py-2 rounded-full text-sm text-slate-600 flex items-center gap-2">
                <Fingerprint className="w-4 h-4" />
                v2.0.1
              </div>
              
            </div>
          </div>
        </div>

        {/* Main Status Card */}
        <div className={`relative overflow-hidden rounded-3xl shadow-2xl mb-8 ${
          valid ? "bg-gradient-to-r from-emerald-500 to-teal-600" : "bg-gradient-to-r from-rose-500 to-red-600"
        }`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full -ml-20 -mb-20"></div>
          
          <div className="p-6 border rounded-lg bg-white shadow-sm">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

    {/* Left side — status + message */}
    <div className="flex items-center gap-4">

      <div
        className={`w-12 h-12 flex items-center justify-center rounded-full ${
          valid ? "bg-green-100" : "bg-red-100"
        }`}
      >
        {valid ? (
          <CheckCircle className="w-6 h-6 text-green-600" />
        ) : (
          <XCircle className="w-6 h-6 text-red-600" />
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          {valid ? "Certificate Verified" : "Certificate Invalid"}
        </h2>

        <p className="text-gray-600 mt-1">{message}</p>
      </div>
    </div>

    {/* Right side — status badge */}
    {valid && (
      <div className="px-4 py-2 rounded-md bg-green-50 border border-green-200 text-green-700 font-medium">
        Active
      </div>
    )}

  </div>
</div>

        </div>

        {/* Quick Stats for Valid Certificates */}
        {valid && certificate?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Departments</p>
                  <p className="text-2xl font-bold text-slate-800">{certificate.summary.departmentsCleared?.length || 0}/6</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Approvals</p>
                  <p className="text-2xl font-bold text-slate-800">{certificate.summary.totalApprovals || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Expires In</p>
                  <p className={`text-2xl font-bold ${expiryInfo.color}`}>{expiryInfo.text}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BadgeCheck className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Verified</p>
                  <p className="text-2xl font-bold text-slate-800">{certificate.verificationCount} times</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-t-xl shadow-lg border-b border-slate-200">
          <div className="flex gap-1 p-1">
            <button
              onClick={() => setActiveTab("details")}
              className={`flex-1 py-4 px-6 rounded-lg font-medium transition-all ${
                activeTab === "details"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <User className="w-5 h-5" />
                Student Details
              </div>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-4 px-6 rounded-lg font-medium transition-all ${
                activeTab === "history"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                Approval History 
              </div>
            </button>
            
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-b-2xl shadow-xl p-8 mb-8 border-t-0">
          
          {/* Student Details Tab */}
          {activeTab === "details" && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm text-slate-500">Student Information</h3>
                    <h4 className="text-2xl font-bold text-slate-800">{certificate.student.fullName}</h4>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Hash className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-600">Student ID:</span>
                    <span className="font-mono font-bold text-slate-800">{certificate.student.studentId}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-600">Department:</span>
                    <span className="font-semibold text-slate-800">{certificate.student.department}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-600">Year:</span>
                    <span className="font-semibold text-slate-800">Year {certificate.student.year}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm text-slate-500">Certificate Information</h3>
                    <h4 className="text-2xl font-bold text-slate-800">Clearance Certificate</h4>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Fingerprint className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-600">Certificate ID:</span>
                    <span className="font-mono font-bold text-slate-800">{certificate.id}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-600">Issue Date:</span>
                    <span className="font-semibold text-slate-800">{formatDate(certificate.issueDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-600">Expiry Date:</span>
                    <span className={`font-semibold ${expiryInfo.color}`}>
                      {formatDate(certificate.expiryDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Approval History Tab */}
          {activeTab === "history" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FileCheck className="w-6 h-6 text-blue-600" />
                  Staff Clearance History
                </h3>
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  {history.length} {history.length === 1 ? 'Approval' : 'Approvals'}
                </span>
              </div>
              
              {history.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <Clock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">No approval history available</p>
                  <p className="text-sm text-slate-500 mt-2">Clearance approvals will appear here</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-slate-100 to-slate-50">
                      <tr>
                        <th className="p-4 text-left text-sm font-semibold text-slate-700">Department</th>
                        <th className="p-4 text-left text-sm font-semibold text-slate-700">Approved By</th>
                        <th className="p-4 text-left text-sm font-semibold text-slate-700">Status</th>
                        <th className="p-4 text-left text-sm font-semibold text-slate-700">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {history.map((h, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-medium text-slate-800">{h.department}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3 text-blue-600" />
                              </div>
                              <span className="text-slate-700">{h.approvedBy}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusStyle(h.status)}`}>
                              {h.status}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-slate-600">
                            {formatDate(h.date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            This is an official verification from Mekdela Amba University. 
            For any inquiries, please contact the Registrar's Office.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            © 2026 Mekdela Amba University. All rights reserved. | Version 2.0.1
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verification;