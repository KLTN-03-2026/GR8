/**
 * ApartmentFilter — Premium filter UI
 * Phong cách: Airbnb / Zillow / Batdongsan
 */
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
  </svg>
);
const BuildingIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const StatusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const PriceIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const AreaIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);
const FloorIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);
const CodeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
  </svg>
);
const ResetIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const ChevronIcon = ({ open }) => (
  <svg className={`w-5 h-5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

// ─── FilterInput ──────────────────────────────────────────────────────────────
const FilterInput = ({
  label, icon: Icon, value, onChange, onBlur,
  placeholder, type = "text", suffix, error, inputMode,
  min, max,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <div className={`relative flex items-center transition-all duration-200 rounded-2xl border bg-white
        ${focused
          ? "border-emerald-500 shadow-[0_0_0_3px_rgba(5,150,105,0.12)] scale-[1.01]"
          : error
          ? "border-red-400 shadow-sm"
          : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md"
        }`}
      >
        {Icon && (
          <span className={`absolute left-3.5 transition-colors duration-200 ${focused ? "text-emerald-500" : "text-slate-400"}`}>
            <Icon />
          </span>
        )}
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          placeholder={placeholder}
          min={min}
          max={max}
          className={`w-full h-[54px] bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none
            ${Icon ? "pl-10" : "pl-4"}
            ${suffix ? "pr-14" : "pr-4"}
            rounded-2xl`}
          aria-label={label}
        />
        {suffix && (
          <span className="absolute right-3.5 text-xs font-medium text-slate-400 pointer-events-none select-none">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

// ─── FilterSelect ─────────────────────────────────────────────────────────────
const FilterSelect = ({ label, icon: Icon, value, onChange, children }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <div className={`relative flex items-center transition-all duration-200 rounded-2xl border bg-white
        ${focused
          ? "border-emerald-500 shadow-[0_0_0_3px_rgba(5,150,105,0.12)] scale-[1.01]"
          : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md"
        }`}
      >
        {Icon && (
          <span className={`absolute left-3.5 transition-colors duration-200 pointer-events-none ${focused ? "text-emerald-500" : "text-slate-400"}`}>
            <Icon />
          </span>
        )}
        <select
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full h-[54px] bg-transparent text-sm text-slate-800 outline-none appearance-none cursor-pointer
            ${Icon ? "pl-10" : "pl-4"} pr-10 rounded-2xl`}
          aria-label={label}
        >
          {children}
        </select>
        <span className="absolute right-3.5 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>
    </div>
  );
};

// ─── RangeGroup ───────────────────────────────────────────────────────────────
const RangeGroup = ({ label, icon: Icon, fromValue, toValue, onFromChange, onToChange, suffix, fromPlaceholder = "Từ", toPlaceholder = "Đến", error }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
      {Icon && <span className="text-slate-400"><Icon /></span>}
      {label}
    </label>
    <div className="flex items-center gap-2">
      <div className={`relative flex-1 flex items-center rounded-2xl border bg-white transition-all duration-200
        ${error ? "border-red-400" : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md focus-within:border-emerald-500 focus-within:shadow-[0_0_0_3px_rgba(5,150,105,0.12)] focus-within:scale-[1.01]"}`}
      >
        <input
          type="number"
          inputMode="numeric"
          value={fromValue}
          onChange={onFromChange}
          placeholder={fromPlaceholder}
          min={0}
          className={`w-full h-[54px] bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none pl-4 ${suffix ? "pr-12" : "pr-4"} rounded-2xl`}
        />
        {suffix && <span className="absolute right-3 text-xs font-medium text-slate-400 pointer-events-none">{suffix}</span>}
      </div>
      <span className="text-slate-300 font-light text-lg flex-shrink-0">—</span>
      <div className={`relative flex-1 flex items-center rounded-2xl border bg-white transition-all duration-200
        ${error ? "border-red-400" : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md focus-within:border-emerald-500 focus-within:shadow-[0_0_0_3px_rgba(5,150,105,0.12)] focus-within:scale-[1.01]"}`}
      >
        <input
          type="number"
          inputMode="numeric"
          value={toValue}
          onChange={onToChange}
          placeholder={toPlaceholder}
          min={0}
          className={`w-full h-[54px] bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none pl-4 ${suffix ? "pr-12" : "pr-4"} rounded-2xl`}
        />
        {suffix && <span className="absolute right-3 text-xs font-medium text-slate-400 pointer-events-none">{suffix}</span>}
      </div>
    </div>
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

// ─── Main ApartmentFilter ─────────────────────────────────────────────────────
const ApartmentFilter = ({ filter, onChange, onSearch, buildings = [], loading = false }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [priceError, setPriceError] = useState("");
  const [areaError, setAreaError] = useState("");
  const debounceRef = useRef(null);

  // Local extended filter state
  const [local, setLocal] = useState({
    ToaNhaID:  filter.ToaNhaID  || "",
    TrangThai: filter.TrangThai || "",
    Tang:      filter.Tang      || "",
    SoPhong:   filter.SoPhong   || "",
    search:    filter.search    || "",
    minGia:    filter.minGia    || "",
    maxGia:    filter.maxGia    || "",
    minDT:     filter.minDT     || "",
    maxDT:     filter.maxDT     || "",
  });

  // Sync khi filter prop thay đổi từ ngoài
  useEffect(() => {
    setLocal({
      ToaNhaID:  filter.ToaNhaID  || "",
      TrangThai: filter.TrangThai || "",
      Tang:      filter.Tang      || "",
      SoPhong:   filter.SoPhong   || "",
      search:    filter.search    || "",
      minGia:    filter.minGia    || "",
      maxGia:    filter.maxGia    || "",
      minDT:     filter.minDT     || "",
      maxDT:     filter.maxDT     || "",
    });
  }, [filter]);

  const set = (key, value) => {
    const next = { ...local, [key]: value };
    setLocal(next);

    // Validate price range
    if (key === "minGia" || key === "maxGia") {
      const min = Number(key === "minGia" ? value : next.minGia);
      const max = Number(key === "maxGia" ? value : next.maxGia);
      if (min && max && min > max) setPriceError("Giá tối thiểu không được lớn hơn giá tối đa");
      else setPriceError("");
    }

    // Validate area range
    if (key === "minDT" || key === "maxDT") {
      const min = Number(key === "minDT" ? value : next.minDT);
      const max = Number(key === "maxDT" ? value : next.maxDT);
      if (min && max && min > max) setAreaError("Diện tích tối thiểu không được lớn hơn tối đa");
      else setAreaError("");
    }

    // Debounce search
    if (key === "search") {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onChange({ ...next }), 400);
      return;
    }

    onChange(next);
  };

  const handleSearch = () => {
    if (priceError || areaError) return;
    onSearch?.(local);
  };

  const handleReset = () => {
    const empty = { ToaNhaID: "", TrangThai: "", Tang: "", SoPhong: "", search: "", minGia: "", maxGia: "", minDT: "", maxDT: "" };
    setLocal(empty);
    setPriceError("");
    setAreaError("");
    onChange(empty);
    onSearch?.(empty);
  };

  const hasActiveFilter = Object.values(local).some(Boolean);

  const filterContent = (
    <div className="space-y-5">
      {/* Row 1: Tòa nhà + Trạng thái + Mã / Từ khóa + Tầng + Số phòng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <FilterSelect label="Tòa nhà" icon={BuildingIcon} value={local.ToaNhaID} onChange={e => set("ToaNhaID", e.target.value)}>
          <option value="">Tất cả tòa nhà</option>
          {buildings.map(b => <option key={b.ID} value={b.ID}>{b.TenToaNha}</option>)}
        </FilterSelect>

        <FilterSelect label="Trạng thái" icon={StatusIcon} value={local.TrangThai} onChange={e => set("TrangThai", e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="Trong">🟢 Còn trống</option>
          <option value="DaThue">🔵 Đã thuê</option>
          <option value="BaoTri">🟡 Bảo trì</option>
          <option value="DangDon">🟣 Đang dọn</option>
        </FilterSelect>

        <FilterInput
          label="Mã / Từ khóa"
          icon={CodeIcon}
          value={local.search}
          onChange={e => set("search", e.target.value)}
          placeholder="Mã căn, mô tả..."
        />

        <FilterInput
          label="Tầng"
          icon={FloorIcon}
          type="number"
          inputMode="numeric"
          value={local.Tang}
          onChange={e => set("Tang", e.target.value)}
          placeholder="Số tầng"
          min={1}
        />

        <FilterInput
          label="Số phòng"
          icon={SearchIcon}
          value={local.SoPhong}
          onChange={e => set("SoPhong", e.target.value)}
          placeholder="VD: 10, 20..."
        />
      </div>

      {/* Row 2: Khoảng giá + Diện tích */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <RangeGroup
          label="Khoảng giá"
          icon={PriceIcon}
          fromValue={local.minGia}
          toValue={local.maxGia}
          onFromChange={e => set("minGia", e.target.value)}
          onToChange={e => set("maxGia", e.target.value)}
          suffix="VNĐ"
          fromPlaceholder="Giá tối thiểu"
          toPlaceholder="Giá tối đa"
          error={priceError}
        />

        <RangeGroup
          label="Diện tích"
          icon={AreaIcon}
          fromValue={local.minDT}
          toValue={local.maxDT}
          onFromChange={e => set("minDT", e.target.value)}
          onToChange={e => set("maxDT", e.target.value)}
          suffix="m²"
          fromPlaceholder="Từ"
          toPlaceholder="Đến"
          error={areaError}
        />
      </div>
    </div>
  );

  return (
    <div
      className="rounded-3xl border border-slate-200/80 overflow-hidden mb-6"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 24px rgba(15,23,42,0.06), 0 1px 4px rgba(15,23,42,0.04)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm shadow-blue-200">
            <span className="text-white"><FilterIcon /></span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 leading-tight">Bộ lọc tìm kiếm căn hộ</h3>
            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">Tìm kiếm nhanh căn hộ phù hợp với nhu cầu của bạn</p>
          </div>
          {hasActiveFilter && (
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-emerald-600 border border-blue-100">
              Đang lọc
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilter && (
            <button
              onClick={handleReset}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
            >
              <ResetIcon />
              Đặt lại
            </button>
          )}
          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 border border-slate-200"
          >
            <ChevronIcon open={mobileOpen} />
          </button>
        </div>
      </div>

      {/* Filter body — desktop always visible, mobile collapsible */}
      <div className={`px-6 py-5 hidden sm:block`}>{filterContent}</div>

      {/* Mobile collapsible */}
      <div className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-4 py-4">{filterContent}</div>
      </div>

      {/* Footer actions */}
      <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-400 hidden sm:block">
          {hasActiveFilter ? "Bộ lọc đang được áp dụng" : "Chưa có bộ lọc nào được chọn"}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {hasActiveFilter && (
            <button
              onClick={handleReset}
              className="sm:hidden flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all"
            >
              <ResetIcon />
              Đặt lại
            </button>
          )}
          <button
            onClick={handleSearch}
            disabled={loading || !!priceError || !!areaError}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: loading || priceError || areaError
                ? "#94a3b8"
                : "linear-gradient(135deg, #059669 0%, #047857 100%)",
              boxShadow: loading || priceError || areaError ? "none" : "0 4px 14px rgba(5,150,105,0.35)",
            }}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Đang tìm...
              </>
            ) : (
              <>
                <SearchIcon />
                Tìm kiếm
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApartmentFilter;
