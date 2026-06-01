import { useEffect } from 'react';
import {
  Search,
  Bell,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  LayoutDashboard,
  Monitor,
  CalendarDays,
  FileText,
  Users,
  Tag,
  Wallet,
  Settings,
  Box,
  PlusCircle,
  X,
} from 'lucide-react';

export const NAVY = '#12297D';
export const LAV_BG = '#EEF1FA';
export const LAV_BORDER = '#DCE3F4';
export const SUB_BG = '#F7F8FB';

export function StatusPill({ status }) {
  const styles = {
    Active: 'bg-green-100 text-green-700',
    Upcoming: 'bg-yellow-100 text-yellow-800',
    Pending: 'bg-amber-100 text-amber-700',
    Archived: 'bg-gray-200 text-gray-600',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
        styles[status] || styles.Archived
      }`}
    >
      {status}
    </span>
  );
}

export function TopNav() {
  return (
    <header
      className="flex items-center justify-between px-6 text-white"
      style={{ backgroundColor: NAVY, height: 64 }}
    >
      <div className="flex items-center gap-2" style={{ width: 220 }}>
        <Box size={18} className="text-white" />
        <span className="font-bold text-lg tracking-tight">Carter DOOH</span>
      </div>

      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-white/10 placeholder-white/60 text-sm rounded-md pl-3 pr-9 py-2 outline-none border border-white/15 focus:border-white/40"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70" size={16} />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="text-white/80 hover:text-white">
          <RefreshCw size={18} />
        </button>
        <button className="relative text-white/80 hover:text-white">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer bg-white/10 px-2.5 py-1.5 rounded-md">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center text-[10px] font-semibold">
            RP
          </div>
          <span className="text-sm font-medium">Ruth Price</span>
          <ChevronDown size={14} />
        </div>
      </div>
    </header>
  );
}

export function Sidebar() {
  const items = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: Monitor, label: 'Billboard' },
    { icon: CalendarDays, label: 'Schedule', active: true },
    { icon: FileText, label: 'Content' },
    { icon: Users, label: 'Users' },
    { icon: Tag, label: 'Brands' },
    { icon: Wallet, label: 'Wallets' },
  ];
  return (
    <aside className="bg-white border-r border-gray-200 flex flex-col" style={{ width: 220 }}>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {items.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
              active
                ? 'bg-blue-50 text-[#12297D] font-semibold'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="px-3 pb-2">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </div>
      <div className="flex justify-center py-3 border-t border-gray-100">
        <button className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:text-gray-600">
          <ChevronLeft size={14} />
        </button>
      </div>
    </aside>
  );
}

export function FilterDropdown({ id, label, options, selected, onChange, openId, onOpenChange }) {
  const open = openId === id;
  const hasSelection = selected.length > 0;

  const toggle = (value) => {
    if (selected.includes(value)) onChange(selected.filter((v) => v !== value));
    else onChange([...selected, value]);
  };

  const summary =
    selected.length === 1
      ? selected[0]
      : selected.length > 1
      ? `${selected.length} selected`
      : '';

  return (
    <div className="relative inline-block" data-filter-pop>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenChange(open ? null : id);
        }}
        className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border transition ${
          hasSelection
            ? 'bg-blue-50 border-[#12297D]/30 text-[#12297D]'
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}
      >
        {hasSelection ? (
          <>
            <span className="font-medium">{label}:</span>
            <span className="font-medium">{summary}</span>
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              className="ml-1 -mr-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-[#12297D]/15"
            >
              <X size={11} />
            </span>
          </>
        ) : (
          <>
            <PlusCircle size={14} className="text-gray-400" />
            {label}
          </>
        )}
      </button>

      {open && (
        <div className="absolute z-40 mt-1.5 left-0 bg-white border border-gray-200 rounded-lg shadow-xl w-52 py-1.5">
          <div className="px-3 py-1 text-[10px] uppercase tracking-wide text-gray-400 font-medium">
            Filter by {label}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">No options</div>
            ) : (
              options.map((opt) => {
                const checked = selected.includes(opt);
                return (
                  <label
                    key={opt}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggle(opt)} />
                    {opt}
                  </label>
                );
              })
            )}
          </div>
          {hasSelection && (
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={() => onChange([])}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Closes the supplied filter popover on outside click or Esc.
 * Caller owns the `openId` state; this just wires the dismiss listeners.
 */
export function useFilterDismiss(openId, setOpenId) {
  useEffect(() => {
    if (!openId) return;
    const onDoc = (e) => {
      if (!e.target.closest?.('[data-filter-pop]')) setOpenId(null);
    };
    const onKey = (e) => e.key === 'Escape' && setOpenId(null);
    window.addEventListener('click', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('click', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [openId, setOpenId]);
}

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-white">{children}</main>
      </div>
    </div>
  );
}
