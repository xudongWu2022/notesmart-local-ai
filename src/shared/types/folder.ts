export interface Folder {
  id?: number;
  name: string;
  createdAt: string;
  lastModified: string;
  syncStatus: 'pending' | 'synced' | 'error';
}

export interface FolderWithCount extends Folder {
  noteCount: number;
}
