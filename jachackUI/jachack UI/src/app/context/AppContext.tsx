import { createContext, useContext, useState, ReactNode } from 'react';

export interface FileData {
  filename: string;
  doc_type: string;
  content: string;
}

export interface AnalysisResult {
  defendant: string;
  total_false_claims: number;
  base_damages: number;
  treble_damages: number;
  total_exposure: number;
  case_summary: string;
  overall_strength: number;
}

export interface Scores {
  falsity: number;
  scienter: number;
  materiality: number;
  causation: number;
}

export interface Evidence {
  type: string;
  description: string;
  source: string;
  confidence: number;
}

export interface Timeline {
  fraud_start: string;
  fraud_end: string;
  total_duration_months: number;
  events: string[];
}

interface AppContextType {
  files: File[];
  analysisResult: AnalysisResult | null;
  scores: Scores | null;
  evidence: Evidence[];
  timeline: Timeline | null;
  error: string | null;
  setFiles: (files: File[]) => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  setScores: (scores: Scores) => void;
  setEvidence: (evidence: Evidence[]) => void;
  setTimeline: (timeline: Timeline) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<File[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [scores, setScores] = useState<Scores | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setFiles([]);
    setAnalysisResult(null);
    setScores(null);
    setEvidence([]);
    setTimeline(null);
    setError(null);
  };

  return (
    <AppContext.Provider value={{
      files, analysisResult, scores, evidence, timeline, error,
      setFiles, setAnalysisResult, setScores, setEvidence, setTimeline, setError, reset,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
