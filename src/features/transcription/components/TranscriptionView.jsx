import React, { useState } from 'react';
import LiveTranscription from './LiveTranscription';
import _AiAssistant from '../../ai/components/AiAssistant';

function TranscriptionView() {
  const [_noteContent, _setNoteContent] = useState(''); // 当前笔记内容（可以根据需要动态加载）

  return (
    <div className="p-6 flex gap-4 h-screen">
      {/* 主区域 - 实时转录 */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">字幕模式</h1>
        <LiveTranscription />
      </div>
      {/* 右侧 - AI 助手 */}
      {/* // <AiAssistant noteContent={noteContent} /> */}
    </div>
  );
}

export default TranscriptionView;
