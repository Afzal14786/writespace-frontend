import React from "react";
import { useTheme } from "../../context/ThemeContext";

interface FooterProps {
  variant?: 'auth' | 'app' | 'sidebar';
}

const Footer: React.FC<FooterProps> = ({ variant = 'app' }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const currentYear = new Date().getFullYear();

  if (variant === 'sidebar') {
    return (
      <div className="px-2 pb-6">
        <nav className="flex flex-wrap gap-x-3 gap-y-1 mb-2 text-[0.75rem] font-medium text-slate-500 dark:text-slate-400">
          <a href="#" className="hover:underline transition-all">About</a>
          <a href="#" className="hover:underline transition-all">Accessibility</a>
          <a href="#" className="hover:underline transition-all">Help Center</a>
          <a href="#" className="hover:underline transition-all">Privacy & Terms</a>
          <a href="#" className="hover:underline transition-all">Ad Choices</a>
          <a href="#" className="hover:underline transition-all">Careers</a>
          <a href="#" className="hover:underline transition-all">API</a>
        </nav>
        <p className="text-[0.75rem] text-slate-500 dark:text-slate-400">
          Writespace Corporation &copy; {currentYear}
        </p>
      </div>
    );
  }

  // Auth Layout Footer
  if (variant === 'auth') {
    return (
      <footer className="w-full py-5 px-8 bg-transparent">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.8rem] font-medium text-slate-500">
          <div className="text-center sm:text-left cursor-default">
            &copy; {currentYear} Writespace.
          </div>
          <div className="flex flex-wrap justify-center gap-6">
             <a href="#" className="hover:text-slate-300 transition-colors cursor-pointer">Docs</a>
             <a href="#" className="hover:text-slate-300 transition-colors cursor-pointer">GitHub</a>
             <a href="#" className="hover:text-slate-300 transition-colors cursor-pointer">Contact</a>
             <a href="#" className="hover:text-slate-300 transition-colors cursor-pointer">Privacy</a>
          </div>
        </div>
      </footer>
    );
  }

  // Default App Layout Footer
  return (
    <footer className={`w-full py-6 px-8 mt-auto backdrop-blur-md transition-colors border-t ${
      isDark 
        ? 'bg-slate-900/40 border-slate-800 text-slate-400' 
        : 'bg-white/50 border-slate-200 text-slate-500'
    }`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-medium max-w-[1200px] mx-auto">
        <div className="text-center sm:text-left cursor-default">
          &copy; {currentYear} Writespace. All rights reserved.
        </div>
        <div className="flex flex-wrap justify-center gap-6">
           <a href="#" className="hover:text-indigo-500 transition-colors cursor-pointer">API Specs</a>
           <a href="#" className="hover:text-indigo-500 transition-colors cursor-pointer">GitHub</a>
           <a href="#" className="hover:text-indigo-500 transition-colors cursor-pointer">System Status</a>
           <a href="#" className="hover:text-indigo-500 transition-colors cursor-pointer">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;