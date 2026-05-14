// client/src/pages/baocao/OwnerReports.jsx
// Bao cao & Thong ke he thong - ChuNha
import React, { useState, useEffect, useCallback } from "react";
import axios from "../../api/axios";
import { formatCurrency } from "../../utils/formatCurrency";

//  SVG Bar Chart ─
const BarChart = ({ data, height = 200, color = "#3b82f6", color2 = null, label1 = "", label2 = "" }) => {
  if (!data || data.length === 0) return (
    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Chưa có dữ liệu</div>
  );
  const max = Math.max(...data.map(d => Math.max(d.v1 || 0, d.v2 || 0)), 1);
  const W = 600; const H = height; const padL = 60; const padB = 36; const padT = 16; const padR = 16;
  const chartW = W - padL - padR;
  const chartH = H - padB - padT;
  const barW = Math.max(8, (chartW / data.length) * 0.35);
  const gap = chartW / data.length;
  const yTicks = 4;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {/* Grid lines */}
      {Array.from({ length: yTicks + 1 }).map((_, i) => {
        const y = padT + (chartH / yTicks) * i;
        const val = max * (1 - i / yTicks);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
              {val >= 1e9 ? (val / 1e9).toFixed(1) + "T" : val >= 1e6 ? (val / 1e6).toFixed(0) + "M" : val >= 1e3 ? (val / 1e3).toFixed(0) + "K" : val.toFixed(0)}
            </text>
          </g>
        );
      })}
      {/* Bars */}
      {data.map((d, i) => {
        const x = padL + gap * i + gap / 2;
        const h1 = (d.v1 / max) * chartH;
        const h2 = color2 ? (d.v2 / max) * chartH : 0;
        const offset = color2 ? barW * 0.6 : 0;
        return (
          <g key={i}>
            <rect x={x - offset - barW / 2} y={padT + chartH - h1} width={barW} height={h1} fill={color} rx="3" opacity="0.9" />
            {color2 && <rect x={x + offset - barW / 2} y={padT + chartH - h2} width={barW} height={h2} fill={color2} rx="3" opacity="0.9" />}
            <text x={x} y={H - 6} textAnchor="middle" fontSize="9" fill="#6b7280">{d.label}</text>
          </g>
        );
      })}
      {/* Legend */}
      {color2 && (
        <g>
          <rect x={padL} y={H - padB + 2} width={10} height={10} fill={color} rx="2" />
          <text x={padL + 14} y={H - padB + 11} fontSize="10" fill="#374151">{label1}</text>
          <rect x={padL + 80} y={H - padB + 2} width={10} height={10} fill={color2} rx="2" />
          <text x={padL + 94} y={H - padB + 11} fontSize="10" fill="#374151">{label2}</text>
        </g>
      )}
    </svg>
  );
};

//  SVG Donut Chart 
const DonutChart = ({ segments, size = 160 }) => {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Chưa có dữ liệu</div>;
  const cx = size / 2; const cy = size / 2; const r = size * 0.38; const ir = size * 0.24;
  let angle = -Math.PI / 2;
  const paths = segments.map(seg => {
    const sweep = (seg.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle); const y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle); const y2 = cy + r * Math.sin(angle);
    const ix1 = cx + ir * Math.cos(angle - sweep); const iy1 = cy + ir * Math.sin(angle - sweep);
    const ix2 = cx + ir * Math.cos(angle); const iy2 = cy + ir * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    return { d: `M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${ix2},${iy2} A${ir},${ir} 0 ${large},0 ${ix1},${iy1} Z`, color: seg.color };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} stroke="white" strokeWidth="2" />)}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#111827">{total}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#6b7280">tổng</text>
    </svg>
  );
};

//  SVG Line Chart 
const LineChart = ({ data, height = 180, color = "#10b981" }) => {
  if (!data || data.length < 2) return (
    <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Cần ít nhất 2 điểm dữ liệu</div>
  );
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 600; const H = height; const padL = 60; const padB = 30; const padT = 16; const padR = 16;
  const chartW = W - padL - padR; const chartH = H - padB - padT;
  const pts = data.map((d, i) => ({
    x: padL + (i / (data.length - 1)) * chartW,
    y: padT + chartH - (d.value / max) * chartH,
    label: d.label, value: d.value
  }));
  const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");
  const area = `M${pts[0].x},${padT + chartH} ` + pts.map(p => `L${p.x},${p.y}`).join(" ") + ` L${pts[pts.length - 1].x},${padT + chartH} Z`;
  const yTicks = 4;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {Array.from({ length: yTicks + 1 }).map((_, i) => {
        const y = padT + (chartH / yTicks) * i;
        const val = max * (1 - i / yTicks);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
              {val >= 1e9 ? (val / 1e9).toFixed(1) + "T" : val >= 1e6 ? (val / 1e6).toFixed(0) + "M" : val >= 1e3 ? (val / 1e3).toFixed(0) + "K" : val.toFixed(0)}
            </text>
          </g>
        );
      })}
      <path d={area} fill="url(#areaGrad)" />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill={color} stroke="white" strokeWidth="2" />
          <text x={p.x} y={H - 6} textAnchor="middle" fontSize="9" fill="#6b7280">{p.label}</text>
        </g>
      ))}
    </svg>
  );
};

//  KPI Card ─
const KpiCard = ({ label, value, sub, accent, icon }) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-5 border-l-4 ${accent}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
    </div>
  </div>
);

//  Section Card 
const Card = ({ title, subtitle, children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
    <div className="mb-4">
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

//  Legend Row 
const LegendRow = ({ color, label, value, pct }) => (
  <div className="flex items-center gap-3 py-1.5">
    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
    <span className="text-sm text-gray-600 flex-1">{label}</span>
    <span className="text-sm font-semibold text-gray-900">{value}</span>
    {pct !== undefined && <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>}
  </div>
);

//  Main Component 
const OwnerReports = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Raw data
  const [apartments, setApartments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [users, setUsers] = useState([]);

  // Computed
  const [monthlyData, setMonthlyData] = useState([]);
  const [incidentMonthly, setIncidentMonthly] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0, totalUnpaid: 0, overdueInvoices: 0,
    totalApts: 0, rentedApts: 0, vacantApts: 0, maintenanceApts: 0,
    occupancyRate: 0, activeContracts: 0, expiringSoon: 0,
    totalIncidents: 0, resolvedIncidents: 0, pendingIncidents: 0,
    totalTenants: 0,
  });

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [aptRes, invRes, ctRes, incRes, userRes] = await Promise.allSettled([
        axios.get("/apartments"),
        axios.get("/hoadon"),
        axios.get("/hopdong"),
        axios.get("/yeucausuco"),
        axios.get("/users", { params: { limit: 500, roles: "NguoiThue,KhachVangLai" } }),
      ]);

      const apts = aptRes.status === "fulfilled"
        ? (aptRes.value.data.data?.items || aptRes.value.data.data || []) : [];
      const invs = invRes.status === "fulfilled"
        ? (Array.isArray(invRes.value.data.data) ? invRes.value.data.data : []) : [];
      const cts = ctRes.status === "fulfilled"
        ? (Array.isArray(ctRes.value.data.data) ? ctRes.value.data.data : []) : [];
      const incs = incRes.status === "fulfilled"
        ? (Array.isArray(incRes.value.data.data) ? incRes.value.data.data
            : incRes.value.data.data?.items || []) : [];
      const usrs = userRes.status === "fulfilled"
        ? (userRes.value.data.data?.items || userRes.value.data.items || []) : [];

      setApartments(apts); setInvoices(invs); setContracts(cts);
      setIncidents(incs); setUsers(usrs);

      const today = new Date();
      const in30 = new Date(today); in30.setDate(in30.getDate() + 30);

      const totalRevenue = invs.filter(i => i.TrangThai === "DaTT").reduce((s, i) => s + parseFloat(i.TongTien || 0), 0);
      const totalUnpaid = invs.filter(i => i.TrangThai !== "DaTT").reduce((s, i) => s + parseFloat(i.TongTien || 0), 0);
      const overdueInvoices = invs.filter(i => i.TrangThai !== "DaTT" && new Date(i.NgayDenHan) < today).length;
      const rentedApts = apts.filter(a => a.TrangThai === "DaThue").length;
      const vacantApts = apts.filter(a => a.TrangThai === "Trong").length;
      const maintenanceApts = apts.filter(a => a.TrangThai === "BaoTri").length;
      const activeContracts = cts.filter(c => c.TrangThai === "DangThue").length;
      const expiringSoon = cts.filter(c => c.TrangThai === "DangThue" && new Date(c.NgayKetThuc) <= in30).length;
      const resolvedIncidents = incs.filter(i => i.TrangThai === "DaGiaiQuyet").length;
      const pendingIncidents = incs.filter(i => i.TrangThai === "Moi").length;

      setSummary({
        totalRevenue, totalUnpaid, overdueInvoices,
        totalApts: apts.length, rentedApts, vacantApts, maintenanceApts,
        occupancyRate: apts.length > 0 ? Math.round((rentedApts / apts.length) * 100) : 0,
        activeContracts, expiringSoon,
        totalIncidents: incs.length, resolvedIncidents, pendingIncidents,
        totalTenants: usrs.length,
      });

      // Monthly revenue & invoice data (last 8 months)
      const byMonth = {};
      invs.forEach(inv => {
        if (!inv.ThangNam) return;
        const key = inv.ThangNam.substring(0, 7);
        if (!byMonth[key]) byMonth[key] = { paid: 0, unpaid: 0, count: 0 };
        if (inv.TrangThai === "DaTT") byMonth[key].paid += parseFloat(inv.TongTien || 0);
        else byMonth[key].unpaid += parseFloat(inv.TongTien || 0);
        byMonth[key].count++;
      });
      const sortedMonths = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-8);
      setMonthlyData(sortedMonths.map(([k, v]) => ({
        label: k.replace(/\d{4}-/, "") + "/" + k.split("-")[0].slice(2),
        v1: v.paid, v2: v.unpaid
      })));

      // Monthly incidents (last 6 months)
      const byIncMonth = {};
      incs.forEach(inc => {
        if (!inc.NgayBao) return;
        const key = new Date(inc.NgayBao).toISOString().substring(0, 7);
        if (!byIncMonth[key]) byIncMonth[key] = 0;
        byIncMonth[key]++;
      });
      const sortedInc = Object.entries(byIncMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
      setIncidentMonthly(sortedInc.map(([k, v]) => ({
        label: k.replace(/\d{4}-/, "") + "/" + k.split("-")[0].slice(2),
        value: v
      })));

      setLastUpdated(new Date());
    } catch (err) {
      console.error("OwnerReports fetchAll error:", err);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Xuất CSV tổng hợp
  const handleExportCSV = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("vi-VN").replace(/\//g, "-");

    // Sheet 1: KPI tổng quan
    const kpiRows = [
      ["Chỉ số", "Giá trị"],
      ["Tổng doanh thu (đã thu)", summary.totalRevenue],
      ["Công nợ chưa thu", summary.totalUnpaid],
      ["Hóa đơn quá hạn", summary.overdueInvoices],
      ["Tổng căn hộ", summary.totalApts],
      ["Căn hộ đã thuê", summary.rentedApts],
      ["Căn hộ còn trống", summary.vacantApts],
      ["Căn hộ bảo trì", summary.maintenanceApts],
      ["Tỷ lệ lấp đầy (%)", summary.occupancyRate],
      ["Hợp đồng đang hiệu lực", summary.activeContracts],
      ["Hợp đồng sắp hết hạn (30 ngày)", summary.expiringSoon],
      ["Tổng sự cố", summary.totalIncidents],
      ["Sự cố đã giải quyết", summary.resolvedIncidents],
      ["Sự cố chưa phân công", summary.pendingIncidents],
      ["Tổng người thuê", summary.totalTenants],
    ];

    // Sheet 2: Doanh thu theo tháng
    const revenueRows = [
      ["Tháng", "Đã thu (VNĐ)", "Chưa thu (VNĐ)"],
      ...monthlyData.map(m => [m.label, m.v1, m.v2]),
    ];

    // Sheet 3: Sự cố theo tháng
    const incidentRows = [
      ["Tháng", "Số sự cố"],
      ...incidentMonthly.map(m => [m.label, m.value]),
    ];

    // Sheet 4: Top căn hộ doanh thu
    const aptRevenue = {};
    invoices.filter(i => i.TrangThai === "DaTT").forEach(inv => {
      const code = inv.hopdong?.canho?.MaCanHo || "N/A";
      aptRevenue[code] = (aptRevenue[code] || 0) + parseFloat(inv.TongTien || 0);
    });
    const topApts = Object.entries(aptRevenue).sort(([, a], [, b]) => b - a).slice(0, 10);
    const aptRows = [
      ["Căn hộ", "Doanh thu (VNĐ)"],
      ...topApts.map(([code, rev]) => [code, rev]),
    ];

    // Ghép tất cả vào 1 CSV với separator
    const toCSV = (rows) => rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");

    const csvContent = [
      `"BÁO CÁO THỐNG KÊ HỆ THỐNG - ${dateStr}"`,
      "",
      '"=== TỔNG QUAN KPI ==="',
      toCSV(kpiRows),
      "",
      '"=== DOANH THU THEO THÁNG ==="',
      toCSV(revenueRows),
      "",
      '"=== SỰ CỐ THEO THÁNG ==="',
      toCSV(incidentRows),
      "",
      '"=== TOP CĂN HỘ DOANH THU CAO NHẤT ==="',
      toCSV(aptRows),
    ].join("\n");

    // Thêm BOM để Excel đọc được tiếng Việt
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BaoCao_HeThong_${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Đang tải báo cáo...</p>
      </div>
    </div>
  );

  // Donut segments
  const aptSegments = [
    { label: "Da thue", value: summary.rentedApts, color: "#10b981" },
    { label: "Con trong", value: summary.vacantApts, color: "#3b82f6" },
    { label: "Bao tri", value: summary.maintenanceApts, color: "#f59e0b" },
    { label: "Khac", value: summary.totalApts - summary.rentedApts - summary.vacantApts - summary.maintenanceApts, color: "#e5e7eb" },
  ].filter(s => s.value > 0);

  const incidentSegments = [
    { label: "Da giai quyet", value: summary.resolvedIncidents, color: "#10b981" },
    { label: "Dang xu ly", value: summary.totalIncidents - summary.resolvedIncidents - summary.pendingIncidents, color: "#3b82f6" },
    { label: "Chua phan cong", value: summary.pendingIncidents, color: "#ef4444" },
  ].filter(s => s.value > 0);

  const invoiceSegments = [
    { label: "Da thanh toan", value: invoices.filter(i => i.TrangThai === "DaTT").length, color: "#10b981" },
    { label: "Chua thanh toan", value: invoices.filter(i => i.TrangThai !== "DaTT" && new Date(i.NgayDenHan) >= new Date()).length, color: "#f59e0b" },
    { label: "Qua han", value: summary.overdueInvoices, color: "#ef4444" },
  ].filter(s => s.value > 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:mb-4 { margin-bottom: 1rem !important; }
          nav, aside, header, footer { display: none !important; }
          .min-h-screen { min-height: unset !important; }
          .bg-gray-50 { background: white !important; }
          .shadow-sm, .shadow-lg { box-shadow: none !important; }
          .rounded-xl, .rounded-2xl { border-radius: 4px !important; }
          @page {
            size: A4 landscape;
            margin: 12mm 10mm;
          }
          .grid { display: grid !important; }
          .lg\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr) !important; }
          .lg\\:grid-cols-4 { grid-template-columns: repeat(4, 1fr) !important; }
          .lg\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr) !important; }
          .lg\\:col-span-2 { grid-column: span 2 !important; }
        }
      `}</style>
      <div className="max-w-screen-xl mx-auto">

        {/*  Header  */}
        <div className="flex items-start justify-between mb-8 print:mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Báo Cáo & Thống Kê Hệ Thống</h1>
            <p className="text-gray-500 text-sm mt-1">Tổng quan toàn diện quá trình hoạt động</p>
            {lastUpdated && (
              <p className="text-xs text-gray-400 mt-0.5">
                Cập nhật lúc {lastUpdated.toLocaleTimeString("vi-VN")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={() => fetchAll(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? "Đang tải..." : "Làm mới"}
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              In báo cáo
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Xuất CSV
            </button>
          </div>
        </div>

        {/*  KPI Row  */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Tổng doanh thu"
            value={formatCurrency(summary.totalRevenue)}
            sub="Tích lũy toàn bộ"
            accent="border-l-emerald-500"
            icon={<svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <KpiCard
            label="Công nợ hiện tại"
            value={formatCurrency(summary.totalUnpaid)}
            sub={`${summary.overdueInvoices} hóa đơn quá hạn`}
            accent="border-l-red-500"
            icon={<svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          />
          <KpiCard
            label="Tỷ lệ lấp đầy"
            value={`${summary.occupancyRate}%`}
            sub={`${summary.rentedApts}/${summary.totalApts} căn hộ`}
            accent="border-l-blue-500"
            icon={<svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
          />
          <KpiCard
            label="Hợp đồng hiệu lực"
            value={summary.activeContracts}
            sub={summary.expiringSoon > 0 ? `${summary.expiringSoon} hết hạn trong 30 ngày` : "Không có hết hạn sắp tới"}
            accent={summary.expiringSoon > 0 ? "border-l-amber-500" : "border-l-violet-500"}
            icon={<svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />
        </div>

        {/*  Row 2: Revenue Line + Apartment Donut  */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <Card title="Doanh Thu Theo Tháng" subtitle="So sánh đã thu và chưa thu (VNĐ)" className="lg:col-span-2">
            <BarChart
              data={monthlyData}
              height={220}
              color="#10b981"
              color2="#f87171"
              label1="Đã thu"
              label2="Chưa thu"
            />
          </Card>

          <Card title="Trạng Thái Căn Hộ" subtitle={`Tổng ${summary.totalApts} căn hộ`}>
            <div className="flex flex-col items-center gap-4">
              <DonutChart segments={aptSegments} size={160} />
              <div className="w-full space-y-1">
                {[
                  { color: "#10b981", label: "Đã thuê", value: summary.rentedApts },
                  { color: "#3b82f6", label: "Còn trống", value: summary.vacantApts },
                  { color: "#f59e0b", label: "Bảo trì", value: summary.maintenanceApts },
                ].map(s => (
                  <LegendRow key={s.label} color={s.color} label={s.label} value={`${s.value} căn`}
                    pct={summary.totalApts > 0 ? Math.round((s.value / summary.totalApts) * 100) : 0} />
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/*  Row 3: Incidents Line + Invoice Donut + Tenant Stats  */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <Card title="Sự Cố Theo Tháng" subtitle="Số lượng sự cố báo cáo mới theo tháng">
            <LineChart data={incidentMonthly} height={180} color="#8b5cf6" />
          </Card>

          <Card title="Trạng Thái Hóa Đơn" subtitle={`Tổng ${invoices.length} hóa đơn`}>
            <div className="flex flex-col items-center gap-4">
              <DonutChart segments={invoiceSegments} size={150} />
              <div className="w-full space-y-1">
                {[
                  { color: "#10b981", label: "Đã thanh toán", value: invoices.filter(i => i.TrangThai === "DaTT").length },
                  { color: "#f59e0b", label: "Chưa thanh toán", value: invoices.filter(i => i.TrangThai !== "DaTT" && new Date(i.NgayDenHan) >= new Date()).length },
                  { color: "#ef4444", label: "Quá hạn", value: summary.overdueInvoices },
                ].map(s => (
                  <LegendRow key={s.label} color={s.color} label={s.label} value={s.value}
                    pct={invoices.length > 0 ? Math.round((s.value / invoices.length) * 100) : 0} />
                ))}
              </div>
            </div>
          </Card>

          <Card title="Xử Lý Sự Cố" subtitle={`Tổng ${summary.totalIncidents} sự cố`}>
            <div className="flex flex-col items-center gap-4">
              <DonutChart segments={incidentSegments} size={150} />
              <div className="w-full space-y-1">
                {[
                  { color: "#10b981", label: "Đã giải quyết", value: summary.resolvedIncidents },
                  { color: "#3b82f6", label: "Đang xử lý", value: summary.totalIncidents - summary.resolvedIncidents - summary.pendingIncidents },
                  { color: "#ef4444", label: "Chưa phân công", value: summary.pendingIncidents },
                ].map(s => (
                  <LegendRow key={s.label} color={s.color} label={s.label} value={s.value}
                    pct={summary.totalIncidents > 0 ? Math.round((s.value / summary.totalIncidents) * 100) : 0} />
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/*  Row 4: Summary Table  */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Occupancy progress */}
          <Card title="Chỉ Số Hoạt Động" subtitle="Tổng quan các chỉ số chính">
            <div className="space-y-5">
              {[
                { label: "Tỷ lệ lấp đầy", value: summary.occupancyRate, color: "#10b981", unit: "%" },
                { label: "Tỷ lệ thanh toán", value: invoices.length > 0 ? Math.round((invoices.filter(i => i.TrangThai === "DaTT").length / invoices.length) * 100) : 0, color: "#3b82f6", unit: "%" },
                { label: "Tỷ lệ giải quyết sự cố", value: summary.totalIncidents > 0 ? Math.round((summary.resolvedIncidents / summary.totalIncidents) * 100) : 0, color: "#8b5cf6", unit: "%" },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <span className="text-sm font-bold text-gray-900">{item.value}{item.unit}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${item.value}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 gap-4">
              {[
                { label: "Tổng người thuê", value: summary.totalTenants, color: "text-blue-600" },
                { label: "Hợp đồng sắp hết hạn", value: summary.expiringSoon, color: summary.expiringSoon > 0 ? "text-amber-600" : "text-gray-400" },
                { label: "Căn hộ trống", value: summary.vacantApts, color: "text-emerald-600" },
                { label: "Căn hộ bảo trì", value: summary.maintenanceApts, color: "text-orange-600" },
              ].map(s => (
                <div key={s.label} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Top apartments by revenue */}
          <Card title="Căn Hộ Có Doanh Thu Cao Nhất" subtitle="Xếp hạng theo tổng hóa đơn đã thu">
            {(() => {
              const aptRevenue = {};
              invoices.filter(i => i.TrangThai === "DaTT").forEach(inv => {
                const code = inv.hopdong?.canho?.MaCanHo || "N/A";
                aptRevenue[code] = (aptRevenue[code] || 0) + parseFloat(inv.TongTien || 0);
              });
              const sorted = Object.entries(aptRevenue).sort(([, a], [, b]) => b - a).slice(0, 6);
              const maxRev = sorted[0]?.[1] || 1;
              if (sorted.length === 0) return <p className="text-center text-gray-400 text-sm py-8">Chưa có dữ liệu</p>;
              return (
                <div className="space-y-3">
                  {sorted.map(([code, rev], i) => (
                    <div key={code} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                      <span className="text-sm font-semibold text-gray-700 w-20 flex-shrink-0">{code}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500 transition-all duration-700"
                          style={{ width: `${(rev / maxRev) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-700 w-24 text-right">{formatCurrency(rev)}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </Card>
        </div>

        {/*  Footer note  */}
        <p className="text-center text-xs text-gray-400 pb-4">
          Dữ liệu được tổng hợp từ toàn bộ hệ thống. Cập nhật theo thời gian thực khi bấm "Làm mới".
        </p>
      </div>
    </div>
  );
};

export default OwnerReports;
