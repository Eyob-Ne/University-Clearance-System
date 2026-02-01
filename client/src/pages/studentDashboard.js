import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Clock, FileDown, Download, FileText, Info, X } from "lucide-react";

function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [clearance, setClearance] = useState(null);
  const [clearanceReasons, setClearanceReasons] = useState(null); // NEW: Store reasons
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [selectedRejection, setSelectedRejection] = useState(null); // NEW: Track which rejection is clicked
  const [systemStatus, setSystemStatus] = useState(null);
  const [checkingSystem, setCheckingSystem] = useState(true);
  const token = localStorage.getItem("studentToken");
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Fetch Student Info and Clearance
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        // Fetch student profile
        const studentRes = await axios.get(`${API_BASE_URL}/api/student/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudent(studentRes.data);

        // Fetch clearance info WITH REASONS - UPDATED
        try {
          const clearanceRes = await axios.get(`${API_BASE_URL}/api/clearance/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          // Set clearance statuses
          setClearance(clearanceRes.data.clearance || null);
          
          // NEW: Set clearance reasons if available
          if (clearanceRes.data.clearanceReasons) {
            setClearanceReasons(clearanceRes.data.clearanceReasons);
          }
        } catch (clearanceErr) {
          console.log("No clearance data found:", clearanceErr.message);
          setClearance(null);
          setClearanceReasons(null);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching student data:", err.response?.data || err.message);
        setLoading(false);
      }
    };

    if (token) {
      fetchStudentData();
      fetchSystemStatus();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Fetch system status
const fetchSystemStatus = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/system/status`);
    setSystemStatus(res.data.data);
  } catch (err) {
    console.error("Failed to fetch system status");
  } finally {
    setCheckingSystem(false);
  }
};


  // Map badge color by status
  const badgeColor = (status) => {
    switch (status) {
      case "Cleared":
        return "bg-green-100 text-green-700 border-green-300";
      case "Rejected":
        return "bg-red-100 text-red-700 border-red-300";
      case "Approved":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
    }
  };

  const badgeIcon = (status) => {
    switch (status) {
      case "Cleared":
      case "Approved":
        return <CheckCircle size={20} className="text-green-600" />;
      case "Rejected":
        return <XCircle size={20} className="text-red-600" />;
      default:
        return <Clock size={20} className="text-yellow-600" />;
    }
  };

  // NEW: Function to handle rejection card click
  const handleRejectionClick = (section, status, reason) => {
    if (status === "Rejected" && reason) {
      setSelectedRejection({
        section,
        reason
      });
    }
  };

  // NEW: Function to close rejection modal
  const closeRejectionModal = () => {
    setSelectedRejection(null);
  };

 const startClearance = async () => {
  try {
    setStarting(true);
    const res = await axios.post(
      `${API_BASE_URL}/api/clearance/start`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    // Check if it's an error response
    if (res.data.success === false) {
      // This is the clearance window error
      alert(`❌ ${res.data.message}`);
      if (res.data.opensAt) {
        alert(`System opens on: ${new Date(res.data.opensAt).toLocaleString()}`);
      }
      setStarting(false);
      return;
    }
    
    setClearance(res.data.clearance);
    setStarting(false);
    
    // Refresh student data
    const studentRes = await axios.get(`${API_BASE_URL}/api/student/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStudent(studentRes.data);
    
  } catch (err) {
    console.error("Error starting clearance:", err);
    
    // Improved error handling
    if (err.response?.status === 403) {
      // Clearance window error
      const errorData = err.response.data;
      alert(`❌ ${errorData.message || "Clearance system is closed"}`);
      if (errorData.opensAt) {
        alert(`📅 System opens: ${new Date(errorData.opensAt).toLocaleString()}`);
      }
    } else if (err.response?.status === 401) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else {
      alert(err.response?.data?.message || "Failed to start clearance");
    }
    setStarting(false);
  }
};

  if (loading) {
    return (
      <div className="text-center mt-20 text-xl animate-pulse">
        Loading Dashboard...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center mt-20 text-xl text-red-600">
        Error loading student data. Please check your connection and try again.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-5">
      {/* Header with Student Welcome */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-8 md:p-10 mb-8 overflow-hidden relative">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFFFFF" d="M45.7,-79.4C59.2,-73.3,70.6,-61.7,78.1,-48.3C85.6,-34.9,89.1,-19.8,88.4,-5.1C87.7,9.6,82.8,19.1,76.1,30.7C69.3,42.3,60.7,56,48.8,64.8C36.8,73.6,21.6,77.4,6,70.8C-9.6,64.2,-19.2,47.2,-30.9,35.6C-42.6,24.1,-56.5,18,-66.1,6.9C-75.8,-4.2,-81.3,-20.2,-77.8,-33.9C-74.3,-47.6,-61.8,-59.1,-47.8,-65C-33.8,-70.9,-18.6,-71.2,-2.2,-68.1C14.1,-65,28.2,-58.5,45.7,-79.4Z" transform="translate(100 100)" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 animate-fade-in">
              Welcome back, <span className="text-yellow-300">{student.fullName}!</span>
            </h1>
            <p className="text-blue-100 text-lg md:text-xl mb-6 max-w-3xl">
              Ready to continue your academic journey?
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 mb-8">
        <div className="flex flex-wrap items-center gap-6">
          {/* Student ID */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">ID</span>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Student ID</p>
              <p className="text-gray-800 font-bold text-lg">{student.studentId}</p>
            </div>
          </div>
          
          <div className="h-8 w-px bg-gradient-to-b from-gray-200 to-transparent"></div>
          
          {/* Department */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold">DP</span>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Department</p>
              <p className="text-gray-800 font-bold text-lg">{student.department}</p>
            </div>
          </div>
          
          <div className="h-8 w-px bg-gradient-to-b from-gray-200 to-transparent"></div>
          
          {/* Year */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold">YR</span>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Academic Year</p>
              <p className="text-gray-800 font-bold text-lg">Year {student.year}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Start Clearance Section */}
      {(!clearance && systemStatus) ? (

        <div className="bg-white p-8 text-center shadow rounded-xl border">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            You have not started your clearance yet.
          </h2>
          <button
            onClick={startClearance}
            disabled={starting || !systemStatus.isOpen}
            className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="flex items-center justify-center gap-3">
              {starting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Initializing Clearance...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>
                  {!systemStatus.isOpen
                  ? "Clearance Closed"
                  : "Start Clearance Process"}
              </span>
                </>
              )}
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          {/* System Status Message */}
{!systemStatus.isOpen && (
  <div className="mt-6 mb-8 animate-slideDown">
    <div className="relative flex rounded-2xl bg-white shadow-lg border-l-4 border-amber-500 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Left accent bar */}
      <div className="w-2 bg-gradient-to-b from-amber-500 to-orange-500"></div>
      
      <div className="flex-1 p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="h-14 w-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xl font-bold text-gray-900">Clearance System Closed</h3>
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                🔒
              </span>
            </div>
            
            <p className="text-gray-700 mb-6">
              {systemStatus.message}
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              {systemStatus.opensIn && (
                <div className="flex items-center gap-2 text-gray-800">
                  <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Expected to reopen in:</span>
                  <span className="font-bold">{systemStatus.opensIn}</span>
                </div>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="ml-auto px-5 py-2.5 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-all duration-300 shadow-sm hover:shadow"
              >
                Check Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
        </div>
        
      ) : (
        <>
          {/* Clearance Overview Card */}
          <div className="bg-white p-6 shadow rounded-xl border mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Clearance Status
              {clearanceReasons && Object.values(clearanceReasons).some(r => r) && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Click on rejected items to see reasons)
                </span>
              )}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatusCard
                title="Department"
                status={clearance.departmentStatus}
                icon={badgeIcon(clearance.departmentStatus)}
                color={badgeColor(clearance.departmentStatus)}
                isRejected={clearance.departmentStatus === "Rejected"}
                rejectionReason={clearanceReasons?.department || ""}
                onClick={() => handleRejectionClick(
                  "Department", 
                  clearance.departmentStatus, 
                  clearanceReasons?.department || ""
                )}
              />

              <StatusCard
                title="Library"
                status={clearance.libraryStatus}
                icon={badgeIcon(clearance.libraryStatus)}
                color={badgeColor(clearance.libraryStatus)}
                isRejected={clearance.libraryStatus === "Rejected"}
                rejectionReason={clearanceReasons?.library || ""}
                onClick={() => handleRejectionClick(
                  "Library", 
                  clearance.libraryStatus, 
                  clearanceReasons?.library || ""
                )}
              />

              <StatusCard
                title="Dormitory"
                status={clearance.dormStatus}
                icon={badgeIcon(clearance.dormStatus)}
                color={badgeColor(clearance.dormStatus)}
                isRejected={clearance.dormStatus === "Rejected"}
                rejectionReason={clearanceReasons?.dormitory || ""}
                onClick={() => handleRejectionClick(
                  "Dormitory", 
                  clearance.dormStatus, 
                  clearanceReasons?.dormitory || ""
                )}
              />

              <StatusCard
                title="Finance"
                status={clearance.financeStatus}
                icon={badgeIcon(clearance.financeStatus)}
                color={badgeColor(clearance.financeStatus)}
                isRejected={clearance.financeStatus === "Rejected"}
                rejectionReason={clearanceReasons?.finance || ""}
                onClick={() => handleRejectionClick(
                  "Finance", 
                  clearance.financeStatus, 
                  clearanceReasons?.finance || ""
                )}
              />

              <StatusCard
                title="Sport Master"
                status={clearance.registrarStatus}
                icon={badgeIcon(clearance.registrarStatus)}
                color={badgeColor(clearance.registrarStatus)}
                isRejected={clearance.registrarStatus === "Rejected"}
                rejectionReason={clearanceReasons?.registrar || ""}
                onClick={() => handleRejectionClick(
                  "Sport Master", 
                  clearance.registrarStatus, 
                  clearanceReasons?.registrar || ""
                )}
              />

              <StatusCard
                title="Cafeteria"
                status={clearance.cafeteriaStatus}
                icon={badgeIcon(clearance.cafeteriaStatus)}
                color={badgeColor(clearance.cafeteriaStatus)}
                isRejected={clearance.cafeteriaStatus === "Rejected"}
                rejectionReason={clearanceReasons?.cafeteria || ""}
                onClick={() => handleRejectionClick(
                  "Cafeteria", 
                  clearance.cafeteriaStatus, 
                  clearanceReasons?.cafeteria || ""
                )}
              />
            </div>
          </div>

          {/* Overall Status */}
          <div className="bg-white p-6 shadow rounded-xl border text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Registrar</h2>

            <div className={`inline-flex items-center gap-2 px-5 py-2 border rounded-full text-lg font-semibold ${badgeColor(clearance.overallStatus)}`}>
              {badgeIcon(clearance.overallStatus)}
              <span className="capitalize">{clearance.overallStatus}</span>
            </div>
          </div>

          {/* Certificate Section */}
          <CertificateSection student={student} clearance={clearance} />
        </>
      )}

      {/* NEW: Rejection Reason Modal */}
      {selectedRejection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeRejectionModal}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <XCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Rejection Details</h3>
                    <p className="text-rose-100 text-sm">
                      {selectedRejection.section} Section
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeRejectionModal}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Rejection Reason</h4>
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-rose-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-rose-800">{selectedRejection.reason}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-700 mb-1 flex items-center">
                  <Info className="h-4 w-4 mr-1.5" />
                  What to do next?
                </h4>
                <p className="text-sm text-blue-600">
                  Please contact the {selectedRejection.section} office to resolve this issue and request clearance again.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={closeRejectionModal}
                className="w-full py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// UPDATED StatusCard Component
function StatusCard({ title, status, icon, color, isRejected, rejectionReason, onClick }) {
  const isClickable = isRejected && rejectionReason;
  
  return (
    <div 
      className={`p-5 border rounded-xl shadow-sm bg-gray-50 transition-all duration-200 ${
        isClickable 
          ? 'hover:bg-gray-100 hover:shadow-md cursor-pointer hover:-translate-y-0.5' 
          : 'cursor-default'
      }`}
      onClick={isClickable ? onClick : undefined}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 border px-3 py-1 rounded-full w-fit ${color}`}>
          {icon}
          <span className="font-medium capitalize">{status}</span>
        </div>
        
        {/* Show info icon if there's a rejection reason */}
        {isClickable && (
          <div className="flex items-center text-sm text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
            <Info className="h-4 w-4 mr-1" />
            <span className="font-medium">Click for details</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Certificate Section Component (unchanged)
const CertificateSection = ({ student, clearance }) => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const generateCertificate = async () => {
    if (clearance?.overallStatus !== "Approved") {
      setError("You must complete all clearance procedures first");
      return;
    }

    setGenerating(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("studentToken");
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;      
      const response = await axios.post(
        `${API_BASE_URL}/api/certificates/generate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MAU-Clearance-${student.studentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess("Certificate downloaded successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate certificate");
    } finally {
      setGenerating(false);
    }
  };

  const isFullyCleared = clearance?.overallStatus === "Approved";

  return (
    <div className="bg-white p-6 shadow rounded-xl border mb-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <FileText className="text-blue-600" size={24} />
        Clearance Certificate
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 mb-2">
            {isFullyCleared ? (
              <span className="flex items-center gap-2 text-green-600">
                <CheckCircle size={20} />
                You are eligible for clearance certificate
              </span>
            ) : (
              <span className="flex items-center gap-2 text-yellow-600">
                <Clock size={20} />
                Complete all clearance procedures to generate certificate
              </span>
            )}
          </p>
          <p className="text-sm text-gray-500">
            Certificate includes QR code for verification and expires after 1 month
          </p>
        </div>

        <button
          onClick={generateCertificate}
          disabled={!isFullyCleared || generating}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
        >
          {generating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Download size={20} />
          )}
          Download Certificate
        </button>
      </div>
    </div>
  );
};

export default StudentDashboard;