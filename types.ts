export enum NodeType {
  MILESTONE = 'MILESTONE',
  TASK = 'TASK',
  DECISION = 'DECISION'
}

export enum NodeStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
  SKIPPED = 'SKIPPED'
}

export interface Resource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'course' | 'repo';
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  type: NodeType;
  status: NodeStatus;
  estimatedHours: number;
  resources: Resource[];
  // Calculated for layout
  x?: number;
  y?: number;
  level?: number;
}

export interface RoadmapEdge {
  from: string;
  to: string;
}

export interface RoadmapData {
  title: string;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

export interface UserConstraints {
  goal: string;
  hoursPerWeek: number;
  currentSkillLevel: string;
  deadline?: string;
  additionalContext?: string;
}
