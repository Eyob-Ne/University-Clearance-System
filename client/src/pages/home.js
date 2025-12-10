import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section with University Image */}
      <section className="relative bg-gradient-to-br from-blue-800 via-purple-700 to-indigo-900 text-white rounded-xl md:rounded-3xl shadow-2xl overflow-hidden mb-12 md:mb-16">
        
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black opacity-50"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-6 py-12 md:px-10 md:py-20 lg:px-16 lg:py-24">
          
          {/* Text and Button Block */}
          <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
            
            {/* University Logo and Name */}
            <div className="flex items-center justify-center md:justify-start mb-6">
              <img 
                src="/images/mau.jpg" 
                alt="Mekdela Amba University Logo" 
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-white mr-3 sm:mr-4 shadow-lg object-cover"
              />
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-snug">
                  Mekdela Amba University
                </h1>
                <div className="text-xl sm:text-2xl font-light mt-1 text-blue-200">MAU</div>
              </div>
            </div>
            
            {/* Tagline */}
            <p className="text-lg sm:text-xl lg:text-2xl mb-8 text-blue-100 leading-relaxed max-w-xl md:max-w-none mx-auto">
              Digital Clearance System - Streamlining academic processes for students and departments
            </p>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={() => navigate("/student-login")}
                className="w-full sm:w-auto bg-white text-blue-700 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-100 transform hover:scale-[1.02] transition duration-300 shadow-xl"
              >
                🎓 Student Portal
              </button>
              <button
                onClick={() => navigate("/staff-admin/login")}
                className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-white hover:text-blue-700 transform hover:scale-[1.02] transition duration-300 shadow-xl"
              >
                🏛️ Staff Portal
              </button>
            </div>
          </div>

          {/* Decorative Image Block (Hidden on small mobile screens, optimized for larger ones) */}
          <div className="hidden md:flex md:w-2/5 justify-center">
            <div className="relative">
              <img 
                src="/images/mau.jpg" 
                alt="Mekdela Amba University Campus" 
                // Set max size and use h-auto for responsiveness
                className="max-w-xs md:max-w-sm h-auto rounded-2xl shadow-2xl border-4 border-white transform rotate-3 hover:rotate-0 transition duration-500 object-cover"
              />
              <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-blue-900 px-4 py-2 rounded-xl font-bold text-sm md:text-lg shadow-lg rotate-1">
                🎓 Excellence in Education
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Decoration (Adjusted wave height for mobile) */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-8 md:h-12">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="white"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="white"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="white"></path>
          </svg>
        </div>
      </section>

      {/* University Info Section */}
      <section className="bg-white rounded-xl md:rounded-3xl p-8 md:p-12 text-center shadow-lg border border-gray-100">
        <div className="flex items-center justify-center mb-6">
          <img 
            src="/images/mau.jpg" 
            alt="Mekdela Amba University" 
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-blue-600 mr-4 shadow-md object-cover"
          />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            About MAU
          </h2>
        </div>
        <p className="text-base sm:text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
          Committed to **academic excellence** and **innovation** in education. Our digital clearance system 
          represents our dedication to modernizing administrative processes for the benefit of our students and staff, 
          making the transition to graduation seamless and efficient.
        </p>
        <div className="text-blue-600 font-semibold text-lg sm:text-xl p-2 bg-blue-50 rounded-lg inline-block">
          🎓 Excellence • Innovation • Integrity 🎓
        </div>
      </section>
    </div>
  );
}
export default Home;