import React from 'react';
import { PenTool, MessageSquare, UserCircle } from 'lucide-react';

const AuthBranding: React.FC = () => {
  return (
    <div className="relative flex flex-col w-full h-full bg-slate-900 overflow-hidden">
      
      {/* Background Glows (Contained) */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-900 to-slate-900 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Header Area (Top Left per Wireframe) */}
      <div className="relative z-10 w-full p-8 xl:p-12 pb-0 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-indigo-500/25">
          W
        </div>
        <span className="font-bold text-2xl tracking-tight text-white">Writespace</span>
      </div>

      {/* Content Area (Vertically Centered) */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-center px-12 xl:px-20 max-w-[600px]">
        <h1 className="text-3xl xl:text-4xl font-extrabold leading-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
          The Modern Platform <br /> for Thinkers & Writers.
        </h1>
        <p className="text-base text-slate-400 leading-relaxed mb-8">
          Create, share, and engage. Writespace is your dedicated environment to publish ideas, interact with a global community, and build your digital portfolio.
        </p>
        
        {/* Feature Boxes */}
        <div className="flex flex-col gap-4">
          <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/5 backdrop-blur-md hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <PenTool size={20} className="text-indigo-400" />
              <span className="text-sm font-semibold text-white cursor-default">Distraction-Free Editor</span>
            </div>
            <div className="text-sm text-slate-400 leading-relaxed cursor-default">
              Draft beautifully formatted long-form articles with our intuitive, powerful rich-text experience.
            </div>
          </div>

          <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/5 backdrop-blur-md hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare size={20} className="text-purple-400" />
              <span className="text-sm font-semibold text-white cursor-default">Community Engagement</span>
            </div>
            <div className="text-sm text-slate-400 leading-relaxed cursor-default">
              Connect with readers. Like, share, and dive into threaded discussions on the topics that matter to you.
            </div>
          </div>

          <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/5 backdrop-blur-md hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <UserCircle size={20} className="text-sky-400" />
              <span className="text-sm font-semibold text-white cursor-default">Dynamic Profiles</span>
            </div>
            <div className="text-sm text-slate-400 leading-relaxed cursor-default">
              Curate your digital identity. Showcase your best posts, track your reading stats, and grow your audience.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AuthBranding;