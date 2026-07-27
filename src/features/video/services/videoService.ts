import { httpClient } from '../../../shared/lib/httpClient';

interface Video {
  id: string;
  filename: string;
  url: string;
  duration?: number;
  uploadDate: string;
}

export const videoService = {
  async uploadVideo(file: File, onProgress?: (percent: number) => void): Promise<Video> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await httpClient.post<Video>('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
        );
        onProgress?.(percentCompleted);
      },
    });
    return data;
  },

  async getVideos(): Promise<Video[]> {
    const { data } = await httpClient.get<Video[]>('/videos');
    return data;
  },

  async getVideoById(id: string): Promise<Video> {
    const { data } = await httpClient.get<Video>(`/videos/${id}`);
    return data;
  },
};
