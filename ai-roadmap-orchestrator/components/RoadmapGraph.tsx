import React, { useEffect, useMemo, useState } from 'react';
import { RoadmapData, RoadmapNode } from '../types';
import { CheckCircle, Circle, Clock, BookOpen, AlertCircle } from 'lucide-react';

interface RoadmapGraphProps {
  data: RoadmapData;
  onNodeClick: (node: RoadmapNode) => void;
  selectedNodeId: string | null;
}

// Simple topological sort and layering for DAG visualization
const calculateLayout = (nodes: RoadmapNode[], edges: { from: string; to: string }[]) => {
  const nodeMap = new Map<string, RoadmapNode & { children: string[] }>();
  nodes.forEach(n => nodeMap.set(n.id, { ...n, children: [] }));

  edges.forEach(e => {
    const parent = nodeMap.get(e.from);
    if (parent) parent.children.push(e.to);
  });

  const levels = new Map<string, number>();
  const visited = new Set<string>();

  const getLevel = (id: string): number => {
    if (levels.has(id)) return levels.get(id)!;
    
    // Find parents
    const parents = edges.filter(e => e.to === id);
    if (parents.length === 0) {
      levels.set(id, 0);
      return 0;
    }

    let maxParentLevel = -1;
    parents.forEach(p => {
       if(!visited.has(p.from)) {
          // crude cycle prevention/break logic
          visited.add(id);
          const pl = getLevel(p.from);
          maxParentLevel = Math.max(maxParentLevel, pl);
       }
    });
    
    const l = maxParentLevel + 1;
    levels.set(id, l);
    return l;
  };

  nodes.forEach(n => getLevel(n.id));

  const layoutNodes = nodes.map(n => {
    const level = levels.get(n.id) || 0;
    return { ...n, level };
  });

  // Assign X and Y
  const LEVEL_WIDTH = 250;
  const LEVEL_HEIGHT = 150;
  
  const nodesByLevel: Record<number, typeof layoutNodes> = {};
  layoutNodes.forEach(n => {
    if (!nodesByLevel[n.level!]) nodesByLevel[n.level!] = [];
    nodesByLevel[n.level!].push(n);
  });

  const finalNodes = layoutNodes.map(n => {
    const siblings = nodesByLevel[n.level!];
    const index = siblings.findIndex(s => s.id === n.id);
    // Center the nodes vertically based on how many are in the level
    const yOffset = (siblings.length - 1) * LEVEL_HEIGHT / 2;
    
    return {
      ...n,
      x: n.level! * LEVEL_WIDTH + 100,
      y: (index * LEVEL_HEIGHT) - yOffset + 300 // 300 is center canvas approx
    };
  });

  return finalNodes;
};

const RoadmapGraph: React.FC<RoadmapGraphProps> = ({ data, onNodeClick, selectedNodeId }) => {
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  
  // Viewport State for Pan/Zoom
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (data.nodes.length > 0) {
      const layout = calculateLayout(data.nodes, data.edges);
      setNodes(layout);
    }
  }, [data]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(scale * delta, 0.3), 2);
    setScale(newScale);
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-slate-950/30 cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
          backgroundSize: `${30 * scale}px ${30 * scale}px`,
          backgroundPosition: `${offset.x}px ${offset.y}px`
        }}
      />

      <div 
        className="absolute transition-transform duration-75 ease-out origin-top-left"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
      >
        <svg className="overflow-visible" width="5000" height="5000">
          {/* Edges */}
          {data.edges.map((edge, idx) => {
            const start = nodes.find(n => n.id === edge.from);
            const end = nodes.find(n => n.id === edge.to);
            if (!start || !end) return null;

            // Bezier Curve
            const controlPoint1X = start.x! + 100;
            const controlPoint1Y = start.y!;
            const controlPoint2X = end.x! - 100;
            const controlPoint2Y = end.y!;

            return (
              <g key={`${edge.from}-${edge.to}`}>
                <path 
                  d={`M ${start.x} ${start.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${end.x} ${end.y}`}
                  fill="none"
                  stroke="#475569"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
                <circle cx={end.x} cy={end.y} r="3" fill="#6366f1" />
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          return (
            <div
              key={node.id}
              onClick={(e) => { e.stopPropagation(); onNodeClick(node); }}
              className={`absolute top-0 left-0 w-48 -ml-24 -mt-10 p-4 rounded-xl border transition-all duration-300 group
                ${isSelected 
                  ? 'bg-indigo-900/40 border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.3)] z-50 scale-105' 
                  : 'bg-slate-900/60 border-white/10 hover:border-white/30 hover:bg-slate-800/60 z-10'
                } backdrop-blur-md cursor-pointer
              `}
              style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-500' : 'bg-slate-700'} text-white`}>
                   {node.type === 'MILESTONE' ? <Circle size={14} /> : <CheckCircle size={14} />}
                </div>
                {node.estimatedHours > 20 && (
                   <div className="flex items-center text-[10px] text-amber-400 gap-1 bg-amber-400/10 px-1.5 py-0.5 rounded">
                     <AlertCircle size={10} /> Intense
                   </div>
                )}
              </div>
              
              <h3 className="text-sm font-semibold text-slate-100 leading-tight mb-1">{node.title}</h3>
              <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2">
                 <span className="flex items-center gap-1"><Clock size={10} /> {node.estimatedHours}h</span>
                 <span className="flex items-center gap-1"><BookOpen size={10} /> {node.resources.length} resources</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapGraph;
