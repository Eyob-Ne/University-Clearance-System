import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { FaHome, FaUserGraduate, FaUserShield,FaYoutube,FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaTelegram, FaBars, FaTimes } from 'react-icons/fa';

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
import Upload from "./pages/CSVUpload";
import College from "./pages/college";
import CreateDepartment from "./pages/createDepartment";
import "./App.css";


// Create a separate component for Header to use useLocation hook
function Header({ isMenuOpen, setIsMenuOpen, navItems, getNavLinkClass, mainContainerClass }) {
  const location = useLocation();
  
  // Define ONLY the staff dashboard routes where header should be hidden
  const hideHeaderOnStaffRoutes = [
    '/dashboard/cafeteria',
    '/dashboard/department',
    '/dashboard/library',
    '/dashboard/dormitory',
    '/dashboard/finance',
    '/dashboard/registrar',
    '/admin-dashboard',
    '/student-dashboard'
  ];
  
  // Check if current route is a staff dashboard route
  const isStaffDashboard = hideHeaderOnStaffRoutes.some(route => 
    location.pathname === route
  );
  
  // Don't render header on staff dashboard routes
  if (isStaffDashboard) {
    return null;
  }
  
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-2xl">
      <div className={`${mainContainerClass} flex justify-between items-center py-3 md:py-4`}>
        
        {/* Logo/Branding */}
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="bg-white rounded-full p-1.5 shadow-lg">
            <span className="text-xl md:text-2xl text-blue-800">🎓</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-yellow-100 to-yellow-100 bg-clip-text text-transparent">
              MAU Clearance
            </h1>
            <p className="hidden sm:block text-xs text-blue-200 mt-0.5">Mekdela Amba University</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-3">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={getNavLinkClass}>
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden bg-blue-700 p-2 rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <FaTimes className="text-yellow-400 text-xl" /> : <FaBars className="text-yellow-400 text-xl" />}
        </button>
      </div>
      
      {/* Mobile Navigation Dropdown */}
      <nav 
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isMenuOpen ? 'max-h-60 opacity-100 py-3 border-t border-blue-700' : 'max-h-0 opacity-0'
        } bg-blue-800`}
      >
        <div className="flex flex-col space-y-2 px-4">
          {navItems.map((item) => (
            <NavLink 
              key={item.to} 
              to={item.to} 
              className={getNavLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}

// Create a separate component for Footer to use useLocation hook
function Footer({ mainContainerClass }) {
  const location = useLocation();
  
  // Define ONLY the staff dashboard routes where footer should be hidden
  const hideFooterOnStaffRoutes = [
    '/dashboard/cafeteria',
    '/dashboard/department',
    '/dashboard/library',
    '/dashboard/dormitory',
    '/dashboard/finance',
    '/dashboard/registrar',
    '/admin-dashboard'
  ];
  
  // Check if current route is a staff dashboard route
  const isStaffDashboard = hideFooterOnStaffRoutes.some(route => 
    location.pathname === route
  );
  
  // Don't render footer on staff dashboard routes
  if (isStaffDashboard) {
    return null;
  }
  
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white border-t-4 border-yellow-400">
      <div className={`${mainContainerClass} py-8 md:py-10`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">

          {/* MAU Clearance Info */}
          <div className="md:col-span-1 lg:col-span-2 space-y-4">
            <h3 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
              MAU Clearance System
            </h3>
            <p className="text-blue-200 text-sm leading-relaxed mt-2 max-w-lg">
              Committed to excellence in education and smooth student clearance.
            </p>

            {/* Social Media Icons */}
            <div className="pt-4">
              <p className="text-gray-400 text-sm font-medium mb-4">Connect with us</p>
              <div className="flex gap-3">
                {[ { icon: <FaFacebook className="w-5 h-5" />, href: "https://web.facebook.com/Mekdela.Amba.University/?_rdc=1&_rdr#", color: "bg-gradient-to-br from-blue-600 to-blue-700" },
                  { icon: <FaYoutube className="w-5 h-5" />, href: "https://www.youtube.com/channel/UCqWmoX39VBK8Augft6tZiEA", color: "bg-gradient-to-br from-red-500 to-red-600" },
                  { icon: <FaTwitter className="w-5 h-5" />, href: "https://x.com/mekdela_amba", color: "bg-gradient-to-br from-sky-500 to-sky-600" },
                  { icon: <FaLinkedin className="w-5 h-5" />, href: "https://et.linkedin.com/company/mekdela-amba-university-mau", color: "bg-gradient-to-br from-blue-700 to-blue-800" },
                  { icon: <FaInstagram className="w-5 h-5" />, href: "https://www.instagram.com/explore/locations/994633437401783/mekdela-amba-university-ethiopia/", color: "bg-gradient-to-br from-pink-500 to-purple-600" },
                  { icon: <FaTelegram className="w-5 h-5" />, href: "https://t.me/s/mekdelauniversity?after=82", color: "bg-gradient-to-br from-blue-500 to-blue-600" },
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${social.color} p-3 rounded-xl hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 group relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative text-white">
                      {social.icon}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Resources */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-yellow-400 border-b border-blue-700 pb-2">Quick Resources</h4>
            <div className="space-y-3">
              <a href="#" className="flex items-center space-x-3 p-3 bg-blue-800/50 rounded-lg hover:bg-blue-800 transition-all group">
                <span className="text-yellow-400 text-lg group-hover:scale-110">❓</span>
                <span className="text-blue-200 group-hover:text-white text-sm">FAQ & Help Center</span>
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-yellow-400 border-b border-blue-700 pb-2">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 text-blue-200">
                <FaMapMarkerAlt className="text-yellow-400 mt-1 flex-shrink-0" />
                <span className="text-sm">Mekdela Amba University, Tulu Awulia, Ethiopia</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-200">
                <FaPhone className="text-yellow-400 flex-shrink-0" />
                <a href="tel:+251983151264" className="text-sm hover:text-yellow-400 transition-colors">+251 983151264</a>
              </div>
              <div className="flex items-center space-x-3 text-blue-200">
                <FaEnvelope className="text-yellow-400 flex-shrink-0" />
                <a href="mailto:eyoba8315@gmail.com" className="text-sm hover:text-yellow-400 transition-colors">eyoba8315@gmail.com</a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright Section */}
      <div className="border-t border-blue-700">
        <div className={`${mainContainerClass} py-4`}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-300 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Mekdela Amba University Clearance System.
            </p>
            <p className="text-yellow-400 text-sm font-medium mt-2 md:mt-0 text-center md:text-right">
              Developed for University Students
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { to: "/", label: "Home", icon: <FaHome className="mr-2" /> },
    { to: "/student-login", label: "Student Portal", icon: <FaUserGraduate className="mr-2" /> },
    { to: "/staff-admin/login", label: "Staff Portal", icon: <FaUserShield className="mr-2" /> },
  ];

  const getNavLinkClass = ({ isActive }) =>
    `flex items-center w-full md:w-auto px-4 py-3 md:py-2 rounded-lg transition-all duration-300 font-medium text-sm md:text-base ${
      isActive
        ? "bg-yellow-400 text-gray-900 font-bold shadow-lg transform scale-[1.02] md:scale-105"
        : "text-white hover:bg-blue-600/70 hover:shadow-md"
    }`;

  const mainContainerClass = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

  return (
    <Router>
      <div className="App min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-gray-100 font-sans">
        {/* Header - Will auto-hide on staff dashboard routes */}
        <Header 
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          navItems={navItems}
          getNavLinkClass={getNavLinkClass}
          mainContainerClass={mainContainerClass}
        />

        {/* MAIN CONTENT */}
        <main className="flex-grow w-full py-0 md:py-0">
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
            <Route path="/student-upload" element={<Upload />} />
            <Route path="/college" element={<College />} />
            <Route path="/createDepartment" element={<CreateDepartment />} />
          </Routes>
        </main>

        {/* Footer - Will auto-hide on staff dashboard routes */}
        <Footer mainContainerClass={mainContainerClass} />
      </div>
    </Router>
  );
}

export default App;