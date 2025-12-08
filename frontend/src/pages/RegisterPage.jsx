import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { RegisterForm } from '../components/auth/RegisterForm';

const RegisterPage = () => {
  // Registration form handled by shared `RegisterForm` component
  const navigate = useNavigate();
  const { user } = useUser();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Handled by `RegisterForm`

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Complete redesign */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-purple-800 via-orange-500 to-yellow-400 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-purple-600/30 backdrop-blur-sm"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-yellow-500/30 backdrop-blur-sm"></div>
        <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2">
          <div className="max-w-md mx-auto px-8 py-12 text-center">
            <h2 className="text-4xl font-extrabold text-white mb-6">
              Start Your Learning Adventure
            </h2>
            
            <div className="flex justify-center mb-10">
              {/* Modern abstract icon */}
              <div className="w-40 h-40 relative">
                <div className="absolute inset-0 bg-white/20 rounded-xl rotate-45 transform"></div>
                <div className="absolute inset-0 bg-white/30 rounded-xl rotate-12 transform"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-20 h-20 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="text-3xl font-extrabold text-white mb-4">
              BrainBoost
            </div>
            
            <p className="text-lg text-white/80 mb-8">
              Join thousands of learners expanding their knowledge
            </p>
            
            <div className="flex flex-col space-y-4">
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm text-left">
                <div className="flex items-center">
                  <div className="bg-purple-500/40 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-white text-sm">Create custom study materials</div>
                </div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm text-left">
                <div className="flex items-center">
                  <div className="bg-purple-500/40 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-white text-sm">Track your progress over time</div>
                </div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm text-left">
                <div className="flex items-center">
                  <div className="bg-purple-500/40 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-white text-sm">Challenge yourself with smart quizzes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Registration Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md space-y-8 px-4">
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={() => navigate("/login")}
              className="text-sm font-medium text-purple-600 hover:text-purple-800"
            >
              Already have an account?
            </button>
            <div className="text-2xl font-bold text-gray-800">Sign Up</div>
          </div>
          
          <RegisterForm />
          
          <div className="mt-8 text-center">
            <button 
              onClick={() => navigate("/")}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;