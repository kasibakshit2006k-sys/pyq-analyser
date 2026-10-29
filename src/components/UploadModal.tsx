import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  Trash2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Layers,
  ArrowRight,
  FileCode,
} from 'lucide-react';
import { AnalysisResult } from '../types/analyzer';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onSelectSample: (type: 'os' | 'dsa') => void;
}

interface UploadedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  year: string;
  base64?: string;
  mimeType?: string;
  text?: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onAnalysisComplete,
  onSelectSample,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [subjectName, setSubjectName] = useState('Operating Systems');
  const [branchName, setBranchName] = useState('Computer Science & Engineering');
  const [fileList, setFileList] = useState<UploadedFileItem[]>([]);
  const [pastedText, setPastedText] = useState('');
  const [pastedYear, setPastedYear] = useState('2024');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process files
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    await processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    setErrorMessage(null);
    const newItems: UploadedFileItem[] = [];

    for (const file of files) {
      // Guess year from filename (e.g. 2024, 2023, 2022)
      const yearMatch = file.name.match(/\b(201\d|202\d)\b/);
      const guessedYear = yearMatch ? yearMatch[0] : `${new Date().getFullYear() - fileList.length}`;

      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        const base64 = await readFileAsBase64(file);
        newItems.push({
          id: `file-${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          year: guessedYear,
          base64: base64.split(',')[1] || base64,
          mimeType: file.type || 'application/pdf',
        });
      } else {
        // Text based file
        const text = await readFileAsText(file);
        newItems.push({
          id: `file-${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          type: 'text/plain',
          year: guessedYear,
          text,
        });
      }
    }

    setFileList((prev) => [...prev, ...newItems]);
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const removeFile = (id: string) => {
    setFileList((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFileYear = (id: string, year: string) => {
    setFileList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, year } : f))
    );
  };

  const handleStartAnalysis = async () => {
    setErrorMessage(null);

    // Prepare files array
    const filesToSubmit: any[] = [];

    if (activeTab === 'upload') {
      if (fileList.length === 0) {
        setErrorMessage('Please upload at least one question paper PDF.');
        return;
      }
      filesToSubmit.push(
        ...fileList.map((f) => ({
          name: f.name,
          year: f.year,
          base64: f.base64,
          mimeType: f.mimeType,
          text: f.text,
        }))
      );
    } else {
      if (!pastedText.trim()) {
        setErrorMessage('Please paste the question paper text.');
        return;
      }
      filesToSubmit.push({
        name: `${subjectName} - ${pastedYear} Paper`,
        year: pastedYear,
        text: pastedText,
      });
    }

    setIsAnalyzing(true);
    setAnalysisStep(1);

    // Step animation intervals
    const stepInterval = setInterval(() => {
      setAnalysisStep((s) => (s < 4 ? s + 1 : s));
    }, 2800);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: filesToSubmit,
          subject: subjectName,
          branch: branchName,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to complete PYQ analysis.');
      }

      const result: AnalysisResult = await response.json();
      clearInterval(stepInterval);
      setAnalysisStep(5);
      setTimeout(() => {
        onAnalysisComplete(result);
        onClose();
        setIsAnalyzing(false);
      }, 700);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setErrorMessage(err.message || 'Analysis failed. Please try again or use the pre-loaded dataset.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                Upload Previous Year Question Papers
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Extract questions, tag syllabus units, and discover repeat patterns with Gemini
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isAnalyzing}
            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Analyzing Progress Overlay */}
        {isAnalyzing ? (
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-full border-4 border-stone-200 dark:border-stone-800 animate-spin border-t-blue-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-bold text-stone-900 dark:text-white">
                Analyzing Previous Year Question Papers
              </h4>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                {analysisStep === 1 && 'Ingesting question papers & extracting sub-questions with marks...'}
                {analysisStep === 2 && 'Tagging syllabus units, Bloom taxonomy levels, and topics...'}
                {analysisStep === 3 && 'Identifying repeat question clusters and semantic wording similarity...'}
                {analysisStep === 4 && 'Computing cross-year frequency rankings & drafting revision plan...'}
                {analysisStep === 5 && 'Structuring JSON response... Done!'}
              </p>
            </div>

            {/* Step progress pills */}
            <div className="max-w-md mx-auto grid grid-cols-4 gap-2 text-[10px] font-medium text-stone-500">
              <div className={`p-2 rounded-lg border text-center ${analysisStep >= 1 ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 text-blue-700 dark:text-blue-300 font-bold' : 'border-stone-200 dark:border-stone-800'}`}>
                1. Extract
              </div>
              <div className={`p-2 rounded-lg border text-center ${analysisStep >= 2 ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 text-blue-700 dark:text-blue-300 font-bold' : 'border-stone-200 dark:border-stone-800'}`}>
                2. Tag Units
              </div>
              <div className={`p-2 rounded-lg border text-center ${analysisStep >= 3 ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 text-blue-700 dark:text-blue-300 font-bold' : 'border-stone-200 dark:border-stone-800'}`}>
                3. Clusters
              </div>
              <div className={`p-2 rounded-lg border text-center ${analysisStep >= 4 ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 text-blue-700 dark:text-blue-300 font-bold' : 'border-stone-200 dark:border-stone-800'}`}>
                4. Rank Plan
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Subject & Branch inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Operating Systems, Thermodynamics"
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                  Engineering Branch
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g. Computer Science, Mechanical"
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Tab switch: Upload PDFs vs Paste Text */}
            <div className="flex border-b border-stone-200 dark:border-stone-800">
              <button
                onClick={() => setActiveTab('upload')}
                className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'upload'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                Upload PDFs / Papers
              </button>
              <button
                onClick={() => setActiveTab('paste')}
                className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'paste'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                Paste Question Paper Text
              </button>
            </div>

            {/* Error banner if any */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                {/* Drag and Drop Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-stone-50/50 dark:bg-stone-800/40"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,image/*,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-stone-900 dark:text-white">
                    Click to select or drop Previous Year Question PDFs
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Upload 2 to 5 years of exam papers for best repeat frequency results
                  </p>
                </div>

                {/* Uploaded Files List */}
                {fileList.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                      Uploaded Papers ({fileList.length}):
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {fileList.map((f) => (
                        <div
                          key={f.id}
                          className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                            <div className="truncate">
                              <p className="text-xs font-medium text-stone-900 dark:text-white truncate">
                                {f.name}
                              </p>
                              <span className="text-[10px] text-stone-400">
                                {(f.size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-stone-400">Exam Year:</span>
                            <input
                              type="text"
                              value={f.year}
                              onChange={(e) => updateFileYear(f.id, e.target.value)}
                              className="w-16 px-2 py-1 text-xs font-mono font-bold rounded-md bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 text-stone-900 dark:text-white text-center"
                              placeholder="Year"
                            />
                            <button
                              onClick={() => removeFile(f.id)}
                              className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                              title="Remove file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Paste Tab */}
            {activeTab === 'paste' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Paste Full Paper Text (Questions, Marks, Sections)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-stone-400">Paper Year:</span>
                    <input
                      type="text"
                      value={pastedYear}
                      onChange={(e) => setPastedYear(e.target.value)}
                      className="w-20 px-2 py-1 text-xs font-mono font-bold rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-center"
                    />
                  </div>
                </div>
                <textarea
                  rows={8}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste question paper text here, e.g.:&#10;Q1(a) Explain Critical Section Problem and solve using Semaphores. [10 Marks]&#10;Q1(b) Differentiate between process and thread. [8 Marks]&#10;Q2(a) Apply Banker's Algorithm to check safe sequence... [12 Marks]"
                  className="w-full p-3 text-xs sm:text-sm font-mono rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                />
              </div>
            )}

            {/* Presets Fallback Box */}
            <div className="p-3.5 rounded-xl bg-stone-100/70 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="text-xs text-stone-600 dark:text-stone-300">
                <span className="font-semibold text-stone-900 dark:text-white">Don't have papers handy?</span> Explore pre-analyzed engineering datasets:
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onSelectSample('os');
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-50 shadow-2xs transition-colors"
                >
                  Operating Systems (4 Years)
                </button>
                <button
                  onClick={() => {
                    onSelectSample('dsa');
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-50 shadow-2xs transition-colors"
                >
                  DSA (4 Years)
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartAnalysis}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Run PYQ Analysis</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
