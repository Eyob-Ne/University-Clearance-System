import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Clock, FileDown, Download, FileText } from "lucide-react";

function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [clearance, setClearance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const token = localStorage.getItem("studentToken");
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  // Fetch Student Info and Clearance
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        // Fetch student profile - FIXED URL
        const studentRes = await axios.get(`${API_BASE_URL}/api/student/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudent(studentRes.data);

        // Fetch clearance info - FIXED URL
        try {
          const clearanceRes = await axios.get(`${API_BASE_URL}/api/clearance/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setClearance(clearanceRes.data.clearance || null);
        } catch (clearanceErr) {
          console.log("No clearance data found:", clearanceErr.message);
          setClearance(null);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching student data:", err.response?.data || err.message);
        setLoading(false);
      }
    };

    if (token) {
      fetchStudentData();
    } else {
      setLoading(false);
    }
  }, [token]);

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

  const startClearance = async () => {
    try {
      setStarting(true);
      const res = await axios.post(
        `${API_BASE_URL}/api/clearance/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClearance(res.data.clearance);
      setStarting(false);
      // Refresh student data to get updated clearanceStatus
      const studentRes = await axios.get(`${API_BASE_URL}/api/student/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudent(studentRes.data);
    } catch (err) {
      console.error("Error starting clearance:", err);
      alert(err.response?.data?.message || "Failed to start clearance");
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
      {!clearance ? (
        <div className="bg-white p-8 text-center shadow rounded-xl border">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            You have not started your clearance yet.
          </h2>
          <button
              onClick={startClearance}
              disabled={starting}
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
                    <span>Start Clearance Process</span>
                  </>
                )}
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
        </div>
      ) : (
        <>
          {/* Clearance Overview Card */}
          <div className="bg-white p-6 shadow rounded-xl border mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Clearance Status
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatusCard
                title="Department"
                status={clearance.departmentStatus}
                icon={badgeIcon(clearance.departmentStatus)}
                color={badgeColor(clearance.departmentStatus)}
              />

              <StatusCard
                title="Library"
                status={clearance.libraryStatus}
                icon={badgeIcon(clearance.libraryStatus)}
                color={badgeColor(clearance.libraryStatus)}
              />

              <StatusCard
                title="Dormitory"
                status={clearance.dormStatus}
                icon={badgeIcon(clearance.dormStatus)}
                color={badgeColor(clearance.dormStatus)}
              />

              <StatusCard
                title="Finance"
                status={clearance.financeStatus}
                icon={badgeIcon(clearance.financeStatus)}
                color={badgeColor(clearance.financeStatus)}
              />

              <StatusCard
                title="Sport Master"
                status={clearance.registrarStatus}
                icon={badgeIcon(clearance.registrarStatus)}
                color={badgeColor(clearance.registrarStatus)}
              />

              <StatusCard
                title="Cafeteria"
                status={clearance.cafeteriaStatus}
                icon={badgeIcon(clearance.cafeteriaStatus)}
                color={badgeColor(clearance.cafeteriaStatus)}
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
    </div>
  );
}

function StatusCard({ title, status, icon, color }) {
  return (
    <div className="p-5 border rounded-xl shadow-sm bg-gray-50 hover:bg-gray-100 transition">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <div className={`flex items-center gap-2 border px-3 py-1 rounded-full w-fit ${color}`}>
        {icon}
        <span className="font-medium capitalize">{status}</span>
      </div>
    </div>
  );
}

// Certificate Section Component
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