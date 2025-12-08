import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { useUser } from '../contexts/UserContext';
import { LoginForm } from '../components/auth/LoginForm';

const LoginPage = ({ setUser: propsSetUser }) => {
  // Login state handled inside shared `LoginForm` component
  const navigate = useNavigate();
  const { user, setUser: contextSetUser } = useUser();

  // Use the setter from props if available, otherwise use context
  const setUser = propsSetUser || contextSetUser;

  const [, setIsLoggedIn] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log("LoginPage - Already logged in, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [user, navigate]);


  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Complete redesign */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-purple-800 via-orange-500 to-yellow-400 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-purple-600/30 backdrop-blur-sm"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-yellow-500/30 backdrop-blur-sm"></div>
        <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2">
          <div className="max-w-md mx-auto px-8 py-12 text-center">
            <h2 className="text-4xl font-extrabold text-white mb-6">
              Unlock Your Learning Potential
            </h2>
            
            <div className="flex justify-center mb-10">
              {/* Modern abstract icon */}
              <div className="w-40 h-40 relative">
                <div className="absolute inset-0 bg-white/20 rounded-xl rotate-12 transform"></div>
                <div className="absolute inset-0 bg-white/30 rounded-xl -rotate-6 transform"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-20 h-20 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="text-3xl font-extrabold text-white mb-4">
              QuizWhiz
            </div>
            
            <p className="text-lg text-white/80 mb-8">
              Accelerate your knowledge with interactive study tools
            </p>
            
            <div className="grid grid-cols-3 gap-3 text-white/80 text-sm">
              <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <div className="font-bold mb-1">Interactive</div>
                <div>Learning</div>
              </div>
              <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <div className="font-bold mb-1">Progress</div>
                <div>Tracking</div>
              </div>
              <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <div className="font-bold mb-1">Personalized</div>
                <div>Quizzes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md space-y-8 px-4">
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={() => navigate("/register")}
              className="text-sm font-medium text-purple-600 hover:text-purple-800"
            >
              Create account
            </button>
            <div className="text-2xl font-bold text-gray-800">Sign In</div>
          </div>
          
          <LoginForm setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
          
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

export default LoginPage;