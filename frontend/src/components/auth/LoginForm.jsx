import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import api from '../../services/api';
import { useToast } from '../../hooks/use-toast';

export function LoginForm({ setIsLoggedIn, setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Function to handle errors and display appropriate messages
  const handleError = (err) => {
    console.error('Login error:', err);
    
    // Clear any partial authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    // Check for specific error types
    if (!err) {
      setError('An unknown error occurred. Please try again.');
      return;
    }
    
    // Handle network errors
    if (!navigator.onLine || err.message === 'Network Error') {
      setError('Cannot connect to server. Please check your internet connection.');
      return;
    }
    
    // Handle specific HTTP status codes
    if (err.response) {
      const status = err.response.status;
      
      switch (status) {
        case 400:
          setError('Invalid login request. Please check your email and password.');
          break;
        case 401:
          setError('Incorrect email or password. Please try again.');
          break;
        case 403:
          setError('Access denied. Your account may be locked or disabled.');
          break;
        case 404:
          setError('Login service not found. Please contact support.');
          break;
        case 429:
          setError('Too many login attempts. Please try again later.');
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          setError('Server error. Please try again later or contact support.');
          break;
        default:
          // Use server message if available, otherwise fallback
          setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
      return;
    }
    
    // For all other errors
    setError(err.message || 'Login failed. Please check your credentials and try again.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate input fields before making API call
    if (!email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    
    if (!password) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    try {
      // First authenticate with email/password
      const response = await userService.login(email, password);
      
      if (response && response.token) {
        // Store basic auth data first
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response));
        
        try {
          // DIRECT APPROACH: Make a direct API call to get user data
          const userId = response.id || response.userId;
          console.log("Fetching complete user profile with userId:", userId);
          
          if (userId) {
            // Make direct API call instead of using the service
            const profileResponse = await api.get(`/user/${userId}`);
            console.log("Raw API response:", profileResponse);
            
            if (profileResponse.data) {
              const fullUserData = profileResponse.data;
              console.log("Full user profile data:", fullUserData);
              
              // Add token to the complete data
              fullUserData.token = response.token;
              
              // Update localStorage and context with complete data
              console.log("Updating user context with complete data:", fullUserData);
              localStorage.setItem('user', JSON.stringify(fullUserData));
              setUser(fullUserData);
              // show toast
              try { addToast({ title: 'Signed in', description: `Welcome back, ${fullUserData.firstName || fullUserData.email || 'user'}!` }); } catch(e){}
            } else {
              console.warn("API returned empty data for user profile");
              setUser(response);
              try { addToast({ title: 'Signed in', description: 'Welcome back!' }); } catch(e){}
            }
          } else {
            console.warn("No userId available for profile fetch");
            setUser(response);
          }
        } catch (profileError) {
          console.error("Failed to fetch complete profile:", profileError);
          // Fall back to basic data
          setUser(response);
          try { addToast({ title: 'Signed in', description: 'Welcome back! (profile fetch failed)' }); } catch(e){}
        }
        
        setIsLoggedIn(true);
        
        // Clear any existing admin data
        localStorage.removeItem('admin');
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        setError('Invalid server response. Please try again.');
      }
    } catch (err) {
      handleError(err);
      try { addToast({ title: 'Sign in failed', description: err.response?.data?.message || err.message || 'Invalid credentials', variant: 'destructive' }); } catch(e){}
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="on" className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
          className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <div className="flex justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <button type="button" className="text-xs text-purple-600 hover:text-purple-800" onClick={() => window.location.href = '/forgot-password'}>Forgot password?</button>
        </div>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          placeholder="Enter your password"
        />
      </div>

      <div className="flex items-center">
        <input id="remember-me" name="remember-me" type="checkbox" autoComplete="on" className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" />
        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 transition-all duration-200"
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Logging in...
          </span>
        ) : 'Sign in'}
      </button>
    </form>
  );
} 