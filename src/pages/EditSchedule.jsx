import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  AlertTriangle,
  Search,
  Trash2,
  ClipboardList,
} from 'lucide-react';
import {
  NAVY,
  LAV_BG,
  SUB_BG,
  SCREEN_LIBRARY,
  BRAND_OPTIONS,
  parseDateDMY,
  parseTime,
  PageHeader,
  Stepper,
  SectionCard,
  SubHeader,
  Label,
  TextInput,
  SelectInput,
  NextButton,
  SummarySidebar,
  SlotConfigSection,
  LayoutSelectionSection,
  ContentSelectionSection,
  ContentPlaybackSection,
  OverviewSection,
  BillboardReviewSection,
} from './CreateSchedule';

/* -------------------------------------------------------------------------- */
/*  Discard confirmation modal                                                 */
/* -------------------------------------------------------------------------- */

function DiscardModal({ open, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-2xl w-[420px] p-6">
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#FEF3C7' }}
          >
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Discard your changes?
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Any unsaved edits to this schedule will be lost. This action can't be undone.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="text-sm font-medium px-4 py-2 rounded-md text-gray-700 border border-gray-200 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="text-sm font-medium px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Edit-specific Schedule Configuration (multi-brand chips)                   */
/* -------------------------------------------------------------------------- */

function EditScheduleConfigSection({
  expanded, onToggle, onActivate,
  scheduleName, setScheduleName,
  brands, addBrand, removeBrand,
  selectedScreens, toggleScreen, removeScreen,
  onNext,
}) {
  const [search, setSearch] = useState('');
  const [draftBrand, setDraftBrand] = useState('');

  const filtered = SCREEN_LIBRARY.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.id.includes(q) ||
      s.location.toLowerCase().includes(q)
    );
  });

  const availableBrands = BRAND_OPTIONS.filter((b) => !brands.includes(b));

  const handleAddBrand = (b) => {
    if (!b) return;
    addBrand(b);
    setDraftBrand('');
  };

  return (
    <SectionCard
      title="Schedule Configuration"
      expanded={expanded}
      onToggle={() => { onToggle(); onActivate(); }}
    >
      <SubHeader
        icon={ClipboardList}
        title="Campaign Setup"
        helper="Update the campaign information: brands, billboards, and schedule name. Changes apply to all live and upcoming slots."
      />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <Label>Schedule Name</Label>
          <TextInput
            value={scheduleName}
            onChange={setScheduleName}
            placeholder="Enter a name for schedule"
          />
        </div>
        <div>
          <Label info>Brand</Label>
          {brands.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {brands.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md"
                  style={{ backgroundColor: LAV_BG, color: NAVY }}
                >
                  {b}
                  <button
                    onClick={() => removeBrand(b)}
                    className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-[#12297D]/15"
                    aria-label={`Remove ${b}`}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <SelectInput
            value={draftBrand}
            onChange={handleAddBrand}
            placeholder="Select a brand"
            options={availableBrands}
          />
        </div>
      </div>

      <Label required info>Select Screen</Label>

      <div className="grid grid-cols-2 gap-4 mt-2">
        {/* Library */}
        <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col">
          <div
            className="px-4 py-2.5 text-xs font-medium text-gray-600"
            style={{ backgroundColor: SUB_BG }}
          >
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
                      <div className="text-[11px] text-[#12297D] font-medium">
                        Screen ID: {s.id}
                      </div>
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {s.name}
                      </div>
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
        <div
          className="border border-gray-200 rounded-lg overflow-hidden flex flex-col"
          style={{ backgroundColor: SUB_BG }}
        >
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
                <div
                  key={s.id}
                  className="flex items-center gap-3 bg-white border border-gray-200 rounded-md px-3 py-2.5"
                >
                  <img
                    src={`https://picsum.photos/seed/${s.seed}/120/120`}
                    alt={s.name}
                    className="w-12 h-12 rounded-md object-cover bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-[#12297D] font-medium">
                      Screen ID: {s.id}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {s.name}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-gray-900 shrink-0">
                    $ {s.price}/day
                  </div>
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

      <NextButton onClick={onNext} />
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main page                                                                  */
/* -------------------------------------------------------------------------- */

const CAMPAIGN_NAME = 'Nike x SNKRS Drop Launch';

export default function EditSchedule() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [discardOpen, setDiscardOpen] = useState(false);

  /* -------- Pre-populated form state -------- */
  const [scheduleName, setScheduleName] = useState(CAMPAIGN_NAME);
  const [brands, setBrands] = useState(['Nike', 'Brand 2', 'Brand 3']);
  const [selectedScreens, setSelectedScreens] = useState(
    new Set(['23490175', '23490176'])
  );

  const [scheduleType, setScheduleType] = useState('custom');
  const [startDate, setStartDate] = useState('24/5/2025');
  const [endDate, setEndDate] = useState('26/5/2025');
  const [startImmediately, setStartImmediately] = useState(false);
  const [selectedDays, setSelectedDays] = useState(new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']));

  const [customSlots, setCustomSlots] = useState([
    { id: 1, start: '10:00:05 AM', end: '10:00:45 AM' },
    { id: 2, start: '11:00:05 AM', end: '12:00:45 PM' },
    { id: 3, start: '10:00:05 AM', end: '10:00:45 AM' },
  ]);
  const [weeklySlots, setWeeklySlots] = useState([
    { id: 11, day: 'Mon', start: '09:00:00 AM', end: '10:30:00 AM' },
    { id: 12, day: 'Wed', start: '02:00:00 PM', end: '03:30:00 PM' },
  ]);
  const activeSlots = scheduleType === 'custom' ? customSlots : weeklySlots;

  const [layout, setLayout] = useState('quadrant');
  const [contentSource, setContentSource] = useState('upload');
  const [selectedTemplates, setSelectedTemplates] = useState(new Set());
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([
    { id: 1, name: 'Hero animation.mp4',  size: '12.4 MB', seed: 'edit-hero' },
    { id: 2, name: 'Discount overlay.png', size: '2.1 MB',  seed: 'edit-overlay' },
    { id: 3, name: 'Call to action.jpg',  size: '880 KB',  seed: 'edit-cta' },
  ]);

  /* -------- Section open states -------- */
  const [scheduleConfigOpen, setScheduleConfigOpen] = useState(true);
  const [slotConfigOpen, setSlotConfigOpen] = useState(true);
  const [layoutOpen, setLayoutOpen] = useState(true);
  const [contentOpen, setContentOpen] = useState(false);
  const [playbackOpen, setPlaybackOpen] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [billboardOpen, setBillboardOpen] = useState(true);

  const [activeSubsection, setActiveSubsection] = useState('campaign-setup');
  const [openSections, setOpenSections] = useState(
    new Set(['schedule-config', 'slot-config', 'layout-content', 'pricing-review'])
  );
  const toggleSection = (key) =>
    setOpenSections((s) => {
      const next = new Set(s);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

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

  const addBrand = (b) => {
    if (!b) return;
    setBrands((arr) => (arr.includes(b) ? arr : [...arr, b]));
  };
  const removeBrand = (b) => setBrands((arr) => arr.filter((x) => x !== b));

  // Slot handlers
  const addCustomSlot = () =>
    setCustomSlots((arr) => [
      ...arr,
      { id: Date.now(), start: '12:00:00 PM', end: '12:30:00 PM' },
    ]);
  const removeCustomSlot = (id) =>
    setCustomSlots((arr) => arr.filter((s) => s.id !== id));
  const updateCustomSlot = (id, patch) =>
    setCustomSlots((arr) => arr.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const addWeeklySlot = (day) =>
    setWeeklySlots((arr) => [
      ...arr,
      { id: Date.now(), day, start: '10:00:00 AM', end: '11:00:00 AM' },
    ]);
  const removeWeeklySlot = (id) =>
    setWeeklySlots((arr) => arr.filter((s) => s.id !== id));
  const updateWeeklySlot = (id, patch) =>
    setWeeklySlots((arr) => arr.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  // Content handlers
  const toggleTemplate = (id) =>
    setSelectedTemplates((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const removeUploadedFile = (id) =>
    setUploadedFiles((arr) => arr.filter((f) => f.id !== id));
  const simulateUpload = () => {
    const id = Date.now();
    const samples = [
      ['extra-promo.mp4', '6.2 MB'],
      ['banner-cta.png',  '1.4 MB'],
      ['intro-loop.mp4',  '8.6 MB'],
    ];
    const pick = samples[uploadedFiles.length % samples.length];
    setUploadedFiles((arr) => [
      ...arr,
      { id, name: pick[0], size: pick[1], seed: `up-${id}` },
    ]);
  };

  /* -------- Validation (mirrors CreateSchedule, lighter touch) -------- */
  const parsedStart = useMemo(() => parseDateDMY(startDate), [startDate]);
  const parsedEnd = useMemo(() => parseDateDMY(endDate), [endDate]);

  const startError = useMemo(() => {
    if (startImmediately) return null;
    if (!startDate) return null;
    if (!parsedStart) return 'Use DD/MM/YYYY format.';
    return null;
  }, [startDate, parsedStart, startImmediately]);

  const endError = useMemo(() => {
    if (!endDate) return null;
    if (!parsedEnd) return 'Use DD/MM/YYYY format.';
    if (parsedStart && parsedEnd <= parsedStart) return 'End time must be after start time.';
    return null;
  }, [endDate, parsedEnd, parsedStart]);

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

  /* -------- Step 3 derived data -------- */
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
        wallet: `${brands[0] || 'Brand'} – National Budget`,
        rate,
        total,
        baseHours: chargeable,
        excluded: idx % 2 === 0 ? 20 : 0,
        seed: s.seed,
      };
    });
  }, [selectedScreens, activeSlots, scheduleName, brands, scheduleType, selectedDays]);

  // Spec says fixed $21,100 USD; if any screens are deselected the computed
  // sum changes — keep the spec number as the displayed total for parity.
  const suggestedPrice = 21100;

  /* -------- Navigation -------- */
  // Edit mode: free navigation, no validation gates
  const canGoToStep = () => true;
  const stepCompletion = { 1: true, 2: true, 3: true };

  const jumpTo = (newStep, subsection) => {
    setStep(newStep);
    if (subsection) setActiveSubsection(subsection);
    if (subsection === 'campaign-setup') setScheduleConfigOpen(true);
    if (subsection === 'time-frequency') setSlotConfigOpen(true);
    if (subsection === 'layout') setLayoutOpen(true);
    if (subsection === 'content') setContentOpen(true);
    if (subsection === 'overview') setOverviewOpen(true);
    if (subsection === 'billboard') setBillboardOpen(true);
  };

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
    return [];
  }, [contentSource, uploadedFiles]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PageHeader
        title={CAMPAIGN_NAME}
        onBack={() => navigate('/dashboard')}
        onDiscard={() => setDiscardOpen(true)}
        onSubmit={() => navigate('/dashboard')}
        submitLabel="Submit Changes"
        submitEnabled
      />
      <Stepper
        step={step}
        onStepChange={setStep}
        canGoToStep={canGoToStep}
        stepCompletion={stepCompletion}
      />

      <div className="flex flex-1">
        <SummarySidebar
          scheduleName={scheduleName}
          brand={brands}
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
              <EditScheduleConfigSection
                expanded={scheduleConfigOpen}
                onToggle={() => setScheduleConfigOpen((v) => !v)}
                onActivate={() => setActiveSubsection('campaign-setup')}
                scheduleName={scheduleName}
                setScheduleName={setScheduleName}
                brands={brands}
                addBrand={addBrand}
                removeBrand={removeBrand}
                selectedScreens={selectedScreens}
                toggleScreen={toggleScreen}
                removeScreen={removeScreen}
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
                nextDisabled={false}
                onNext={() => {
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
                nextDisabled={false}
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
                nextDisabled={false}
                onNext={() => {
                  setStep(3);
                  setActiveSubsection('overview');
                }}
              />
            </>
          )}

          {step === 3 && (
            <>
              <OverviewSection
                expanded={overviewOpen}
                onToggle={() => setOverviewOpen((v) => !v)}
                onActivate={() => setActiveSubsection('overview')}
                scheduleName="Nike x SNKRS Drop Launch"
                brand="Nike India"
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
            </>
          )}
        </div>
      </div>

      <DiscardModal
        open={discardOpen}
        onCancel={() => setDiscardOpen(false)}
        onConfirm={() => navigate('/dashboard')}
      />
    </div>
  );
}
