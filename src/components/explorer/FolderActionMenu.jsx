import { useRef } from 'react';
import { TieredMenu } from 'primereact/tieredmenu';
import { MoreHorizontal, Edit3, Trash2 } from 'lucide-react';

export function FolderActionMenu({ node, onDelete, onRename }) {
  const menuRef = useRef(null);

  // Formulate minimalist context items explicitly limited to directory configurations
  const menuItems = [
    {
      label: 'Rename',
      icon: <Edit3 className="text-text-main" />,
      command: () => onRename(node),
    },
    { separator: true },
    {
      label: 'Delete',
      icon: <Trash2 className="text-text-main" />,
      className: 'text-neon-danger [&_svg]:!text-neon-danger',
      command: () => onDelete(node), // Send full node to show accurate prompt tags
    },
  ];

  // PrimeReact pass-through attributes copied directly from your setup styling maps
  const menuPt = {
    root: {
      className:
        'bg-glass-effect backdrop-blur-xl border border-neon-edge rounded-xl p-1.5 min-w-44 shadow-xl z-50 animate-[menuIn_0.18s_cubic-bezier(0.16,1,0.3,1)_both]',
    },
    menu: { className: 'focus:outline-none list-none m-0 p-0' },
    menuitem: { className: 'rounded-lg' },
    content: {
      className:
        'group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-150 hover:bg-hover-light',
    },
    action: {
      className: 'flex items-center gap-2 w-full no-underline',
    },
    icon: {
      className:
        'flex items-center justify-center w-6 h-6 rounded-md bg-neon-edge [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:text-brand-neon [&>svg]:stroke-[1.75] group-hover:bg-brand-neon/15 group-hover:scale-105 transition-all duration-150 group-[.text-neon-danger]:bg-neon-danger/10 group-[.text-neon-danger]:[&>svg]:text-neon-danger',
    },
    label: {
      className:
        'text-[12.5px] font-lexend-r tracking-tight text-text-main flex-1 group-[.text-neon-danger]:text-neon-danger',
    },
    separator: { className: 'h-px bg-neon-edge mx-1.5 my-1' },
  };

  return (
    <div
      className="relative"
      onClick={(e) => e.stopPropagation()} // CRITICAL: Stop row selections from popping up
      onDoubleClick={(e) => e.stopPropagation()} // CRITICAL: Absorb actions safely to protect routers
    >
      <style>{`
        @keyframes menuIn { from { opacity:0; transform:translateY(-5px) scale(0.97) } to { opacity:1; transform:none } }
      `}</style>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
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
