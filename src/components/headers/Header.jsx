import { useNavigate, Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { Menu, Lock, Folder, Sun, Moon } from 'lucide-react';
import { TieredMenu } from 'primereact/tieredmenu';

/**
 * Header Component
 * Properly aligned capsule theme switch using flexbox alignment.
 */
export default function Header() {
  const menuRef = useRef();
  const navigate = useNavigate();

  // Detect theme on mount
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved
      ? saved === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sync state changes with the DOM and localStorage
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const menuItems = [
    {
      label: 'Vault',
      icon: <Lock className="text-text-main" />,
      command: () => navigate('/vault'),
    },
    { separator: true },
    {
      label: 'Global Store',
      icon: <Folder className="text-text-main" />,
      command: () => navigate('/file-explorer'),
    },
  ];

  const menuPt = {
    root: {
      className:
        'bg-glass-effect backdrop-blur-xl border border-neon-edge rounded-xl p-1.5 min-w-44 shadow-xl animate-[menuIn_0.18s_cubic-bezier(0.16,1,0.3,1)_both]',
    },
    menu: { className: 'focus:outline-none list-none m-0 p-0' },
    menuitem: { className: 'rounded-lg' },
    content: {
      className:
        'group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-150 hover:bg-hover-light',
    },
    action: { className: 'flex items-center gap-2 w-full no-underline' },
    icon: {
      className:
        'flex items-center justify-center w-6 h-6 rounded-md bg-neon-edge [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:text-brand-neon [&>svg]:stroke-[1.75] group-hover:bg-brand-neon/15 group-hover:scale-105 transition-all duration-150',
    },
    label: {
      className:
        'text-[12.5px] font-medium tracking-tight text-text-main flex-1',
    },
    submenuIcon: { className: 'ml-auto text-text-muted' },
    separator: { className: 'h-px bg-neon-edge mx-1.5 my-1' },
    submenu: {
      className:
        'bg-glass-effect backdrop-blur-xl border border-neon-edge rounded-xl p-1.5 min-w-40 shadow-xl ml-1 animate-[subIn_0.16s_cubic-bezier(0.16,1,0.3,1)_both]',
    },
  };

  return (
    <>
      <style>{`
        @keyframes menuIn { from { opacity:0; transform:translateY(-5px) scale(0.97) } to { opacity:1; transform:none } }
        @keyframes subIn  { from { opacity:0; transform:translateX(-5px) scale(0.97) } to { opacity:1; transform:none } }
      `}</style>

      <header>
        <div className="flex justify-between items-center py-4 px-6 border-b-2 border-b-brand-neon fixed top-0 right-0 left-0 z-50 bg-bg-canvas transition-colors duration-300">
          <Link to="/">
            <h1 className="text-4xl font-lexend-eb text-text-main tracking-tight select-none">
              Reflexx
            </h1>
          </Link>

          <div className="flex items-center gap-5">
            <button
              onClick={() => setIsDark(!isDark)}
              aria-label="Toggle Theme"
              className="relative flex items-center w-16 h-8 p-1 rounded-full cursor-pointer select-none bg-glass-effect border border-neon-edge transition-all duration-300 hover:border-brand-neon group outline-none"
            >
              <div
                className={`w-6 h-6 rounded-full bg-brand-neon transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_0_10px_rgba(var(--brand-neon),0.4)] group-active:w-7 ${
                  isDark
                    ? 'transform translate-x-8 shadow-[#c77dff]/60'
                    : 'transform translate-x-0'
                }`}
              />

              {/* Contextual Fixed Track Icons */}
              <div className="absolute inset-0 flex justify-between items-center px-2.5 text-text-muted pointer-events-none">
                <Sun
                  size={13}
                  className={`transition-all duration-300 ${!isDark ? 'text-text-main scale-110' : 'opacity-30 scale-90'}`}
                />
                <Moon
                  size={13}
                  className={`transition-all duration-300 ${isDark ? 'text-text-main scale-110' : 'opacity-30 scale-90'}`}
                />
              </div>
            </button>

            {/* Menu Trigger */}
            <div
              onClick={(e) => menuRef.current.toggle(e)}
              className="cursor-pointer hover:bg-hover-light rounded-md p-1.5 text-text-main transition-colors duration-150"
            >
              <Menu size={30} />
            </div>
          </div>
        </div>

        <TieredMenu
          model={menuItems}
          ref={menuRef}
          popup
          pt={menuPt}
          unstyled
        />
      </header>
    </>
  );
}
