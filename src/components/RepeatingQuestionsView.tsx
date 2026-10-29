import React, { useState } from 'react';
import {
  Repeat,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle,
  Copy,
  Check,
  Search,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { RepeatingQuestionGroup } from '../types/analyzer';

interface RepeatingQuestionsViewProps {
  repeatQuestions: RepeatingQuestionGroup[];
  onAskAiToSolve: (questionText: string, coreConcept: string) => void;
}

export const RepeatingQuestionsView: React.FC<RepeatingQuestionsViewProps> = ({
  repeatQuestions,
  onAskAiToSolve,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<string>('all');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Collect all unique years in repeat questions
  const allYears = Array.from(
    new Set(repeatQuestions.flatMap((g) => g.years))
  ).sort().reverse();

  const filteredClusters = repeatQuestions.filter((cluster) => {
    const matchesSearch =
      cluster.coreConcept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cluster.patternSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cluster.variants.some((v) => v.questionText.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesYear = filterYear === 'all' || cluster.years.includes(filterYear);
    return matchesSearch && matchesYear;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-950/40 dark:via-orange-950/20 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                High-Frequency Repeating Questions
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                  {repeatQuestions.length} Identified Patterns
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1 max-w-3xl leading-relaxed">
                These questions have appeared across multiple exam years with nearly identical wording, concepts, or numerical formats. Mastering these guarantees high exam scores with maximum study efficiency.
              </p>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Filter repeating concepts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-48 pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Years</option>
              {allYears.map((y) => (
                <option key={y} value={y}>
                  Appeared in {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cluster Cards */}
      <div className="space-y-6">
        {filteredClusters.map((cluster, cIdx) => (
          <div
            key={cluster.clusterId || `cluster-${cIdx}`}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-all hover:border-amber-400/50 dark:hover:border-amber-700/50"
          >
            {/* Top row: Concept, Frequency badge, similarity */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-stone-100 dark:bg-stone-800 text-xs font-mono font-bold text-stone-700 dark:text-stone-300">
                  #{cIdx + 1}
                </span>
                <h4 className="text-base font-bold text-stone-900 dark:text-white">
                  {cluster.coreConcept}
                </h4>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {cluster.similarityScore || 90}% Semantic Similarity
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  Appeared in <strong className="text-stone-900 dark:text-white font-semibold">{cluster.frequency} Years</strong>
                </span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="text-xs font-mono font-bold text-stone-700 dark:text-stone-300">
                  ~{cluster.averageMarks} Marks
                </span>
              </div>
            </div>

            {/* Pattern Analysis Description */}
            <div className="my-3.5 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 text-xs text-stone-700 dark:text-stone-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-stone-900 dark:text-stone-100 mr-1.5">
                  Pattern Insight:
                </strong>
                {cluster.patternSummary}
              </div>
            </div>

            {/* Year-by-Year Question Variants in Similar Wording */}
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3 flex items-center justify-between">
                <span>Wording Variations across exam papers:</span>
                <button
                  onClick={() =>
                    onAskAiToSolve(
                      cluster.variants[0]?.questionText || cluster.coreConcept,
                      cluster.coreConcept
                    )
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-600 text-stone-950 transition-colors shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Solve with AI Step-by-Step</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {cluster.variants.map((v, vIdx) => {
                  const cardId = `${cluster.clusterId}-${v.paperYear}-${vIdx}`;
                  return (
                    <div
                      key={cardId}
                      className="p-3.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-800/30 flex flex-col justify-between hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900">
                              {v.paperYear}
                            </span>
                            <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                              {v.qNumber}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {v.marks} Marks
                            </span>
                            <button
                              onClick={() => copyToClipboard(v.questionText, cardId)}
                              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors p-1"
                              title="Copy question text"
                            >
                              {copiedId === cardId ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-sans">
                          {v.questionText}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-stone-200/40 dark:border-stone-800/60 flex items-center justify-between text-[11px] text-stone-400">
                        <span>Similar wording match</span>
                        <button
                          onClick={() => onAskAiToSolve(v.questionText, cluster.coreConcept)}
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                        >
                          <span>Ask explanation</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {filteredClusters.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl text-stone-400 text-sm">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-stone-400" />
            No repeating questions match your search query.
          </div>
        )}
      </div>
    </div>
  );
};
