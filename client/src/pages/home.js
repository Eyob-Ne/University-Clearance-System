import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section with University Image */}
      <section className="relative bg-gradient-to-br from-blue-800 via-purple-700 to-indigo-900 text-white rounded-3xl shadow-2xl overflow-hidden mb-16">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-8 py-16">
          <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
            <div className="flex items-center justify-center md:justify-start mb-6">
              <img 
                src="/images/mau.jpg" 
                alt="Mekdela Amba University" 
                className="w-16 h-16 rounded-full border-4 border-white mr-4 shadow-lg"
              />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  Mekdela Amba University
                </h1>
                <div className="text-2xl font-light mt-2 text-blue-200">MAU</div>
              </div>
            </div>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              Digital Clearance System - Streamlining academic processes for students and departments
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={() => navigate("/student-login")}
                className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition duration-300 shadow-lg"
              >
                🎓 Student Portal
              </button>
              <button
                onClick={() => navigate("/staff-admin/login")}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-700 transform hover:scale-105 transition duration-300 shadow-lg"
              >
                🏛️ Staff Portal
              </button>
            </div>
          </div>
          <div className="md:w-2/5 flex justify-center">
            <div className="relative">
              <img 
                src="/images/mau.jpg" 
                alt="Mekdela Amba University Campus" 
                className="w-80 h-80 rounded-2xl shadow-2xl border-4 border-white transform rotate-3 hover:rotate-0 transition duration-500"
              />
              <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-blue-900 px-6 py-3 rounded-xl font-bold text-lg shadow-lg">
                🎓 Excellence in Education
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="white"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="white"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="white"></path>
          </svg>
        </div>
      </section>

      

      {/* University Info Section */}
      <section className="bg-gray-100 rounded-3xl p-12 text-center">
        <div className="flex items-center justify-center mb-6">
          <img 
            src="/images/mau.jpg" 
            alt="Mekdela Amba University" 
            className="w-20 h-20 rounded-full border-4 border-blue-600 mr-4"
          />
          <h2 className="text-3xl font-bold text-gray-800">
            Mekdela Amba University
          </h2>
        </div>
        <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
          Committed to academic excellence and innovation in education. Our digital clearance system 
          represents our dedication to modernizing administrative processes for the benefit of our students and staff.
        </p>
        <div className="text-blue-600 font-semibold text-lg">
          🎓 Excellence • Innovation • Integrity 🎓
        </div>
      </section>
    </div>
  );
}
export default Home;