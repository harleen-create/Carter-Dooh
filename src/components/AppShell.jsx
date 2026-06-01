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
