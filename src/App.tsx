/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Repeat,
  Calendar,
  FileText,
  Code2,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { AnalysisResult, Question, RevisionPlan } from './types/analyzer';
import { SAMPLE_OPERATING_SYSTEMS, SAMPLE_DSA } from './data/sampleDatasets';
import { Navbar } from './components/Navbar';
import { TopicRankingTable } from './components/TopicRankingTable';
import { RepeatingQuestionsView } from './components/RepeatingQuestionsView';
import { QuestionsList } from './components/QuestionsList';
import { RevisionPlanView } from './components/RevisionPlanView';
import { StructuredJsonViewer } from './components/StructuredJsonViewer';
import { ChatBox } from './components/ChatBox';
import { UploadModal } from './components/UploadModal';

export default function App() {
  const [analysis, setAnalysis] = useState<AnalysisResult>(SAMPLE_OPERATING_SYSTEMS);
  const [activeTab, setActiveTab] = useState<'topics' | 'repeats' | 'revision' | 'questions' | 'json'>('topics');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState<string | undefined>(undefined);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('');

  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pyq_analyzer_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pyq_analyzer_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pyq_analyzer_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const handleSelectSample = (type: 'os' | 'dsa') => {
    if (type === 'os') {
      setAnalysis(SAMPLE_OPERATING_SYSTEMS);
    } else {
      setAnalysis(SAMPLE_DSA);
    }
    setSelectedTopicFilter('');
  };

  const handleSelectTopicQuestions = (topicName: string) => {
    setSelectedTopicFilter(topicName);
    setActiveTab('questions');
  };

  const handleAskAiAboutTopic = (topicName: string) => {
    setChatPrompt(`What are the key concepts and most frequent exam questions for the topic: "${topicName}"? Please explain step-by-step.`);
    setIsChatOpen(true);
  };

  const handleAskAiToSolve = (questionText: string, coreConcept: string) => {
    setChatPrompt(`Please provide a university-grade, step-by-step complete solution and exam scoring points for this repeated question on "${coreConcept}":\n\n"${questionText}"`);
    setIsChatOpen(true);
  };

  const handleAskAiQuestion = (q: Question) => {
    setChatPrompt(`Please solve this ${q.marks}-mark university question from ${q.paperYear} (${q.qNumber}):\n"${q.questionText}"`);
    setIsChatOpen(true);
  };

  const handleAskAiConcept = (concept: string) => {
    setChatPrompt(`Please teach me "${concept}" in simple terms with key formulas and university exam derivation steps.`);
    setIsChatOpen(true);
  };

  const handleUpdatePlan = (newPlan: RevisionPlan) => {
    setAnalysis((prev) => ({
      ...prev,
      revisionPlan: newPlan,
    }));
  };

  // High-yield topic count (> 15% marks)
  const highYieldTopicsCount = analysis.topicRanking.filter(
    (t) => t.importance === 'High Yield'
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100 transition-colors">
      {/* Top Navbar */}
      <Navbar
        subject={analysis.subject}
        papersCount={analysis.papersCount}
        years={analysis.years}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenUpload={() => setIsUploadOpen(true)}
        onSelectSample={handleSelectSample}
        onToggleJsonModal={() => setIsJsonModalOpen(true)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab as any)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Subject Header & Quick Summary */}
        <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {analysis.branch || 'Engineering Faculty'}
                </span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  Last analyzed: {new Date(analysis.analyzedAt).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white">
                {analysis.subject}
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                {analysis.summary}
              </p>
            </div>

            {/* Quick 3-Hour Exam prompt button */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
              <button
                onClick={() => {
                  setChatPrompt('What should I study for a 3-hour exam tonight? Please give me the exact high-probability questions to pass.');
                  setIsChatOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs sm:text-sm font-bold shadow-xs transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>What to Study in 3 Hours?</span>
              </button>

              <button
                onClick={() => setActiveTab('repeats')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs sm:text-sm font-semibold transition-colors"
              >
                <Repeat className="w-4 h-4 text-amber-500" />
                <span>View {analysis.repeatQuestions.length} Repeating Clusters</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-stone-100 dark:border-stone-800">
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
                Exam Papers
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-stone-900 dark:text-white mt-1">
                {analysis.papersCount} Years
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                {analysis.years.join(', ')}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
                Extracted Questions
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-stone-900 dark:text-white mt-1">
                {analysis.extractedQuestions.length}
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                {analysis.totalMarksAnalyzed} Total Marks
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
                Repeating Clusters
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                {analysis.repeatQuestions.length} Patterns
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                Similar wording across papers
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
                High-Yield Topics
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {highYieldTopicsCount} Topics
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                Top Priority for Scoring
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1.5 bg-stone-200/60 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('topics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'topics'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Ranked Topics Table</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
              {analysis.topicRanking.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('repeats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'repeats'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Repeat className="w-4 h-4 text-amber-500" />
            <span>Repeating Questions</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              {analysis.repeatQuestions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('revision')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'revision'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>Revision Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'questions'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-500" />
            <span>All Extracted Questions</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
              {analysis.extractedQuestions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'json'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4 text-stone-500" />
            <span>Structured JSON</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div>
          {activeTab === 'topics' && (
            <TopicRankingTable
              topicRanking={analysis.topicRanking}
              allQuestions={analysis.extractedQuestions}
              years={analysis.years}
              onSelectTopicQuestions={handleSelectTopicQuestions}
              onAskAiAboutTopic={handleAskAiAboutTopic}
            />
          )}

          {activeTab === 'repeats' && (
            <RepeatingQuestionsView
              repeatQuestions={analysis.repeatQuestions}
              onAskAiToSolve={handleAskAiToSolve}
            />
          )}

          {activeTab === 'revision' && (
            <RevisionPlanView
              revisionPlan={analysis.revisionPlan}
              analysisContext={analysis}
              onUpdatePlan={handleUpdatePlan}
              onAskAiToExplainConcept={handleAskAiConcept}
            />
          )}

          {activeTab === 'questions' && (
            <QuestionsList
              questions={analysis.extractedQuestions}
              years={analysis.years}
              initialTopicFilter={selectedTopicFilter}
              onClearTopicFilter={() => setSelectedTopicFilter('')}
              onAskAiQuestion={handleAskAiQuestion}
            />
          )}

          {activeTab === 'json' && <StructuredJsonViewer data={analysis} />}
        </div>
      </main>

      {/* Floating / Docked Interactive Exam Chat Box */}
      <ChatBox
        analysisContext={analysis}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        externalPrompt={chatPrompt}
        onClearExternalPrompt={() => setChatPrompt(undefined)}
      />

      {/* PDF Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAnalysisComplete={(res) => {
          setAnalysis(res);
          setSelectedTopicFilter('');
          setActiveTab('topics');
        }}
        onSelectSample={handleSelectSample}
      />

      {/* Structured JSON Modal (Quick inspect) */}
      {isJsonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <StructuredJsonViewer
              data={analysis}
              onClose={() => setIsJsonModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
