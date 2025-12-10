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
      <div className="bg-white p-6 shadow rounded-xl border mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome, {student.fullName}!
        </h1>
        <p className="text-gray-600 text-lg">
          Student ID: <span className="font-semibold">{student.studentId}</span> 
          {" | "}
          Department: <span className="font-semibold">{student.department}</span>
          {" | "}
          Year: <span className="font-semibold">{student.year}</span>
        </p>
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
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition disabled:opacity-50"
          >
            {starting ? "Starting..." : "Start Clearance Process"}
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
                title="Registrar"
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Overall Status</h2>

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