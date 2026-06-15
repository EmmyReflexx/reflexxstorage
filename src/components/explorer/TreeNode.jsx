import { useNavigate } from 'react-router-dom';
import Header from '../headers/Header';
import { FolderIcon, getFileIcon } from './fileIcons';
import { FileActionMenu } from './FileActionMenu';
import { FolderActionMenu } from './FolderActionMenu';

export function TreeNode({
  nodes,
  onDeleteNode,
  onRenameNode,
  basePath = '/file-explorer',
}) {
  const navigate = useNavigate();

  // Fallback view for empty nodes or folders
  if (!nodes || nodes.length === 0) {
    return (
      <>
        <Header />
        <div className="p-8 text-center text-lg text-text-muted font-lexend-r">
          No files or folders found.
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="p-4 space-y-1">
        {nodes.map((node, index) => {
          return (
            <div
              key={node.id || index}
              className="relative select-none"
              onDoubleClick={() => {
                // Navigate deeper if targeted element node evaluates to a folder schema
                if (node.type === 'folder') {
                  navigate(`${basePath}/folder/${node.id}`);
                }
              }}
            >
              <div className="flex items-center justify-between gap-2 sm:gap-4 py-3 px-3 sm:px-4 rounded-2xl bg-bg-surface/50 hover:bg-bg-surface border border-transparent hover:border-neon-edge shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group">
                {/* File System Icon Matching */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <span className="text-brand-neon p-1.5 rounded-lg bg-neon-edge/30 group-hover:bg-neon-edge/50 transition-all duration-300 shrink-0">
                    {node.type === 'folder' ? (
                      <FolderIcon size={20} />
                    ) : (
                      getFileIcon(node.data?.format, 20)
                    )}
                  </span>

                  {/* Text Container: Keeps file names legible across viewports */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-1 min-w-0 gap-0.5 sm:gap-4">
                    <span className="text-text-main text-sm sm:text-base font-lexend-b tracking-wide truncate pr-2">
                      {node.name}
                    </span>

                    {node.type === 'file' && node.data?.size && (
                      <span className="text-[11px] sm:text-sm text-text-muted font-lexend-r px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-xl bg-neon-edge/30 backdrop-blur-sm w-fit shrink-0">
                        {node.data.size}
                      </span>
                    )}
                  </div>
                </div>

                {/* Operations Menu Anchor Split Gate (Files vs Folders) */}
                <div className="shrink-0 pl-1">
                  {node.type === 'file' ? (
                    <FileActionMenu
                      node={node}
                      onDelete={onDeleteNode}
                      onRename={onRenameNode}
                    />
                  ) : (
                    <FolderActionMenu
                      node={node}
                      onDelete={onDeleteNode}
                      onRename={onRenameNode}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
