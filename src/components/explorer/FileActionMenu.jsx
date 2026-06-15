import { useRef } from 'react';
import { TieredMenu } from 'primereact/tieredmenu';
import {
  MoreHorizontal,
  Download,
  Info,
  Trash2,
  FileText,
  Database,
  Calendar,
} from 'lucide-react';

export function FileActionMenu({ node, onDelete, onRename }) {
  const menuRef = useRef(null);

  // Formulate actionable parameters array conditionally matching node parameters
  const menuItems = [
    {
      label: 'File Information',
      icon: <Info className="text-text-main" />,
      items: [
        {
          label: `Type: ${node.type === 'folder' ? 'Folder' : node.data?.format || 'Unknown'}`,
          icon: <FileText className="text-text-main" size={14} />,
          disabled: true,
        },
        node.type === 'file' && node.data?.size
          ? {
              label: `Size: ${node.data.size}`,
              icon: <Database className="text-text-main" size={14} />,
              disabled: true,
            }
          : null,
        {
          label: `Created at: ${node.data.dateCreated}`,
          icon: <Calendar className="text-text-main" size={14} />,
          disabled: true,
        },
      ].filter(Boolean), // Wipe unused attributes out of structural folders safely
    },
    { separator: true },
    node.type === 'file'
      ? {
          label: 'Download',
          icon: <Download className="text-text-main" />,
          command: () => {
            const a = document.createElement('a');
            a.href = node.data.file;
            a.download = node.name;
            a.click();
          },
        }
      : null,
    { separator: true },
    {
      label: 'Delete',
      icon: <Trash2 className="text-text-main" />,
      className: 'text-neon-danger [&_svg]:!text-neon-danger',
      command: () => onDelete(node), // Trigger the confirmation intercept popup upstream
    },
  ].filter(Boolean);

  // PrimeReact styled customization properties objects
  const menuPt = {
    root: {
      className:
        'bg-glass-effect backdrop-blur-xl border border-neon-edge rounded-xl p-1.5 min-w-48 shadow-xl z-50 animate-[menuIn_0.18s_cubic-bezier(0.16,1,0.3,1)_both]',
    },
    menu: { className: 'focus:outline-none list-none m-0 p-0' },
    menuitem: { className: 'rounded-lg' },
    content: {
      className:
        'group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-150 hover:bg-hover-light',
    },
    action: {
      className:
        'flex items-center gap-2 w-full no-underline disabled:opacity-60 disabled:cursor-default',
    },
    icon: {
      className:
        'flex items-center justify-center w-6 h-6 rounded-md bg-neon-edge [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:text-brand-neon [&>svg]:stroke-[1.75] group-hover:bg-brand-neon/15 group-hover:scale-105 transition-all duration-150 group-[.text-neon-danger]:bg-neon-danger/10 group-[.text-neon-danger]:[&>svg]:text-neon-danger',
    },
    label: {
      className:
        'text-[12.5px] font-lexend-r tracking-tight text-text-main flex-1 group-[.text-neon-danger]:text-neon-danger',
    },
    submenuIcon: { className: 'ml-auto text-text-muted w-3 h-3' },
    separator: { className: 'h-px bg-neon-edge mx-1.5 my-1' },
    submenu: {
      className:
        'bg-glass-effect backdrop-blur-xl border border-neon-edge rounded-xl p-1.5 min-w-44 shadow-xl ml-1 animate-[subIn_0.16s_cubic-bezier(0.16,1,0.3,1)_both]',
    },
  };

  return (
    <div
      className="relative"
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {/* Inject custom contextual pop animations safely into local styles scoping */}
      <style>{`
        @keyframes menuIn { from { opacity:0; transform:translateY(-5px) scale(0.97) } to { opacity:1; transform:none } }
        @keyframes subIn  { from { opacity:0; transform:translateX(-5px) scale(0.97) } to { opacity:1; transform:none } }
      `}</style>

      {/* Action Trigger Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation(); // Block row bubble actions from triggering mistakenly during contextual menus
          menuRef.current.toggle(e);
        }}
        className="p-2 rounded-lg hover:bg-hover-light transition-all duration-200 cursor-pointer"
      >
        <MoreHorizontal
          size={18}
          strokeWidth={1.5}
          className="text-text-muted hover:text-brand-neon transition-colors"
        />
      </button>

      <TieredMenu
        model={menuItems}
        ref={menuRef}
        popup
        pt={menuPt}
        unstyled
        breakpoint="768px"
      />
    </div>
  );
}
