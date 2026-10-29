import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  BarChart3,
  Award,
  Calendar,
  Layers,
  ChevronRight,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { TopicStat, Question } from '../types/analyzer';

interface TopicRankingTableProps {
  topicRanking: TopicStat[];
  allQuestions: Question[];
  years: string[];
  onSelectTopicQuestions?: (topicName: string) => void;
  onAskAiAboutTopic?: (topicName: string) => void;
}

export const TopicRankingTable: React.FC<TopicRankingTableProps> = ({
  topicRanking,
  allQuestions,
  years,
  onSelectTopicQuestions,
  onAskAiAboutTopic,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'frequency' | 'marks' | 'name'>('frequency');

  // Extract unique units for filter dropdown
  const uniqueUnits = useMemo(() => {
    const units = new Set<string>();
    topicRanking.forEach((t) => {
      if (t.unit) units.add(t.unit);
    });
    return Array.from(units).sort();
  }, [topicRanking]);

  // Filter and sort topics
  const filteredTopics = useMemo(() => {
    return topicRanking
      .filter((item) => {
        const matchesSearch =
          item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.unit.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesUnit = selectedUnit === 'all' || item.unit === selectedUnit;
        return matchesSearch && matchesUnit;
      })
      .sort((a, b) => {
        if (sortBy === 'frequency') {
          return b.appearanceCount - a.appearanceCount || b.totalMarks - a.totalMarks;
        }
        if (sortBy === 'marks') {
          return b.totalMarks - a.totalMarks;
        }
        return a.topic.localeCompare(b.topic);
      });
  }, [topicRanking, searchTerm, selectedUnit, sortBy]);

  // Max marks for relative progress bar
  const maxMarks = useMemo(() => {
    return Math.max(...topicRanking.map((t) => t.totalMarks), 1);
  }, [topicRanking]);

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-4 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
              Topic Frequency Ranking Across Exam Years
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Ranked by appearance consistency across {years.length} exam papers ({years.join(', ')}).
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search topic or unit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Unit Filter */}
          <div className="relative">
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Units ({topicRanking.length})</option>
              {uniqueUnits.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs py-1.5 px-3 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="frequency">Sort: Frequency (High to Low)</option>
              <option value="marks">Sort: Marks Weightage</option>
              <option value="name">Sort: Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-stone-50/80 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 font-medium">
              <th className="py-3 px-4 w-12 text-center">Rank</th>
              <th className="py-3 px-4">Topic & Unit</th>
              <th className="py-3 px-4 text-center">Frequency</th>
              <th className="py-3 px-4">Years Appeared</th>
              <th className="py-3 px-4 text-right">Total Marks</th>
              <th className="py-3 px-4 w-36">Weightage</th>
              <th className="py-3 px-4 text-center">Priority</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
            {filteredTopics.map((stat, idx) => {
              const frequencyRatio = (stat.appearanceCount / (years.length || 1)) * 100;
              const isGuaranteed = stat.appearanceCount >= years.length;

              return (
                <tr
                  key={stat.topic}
                  className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors group"
                >
                  {/* Rank */}
                  <td className="py-3.5 px-4 text-center font-bold text-stone-500 dark:text-stone-400">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                        idx === 0
                          ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-black'
                          : idx === 1
                          ? 'bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold'
                          : idx === 2
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 font-semibold'
                          : 'text-stone-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </td>

                  {/* Topic & Unit */}
                  <td className="py-3.5 px-4 min-w-[200px]">
                    <div className="font-semibold text-stone-900 dark:text-white flex items-center gap-1.5">
                      {stat.topic}
                      {isGuaranteed && (
                        <span
                          title="Appeared in 100% of analyzed question papers"
                          className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                        >
                          100% Repeat
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                      <Layers className="w-3 h-3 text-stone-400" />
                      {stat.unit}
                    </div>
                  </td>

                  {/* Frequency */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isGuaranteed
                          ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                          : stat.appearanceCount >= 2
                          ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      {stat.appearanceCount} / {years.length} Years
                    </span>
                  </td>

                  {/* Years Appeared */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {years.map((y) => {
                        const appearedInYear = stat.years.includes(y);
                        return (
                          <span
                            key={y}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                              appearedInYear
                                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-300 dark:text-stone-600 line-through'
                            }`}
                          >
                            {y}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  {/* Total Marks */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-900 dark:text-stone-100">
                    {stat.totalMarks} Marks
                  </td>

                  {/* Weightage Bar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            stat.importance === 'High Yield'
                              ? 'bg-emerald-500'
                              : stat.importance === 'Medium Yield'
                              ? 'bg-blue-500'
                              : 'bg-stone-400'
                          }`}
                          style={{ width: `${Math.min(100, Math.round((stat.totalMarks / maxMarks) * 100))}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-medium text-stone-500 dark:text-stone-400 w-11 text-right">
                        {stat.marksPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>

                  {/* Priority Tier */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide ${
                        stat.importance === 'High Yield'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80'
                          : stat.importance === 'Medium Yield'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80'
                          : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      {stat.importance}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onAskAiAboutTopic && (
                        <button
                          onClick={() => onAskAiAboutTopic(stat.topic)}
                          className="p-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Ask AI what to study for this topic"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onSelectTopicQuestions && (
                        <button
                          onClick={() => onSelectTopicQuestions(stat.topic)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                        >
                          <span>Questions</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredTopics.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-stone-400 text-xs sm:text-sm">
                  No topics matching the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
