import { useNavigate } from "react-router";
import { AlertTriangle, Info, Lightbulb, ChevronRight } from "lucide-react";
import { Header } from "./Header";
import { useApp } from "../context/AppContext";
import { Scores } from "../context/AppContext";

const GAP_ADVICE: Record<keyof Scores, { warning: string; recommendation: string }> = {
  falsity: {
    warning: 'Billing anomaly evidence is limited. Additional CPT code analysis or comparative benchmarking against CMS national averages would strengthen the falsity element.',
    recommendation: 'Obtain CMS utilization data and compare billing patterns against national benchmarks for the same specialty.',
  },
  scienter: {
    warning: 'Evidence of knowing or reckless disregard is below threshold. Additional corroboration from compliance records or internal communications is needed.',
    recommendation: 'Subpoena compliance committee meeting records and employee training documentation.',
  },
  materiality: {
    warning: 'Government payment documentation is sparse. Without showing the government would have refused payment, materiality may be challenged.',
    recommendation: 'Request CMS payment policy documents and relevant OIG advisory opinions.',
  },
  causation: {
    warning: 'The causal chain between false claims and government payment needs further support. Expert witness testimony could solidify this element.',
    recommendation: 'Identify a certified medical billing expert for potential testimony.',
  },
};

interface GapCardProps {
  type: 'warning' | 'opportunity';
  element: string;
  score: number;
  description: string;
  recommendation: string;
}

function GapCard({ type, element, score, description, recommendation }: GapCardProps) {
  const isWarning = type === 'warning';
  const borderColor = isWarning ? 'border-orange-500' : 'border-blue-500';
  const iconBgColor = isWarning ? 'bg-orange-100' : 'bg-blue-100';
  const iconColor = isWarning ? 'text-orange-600' : 'text-blue-600';
  const badgeColor = isWarning ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800';
  const Icon = isWarning ? AlertTriangle : Lightbulb;

  return (
    <div className={`bg-white border-l-4 ${borderColor} rounded-lg p-6`}>
      <div className="flex gap-4">
        <div className={`${iconBgColor} rounded-full p-3 h-fit`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-bold text-gray-900">{element}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badgeColor}`}>
              {score}%
            </span>
          </div>
          <p className="text-gray-700 mb-3">{description}</p>
          <p className="text-sm text-gray-500 italic">{recommendation}</p>
        </div>
      </div>
    </div>
  );
}

const ELEMENT_LABELS: Record<keyof Scores, string> = {
  falsity: 'Falsity',
  scienter: 'Scienter (Knowledge)',
  materiality: 'Materiality',
  causation: 'Causation',
};

export function GapsScreen() {
  const navigate = useNavigate();
  const { scores, analysisResult } = useApp();

  const strength = analysisResult?.overall_strength ?? 0;
  const strengthPct = Math.round(strength * 100);

  const gaps = scores
    ? (Object.keys(scores) as (keyof Scores)[])
        .filter(key => scores[key] < 0.90)
        .sort((a, b) => scores[a] - scores[b])
    : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Evidence Gaps — Actionable Next Steps</h1>
          <p className="text-gray-600">Strengthen your case by addressing these identified weaknesses</p>
        </div>

        {gaps.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <p className="text-green-800 font-semibold">All FCA elements score above 90%. Your case has exceptional strength.</p>
          </div>
        ) : (
          <div className="space-y-6 mb-8">
            {gaps.map(key => {
              const pct = Math.round((scores![key] ?? 0) * 100);
              const type = pct < 70 ? 'warning' : 'opportunity';
              return (
                <GapCard
                  key={key}
                  type={type}
                  element={ELEMENT_LABELS[key]}
                  score={pct}
                  description={GAP_ADVICE[key].warning}
                  recommendation={GAP_ADVICE[key].recommendation}
                />
              );
            })}
          </div>
        )}

        {scores && (
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-8">
            <div className="flex gap-3">
              <Info className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Recommendation</h3>
                <p className="text-gray-700 mb-3">
                  Your case has {strengthPct >= 80 ? 'strong' : strengthPct >= 60 ? 'moderate' : 'developing'} fundamentals ({strengthPct}% overall).
                  {gaps.length > 0
                    ? ` Addressing the ${ELEMENT_LABELS[gaps[0]]} gap would improve your case strength and settlement leverage.`
                    : ' All elements are well-supported.'}
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/memo")}
          className="w-full bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          Generate Case Memo
          <ChevronRight className="w-5 h-5" />
        </button>
      </main>
    </div>
  );
}
