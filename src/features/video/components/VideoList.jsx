import { useState } from 'react';
import { Link } from 'react-router-dom';
import { videoService } from '../services/videoService';
import ConfirmModal from '../../../shared/components/ui/ConfirmModal';
import { useToast } from '../../../shared/hooks/useToast';
import { FiClock, FiTrash2, FiVideo, FiInfo } from 'react-icons/fi';

function VideoList({ videos, onVideoDelete }) {
  const [deleteId, setDeleteId] = useState(null);
  const { showToast } = useToast();

  const handleDelete = async () => {
    try {
      await videoService.deleteVideo(deleteId);
      onVideoDelete(deleteId);
      showToast('Video deleted successfully');
    } catch (error) {
      showToast('Failed to delete video', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  if (!videos.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <FiVideo className="w-12 h-12 mb-4" />
        <p>No videos uploaded yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} 
               className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.08)]
                        border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]
                        transform hover:-translate-y-1 transition-all duration-300">
            <Link to={`/video/${video.id}`}>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-3 text-gray-800 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {video.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <FiClock className="w-4 h-4 mr-1.5" />
                    {new Date(video.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2
                                ${video.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}>
                    </div>
                    <span className="text-gray-700 font-medium">{video.status}</span>
                  </div>
                </div>
              </div>
            </Link>
            <div className="px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setDeleteId(video.id)}
                className="flex items-center text-red-500 hover:text-red-600 
                         transition-colors duration-200 text-sm font-medium"
              >
                <FiTrash2 className="w-4 h-4 mr-1.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Video"
        message="Are you sure you want to delete this video? This action cannot be undone."
      />
    </>
  );
}

export default VideoList; 