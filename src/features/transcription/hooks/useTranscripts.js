import { useState, useCallback, useEffect } from 'react';
import { generateNote } from '../../notes/services/noteGenerationService';
import { create } from 'zustand';
import { languages } from '../../../shared/lib/languages';

// 创建全局状态管理
export const useTranscriptStore = create((set, get) => ({
  notes: [],
  noteLanguage: 'en-US',  // 默认中文
  transcriptionLanguage: 'en-US',  // 默认中文
  translationLanguage: 'en-US',    // 默认英文
  isTranslating: false,            // 默认不开启翻译
  transcriptionContent: '',  // 当前转录内容
  transcriptionSegments: [], // 转录片段
  isRecording: false,       // 是否正在录音
  setNoteLanguage: (language) => set({ noteLanguage: language }),
  addNote: (note) => set((_state) => ({
    notes: [..._state.notes, note]
  })),
  updateNote: (id, content) => set((_state) => ({
    notes: _state.notes.map(note => 
      note.id === id 
        ? { ...note, content: content }
        : note
    )
  })),
  setTranscriptionLanguage: (language) => set({ transcriptionLanguage: language }),
  setTranslationLanguage: (language) => set({ translationLanguage: language }),
  setIsTranslating: (isTranslating) => set({ isTranslating }),
  setTranscriptionContent: (content) => set({ transcriptionContent: content }),
  setTranscriptionSegments: (_segments) => set({ transcriptionSegments: _segments }),
  updateTranscription: (content, segments) => set({
    transcriptionContent: content,
    transcriptionSegments: segments
  }),
  clearTranscription: () => set({
    transcriptionContent: '',
    transcriptionSegments: []
  }),
  setIsRecording: (isRecording) => set({ isRecording }),
  getTranscriptionState: () => ({
    content: get().transcriptionContent,
    segments: get().transcriptionSegments,
    isRecording: get().isRecording
  }),
  // 添加转录缓冲区相关状态
  transcriptBuffer: {
    segments: [],
    currentSegment: {
      id: `segment-${Date.now()}`,
      texts: [],
      wordCount: 0,
      startTime: null
    },
    notes: []
  },
  // 添加更新转录缓冲区的方法
  updateTranscriptBuffer: (newBuffer) => set((_state) => ({
    transcriptBuffer: newBuffer
  })),
  // 添加获取完整转录状态的方法
  getFullTranscriptionState: () => ({
    ...get().getTranscriptionState(),
    buffer: get().transcriptBuffer
  })
}));

const convertToHtml = (text) => {
  // 将 Markdown 格式转换为 HTML
  const sections = text.split('##').map(section => section.trim());
  let html = '';

  sections.forEach((section, index) => {
    if (index === 0) {
      // 处理标题部分 (以 # 开头)
      const titleMatch = section.match(/#\s*(.*)/);
      if (titleMatch) {
        html += `<h1>${titleMatch[1].replace(/\*([^*]+)\*/g, '<em>$1</em>')}</h1>`;
      }
    } else {
      // 处理其他部分
      const lines = section.split('\n');
      const sectionTitle = lines[0].trim();
      html += `<h2>${sectionTitle.replace(/\*([^*]+)\*/g, '<em>$1</em>')}</h2>`;

      // 处理列表项和段落，同时处理强调语法
      const content = lines.slice(1).join('\n')
        .replace(/^\s*-\s*(.*)/gm, (match, p1) => 
          `<li>${p1.replace(/\*([^*]+)\*/g, '<em>$1</em>')}</li>`) // 处理无序列表
        .replace(/^\s*\d+\.\s*(.*)/gm, (match, p1) => 
          `<li>${p1.replace(/\*([^*]+)\*/g, '<em>$1</em>')}</li>`) // 处理有序列表
        .replace(/(^|\n)([^<].*[^>])($|\n)/g, (_match, _p1, p2, _p3) => 
          `<p>${p2.replace(/\*([^*]+)\*/g, '<em>$1</em>')}</p>`); // 处理普通段落

      if (content.includes('<li>')) {
        html += `<ul>${content}</ul>`;
      } else {
        html += content;
      }
    }
  });

  return html;
};

export function useTranscripts() {
  const [transcriptBuffer, setTranscriptBuffer] = useState({
    segments: [],
    currentSegment: {       // 当前正在处理的段落
      id: `segment-${Date.now()}`,
      texts: [],
      wordCount: 0,
      startTime: null
    },
    notes: []              // 笔记数组
  });

  // 同步 transcriptBuffer 到 store
  useEffect(() => {
    useTranscriptStore.getState().updateTranscriptBuffer(transcriptBuffer);
  }, [transcriptBuffer]);

  // 判断是否应该创建新段落
  const shouldCreateNewSegment = useCallback((segment, newTranscript) => {
    const MIN_WORDS = 30;
    const hasMinWords = segment.wordCount >= MIN_WORDS;
    const lastText = segment.texts[segment.texts.length - 1]?.text || '';
    const endsWithPunctuation = /[.!?。！？]$/.test(lastText.trim());
    const _newText = newTranscript.text || '';
    const _startsWithCapital = /^[A-Z]/.test(_newText.trim());

    return hasMinWords && endsWithPunctuation;
  }, []);

  const updateLatestTranscript = useCallback((data) => {
    console.log('updateLatestTranscript called with:', data);
    
    const transcriptData = data?.channel?.alternatives?.[0];
    if (!transcriptData?.transcript) {
      console.log('No valid transcript data');
      return;
    }

    const transcript = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: transcriptData.transcript,
      words: transcriptData.words || [],
      timestamp: Date.now()
    };

    setTranscriptBuffer(prev => {
      console.log('Updating transcriptBuffer:', {
        prevState: prev,
        newTranscript: transcriptData
      });
     
      const lastText = prev.currentSegment.texts.length > 0
        ? prev.currentSegment.texts[prev.currentSegment.texts.length - 1].text
        : prev.segments.length > 0
          ? prev.segments[prev.segments.length - 1].texts.slice(-1)[0]?.text
          : '';
        
      let newText = transcript.text;
      if (lastText) {
        if (newText.includes(lastText)) {
          // 如果新文本包含旧文本，只保留新增部分
          newText = newText.substring(lastText.length).trim();
          if (!newText) return prev; // 如果没有新内容，直接返回原状态
        } else if (lastText.includes(newText)) {
          // 如果新文本完全包含在旧文本中，忽略这次更新
          return prev;
        }
      }

      transcript.text = newText;

      const updatedSegment = {
        ...prev.currentSegment,
        texts: [...prev.currentSegment.texts, transcript],
        wordCount: prev.currentSegment.wordCount + transcript.words.length,
        startTime: prev.currentSegment.startTime || transcript.timestamp
      };

      console.log('shouldCreateNewSegment check:', {
        segment: updatedSegment,
        newTranscript: transcript,
        result: shouldCreateNewSegment(updatedSegment, transcript)
      });

      if (shouldCreateNewSegment(updatedSegment, transcript)) {
        const finalizedSegment = {
          ...updatedSegment,
          endTime: transcript.timestamp
        };

        const segmentText = finalizedSegment.texts.map(t => t.text).join(' ');
        
        const noteLanguage = useTranscriptStore.getState().noteLanguage;
        generateNote(segmentText, noteLanguage)
          .then(noteContent => {
            const htmlContent = convertToHtml(noteContent);
            
            useTranscriptStore.getState().addNote({
              id: `note-${Date.now()}`,
              content: htmlContent,
              segmentId: finalizedSegment.id,
              timestamp: Date.now()
            });
          })
          .catch(error => {
            console.error('Failed to generate note:', error);
            useTranscriptStore.getState().addNote({
              id: `note-${Date.now()}`,
              content: `<p>${segmentText}</p>`,
              segmentId: finalizedSegment.id,
              timestamp: Date.now()
            });
          });

        return {
          ...prev,
          segments: [...prev.segments, finalizedSegment],
          currentSegment: {
            id: `segment-${Date.now()}`,
            texts: [],
            wordCount: 0,
            startTime: transcript.timestamp
          }
        };
      }

      return {
        ...prev,
        currentSegment: updatedSegment
      };
    });
  }, [shouldCreateNewSegment]);

  // 添加调试日志
  useEffect(() => {
    console.log('Segments updated:', {
      segmentsCount: transcriptBuffer.segments.length,
      segments: transcriptBuffer.segments
    });
  }, [transcriptBuffer.segments]);

  useEffect(() => {
    console.log('Notes updated:', {
      notesCount: transcriptBuffer.notes.length,
      notes: transcriptBuffer.notes
    });
  }, [transcriptBuffer.notes]);

  return {
    transcriptBuffer,
    updateLatestTranscript,
  };
} 