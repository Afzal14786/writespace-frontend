import React, { useState } from 'react';
import { Mail, Lock, Loader2, Github, Eye, EyeOff } from 'lucide-react';
import { AuthAPI } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import type { ApiError } from '../../types/ApiError';

interface LoginComponentProps {
  onToggleForm: () => void;
  onForgotPassword: () => void;
}

const LoginComponent: React.FC<LoginComponentProps> = ({ onToggleForm, onForgotPassword }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { loginState } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill in all fields");

    setIsLoading(true);
    try {
      const response = await AuthAPI.login({ email, password });
      loginState(response.user, response.accessToken);
      toast.success("Welcome back!");
      navigate('/home', { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: ApiError } };
      toast.error(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">Welcome back</h2>
        <p className="text-sm text-slate-400">Enter your details to access your canvas.</p>
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

        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 pl-11 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
            placeholder="Password"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center">
            <input id="remember-me" type="checkbox" className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer" />
            <label htmlFor="remember-me" className="ml-2 text-sm text-slate-300 cursor-pointer">Remember me</label>
          </div>
          <button type="button" onClick={onForgotPassword} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">
            Forgot password?
          </button>
        </div>

        <button type="submit" disabled={isLoading} className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-purple-600 flex justify-center items-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer">
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Sign In"}
        </button>
      </form>

      <div className="mt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-[1px] flex-1 bg-slate-700"></div>
          <span className="text-[0.75rem] text-slate-500 font-semibold tracking-wider">OR CONTINUE WITH</span>
          <div className="h-[1px] flex-1 bg-slate-700"></div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={AuthAPI.googleLogin} type="button" className="flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl bg-slate-900/50 border border-slate-700/50 text-sm font-medium text-white hover:bg-slate-800 transition-colors cursor-pointer">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-[18px]" /> Google
          </button>
          <button onClick={AuthAPI.githubLogin} type="button" className="flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl bg-slate-900/50 border border-slate-700/50 text-sm font-medium text-white hover:bg-slate-800 transition-colors cursor-pointer">
            <Github size={18} /> GitHub
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-slate-400">
        Don't have an account? <button onClick={onToggleForm} className="font-semibold text-indigo-400 hover:text-indigo-300 ml-1 cursor-pointer">Sign up</button>
      </div>
    </div>
  );
};

export default LoginComponent;