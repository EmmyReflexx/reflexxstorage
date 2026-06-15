import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

// Pass the path array directly as a prop to use it anywhere!
export function BreadCrumb({ path = [], basePath = '/file-explorer' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const safePath = Array.isArray(path) ? path : [];

  // Determine if we're in vault mode (for styling/navigation differences)
  const isVaultMode =
    basePath.includes('vault') || location.pathname.includes('vault-explorer');

  const handleRootClick = () => {
    if (isVaultMode) {
      navigate('/vault-explorer');
    } else {
      navigate('/file-explorer');
    }
  };

  const handleFolderClick = (folderId, isLastItem) => {
    if (!isLastItem) {
      if (isVaultMode) {
        navigate(`/vault-explorer/folder/${folderId}`);
      } else {
        navigate(`/file-explorer/folder/${folderId}`);
      }
    }
  };

  return (
    <nav className="fixed top-25 left-0 right-0 h-14 flex items-center space-x-2 px-6 bg-glass-effect/80 backdrop-blur-md border-b border-neon-edge shadow-sm z-40 select-none">
      {/* ROOT LINK */}
      <button
        onClick={handleRootClick}
        className={`flex items-center gap-1.5 text-sm font-lexend-r transition-all duration-200 cursor-pointer group ${
          safePath.length === 0
            ? 'text-brand-neon font-lexend-b pointer-events-none'
            : 'text-text-muted hover:text-brand-neon'
        }`}
      >
        <Home
          size={16}
          className={
            safePath.length === 0
              ? 'text-brand-neon'
              : 'text-text-muted group-hover:text-brand-neon'
          }
        />
        <span>{isVaultMode ? 'Vault Root' : 'Root'}</span>
      </button>

      {/* DYNAMIC FOLDER LINKS PASSED FROM THE PARENT */}
      {safePath.map((folder, index) => {
        const isLastItem = index === safePath.length - 1;

        return (
          <div key={folder.id || index} className="flex items-center space-x-2">
            <ChevronRight
              size={14}
              className="text-neon-dim"
              strokeWidth={2.5}
            />
            <button
              onClick={() => handleFolderClick(folder.id, isLastItem)}
              disabled={isLastItem}
              className={`text-sm font-lexend-r px-2 py-1 rounded-xl transition-all duration-300 ${
                isLastItem
                  ? 'text-brand-neon font-lexend-b bg-neon-edge/40 border border-neon-edge/40 shadow-sm pointer-events-none'
                  : 'text-text-muted hover:text-brand-neon hover:bg-hover-light cursor-pointer'
              }`}
            >
              {folder.name}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
