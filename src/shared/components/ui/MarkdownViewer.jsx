import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownContent = ({ content }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {content || ''}
  </ReactMarkdown>
);

const MarkdownViewer = ({ content }) => {
  return (
    <div className="prose prose-slate max-w-none">
      <MarkdownContent content={content} />
    </div>
  );
};

export default MarkdownViewer;
