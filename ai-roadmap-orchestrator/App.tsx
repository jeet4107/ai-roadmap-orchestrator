import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import IntakeForm from './components/IntakeForm';
import RoadmapGraph from './components/RoadmapGraph';
import DetailPanel from './components/DetailPanel';
import { generateRoadmap, pivotRoadmap } from './services/geminiService';
import { RoadmapData, RoadmapNode, UserConstraints } from './types';
import { AlertTriangle } from 'lucide-react';

// Default mock data to show something if API key is missing or for first render check
const MOCK_ROADMAP: RoadmapData = {
  title: "Example: Frontend Mastery",
  nodes: [],
  edges: []
};

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'INTAKE' | 'GENERATING' | 'ROADMAP' | 'ERROR'>('INTAKE');
  const [roadmapData, setRoadmapData] = useState<RoadmapData>(MOCK_ROADMAP);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isPivoting, setIsPivoting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Check for API Key on mount
  useEffect(() => {
    if (!process.env.API_KEY) {
      setErrorMsg("Missing API_KEY in environment variables.");
      setViewState('ERROR');
    }
  }, []);

  const handleGenerate = async (constraints: UserConstraints) => {
    setViewState('GENERATING');
    try {
      const data = await generateRoadmap(constraints);
      setRoadmapData(data);
      setViewState('ROADMAP');
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate roadmap. Please try again.");
      setViewState('ERROR');
    }
  };

  const handlePivot = async (instruction: string) => {
    setIsPivoting(true);
    try {
      const updatedData = await pivotRoadmap(roadmapData, instruction);
      setRoadmapData(updatedData);
      setIsPivoting(false);
    } catch (err) {
      console.error("Pivot failed", err);
      // Optional: Show toast error
      setIsPivoting(false);
    }
  };

  const selectedNode = roadmapData.nodes.find(n => n.id === selectedNodeId) || null;

  return (
    <Layout>
      {viewState === 'INTAKE' && (
        <div className="animate-fade-in-up">
          <IntakeForm onSubmit={handleGenerate} isLoading={false} />
        </div>
      )}

      {viewState === 'GENERATING' && (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full animate-ping"></div>
            <div className="absolute inset-2 border-4 border-t-indigo-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Orchestrating Your Path</h2>
          <p className="text-slate-400">Analyzing dependencies, calculating time blocks, and curating resources...</p>
        </div>
      )}

      {viewState === 'ERROR' && (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">System Error</h2>
          <p className="text-slate-400 mb-6 max-w-md">{errorMsg}</p>
          <button 
            onClick={() => setViewState('INTAKE')}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {viewState === 'ROADMAP' && (
        <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden">
          {/* Top Bar for Roadmap Info */}
          <div className="absolute top-4 left-6 z-30 pointer-events-none">
             <h1 className="text-3xl font-bold text-white/90 drop-shadow-lg">{roadmapData.title}</h1>
             <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Orchestration
             </p>
          </div>

          <RoadmapGraph 
            data={roadmapData} 
            onNodeClick={(node) => setSelectedNodeId(node.id)}
            selectedNodeId={selectedNodeId}
          />
          
          <DetailPanel 
            node={selectedNode} 
            onClose={() => setSelectedNodeId(null)}
            onPivot={handlePivot}
            isPivoting={isPivoting}
          />

          <div className="absolute bottom-6 left-6 z-30 flex gap-2">
            <button 
              onClick={() => setViewState('INTAKE')} 
              className="px-4 py-2 bg-slate-900/80 backdrop-blur text-slate-300 text-sm font-medium rounded-lg border border-white/10 hover:bg-slate-800 transition-colors"
            >
              New Roadmap
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
