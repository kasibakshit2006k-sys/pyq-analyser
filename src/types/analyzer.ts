export interface Question {
  id: string;
  paperYear: string;
  paperTitle?: string;
  qNumber: string;
  questionText: string;
  topic: string;
  unit: string;
  marks: number;
  bloomLevel?: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';
  type?: 'Theory' | 'Numerical' | 'Derivation' | 'Code/Algorithm' | 'Design';
  hasOrChoice?: boolean;
}

export interface TopicStat {
  topic: string;
  unit: string;
  appearanceCount: number;
  totalMarks: number;
  marksPercentage: number;
  years: string[];
  importance: 'High Yield' | 'Medium Yield' | 'Low Yield';
  questionIndices: string[];
}

export interface RepeatingQuestionVariant {
  paperYear: string;
  qNumber: string;
  questionText: string;
  marks: number;
}

export interface RepeatingQuestionGroup {
  clusterId: string;
  coreConcept: string;
  patternSummary: string;
  frequency: number;
  years: string[];
  averageMarks: number;
  similarityScore: number; // e.g. 85-98%
  variants: RepeatingQuestionVariant[];
}

export interface RevisionPriorityModule {
  priority: number;
  unitOrTopic: string;
  expectedWeightage: string;
  allocatedHours: string;
  keyPointsToRevise: string[];
  mustSolveQuestions: string[];
}

export interface RevisionPlan {
  title: string;
  timeframe: string;
  targetFocus: string;
  strategyOverview: string;
  priorityModules: RevisionPriorityModule[];
  quickTips: string[];
  formulaOrDiagramChecklist: string[];
}

export interface AnalysisResult {
  id: string;
  subject: string;
  branch?: string;
  papersCount: number;
  totalQuestions: number;
  totalMarksAnalyzed: number;
  years: string[];
  extractedQuestions: Question[];
  topicRanking: TopicStat[];
  repeatQuestions: RepeatingQuestionGroup[];
  revisionPlan: RevisionPlan;
  summary: string;
  analyzedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedQuestions?: string[];
}
