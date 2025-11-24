import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { userService } from "../../services/userService";
import api from "../../services/api";

export function AuthForm({ type }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Note: Google/OAuth sign-in removed — only email/password flows are supported now.

  const handleLoginWithEmailPassword = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.post("/login", {
        email,
        password
      });
      
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (!email || !password || !firstName || !lastName) {
      alert("Please fill in all fields");
      return;
    }
    
    if (!termsAccepted) {
      alert("Please accept the Terms of Use and Privacy Policy");
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.post("/api/auth/register", {
        email,
        password,
        firstName,
        lastName
      });
      
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-md">
      <div className="space-y-4 mb-6">
        {/* Social login removed — email/password only */}
      </div>
      
      {/* Divider */}
      <div className="relative py-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{type === "login" ? "Or log in with email" : "Or sign up with email"}</span>
        </div>
      </div>
      
      {/* Form */}
      <form onSubmit={type === "login" ? handleLoginWithEmailPassword : handleSignUp} className="space-y-4 mt-4">
        {/* Name fields - only for signup */}
        {type === "signup" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                required
              />
            </div>
          </div>
        )}
        
        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="johndoe@example.com"
            required
          />
        </div>
        
        {/* Password field */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        
        {/* Terms checkbox - only for signup */}
        {type === "signup" && (
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(!!checked)}
            />
            <label
              htmlFor="terms"
              className="text-sm text-gray-600"
            >
              I agree to the{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of Use
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>
        )}
        
        <Button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
          disabled={loading}
        >
          {loading ? "Processing..." : type === "login" ? "Log in to your account" : "Create your account"}
        </Button>
        
        {type === "login" && (
          <div className="text-center">
            <Button variant="link" className="text-sm text-blue-600 hover:underline p-0 font-normal">
              Forgot your password?
            </Button>
          </div>
        )}
      </form>
    </div>
  );
} 