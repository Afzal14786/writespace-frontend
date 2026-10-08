import React, { useState, useEffect } from 'react';
import { Mail, Lock, User as UserIcon, Loader2, ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { AuthAPI } from '../../api/auth.api';
import { UsersAPI } from '../../api/users.api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import OtpInput from './OtpInput';
import type { ApiError } from '../../types/ApiError';

interface RegisterComponentProps {
  onToggleForm: () => void;
}

type UsernameStatus = "IDLE" | "LOADING" | "AVAILABLE" | "UNAVAILABLE";

const RegisterComponent: React.FC<RegisterComponentProps> = ({ onToggleForm }) => {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [fullname, setFullname] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("IDLE");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const { loginState } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus("IDLE");
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus("LOADING");
      try {
        const result = await UsersAPI.checkUsername(username);
        if (result.available) {
          setUsernameStatus("AVAILABLE");
          setSuggestions([]);
        } else {
          setUsernameStatus("UNAVAILABLE");
          setSuggestions(result.suggestions || []);
        }
      } catch {
        setUsernameStatus("IDLE");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameStatus === "UNAVAILABLE") return toast.error("Username is taken!");
    if (password !== confirmPassword) return toast.error("Passwords do not match!");
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");

    setIsLoading(true);
    try {
      await AuthAPI.register({ fullname, username, email, password });
      toast.success("OTP sent to your email!");
      setStep('otp');
    } catch (error: unknown) {
      const err = error as { response?: { data?: ApiError } };
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error("Please enter complete OTP.");

    setIsLoading(true);
    try {
      const response = await AuthAPI.verifyOtp({ email, otp });
      loginState(response.user, response.accessToken);
      toast.success("Account created successfully!");
      navigate('/home', { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: ApiError } };
      toast.error(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="w-full text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">Verify email</h2>
        <p className="mb-8 text-sm text-slate-400">Code sent to <strong className="text-white">{email}</strong></p>
        <form onSubmit={handleOtpSubmit} className="space-y-8">
          <OtpInput length={6} value={otp} onChange={setOtp} disabled={isLoading} />
          <button type="submit" disabled={isLoading || otp.length < 6} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 flex justify-center items-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer">
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Verify Account"}
          </button>
        </form>
        <button onClick={() => setStep('form')} className="mt-6 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-white mx-auto transition-colors cursor-pointer">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">Create an account</h2>
        <p className="text-sm text-slate-400">Join the community of professionals.</p>
      </div>

      <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" required value={fullname} onChange={(e) => setFullname(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 pl-11 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm" placeholder="Full Name" />
          </div>
          
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
            <input 
              type="text" 
              required 
              value={username} 
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} 
              className={`w-full bg-slate-900/50 border rounded-xl px-4 py-3.5 pl-10 pr-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all text-sm ${
                usernameStatus === "UNAVAILABLE" ? "border-red-500 focus:ring-red-500" : 
                usernameStatus === "AVAILABLE" ? "border-green-500 focus:ring-green-500" : 
                "border-slate-700/50 focus:ring-indigo-500"
              }`} 
              placeholder="username" 
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {usernameStatus === "LOADING" && <Loader2 size={16} className="animate-spin text-slate-400" />}
              {usernameStatus === "AVAILABLE" && <CheckCircle2 size={16} className="text-green-500" />}
              {usernameStatus === "UNAVAILABLE" && <XCircle size={16} className="text-red-500" />}
            </div>
            
            {usernameStatus === "UNAVAILABLE" && suggestions.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-full p-2 bg-red-500/10 border border-red-500/20 rounded-lg z-20 backdrop-blur-md">
                <p className="text-xs text-red-400 mb-2">Suggested:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map(s => (
                    <button key={s} type="button" onClick={() => setUsername(s)} className="text-[0.7rem] bg-white/10 text-white px-2 py-1 rounded-md hover:bg-white/20 transition-colors cursor-pointer">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 pl-11 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm" placeholder="Email Address" />
        </div>

        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 pl-11 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm" placeholder="Password (min 8 chars)" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 pl-11 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm" placeholder="Confirm Password" />
        </div>

        <button type="submit" disabled={isLoading || usernameStatus === "UNAVAILABLE"} className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-purple-600 flex justify-center items-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer">
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Create Account"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-slate-400">
        Already have an account? <button onClick={onToggleForm} className="font-semibold text-indigo-400 hover:text-indigo-300 ml-1 cursor-pointer">Log in</button>
      </div>
    </div>
  );
};

export default RegisterComponent;