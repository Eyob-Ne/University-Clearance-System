import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle, Clock, User, GraduationCap, Calendar } from "lucide-react";

const Verification = () => {
  const { certificateCode } = useParams();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        const response = await axios.get(
          `https://clearance-system-backend.onrender.com/api/certificates/verify/${certificateCode}`
        );
        setVerification(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Verification failed");
      } finally {
        setLoading(false);
      }
    };

    if (certificateCode) {
      verifyCertificate();
    }
  }, [certificateCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            Please check the certificate code and try again.
          </p>
        </div>
      </div>
    );
  }

  const { valid, certificate, message } = verification;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mekdela Amba University
          </h1>
          <p className="text-gray-600">Certificate Verification System</p>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Status Header */}
          <div className={`p-6 text-center ${
            valid ? 'bg-green-50 border-b border-green-200' : 'bg-red-50 border-b border-red-200'
          }`}>
            <div className="flex items-center justify-center gap-3 mb-2">
              {valid ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
              <h2 className="text-2xl font-bold text-gray-900">
                {valid ? 'Valid Certificate' : 'Invalid Certificate'}
              </h2>
            </div>
            <p className={`text-lg font-semibold ${valid ? 'text-green-700' : 'text-red-700'}`}>
              {message}
            </p>
          </div>

          {/* Certificate Details */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Student Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Student Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-semibold text-gray-900">{certificate.student.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Student ID</p>
                    <p className="font-semibold text-gray-900">{certificate.student.studentId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-semibold text-gray-900">{certificate.student.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Year</p>
                    <p className="font-semibold text-gray-900">Year {certificate.student.year}</p>
                  </div>
                </div>
              </div>

              {/* Certificate Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Certificate Details
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Certificate ID</p>
                    <p className="font-semibold text-gray-900">{certificate.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Issue Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(certificate.issueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expiry Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(certificate.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Verification Count</p>
                    <p className="font-semibold text-gray-900">
                      {certificate.verificationCount} times
                    </p>
                  </div>
                  {certificate.lastVerified && (
                    <div>
                      <p className="text-sm text-gray-500">Last Verified</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(certificate.lastVerified).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              This verification was conducted through the official Mekdela Amba University 
              Clearance System. For further verification, contact the university administration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verification;