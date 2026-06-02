import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Calendar,
  Info,
  Search,
  Plus,
  Trash2,
  LayoutGrid,
  Image as ImageIcon,
  Play,
  FileText,
  Monitor,
  Upload,
  Check,
  CheckCircle2,
  AlertCircle,
  Folder,
  GripVertical,
  Lock,
  ClipboardList,
} from 'lucide-react';
import { StatusPill } from '../components/AppShell';

/* -------------------------------------------------------------------------- */
/*  Tokens                                                                     */
/* -------------------------------------------------------------------------- */

const NAVY = '#12297D';
const LAV_HEADER = '#E8E9FD'; // section header band
const LAV_BG = '#EEF1FA';     // chip / soft fill
const SUB_BG = '#F7F8FB';     // panel header / main bg

// Pinned "today" so the prototype renders deterministically.
const TODAY = new Date(2026, 4, 29); // May 29, 2026
const MAX_END = new Date(TODAY.getFullYear() + 2, TODAY.getMonth(), TODAY.getDate());

/* -------------------------------------------------------------------------- */
/*  Mock data                                                                  */
/* -------------------------------------------------------------------------- */

const SCREEN_LIBRARY = [
  { id: '23490175', name: 'Dynamic Digital Display', location: 'Syracuse', price: 230, seed: 'screen-syracuse' },
  { id: '23490176', name: 'Vibrant LED Showcase',    location: 'Albany',   price: 150, seed: 'screen-albany-1' },
  { id: '23490177', name: 'Advertising Panel',       location: 'Albany',   price: 175, seed: 'screen-albany-2' },
  { id: '23490178', name: 'Urban Pulse Display',     location: 'Queens',   price: 275, seed: 'screen-queens' },
  { id: '23490179', name: 'Metro Transit Board',     location: 'Brooklyn', price: 320, seed: 'screen-brooklyn' },
  { id: '23490180', name: 'Downtown Marquee',        location: 'Toronto',  price: 210, seed: 'screen-toronto' },
];

const BRAND_OPTIONS = ['Nike, India', 'Samsung', 'Netflix', 'Apple', "McDonald's", 'CRED', 'Coca-Cola', 'Petco'];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];


/* -------------------------------------------------------------------------- */
/*  Date + time helpers                                                        */
/* -------------------------------------------------------------------------- */

function inferMediaType(name) {
  if (!name) return 'Image';
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (['mp4', 'mov', 'webm', 'm4v'].includes(ext)) return 'Video';
  if (ext === 'gif') return 'Animation';
  return 'Image';
}

function deriveContentId(seed = '') {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return String(5000 + (Math.abs(h) % 5000));
}

function parseDateDMY(s) {
  if (!s) return null;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
  return Number.isNaN(d.getTime()) ? null : d;
}

// Returns seconds-from-midnight, or null if unparseable. Supports "HH:MM[:SS] AM|PM".
function parseTime(s) {
  if (!s) return null;
  const m = s.match(/^\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)\s*$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const sec = m[3] ? parseInt(m[3], 10) : 0;
  const period = m[4].toUpperCase();
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 3600 + min * 60 + sec;
}

/* -------------------------------------------------------------------------- */
/*  Reusable UI bits                                                           */
/* -------------------------------------------------------------------------- */

function SectionCard({ title, expanded, onToggle, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3 text-left"
        style={{ backgroundColor: LAV_HEADER }}
      >
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        {expanded ? (
          <ChevronUp size={16} className="text-gray-500" />
        ) : (
          <ChevronDown size={16} className="text-gray-500" />
        )}
      </button>
      {expanded && <div className="p-6">{children}</div>}
    </div>
  );
}

function SubHeader({ icon: Icon, title, helper }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: LAV_BG, color: NAVY }}
      >
        <Icon size={16} />
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        <div className="text-xs text-gray-500 mt-1 leading-relaxed max-w-2xl">{helper}</div>
      </div>
    </div>
  );
}

function Label({ children, required, info }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-xs font-medium text-gray-700">{children}</span>
      {required && <span className="text-red-500">*</span>}
      {info && <Info size={11} className="text-gray-400" />}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, disabled }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full text-sm bg-white border rounded-md px-3 py-2 outline-none focus:border-gray-400 ${
        disabled ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' : 'border-gray-200'
      }`}
    />
  );
}

function SelectInput({ value, onChange, placeholder, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full text-sm bg-white border border-gray-200 rounded-md px-3 py-2 pr-9 outline-none focus:border-gray-400 appearance-none ${
          value ? 'text-gray-900' : 'text-gray-400'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function DateInput({ value, onChange, disabled, error }) {
  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="DD/MM/YYYY"
          className={`w-full text-sm bg-white border rounded-md pl-3 pr-9 py-2 outline-none focus:border-gray-400 ${
            disabled
              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              : error
              ? 'border-red-400'
              : 'border-gray-200'
          }`}
        />
        <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <div className="flex items-center gap-1 text-[11px] text-red-600 mt-1">
          <AlertCircle size={11} /> {error}
        </div>
      )}
    </div>
  );
}

function RadioCard({ selected, onClick, title, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left bg-white rounded-lg p-4 border-2 transition flex-1 ${
        selected ? 'border-[#12297D]' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
            selected ? 'border-[#12297D]' : 'border-gray-300'
          }`}
        >
          {selected && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: NAVY }} />}
        </span>
        <span className="text-sm font-semibold text-gray-900">{title}</span>
      </div>
      {description && (
        <div className="text-xs text-gray-500 leading-relaxed">{description}</div>
      )}
    </button>
  );
}

function NextButton({ onClick, label = 'Next', disabled, hint }) {
  return (
    <div className="flex justify-end items-center gap-3 mt-6">
      {disabled && hint && (
        <span className="text-xs text-amber-600 flex items-center gap-1">
          <AlertCircle size={12} /> {hint}
        </span>
      )}
      <button
        type="button"
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={`inline-flex items-center gap-2 text-white text-sm font-medium px-5 py-2 rounded-md ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
        }`}
        style={{ backgroundColor: NAVY }}
      >
        {label}
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Top header + stepper                                                       */
/* -------------------------------------------------------------------------- */

function PageHeader({
  title,
  onBack,
  onDiscard,
  onSubmit,
  submitLabel = 'Submit Changes',
  submitEnabled = false,
}) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900"
        >
          <ChevronLeft size={18} />
          Back
        </button>
        <div className="flex-1 text-center text-base font-semibold text-gray-900">{title}</div>
        <div className="flex items-center gap-4">
          <button
            onClick={onDiscard}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Discard
          </button>
          {onSubmit && (
            <button
              onClick={submitEnabled ? onSubmit : undefined}
              disabled={!submitEnabled}
              className={`text-sm font-medium px-4 py-2 rounded-md ${
                submitEnabled
                  ? 'text-white hover:opacity-90'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              style={submitEnabled ? { backgroundColor: NAVY } : undefined}
            >
              {submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ step, onStepChange, canGoToStep, stepCompletion }) {
  const steps = [
    { n: 1, label: 'Schedule Basics' },
    { n: 2, label: 'Layout & Content' },
    { n: 3, label: 'Pricing & Review' },
  ];
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center gap-4 justify-center">
        {steps.map((s, i) => {
          const active = step === s.n;
          const allowed = canGoToStep(s.n);
          const completed = stepCompletion[s.n];
          return (
            <div key={s.n} className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => allowed && onStepChange(s.n)}
                disabled={!allowed}
                title={allowed ? '' : 'Finish the current step before continuing.'}
                className={`flex items-center gap-2.5 group ${
                  allowed ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 ${
                    active
                      ? 'text-white border-transparent'
                      : completed && allowed
                      ? 'text-white border-transparent'
                      : 'bg-white text-gray-400 border-gray-300 group-hover:border-gray-400'
                  }`}
                  style={
                    active
                      ? { backgroundColor: NAVY }
                      : completed && allowed
                      ? { backgroundColor: '#16a34a' }
                      : undefined
                  }
                >
                  {!active && !allowed ? (
                    <Lock size={12} />
                  ) : completed && !active ? (
                    <Check size={14} />
                  ) : (
                    s.n
                  )}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    active
                      ? 'text-[#12297D]'
                      : allowed
                      ? 'text-gray-500 group-hover:text-gray-700'
                      : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <ChevronRight size={16} className="text-gray-300" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Left Summary sidebar                                                       */
/* -------------------------------------------------------------------------- */

function SidebarSection({ title, open, onToggle, children }) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        {open ? (
          <ChevronUp size={14} className="text-gray-400" />
        ) : (
          <ChevronDown size={14} className="text-gray-400" />
        )}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function SidebarAnchor({ label, active, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={disabled ? 'Complete the current step first.' : undefined}
      className={`text-sm font-semibold text-left w-full flex items-center gap-1.5 ${
        active
          ? 'text-[#12297D]'
          : disabled
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-gray-700 hover:text-gray-900'
      }`}
    >
      {disabled && <Lock size={11} className="shrink-0" />}
      {label}
    </button>
  );
}

function SidebarRow({ label, value }) {
  return (
    <div className="text-xs">
      <div className="text-gray-500">{label}</div>
      <div className="text-gray-900 font-medium mt-0.5">
        {value || <span className="text-gray-300">—</span>}
      </div>
    </div>
  );
}

function SidebarList({ label, items }) {
  return (
    <div className="text-xs">
      <div className="text-gray-500">{label}</div>
      {items.length === 0 ? (
        <div className="text-gray-300 mt-0.5">—</div>
      ) : (
        <div className="mt-0.5 space-y-0.5">
          {items.map((it, i) => (
            <div key={i} className="text-gray-900 font-medium">{it}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function SummarySidebar({
  scheduleName, brand, selectedScreenIds, scheduleType,
  layout, contentSource,
  suggestedPrice,
  activeSubsection,
  onJumpTo,
  openSections, toggleSection,
  canGoToStep,
}) {
  const step2Locked = !canGoToStep(2);
  const step3Locked = !canGoToStep(3);
  const selectedScreenNames = SCREEN_LIBRARY
    .filter((s) => selectedScreenIds.has(s.id))
    .map((s) => s.name);

  const layoutLabel = layout ? layout[0].toUpperCase() + layout.slice(1) : '';
  const sourceLabel = {
    upload: 'Upload New Content',
    templates: 'Select from Templates',
    previously: 'Use Previously Scheduled Bundle',
  }[contentSource];

  return (
    <aside className="w-[280px] border-r border-gray-200 bg-white shrink-0 self-stretch">
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="text-base font-bold text-gray-900">Schedule Summary</div>
      </div>

      <SidebarSection
        title="Schedule Configuration"
        open={openSections.has('schedule-config')}
        onToggle={() => toggleSection('schedule-config')}
      >
        <SidebarAnchor
          label="Campaign Setup"
          active={activeSubsection === 'campaign-setup'}
          onClick={() => onJumpTo(1, 'campaign-setup')}
        />
        <SidebarRow label="Schedule Name" value={scheduleName} />
        {Array.isArray(brand) ? (
          <SidebarList label="Brand" items={brand} />
        ) : (
          <SidebarRow label="Brand" value={brand} />
        )}
        <SidebarList label="Billboard" items={selectedScreenNames} />
      </SidebarSection>

      <SidebarSection
        title="Slot Configuration"
        open={openSections.has('slot-config')}
        onToggle={() => toggleSection('slot-config')}
      >
        <SidebarAnchor
          label="Time & Frequency"
          active={activeSubsection === 'time-frequency'}
          onClick={() => onJumpTo(1, 'time-frequency')}
        />
        <SidebarRow
          label="Schedule Type"
          value={scheduleType ? scheduleType[0].toUpperCase() + scheduleType.slice(1) : ''}
        />
      </SidebarSection>

      <SidebarSection
        title="Layout & Content"
        open={openSections.has('layout-content')}
        onToggle={() => toggleSection('layout-content')}
      >
        <SidebarAnchor
          label="Layout Selection"
          active={activeSubsection === 'layout'}
          disabled={step2Locked}
          onClick={() => onJumpTo(2, 'layout')}
        />
        <SidebarRow label="Layout" value={layoutLabel} />
        <SidebarAnchor
          label="Content Selection"
          active={activeSubsection === 'content'}
          disabled={step2Locked}
          onClick={() => onJumpTo(2, 'content')}
        />
        <SidebarRow label="Source" value={sourceLabel} />
      </SidebarSection>

      <SidebarSection
        title="Pricing & Review"
        open={openSections.has('pricing-review')}
        onToggle={() => toggleSection('pricing-review')}
      >
        <SidebarAnchor
          label="Overview"
          active={activeSubsection === 'overview'}
          disabled={step3Locked}
          onClick={() => onJumpTo(3, 'overview')}
        />
        <SidebarAnchor
          label="Billboard Review"
          active={activeSubsection === 'billboard'}
          disabled={step3Locked}
          onClick={() => onJumpTo(3, 'billboard')}
        />
        <SidebarRow
          label="Suggested Price"
          value={suggestedPrice ? `$${suggestedPrice.toLocaleString()} USD` : null}
        />
      </SidebarSection>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*  STEP 1 — Schedule Configuration                                            */
/* -------------------------------------------------------------------------- */

function ScheduleConfigSection({
  expanded, onToggle, onActivate,
  scheduleName, setScheduleName,
  brand, setBrand,
  selectedScreens, toggleScreen, removeScreen,
  onNext, nextDisabled, nextHint,
}) {
  const [search, setSearch] = useState('');
  const filtered = SCREEN_LIBRARY.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.id.includes(q) ||
      s.location.toLowerCase().includes(q)
    );
  });

  return (
    <SectionCard title="Schedule Configuration" expanded={expanded} onToggle={() => { onToggle(); onActivate(); }}>
      <SubHeader
        icon={ClipboardList}
        title="Campaign Setup"
        helper="Set the core campaign information: brand, billboards, and schedule name. This helps us match your campaign with the right screens and check for conflicts."
      />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <Label>Schedule Name</Label>
          <TextInput value={scheduleName} onChange={setScheduleName} placeholder="Enter a name for schedule" />
        </div>
        <div>
          <Label info>Brand</Label>
          <SelectInput value={brand} onChange={setBrand} placeholder="Select a brand" options={BRAND_OPTIONS} />
        </div>
      </div>

      <Label required info>Select Screen</Label>

      <div className="grid grid-cols-2 gap-4 mt-2">
        {/* Library */}
        <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 text-xs font-medium text-gray-600" style={{ backgroundColor: SUB_BG }}>
            Total Screen: 45
          </div>
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search billboards by name, ID or Location"
                className="w-full text-xs bg-white border border-gray-200 rounded-md pl-9 pr-3 py-2 outline-none focus:border-gray-400"
              />
            </div>
          </div>
          {/* Table header */}
          <div className="grid grid-cols-[24px_1fr_90px_90px] gap-3 px-4 py-2 text-[11px] font-medium text-gray-500 border-b border-gray-100">
            <span></span>
            <span>Screen</span>
            <span>Location</span>
            <span>Price</span>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {filtered.map((s) => {
              const checked = selectedScreens.has(s.id);
              return (
                <label
                  key={s.id}
                  className={`grid grid-cols-[24px_1fr_90px_90px] gap-3 items-center px-4 py-3 cursor-pointer ${
                    checked ? 'bg-blue-50/60' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleScreen(s.id)}
                  />
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={`https://picsum.photos/seed/${s.seed}/120/120`}
                      alt={s.name}
                      className="w-12 h-12 rounded-md object-cover bg-gray-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] text-[#2563EB] font-medium">Screen ID: {s.id}</div>
                      <div className="text-sm font-semibold text-gray-900 truncate">{s.name}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-700">{s.location}</div>
                  <div className="text-xs font-semibold text-gray-900">$ {s.price}/day</div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Selected */}
        <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col" style={{ backgroundColor: SUB_BG }}>
          <div className="px-4 py-2.5 text-xs font-medium text-gray-600 bg-white border-b border-gray-100">
            Selected Screen: {selectedScreens.size}
          </div>
          {selectedScreens.size === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-6">
              <div className="text-sm text-gray-400 font-medium">No screens selected yet.</div>
              <div className="text-xs text-gray-400 mt-1">
                Pick screens from the list to add them here.
              </div>
            </div>
          ) : (
            <div className="p-3 space-y-2 overflow-y-auto max-h-96">
              {SCREEN_LIBRARY.filter((s) => selectedScreens.has(s.id)).map((s) => (
                <div key={s.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-md px-3 py-2.5">
                  <img
                    src={`https://picsum.photos/seed/${s.seed}/120/120`}
                    alt={s.name}
                    className="w-12 h-12 rounded-md object-cover bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-[#2563EB] font-medium">Screen ID: {s.id}</div>
                    <div className="text-sm font-semibold text-gray-900 truncate">{s.name}</div>
                  </div>
                  <div className="text-xs font-semibold text-gray-900 shrink-0">$ {s.price}/day</div>
                  <button
                    onClick={() => removeScreen(s.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <NextButton onClick={onNext} disabled={nextDisabled} hint={nextHint} />
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  STEP 1 — Slot Configuration                                                */
/* -------------------------------------------------------------------------- */

const DAY_FULL = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

function SlotConfigSection({
  expanded, onToggle, onActivate,
  scheduleType, setScheduleType,
  startDate, setStartDate, startError,
  endDate, setEndDate, endError,
  startImmediately, setStartImmediately,
  selectedDays, toggleDay,
  customSlots, addCustomSlot, removeCustomSlot, updateCustomSlot,
  weeklySlots, addWeeklySlot, removeWeeklySlot, updateWeeklySlot,
  slotErrors,
  onNext, nextDisabled, nextHint,
}) {
  return (
    <SectionCard title="Slot Configuration" expanded={expanded} onToggle={() => { onToggle(); onActivate(); }}>
      <div className="grid grid-cols-[1fr_320px] gap-8">
        {/* Left form */}
        <div>
          <SubHeader
            icon={Calendar}
            title="Time & Frequency"
            helper="Decide how your campaign should repeat or run. You can run it continuously or on specific days and time blocks."
          />

          <Label info>Schedule Type</Label>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <RadioCard
              selected={scheduleType === 'custom'}
              onClick={() => setScheduleType('custom')}
              title="Custom"
              description="Run your campaign non-stop between the selected start and end time. Ideal for one-time events or uninterrupted campaigns over a fixed date range."
            />
            <RadioCard
              selected={scheduleType === 'weekly'}
              onClick={() => setScheduleType('weekly')}
              title="Weekly"
              description="Run your campaign on specific days of the week and time blocks. Great for recurring schedules like weekdays only, weekends, or daily peak hours."
            />
          </div>

          {scheduleType === 'custom' ? (
            <>
              <Label required>Start and End Date</Label>
              <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-start mb-2">
                <DateInput
                  value={startDate}
                  onChange={setStartDate}
                  disabled={startImmediately}
                  error={startError}
                />
                <DateInput value={endDate} onChange={setEndDate} error={endError} />
                <label className="flex items-center gap-2 text-xs text-gray-700 whitespace-nowrap pt-2">
                  <input
                    type="checkbox"
                    checked={startImmediately}
                    onChange={(e) => setStartImmediately(e.target.checked)}
                  />
                  Start Immediately
                </label>
              </div>
              {startImmediately && (
                <div className="text-[11px] text-gray-500 mb-4">
                  Campaign will start as soon as it is approved.
                </div>
              )}
            </>
          ) : (
            <>
              <Label required>Days of the Week</Label>
              <div className="flex flex-wrap gap-2 mb-6">
                {WEEK_DAYS.map((d) => {
                  const on = selectedDays.has(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={`text-xs font-medium px-3 py-2 rounded-md border transition ${
                        on
                          ? 'text-white border-transparent'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                      style={on ? { backgroundColor: NAVY } : undefined}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>

              <Label required>Start and End Date</Label>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <DateInput value={startDate} onChange={setStartDate} error={startError} />
                <DateInput value={endDate} onChange={setEndDate} error={endError} />
              </div>
            </>
          )}

          {scheduleType === 'custom' && (
            <button
              type="button"
              onClick={addCustomSlot}
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 mt-2"
              style={{ backgroundColor: LAV_BG, color: NAVY }}
            >
              <Plus size={14} />
              Add Slot
            </button>
          )}
          {scheduleType === 'weekly' && (
            <div className="mt-2 text-[11px] text-gray-500">
              Add time blocks per day in the panel on the right.
            </div>
          )}
        </div>

        {/* Right slots panel — different shape per schedule type */}
        {scheduleType === 'custom' ? (
          <CustomSlotsPanel
            slots={customSlots}
            slotErrors={slotErrors}
            removeSlot={removeCustomSlot}
            updateSlot={updateCustomSlot}
          />
        ) : (
          <WeeklySlotsPanel
            selectedDays={selectedDays}
            slots={weeklySlots}
            slotErrors={slotErrors}
            addSlot={addWeeklySlot}
            removeSlot={removeWeeklySlot}
            updateSlot={updateWeeklySlot}
          />
        )}
      </div>

      <NextButton onClick={onNext} disabled={nextDisabled} hint={nextHint} />
    </SectionCard>
  );
}

function SlotRow({ slot, index, error, onRemove, onUpdate }) {
  const err = error || {};
  const hasError = err.start || err.end || err.duration;
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="text-[11px] text-gray-400 font-medium">Slot {index + 1}</div>
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 p-1"
          aria-label={`Remove slot ${index + 1}`}
        >
          <Trash2 size={13} />
        </button>
      </div>
      <div className="grid grid-cols-[1fr_12px_1fr] gap-2 items-start">
        <input
          type="text"
          value={slot.start}
          onChange={(e) => onUpdate({ start: e.target.value })}
          aria-invalid={Boolean(err.start || err.duration)}
          className={`min-w-0 w-full text-xs bg-white border rounded-md px-2 py-1.5 outline-none focus:border-gray-400 ${
            err.start || err.duration ? 'border-red-400' : 'border-gray-200'
          }`}
        />
        <div className="text-gray-400 text-xs text-center leading-[28px]">–</div>
        <input
          type="text"
          value={slot.end}
          onChange={(e) => onUpdate({ end: e.target.value })}
          aria-invalid={Boolean(err.end || err.duration)}
          className={`min-w-0 w-full text-xs bg-white border rounded-md px-2 py-1.5 outline-none focus:border-gray-400 ${
            err.end || err.duration ? 'border-red-400' : 'border-gray-200'
          }`}
        />
      </div>
      {hasError && (
        <div className="mt-1.5 space-y-0.5">
          {err.start && (
            <div className="flex items-start gap-1 text-[11px] text-red-600 leading-tight">
              <AlertCircle size={11} className="mt-[2px] shrink-0" />
              <span><span className="font-semibold">Start:</span> {err.start}</span>
            </div>
          )}
          {err.end && (
            <div className="flex items-start gap-1 text-[11px] text-red-600 leading-tight">
              <AlertCircle size={11} className="mt-[2px] shrink-0" />
              <span><span className="font-semibold">End:</span> {err.end}</span>
            </div>
          )}
          {err.duration && (
            <div className="flex items-start gap-1 text-[11px] text-red-600 leading-tight">
              <AlertCircle size={11} className="mt-[2px] shrink-0" />
              <span>{err.duration}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CustomSlotsPanel({ slots, slotErrors, removeSlot, updateSlot }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden self-start">
      <div className="px-4 py-3 border-b border-gray-100" style={{ backgroundColor: SUB_BG }}>
        <div className="text-sm font-semibold text-gray-900">
          Scheduled Time Blocks: {slots.length}
        </div>
      </div>
      <div className="px-4 py-3 text-xs font-semibold text-gray-700 border-b border-gray-100">
        24th May 2025
      </div>
      <div className="divide-y divide-gray-100">
        {slots.length === 0 ? (
          <div className="text-xs text-gray-400 px-4 py-6 text-center">
            No slots yet. Click Add Slot to create one.
          </div>
        ) : (
          slots.map((slot, i) => (
            <div key={slot.id} className="px-4 py-3">
              <SlotRow
                slot={slot}
                index={i}
                error={slotErrors[slot.id]}
                onRemove={() => removeSlot(slot.id)}
                onUpdate={(patch) => updateSlot(slot.id, patch)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function WeeklySlotsPanel({ selectedDays, slots, slotErrors, addSlot, removeSlot, updateSlot }) {
  const orderedDays = WEEK_DAYS.filter((d) => selectedDays.has(d));
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden self-start">
      <div className="px-4 py-3 border-b border-gray-100" style={{ backgroundColor: SUB_BG }}>
        <div className="text-sm font-semibold text-gray-900">
          Scheduled Time Blocks: {slots.length}
        </div>
        <div className="text-[11px] text-gray-500 mt-0.5">
          {orderedDays.length === 0
            ? 'Pick at least one day to start scheduling.'
            : `Across ${orderedDays.length} day${orderedDays.length === 1 ? '' : 's'} per week`}
        </div>
      </div>

      {orderedDays.length === 0 ? (
        <div className="text-xs text-gray-400 px-4 py-8 text-center">
          Select a day above to add slots.
        </div>
      ) : (
        <div className="divide-y divide-gray-100 max-h-[520px] overflow-y-auto">
          {orderedDays.map((day) => {
            const daySlots = slots.filter((s) => s.day === day);
            return (
              <div key={day} className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-gray-900">{DAY_FULL[day]}</div>
                  <span className="text-[10px] text-gray-400">
                    {daySlots.length} {daySlots.length === 1 ? 'slot' : 'slots'}
                  </span>
                </div>

                {daySlots.length === 0 ? (
                  <div className="text-[11px] text-gray-400 mb-2">No time blocks yet.</div>
                ) : (
                  <div className="space-y-3 mb-2">
                    {daySlots.map((slot, i) => (
                      <SlotRow
                        key={slot.id}
                        slot={slot}
                        index={i}
                        error={slotErrors[slot.id]}
                        onRemove={() => removeSlot(slot.id)}
                        onUpdate={(patch) => updateSlot(slot.id, patch)}
                      />
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => addSlot(day)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded hover:opacity-90"
                  style={{ backgroundColor: LAV_BG, color: NAVY }}
                >
                  <Plus size={11} /> Add Slot
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  STEP 2 — Layout / Content / Playback                                       */
/* -------------------------------------------------------------------------- */

function LayoutPreview({ kind }) {
  // Soft secondary derived from NAVY so the previews stay in-palette
  // without the harsher #3F52B8 medium blue.
  const PRIMARY = NAVY;
  const SECONDARY = '#C7D0E8';

  if (kind === 'fullscreen') {
    return <div className="w-full aspect-[16/9] rounded-md" style={{ backgroundColor: PRIMARY }} />;
  }
  if (kind === 'quadrant') {
    return (
      <div
        className="w-full aspect-[16/9] rounded-md overflow-hidden grid grid-cols-2 grid-rows-2 gap-0.5 bg-white"
        style={{ outline: `2px solid ${PRIMARY}`, outlineOffset: -2 }}
      >
        <div style={{ backgroundColor: PRIMARY }} />
        <div style={{ backgroundColor: SECONDARY }} />
        <div style={{ backgroundColor: SECONDARY }} />
        <div style={{ backgroundColor: PRIMARY }} />
      </div>
    );
  }
  return (
    <div className="w-full aspect-[16/9] rounded-md flex flex-col bg-gray-200">
      <div className="flex-1 bg-gray-200" />
      <div
        className="text-white text-[10px] font-bold tracking-widest text-center py-2"
        style={{ backgroundColor: PRIMARY }}
      >
        SPONSORED
      </div>
    </div>
  );
}

function LayoutSelectionSection({ expanded, onToggle, onActivate, layout, setLayout, onNext }) {
  const options = [
    { id: 'fullscreen', label: 'Fullscreen' },
    { id: 'quadrant',   label: 'Quadrant' },
    { id: 'banner',     label: 'Banner' },
  ];
  return (
    <SectionCard title="Layout Selection" expanded={expanded} onToggle={() => { onToggle(); onActivate(); }}>
      <SubHeader
        icon={LayoutGrid}
        title="Layout Cards"
        helper="Choose how and where your ad will appear on selected billboards."
      />
      <Label>Layout</Label>
      <div className="grid grid-cols-3 gap-4">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setLayout(o.id)}
            className={`text-left bg-white rounded-lg p-4 border-2 transition ${
              layout === o.id ? 'border-[#12297D]' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  layout === o.id ? 'border-[#12297D]' : 'border-gray-300'
                }`}
              >
                {layout === o.id && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: NAVY }} />}
              </span>
            </div>
            <LayoutPreview kind={o.id} />
            <div className="text-sm font-semibold text-gray-900 mt-3 text-center">{o.label}</div>
          </button>
        ))}
      </div>
      <NextButton onClick={onNext} />
    </SectionCard>
  );
}

const TEMPLATE_LIBRARY = [
  { id: 'tmpl-summer',  name: 'Summer Sale Promo',    tag: 'Retail',  seed: 'tmpl-summer' },
  { id: 'tmpl-bf',      name: 'Black Friday Blowout', tag: 'Retail',  seed: 'tmpl-bf' },
  { id: 'tmpl-ny',      name: 'New Year Countdown',   tag: 'Holiday', seed: 'tmpl-ny' },
  { id: 'tmpl-back',    name: 'Back to School',       tag: 'Retail',  seed: 'tmpl-back' },
  { id: 'tmpl-brand',   name: 'Brand Awareness',      tag: 'Brand',   seed: 'tmpl-brand' },
  { id: 'tmpl-launch',  name: 'Product Launch',       tag: 'Brand',   seed: 'tmpl-launch' },
];

const PREVIOUS_BUNDLES = [
  { id: 'b1', name: 'Nike Q1 2026 — Storefront',  scheduled: 'Mar 12, 2026', owner: 'Ruth Price',
    items: ['Hero loop.mp4', 'Logo seal.png', 'Tagline card.jpg', 'CTA bumper.mp4', 'Storefront intro.mp4'] },
  { id: 'b2', name: 'Apple Spring Watch Push',    scheduled: 'Apr 02, 2026', owner: 'John Doe',
    items: ['Watch reveal.mp4', 'Strap variants.png', 'Spring CTA.jpg'] },
  { id: 'b3', name: 'Netflix S5 Premiere',        scheduled: 'May 15, 2026', owner: 'Ruth Price',
    items: ['Teaser 15s.mp4', 'Cast hero.png', 'Date stamp.jpg', 'Coming soon.mp4', 'Episode preview.mp4', 'Logo lockup.png', 'CTA short.jpg', 'Loop endcard.mp4'] },
  { id: 'b4', name: 'CRED Weekend Push',          scheduled: 'May 20, 2026', owner: 'Ruth Price',
    items: ['Weekend headline.mp4', 'Reward stamp.png', 'Tap to claim.jpg', 'Loop close.mp4'] },
  { id: 'b5', name: "McDonald's Breakfast Rush",  scheduled: 'May 22, 2026', owner: 'John Doe',
    items: ['McMuffin reveal.mp4', 'Coffee splash.png', 'Combo card.jpg', 'Drive-thru hero.mp4', 'Time stamp.png', 'CTA bumper.mp4'] },
];

const bundleItemCount = (b) => b.items?.length ?? 0;

function TemplateCard({ t, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative bg-white rounded-lg overflow-hidden border-2 text-left transition ${
        selected ? 'border-[#12297D]' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <img
        src={`https://picsum.photos/seed/${t.seed}/320/180`}
        alt={t.name}
        className="w-full aspect-[16/10] object-cover bg-gray-100"
        loading="lazy"
      />
      <div className="p-3">
        <div className="text-sm font-semibold text-gray-900">{t.name}</div>
        <div className="text-xs text-gray-500 mt-0.5">{t.tag}</div>
      </div>
      {selected && (
        <div
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow"
          style={{ backgroundColor: NAVY }}
        >
          <Check size={14} className="text-white" />
        </div>
      )}
    </button>
  );
}

function BundleRow({ b, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
        selected ? 'bg-blue-50/60' : 'hover:bg-gray-50'
      }`}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={() => {}}
        className="pointer-events-none"
      />
      <div
        className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
        style={{ backgroundColor: LAV_BG, color: NAVY }}
      >
        <Folder size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-900 truncate">{b.name}</div>
        <div className="text-xs text-gray-500 mt-0.5">
          {bundleItemCount(b)} creatives · scheduled {b.scheduled} · {b.owner}
        </div>
      </div>
      {selected && (
        <span
          className="text-[11px] font-medium px-2 py-1 rounded-md"
          style={{ backgroundColor: LAV_BG, color: NAVY }}
        >
          Selected
        </span>
      )}
    </button>
  );
}

function EmptyResults({ label }) {
  return (
    <div className="border border-dashed border-gray-200 rounded-lg py-12 text-center">
      <div className="text-sm text-gray-500 font-medium">No {label} match your search.</div>
      <div className="text-xs text-gray-400 mt-1">Try a different keyword or clear the search.</div>
    </div>
  );
}

function ContentSelectionSection({
  expanded, onToggle, onActivate,
  contentSource, setContentSource,
  selectedTemplates, toggleTemplate,
  selectedBundle, setSelectedBundle,
  uploadedFiles, removeUploadedFile, simulateUpload,
  onNext, nextDisabled, nextHint,
}) {
  const [search, setSearch] = useState('');

  // Reset search whenever the source switches so the placeholder stays meaningful.
  const handleSourceChange = (src) => {
    setContentSource(src);
    setSearch('');
  };

  const matches = (...fields) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return fields.some((f) => (f || '').toLowerCase().includes(q));
  };

  const filteredTemplates = TEMPLATE_LIBRARY.filter((t) => matches(t.name, t.tag));
  const filteredBundles = PREVIOUS_BUNDLES.filter((b) => matches(b.name, b.owner));

  const selectionSummary = (() => {
    if (contentSource === 'upload') {
      if (uploadedFiles.length === 0) return null;
      return `${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} ready to upload`;
    }
    if (contentSource === 'templates') {
      if (selectedTemplates.size === 0) return null;
      return `${selectedTemplates.size} template${selectedTemplates.size > 1 ? 's' : ''} selected`;
    }
    if (contentSource === 'previously') {
      return selectedBundle ? `Using bundle "${PREVIOUS_BUNDLES.find((b) => b.id === selectedBundle)?.name}"` : null;
    }
    return null;
  })();

  const searchPlaceholder = {
    upload: 'Search library',
    templates: 'Search templates by name or tag',
    previously: 'Search previous bundles',
  }[contentSource];

  return (
    <SectionCard title="Content Selection" expanded={expanded} onToggle={() => { onToggle(); onActivate(); }}>
      <SubHeader
        icon={ImageIcon}
        title="Content Selection"
        helper="Choose one or more creatives from your content library."
      />

      <Label>Content Source</Label>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <RadioCard selected={contentSource === 'upload'}     onClick={() => handleSourceChange('upload')}     title="Upload New Content" />
        <RadioCard selected={contentSource === 'templates'}  onClick={() => handleSourceChange('templates')}  title="Select from Templates" />
        <RadioCard selected={contentSource === 'previously'} onClick={() => handleSourceChange('previously')} title="Use Previously Scheduled Bundle" />
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full text-sm bg-white border border-gray-200 rounded-md pl-9 pr-3 py-2 outline-none focus:border-gray-400"
        />
      </div>

      {/* Body — swaps per source */}
      {contentSource === 'upload' && (
        <>
          <button
            type="button"
            onClick={simulateUpload}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-10 flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition"
          >
            <Upload size={22} className="mb-2 text-gray-400" />
            <span className="text-sm font-medium">Upload Content</span>
            <span className="text-xs text-gray-400 mt-1">JPG, PNG, MP4 up to 50MB</span>
          </button>
          {uploadedFiles.length > 0 && (
            <div className="mt-3 border border-gray-200 rounded-lg divide-y divide-gray-100">
              {uploadedFiles.map((f) => (
                <div key={f.id} className="flex items-center gap-3 px-3 py-2">
                  <img
                    src={`https://picsum.photos/seed/${f.seed}/120/120`}
                    alt={f.name}
                    className="w-10 h-10 rounded-md object-cover bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{f.name}</div>
                    <div className="text-[11px] text-gray-500">{f.size}</div>
                  </div>
                  <button
                    onClick={() => removeUploadedFile(f.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    aria-label={`Remove ${f.name}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {contentSource === 'templates' && (
        filteredTemplates.length === 0 ? (
          <EmptyResults label="templates" />
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filteredTemplates.map((t) => (
              <TemplateCard
                key={t.id}
                t={t}
                selected={selectedTemplates.has(t.id)}
                onClick={() => toggleTemplate(t.id)}
              />
            ))}
          </div>
        )
      )}

      {contentSource === 'previously' && (
        filteredBundles.length === 0 ? (
          <EmptyResults label="bundles" />
        ) : (
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
            {filteredBundles.map((b) => (
              <BundleRow
                key={b.id}
                b={b}
                selected={selectedBundle === b.id}
                onClick={() => setSelectedBundle(selectedBundle === b.id ? null : b.id)}
              />
            ))}
          </div>
        )
      )}

      {selectionSummary && (
        <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md" style={{ backgroundColor: LAV_BG, color: NAVY }}>
          <CheckCircle2 size={12} />
          {selectionSummary}
        </div>
      )}

      <NextButton onClick={onNext} disabled={nextDisabled} hint={nextHint} />
    </SectionCard>
  );
}

function ContentPlaybackSection({
  expanded, onToggle, onActivate,
  onNext, nextDisabled, nextHint,
  playbackItems = [],
}) {
  const [open, setOpen] = useState(true);
  const [items, setItems] = useState(playbackItems);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  // Re-sync from props when the selection (set of IDs) changes — but keep
  // the user's reordering if the same items are still there.
  useEffect(() => {
    const sameSet =
      items.length === playbackItems.length &&
      items.every((it) => playbackItems.some((p) => p.id === it.id));
    if (!sameSet) setItems(playbackItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbackItems]);

  const moveItem = (from, to) => {
    if (from === to) return;
    setItems((arr) => {
      const next = [...arr];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const onDragStart = (e, idx) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    // Firefox requires data to actually start a drag
    try { e.dataTransfer.setData('text/plain', String(idx)); } catch {}
  };
  const onDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (idx !== overIdx) setOverIdx(idx);
  };
  const onDrop = (e, idx) => {
    e.preventDefault();
    if (draggedIdx !== null) moveItem(draggedIdx, idx);
    setDraggedIdx(null);
    setOverIdx(null);
  };
  const onDragEnd = () => {
    setDraggedIdx(null);
    setOverIdx(null);
  };

  return (
    <SectionCard title="Content Playback" expanded={expanded} onToggle={() => { onToggle(); onActivate(); }}>
      <SubHeader
        icon={Play}
        title="Content Playback"
        helper="Arrange the order in which your selected creatives will play during the ad slot. Drag rows to reorder."
      />
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <Monitor size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-900">Dynamic Digital Display</span>
            <span className="text-xs text-gray-400">{items.length} creatives</span>
          </div>
          {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </button>

        {open && (
          items.length === 0 ? (
            <div className="border-t border-gray-100 px-4 py-10 text-center">
              <div className="text-sm text-gray-500 font-medium">No creatives selected yet.</div>
              <div className="text-xs text-gray-400 mt-1">
                Pick content in the section above to arrange playback order here.
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-100 divide-y divide-gray-100">
              {items.map((item, idx) => {
                const isDragged = draggedIdx === idx;
                const isOver = overIdx === idx && draggedIdx !== null && draggedIdx !== idx;
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, idx)}
                    onDragOver={(e) => onDragOver(e, idx)}
                    onDrop={(e) => onDrop(e, idx)}
                    onDragEnd={onDragEnd}
                    className={`flex items-center gap-3 px-4 py-3 text-sm cursor-move select-none transition ${
                      isDragged
                        ? 'opacity-40'
                        : isOver
                        ? 'bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    style={isOver ? { boxShadow: `inset 0 2px 0 ${NAVY}` } : undefined}
                  >
                    <GripVertical size={14} className="text-gray-400 shrink-0" />
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                      style={{ backgroundColor: NAVY }}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-gray-900 truncate">{item.name}</span>
                    <span className="ml-auto text-xs text-gray-400 shrink-0">{item.duration}</span>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
      <NextButton onClick={onNext} disabled={nextDisabled} hint={nextHint} />
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  STEP 3 — Overview + Billboard Review                                       */
/* -------------------------------------------------------------------------- */

function OverviewField({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1.5">{label}</div>
      <div className="text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function OverviewSection({ expanded, onToggle, onActivate, scheduleName, brand }) {
  return (
    <SectionCard title="Overview" expanded={expanded} onToggle={() => { onToggle(); onActivate(); }}>
      <SubHeader
        icon={FileText}
        title="Schedule Overview"
        helper="Review your scheduled details and confirm pricing before submitting."
      />
      <div className="grid grid-cols-5 gap-y-6 gap-x-6">
        <OverviewField label="Billboard"      value="Main Street NB" />
        <OverviewField label="Schedule Name"  value={scheduleName || 'Nike Summer Promo'} />
        <OverviewField label="Brand"          value={brand || 'Nike India'} />
        <OverviewField label="Boards"         value="Main Street NB" />
        <OverviewField label="Schedule Type"  value="Fixed" />

        <OverviewField label="Start Date"     value="Dec 13, 2024, 02:47" />
        <OverviewField label="End Date"       value="Dec 13, 2024, 02:47" />
        <OverviewField label="Slot Duration"  value="10:00 AM - 12:00 PM daily" />
        <OverviewField label="Slot Total"     value="200 hrs" />
      </div>
    </SectionCard>
  );
}

function Pair({ label, value, valueBold }) {
  return (
    <div className="flex flex-col">
      <span className="text-gray-500">{label}</span>
      <span className={`text-gray-900 mt-0.5 ${valueBold ? 'font-bold' : 'font-medium'}`}>{value}</span>
    </div>
  );
}

function BillboardCard({ b }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <img
        src={`https://picsum.photos/seed/${b.seed}/600/240`}
        alt={b.name}
        className="w-full aspect-[16/6] object-cover bg-gray-100"
      />
      <div className="p-4">
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="text-sm font-semibold text-gray-900">{b.name}</div>
          <StatusPill status={b.status} />
        </div>
        <div className="text-xs text-gray-500 mb-4">Slot Duration: {b.slotDuration}</div>

        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs mb-3">
          <Pair label="Slot Type" value={b.slotType} />
          <Pair label="Chargeable Time" value={`${b.chargeable} hrs`} />
          <Pair label="Wallet Used" value={b.wallet} />
          <Pair label="Rate" value={`$${b.rate}/hr`} />
          <Pair label="Total" value={`$${b.total.toLocaleString()}`} valueBold />
          <a className="text-[#2563EB] hover:underline cursor-pointer self-end">View Details</a>
        </div>

        <div className="rounded-md px-3 py-2.5 text-[11px] leading-relaxed" style={{ backgroundColor: LAV_BG, color: NAVY }}>
          Base hours: {b.baseHours} hrs &nbsp;-&nbsp; Slot hours excluded: {b.excluded} hrs &nbsp;=&nbsp; Chargeable hours: {b.chargeable} hrs
          <div className="font-semibold mt-1">
            {b.chargeable} hrs × ${b.rate}/hr = ${b.total.toLocaleString()} USD
          </div>
        </div>
      </div>
    </div>
  );
}

function BillboardReviewSection({ expanded, onToggle, onActivate, billboards }) {
  return (
    <SectionCard title="Billboard Review" expanded={expanded} onToggle={() => { onToggle(); onActivate(); }}>
      <SubHeader
        icon={Monitor}
        title="Billboard List"
        helper="Generated from the billboards and time blocks you picked. Pricing is calculated per board."
      />
      <div className="text-sm text-gray-700 mb-4">
        Billboards Found: <span className="font-semibold">{billboards.length}</span>
      </div>
      {billboards.length === 0 ? (
        <div className="text-sm text-gray-400 py-10 text-center border border-dashed border-gray-200 rounded-lg">
          No billboards selected. Pick screens in Step 1 to see them here.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {billboards.map((b) => (
            <BillboardCard key={b.id} b={b} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  Success screen (after Confirm & Submit)                                    */
/* -------------------------------------------------------------------------- */

function SuccessScreen({ scheduleName, suggestedPrice, boardCount }) {
  const [show, setShow] = useState(false);
  // Trigger the scale-in transition right after mount.
  useMemo(() => {
    const id = setTimeout(() => setShow(true), 30);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center text-center py-24">
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${
          show ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
        style={{ backgroundColor: '#DCFCE7' }}
      >
        <CheckCircle2 size={42} className="text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule created successfully</h2>
      <p className="text-sm text-gray-600 max-w-md">
        “{scheduleName || 'Untitled Schedule'}” has been queued across{' '}
        <span className="font-semibold">{boardCount} billboard{boardCount === 1 ? '' : 's'}</span> for an estimated{' '}
        <span className="font-semibold" style={{ color: NAVY }}>${suggestedPrice.toLocaleString()} USD</span>.
      </p>
      <p className="text-xs text-gray-400 mt-4">Taking you back to the dashboard…</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main page                                                                  */
/* -------------------------------------------------------------------------- */

export default function CreateSchedule() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1 form state
  const [scheduleName, setScheduleName] = useState('');
  const [brand, setBrand] = useState('');
  const [selectedScreens, setSelectedScreens] = useState(new Set());
  const [scheduleType, setScheduleType] = useState('custom');
  // Defaults to a future range so validation doesn't trip on first load.
  const [startDate, setStartDate] = useState('24/6/2026');
  const [endDate, setEndDate] = useState('26/6/2026');
  const [startImmediately, setStartImmediately] = useState(false);
  const [selectedDays, setSelectedDays] = useState(new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']));

  // Custom mode keeps a flat list applied to the whole date range.
  const [customSlots, setCustomSlots] = useState([
    { id: 1, start: '10:00:05 AM', end: '10:00:45 AM' },
    { id: 2, start: '11:00:05 AM', end: '12:00:45 PM' },
    { id: 3, start: '10:00:05 AM', end: '10:00:45 AM' },
  ]);

  // Weekly mode keeps slots scoped to a specific day-of-week.
  const [weeklySlots, setWeeklySlots] = useState([
    { id: 11, day: 'Mon', start: '09:00:00 AM', end: '10:30:00 AM' },
    { id: 12, day: 'Mon', start: '02:00:00 PM', end: '03:30:00 PM' },
    { id: 13, day: 'Wed', start: '11:00:00 AM', end: '12:30:00 PM' },
    { id: 14, day: 'Fri', start: '04:00:00 PM', end: '05:30:00 PM' },
  ]);

  const activeSlots = scheduleType === 'custom' ? customSlots : weeklySlots;

  // Step 2 form state
  const [layout, setLayout] = useState('fullscreen');
  const [contentSource, setContentSource] = useState('upload');
  const [selectedTemplates, setSelectedTemplates] = useState(new Set());
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const toggleTemplate = (id) =>
    setSelectedTemplates((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const removeUploadedFile = (id) =>
    setUploadedFiles((arr) => arr.filter((f) => f.id !== id));
  const simulateUpload = () => {
    // Prototype: pretend to pick a file and add it to the list.
    const id = Date.now();
    const sampleNames = [
      ['hero-animation.mp4', '12.4 MB'],
      ['promo-poster.png',   '2.1 MB'],
      ['cta-banner.jpg',     '880 KB'],
      ['intro-loop.mp4',     '8.6 MB'],
    ];
    const pick = sampleNames[uploadedFiles.length % sampleNames.length];
    setUploadedFiles((arr) => [
      ...arr,
      { id, name: pick[0], size: pick[1], seed: `up-${id}` },
    ]);
  };

  // Section expanded states (main content)
  const [scheduleConfigOpen, setScheduleConfigOpen] = useState(true);
  const [slotConfigOpen, setSlotConfigOpen] = useState(false);
  const [layoutOpen, setLayoutOpen] = useState(true);
  const [contentOpen, setContentOpen] = useState(false);
  const [playbackOpen, setPlaybackOpen] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [billboardOpen, setBillboardOpen] = useState(true);

  // Active subsection (drives sidebar highlight)
  const [activeSubsection, setActiveSubsection] = useState('campaign-setup');

  // Sidebar collapse state
  const [openSections, setOpenSections] = useState(
    new Set(['schedule-config', 'slot-config'])
  );
  const toggleSection = (key) =>
    setOpenSections((s) => {
      const next = new Set(s);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  /* -------- Validation -------- */

  const parsedStart = useMemo(() => parseDateDMY(startDate), [startDate]);
  const parsedEnd = useMemo(() => parseDateDMY(endDate), [endDate]);

  const startError = useMemo(() => {
    if (startImmediately) return null;
    if (!startDate) return null;
    if (!parsedStart) return 'Use DD/MM/YYYY format.';
    if (parsedStart < TODAY) return 'Start time must be in the future.';
    return null;
  }, [startDate, parsedStart, startImmediately]);

  const endError = useMemo(() => {
    if (!endDate) return null;
    if (!parsedEnd) return 'Use DD/MM/YYYY format.';
    if (parsedStart && parsedEnd <= parsedStart) return 'End time must be after start time.';
    if (parsedEnd > MAX_END) return 'Campaign cannot run for more than 2 years.';
    return null;
  }, [endDate, parsedEnd, parsedStart]);

  // Per-input format errors + a row-level duration error so the UI can
  // highlight only the offending field instead of flagging both.
  const slotErrors = useMemo(() => {
    const out = {};
    activeSlots.forEach((s) => {
      const a = parseTime(s.start);
      const b = parseTime(s.end);
      const entry = { start: null, end: null, duration: null };
      if (s.start && a == null) entry.start = 'Use 12-hour format (e.g. 10:00 AM).';
      if (s.end && b == null) entry.end = 'Use 12-hour format (e.g. 10:00 AM).';
      if (a != null && b != null) {
        const diff = b - a;
        if (diff <= 0) entry.duration = 'End time must be after start time.';
        else if (diff < 10) entry.duration = 'Minimum slot duration is 10 seconds.';
      }
      out[s.id] = entry;
    });
    return out;
  }, [activeSlots]);

  /* -------- Handlers -------- */

  const toggleScreen = (id) =>
    setSelectedScreens((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const removeScreen = (id) =>
    setSelectedScreens((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });

  const toggleDay = (d) =>
    setSelectedDays((s) => {
      const next = new Set(s);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });

  // Custom-mode handlers (flat list)
  const addCustomSlot = () =>
    setCustomSlots((arr) => [
      ...arr,
      { id: Date.now(), start: '12:00:00 PM', end: '12:30:00 PM' },
    ]);
  const removeCustomSlot = (id) =>
    setCustomSlots((arr) => arr.filter((s) => s.id !== id));
  const updateCustomSlot = (id, patch) =>
    setCustomSlots((arr) => arr.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  // Weekly-mode handlers (per-day)
  const addWeeklySlot = (day) =>
    setWeeklySlots((arr) => [
      ...arr,
      { id: Date.now(), day, start: '10:00:00 AM', end: '11:00:00 AM' },
    ]);
  const removeWeeklySlot = (id) =>
    setWeeklySlots((arr) => arr.filter((s) => s.id !== id));
  const updateWeeklySlot = (id, patch) =>
    setWeeklySlots((arr) => arr.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  // Was the form submitted? Drives the success screen + redirect.
  const [submitted, setSubmitted] = useState(false);

  /* -------- Derived billboards for Step 3 -------- */

  const billboards = useMemo(() => {
    const chosen = SCREEN_LIBRARY.filter((s) => selectedScreens.has(s.id));
    const firstSlot = activeSlots[0];
    const slotDuration = firstSlot
      ? `${firstSlot.start} - ${firstSlot.end}${scheduleType === 'weekly' ? ` · ${selectedDays.size} days/week` : ' daily'}`
      : '10:00 AM - 12:00 PM daily';
    const chargeable = Math.max(activeSlots.length * 60, 60);

    return chosen.map((s, idx) => {
      const rate = Math.max(Math.round(s.price / 12), 10);
      const total = chargeable * rate;
      return {
        id: s.id,
        name: scheduleName || s.name,
        status: idx === chosen.length - 1 && chosen.length > 1 ? 'Paused' : 'Active',
        slotDuration,
        slotType: scheduleType === 'custom' ? 'Fixed' : 'Recurring',
        chargeable,
        wallet: `${brand || 'Open'} – National Budget`,
        rate,
        total,
        baseHours: chargeable,
        excluded: idx % 2 === 0 ? 20 : 0,
        seed: s.seed,
      };
    });
  }, [selectedScreens, activeSlots, scheduleName, brand, scheduleType, selectedDays]);

  const suggestedPrice = useMemo(
    () => billboards.reduce((sum, b) => sum + b.total, 0),
    [billboards]
  );

  /* -------- Playback items derived from Content Selection -------- */

  const playbackItems = useMemo(() => {
    const makeDuration = (i) => `${(i + 1) * 5}s`;
    if (contentSource === 'upload') {
      return uploadedFiles.map((f, i) => ({
        id: `up-${f.id}`,
        name: f.name,
        duration: makeDuration(i),
        seed: f.seed,
      }));
    }
    if (contentSource === 'templates') {
      return TEMPLATE_LIBRARY.filter((t) => selectedTemplates.has(t.id)).map((t, i) => ({
        id: `tmpl-${t.id}`,
        name: t.name,
        duration: makeDuration(i),
        seed: t.seed,
      }));
    }
    if (contentSource === 'previously' && selectedBundle) {
      const bundle = PREVIOUS_BUNDLES.find((b) => b.id === selectedBundle);
      if (!bundle) return [];
      return (bundle.items || []).map((name, i) => ({
        id: `bnd-${bundle.id}-${i}`,
        name,
        duration: makeDuration(i),
        seed: `bnd-${bundle.id}-${i}`,
      }));
    }
    return [];
  }, [contentSource, uploadedFiles, selectedTemplates, selectedBundle]);

  /* -------- Step completion -------- */

  const section1ScheduleComplete =
    scheduleName.trim().length > 0 && brand.length > 0 && selectedScreens.size > 0;

  const section1SlotComplete = useMemo(() => {
    if (!startImmediately && startError) return false;
    if (endError) return false;
    if (scheduleType === 'weekly' && selectedDays.size === 0) return false;
    if (activeSlots.length === 0) return false;
    const anySlotInvalid = Object.values(slotErrors).some(
      (e) => e && (e.start || e.end || e.duration)
    );
    return !anySlotInvalid;
  }, [startImmediately, startError, endError, scheduleType, selectedDays, activeSlots, slotErrors]);

  const step1Complete = section1ScheduleComplete && section1SlotComplete;

  const section2ContentComplete = (() => {
    if (contentSource === 'upload') return uploadedFiles.length > 0;
    if (contentSource === 'templates') return selectedTemplates.size > 0;
    if (contentSource === 'previously') return selectedBundle != null;
    return false;
  })();

  const step2Complete = Boolean(layout) && section2ContentComplete;

  const canGoToStep = (n) => {
    if (n <= 1) return true;
    if (n === 2) return step1Complete;
    if (n === 3) return step1Complete && step2Complete;
    return false;
  };

  const stepCompletion = { 1: step1Complete, 2: step2Complete, 3: false };

  /* -------- Navigation -------- */

  const jumpTo = (newStep, subsection) => {
    if (!canGoToStep(newStep)) return; // guard: locked steps
    setStep(newStep);
    if (subsection) setActiveSubsection(subsection);
    // open the relevant content section so the user lands on it
    if (subsection === 'campaign-setup') setScheduleConfigOpen(true);
    if (subsection === 'time-frequency') setSlotConfigOpen(true);
    if (subsection === 'layout') setLayoutOpen(true);
    if (subsection === 'content') setContentOpen(true);
    if (subsection === 'overview') setOverviewOpen(true);
    if (subsection === 'billboard') setBillboardOpen(true);
  };

  const handleStepChange = (n) => {
    if (!canGoToStep(n)) return;
    setStep(n);
  };

  // Build a Dashboard-shaped record from the form state.
  const buildNewSchedule = () => {
    const formatDate = (dmy) => {
      const d = parseDateDMY(dmy);
      return d
        ? d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        : dmy;
    };

    // Snapshot the content selection so the drawer can show it later.
    const firstItem = playbackItems[0];
    const totalSeconds = playbackItems.reduce(
      (sum, p) => sum + (parseInt(p.duration, 10) || 0),
      0
    );
    const resolution = layout === 'banner' ? '1280×400' : '1920×1080';
    const content = firstItem
      ? {
          title: scheduleName ? `${scheduleName} — ${firstItem.name}` : firstItem.name,
          contentId: deriveContentId(firstItem.id),
          imageSeed: firstItem.seed,
          mediaType: playbackItems.length > 1 && playbackItems.some((p) => inferMediaType(p.name) !== inferMediaType(firstItem.name))
            ? 'Mixed'
            : inferMediaType(firstItem.name),
          duration: totalSeconds > 0 ? `${totalSeconds} seconds` : '—',
          resolution,
          lastUpdatedDate: 'May 29, 2026',
          lastUpdatedTime: '14:00',
        }
      : null;

    return {
      id: `sched-${Date.now()}`,
      name: scheduleName || 'New Schedule',
      brand: brand || 'Open',
      owner: 'Ruth Price',
      type: scheduleType === 'custom' ? 'Fixed Slot' : 'Recurring',
      status: 'Upcoming',
      startDate: startImmediately ? 'Today' : formatDate(startDate),
      endDate: formatDate(endDate),
      content,
    };
  };

  const handleConfirm = () => {
    if (!step1Complete || !step2Complete) return;
    setSubmitted(true);
    const newSchedule = buildNewSchedule();
    // Brief delay so the success screen registers, then navigate.
    window.setTimeout(() => {
      navigate('/dashboard', {
        state: { newSchedule, justCreated: true },
        replace: true,
      });
    }, 1600);
  };

  const title = scheduleName.trim() || 'Untitled 1';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PageHeader
        title={title}
        onBack={() => navigate('/dashboard')}
        onDiscard={() => navigate('/dashboard')}
      />
      <Stepper
        step={step}
        onStepChange={handleStepChange}
        canGoToStep={canGoToStep}
        stepCompletion={stepCompletion}
      />

      <div className="flex flex-1">
        <SummarySidebar
          scheduleName={scheduleName}
          brand={brand}
          selectedScreenIds={selectedScreens}
          scheduleType={scheduleType}
          layout={layout}
          contentSource={contentSource}
          suggestedPrice={suggestedPrice}
          activeSubsection={activeSubsection}
          openSections={openSections}
          toggleSection={toggleSection}
          onJumpTo={jumpTo}
          canGoToStep={canGoToStep}
        />

        <div className="flex-1 px-8 py-6 space-y-5" style={{ backgroundColor: SUB_BG }}>
          {step === 1 && (
            <>
              <ScheduleConfigSection
                expanded={scheduleConfigOpen}
                onToggle={() => setScheduleConfigOpen((v) => !v)}
                onActivate={() => setActiveSubsection('campaign-setup')}
                scheduleName={scheduleName}
                setScheduleName={setScheduleName}
                brand={brand}
                setBrand={setBrand}
                selectedScreens={selectedScreens}
                toggleScreen={toggleScreen}
                removeScreen={removeScreen}
                nextDisabled={!section1ScheduleComplete}
                nextHint={
                  !scheduleName.trim()
                    ? 'Add a schedule name to continue.'
                    : !brand
                    ? 'Pick a brand to continue.'
                    : selectedScreens.size === 0
                    ? 'Select at least one screen.'
                    : null
                }
                onNext={() => {
                  setScheduleConfigOpen(false);
                  setSlotConfigOpen(true);
                  setActiveSubsection('time-frequency');
                }}
              />
              <SlotConfigSection
                expanded={slotConfigOpen}
                onToggle={() => setSlotConfigOpen((v) => !v)}
                onActivate={() => setActiveSubsection('time-frequency')}
                scheduleType={scheduleType}
                setScheduleType={setScheduleType}
                startDate={startDate}
                setStartDate={setStartDate}
                startError={startError}
                endDate={endDate}
                setEndDate={setEndDate}
                endError={endError}
                startImmediately={startImmediately}
                setStartImmediately={setStartImmediately}
                selectedDays={selectedDays}
                toggleDay={toggleDay}
                customSlots={customSlots}
                addCustomSlot={addCustomSlot}
                removeCustomSlot={removeCustomSlot}
                updateCustomSlot={updateCustomSlot}
                weeklySlots={weeklySlots}
                addWeeklySlot={addWeeklySlot}
                removeWeeklySlot={removeWeeklySlot}
                updateWeeklySlot={updateWeeklySlot}
                slotErrors={slotErrors}
                nextDisabled={!step1Complete}
                nextHint={
                  !section1ScheduleComplete
                    ? 'Finish the Campaign Setup above first.'
                    : startError || endError
                    ? 'Fix the date errors to continue.'
                    : scheduleType === 'weekly' && selectedDays.size === 0
                    ? 'Pick at least one day of the week.'
                    : activeSlots.length === 0
                    ? scheduleType === 'weekly'
                      ? 'Add at least one slot per day.'
                      : 'Add at least one time block.'
                    : 'Fix the highlighted slot errors.'
                }
                onNext={() => {
                  if (!step1Complete) return;
                  setStep(2);
                  setActiveSubsection('layout');
                }}
              />
            </>
          )}

          {step === 2 && (
            <>
              <LayoutSelectionSection
                expanded={layoutOpen}
                onToggle={() => setLayoutOpen((v) => !v)}
                onActivate={() => setActiveSubsection('layout')}
                layout={layout}
                setLayout={setLayout}
                onNext={() => {
                  setLayoutOpen(false);
                  setContentOpen(true);
                  setActiveSubsection('content');
                }}
              />
              <ContentSelectionSection
                expanded={contentOpen}
                onToggle={() => setContentOpen((v) => !v)}
                onActivate={() => setActiveSubsection('content')}
                contentSource={contentSource}
                setContentSource={setContentSource}
                selectedTemplates={selectedTemplates}
                toggleTemplate={toggleTemplate}
                selectedBundle={selectedBundle}
                setSelectedBundle={setSelectedBundle}
                uploadedFiles={uploadedFiles}
                removeUploadedFile={removeUploadedFile}
                simulateUpload={simulateUpload}
                nextDisabled={!section2ContentComplete}
                nextHint={
                  contentSource === 'upload'
                    ? 'Upload at least one file.'
                    : contentSource === 'templates'
                    ? 'Pick at least one template.'
                    : 'Pick a previously scheduled bundle.'
                }
                onNext={() => {
                  setContentOpen(false);
                  setPlaybackOpen(true);
                  setActiveSubsection('content');
                }}
              />
              <ContentPlaybackSection
                expanded={playbackOpen}
                onToggle={() => setPlaybackOpen((v) => !v)}
                onActivate={() => setActiveSubsection('content')}
                playbackItems={playbackItems}
                nextDisabled={!step2Complete}
                nextHint={!section2ContentComplete ? 'Finish Content Selection above first.' : null}
                onNext={() => {
                  if (!step2Complete) return;
                  setStep(3);
                  setActiveSubsection('overview');
                }}
              />
            </>
          )}

          {step === 3 && !submitted && (
            <>
              <OverviewSection
                expanded={overviewOpen}
                onToggle={() => setOverviewOpen((v) => !v)}
                onActivate={() => setActiveSubsection('overview')}
                scheduleName={scheduleName}
                brand={brand}
              />
              <BillboardReviewSection
                expanded={billboardOpen}
                onToggle={() => setBillboardOpen((v) => !v)}
                onActivate={() => setActiveSubsection('billboard')}
                billboards={billboards}
              />
              <div className="flex justify-end items-baseline gap-3 pt-4 pb-2">
                <span className="text-sm text-gray-500">Suggested Price</span>
                <span className="text-3xl font-bold" style={{ color: NAVY }}>
                  ${suggestedPrice.toLocaleString()} USD
                </span>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleConfirm}
                  className="inline-flex items-center gap-2 text-white text-sm font-medium px-5 py-2.5 rounded-md hover:opacity-90"
                  style={{ backgroundColor: NAVY }}
                >
                  <CheckCircle2 size={14} />
                  Confirm &amp; Submit
                </button>
              </div>
            </>
          )}

          {step === 3 && submitted && (
            <SuccessScreen
              scheduleName={scheduleName}
              suggestedPrice={suggestedPrice}
              boardCount={billboards.length}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Shared exports — used by EditSchedule (and any future flows)               */
/* -------------------------------------------------------------------------- */

export {
  NAVY,
  LAV_HEADER,
  LAV_BG,
  SUB_BG,
  TODAY,
  MAX_END,
  SCREEN_LIBRARY,
  BRAND_OPTIONS,
  WEEK_DAYS,
  DAY_FULL,
  TEMPLATE_LIBRARY,
  PREVIOUS_BUNDLES,
  parseDateDMY,
  parseTime,
  inferMediaType,
  deriveContentId,
  bundleItemCount,
  SectionCard,
  SubHeader,
  Label,
  TextInput,
  SelectInput,
  DateInput,
  RadioCard,
  NextButton,
  PageHeader,
  Stepper,
  SidebarSection,
  SidebarAnchor,
  SidebarRow,
  SidebarList,
  SummarySidebar,
  SlotRow,
  CustomSlotsPanel,
  WeeklySlotsPanel,
  SlotConfigSection,
  LayoutPreview,
  LayoutSelectionSection,
  TemplateCard,
  BundleRow,
  EmptyResults,
  ContentSelectionSection,
  ContentPlaybackSection,
  OverviewField,
  OverviewSection,
  Pair,
  BillboardCard,
  BillboardReviewSection,
  SuccessScreen,
};
