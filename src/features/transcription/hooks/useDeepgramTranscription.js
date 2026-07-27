import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { useState, useRef, useCallback } from 'react';
import { CONFIG } from '../../../shared/lib/config';

export function useDeepgramTranscription() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const connectionRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const startTimeRef = useRef(null);
  const packetCountRef = useRef(0);
  const mediaRecorderRef = useRef(null);

  const cleanup = useCallback(() => {
    console.group('Cleanup Process');
    console.log('Starting cleanup process...');
    
    // 1. 首先停止 MediaRecorder
    if (mediaRecorderRef.current) {
      console.log('Stopping MediaRecorder...');
      // 添加 onstop 处理器来确保最后的数据被处理
      mediaRecorderRef.current.onstop = () => {
        console.log('MediaRecorder stopped completely');
      };
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    // 2. 然后关闭 Deepgram 连接
    if (connectionRef.current) {
      console.log('Closing Deepgram connection...', {
        connectionState: connectionRef.current.getReadyState(),
        totalTime: startTimeRef.current ? `${(Date.now() - startTimeRef.current) / 1000}s` : 'N/A',
        packetsProcessed: packetCountRef.current
      });
      // 确保在关闭前所有数据都被发送
      connectionRef.current.finish();
      // 添加小延迟确保数据被发送
      setTimeout(() => {
        connectionRef.current = null;
        // 3. 最后停止媒体流
        if (mediaStreamRef.current) {
          console.log('Stopping media stream...');
          mediaStreamRef.current.getTracks().forEach(track => {
            track.stop();
            console.log(`Track ${track.kind} stopped`);
          });
          mediaStreamRef.current = null;
        }
        setIsRecording(false);
        console.log('Cleanup completed');
        console.groupEnd();
      }, 100);
    } else {
      // 如果没有连接，直接清理媒体流
      if (mediaStreamRef.current) {
        console.log('Stopping media stream...');
        mediaStreamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log(`Track ${track.kind} stopped`);
        });
        mediaStreamRef.current = null;
      }
      setIsRecording(false);
      console.log('Cleanup completed');
      console.groupEnd();
    }
  }, []);

  const startRecording = useCallback(async (onTranscriptReceived,language='en-US') => {
    console.group('Starting Recording Process');
    try {
      console.log('Initializing recording process...');
      startTimeRef.current = Date.now();
      packetCountRef.current = 0;
      
      // 1. 检查和获取API密钥
      const deepgramApiKey = CONFIG.DEEPGRAM_API_KEY;
      if (!deepgramApiKey) {
        console.error('API key missing');
        throw new Error('Deepgram API key is not set');
      }
      console.log('API key validated');

      // 2. 初始化 Deepgram SDK
      console.log('Initializing Deepgram client...');
      const deepgram = createClient(deepgramApiKey);

      // 3. 创建 Deepgram 实时连接
      console.log('Creating Deepgram live connection with config:', {
        smart_format: true,
        model: 'enhanced',
        language: language,
        interim_results: true,
        punctuate: true,
      });
      
      const connection = deepgram.listen.live({
        smart_format: true,
        model: 'enhanced',
        language: language,
        interim_results: false,
        punctuate: true,
        min_signal: -100,
      utterance_silence_threshold: 5000,
      diarize: false,
      vad_turnoff: 8000,
      });

      connectionRef.current = connection;

      // 4. 监听连接打开事件
      connection.on(LiveTranscriptionEvents.Open, async () => {
        console.group('Connection Open Handler');
        console.log('Deepgram connection opened successfully');

        // 5. 监听转录事件
        connection.on(LiveTranscriptionEvents.Transcript, (data) => {
          console.group('Transcript Received');
          console.log('Raw transcript data:', data);
          
          const transcript = data?.channel?.alternatives?.[0];
          if (transcript) {
            console.log('Processed transcript:', {
              text: transcript.transcript,
              confidence: transcript.confidence,
              words: transcript.words?.length,
              isFinal: data.is_final
            });
          }
          
          onTranscriptReceived(data);
          console.groupEnd();
        });

        // 6. 监听元数据事件
        connection.on(LiveTranscriptionEvents.Metadata, (data) => {
          console.log('Metadata received:', data);
        });

        // 7. 获取麦克风流并发送数据
        try {
          console.log('Requesting microphone access...');
          mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            },
            video: false
          });
          console.log('Microphone access granted', {
            tracks: mediaStreamRef.current.getTracks().map(track => ({
              kind: track.kind,
              constraints: track.getConstraints(),
              settings: track.getSettings()
            }))
          });

          // 创建 MediaRecorder
          console.log('Creating MediaRecorder...');
          const mediaRecorder = new MediaRecorder(mediaStreamRef.current);
          
          // 当有数据可用时发送给 Deepgram
          mediaRecorder.ondataavailable = (event) => {
            packetCountRef.current++;
            if (event.data.size > 0 && connection.getReadyState() === 1) {
              // console.log('Sending audio data:', {
              //   packetNumber: packetCountRef.current,
              //   dataSize: event.data.size,
              //   connectionState: connection.getReadyState(),
              //   timestamp: new Date().toISOString(),
              //   elapsedTime: `${(Date.now() - startTimeRef.current) / 1000}s`
              // });
              connection.send(event.data);
            }
          };

          // 开始录制
          console.log('Starting MediaRecorder...');
          mediaRecorder.start(250);
          setIsRecording(true);
          console.log('Recording started successfully');

        } catch (error) {
          console.error('Error accessing microphone:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
          setError(`Microphone error: ${error.message}`);
          cleanup();
        }
        console.groupEnd();
      });

      // 8. 监听关闭事件
      connection.on(LiveTranscriptionEvents.Close, () => {
        console.log('Connection closed.', {
          totalTime: `${(Date.now() - startTimeRef.current) / 1000}s`,
          totalPackets: packetCountRef.current
        });
        cleanup();
      });

      // 9. 监听错误事件
      connection.on(LiveTranscriptionEvents.Error, (error) => {
        console.error('Deepgram error:', {
          error,
          connectionState: connection?.getReadyState(),
          totalTime: `${(Date.now() - startTimeRef.current) / 1000}s`,
          totalPackets: packetCountRef.current
        });
        setError(`Deepgram error: ${error.message}`);
        cleanup();
      });

    } catch (error) {
      console.error('Setup error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        timeElapsed: `${(Date.now() - startTimeRef.current) / 1000}s`
      });
      setError(`Setup error: ${error.message}`);
      cleanup();
    }
    console.groupEnd();
  }, [cleanup]);

  const stopRecording = useCallback(() => {
    console.group('Stop Recording');
    console.log('Stopping recording...', {
      totalTime: startTimeRef.current ? `${(Date.now() - startTimeRef.current) / 1000}s` : 'N/A',
      totalPackets: packetCountRef.current
    });
    cleanup();
    console.groupEnd();
  }, [cleanup]);

  return {
    isRecording,
    error,
    startRecording,
    stopRecording
  };
} 