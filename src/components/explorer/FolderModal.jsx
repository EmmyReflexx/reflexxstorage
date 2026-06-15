import { useState, useEffect } from 'react';
import { X, FolderPlus, Edit3, AlertTriangle } from 'lucide-react';
import {
  isDuplicateName,
  getDuplicateErrorMessage,
} from '../../utils/checkDuplicate';

export function FolderModal({
  isOpen,
  onClose,
  onSubmit,
  initialValue = '',
  mode = 'create',
  existingNodes = [],
  currentFolderId = null,
  showToasts,
}) {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');

  // Synchronize internal text state changes cleanly during initialization phases
  useEffect(() => {
    if (isOpen) {
      setFolderName(mode === 'rename' ? initialValue : '');
      setError(''); // Clear error when modal opens
    }
  }, [isOpen, initialValue, mode]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = folderName.trim();

    if (!trimmedName) return;
    if (mode === 'create') {
      if (isDuplicateName(existingNodes, trimmedName, 'folder')) return;
      showToasts('folder');
    } else if (mode === 'rename') {
      if (isDuplicateName(existingNodes, trimmedName, 'folder')) return;
      showToasts('rename');
    }

    // Check for duplicate (skip if renaming and name hasn't changed)
    if (mode !== 'rename' || trimmedName !== initialValue) {
      if (isDuplicateName(existingNodes, trimmedName, 'folder')) {
        setError(getDuplicateErrorMessage(trimmedName, 'folder'));
        return;
      }
    }

    onSubmit(trimmedName);
    onClose();
  };

  const handleNameChange = (e) => {
    setFolderName(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Soft overlay barrier backing to lock focused interactions */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out_both]"
        onClick={onClose}
      />

      {/* Styled Card Modal Container layout blocks */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-neon-edge bg-bg-surface p-6 shadow-2xl transition-all animate-[modalIn_0.22s_cubic-bezier(0.16,1,0.3,1)_both]">
        {/* Localized transition vectors configurations */}
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        `}</style>

        {/* Dismiss trigger */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-text-muted hover:text-text-main hover:bg-hover-light transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Branding Title Header Row */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-neon-edge/40 text-brand-neon [&>svg]:w-5 [&>svg]:h-5">
            {mode === 'create' ? <FolderPlus /> : <Edit3 />}
          </div>
          <div>
            <h3 className="font-lexend-b text-base text-text-main tracking-wide leading-tight">
              {mode === 'create' ? 'Create New Folder' : 'Rename Folder'}
            </h3>
            <p className="font-lexend-r text-xs text-text-muted mt-0.5">
              {mode === 'create'
                ? 'Enter a name for your new directory.'
                : 'Enter a new descriptive name.'}
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 rounded-xl border border-neon-danger/30 bg-neon-danger/10 text-neon-danger flex items-center gap-2.5">
            <AlertTriangle size={16} className="shrink-0" />
            <span className="text-xs font-lexend-r">{error}</span>
          </div>
        )}

        {/* Text configuration action field input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            autoFocus
            value={folderName}
            onChange={handleNameChange}
            placeholder="e.g., Production Assets"
            className={`w-full px-4 py-3 bg-bg-canvas border rounded-xl font-lexend-r text-sm text-text-main placeholder-text-muted/50 focus:outline-none focus:border-brand-neon transition-colors ${
              error ? 'border-neon-danger' : 'border-neon-edge'
            }`}
          />

          {/* Dialog confirmation execution triggers */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-neon-edge bg-transparent text-text-main font-lexend-r text-xs font-semibold hover:bg-hover-light transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!folderName.trim()}
              className="px-5 py-2.5 rounded-xl bg-brand-neon hover:bg-brand-glow disabled:opacity-40 disabled:hover:bg-brand-neon text-black font-lexend-b text-xs shadow-md shadow-brand-neon/10 transition-all active:scale-95 cursor-pointer"
            >
              {mode === 'create' ? 'Create Folder' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
