import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  PlusCircle,
  LayoutDashboard,
  Monitor,
  CalendarDays,
  FileText,
  Users,
  Tag,
  Wallet,
  Settings,
  Calendar,
  MoreHorizontal,
  Trash2,
  MessageCircleMore,
  Box,
  X,
  Eye,
  Pencil,
  Archive,
  CheckCircle2,
} from 'lucide-react';

const NAVY = '#12297D';
const LAV_BG = '#EEF1FA';
const LAV_BORDER = '#DCE3F4';
const SUB_BG = '#F7F8FB';

/* ---------------------- Date helpers ---------------------- */
// Pinned "today" so the prototype renders deterministically.
const TODAY = new Date(2026, 4, 29); // May 29, 2026
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTH_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfWeek(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();          // 0 = Sun
  const offset = (day + 6) % 7;        // Mon = 0 .. Sun = 6
  date.setDate(date.getDate() - offset);
  return date;
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function monthLabel(d) {
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
function fmtFull(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ------------------------------ Top Nav ------------------------------ */
function TopNav() {
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
        <button className="text-white/80 hover:text-white"><RefreshCw size={18} /></button>
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

/* ------------------------------ Sidebar ------------------------------ */
function Sidebar() {
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

/* ------------------------------ Pills ------------------------------ */
function StatusPill({ status }) {
  const styles = {
    Active: 'bg-green-100 text-green-700',
    Upcoming: 'bg-yellow-100 text-yellow-800',
    Pending: 'bg-amber-100 text-amber-700',
    Archived: 'bg-gray-200 text-gray-600',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${styles[status] || styles.Archived}`}>
      {status}
    </span>
  );
}

/* ----------------------- Date range toggle ------------------------ */
function DateRangeButtons({ value, onChange, customRange, onCustomRangeChange }) {
  const [calOpen, setCalOpen] = useState(false);
  const [draft, setDraft] = useState(customRange || { start: null, end: null });
  const [pickerMonth, setPickerMonth] = useState(
    customRange?.start ? new Date(customRange.start) : new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)
  );

  useEffect(() => {
    if (!calOpen) return;
    const onKey = (e) => e.key === 'Escape' && setCalOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [calOpen]);

  const customLabel =
    value === 'custom' && customRange?.start && customRange?.end
      ? `${fmtFull(customRange.start)} – ${fmtFull(customRange.end)}`
      : 'Custom';

  const seg = (id, label, side) => (
    <button
      onClick={() => { onChange(id); setCalOpen(false); }}
      className={`text-sm px-3.5 py-2 border transition ${
        value === id
          ? 'text-white border-transparent'
          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
      } ${side === 'left' ? 'rounded-l-md border-r-0' : 'rounded-r-md'}`}
      style={value === id ? { backgroundColor: NAVY } : undefined}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-2">
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => {
            if (!calOpen) setDraft(customRange || { start: null, end: null });
            setCalOpen((v) => !v);
          }}
          className={`inline-flex items-center gap-2 text-sm px-3.5 py-2 rounded-md border transition ${
            value === 'custom'
              ? 'text-white border-transparent'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
          style={value === 'custom' ? { backgroundColor: NAVY } : undefined}
        >
          <Calendar size={14} />
          {customLabel}
          <ChevronDown size={14} className={value === 'custom' ? 'text-white/80' : 'text-gray-400'} />
        </button>

        {calOpen && (
          <CustomDateDropdown
            range={draft}
            onChange={setDraft}
            pickerMonth={pickerMonth}
            onMonthChange={setPickerMonth}
            onApply={() => {
              if (draft.start && draft.end) {
                onCustomRangeChange?.(draft);
                onChange('custom');
              }
              setCalOpen(false);
            }}
            onClose={() => setCalOpen(false)}
          />
        )}
      </div>
      <div className="inline-flex">
        {seg('30', 'Last 30 Days', 'left')}
        {seg('7', 'Last 7 Days', 'right')}
      </div>
    </div>
  );
}

function CustomDateDropdown({
  range,
  onChange,
  pickerMonth,
  onMonthChange,
  onApply,
  onClose,
}) {
  // Backdrop click to close
  useEffect(() => {
    const onDoc = () => onClose?.();
    const t = setTimeout(() => window.addEventListener('click', onDoc), 0);
    return () => {
      clearTimeout(t);
      window.removeEventListener('click', onDoc);
    };
  }, [onClose]);

  const year = pickerMonth.getFullYear();
  const m = pickerMonth.getMonth();
  const lastDay = new Date(year, m + 1, 0).getDate();
  const startDay = new Date(year, m, 1).getDay();
  const prevLast = new Date(year, m, 0).getDate();

  const cells = [];
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(year, m - 1, prevLast - i);
    cells.push({ date: d, current: false });
  }
  for (let d = 1; d <= lastDay; d++) {
    cells.push({ date: new Date(year, m, d), current: true });
  }
  let trail = 1;
  while (cells.length < 42) {
    cells.push({ date: new Date(year, m + 1, trail++), current: false });
  }

  const handlePick = (d) => {
    const { start, end } = range;
    if (!start || (start && end)) {
      onChange({ start: d, end: null });
    } else if (d < start) {
      onChange({ start: d, end: start });
    } else {
      onChange({ start, end: d });
    }
  };

  const inRange = (d) =>
    range.start && range.end && d >= range.start && d <= range.end;
  const isStart = (d) => range.start && sameDay(d, range.start);
  const isEnd = (d) => range.end && sameDay(d, range.end);

  const navMonth = (delta) => {
    onMonthChange(new Date(year, m + delta, 1));
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute z-50 mt-2 left-0 bg-white rounded-xl shadow-2xl border border-gray-200 w-[340px] p-4"
    >
      {/* Inputs */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">From</label>
          <div className="flex items-center gap-2 px-2.5 py-2 border border-gray-200 rounded-md text-sm text-gray-900">
            <Calendar size={13} className="text-gray-400" />
            {range.start ? fmtFull(range.start) : '—'}
          </div>
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">To</label>
          <div className="flex items-center gap-2 px-2.5 py-2 border border-gray-200 rounded-md text-sm text-gray-900">
            <Calendar size={13} className="text-gray-400" />
            {range.end ? fmtFull(range.end) : '—'}
          </div>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => navMonth(-1)}
          className="p-1 text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="text-sm font-semibold text-gray-900">{monthLabel(pickerMonth)}</div>
        <button
          onClick={() => navMonth(1)}
          className="p-1 text-gray-500 hover:text-gray-700"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Headers */}
      <div className="grid grid-cols-7 mb-1">
        {MONTH_HEADERS.map((h) => (
          <div key={h} className="text-[10px] font-medium text-gray-400 text-center py-1">{h}</div>
        ))}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((c, idx) => {
          const selected = isStart(c.date) || isEnd(c.date);
          const between = inRange(c.date) && !selected;
          return (
            <button
              key={idx}
              onClick={() => handlePick(c.date)}
              className={`relative h-8 text-sm flex items-center justify-center transition
                ${between ? 'bg-blue-50 text-[#12297D]' : ''}
                ${selected ? 'text-white' : c.current ? 'text-gray-700 hover:bg-gray-50 rounded-md' : 'text-gray-300 hover:bg-gray-50 rounded-md'}
              `}
            >
              {selected && (
                <span className="absolute inset-1 rounded-md" style={{ backgroundColor: NAVY }} />
              )}
              <span className="relative">{c.date.getDate()}</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
        >
          Cancel
        </button>
        <button
          onClick={onApply}
          disabled={!range.start || !range.end}
          className="px-3 py-1.5 text-sm text-white rounded-md disabled:opacity-50"
          style={{ backgroundColor: NAVY }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

/* ------------------------ Weekly Calendar ------------------------- */
function WeeklyCalendar({ weekStart, schedulesByDay, onCardClick }) {
  const start = weekStart || startOfWeek(TODAY);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i);
    return {
      label: DAY_LABELS[i],
      date: d.getDate(),
      isToday: sameDay(d, TODAY),
    };
  });
  return (
    <div className="grid grid-cols-7 gap-3">
      {days.map((d) => (
        <div key={d.label} className="flex flex-col">
          <div className="text-sm text-gray-500 font-medium text-center mb-2">{d.label}</div>
          <div
            className="rounded-xl p-2 flex-1 min-h-[420px] space-y-2"
            style={{ backgroundColor: LAV_BG }}
          >
            <div className="flex items-baseline gap-2 px-1 pt-1 pb-2">
              <div
                className={`text-base font-semibold ${
                  d.isToday ? 'text-white' : 'text-gray-900'
                } ${d.isToday ? 'inline-flex items-center justify-center w-7 h-7 rounded-full' : ''}`}
                style={d.isToday ? { backgroundColor: NAVY } : undefined}
              >
                {d.date}
              </div>
              <div className="text-xs text-gray-400">(12 items)</div>
            </div>
            {(schedulesByDay?.[d.label] || []).map((s, i) => (
              <ScheduleCard key={i} {...s} onClick={() => onCardClick?.(s)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ScheduleCard({ name, brand, status, dateRange, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-gray-300 transition"
    >
      {/* Title — full width, allowed 2 lines */}
      <div className="text-[13px] font-semibold text-gray-900 leading-snug mb-1.5 line-clamp-2">
        {name}
      </div>

      {/* Brand */}
      <div className="text-[11px] text-gray-500 mb-2.5">
        <span className="text-gray-500">Brand</span>
        <span className="text-gray-400"> : </span>
        <span className="text-gray-700">{brand}</span>
      </div>

      {/* Status */}
      <div className="mb-2.5">
        <StatusPill status={status} />
      </div>

      {/* Date range — subtle footer with icon */}
      <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-gray-500">
        <Calendar size={11} className="text-gray-400 shrink-0" />
        <span className="truncate">{dateRange}</span>
      </div>
    </button>
  );
}

/* ----------------------- Approval Requests ------------------------ */
function ApprovalRequests({ onOpen, onViewAll }) {
  const cards = [
    { name: 'Back to School Promo', id: '5678' },
    { name: 'Back to School Promo', id: '5679' },
    { name: 'Back to School Promo', id: '5680' },
    { name: 'Back to School Promo', id: '5681' },
  ];
  return (
    <section className="mb-8 pb-6 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Approval Requests</h3>
        <a
          onClick={onViewAll}
          className="text-sm text-[#12297D] hover:underline cursor-pointer underline underline-offset-2"
        >
          View All
        </a>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
            <span className="inline-block bg-pink-100 text-pink-700 text-[11px] font-medium px-2.5 py-1 rounded-md mb-3">
              Pending Approval
            </span>
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="font-semibold text-gray-900 text-[15px]">{c.name}</span>
              <span className="text-gray-400 text-sm">({c.id})</span>
            </div>
            <a
              onClick={() => onOpen?.(c.id)}
              className="text-[#12297D] text-sm cursor-pointer underline underline-offset-2"
            >
              View Details
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ----------------------- Filters bar ------------------------ */
function FilterDropdown({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const hasSelection = selected.length > 0;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!e.target.closest?.('[data-filter-pop]')) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('click', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('click', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

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
        onClick={() => setOpen((v) => !v)}
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
            {options.map((opt) => {
              const checked = selected.includes(opt);
              return (
                <label
                  key={opt}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(opt)}
                  />
                  {opt}
                </label>
              );
            })}
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

function FiltersRow({
  searchQuery,
  onSearchChange,
  brandOptions,
  typeOptions,
  statusOptions,
  brandFilter,
  typeFilter,
  statusFilter,
  onBrandChange,
  onTypeChange,
  onStatusChange,
  onClearAll,
}) {
  const anyFilter = brandFilter.length || typeFilter.length || statusFilter.length || searchQuery;
  return (
    <div className="flex items-center gap-3 mb-4 flex-wrap">
      <div className="relative flex-1 min-w-[220px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Schedule"
          className="w-full text-sm bg-white border border-gray-200 rounded-md pl-9 pr-8 py-2 outline-none focus:border-gray-300"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
          >
            <X size={13} />
          </button>
        )}
      </div>
      <FilterDropdown label="Brand"  options={brandOptions}  selected={brandFilter}  onChange={onBrandChange} />
      <FilterDropdown label="Type"   options={typeOptions}   selected={typeFilter}   onChange={onTypeChange} />
      <FilterDropdown label="Status" options={statusOptions} selected={statusFilter} onChange={onStatusChange} />
      {anyFilter ? (
        <button
          onClick={onClearAll}
          className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
        >
          Clear all
        </button>
      ) : null}
    </div>
  );
}

/* ----------------------- Tabs ------------------------ */
function Tabs({ value, onChange }) {
  const tab = (id, label) => (
    <button
      onClick={() => onChange(id)}
      className={`pb-2.5 text-sm font-medium border-b-2 transition ${
        value === id
          ? 'border-[#12297D] text-[#12297D]'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );
  return (
    <div className="flex items-center gap-8 border-b border-gray-200 mb-4">
      {tab('all', 'All Schedules')}
      {tab('archived', 'Archived Schedules')}
    </div>
  );
}

/* ----------------------- Sub toolbar ------------------------ */
function SubToolbar({ left, right }) {
  return (
    <div
      className="flex items-center justify-between px-4 rounded-md mb-3"
      style={{ backgroundColor: SUB_BG, minHeight: 48 }}
    >
      <div className="text-sm text-gray-700">{left}</div>
      <div className="flex items-center" style={{ minHeight: 32 }}>{right}</div>
    </div>
  );
}

/* ----------------------- Pagination ------------------------ */
function Pagination({ totalRows = 50, selected = 0 }) {
  const NavBtn = ({ children }) => (
    <button className="p-1.5 border border-gray-200 rounded-md bg-white text-gray-500 hover:bg-gray-50">
      {children}
    </button>
  );
  return (
    <div className="flex items-center justify-between text-sm text-gray-600 mt-3">
      <div>{selected} of {totalRows} row{totalRows === 1 ? '' : 's'} selected.</div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          Rows per page
          <button className="inline-flex items-center gap-1 px-2 py-1 border border-gray-200 rounded-md bg-white">
            50 <ChevronDown size={12} />
          </button>
        </div>
        <div className="text-gray-700">Page 2 of 5</div>
        <div className="flex items-center gap-1.5">
          <NavBtn><ChevronsLeft size={14} /></NavBtn>
          <NavBtn><ChevronLeft size={14} /></NavBtn>
          <NavBtn><ChevronRight size={14} /></NavBtn>
          <NavBtn><ChevronsRight size={14} /></NavBtn>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- Schedules Table ------------------------ */
function SortHeader({ label }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <span className="flex flex-col text-gray-300 leading-none">
        <ChevronUp size={9} />
        <ChevronDown size={9} className="-mt-0.5" />
      </span>
    </span>
  );
}

function RowOptionsMenu({ onView, onEdit, onArchive, archived }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [open]);
  return (
    <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1 rounded hover:bg-gray-100 text-gray-400"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1">
          <button
            onClick={() => { setOpen(false); onView?.(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Eye size={14} className="text-gray-500" /> View
          </button>
          {!archived && (
            <button
              onClick={() => { setOpen(false); onEdit?.(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Pencil size={14} className="text-gray-500" /> Edit
            </button>
          )}
          {!archived && (
            <button
              onClick={() => { setOpen(false); onArchive?.(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Archive size={14} className="text-gray-500" /> Archive
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DateCell({ date, time }) {
  if (!date) return <span className="text-gray-400">—</span>;
  if (!time) return <span>{date}</span>;
  return (
    <span>
      {date}
      <span className="mx-2 text-gray-300">|</span>
      {time}
    </span>
  );
}

const ROW_HEIGHT_PX = 57;          // one row of p-4 + single-line content
const TARGET_TABLE_ROWS = 6;       // visual rows of height the table holds steady
const TABLE_BODY_MIN_PX = ROW_HEIGHT_PX * TARGET_TABLE_ROWS;

function SchedulesTable({
  rows,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onRowOpen,
  onEdit,
  onArchive,
  archived = false,
}) {
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const someSelected = rows.some((r) => selectedIds.has(r.id));

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-xs">
          <tr>
            <th className="w-10 p-4 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected;
                }}
                onChange={onToggleAll}
              />
            </th>
            <th className="p-4 text-left font-medium"><SortHeader label="Schedule Name" /></th>
            <th className="p-4 text-left font-medium"><SortHeader label="Start Date" /></th>
            <th className="p-4 text-left font-medium"><SortHeader label="End Date" /></th>
            <th className="p-4 text-left font-medium"><SortHeader label="Brand" /></th>
            <th className="p-4 text-left font-medium"><SortHeader label="Owner" /></th>
            <th className="p-4 text-left font-medium"><SortHeader label="Schedule Type" /></th>
            <th className="p-4 text-left font-medium">Status</th>
            <th className="p-4 text-right font-medium">Options</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                className="text-center text-gray-400 text-sm align-middle"
                style={{ height: TABLE_BODY_MIN_PX }}
              >
                No schedules to display.
              </td>
            </tr>
          ) : (
            <>
              {rows.map((r) => {
                const isSelected = selectedIds.has(r.id);
                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-gray-50 transition ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleRow(r.id)}
                      />
                    </td>
                    <td className="p-4">
                      <a
                        onClick={() => onRowOpen?.(r)}
                        className="text-[#12297D] hover:underline cursor-pointer font-medium"
                      >
                        {r.name}
                      </a>
                    </td>
                    <td className="p-4 text-gray-700">
                      <DateCell date={r.startDate} time={r.startTime} />
                    </td>
                    <td className="p-4 text-gray-700">
                      <DateCell date={r.endDate} time={r.endTime} />
                    </td>
                    <td className="p-4 text-gray-700">{r.brand}</td>
                    <td className="p-4 text-gray-700">{r.owner}</td>
                    <td className="p-4 text-gray-700">{r.type}</td>
                    <td className="p-4"><StatusPill status={r.status} /></td>
                    <td className="p-4 text-right">
                      <RowOptionsMenu
                        archived={archived}
                        onView={() => onRowOpen?.(r)}
                        onEdit={() => onEdit?.(r)}
                        onArchive={() => onArchive?.(r)}
                      />
                    </td>
                  </tr>
                );
              })}
              {rows.length < TARGET_TABLE_ROWS && (
                <tr aria-hidden="true">
                  <td
                    colSpan={9}
                    style={{
                      height: (TARGET_TABLE_ROWS - rows.length) * ROW_HEIGHT_PX,
                    }}
                  />
                </tr>
              )}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ----------------------- Empty Table ------------------------ */
function EmptyTable() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl py-20 flex flex-col items-center justify-center">
      <div className="relative w-20 h-16 mb-4">
        <div className="absolute inset-x-2 bottom-0 h-10 rounded-md border-2 border-gray-300 bg-gray-100" />
        <div className="absolute right-0 top-0 w-8 h-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
          <MessageCircleMore size={14} className="text-gray-400" />
        </div>
      </div>
      <div className="text-gray-700 font-semibold">No Records Found</div>
    </div>
  );
}

/* ----------------------- Month Calendar ------------------------ */
function MonthCalendar({ month, onNavigate, onChipClick }) {
  const ref = month || TODAY;
  const year = ref.getFullYear();
  const m = ref.getMonth();
  const lastDay = new Date(year, m + 1, 0).getDate();
  const startDay = new Date(year, m, 1).getDay();
  const prevLast = new Date(year, m, 0).getDate();

  const cells = [];
  for (let i = startDay - 1; i >= 0; i--) {
    cells.push({ day: prevLast - i, current: false });
  }
  for (let d = 1; d <= lastDay; d++) {
    cells.push({
      day: d,
      current: true,
      isToday: sameDay(new Date(year, m, d), TODAY),
    });
  }
  let trail = 1;
  while (cells.length < 42) cells.push({ day: trail++, current: false });

  // Demo: scatter campaign chips so the grid looks alive
  const chipMap = { 1: 1, 4: 1, 6: 2, 8: 1, 11: 1, 14: 2, 18: 1, 21: 1, 22: 1, 25: 2, 28: 1, 29: 3 };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: LAV_BG }}
      >
        <button
          onClick={() => onNavigate?.(-1)}
          className="p-1 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-base font-semibold text-gray-900">{monthLabel(ref)}</div>
        <button
          onClick={() => onNavigate?.(1)}
          className="p-1 text-gray-600 hover:text-gray-900"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-100">
        {MONTH_HEADERS.map((h) => (
          <div key={h} className="px-3 py-3 text-xs font-medium text-gray-500 text-center">
            {h}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((c, i) => {
          const chipCount = c.current ? chipMap[c.day] || 0 : 0;
          return (
            <div key={i} className="min-h-[110px] p-3 border-t border-gray-50">
              <div className="flex items-center justify-center mb-2">
                {c.isToday ? (
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                    style={{ backgroundColor: NAVY }}
                  >
                    {c.day}
                  </span>
                ) : (
                  <span className={`text-sm font-medium ${c.current ? 'text-gray-700' : 'text-gray-300'}`}>
                    {c.day}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {Array.from({ length: chipCount }).map((_, k) => (
                  <button
                    key={k}
                    onClick={() =>
                      onChipClick?.({
                        name: 'Nike x SNKRS Drop Launch',
                        brand: 'Nike, India',
                        owner: 'Ruth Price',
                        day: c.day,
                      })
                    }
                    className="block w-full text-[10px] font-medium px-2 py-1 rounded text-center truncate hover:opacity-80 hover:shadow-sm transition cursor-pointer"
                    style={{ backgroundColor: LAV_BG, color: NAVY }}
                  >
                    Nike x SNKRS Drop Launch
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------- Content Drawer ------------------------ */
function ContentDrawer({ open, onClose, content }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-[640px] max-w-[95vw] bg-white z-50 shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {content && (
          <div className="h-full overflow-y-auto">
            <div className="flex items-start justify-between px-8 pt-7 pb-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  {content.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Content ID- {content.contentId}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-8">
              {/* Billboard creative — deterministic per content */}
              <img
                src={`https://picsum.photos/seed/${encodeURIComponent(
                  content.imageSeed || Math.random().toString(36).slice(2)
                )}/1280/800`}
                alt={content.title}
                className="w-full aspect-[16/10] rounded-md object-cover bg-gray-100"
              />
            </div>

            <div className="px-8 mt-6 pb-10">
              <div
                className="rounded-xl border border-gray-200 p-6"
                style={{ backgroundColor: '#FAFBFD' }}
              >
                <div className="grid grid-cols-4 gap-y-6 gap-x-6">
                  <Field label="Status">
                    <StatusPill status={content.status} />
                  </Field>
                  <Field label="Media Type" value={content.mediaType} />
                  <Field label="Duration" value={content.duration} />
                  <Field label="Resolution" value={content.resolution} />
                  <Field label="Owner" value={content.owner} />
                  <Field label="Last Updated">
                    <span className="text-sm font-semibold text-gray-900">
                      {content.lastUpdatedDate}
                      <span className="mx-2 text-gray-300">|</span>
                      {content.lastUpdatedTime}
                    </span>
                  </Field>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

function Field({ label, value, children }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1.5">{label}</div>
      {children ?? <div className="text-sm font-semibold text-gray-900">{value}</div>}
    </div>
  );
}

/* ============================ DASHBOARD ============================ */
export default function Dashboard() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('30');
  const [customRange, setCustomRange] = useState(null);
  const [monthOffset, setMonthOffset] = useState(0); // for Last 30 Days month nav
  const [tab, setTabRaw] = useState('all');
  const [drawerContent, setDrawerContent] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [toast, setToast] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState([]);
  const [typeFilter, setTypeFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const clearAllFilters = () => {
    setSearchQuery('');
    setBrandFilter([]);
    setTypeFilter([]);
    setStatusFilter([]);
  };

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 3000);
  };

  // Single source of truth for all schedules
  const [schedules, setSchedules] = useState([
    { id: 's1', name: 'Summer Sale Extravaganza',       brand: 'Open',                owner: 'John Doe',  type: 'Fixed Slot',  status: 'Upcoming', startDate: 'Sep 20, 2024', endDate: 'Oct 15, 2024' },
    { id: 's2', name: 'New Year Countdown Promotions',  brand: 'Advertiser Specific', owner: 'Ruth Price', type: 'Fixed Slot',  status: 'Active',   startDate: 'Sep 20, 2024', endDate: 'Jan 02, 2025' },
    { id: 's3', name: 'Black Friday Mega Discounts',    brand: 'Open',                owner: 'Ruth Price', type: 'Recurring',   status: 'Upcoming', startDate: 'Sep 20, 2024', endDate: 'Nov 30, 2024' },
    { id: 's4', name: "Valentine's Day Specials",       brand: 'Advertiser Specific', owner: 'Ruth Price', type: 'Multi-slot',  status: 'Pending',  startDate: 'Sep 20, 2024', endDate: 'Feb 15, 2025' },
    { id: 's5', name: 'Spring Clearance Events',        brand: 'Advertiser Specific', owner: 'John Doe',  type: 'Recurring',   status: 'Active',   startDate: 'Sep 20, 2024', endDate: 'May 31, 2025' },
    { id: 's6', name: 'Back to School Sales',           brand: 'Open',                owner: 'Ruth Price', type: 'Multi-slot',  status: 'Active',   startDate: 'Sep 20, 2024', endDate: 'Aug 30, 2025' },
    { id: 's7', name: 'Diwali Sparkle Sale',            brand: 'Open',                owner: 'John Doe',  type: 'Fixed Slot',  status: 'Archived', startDate: 'Sep 20, 2024', startTime: '11:00', endDate: 'Sep 25, 2024', endTime: '14:00', archivedAt: 'May 12, 2026 | 09:30' },
    { id: 's8', name: 'Independence Day Burst',         brand: 'Advertiser Specific', owner: 'Ruth Price', type: 'Recurring',   status: 'Archived', startDate: 'Aug 10, 2024', startTime: '09:00', endDate: 'Aug 16, 2024', endTime: '23:59', archivedAt: 'May 02, 2026 | 18:15' },
  ]);

  const openDrawerFor = (source) => {
    // New random ID + image seed on every open
    const contentId = String(5000 + Math.floor(Math.random() * 5000));
    const imageSeed = Math.random().toString(36).slice(2, 10);

    setDrawerContent({
      title: source?.name ? `${source.name} Billboard` : 'Sunset Boulevard Billboard',
      contentId,
      imageSeed,
      status: 'Active',
      mediaType: 'Image',
      duration: '45 seconds',
      resolution: '1680×1050',
      owner: source?.owner || 'John Doe',
      lastUpdatedDate: 'Jun 4, 2025',
      lastUpdatedTime: '02:47',
    });
  };

  // Selection + filters are reset whenever the user switches tabs
  const setTab = (t) => {
    setTabRaw(t);
    setSelectedIds(new Set());
    setStatusFilter([]); // status options differ across tabs
  };

  const tabSchedules =
    tab === 'archived'
      ? schedules.filter((s) => s.status === 'Archived')
      : schedules.filter((s) => s.status !== 'Archived');

  // Filter option lists drawn from current data
  const brandOptions = Array.from(new Set(schedules.map((s) => s.brand))).sort();
  const typeOptions = Array.from(new Set(schedules.map((s) => s.type))).sort();
  const statusOptions =
    tab === 'archived'
      ? ['Archived']
      : Array.from(new Set(schedules.filter((s) => s.status !== 'Archived').map((s) => s.status))).sort();

  const visibleSchedules = tabSchedules.filter((s) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const haystack = `${s.name} ${s.brand} ${s.owner} ${s.type}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (brandFilter.length && !brandFilter.includes(s.brand)) return false;
    if (typeFilter.length && !typeFilter.includes(s.type)) return false;
    if (statusFilter.length && !statusFilter.includes(s.status)) return false;
    return true;
  });

  const toggleRow = (id) => {
    setSelectedIds((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const allVisible = visibleSchedules.every((s) => selectedIds.has(s.id));
    if (allVisible) setSelectedIds(new Set());
    else setSelectedIds(new Set(visibleSchedules.map((s) => s.id)));
  };

  const archiveSchedule = (sch) => {
    const stamp = 'May 29, 2026 | 14:00';
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === sch.id
          ? {
              ...s,
              status: 'Archived',
              startTime: s.startTime || '11:00',
              endTime: s.endTime || '14:00',
              archivedAt: stamp,
            }
          : s
      )
    );
    setSelectedIds((s) => {
      const next = new Set(s);
      next.delete(sch.id);
      return next;
    });
    showToast(`"${sch.name}" moved to Archived Schedules.`);
  };

  const editSchedule = (sch) => {
    navigate('/edit-schedule', { state: { schedule: sch } });
  };

  const archiveSelected = () => {
    const count = selectedIds.size;
    if (count === 0) return;
    const stamp = 'May 29, 2026 | 14:00';
    setSchedules((prev) =>
      prev.map((s) =>
        selectedIds.has(s.id) && s.status !== 'Archived'
          ? {
              ...s,
              status: 'Archived',
              startTime: s.startTime || '11:00',
              endTime: s.endTime || '14:00',
              archivedAt: stamp,
            }
          : s
      )
    );
    setSelectedIds(new Set());
    showToast(`${count} schedule${count > 1 ? 's' : ''} moved to Archived Schedules.`);
  };

  const calendarSchedules = {
    Monday: [
      { name: 'Nike x SNKRS Drop Launch', brand: 'Nike, India', status: 'Active', dateRange: '16 Jun - 19 Jun' },
      { name: 'Apple Watch Series X Promo', brand: 'Nike, India', status: 'Active', dateRange: '16 May - 19 May' },
    ],
    Tuesday: [],
    Wednesday: [
      { name: 'Netflix Stranger Things 5', brand: 'Nike, India', status: 'Active', dateRange: '24 May - 26 May' },
    ],
    Thursday: [
      { name: 'Samsung Fold Reveal', brand: 'Nike, India', status: 'Active', dateRange: '20 May - 22 May' },
    ],
    Friday: [],
    Saturday: [
      { name: 'Summer Campaign', brand: 'Nike, India', status: 'Active', dateRange: '28 May - 30 May' },
      { name: "McDonald's Breakfast Rush", brand: 'Nike, India', status: 'Active', dateRange: '16 May - 19 May' },
    ],
    Sunday: [
      { name: 'CRED Cashback Weekender', brand: 'Nike, India', status: 'Active', dateRange: '16 May - 19 May' },
    ],
  };

  const isArchivedTab = tab === 'archived';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-white">
          <div className="max-w-[1440px] mx-auto px-10 py-8">
            {/* Page header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Schedule Management
              </h1>
              <button
                onClick={() => navigate('/create-schedule')}
                className="inline-flex items-center gap-2 text-white text-sm font-medium px-4 py-2.5 rounded-md hover:opacity-90"
                style={{ backgroundColor: NAVY }}
              >
                <Plus size={16} />
                New Schedule
              </button>
            </div>

            <ApprovalRequests
              onOpen={(id) => navigate(`/approvals/${id}`)}
              onViewAll={() => navigate('/approvals')}
            />

            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Upcoming Schedules</h3>
              <DateRangeButtons
                value={dateRange}
                onChange={(v) => { setDateRange(v); setMonthOffset(0); }}
                customRange={customRange}
                onCustomRangeChange={setCustomRange}
              />
            </div>
            {dateRange === '30' ? (
              <MonthCalendar
                month={new Date(TODAY.getFullYear(), TODAY.getMonth() + monthOffset, 1)}
                onNavigate={(delta) => setMonthOffset((o) => o + delta)}
                onChipClick={openDrawerFor}
              />
            ) : (
              <WeeklyCalendar
                weekStart={
                  dateRange === 'custom' && customRange?.start
                    ? startOfWeek(customRange.start)
                    : startOfWeek(TODAY)
                }
                schedulesByDay={calendarSchedules}
                onCardClick={openDrawerFor}
              />
            )}

            <div className="mt-10">
              <Tabs value={tab} onChange={setTab} />
              <FiltersRow
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                brandOptions={brandOptions}
                typeOptions={typeOptions}
                statusOptions={statusOptions}
                brandFilter={brandFilter}
                typeFilter={typeFilter}
                statusFilter={statusFilter}
                onBrandChange={setBrandFilter}
                onTypeChange={setTypeFilter}
                onStatusChange={setStatusFilter}
                onClearAll={clearAllFilters}
              />
              <SubToolbar
                left={
                  selectedIds.size > 0 ? (
                    <><span className="font-semibold">{selectedIds.size}</span> selected</>
                  ) : (
                    <>
                      {isArchivedTab ? 'Archived ' : ''}Schedules Found:{' '}
                      <span className="font-semibold">{visibleSchedules.length}</span>
                    </>
                  )
                }
                right={
                  selectedIds.size > 0 && !isArchivedTab ? (
                    <button
                      onClick={archiveSelected}
                      className="inline-flex items-center gap-1.5 text-sm font-medium hover:opacity-80"
                      style={{ color: NAVY }}
                    >
                      <Archive size={14} />
                      Archive Selected
                    </button>
                  ) : null
                }
              />
              <SchedulesTable
                rows={visibleSchedules}
                archived={isArchivedTab}
                selectedIds={selectedIds}
                onToggleRow={toggleRow}
                onToggleAll={toggleAll}
                onRowOpen={openDrawerFor}
                onEdit={editSchedule}
                onArchive={archiveSchedule}
              />
              <Pagination
                totalRows={visibleSchedules.length}
                selected={selectedIds.size}
              />
            </div>
          </div>
        </main>
      </div>
      <ContentDrawer
        open={!!drawerContent}
        onClose={() => setDrawerContent(null)}
        content={drawerContent}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-3 rounded-lg shadow-xl">
          <CheckCircle2 size={16} className="text-green-400" />
          {toast.message}
        </div>
      )}
    </div>
  );
}
