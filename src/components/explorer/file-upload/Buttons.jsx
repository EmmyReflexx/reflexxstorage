import { Trash2 } from 'lucide-react';

export function CancelButton({ isProcessing, onCancel }) {
  return (
    <>
      <button
        type="button"
        disabled={isProcessing}
        onClick={onCancel}
        className="flex-1 py-2.5 sm:py-3 rounded-xl border border-neon-edge bg-transparent text-text-main font-lexend-r text-sm hover:bg-hover-light active:scale-[0.98] transition-all duration-200 cursor-pointer"
      >
        Cancel
      </button>
    </>
  );
}

export function DeployButton({
  isProcessing,
  uploadedFiles,
  handleCreateFile,
}) {
  return (
    <>
      <button
        type="button"
        disabled={isProcessing || !uploadedFiles || uploadedFiles.length === 0}
        onClick={() => handleCreateFile()}
        className="flex-1 py-2.5 sm:py-3 rounded-xl bg-brand-neon text-black font-lexend-b text-sm shadow-md shadow-brand-neon/20 hover:bg-brand-glow hover:shadow-brand-glow/30 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 h-[44px] sm:h-[48px]"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2.5">
            <svg
              className="animate-spin h-4 w-4 text-black shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="leading-none tracking-wide">Processing...</span>
          </div>
        ) : (
          <span className="leading-none tracking-wide">Deploy Stream</span>
        )}
      </button>
    </>
  );
}

export function TrashButton({ file, handleRemoveSingleFile }) {
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleRemoveSingleFile(file.id);
        }}
        className="p-1.5 rounded-lg text-text-muted hover:text-neon-danger hover:bg-neon-danger/10 opacity-100 sm:opacity-0 group-hover/item:opacity-100 transition-all duration-200 cursor-pointer"
      >
        <Trash2 size={14} />
      </button>
    </>
  );
}
