import React, { useState } from 'react';
import { RoadmapNode, NodeStatus } from '../types';
import { X, ExternalLink, Play, Github, FileText, RefreshCcw, Loader2 } from 'lucide-react';

interface DetailPanelProps {
  node: RoadmapNode | null;
  onClose: () => void;
  onPivot: (instruction: string) => Promise<void>;
  isPivoting: boolean;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ node, onClose, onPivot, isPivoting }) => {
  const [pivotInput, setPivotInput] = useState('');

  if (!node) return null;

  const handlePivotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pivotInput.trim()) {
      onPivot(pivotInput);
      setPivotInput('');
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'video': return <Play size={14} />;
      case 'repo': return <Github size={14} />;
      default: return <FileText size={14} />;
    }
  };

  return (
    <div className="fixed top-16 right-0 bottom-0 w-full md:w-96 bg-slate-900/80 backdrop-blur-xl border-l border-white/10 shadow-2xl z-40 transform transition-transform duration-300 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-mono text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-full border border-indigo-400/20">
            {node.type}
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 leading-tight">{node.title}</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          {node.description}
        </p>

        <div className="space-y-6">
          {/* Status & Time */}
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
                <div className="text-xs text-slate-500 mb-1">Estimate</div>
                <div className="font-mono text-indigo-300">{node.estimatedHours} hours</div>
             </div>
             <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
                <div className="text-xs text-slate-500 mb-1">Status</div>
                <div className="font-mono text-emerald-300">{NodeStatus.PENDING}</div>
             </div>
          </div>

          {/* Resources - RAG Powered Mockup */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <FileText size={16} className="text-indigo-400"/> Curated Resources
            </h3>
            <div className="space-y-2">
              {node.resources.length > 0 ? node.resources.map((res, i) => (
                <a 
                  key={i} 
                  href={res.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="block group bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/5 hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                     <div className="flex items-center gap-2 text-indigo-300 text-xs mb-1">
                        {getIcon(res.type)}
                        <span className="uppercase tracking-wider opacity-80">{res.type}</span>
                     </div>
                     <ExternalLink size={12} className="text-slate-600 group-hover:text-white transition-colors"/>
                  </div>
                  <div className="text-sm text-slate-200 font-medium truncate">{res.title}</div>
                </a>
              )) : (
                <div className="text-sm text-slate-500 italic">No specific resources found.</div>
              )}
            </div>
          </div>

          <hr className="border-white/10 my-6" />

          {/* Smart Pivot Section */}
          <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-4 rounded-xl border border-indigo-500/20">
             <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
               <RefreshCcw size={16} className={isPivoting ? "animate-spin" : ""} />
               Smart Pivot
             </h3>
             <p className="text-xs text-slate-400 mb-3">
               Change of plans? Tell the Orchestrator to recalculate the dependencies from this node onwards.
             </p>
             <form onSubmit={handlePivotSubmit}>
                <textarea 
                   className="w-full bg-slate-950/50 border border-white/10 rounded-lg p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 mb-2 resize-none"
                   rows={3}
                   placeholder="e.g., I'm stuck here, simplify this step. Or: I learned this already."
                   value={pivotInput}
                   onChange={e => setPivotInput(e.target.value)}
                />
                <button 
                  disabled={isPivoting || !pivotInput.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isPivoting ? "Recalculating..." : "Orchestrate Changes"}
                </button>
             </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPanel;
