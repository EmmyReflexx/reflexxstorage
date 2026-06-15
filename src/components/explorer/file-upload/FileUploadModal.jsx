import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { X, AlertTriangle } from 'lucide-react';
import { getFileIcon } from '../fileIcons';
import { isDuplicateName } from '../../../utils/checkDuplicate';
import { handleCreateFileFunction } from './handleCreateFile';
import { DragAndDropDetector, DropZone } from './DragAndDrop';
import { MediaMetadata } from './MediaMetadata';
import { CancelButton, DeployButton, TrashButton } from './Buttons';

export function FileUploadModal({
  isOpen,
  onClose,
  uploadProps,
  onCommitFiles,
  files,
  setFiles,
  showToasts,
}) {
  const { folderId } = useParams();
  const [duplicateErrors, setDuplicateErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingTimeoutRef = useRef(null);

  // Get current directory nodes for duplicate checking
  const getCurrentDirectoryNodes = () => {
    if (!folderId) {
      return files; // Root level
    }

    // Find the current folder
    const findFolder = (nodes, id) => {
      for (const node of nodes) {
        if (node.id === id && node.type === 'folder') return node;
        if (node.children) {
          const found = findFolder(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const currentFolder = findFolder(files, folderId);
    return currentFolder?.children || [];
  };

  // Clear duplicate errors when modal opens/closes or files change
  useEffect(() => {
    if (!isOpen) {
      setDuplicateErrors([]);
    }
  }, [isOpen]);
  // Cleanup floating timers on unmount to prevent background thread leaks
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  // 1. Memory Management: Clean release of Object URLs to prevent browser heap memory leaks
  const releasePreviewMemory = (stagedFiles) => {
    if (!stagedFiles || stagedFiles.length === 0) return;
    stagedFiles.forEach((file) => {
      if (file.preview && file.preview.startsWith('blob:')) {
        URL.revokeObjectURL(file.preview);
      }
    });
  };

  //a Safe internal exit wrapper
  const handleExitModal = () => {
    if (uploadedFiles) {
      releasePreviewMemory(uploadedFiles);
    }

    if (uploadedFiles && uploadedFiles.length > 0) {
      const targetIds = uploadedFiles.map((f) => f.id);
      targetIds.forEach((id) => removeFile(id));
    }

    setDuplicateErrors([]);
    onClose();
  };

  // 2. Keyboard Event Setup: Escape Key modal capture with clean listener removal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e?.preventDefault();
        handleExitModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, uploadProps?.files]);

  if (!isOpen) return null;

  const {
    files: uploadedFiles,
    isDragging,
    errors: uploadErrors,
    handleChange,
    removeFile,
    triggerFileInput,
    fileInputRef,
    dragProps,
    formatFileSize,
    getRawFileData,
  } = uploadProps;

  // Intercepting single item removals to unbind single blob reference safely
  const handleRemoveSingleFile = (fileId) => {
    const targetFile = uploadedFiles?.find((f) => f.id === fileId);
    if (
      targetFile &&
      targetFile.preview &&
      targetFile.preview.startsWith('blob:')
    ) {
      URL.revokeObjectURL(targetFile.preview);
    }
    removeFile(fileId);
    // Clear duplicate errors when removing files
    setDuplicateErrors([]);
  };

  // Recursive tree injector mapping strictly to your fileTree schema
  function createFile(nodes, targetId, newFile) {
    if (!nodes) return [];
    if (!targetId) {
      return [...nodes, newFile];
    }

    return nodes.map((node) => {
      if (node.id === targetId && node.type === 'folder') {
        return {
          ...node,
          children: node.children ? [...node.children, newFile] : [newFile],
        };
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: createFile(node.children, targetId, newFile),
        };
      }

      return node;
    });
  }

  // Check for duplicate files before committing
  const checkForDuplicates = (stagedFiles) => {
    const currentNodes = getCurrentDirectoryNodes();
    const duplicates = [];
    const uniqueFiles = [];

    for (const stagedFile of stagedFiles) {
      if (isDuplicateName(currentNodes, stagedFile.name, 'file')) {
        duplicates.push(stagedFile.name);
      } else {
        uniqueFiles.push(stagedFile);
      }
    }

    return { duplicates, uniqueFiles };
  };

  // Iterates through your staging queue and maps structures matching your exact object shape
  function handleCreateFile() {
    handleCreateFileFunction(
      uploadedFiles,
      checkForDuplicates,
      setDuplicateErrors,
      processingTimeoutRef,
      setIsProcessing,
      getRawFileData,
      formatFileSize,
      files,
      createFile,
      folderId,
      setFiles,
      onCommitFiles,
      showToasts,
      releasePreviewMemory,
      removeFile,
      onClose,
    );
  }

  // Combine all errors for display
  const allErrors = [...(uploadErrors || []), ...duplicateErrors];

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && handleExitModal()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300 animate-fade-in"
    >
      <DragAndDropDetector isDragging={isDragging} dragProps={dragProps} />

      <input
        ref={fileInputRef}
        type="file"
        hidden
        multiple
        onChange={handleChange}
      />

      {/* Main modal frame constraint settings matching dynamic tracking boundaries */}
      <div className="relative w-full max-w-lg h-auto max-h-[85vh] sm:max-h-[80vh] flex flex-col rounded-3xl border border-neon-edge bg-glass-effect backdrop-blur-xl shadow-2xl shadow-brand-neon/10 p-5 sm:p-6 transition-all duration-300 overflow-hidden">
        {/* Header Block */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h3 className="text-text-main font-lexend-b text-lg sm:text-xl tracking-wide">
              Upload Engine
            </h3>
            <p className="text-text-muted font-lexend-r text-xs sm:text-sm">
              Sync files to your active secure directory
            </p>
          </div>
          <button
            onClick={handleExitModal}
            className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-hover-light border border-transparent hover:border-neon-edge transition-all duration-200 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Validation Errors Display Frame - Now shows both upload errors and duplicate errors */}
        {allErrors && allErrors.length > 0 && (
          <div className="mb-3 p-3 rounded-xl border border-neon-danger/30 bg-neon-danger/10 text-neon-danger flex items-start gap-2.5 shrink-0 max-h-[15%] overflow-y-auto custom-scrollbar">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <div className="flex-1 text-xs font-lexend-r space-y-1">
              {allErrors.map((err, i) => (
                <p key={i} className="leading-relaxed">
                  {err}
                </p>
              ))}
            </div>
          </div>
        )}

        <DropZone
          isDragging={isDragging}
          dragProps={dragProps}
          triggerFileInput={triggerFileInput}
        />

        {/* Uploaded Local Staging Stacks */}
        {uploadedFiles && uploadedFiles.length > 0 && (
          <div className="mt-4 flex flex-col min-h-0 max-h-[280px] shrink-1 overflow-hidden">
            <div className="flex justify-between items-center mb-2 px-1 shrink-0">
              <span className="text-[11px] font-lexend-b tracking-wider uppercase text-text-muted">
                Transfer Queue ({uploadedFiles.length})
              </span>
            </div>

            {/* Scroll Container */}
            <div className="overflow-y-auto space-y-2 pr-1 flex-1 min-h-0 custom-scrollbar">
              {uploadedFiles.map((file) => {
                const fileExtension = file.name.split('.').pop() || '';
                const cleanExt = fileExtension.toLowerCase();

                // Check if this specific file is a duplicate
                const isDuplicateFile = isDuplicateName(
                  getCurrentDirectoryNodes(),
                  file.name,
                  'file',
                );

                // Identify if file is a video extension match
                const isVideo = ['mp4', 'mkv', 'mov', 'avi', 'webm'].includes(
                  cleanExt,
                );

                return (
                  <div
                    key={file.id}
                    className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all duration-200 group/item shrink-0 ${
                      isDuplicateFile
                        ? 'border-neon-danger/50 bg-neon-danger/5 opacity-60'
                        : 'border-neon-edge bg-bg-surface/50 hover:bg-bg-surface'
                    }`}
                  >
                    <MediaMetadata
                      file={file}
                      isVideo={isVideo}
                      getFileIcon={getFileIcon}
                      fileExtension={fileExtension}
                      isDuplicateFile={isDuplicateFile}
                      formatFileSize={formatFileSize}
                    />

                    <TrashButton
                      file={file}
                      handleRemoveSingleFile={handleRemoveSingleFile}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Commit Control Row */}
        <div className="flex gap-3 mt-4 pt-1 border-t border-neon-edge shrink-0">
          <CancelButton
            isProcessing={isProcessing}
            onCancel={handleExitModal}
          />

          <DeployButton
            isProcessing={isProcessing}
            uploadedFiles={uploadedFiles}
            handleCreateFile={handleCreateFile}
          />
        </div>
      </div>
    </div>
  );
}
