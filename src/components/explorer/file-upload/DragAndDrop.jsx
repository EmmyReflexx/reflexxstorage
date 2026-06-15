import { UploadCloud } from 'lucide-react';
import { DragDetector } from '../../../Reflexx_Tools/file-upload/useFileUpload';

export function DragAndDropDetector({ isDragging, dragProps }) {
  return (
    <>
      <DragDetector isDragging={isDragging} dragProps={dragProps}>
        {isDragging && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-canvas/90 border-4 border-dashed border-brand-neon backdrop-blur-md transition-all duration-300 animate-pulse">
            <UploadCloud
              size={64}
              className="text-brand-neon mb-4 animate-bounce"
            />
            <h2 className="text-text-main font-lexend-eb text-2xl tracking-widest uppercase">
              Release Stream
            </h2>
            <p className="text-brand-glow font-lexend-r text-sm mt-1">
              Drop your files anywhere to inject them into the queue
            </p>
          </div>
        )}
      </DragDetector>
    </>
  );
}

export function DropZone({ isDragging, dragProps, triggerFileInput }) {
  return (
    <>
      <div
        {...dragProps}
        onClick={triggerFileInput}
        className={`relative flex-1 min-h-[160px] flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer select-none transition-all duration-300 group
                ${
                  isDragging
                    ? 'border-brand-neon bg-brand-neon/10 scale-[0.99] shadow-inner'
                    : 'border-neon-edge bg-bg-surface/30 hover:bg-bg-surface/60 hover:border-brand-neon/50'
                }
              `}
      >
        <div className="absolute w-24 h-24 rounded-full bg-brand-neon/5 group-hover:bg-brand-neon/10 blur-xl transition-all duration-300" />

        <UploadCloud
          size={40}
          className={`mb-3 transition-transform duration-300 group-hover:-translate-y-1 shrink-0
                  ${isDragging ? 'text-brand-glow animate-pulse' : 'text-brand-neon'}
                `}
        />

        <p className="text-text-main font-lexend-b text-sm sm:text-base tracking-wide px-4">
          {isDragging ? 'Release to drop files' : 'Drag & drop systems here'}
        </p>
        <p className="text-text-muted font-lexend-r text-xs mt-1 px-4">
          or{' '}
          <span className="text-brand-neon underline decoration-brand-neon/30 group-hover:decoration-brand-neon font-lexend-b">
            browse native files
          </span>
        </p>
      </div>
    </>
  );
}
