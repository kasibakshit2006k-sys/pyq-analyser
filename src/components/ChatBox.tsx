import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Minimize2,
  Maximize2,
  Clock,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { ChatMessage, AnalysisResult } from '../types/analyzer';
import { MarkdownView } from './MarkdownView';

interface ChatBoxProps {
  analysisContext: AnalysisResult;
  isOpen: boolean;
  onToggle: () => void;
  externalPrompt?: string;
  onClearExternalPrompt?: () => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  analysisContext,
  isOpen,
  onToggle,
  externalPrompt,
  onClearExternalPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `👋 Hello! I've completed the PYQ analysis for **${analysisContext.subject}** (${analysisContext.papersCount} exam papers across ${analysisContext.years.join(', ')}).\n\nAsk me anything about your exam strategy—for example: **"What should I study for a 3-hour exam?"**, or ask me to solve any repeating question step-by-step!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedQuestions: [
        'What should I study if I only have 3 hours tonight?',
        'Give me the top 3 must-solve numericals to pass',
        'Which unit is safest to skip with minimum marks lost?',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Handle external prompt triggers (e.g. from "Solve with AI" button on repeating questions)
  useEffect(() => {
    if (externalPrompt) {
      handleSendMessage(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          analysisContext,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to retrieve response from academic mentor');
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: data.suggestedQuestions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Sorry, I could not complete that request: ${err.message || 'Please check your connection and try again.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: `Chat history reset. How can I assist you with your **${analysisContext.subject}** exam preparation?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: [
          'What should I study for a 3-hour exam?',
          'Which questions repeated every year?',
        ],
      },
    ]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 shadow-xl border border-stone-700/30 transition-transform hover:scale-105"
      >
        <Sparkles className="w-5 h-5 text-amber-400 dark:text-amber-600" />
        <span className="font-semibold text-sm">Ask PYQ Mentor</span>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-40 transition-all duration-200 flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl rounded-2xl overflow-hidden ${
        isExpanded
          ? 'bottom-4 right-4 left-4 top-4 sm:left-auto sm:w-[680px] sm:h-[85vh]'
          : 'bottom-4 right-4 w-[92vw] sm:w-[440px] h-[580px]'
      }`}
    >
      {/* Chat Header */}
      <div className="p-3.5 sm:p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
              <span>PYQ Exam Mentor</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-[200px]">
              {analysisContext.subject}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 transition-colors"
            title="Close Chat"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-stone-100 dark:bg-stone-800/80 text-stone-800 dark:text-stone-200 border border-stone-200/60 dark:border-stone-700/60 rounded-tl-xs'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : (
                  <MarkdownView content={msg.content} />
                )}

                {/* Suggested follow-up prompt chips */}
                {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-stone-200/60 dark:border-stone-700/60 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                      Suggested questions:
                    </span>
                    <div className="flex flex-col gap-1">
                      {msg.suggestedQuestions.map((sq, sqIdx) => (
                        <button
                          key={sqIdx}
                          onClick={() => handleSendMessage(sq)}
                          className="text-left px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-stone-700/60 hover:bg-stone-50 dark:hover:bg-stone-700 text-blue-600 dark:text-blue-300 border border-stone-200 dark:border-stone-600 transition-colors flex items-center justify-between group"
                        >
                          <span className="truncate">{sq}</span>
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    isUser ? 'text-blue-200' : 'text-stone-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-stone-100 dark:bg-stone-800/80 rounded-2xl rounded-tl-xs p-3.5 border border-stone-200/60 dark:border-stone-700/60">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                <div
                  className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                />
                <span className="ml-1 text-[11px]">Analyzing question papers & calculating marks...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box & Quick Chips */}
      <div className="p-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
        <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => handleSendMessage('What should I study for a 3-hour exam?')}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap bg-stone-200/70 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors shrink-0"
          >
            ⚡ 3-Hour Exam Prep
          </button>
          <button
            onClick={() => handleSendMessage('Give me the top 3 numerical questions to pass')}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap bg-stone-200/70 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors shrink-0"
          >
            🎯 Guaranteed 40 Marks
          </button>
          <button
            onClick={() => handleSendMessage('Which unit has lowest weightage to skip?')}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap bg-stone-200/70 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors shrink-0"
          >
            🚫 Safest Unit to Skip
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about 3-hour study plan, repeats, formulas..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
