import React, { useState } from 'react';
import { Lock, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { AuthAPI } from '../../api/auth.api';
import { toast } from 'react-toastify';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { ApiError } from '../../types/ApiError';

const ResetPasswordComponent: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const urlToken = searchParams.get('token') || '';
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // NEW: State for Eye toggle
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Missing Token Error State
  if (!urlToken) {
    return (
      <div className="w-full text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 border border-red-500/30">
          <span className="text-2xl font-bold text-red-400">!</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Invalid Link</h2>
        <p className="mb-8 text-sm text-slate-400">
          The password reset link is missing or invalid. Please request a new one.
        </p>
        <button onClick={() => navigate('/login')} className="flex items-center justify-center w-full text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go back to log in
        </button>
      </div>
    );
  }

  // Valid Token Update State
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    if (password.length < 8) return toast.error("Password must be at least 8 characters");

    setIsLoading(true);
    try {
      await AuthAPI.resetPassword({ token: urlToken, password });
      toast.success("Password reset successfully! Please log in.");
      navigate('/login', { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: ApiError } };
      toast.error(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">Set new password</h2>
        <p className="text-sm text-slate-400">Must be different from previous passwords.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* First Password Field with Eye Toggle */}
        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            // pr-12 ensures text doesn't hide behind the eye icon
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 pl-11 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
            placeholder="New Password"
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Confirm Password Field (Syncs with Eye Toggle) */}
        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 pl-11 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
            placeholder="Confirm Password"
          />
        </div>

        <button type="submit" disabled={isLoading} className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-purple-600 flex justify-center items-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer">
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordComponent;