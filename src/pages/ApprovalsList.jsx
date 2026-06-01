import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronUp,
  Search,
  Eye,
  X,
  CheckCircle2,
} from 'lucide-react';
import AppShell, {
  NAVY,
  SUB_BG,
  FilterDropdown,
  useFilterDismiss,
} from '../components/AppShell';

const PINK_PILL = 'bg-pink-100 text-pink-700';

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

const ALL_REQUESTS = [
  { id: '5678', name: 'Back to School Promo',         brand: 'Nike, India', owner: 'John Doe',   type: 'Fixed Slot', submitted: 'May 26, 2026 | 10:42', submittedDate: 'May 26, 2026', boards: 4 },
  { id: '5679', name: 'Samsung Fold Reveal',          brand: 'Samsung',     owner: 'Ruth Price', type: 'Multi-slot', submitted: 'May 25, 2026 | 16:08', submittedDate: 'May 25, 2026', boards: 2 },
  { id: '5680', name: 'Netflix Stranger Things 5',    brand: 'Netflix',     owner: 'Ruth Price', type: 'Recurring',  submitted: 'May 24, 2026 | 09:15', submittedDate: 'May 24, 2026', boards: 6 },
  { id: '5681', name: "McDonald's Breakfast Rush",    brand: "McDonald's",  owner: 'John Doe',   type: 'Fixed Slot', submitted: 'May 23, 2026 | 14:30', submittedDate: 'May 23, 2026', boards: 3 },
  { id: '5682', name: 'CRED Cashback Weekender',      brand: 'CRED',        owner: 'Ruth Price', type: 'Multi-slot', submitted: 'May 23, 2026 | 11:22', submittedDate: 'May 23, 2026', boards: 5 },
  { id: '5683', name: 'Apple Watch Series X Promo',   brand: 'Apple',       owner: 'Ruth Price', type: 'Fixed Slot', submitted: 'May 22, 2026 | 17:50', submittedDate: 'May 22, 2026', boards: 8 },
  { id: '5684', name: 'Summer Campaign',              brand: 'Coca-Cola',   owner: 'John Doe',   type: 'Recurring',  submitted: 'May 21, 2026 | 08:12', submittedDate: 'May 21, 2026', boards: 10 },
  { id: '5685', name: 'Nike x SNKRS Drop Launch',     brand: 'Nike, India', owner: 'Ruth Price', type: 'Multi-slot', submitted: 'May 20, 2026 | 13:45', submittedDate: 'May 20, 2026', boards: 4 },
];

const ROW_HEIGHT_PX = 57;
const TARGET_ROWS = 8;
const BODY_MIN_PX = ROW_HEIGHT_PX * TARGET_ROWS;

export default function ApprovalsList() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState(new Set());
  const [toast, setToast] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState([]);
  const [typeFilter, setTypeFilter] = useState([]);
  const [ownerFilter, setOwnerFilter] = useState([]);
  const [submittedFilter, setSubmittedFilter] = useState([]);
  const [openId, setOpenId] = useState(null);
  useFilterDismiss(openId, setOpenId);

  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 3000);
  };

  const brandOptions = Array.from(new Set(ALL_REQUESTS.map((r) => r.brand))).sort();
  const typeOptions = Array.from(new Set(ALL_REQUESTS.map((r) => r.type))).sort();
  const ownerOptions = Array.from(new Set(ALL_REQUESTS.map((r) => r.owner))).sort();
  const submittedOptions = Array.from(new Set(ALL_REQUESTS.map((r) => r.submittedDate)));

  const filtered = ALL_REQUESTS.filter((r) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const hay = `${r.name} ${r.brand} ${r.owner} ${r.type} ${r.id}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (brandFilter.length && !brandFilter.includes(r.brand)) return false;
    if (typeFilter.length && !typeFilter.includes(r.type)) return false;
    if (ownerFilter.length && !ownerFilter.includes(r.owner)) return false;
    if (submittedFilter.length && !submittedFilter.includes(r.submittedDate)) return false;
    return true;
  });

  const anyFilter = searchQuery || brandFilter.length || typeFilter.length || ownerFilter.length || submittedFilter.length;
  const clearAll = () => {
    setSearchQuery('');
    setBrandFilter([]);
    setTypeFilter([]);
    setOwnerFilter([]);
    setSubmittedFilter([]);
  };

  const toggle = (id) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected((s) =>
      s.size === filtered.length && filtered.length > 0
        ? new Set()
        : new Set(filtered.map((r) => r.id))
    );

  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const someSelected = filtered.some((r) => selected.has(r.id));

  const approveSelected = () => {
    const n = selected.size;
    setSelected(new Set());
    showToast(`${n} request${n > 1 ? 's' : ''} approved.`);
  };
  const rejectSelected = () => {
    const n = selected.size;
    setSelected(new Set());
    showToast(`${n} request${n > 1 ? 's' : ''} rejected.`);
  };

  return (
    <AppShell>
      {/* Sub header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-[1440px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-1 p-1 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Approval Requests</h1>
              <div className="text-xs text-gray-500 mt-1">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-[#12297D] hover:underline"
                >
                  Dashboard
                </button>
                <span className="mx-1.5 text-gray-400">›</span>
                <span className="text-gray-600">Approval Requests</span>
              </div>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${PINK_PILL}`}>
            {ALL_REQUESTS.length} Pending
          </span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 py-6">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search request"
              className="w-full text-sm bg-white border border-gray-200 rounded-md pl-9 pr-8 py-2 outline-none focus:border-gray-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <FilterDropdown id="brand"     label="Brand"     options={brandOptions}     selected={brandFilter}     onChange={setBrandFilter}     openId={openId} onOpenChange={setOpenId} />
          <FilterDropdown id="type"      label="Type"      options={typeOptions}      selected={typeFilter}      onChange={setTypeFilter}      openId={openId} onOpenChange={setOpenId} />
          <FilterDropdown id="owner"     label="Owner"     options={ownerOptions}     selected={ownerFilter}     onChange={setOwnerFilter}     openId={openId} onOpenChange={setOpenId} />
          <FilterDropdown id="submitted" label="Submitted" options={submittedOptions} selected={submittedFilter} onChange={setSubmittedFilter} openId={openId} onOpenChange={setOpenId} />
          {anyFilter ? (
            <button
              onClick={clearAll}
              className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
            >
              Clear all
            </button>
          ) : null}
        </div>

        {/* Sub toolbar */}
        <div
          className="flex items-center justify-between px-4 rounded-md mb-3"
          style={{ backgroundColor: SUB_BG, minHeight: 48 }}
        >
          <div className="text-sm text-gray-700">
            {selected.size > 0 ? (
              <><span className="font-semibold">{selected.size}</span> selected</>
            ) : (
              <>Requests Found: <span className="font-semibold">{filtered.length}</span></>
            )}
          </div>
          <div className="flex items-center" style={{ minHeight: 32 }}>
            {selected.size > 0 ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={approveSelected}
                  className="text-xs font-medium px-3 py-1.5 rounded-md border border-green-500 text-green-600 hover:bg-green-50"
                >
                  Approve Selected
                </button>
                <button
                  onClick={rejectSelected}
                  className="text-xs font-medium px-3 py-1.5 rounded-md border border-red-500 text-red-600 hover:bg-red-50"
                >
                  Reject Selected
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="w-10 p-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                    onChange={toggleAll}
                  />
                </th>
                <th className="p-3 text-left font-medium"><SortHeader label="Schedule Name" /></th>
                <th className="p-3 text-left font-medium"><SortHeader label="Brand" /></th>
                <th className="p-3 text-left font-medium"><SortHeader label="Requested By" /></th>
                <th className="p-3 text-left font-medium"><SortHeader label="Type" /></th>
                <th className="p-3 text-left font-medium">Boards</th>
                <th className="p-3 text-left font-medium"><SortHeader label="Submitted" /></th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center text-gray-400 text-sm align-middle"
                    style={{ height: BODY_MIN_PX }}
                  >
                    No requests match your filters.
                  </td>
                </tr>
              ) : (
                <>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className={`hover:bg-gray-50 ${selected.has(r.id) ? 'bg-blue-50/40' : ''}`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.has(r.id)}
                          onChange={() => toggle(r.id)}
                        />
                      </td>
                      <td className="p-3">
                        <a
                          onClick={() => navigate(`/approvals/${r.id}`)}
                          className="text-[#12297D] hover:underline cursor-pointer font-medium"
                        >
                          {r.name}
                        </a>
                        <span className="text-gray-400 text-xs ml-1.5">({r.id})</span>
                      </td>
                      <td className="p-3 text-gray-700">{r.brand}</td>
                      <td className="p-3 text-gray-700">{r.owner}</td>
                      <td className="p-3 text-gray-700">{r.type}</td>
                      <td className="p-3 text-gray-700">{r.boards}</td>
                      <td className="p-3 text-gray-700">{r.submitted}</td>
                      <td className="p-3">
                        <span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-md ${PINK_PILL}`}>
                          Pending Approval
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => navigate(`/approvals/${r.id}`)}
                          className="inline-flex items-center gap-1.5 text-sm text-[#12297D] hover:underline"
                        >
                          <Eye size={14} />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length < TARGET_ROWS && (
                    <tr aria-hidden="true">
                      <td
                        colSpan={9}
                        style={{ height: (TARGET_ROWS - filtered.length) * ROW_HEIGHT_PX }}
                      />
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm text-gray-600 mt-3">
          <div>{selected.size} of {filtered.length} row(s) selected.</div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              Rows per page
              <button className="inline-flex items-center gap-1 px-2 py-1 border border-gray-200 rounded-md bg-white">
                10 <ChevronDown size={12} />
              </button>
            </div>
            <div className="text-gray-700">Page 1 of 1</div>
            <div className="flex items-center gap-1.5">
              <button className="p-1.5 border border-gray-200 rounded-md bg-white text-gray-400">
                <ChevronsLeft size={14} />
              </button>
              <button className="p-1.5 border border-gray-200 rounded-md bg-white text-gray-400">
                <ChevronLeft size={14} />
              </button>
              <button className="p-1.5 border border-gray-200 rounded-md bg-white text-gray-400">
                <ChevronRight size={14} />
              </button>
              <button className="p-1.5 border border-gray-200 rounded-md bg-white text-gray-400">
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-3 rounded-lg shadow-xl">
          <CheckCircle2 size={16} className="text-green-400" />
          {toast}
        </div>
      )}
    </AppShell>
  );
}
