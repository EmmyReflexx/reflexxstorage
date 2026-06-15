import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import { UseFileUploadOptions, UseFileUploadReturn, FileItem } from './types';

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (
    parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) +
    ' ' +
    ['Bytes', 'KB', 'MB', 'GB'][i]
  );
};

// Explicitly bound HTML attributes without spread props typing downfalls
export const DragDetector: React.FC<{
  isDragging: boolean;
  dragProps: UseFileUploadReturn['dragProps'];
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ isDragging, dragProps, children, className, style }) => {
  if (!isDragging) return null;
  return (
    <div
      className={className}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, ...style }}
      onDragEnter={dragProps.onDragEnter}
      onDragLeave={dragProps.onDragLeave}
      onDragOver={dragProps.onDragOver}
      onDrop={dragProps.onDrop}
    >
      {children}
    </div>
  );
};

export const useFileUpload = (
  options: UseFileUploadOptions = {},
): UseFileUploadReturn => {
  const {
    multiple = false,
    maxSize = 10 * 1024 * 1024,
    acceptedFormats = [],
    onError,
  } = options;

  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<FileItem[]>(files);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () =>
      filesRef.current.forEach(
        (f) => f.preview?.startsWith('blob:') && URL.revokeObjectURL(f.preview),
      );
  }, []);

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      setIsDragging(true);
    },
    [],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      setIsDragging(false);
    },
    [],
  );

  const validateAndProcessFiles = useCallback(
    (incomingFiles: File[]): void => {
      if (incomingFiles.length === 0) return;
      const workingBatch = multiple ? incomingFiles : [incomingFiles[0]];
      const newErrors: string[] = [];
      const validItems: FileItem[] = [];

      workingBatch.forEach((file) => {
        if (
          acceptedFormats.length > 0 &&
          !acceptedFormats.some((f) =>
            f.endsWith('/*')
              ? file.type.startsWith(f.split('/')[0] + '/')
              : file.type === f,
          )
        ) {
          const msg = `Invalid format: ${file.name}.`;
          newErrors.push(msg);
          onError?.(msg);
          return;
        }
        if (file.size > maxSize) {
          const msg = `File too large: ${file.name}. Max: ${formatFileSize(maxSize)}`;
          newErrors.push(msg);
          onError?.(msg);
          return;
        }

        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const isMedia =
          file.type.startsWith('image/') || file.type.startsWith('video/');
        validItems.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          extension: ext,
          preview: isMedia ? URL.createObjectURL(file) : undefined,
        });
      });

      setErrors(newErrors);
      if (validItems.length === 0) return;

      setFiles((prev) => {
        if (!multiple)
          prev.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
        return multiple ? [...prev, ...validItems] : validItems;
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [multiple, maxSize, acceptedFormats, onError],
  );

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement> | File[] | FileList | File,
    ): void => {
      const list =
        e instanceof FileList
          ? Array.from(e)
          : Array.isArray(e)
            ? e
            : e instanceof File
              ? [e]
              : e?.target?.files
                ? Array.from(e.target.files)
                : [];
      validateAndProcessFiles(list);
    },
    [validateAndProcessFiles],
  );

  const removeFile = useCallback((fileId: string): void => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === fileId);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((f) => f.id !== fileId);
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files?.length > 0)
        validateAndProcessFiles(Array.from(e.dataTransfer.files));
    },
    [validateAndProcessFiles],
  );

  const getRawFileData = useCallback(
    async (fileOrId: string | FileItem | File): Promise<string | null> => {
      let targetFile: File | undefined;
      let extension = '';
      let mimeType = '';

      if (fileOrId instanceof File) {
        targetFile = fileOrId;
        extension = fileOrId.name.split('.').pop()?.toLowerCase() || '';
        mimeType = fileOrId.type.toLowerCase();
      } else if (typeof fileOrId === 'object' && 'file' in fileOrId) {
        targetFile = fileOrId.file;
        extension = fileOrId.extension;
        mimeType = fileOrId.type.toLowerCase();
      } else if (typeof fileOrId === 'string') {
        const match = filesRef.current.find((f) => f.id === fileOrId);
        if (match) {
          targetFile = match.file;
          extension = match.extension;
          mimeType = match.type.toLowerCase();
        }
      }

      if (!targetFile) return null;

      return new Promise((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = () => resolve(null);

        const txtExts = [
          'ts',
          'tsx',
          'js',
          'jsx',
          'json',
          'csv',
          'md',
          'txt',
          'svg',
          'xml',
        ];
        if (
          mimeType.startsWith('text/') ||
          mimeType === 'application/json' ||
          txtExts.includes(extension)
        ) {
          r.readAsText(targetFile);
        } else {
          r.readAsDataURL(targetFile);
        }
      });
    },
    [],
  );

  return useMemo(
    () => ({
      files,
      isDragging,
      errors,
      handleChange,
      removeFile,
      fileInputRef,
      formatFileSize,
      getRawFileData,
      triggerFileInput: () => fileInputRef.current?.click(),
      dragProps: {
        onDragEnter: handleDragEnter,
        onDragLeave: handleDragLeave,
        onDragOver: (e: React.DragEvent<HTMLDivElement>) => e.preventDefault(),
        onDrop: handleDrop,
      },
    }),
    [
      files,
      isDragging,
      errors,
      handleChange,
      removeFile,
      handleDragEnter,
      handleDragLeave,
      handleDrop,
      getRawFileData,
    ],
  );
};
