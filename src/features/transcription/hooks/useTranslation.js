import { useState, useRef, useCallback } from 'react';

export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);
  const lastTranslationRef = useRef({ text: '', timestamp: 0 });
  const THROTTLE_TIME = 300;

  // 先定义 translateText 函数
  const translateText = useCallback(async (text) => {
    if (!text) return '';
    
    console.log('Sending translation request for:', text);
    
    // 检查是否在短时间内翻译过相同的文本
    const now = Date.now();
    if (
      text === lastTranslationRef.current.text && 
      now - lastTranslationRef.current.timestamp < THROTTLE_TIME
    ) {
      console.log('Using cached translation');
      return lastTranslationRef.current.translation;
    }

    try {
      const response = await fetch('http://localhost:5001/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Translation response:', data);

      const translation = data?.translation || '';
      
      // 更新缓存
      lastTranslationRef.current = {
        text,
        translation,
        timestamp: now
      };

      return translation;
    } catch (error) {
      console.error('Translation request failed:', error);
      return '';
    }
  }, []); // 没有依赖项

  // 然后定义 handleNewTranscript，它依赖于 translateText
  const handleNewTranscript = useCallback(async (transcript) => {
    if (!isTranslating || !transcript?.text) {
      console.log('Skipping translation:', { isTranslating, hasText: !!transcript?.text });
      return;
    }

    try {
      console.log('Processing transcript for translation:', transcript.text);
      const translation = await translateText(transcript.text);
      console.log('Received translation:', translation);
      
      // 直接返回翻译结果，让调用者决定如何处理
      return translation;
    } catch (error) {
      console.error('Translation processing failed:', error);
      return '';
    }
  }, [isTranslating, translateText]);

  // 最后定义 toggleTranslation，它依赖于 handleNewTranscript
  const toggleTranslation = useCallback(async (existingTranscripts = []) => {
    console.log('Toggle translation called with transcripts:', existingTranscripts.length);
    
    // 先更新状态
    setIsTranslating(prev => !prev);
    
    // 如果是开启翻译，处理现有记录
    if (!isTranslating) {
      console.log('Processing existing transcripts for translation');
      const translations = await Promise.all(
        existingTranscripts
          .filter(t => t.text && !t.translation)
          .map(async transcript => {
            const translation = await translateText(transcript.text);
            return {
              id: transcript.id,
              translation
            };
          })
      );
      
      console.log('Completed translations:', translations);
      return translations;
    }
    
    return [];
  }, [isTranslating, translateText]);

  return {
    isTranslating,
    translateText,
    toggleTranslation,
    handleNewTranscript
  };
}