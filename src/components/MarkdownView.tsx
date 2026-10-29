import React from 'react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  // Simple, safe markdown rendering for headings, lists, bold, inline code, and codeblocks
  const renderParagraphs = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    lines.forEach((line, idx) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${idx}`}
              className="my-3 p-3 text-xs sm:text-sm font-mono bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg overflow-x-auto text-stone-800 dark:text-stone-200"
            >
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      const trimmed = line.trim();

      if (!trimmed) {
        elements.push(<div key={`sp-${idx}`} className="h-2" />);
        return;
      }

      if (trimmed.startsWith('### ')) {
        elements.push(
          <h4 key={`h3-${idx}`} className="font-semibold text-base text-stone-900 dark:text-white mt-3 mb-1">
            {formatInline(trimmed.substring(4))}
          </h4>
        );
      } else if (trimmed.startsWith('## ')) {
        elements.push(
          <h3 key={`h2-${idx}`} className="font-bold text-lg text-stone-900 dark:text-white mt-4 mb-2">
            {formatInline(trimmed.substring(3))}
          </h3>
        );
      } else if (trimmed.startsWith('# ')) {
        elements.push(
          <h2 key={`h1-${idx}`} className="font-bold text-xl text-stone-900 dark:text-white mt-4 mb-2">
            {formatInline(trimmed.substring(2))}
          </h2>
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <li key={`li-${idx}`} className="ml-4 list-disc text-stone-700 dark:text-stone-300 my-0.5 text-sm leading-relaxed">
            {formatInline(trimmed.substring(2))}
          </li>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        const textPart = trimmed.replace(/^\d+\.\s/, '');
        elements.push(
          <li key={`oli-${idx}`} className="ml-4 list-decimal text-stone-700 dark:text-stone-300 my-0.5 text-sm leading-relaxed">
            {formatInline(textPart)}
          </li>
        );
      } else {
        elements.push(
          <p key={`p-${idx}`} className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed my-1">
            {formatInline(line)}
          </p>
        );
      }
    });

    if (inCodeBlock && codeBuffer.length > 0) {
      elements.push(
        <pre
          key="code-final"
          className="my-3 p-3 text-xs sm:text-sm font-mono bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg overflow-x-auto text-stone-800 dark:text-stone-200"
        >
          <code>{codeBuffer.join('\n')}</code>
        </pre>
      );
    }

    return elements;
  };

  const formatInline = (text: string): React.ReactNode => {
    // parse bold **bold** and code `code`
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-stone-900 dark:text-stone-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded text-xs font-mono bg-stone-200/70 dark:bg-stone-800 text-stone-800 dark:text-stone-200"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return <div className={`space-y-1 ${className}`}>{renderParagraphs()}</div>;
};
