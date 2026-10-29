import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  Copy,
  Check,
  Tag,
  BookOpen,
  HelpCircle,
  Code2,
  FileCheck,
  Calculator,
  ArrowUpDown,
} from 'lucide-react';
import { Question } from '../types/analyzer';

interface QuestionsListProps {
  questions: Question[];
  years: string[];
  initialTopicFilter?: string;
  onClearTopicFilter?: () => void;
  onAskAiQuestion?: (q: Question) => void;
}

export const QuestionsList: React.FC<QuestionsListProps> = ({
  questions,
  years,
  initialTopicFilter = '',
  onClearTopicFilter,
  onAskAiQuestion,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialTopicFilter || '');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.qNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = selectedYear === 'all' || q.paperYear === selectedYear;
      const matchesType = selectedType === 'all' || q.type === selectedType;
      return matchesSearch && matchesYear && matchesType;
    });
  }, [questions, searchTerm, selectedYear, selectedType]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    questions.forEach((q) => {
      if (q.type) types.add(q.type);
    });
    return Array.from(types);
  }, [questions]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search questions by text, formula, unit, or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {initialTopicFilter && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800">
              <span>Filter: {initialTopicFilter}</span>
              {onClearTopicFilter && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    onClearTopicFilter();
                  }}
                  className="hover:text-blue-900 dark:hover:text-white ml-1 font-bold"
                >
                  ×
                </button>
              )}
            </div>
          )}

          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Years ({questions.length})</option>
            {years.map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>

          {/* Type selector */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {uniqueTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions Grid/List */}
      <div className="space-y-3">
        {filteredQuestions.map((q, idx) => (
          <div
            key={q.id || `q-${idx}`}
            className="p-4 sm:p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs hover:border-stone-300 dark:hover:border-stone-700 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              {/* Question metadata header */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900">
                  {q.paperYear}
                </span>
                <span className="font-mono font-bold text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                  {q.qNumber}
                </span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                  <Tag className="w-3 h-3 text-stone-400" />
                  {q.topic}
                </span>
                <span className="text-stone-300 dark:text-stone-700 hidden sm:inline">•</span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:inline">
                  {q.unit}
                </span>
              </div>

              {/* Question body text */}
              <p className="text-sm sm:text-base text-stone-900 dark:text-stone-100 leading-relaxed font-sans">
                {q.questionText}
              </p>

              {/* Sub-tags: Bloom, Type */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                {q.bloomLevel && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80">
                    Bloom: {q.bloomLevel}
                  </span>
                )}
                {q.type && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80 flex items-center gap-1">
                    {q.type === 'Numerical' ? (
                      <Calculator className="w-3 h-3" />
                    ) : (
                      <BookOpen className="w-3 h-3" />
                    )}
                    {q.type}
                  </span>
                )}
              </div>
            </div>

            {/* Right column: marks badge, action buttons */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-800">
              <span className="px-3 py-1 rounded-xl text-xs sm:text-sm font-mono font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
                {q.marks} Marks
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => copyText(q.questionText, q.id)}
                  className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors"
                  title="Copy question text"
                >
                  {copiedId === q.id ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                {onAskAiQuestion && (
                  <button
                    onClick={() => onAskAiQuestion(q)}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 text-xs font-medium transition-colors shadow-xs"
                    title="Solve with AI"
                  >
                    Solve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl text-stone-400 text-sm">
            No questions match your search and filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
