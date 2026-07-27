import React, { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';

const ContentDisplay = ({ content }) => {
  const [copiedSection, setCopiedSection] = useState(null);

  const handleCopy = async (text, sectionIndex) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionIndex);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const processText = (text) => {
    if (!text || typeof text !== 'string') {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="text-center space-y-2">
            <div className="relative inline-flex">
              {/* 优化加载动画 */}
              <div className="w-8 h-8 rounded-full border-2 border-gray-100">
                <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                <div className="absolute inset-[2px] rounded-full bg-gradient-to-tr from-blue-50 to-white"></div>
              </div>
              {/* 优化加载点动画 */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-0.5">
                <div className="w-1 h-1 rounded-full bg-blue-400 animate-[bounce_1s_infinite]"></div>
                <div className="w-1 h-1 rounded-full bg-blue-400 animate-[bounce_1s_infinite_.1s]"></div>
                <div className="w-1 h-1 rounded-full bg-blue-400 animate-[bounce_1s_infinite_.2s]"></div>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Processing...</p>
          </div>
        </div>
      );
    }

    // 优化分段处理
    const sections = text.split('###').filter(Boolean);

    return sections.map((section, sectionIndex) => {
      if (!section.trim()) return null;

      // 优化标题和内容分离
      const [title, ...contentLines] = section.trim().split('\n');
      const sectionContent = contentLines.join('\n').trim();

      // 优化内容处理
      const parts = sectionContent.split(/(\*\*.*?\*\*|\n-\s+)/g).filter(Boolean);

      return (
        <div key={sectionIndex} className="mb-3 relative group">
          <div className="flex justify-between items-start gap-2">
            <h4 className="text-xs font-medium text-gray-700">{title}</h4>
            <button
              onClick={() => handleCopy(section, sectionIndex)}
              className="opacity-0 group-hover:opacity-100 transition-all duration-200 
                        p-1.5 hover:bg-gray-50 rounded-lg"
              title={copiedSection === sectionIndex ? "Copied!" : "Copy section"}
            >
              {copiedSection === sectionIndex ? (
                <FiCheck className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <FiCopy className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          <div className="space-y-1 mt-1">
            {parts.map((part, index) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                const boldText = part.slice(2, -2);
                return (
                  <h5 key={index} className="text-xs font-medium text-gray-600 mt-2 mb-1">
                    {boldText.replace(':', '')}
                  </h5>
                );
              }

              if (part.startsWith('\n- ')) {
                return (
                  <div key={index} className="flex gap-1.5 text-xs text-gray-600 pl-2">
                    <span className="text-gray-400">•</span>
                    <span>{part.replace('\n- ', '')}</span>
                  </div>
                );
              }

              return part && (
                <div key={index} className="text-xs text-gray-600">
                  {part}
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="text-gray-800 space-y-2">
      {processText(content)}
    </div>
  );
};

export default ContentDisplay;
