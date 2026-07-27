import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { videoService } from '../services/videoService';
import Transcription from './Transcription';
import { FiClock, FiInfo, FiFileText } from 'react-icons/fi';

function VideoDetail() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadVideo = useCallback(async () => {
    try {
      setLoading(true);
      const data = await videoService.getVideoById(id);
      setVideo(data);
    } catch (err) {
      setError('Failed to load video');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadVideo();
  }, [loadVideo]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-[400px] text-red-500">
      <FiInfo className="w-5 h-5 mr-2" />
      {error}
    </div>
  );
  
  if (!video) return (
    <div className="flex items-center justify-center min-h-[400px] text-gray-500">
      <FiInfo className="w-5 h-5 mr-2" />
      Video not found
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-500 
                   bg-clip-text text-transparent">{video.title}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Video Player Section */}
        <div className="space-y-6">
          <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden 
                       shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-gray-900">
            <video
              controls
              className="w-full h-full object-cover"
              src={video.url}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.08)]
                       border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <FiFileText className="w-5 h-5 text-blue-500" />
              <h2 className="font-semibold text-gray-800">Details</h2>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              {video.description}
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <FiClock className="w-4 h-4 mr-1.5" />
                {new Date(video.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 
                              ${video.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <span className="font-medium">{video.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transcription Section */}
        <div>
          <Transcription videoId={id} />
        </div>
      </div>
    </div>
  );
}

export default VideoDetail; 