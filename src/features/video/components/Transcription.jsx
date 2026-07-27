import { useState, useEffect, useRef } from 'react';
import { transcriptionService } from '../../transcription/services/transcriptionService';
import { FiFileText, FiClock, FiLoader } from 'react-icons/fi';

function Transcription({ videoId }) {
  const [transcription, setTranscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const loadTranscription = async () => {
    try {
      setLoading(true);
      const data = await transcriptionService.getTranscription(videoId);
      setTranscription(data);
      if (data.status === 'completed') {
        clearInterval(intervalRef.current);
      }
    } catch (err) {
      setError('Failed to load transcription');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTranscription();
    // Set up polling if transcription is processing
    intervalRef.current = setInterval(loadTranscription, 10000);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadTranscription]);

  if (loading) return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.08)] border border-gray-100
                   flex items-center justify-center h-[200px]">
      <div className="flex items-center space-x-3 text-gray-500">
        <FiLoader className="w-5 h-5 animate-spin" />
        <span>Loading transcription...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.08)] border border-gray-100
                   flex items-center justify-center h-[200px] text-red-500">
      {error}
    </div>
  );

  if (!transcription) return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.08)] border border-gray-100
                   flex items-center justify-center h-[200px] text-gray-500">
      No transcription available
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.08)] border border-gray-100">
      <div className="flex items-center space-x-2 mb-6">
        <FiFileText className="w-5 h-5 text-blue-500" />
        <h2 className="font-semibold text-gray-800">Transcription</h2>
      </div>

      {transcription.status === 'processing' ? (
        <div className="text-center py-8">
          <FiLoader className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Transcription in progress...</p>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full 
                         animate-pulse transition-all duration-300"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
          {transcription.segments.map((segment, index) => (
            <div key={index} 
                 className="p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200
                          border border-gray-100">
              <div className="flex items-center text-gray-500 text-sm mb-2">
                <FiClock className="w-4 h-4 mr-1.5" />
                {formatTimestamp(segment.start)} - {formatTimestamp(segment.end)}
              </div>
              <p className="text-gray-700 leading-relaxed">{segment.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatTimestamp(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default Transcription;
