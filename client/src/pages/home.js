import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaGraduationCap, 
  FaUserTie, 
  FaCheckCircle, 
  FaClock,
  FaShieldAlt,
  FaUniversity,
  FaChalkboardTeacher,
  FaArrowRight 
} from "react-icons/fa";
// Simple internal component for Feature Cards to keep code clean
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-b-4 border-blue-600 group">
    <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-3xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

// Simple internal component for Stat items
const StatItem = ({ number, label }) => (
  <div className="text-center p-6 border border-blue-400/30 rounded-xl bg-blue-800/30 backdrop-blur-sm">
    <div className="text-4xl md:text-5xl font-extrabold text-yellow-400 mb-2">{number}</div>
    <div className="text-blue-100 font-medium tracking-wide uppercase text-sm">{label}</div>
  </div>
);

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        
        {/* Background Image with Parallax Effect */}
          <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80")',
          }}
        ></div>

        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-indigo-900/80 mix-blend-multiply"></div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 md:px-12 pt-20">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            
            {/* Left Content */}
            <div className="w-full md:w-3/5 text-center md:text-left space-y-8 animate-fade-in-up">
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight">
                Mekdela Amba <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                  University
                </span>
              </h1>
              
              <p className="text-lg md:text-2xl text-blue-100 max-w-2xl mx-auto md:mx-0 font-light leading-relaxed">
                Empowering the future through digital innovation. Streamline your academic clearance process with our secure, unified portal.
              </p>
            </div>     
          </div>
        </div>

        {/* Bottom Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-1">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60C240 100 480 120 720 100C960 80 1200 40 1440 60V120H0V60Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

 
      {/* ================= FEATURES SECTION ================= */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">Why use the Digital System?</h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="🚀" 
              title="Fast Processing" 
              description="Say goodbye to long queues. Complete your clearance requests in minutes from anywhere, at any time."
            />
            <FeatureCard 
              icon="🔒" 
              title="Secure Data" 
              description="Your academic records and personal information are protected by enterprise-grade security protocols."
            />
            <FeatureCard 
              icon="📱" 
              title="Real-time Tracking" 
              description="Track the status of your clearance request in real-time. Get notified instantly when a department approves."
            />
          </div>
        </div>
      </section>

{/* University Info Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-2/5">
                <div className="relative">
                  <img 
                    src="/images/mau.jpg" 
                    alt="Mekdela Amba University Campus" 
                    className="w-full h-auto rounded-3xl shadow-2xl transform hover:scale-[1.02] transition duration-500 object-cover"
                  />
                  
                </div>
              </div>
              
              <div className="lg:w-3/5">
                <div className="flex items-center mb-8">
                  <div className="w-16 h-16 rounded-full border-4 border-white/50 p-2 mr-6">
                    <FaUniversity className="w-full h-full text-white" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold">
                    About <span className="text-blue-300">MAU</span>
                  </h2>
                </div>
                
                <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                  <span className="text-2xl font-bold text-white">Mekdela Amba University</span> is committed to 
                  <span className="font-bold text-blue-300"> academic excellence</span> and 
                  <span className="font-bold text-purple-300"> innovative education</span>. Our digital clearance 
                  system represents our dedication to modernizing administrative processes, making the transition 
                  from student to graduate seamless, efficient, and transparent.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <FaGraduationCap className="text-xl text-blue-300" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">Quality Education</div>
                      <div className="text-gray-400">World-class academic programs</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <FaShieldAlt className="text-xl text-purple-300" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">Secure Platform</div>
                      <div className="text-gray-400">Protected academic processes</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 inline-block">
                  <div className="text-2xl font-bold text-center">
                    <span className="text-blue-300">🎓 Excellence</span> • 
                    <span className="text-purple-300"> Innovation</span> • 
                    <span className="text-green-300"> Integrity</span> 🎓
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
        {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Simple steps to complete your academic clearance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white p-8 rounded-3xl shadow-lg text-center h-full">
                <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Login & Start</h3>
                <p className="text-gray-600 mb-6">
                  Access your portal using your university credentials
                </p>
                <FaGraduationCap className="text-4xl text-blue-500 mx-auto" />
              </div>
              <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                <div className="w-12 h-1 bg-blue-300"></div>
                <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-t-transparent border-b-transparent border-l-blue-300 ml-12"></div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white p-8 rounded-3xl shadow-lg text-center h-full">
                <div className="w-20 h-20 bg-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">Staff Verification</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                     Departmental heads and staff members will review your records and provide digital approval.
                   </p>
                <FaUserTie className="text-4xl text-purple-500 mx-auto" />
              </div>
              <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                <div className="w-12 h-1 bg-purple-300"></div>
                <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-t-transparent border-b-transparent border-l-purple-300 ml-12"></div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white p-8 rounded-3xl shadow-lg text-center h-full">
                <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Get Approved</h3>
                <p className="text-gray-600 mb-6">
                  Receive digital approval and completion certificate
                </p>
                <FaCheckCircle className="text-4xl text-green-500 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>


 {/* Final CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-900 overflow-hidden">
  
  {/* Decorative Background Glows - Adds depth behind the content */}
  <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-[128px] opacity-20 animate-pulse"></div>
  <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-overlay filter blur-[128px] opacity-20 animate-pulse animation-delay-2000"></div>

  <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
    
    {/* Heading Section */}
    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
      Ready to Begin Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">Journey?</span>
    </h2>
    
    <p className="text-lg md:text-2xl text-blue-200 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
      Join thousands of successful graduates who have transitioned from campus to career with our streamlined digital clearance.
    </p>
    
    {/* Main CTA Button with Glow Effect */}
    <button
      onClick={() => navigate("/student-login")}
      className="group relative inline-flex items-center justify-center gap-3 bg-white text-indigo-900 px-10 py-5 rounded-full font-bold text-lg md:text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] shadow-2xl"
    >
      <span>Start Clearance Process</span>
      {/* Arrow Icon */}
      <svg 
        className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300 text-indigo-600" 
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
      </svg>
    </button>
    
    {/* Feature Cards Grid */}
    <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      
      {/* Card 1 */}
      <div className="group p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-500 transform hover:-translate-y-2">
        <div className="w-14 h-14 mx-auto mb-6 bg-green-500/20 rounded-2xl flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
          <span className="text-3xl">🌱</span>
        </div>
        <div className="text-white text-xl font-bold mb-3">100% Paperless</div>
        <div className="text-blue-200/80 leading-relaxed">
          An eco-friendly approach that eliminates physical paperwork entirely.
        </div>
      </div>

      {/* Card 2 */}
      <div className="group p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-500 transform hover:-translate-y-2 delay-100">
        <div className="w-14 h-14 mx-auto mb-6 bg-blue-500/20 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
          <span className="text-3xl">⚡</span>
        </div>
        <div className="text-white text-xl font-bold mb-3">Time-Saving</div>
        <div className="text-blue-200/80 leading-relaxed">
          Reduce processing time by 80%. Get approved in hours, not days.
        </div>
      </div>

      {/* Card 3 */}
      <div className="group p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-500 transform hover:-translate-y-2 delay-200">
        <div className="w-14 h-14 mx-auto mb-6 bg-yellow-500/20 rounded-2xl flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors">
          <span className="text-3xl">🌐</span>
        </div>
        <div className="text-white text-xl font-bold mb-3">24/7 Access</div>
        <div className="text-blue-200/80 leading-relaxed">
          Check your status and submit requests from anywhere, anytime.
        </div>
      </div>

    </div>
  </div>
</section>
    </div>
  );
}

export default Home;