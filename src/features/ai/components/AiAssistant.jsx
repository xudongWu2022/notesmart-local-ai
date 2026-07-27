import React, { useRef, useState, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';
import { askQuestion } from '../services/aiService';
import ContentDisplay from './ContentDisplay';

function AiAssistant({
  noteContent,
  initialMessages = [
    {
      id: 1,
      type: 'assistant',
      content:
        'Hi! I can help you analyze this note. What would you like to know?',
    },
  ],
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
    };
    const aiMessage = {
      id: messages.length + 2,
      type: 'assistant',
      content: '',
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setInputMessage('');
    setIsSending(true);

    try {
      await askQuestion(noteContent, inputMessage, (chunk) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessage.id
              ? { ...msg, content: msg.content + chunk }
              : msg,
          ),
        );
      });
    } catch (error) {
      console.error('Error fetching AI response:', error);
      const errorMsg = error instanceof Error && error.message.includes('频率超限')
        ? error.message
        : '抱歉，处理您的请求时发生错误。';
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessage.id
            ? { ...msg, content: errorMsg }
            : msg,
        ),
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[92vh] bg-gradient-ai">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl p-3.5 ${
                message.type === 'user'
                  ? 'user-message-bubble'
                  : 'ai-message-bubble'
              }`}
            >
              {message.type === 'assistant' ? (
                <ContentDisplay content={message.content} />
              ) : (
                <span className="text-sm text-content-primary">{message.content}</span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border-subtle bg-surface-card/50 backdrop-blur-sm">
        <div className="flex gap-2 max-w-[1920px] mx-auto">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2.5 text-sm rounded-xl text-content-primary
                     bg-surface-input hover:bg-surface-hover focus:bg-surface-card
                     border border-border hover:border-blue-300/50 dark:hover:border-blue-700/50
                     focus:border-blue-300/80 dark:focus:border-blue-600/50 focus:ring-1 focus:ring-blue-300/50 dark:focus:ring-blue-700/50
                     placeholder:text-content-tertiary placeholder:text-sm
                     transition-all duration-300 ease-out"
          />
          <button
            type="submit"
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl
                     text-content-primary hover:text-primary-600
                     bg-gradient-to-br from-surface-card/90 to-surface-card/70
                     hover:from-surface-card hover:to-surface-card/80
                     border border-border hover:border-blue-300/50 dark:hover:border-blue-700/50
                     shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]
                     hover:shadow-[0_8px_16px_-4px_rgba(59,130,246,0.15)]
                     transform hover:-translate-y-0.5
                     transition-all duration-300 ease-out
                     disabled:opacity-50 disabled:cursor-not-allowed
                     disabled:hover:transform-none"
            disabled={!inputMessage.trim() || isSending}
          >
            <FiSend className="w-4 h-4 transition-transform duration-300 
                            group-hover:scale-110 group-hover:text-blue-500" />
            <span className="font-medium tracking-wide">{isSending ? 'Thinking…' : 'Send'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default AiAssistant;
