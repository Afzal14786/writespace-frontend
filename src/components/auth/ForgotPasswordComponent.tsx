import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { AuthAPI } from '../../api/auth.api';
import { toast } from 'react-toastify';
import type { ApiError } from '../../types/ApiError';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

const ForgotPasswordComponent: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSent, setIsSent] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setIsLoading(true);
    try {
      await AuthAPI.forgotPassword(email);
      setIsSent(true);
    } catch (error: unknown) {
      const err = error as { response?: { data?: ApiError } };
      toast.error(err.response?.data?.message || "Failed to send reset instructions.");
    } finally {
      setIsLoading(false);
    }
  };

  // Success State (No manual OTP option)
  if (isSent) {
    return (
      <div className="w-full text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30">
          <Mail className="h-8 w-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Check your email</h2>
        <p className="mb-8 text-sm text-slate-400">
          We've sent a password reset link to <strong className="text-white">{email}</strong>. 
          Please click the link in the email to set a new password.
        </p>
        
        <button onClick={onBackToLogin} className="flex items-center justify-center text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer mx-auto">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to log in
        </button>
      </div>
    );
  }

  // Request State
  return (
    <div className="w-full">
      <div className="mb-8 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">Reset password</h2>
        <p className="text-sm text-slate-400">Enter your email and we'll send you a reset link.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 pl-11 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
            placeholder="Email Address"
          />
        </div>

        <button type="submit" disabled={isLoading} className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-purple-600 flex justify-center items-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer">
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Send Reset Link"}
        </button>
      </form>

      <button onClick={onBackToLogin} className="mt-8 flex items-center justify-center w-full text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to log in
      </button>
    </div>
  );
};

export default ForgotPasswordComponent;