import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  X,
  FileJson,
  CheckCircle2,
} from 'lucide-react';
import { AnalysisResult } from '../types/analyzer';

interface StructuredJsonViewerProps {
  data: AnalysisResult;
  onClose?: () => void;
}

export const StructuredJsonViewer: React.FC<StructuredJsonViewerProps> = ({
  data,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `${data.subject.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-pyq-analysis.json`;
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4 bg-stone-50/50 dark:bg-stone-800/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileJson className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
              Structured JSON Analysis Output
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {data.extractedQuestions.length} Extracted Questions • {data.topicRanking.length} Topics • {data.repeatQuestions.length} Repeating Clusters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-medium transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 text-xs font-semibold transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Code Container */}
      <div className="p-4 overflow-y-auto flex-1 font-mono text-xs leading-relaxed bg-stone-950 text-stone-200 selection:bg-blue-600 selection:text-white">
        <pre className="whitespace-pre">
          <code>{jsonString}</code>
        </pre>
      </div>
    </div>
  );
};
