import { ChangeEvent, RefObject, DragEvent } from 'react';

export interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  extension: string;
  preview?: string;
}

export interface UseFileUploadOptions {
  multiple?: boolean;
  maxSize?: number;
  acceptedFormats?: string[];
  onError?: (error: string) => void;
}

export interface UseFileUploadReturn {
  files: FileItem[];
  isDragging: boolean;
  errors: string[];
  handleChange: (
    eventOrFiles: ChangeEvent<HTMLInputElement> | File[] | FileList | File,
  ) => void;
  removeFile: (fileId: string) => void;
  triggerFileInput: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  dragProps: {
    onDragEnter: (e: DragEvent<HTMLDivElement>) => void;
    onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: DragEvent<HTMLDivElement>) => void;
    onDrop: (e: DragEvent<HTMLDivElement>) => void;
  };
  formatFileSize: (bytes: number) => string;
  getRawFileData: (
    fileOrId: string | FileItem | File,
  ) => Promise<string | null>;
}
