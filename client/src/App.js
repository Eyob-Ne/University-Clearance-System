import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { FaHome, FaUserGraduate, FaUserShield, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

import Home from "./pages/home"; 
import StudentRegister from "./pages/studentRegister";
import StudentLogin from "./pages/studentLogin";
import StudentDashboard from "./pages/studentDashboard";
import AdminDashboard from "./pages/adminDashboard";
import CreateStaff from "./pages/createStaff";
import StaffDashboard from "./pages/staffDashboard";
import StaffAdminLogin from "./pages/StaffAdminLogin";
import ResetPassword from "./pages/resetPassword";
import Verification from "./pages/verification";
import "./App.css";

function App() {
  const navItems = [
    { to: "/", label: "Home", icon: <FaHome className="mr-2" /> },
    { to: "/staff-admin/login", label: "Staff", icon: <FaUserShield className="mr-2" /> },
    { to: "/student-login", label: "Student Portal", icon: <FaUserGraduate className="mr-2" /> },
  ];

  const getNavLinkClass = ({ isActive }) =>
    `flex items-center px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
      isActive 
        ? "bg-yellow-400 text-gray-900 font-bold shadow-lg transform scale-105" 
        : "text-white hover:bg-blue-600 hover:shadow-md hover:transform hover:scale-105"
    }`;

  return (
    <Router>
      <div className="App min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-gray-100 font-sans">

        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-2xl">
          <div className="mx-auto flex justify-between items-center px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-full p-2 shadow-lg">
                <span className="text-2xl text-blue-800">🎓</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-yellow-100 to-yellow-100 bg-clip-text text-transparent">
                  MAU Clearance
                </h1>
                <p className="text-xs text-blue-200 mt-1">Mekdela Amba University</p>
              </div>
            </div>

            <nav className="hidden md:flex space-x-3">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={getNavLinkClass}>
                  {item.icon} {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="md:hidden bg-blue-700 p-2 rounded-lg">
              <FaHome className="text-yellow-400 text-xl" />
            </div>
          </div>
        </header>

        {/* MAIN CONTENT — FIXED (NO GAP TOP/BOTTOM) */}
        <main className="flex-grow w-full px-0 py-0 m-0">
          <Routes>
            <Route path="/" element={<Home />} /> 
            <Route path="/student-login" element={<StudentLogin />} />
            <Route path="/student-register" element={<StudentRegister />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/create-staff" element={<CreateStaff />} />
            <Route path="/dashboard/cafeteria" element={<StaffDashboard />} />
            <Route path="/dashboard/department" element={<StaffDashboard />} />
            <Route path="/dashboard/library" element={<StaffDashboard />} />
            <Route path="/dashboard/dormitory" element={<StaffDashboard />} />
            <Route path="/dashboard/finance" element={<StaffDashboard />} />
            <Route path="/dashboard/registrar" element={<StaffDashboard />} />
            <Route path="/staff-admin/login" element={<StaffAdminLogin />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify/:certificateCode" element={<Verification />} />
          </Routes>
        </main>

        {/* FOOTER */}
        <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white border-t-4 border-yellow-400">
          <div className="container mx-auto px-6 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

              <div className="md:col-span-1 lg:col-span-2 space-y-4">
                <h3 className="text-2xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                  MAU Clearance System
                </h3>
                <p className="text-blue-200 text-sm leading-relaxed mt-2 max-w-lg">
                  Committed to excellence in education and smooth student clearance.
                </p>

                <div className="flex space-x-3 pt-2">
                  <a href="#" className="text-blue-300 hover:text-yellow-400 bg-blue-700 p-2 rounded-full"><FaFacebook size={18} /></a>
                  <a href="#" className="text-blue-300 hover:text-yellow-400 bg-blue-700 p-2 rounded-full"><FaTwitter size={18} /></a>
                  <a href="#" className="text-blue-300 hover:text-yellow-400 bg-blue-700 p-2 rounded-full"><FaLinkedin size={18} /></a>
                  <a href="#" className="text-blue-300 hover:text-yellow-400 bg-blue-700 p-2 rounded-full"><FaInstagram size={18} /></a>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-yellow-400 border-b border-blue-700 pb-2">Quick Resources</h4>
                <div className="space-y-3">
                  <a href="#" className="flex items-center space-x-3 p-3 bg-blue-800/50 rounded-lg hover:bg-blue-800 transition-all group">
                    <span className="text-yellow-400 text-lg group-hover:scale-110">❓</span>
                    <span className="text-blue-200 group-hover:text-white text-sm">FAQ & Help Center</span>
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-yellow-400 border-b border-blue-700 pb-2">Contact Info</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 text-blue-200">
                    <FaMapMarkerAlt className="text-yellow-400 mt-1" />
                    <span className="text-sm">Mekdela Amba University, Tulu Awulia, Ethiopia</span>
                  </div>
                  <div className="flex items-center space-x-3 text-blue-200">
                    <FaPhone className="text-yellow-400" />
                    <a href="tel:+251983151264" className="text-sm hover:text-yellow-400">+251 983151264</a>
                  </div>
                  <div className="flex items-center space-x-3 text-blue-200">
                    <FaEnvelope className="text-yellow-400" />
                    <a href="mailto:eyoba8315@gmail.com" className="text-sm hover:text-yellow-400">eyoba8315@gmail.com</a>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="border-t border-blue-700">
            <div className="container mx-auto px-6 py-4">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-blue-300 text-sm">
                  © {new Date().getFullYear()} Mekdela Amba University Clearance System.
                </p>
                <p className="text-yellow-400 text-sm font-medium mt-2 md:mt-0">
                  Developed for University Students
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
