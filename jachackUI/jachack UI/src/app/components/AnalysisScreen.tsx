import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { CheckCircle2, Loader2, Circle, FileSearch, Scale, DollarSign, AlertTriangle, FileText, XCircle } from "lucide-react";
import { Header } from "./Header";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { analyzeCase, getScores, getEvidence, getTimeline } from "../api";

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'done' | 'error';
  icon: any;
}

const AGENT_DEFS: Omit<Agent, 'status'>[] = [
  { id: '1', name: 'Document Parser', description: 'Reading and ingesting uploaded files', icon: FileSearch },
  { id: '2', name: 'Entity Extractor', description: 'Identifying suspicious billing patterns and evidence', icon: AlertTriangle },
  { id: '3', name: 'FCA Element Mapper', description: 'Mapping evidence to falsity, scienter, materiality, causation', icon: Scale },
  { id: '4', name: 'Damages Calculator', description: 'Computing treble damages and civil penalty exposure', icon: DollarSign },
  { id: '5', name: 'Case Memo Generator', description: 'Compiling court-ready analysis', icon: FileText },
];

export function AnalysisScreen() {
  const navigate = useNavigate();
  const { files, setAnalysisResult, setScores, setEvidence, setTimeline, setError } = useApp();
  const [agents, setAgents] = useState<Agent[]>(
    AGENT_DEFS.map(a => ({ ...a, status: 'pending' as const }))
  );
  const [overallProgress, setOverallProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const hasRun = useRef(false);

  const setAgentStatus = (id: string, status: Agent['status']) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (files.length === 0) {
      navigate('/upload');
      return;
    }

    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    try {
      // Step 1 — ingest / extract (happens inside analyze_case)
      setAgentStatus('1', 'running');
      setOverallProgress(10);

      setAgentStatus('2', 'running');

      let result;
      try {
        result = await analyzeCase(files);
      } catch (err: any) {
        throw new Error(`Backend unreachable. Make sure 'jac serve maintest.jac --port 8000' is running.\n${err.message}`);
      }

      setAgentStatus('1', 'done');
      setAgentStatus('2', 'done');
      setOverallProgress(40);

      // Step 3 — FCA scores
      setAgentStatus('3', 'running');
      const scoresData = await getScores();
      setAgentStatus('3', 'done');
      setOverallProgress(60);

      // Step 4 — Evidence + timeline
      setAgentStatus('4', 'running');
      const [evidenceData, timelineData] = await Promise.all([getEvidence(), getTimeline()]);
      setAgentStatus('4', 'done');
      setOverallProgress(85);

      // Step 5 — Store everything
      setAgentStatus('5', 'running');

      if (result) setAnalysisResult(result);
      if (scoresData) setScores(scoresData);
      if (evidenceData?.length) setEvidence(evidenceData);
      if (timelineData) setTimeline(timelineData);

      setAgentStatus('5', 'done');
      setOverallProgress(100);

      toast.success("Analysis complete!");
      setTimeout(() => navigate("/results"), 800);

    } catch (err: any) {
      const msg = err.message ?? 'Unknown error';
      setErrorMsg(msg);
      setError(msg);
      setAgents(prev => prev.map(a => a.status === 'running' ? { ...a, status: 'error' } : a));
      toast.error("Analysis failed", { description: msg });
    }
  };

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex gap-3 mb-4">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <h2 className="font-bold text-gray-900 text-lg">Analysis Failed</h2>
            </div>
            <p className="text-red-700 text-sm mb-4 whitespace-pre-wrap">{errorMsg}</p>
            <button
              onClick={() => navigate('/upload')}
              className="bg-black text-white px-5 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Back to Upload
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Case Strength Analysis</h2>
          <p className="text-gray-600 mb-6">AI agents analyzing evidence for FCA compliance</p>

          <div className="relative">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-700 ease-out"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-right mt-2 font-semibold text-gray-900">
              {Math.round(overallProgress)}%
            </p>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Analyzing: Falsity · Scienter · Materiality · Causation
          </p>
        </div>

        <div className="space-y-4">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const statusStyles = {
              done: 'border-green-500 bg-white',
              running: 'border-blue-500 bg-blue-50',
              pending: 'border-gray-200 bg-white opacity-50',
              error: 'border-red-500 bg-red-50',
            };

            return (
              <div
                key={agent.id}
                className={`border-2 rounded-lg p-6 transition-all ${statusStyles[agent.status]}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {agent.status === 'done' && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                    {agent.status === 'running' && <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />}
                    {agent.status === 'pending' && <Circle className="w-6 h-6 text-gray-400" />}
                    {agent.status === 'error' && <XCircle className="w-6 h-6 text-red-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <h3 className="font-bold text-gray-900">{agent.name}</h3>
                    </div>
                    <p className="text-gray-600">{agent.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
