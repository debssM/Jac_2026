import { useNavigate } from "react-router";
import { Lightbulb, ChevronRight, AlertTriangle } from "lucide-react";
import { Header } from "./Header";
import { useApp } from "../context/AppContext";

const ELEMENTS = ['Falsity', 'Scienter', 'Materiality', 'Causation'];

// Map evidence types to FCA elements
const TYPE_TO_ELEMENTS: Record<string, string[]> = {
  billing_anomaly: ['Falsity', 'Materiality'],
  email_evidence: ['Scienter'],
  pattern: ['Falsity', 'Causation'],
  provider: ['Scienter', 'Falsity'],
  amount: ['Materiality', 'Causation'],
};

type Level = 'strong' | 'moderate' | 'weak' | 'none';

function getLevel(pct: number): Level {
  if (pct >= 75) return 'strong';
  if (pct >= 40) return 'moderate';
  if (pct > 0) return 'weak';
  return 'none';
}

const COLORS: Record<Level, string> = {
  strong: 'bg-green-700 text-white',
  moderate: 'bg-green-400 text-gray-900',
  weak: 'bg-green-200 text-gray-700',
  none: 'bg-gray-200 text-gray-500',
};

export function HeatmapScreen() {
  const navigate = useNavigate();
  const { evidence, files } = useApp();

  if (!evidence.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">No evidence data available yet.</p>
            <button onClick={() => navigate('/upload')} className="bg-black text-white px-5 py-2 rounded-lg font-semibold">
              Upload Evidence
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Build per-document per-element confidence scores
  const docNames = [...new Set(evidence.map(e => e.source))].filter(Boolean);

  // Compute average confidence per doc per element
  const heatmap: Record<string, Record<string, number>> = {};
  for (const doc of docNames) {
    heatmap[doc] = {};
    const docEvidence = evidence.filter(e => e.source === doc);
    for (const element of ELEMENTS) {
      const relevant = docEvidence.filter(e =>
        (TYPE_TO_ELEMENTS[e.type] ?? []).includes(element)
      );
      if (relevant.length === 0) {
        heatmap[doc][element] = 0;
      } else {
        const avg = relevant.reduce((s, e) => s + e.confidence, 0) / relevant.length;
        heatmap[doc][element] = Math.round(avg * 100);
      }
    }
  }

  // Find the most important document per element
  const keyInsights: string[] = [];
  for (const element of ELEMENTS) {
    const best = docNames.reduce((a, b) =>
      (heatmap[a]?.[element] ?? 0) >= (heatmap[b]?.[element] ?? 0) ? a : b
    , docNames[0]);
    if (best && heatmap[best][element] > 60) {
      keyInsights.push(`${best} is the strongest source for ${element} (${heatmap[best][element]}%)`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Evidence Coverage Heatmap</h1>
          <p className="text-gray-600">Document-by-element contribution analysis</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 border-b border-gray-200 font-semibold text-gray-700 min-w-[200px]">
                  Document
                </th>
                {ELEMENTS.map(el => (
                  <th key={el} className="text-center py-3 px-4 border-b border-gray-200 font-semibold text-gray-700 min-w-[120px]">
                    {el}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docNames.map(doc => (
                <tr key={doc} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b border-gray-100 text-sm font-medium text-gray-900">
                    {doc}
                  </td>
                  {ELEMENTS.map(el => {
                    const pct = heatmap[doc][el] ?? 0;
                    const level = getLevel(pct);
                    return (
                      <td key={el} className="py-3 px-4 border-b border-gray-100">
                        <div className={`${COLORS[level]} px-3 py-2 text-center rounded text-sm font-medium`}>
                          {pct}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="text-sm font-semibold text-gray-700">Legend:</span>
            <div className="flex items-center gap-2"><div className="w-16 h-6 bg-green-700 rounded"></div><span className="text-sm text-gray-600">75%+ Strong</span></div>
            <div className="flex items-center gap-2"><div className="w-16 h-6 bg-green-400 rounded"></div><span className="text-sm text-gray-600">40-75% Moderate</span></div>
            <div className="flex items-center gap-2"><div className="w-16 h-6 bg-green-200 rounded"></div><span className="text-sm text-gray-600">&lt;40% Weak</span></div>
            <div className="flex items-center gap-2"><div className="w-16 h-6 bg-gray-200 rounded"></div><span className="text-sm text-gray-600">0% None</span></div>
          </div>
        </div>

        {keyInsights.length > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-8">
            <div className="flex gap-4">
              <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Key Insights</h3>
                <ul className="space-y-1">
                  {keyInsights.map((insight, i) => (
                    <li key={i} className="text-gray-700 text-sm">{insight}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/gaps")}
          className="w-full bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          Analyze Evidence Gaps
          <ChevronRight className="w-5 h-5" />
        </button>
      </main>
    </div>
  );
}
