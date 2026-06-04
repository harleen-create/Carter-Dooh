import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';
import {
  NAVY,
  LAV_BG,
  SUB_BG,
  SCREEN_LIBRARY,
  BRAND_OPTIONS,
  LAYOUT_LABELS,
  zonesForLayout,
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
  ScreenSelector,
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
  const [draftBrand, setDraftBrand] = useState('');
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

      <ScreenSelector
        selectedScreens={selectedScreens}
        toggleScreen={toggleScreen}
        removeScreen={removeScreen}
      />

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

  const [layout, setLayoutRaw] = useState('quadrant');
  const [contentSource, setContentSource] = useState('upload');
  const [selectedTemplates, setSelectedTemplates] = useState(new Set());
  const [selectedBundle, setSelectedBundle] = useState(null);
  // Pre-populated per-zone files so the Quadrant layout has all four zones
  // filled with sample creatives.
  const [zoneFiles, setZoneFiles] = useState({
    q1: [{ id: 11, name: 'Hero animation.mp4',  size: '12.4 MB', seed: 'edit-q1-hero' }],
    q2: [{ id: 12, name: 'Discount overlay.png', size: '2.1 MB',  seed: 'edit-q2-overlay' }],
    q3: [{ id: 13, name: 'Call to action.jpg',  size: '880 KB',  seed: 'edit-q3-cta' }],
    q4: [{ id: 14, name: 'Endcard loop.mp4',    size: '5.2 MB',  seed: 'edit-q4-endcard' }],
  });
  const [zonePlaybackOrder, setZonePlaybackOrder] = useState({});
  const [pendingLayout, setPendingLayout] = useState(null);

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

  // Per-zone file handlers
  const ED_SAMPLE_FILES = [
    ['extra-promo.mp4', '6.2 MB'],
    ['banner-cta.png',  '1.4 MB'],
    ['intro-loop.mp4',  '8.6 MB'],
  ];
  const addFileToZone = (zoneId) => {
    setZoneFiles((prev) => {
      const cur = prev[zoneId] || [];
      const id = Date.now();
      const pick = ED_SAMPLE_FILES[cur.length % ED_SAMPLE_FILES.length];
      return {
        ...prev,
        [zoneId]: [...cur, { id, name: pick[0], size: pick[1], seed: `ez-${zoneId}-${id}` }],
      };
    });
  };
  const removeFileFromZone = (zoneId, fileId) => {
    setZoneFiles((prev) => ({
      ...prev,
      [zoneId]: (prev[zoneId] || []).filter((f) => f.id !== fileId),
    }));
  };
  const copyZoneContent = (fromZoneId, toZoneId) => {
    setZoneFiles((prev) => {
      const src = prev[fromZoneId] || [];
      const cloned = src.map((f, i) => ({
        ...f,
        id: Date.now() + i,
        seed: `ez-${toZoneId}-${Date.now() + i}`,
      }));
      return { ...prev, [toZoneId]: cloned };
    });
  };
  const reorderZoneItems = (zoneId, fromIdx, toIdx) => {
    setZonePlaybackOrder((prev) => {
      const current = prev[zoneId] || (zoneFiles[zoneId] || []).map((f) => f.id);
      const next = [...current];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return { ...prev, [zoneId]: next };
    });
  };

  // Layout change with confirmation
  const setLayout = (newLayout) => {
    if (newLayout === layout) return;
    const hasContent = Object.values(zoneFiles).some((arr) => arr.length > 0);
    if (hasContent) setPendingLayout(newLayout);
    else setLayoutRaw(newLayout);
  };
  const confirmLayoutChange = () => {
    setLayoutRaw(pendingLayout);
    setZoneFiles({});
    setZonePlaybackOrder({});
    setPendingLayout(null);
  };
  const cancelLayoutChange = () => setPendingLayout(null);

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

  /* -------- Per-zone playback items derived from Content Selection -------- */
  const zonePlaybackItems = useMemo(() => {
    const zones = zonesForLayout(layout);
    const makeDuration = (i) => `${(i + 1) * 5}s`;
    const out = {};
    zones.forEach((z) => {
      let items;
      if (contentSource === 'upload') {
        items = (zoneFiles[z.id] || []).map((f, i) => ({
          id: `zf-${z.id}-${f.id}`,
          name: f.name,
          duration: makeDuration(i),
          seed: f.seed,
        }));
      } else {
        items = [];
      }
      const order = zonePlaybackOrder[z.id];
      if (order && order.length) {
        const byId = Object.fromEntries(items.map((it) => [it.id, it]));
        const reordered = order.map((id) => byId[id]).filter(Boolean);
        const leftovers = items.filter((it) => !order.includes(it.id));
        out[z.id] = [...reordered, ...leftovers];
      } else {
        out[z.id] = items;
      }
    });
    return out;
  }, [layout, contentSource, zoneFiles, zonePlaybackOrder]);

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
                layout={layout}
                contentSource={contentSource}
                setContentSource={setContentSource}
                selectedTemplates={selectedTemplates}
                toggleTemplate={toggleTemplate}
                selectedBundle={selectedBundle}
                setSelectedBundle={setSelectedBundle}
                zoneFiles={zoneFiles}
                addFileToZone={addFileToZone}
                removeFileFromZone={removeFileFromZone}
                copyZoneContent={copyZoneContent}
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
                layout={layout}
                zonePlaybackItems={zonePlaybackItems}
                reorderZoneItems={reorderZoneItems}
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

      {/* Layout change confirmation */}
      {pendingLayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={cancelLayoutChange} />
          <div className="relative bg-white rounded-xl shadow-2xl w-[440px] p-6">
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#FEF3C7' }}
              >
                <AlertTriangle size={18} className="text-amber-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Change layout to {LAYOUT_LABELS[pendingLayout]}?
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Changing the layout will reset your content selections. Uploads
                  in every zone will be cleared.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={cancelLayoutChange}
                className="text-sm font-medium px-4 py-2 rounded-md text-gray-700 border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmLayoutChange}
                className="text-sm font-medium px-4 py-2 rounded-md text-white hover:opacity-90"
                style={{ backgroundColor: NAVY }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
