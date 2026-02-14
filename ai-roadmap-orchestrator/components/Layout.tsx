import React, { ReactNode } from 'react';
import { Network, Sparkles } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      {/* Abstract Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl h-16 flex items-center px-6 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Network className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Orchestrator
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Powered by Gemini 2.5</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-16 min-h-screen relative z-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;
