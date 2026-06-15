import { X, AlertTriangle } from 'lucide-react';

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  targetNode,
  showToasts,
}) {
  if (!isOpen || !targetNode) return null;

  // Determine if the item targeted for deletion is a folder or a file
  const isFolder = targetNode.type === 'folder';

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(targetNode);
    onClose();
    showToasts('delete');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Soft overlay barrier backing to lock focused interactions */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out_both]"
        onClick={onClose}
      />

      {/* Styled Card Modal Container layout blocks with matching theme colors */}
      <div className="relative w-full max-w-sm transform overflow-hidden rounded-2xl border border-neon-danger/30 bg-bg-surface p-6 shadow-2xl transition-all animate-[modalIn_0.22s_cubic-bezier(0.16,1,0.3,1)_both]">
        {/* Localized transition animation configurations */}
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

        {/* Branding Title Header Row showing accurate information dynamically */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-neon-danger/10 text-neon-danger [&>svg]:w-5 [&>svg]:h-5 shrink-0">
            <AlertTriangle />
          </div>
          <div>
            <h3 className="font-lexend-b text-base text-text-main tracking-wide leading-tight">
              {isFolder ? 'Delete Folder?' : 'Delete File?'}
            </h3>
            <p className="font-lexend-r text-xs text-text-muted mt-0.5 truncate max-w-[220px]">
              Target:{' '}
              <span className="text-text-main font-semibold">
                {targetNode.name}
              </span>
            </p>
          </div>
        </div>

        {/* Informative Warning Text block */}
        <p className="font-lexend-r text-xs text-text-muted mb-5 leading-relaxed">
          {isFolder
            ? 'Are you sure you want to delete this folder? All nested directories and inner files will be permanently lost.'
            : 'Are you sure you want to delete this file? This resource will be permanently removed from storage.'}{' '}
          This action cannot be reversed.
        </p>

        {/* Dialog confirmation execution triggers */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center justify-end gap-2"
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-neon-edge bg-transparent text-text-main font-lexend-r text-xs font-semibold hover:bg-hover-light transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-neon-danger hover:bg-neon-danger/80 text-white font-lexend-b text-xs shadow-md shadow-neon-danger/10 transition-all active:scale-95 cursor-pointer"
          >
            Delete Permanently
          </button>
        </form>
      </div>
    </div>
  );
}
