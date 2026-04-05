import { useNavigate } from "react-router";
import { DollarSign, FileText, TrendingUp, User, ChevronRight, Grid3x3, AlertTriangle } from "lucide-react";
import { Header } from "./Header";
import { useApp } from "../context/AppContext";

interface MetricCardProps {
  label: string;
  value: string;
  icon: any;
  color: string;
}

function MetricCard({ label, value, icon: Icon, color }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <p className="text-sm text-gray-600">{label}</p>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface ElementCardProps {
  name: string;
  score: number;
  evidence: string;
}

function ElementCard({ name, score, evidence }: ElementCardProps) {
  const pct = Math.round(score * 100);

  const getScoreColor = (p: number) => {
    if (p >= 75) return 'bg-green-600';
    if (p >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getScoreBadgeColor = (p: number) => {
    if (p >= 75) return 'bg-green-100 text-green-800';
    if (p >= 40) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900">{name}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreBadgeColor(pct)}`}>
          {pct}%
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
        <div
          className={`h-full ${getScoreColor(pct)} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-sm text-gray-600">{evidence}</p>
    </div>
  );
}

function fmt(n: number) {
  return '$' + Number(n).toLocaleString();
}

export function ResultsScreen() {
  const navigate = useNavigate();
  const { analysisResult, scores, evidence } = useApp();

  if (!analysisResult || !scores) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">No analysis results yet.</p>
            <button onClick={() => navigate('/upload')} className="bg-black text-white px-5 py-2 rounded-lg font-semibold">
              Upload Evidence
            </button>
          </div>
        </main>
      </div>
    );
  }

  const strength = Math.round((analysisResult.overall_strength ?? 0) * 100);
  const wbShare = Math.round(analysisResult.treble_damages * 0.25);

  // Build evidence summaries per element
  const evidenceSummary = (elementTypes: string[]) => {
    const matching = evidence.filter(e => elementTypes.includes(e.type));
    if (matching.length === 0) return 'Analyzed from uploaded documents.';
    return matching.slice(0, 2).map(e => e.description).join(' ');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Case Analysis Results</h1>
          <p className="text-gray-600">
            Defendant: <span className="font-semibold text-gray-900">{analysisResult.defendant}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Overall Strength" value={`${strength}%`} icon={TrendingUp} color="text-green-600" />
          <MetricCard label="Treble Damages" value={fmt(analysisResult.treble_damages)} icon={DollarSign} color="text-blue-600" />
          <MetricCard label="False Claims" value={Number(analysisResult.total_false_claims).toLocaleString()} icon={FileText} color="text-purple-600" />
          <MetricCard label="WB Share (25%)" value={fmt(wbShare)} icon={User} color="text-teal-600" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">FCA Elements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <ElementCard
            name="Falsity"
            score={scores.falsity}
            evidence={evidenceSummary(['billing_anomaly', 'pattern'])}
          />
          <ElementCard
            name="Scienter (Knowledge)"
            score={scores.scienter}
            evidence={evidenceSummary(['email_evidence', 'provider'])}
          />
          <ElementCard
            name="Materiality"
            score={scores.materiality}
            evidence={evidenceSummary(['amount', 'billing_anomaly'])}
          />
          <ElementCard
            name="Causation"
            score={scores.causation}
            evidence={evidenceSummary(['pattern', 'amount'])}
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/heatmap")}
            className="flex-1 bg-white border-2 border-gray-300 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
          >
            <Grid3x3 className="w-5 h-5" />
            View Evidence Heatmap
          </button>
          <button
            onClick={() => navigate("/gaps")}
            className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            Identify Evidence Gaps
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
}
