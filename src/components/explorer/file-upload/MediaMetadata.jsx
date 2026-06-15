export function MediaMetadata({
  file,
  isVideo,
  getFileIcon,
  fileExtension,
  isDuplicateFile,
  formatFileSize,
}) {
  return (
    <>
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-lg bg-neon-edge/20 overflow-hidden flex items-center justify-center border border-neon-edge/40 shrink-0 select-none">
          {file.preview ? (
            isVideo ? (
              /* Render native video streams safely without breaks */
              <video
                src={file.preview}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
            ) : (
              <img
                src={file.preview}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            )
          ) : (
            getFileIcon(fileExtension, 18)
          )}
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <span
            className={`text-xs sm:text-sm truncate ${isDuplicateFile ? 'text-neon-danger' : 'text-text-main'} font-lexend-r`}
          >
            {file.name}
            {isDuplicateFile && ' (Duplicate - will be skipped)'}
          </span>
          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-muted font-lexend-r">
            <span>{formatFileSize(file.size)}</span>
            {file.width && file.height && (
              <span className="px-1 py-px rounded bg-neon-edge/30 text-text-main font-mono scale-[0.9]">
                {file.width}×{file.height}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
