import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  Sparkles,
  Printer,
  BookOpen,
  ArrowRight,
  ListChecks,
  AlertTriangle,
  Lightbulb,
  Check,
} from 'lucide-react';
import { RevisionPlan, AnalysisResult } from '../types/analyzer';

interface RevisionPlanViewProps {
  revisionPlan: RevisionPlan;
  analysisContext: AnalysisResult;
  onUpdatePlan: (newPlan: RevisionPlan) => void;
  onAskAiToExplainConcept: (concept: string) => void;
}

export const RevisionPlanView: React.FC<RevisionPlanViewProps> = ({
  revisionPlan,
  analysisContext,
  onUpdatePlan,
  onAskAiToExplainConcept,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('3_days');
  const [selectedTarget, setSelectedTarget] = useState<string>('distinction');
  const [isGenerating, setIsGenerating] = useState(false);
  const [checkedFormulas, setCheckedFormulas] = useState<Record<number, boolean>>({});

  const handleGenerateCustomPlan = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeframe: selectedTimeframe,
          targetGoal: selectedTarget,
          analysisContext,
        }),
      });
      if (!res.ok) throw new Error('Failed to generate customized plan');
      const data = await res.json();
      if (data && data.priorityModules) {
        onUpdatePlan(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFormula = (idx: number) => {
    setCheckedFormulas((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Revision Plan Customizer Bar */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                Smart Exam Revision Engine
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              Prioritizes topics that account for the highest marks and guaranteed repeat patterns.
            </p>
          </div>

          {/* Timeframe & Target Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-500 dark:text-stone-400">Time:</span>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="text-xs py-1.5 px-3 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-medium focus:ring-1 focus:ring-blue-500"
              >
                <option value="3_hours">3 Hours (Emergency Cram)</option>
                <option value="1_day">1 Day Sprint</option>
                <option value="3_days">3 Days Intensive</option>
                <option value="7_days">7 Days Mastery</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-500 dark:text-stone-400">Goal:</span>
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="text-xs py-1.5 px-3 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-medium focus:ring-1 focus:ring-blue-500"
              >
                <option value="pass_only">Just Pass (40-50M)</option>
                <option value="first_class">First Class (60-75M)</option>
                <option value="distinction">Distinction (85%+)</option>
              </select>
            </div>

            <button
              onClick={handleGenerateCustomPlan}
              disabled={isGenerating}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Optimizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Update Plan</span>
                </>
              )}
            </button>

            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
              title="Print Revision Plan"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Plan Header Card */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white dark:from-stone-900 dark:to-stone-950 dark:border dark:border-stone-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>{revisionPlan.timeframe || '3-Day Intensive'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {revisionPlan.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-2 max-w-3xl leading-relaxed">
              {revisionPlan.strategyOverview}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 shrink-0 text-right md:min-w-[200px]">
            <div className="text-[11px] uppercase tracking-wider text-stone-300 font-semibold">
              Strategic Focus
            </div>
            <div className="text-sm font-semibold text-amber-300 mt-0.5">
              {revisionPlan.targetFocus || 'Master High-Yield Patterns'}
            </div>
          </div>
        </div>
      </div>

      {/* Prioritized Study Modules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <span>Prioritized Revision Hierarchy</span>
            <span className="text-xs font-medium text-stone-400">
              (Ranked by marks yield per study hour)
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {revisionPlan.priorityModules.map((module, idx) => (
            <div
              key={idx}
              className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs hover:border-blue-400/50 dark:hover:border-blue-700/50 transition-all flex flex-col md:flex-row md:items-start gap-5"
            >
              {/* Priority badge & time */}
              <div className="flex md:flex-col items-center md:items-start justify-between md:justify-start gap-2 shrink-0 md:w-36 pb-3 md:pb-0 border-b md:border-b-0 border-stone-100 dark:border-stone-800">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Priority {module.priority || idx + 1}
                </span>

                <div className="space-y-1 text-left">
                  <div className="text-xs font-mono font-bold text-stone-900 dark:text-white flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    {module.allocatedHours}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {module.expectedWeightage}
                  </div>
                </div>
              </div>

              {/* Module contents */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-base font-bold text-stone-900 dark:text-white">
                    {module.unitOrTopic}
                  </h4>
                  <button
                    onClick={() => onAskAiToExplainConcept(module.unitOrTopic)}
                    className="shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Teach me this</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Key Points to Revise */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                    Core Concepts to Master:
                  </div>
                  <ul className="space-y-1">
                    {module.keyPointsToRevise.map((kp, kIdx) => (
                      <li
                        key={kIdx}
                        className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Must-Solve Questions */}
                {module.mustSolveQuestions && module.mustSolveQuestions.length > 0 && (
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                    <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" />
                      <span>Must-Solve Previous Year Questions:</span>
                    </div>
                    <div className="space-y-1">
                      {module.mustSolveQuestions.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          className="text-xs text-stone-800 dark:text-stone-200 font-mono bg-stone-50 dark:bg-stone-800/60 p-2 rounded-lg border border-stone-200/60 dark:border-stone-700/60"
                        >
                          {q}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two columns: Formulas/Diagrams Checklist & Examiner Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Formulas & Diagrams Checklist */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-base font-bold text-stone-900 dark:text-white">
              Essential Formulas & Diagrams Checklist
            </h4>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
            Check off each formula/diagram as you memorize it before entering the exam hall:
          </p>
          <div className="space-y-2">
            {(revisionPlan.formulaOrDiagramChecklist || []).map((item, idx) => {
              const isChecked = !!checkedFormulas[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleFormula(idx)}
                  className={`p-2.5 rounded-xl border text-xs sm:text-sm font-mono cursor-pointer transition-all flex items-start gap-2.5 ${
                    isChecked
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-stone-400 line-through'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-emerald-400'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                      isChecked
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-stone-300 dark:border-stone-600'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                  </div>
                  <span className="flex-1 select-none">{item}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Examiner Presentation Tips */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h4 className="text-base font-bold text-stone-900 dark:text-white">
              Exam Hall Strategy & Presentation Tips
            </h4>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
            Proven tips to maximize partial marks and impression on university evaluators:
          </p>
          <div className="space-y-2.5">
            {(revisionPlan.quickTips || []).map((tip, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 text-xs sm:text-sm text-stone-700 dark:text-stone-300 flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
