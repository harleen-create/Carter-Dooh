import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Check,
  X,
} from 'lucide-react';
import AppShell, { NAVY, SUB_BG } from '../components/AppShell';

/* ----------------------- Field component ----------------------- */
function Field({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1.5">{label}</div>
      <div className="text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}

/* ----------------------- Approve / Reject buttons --------------- */
function DecisionPill({ decision }) {
  if (!decision) return null;
  const styles =
    decision === 'approved'
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-red-50 text-red-700 border-red-200';
  const label = decision === 'approved' ? 'Approved' : 'Rejected';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border ${styles}`}>
      {decision === 'approved' ? <Check size={12} /> : <X size={12} />}
      {label}
    </span>
  );
}

function DecisionButtons({ decision, onChange, size = 'md' }) {
  const base =
    size === 'sm'
      ? 'text-xs px-3 py-1.5'
      : 'text-sm px-3.5 py-1.5';
  if (decision) {
    return (
      <div className="flex items-center gap-2">
        <DecisionPill decision={decision} />
        <button
          onClick={(e) => { e.stopPropagation(); onChange(null); }}
          className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
        >
          Undo
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={(e) => { e.stopPropagation(); onChange('approved'); }}
        className={`${base} rounded-md border border-green-500 text-green-600 hover:bg-green-50 font-medium`}
      >
        Approve
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onChange('rejected'); }}
        className={`${base} rounded-md border border-red-500 text-red-600 hover:bg-red-50 font-medium`}
      >
        Reject
      </button>
    </div>
  );
}

/* ----------------------- Accordion item ----------------------- */
function AccordionItem({
  title,
  defaultOpen = false,
  decision,
  onDecisionChange,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg mb-3 bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-900 flex-1 text-left"
        >
          {open ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
          {title}
        </button>
        <DecisionButtons decision={decision} onChange={onDecisionChange} size="sm" />
      </div>
      {open && <div className="border-t border-gray-100 p-4">{children}</div>}
    </div>
  );
}

/* ============================ Page ============================ */
export default function ApprovalDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data — id used only as a key for demo
  const scheduleDetails = {
    billboard: 'Main Street NB',
    scheduleName: 'Nike Summer Promo',
    brand: 'Nike, India',
    boards: 'Main Street NB',
    scheduleType: 'Fixed',
    startDate: 'Dec 13, 2024 | 02:47',
    endDate: 'Dec 13, 2024 | 02:47',
    slotDuration: '10:00 AM – 12:00 PM daily',
    slotTotal: '200hrs',
  };

  const adItemKeys = ['main', 'a', 'b', 'c'];
  const creativeKeys = ['c1', 'c2'];

  const [adDecisions, setAdDecisions] = useState(
    Object.fromEntries(adItemKeys.map((k) => [k, null]))
  );
  const [creativeDecisions, setCreativeDecisions] = useState(
    Object.fromEntries(creativeKeys.map((k) => [k, null]))
  );

  const setAd = (k, v) => setAdDecisions((s) => ({ ...s, [k]: v }));
  const setCreative = (k, v) => setCreativeDecisions((s) => ({ ...s, [k]: v }));

  const setAllAds = (v) =>
    setAdDecisions(Object.fromEntries(adItemKeys.map((k) => [k, v])));

  const allDecided = useMemo(
    () =>
      Object.values(adDecisions).every(Boolean) &&
      Object.values(creativeDecisions).every(Boolean),
    [adDecisions, creativeDecisions]
  );

  const handleConfirm = () => {
    if (!allDecided) return;
    // For prototype: just go back
    navigate('/dashboard');
  };

  return (
    <AppShell>
      {/* Top header bar of the page */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-[1440px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate(-1)}
              className="mt-1 p-1 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Request Details</h1>
              <div className="text-xs text-gray-500 mt-1">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-[#12297D] hover:underline"
                >
                  Approval Request
                </button>
                <span className="mx-1.5 text-gray-400">›</span>
                <span className="text-gray-600">Back to School Specials</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!allDecided}
              className="text-sm font-medium px-4 py-2 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: NAVY }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 py-6">
        {/* Schedule Details */}
        <section
          className="rounded-xl border border-gray-200 p-6 mb-6"
          style={{ backgroundColor: SUB_BG }}
        >
          <h2 className="text-base font-semibold text-gray-900 mb-5">Schedule Details</h2>
          <div className="grid grid-cols-5 gap-y-6 gap-x-6">
            <Field label="Billboard" value={scheduleDetails.billboard} />
            <Field label="Schedule Name" value={scheduleDetails.scheduleName} />
            <Field label="Brand" value={scheduleDetails.brand} />
            <Field label="Boards" value={scheduleDetails.boards} />
            <Field label="Schedule Type" value={scheduleDetails.scheduleType} />

            <Field label="Start Date" value={scheduleDetails.startDate} />
            <Field label="End Date" value={scheduleDetails.endDate} />
            <Field label="Slot Duration" value={scheduleDetails.slotDuration} />
            <Field label="Slot Total" value={scheduleDetails.slotTotal} />
          </div>
        </section>

        {/* Two-column body */}
        <div className="grid grid-cols-[1fr_460px] gap-6">
          {/* Schedule & Ad Items */}
          <section
            className="rounded-xl border border-gray-200 p-5"
            style={{ backgroundColor: SUB_BG }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-base font-semibold text-gray-900">
                <ChevronDown size={18} className="text-gray-500" />
                Schedule &amp; Ad Items
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAllAds('approved')}
                  className="text-xs font-medium px-3 py-1.5 rounded-md border border-green-500 text-green-600 hover:bg-green-50"
                >
                  Approve All
                </button>
                <button
                  onClick={() => setAllAds('rejected')}
                  className="text-xs font-medium px-3 py-1.5 rounded-md border border-red-500 text-red-600 hover:bg-red-50"
                >
                  Reject All
                </button>
              </div>
            </div>

            <AccordionItem
              title="Main Street Digital Display"
              defaultOpen
              decision={adDecisions.main}
              onDecisionChange={(v) => setAd('main', v)}
            >
              <AdItemBody />
            </AccordionItem>

            <AccordionItem
              title="Item ABC"
              decision={adDecisions.a}
              onDecisionChange={(v) => setAd('a', v)}
            >
              <AdItemBody />
            </AccordionItem>
            <AccordionItem
              title="Item ABC"
              decision={adDecisions.b}
              onDecisionChange={(v) => setAd('b', v)}
            >
              <AdItemBody />
            </AccordionItem>
            <AccordionItem
              title="Item ABC"
              decision={adDecisions.c}
              onDecisionChange={(v) => setAd('c', v)}
            >
              <AdItemBody />
            </AccordionItem>
          </section>

          {/* Creatives */}
          <section
            className="rounded-xl border border-gray-200 p-5"
            style={{ backgroundColor: SUB_BG }}
          >
            <div className="text-base font-semibold text-gray-900 mb-4">Creatives</div>

            <AccordionItem
              title="Item ABC"
              defaultOpen
              decision={creativeDecisions.c1}
              onDecisionChange={(v) => setCreative('c1', v)}
            >
              <CreativeBody seed={`approval-${id || '5678'}-c1`} />
            </AccordionItem>

            <AccordionItem
              title="Item ABC"
              decision={creativeDecisions.c2}
              onDecisionChange={(v) => setCreative('c2', v)}
            >
              <CreativeBody seed={`approval-${id || '5678'}-c2`} />
            </AccordionItem>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

/* ----------------------- Ad Item body ----------------------- */
function AdItemBody() {
  const [tab, setTab] = useState('config');
  const TabBtn = ({ id, label }) => (
    <button
      onClick={() => setTab(id)}
      className={`pb-2 px-1 text-sm font-medium border-b-2 transition ${
        tab === id
          ? 'border-[#12297D] text-[#12297D]'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );
  return (
    <div>
      <div className="flex items-center gap-6 border-b border-gray-200 mb-4">
        <TabBtn id="config" label="Configuration" />
        <TabBtn id="budget" label="Budget" />
      </div>

      {tab === 'config' ? (
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="grid grid-cols-3 gap-y-5 gap-x-6">
            <Field label="Campaign ID:" value="4589" />
            <Field label="Campaign Name" value="Back to School Specials" />
            <Field label="Creative Size" value="1920 × 1080 (Full HD)" />

            <Field label="Frequency Cap" value="5 plays per hour" />
            <Field label="Content Type" value="Static Image / Video Mix" />
            <Field label="Target Weekdays" value="Mon–Fri" />

            <Field label="Start Date" value="Aug 1, 2025 | 09:00 AM" />
            <Field label="End Date" value="Aug 31, 2025 | 09:00 PM" />
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="grid grid-cols-3 gap-y-5 gap-x-6">
            <Field label="Budget" value="$12,500" />
            <Field label="Spent" value="$4,820" />
            <Field label="Remaining" value="$7,680" />
            <Field label="CPM" value="$8.50" />
            <Field label="Daily Cap" value="$500" />
            <Field label="Currency" value="USD" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------- Creative body ----------------------- */
function CreativeBody({ seed }) {
  return (
    <div>
      <img
        src={`https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/750`}
        alt="Creative preview"
        className="w-full aspect-[16/10] rounded-md object-cover bg-gray-100 mb-4"
      />
      <div className="grid grid-cols-2 gap-y-5 gap-x-6">
        <Field label="Creative Id" value="1234" />
        <Field label="Size / Format" value="1920×1080" />
        <Field label="Title" value="Advertiser Specific" />
        <Field label="Comments" value="N/A" />
        <Field label="Alt Text" value="Lorem Ipsum" />
        <Field label="Start Date" value="Dec 13, 2024 | 02:47" />
        <Field label="End Date" value="Dec 13, 2024 | 02:47" />
        <div>
          <div className="text-xs text-gray-500 mb-1.5">Linked Billboards</div>
          <span className="inline-block bg-blue-50 text-[#12297D] text-xs font-medium px-2.5 py-1 rounded-md">
            1234
          </span>
        </div>
      </div>
    </div>
  );
}
