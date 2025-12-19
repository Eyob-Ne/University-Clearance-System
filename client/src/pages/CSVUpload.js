import React, { useState } from "react";
import axios from "axios";
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Download, RefreshCw } from "lucide-react";

const CSVUpload = () => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Result

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL + "/api";

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    setError("");
    setUploadResult(null);
    
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['text/csv', 'application/vnd.ms-excel'];
    const isValidType = validTypes.includes(selectedFile.type) || 
                        selectedFile.name.endsWith('.csv');
    
    if (!isValidType) {
      setError("Please select a valid CSV file.");
      return;
    }

    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB.");
      return;
    }

    setFile(selectedFile);
    previewCSV(selectedFile);
  };

  // Preview CSV content
  const previewCSV = (csvFile) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      
      if (lines.length < 2) {
        setError("CSV file is empty or has no data rows.");
        return;
      }

      // Parse headers
      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['studentId', 'fullName', 'department', 'year'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        setError(`Missing required columns: ${missingHeaders.join(', ')}`);
        return;
      }

      // Parse data rows (first 10 rows for preview)
      const dataRows = [];
      for (let i = 1; i < Math.min(lines.length, 11); i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim());
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          dataRows.push(row);
        }
      }

      setPreviewData(dataRows);
      setStep(2); // Move to preview step
    };

    reader.onerror = () => {
      setError("Error reading CSV file.");
    };

    reader.readAsText(csvFile);
  };

  // Upload CSV to backend
  const handleUpload = async () => {
    if (!file) {
      setError("No file selected.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/admin/upload-students`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setUploadResult(response.data);
        setStep(3); // Move to result step
        setFile(null);
        setPreviewData([]);
      } else {
        setError(response.data.message || "Upload failed.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Failed to upload CSV. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

 // Download sample CSV template
const downloadTemplate = () => {
    const template = `studentId,fullName,department,year
MAU2024001,John Doe,Software Engineering,3
MAU2024002,Jane Smith,Computer Science,2
MAU2024003,Robert Johnson,Information Technology,4
MAU2024004,Maria Garcia,Electrical Engineering,1
MAU2024005,David Brown,Mechanical Engineering,3`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

  // Reset form
  const handleReset = () => {
    setFile(null);
    setPreviewData([]);
    setUploadResult(null);
    setError("");
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            <FileSpreadsheet className="inline mr-3 text-blue-600" size={36} />
            Student CSV Upload
          </h1>
          <p className="text-gray-600 text-lg">
            Upload CSV file with student data. Students will verify with their Student ID during registration.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center">
            {[1, 2, 3].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className={`flex flex-col items-center ${step >= stepNum ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= stepNum ? 'bg-blue-100 border-blue-600' : 'bg-gray-100 border-gray-300'}`}>
                    {step > stepNum ? <CheckCircle size={20} /> : stepNum}
                  </div>
                  <span className="text-sm mt-2 font-medium">
                    {stepNum === 1 ? 'Upload CSV' : stepNum === 2 ? 'Preview' : 'Results'}
                  </span>
                </div>
                {stepNum < 3 && (
                  <div className={`w-24 h-1 mx-4 ${step > stepNum ? 'bg-blue-600' : 'bg-gray-300'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start">
            <AlertCircle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
              <XCircle size={20} />
            </button>
          </div>
        )}

        {/* Step 1: File Upload */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
                <Upload className="text-blue-600" size={40} />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Upload Student CSV File</h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Upload a CSV file containing student information. 
                Required columns: <span className="font-semibold text-blue-600">studentId, fullName, department, year</span>. 
                Optional: <span className="text-gray-500">email</span>
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 mb-6 hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="csvFile"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="csvFile"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="text-gray-400 mb-4" size={48} />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {file ? file.name : 'Click to select CSV file'}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {file ? `Size: ${(file.size / 1024).toFixed(1)}KB` : 'Supports .csv files up to 5MB'}
                  </p>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={downloadTemplate}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download Template
                </button>
                <button
                  onClick={() => document.getElementById('csvFile').click()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Upload size={18} />
                  Choose File
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Data Preview */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Preview Upload Data</h2>
                <p className="text-gray-600">Review student data before uploading to database</p>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-all"
              >
                Change File
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  File: <span className="text-blue-600">{file.name}</span>
                </h3>
                <span className="text-sm text-gray-500">
                  Showing first {previewData.length} rows
                </span>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {previewData.length > 0 && 
                        Object.keys(previewData[0]).map((header) => (
                          <th
                            key={header}
                            className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                          >
                            {header}
                            {['studentId', 'fullName', 'department', 'year'].includes(header) && (
                              <span className="ml-1 text-red-500">*</span>
                            )}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {Object.values(row).map((value, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap"
                          >
                            {value || <span className="text-gray-400 italic">empty</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-sm text-gray-500 flex items-center">
                <AlertCircle size={16} className="mr-2" />
                * Required columns. Email is optional.
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={loading}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Confirm & Upload
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Upload Results */}
        {step === 3 && uploadResult && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-600" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                CSV Upload Successful!
              </h2>
              <p className="text-gray-600">
                Student data has been imported to the database.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-700 font-medium mb-1">Total Rows</p>
                <p className="text-2xl font-bold text-blue-900">
                  {uploadResult.summary.totalRows}
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-700 font-medium mb-1">Successfully Processed</p>
                <p className="text-2xl font-bold text-green-900">
                  {uploadResult.summary.successfullyProcessed}
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p className="text-sm text-purple-700 font-medium mb-1">New Students</p>
                <p className="text-2xl font-bold text-purple-900">
                  {uploadResult.summary.newlyCreated}
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-sm text-orange-700 font-medium mb-1">Existing Updated</p>
                <p className="text-2xl font-bold text-orange-900">
                  {uploadResult.summary.alreadyExists}
                </p>
              </div>
            </div>

            {/* Errors Display (if any) */}
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Errors Found ({uploadResult.errors.length} rows)
                </h3>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <ul className="space-y-2">
                    {uploadResult.errors.slice(0, 5).map((err, index) => (
                      <li key={index} className="text-sm text-red-700">
                        <span className="font-medium">Row {err.row}:</span> {err.error}
                      </li>
                    ))}
                    {uploadResult.errors.length > 5 && (
                      <li className="text-sm text-red-600">
                        ... and {uploadResult.errors.length - 5} more errors
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Preview of Imported Data */}
            {uploadResult.preview && uploadResult.preview.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Preview of Imported Students (First 10)
                </h3>
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(uploadResult.preview[0]).map((header) => (
                          <th
                            key={header}
                            className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {uploadResult.preview.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {Object.values(row).map((value, colIndex) => (
                            <td
                              key={colIndex}
                              className="px-4 py-3 text-sm text-gray-800"
                            >
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all"
              >
                Upload Another File
              </button>
              <button
                onClick={() => window.location.href = '/admin-dashboard'}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Instructions Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📋 How It Works
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                1
              </div>
              <span>Upload CSV with student data (studentId, fullName, department, year)</span>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                2
              </div>
              <span>Students will verify their identity using Student ID during registration</span>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                3
              </div>
              <span>Students set their password and email for notifications</span>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                4
              </div>
              <span>Once verified, students can track their clearance status</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CSVUpload;