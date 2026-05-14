// client/src/pages/baocao/Reports.jsx
// Báo cáo thống kê - Admin / KeToan

import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';

const BAR_COLORS = [
  'bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500',
  'bg-indigo-500', 'bg-pink-500', 'bg-lime-500', 'bg-sky-500',
];

const MiniBar = ({ label, value, max, color }) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs text-slate-500 w-16 flex-shrink-0 text-right">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-slate-700 w-28 flex-shrink-0">{formatCurrency(value)}</span>
    </div>
  );
};

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    invoices: [],
    apartments: [],
    contracts: [],
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0, totalUnpaid: 0, occupancyRate: 0,
    totalApts: 0, rentedApts: 0, activeContracts: 0,
    overdueInvoices: 0,
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [aptRes, invRes, ctRes] = await Promise.all([
        axios.get('/apartments').catch(() => ({ data: { data: [] } })),
        axios.get('/hoadon').catch(() => ({ data: { data: [] } })),
        axios.get('/hopdong').catch(() => ({ data: { data: [] } })),
      ]);

      const apts = Array.isArray(aptRes.data.data) ? aptRes.data.data : (aptRes.data.items || []);
      const invs = Array.isArray(invRes.data.data) ? invRes.data.data : (invRes.data.items || []);
      const cts = Array.isArray(ctRes.data.data) ? ctRes.data.data : (ctRes.data.items || []);

      const today = new Date();
      const totalRevenue = invs.filter(i => i.TrangThai === 'DaTT').reduce((s, i) => s + parseFloat(i.TongTien || 0), 0);
      const totalUnpaid = invs.filter(i => i.TrangThai !== 'DaTT').reduce((s, i) => s + parseFloat(i.TongTien || 0), 0);
      const rentedApts = apts.filter(a => a.TrangThai === 'DaThue').length;
      const overdueInvoices = invs.filter(i => i.TrangThai !== 'DaTT' && new Date(i.NgayDenHan) < today).length;

      setSummary({
        totalRevenue, totalUnpaid,
        totalApts: apts.length, rentedApts,
        occupancyRate: apts.length > 0 ? Math.round((rentedApts / apts.length) * 100) : 0,
        activeContracts: cts.filter(c => c.TrangThai === 'DangThue').length,
        overdueInvoices,
      });

      // Group invoices by month
      const byMonth = {};
      invs.forEach(inv => {
        if (!inv.ThangNam) return;
        const [year, month] = inv.ThangNam.split('-');
        const key = `${year}-${month}`;
        if (!byMonth[key]) byMonth[key] = { paid: 0, unpaid: 0 };
        if (inv.TrangThai === 'DaTT') byMonth[key].paid += parseFloat(inv.TongTien || 0);
        else byMonth[key].unpaid += parseFloat(inv.TongTien || 0);
      });
      const sorted = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b));
      setMonthlyRevenue(sorted.map(([month, vals]) => ({ month, ...vals })));

      setData({ invoices: invs, apartments: apts, contracts: cts });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const maxMonthRevenue = Math.max(...monthlyRevenue.map(m => m.paid + m.unpaid), 1);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Đang tải báo cáo...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Báo Cáo & Thống Kê</h1>
            <p className="text-gray-500 text-sm mt-1">Tổng quan hoạt động kinh doanh</p>
          </div>
          <button onClick={fetchAll} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors">
            Làm mới
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tổng doanh thu', value: formatCurrency(summary.totalRevenue), color: 'border-l-green-500', sub: 'Đã thu' },
            { label: 'Công nợ', value: formatCurrency(summary.totalUnpaid), color: 'border-l-red-500', sub: `${summary.overdueInvoices} quá hạn` },
            { label: 'Tỷ lệ lấp đầy', value: `${summary.occupancyRate}%`, color: 'border-l-blue-500', sub: `${summary.rentedApts}/${summary.totalApts} căn` },
            { label: 'Hợp đồng đang thuê', value: summary.activeContracts, color: 'border-l-violet-500', sub: 'Đang hiệu lực' },
          ].map(card => (
            <div key={card.label} className={`bg-white border border-gray-200 rounded-xl p-4 border-l-4 ${card.color}`}>
              <p className="text-xs text-gray-500 font-medium mb-1">{card.label}</p>
              <p className="text-2xl font-semibold text-gray-900 mb-1">{card.value}</p>
              <p className="text-xs text-gray-400">{card.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2"> Doanh Thu Theo Tháng</h2>
            <p className="text-xs text-slate-400 mb-5">Đơn vị: VNĐ</p>
            {monthlyRevenue.length === 0 ? (
              <p className="text-center text-slate-400 py-8">Chưa có dữ liệu</p>
            ) : (
              <div>
                {monthlyRevenue.map((m, i) => (
                  <MiniBar
                    key={m.month}
                    label={m.month.replace(/\d{4}-/, '')+'/'+m.month.split('-')[0]}
                    value={m.paid}
                    max={maxMonthRevenue}
                    color={BAR_COLORS[i % BAR_COLORS.length]}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Apartment Status */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-5"> Trạng Thái Căn Hộ</h2>
            {(() => {
              const statusCount = data.apartments.reduce((acc, a) => {
                acc[a.TrangThai] = (acc[a.TrangThai] || 0) + 1;
                return acc;
              }, {});
              const configs = [
                { key: 'DaThue', label: 'Đã thuê', color: 'bg-emerald-500', text: 'text-emerald-700' },
                { key: 'Trong', label: 'Còn trống', color: 'bg-blue-500', text: 'text-blue-700' },
                { key: 'BaoTri', label: 'Bảo trì', color: 'bg-orange-500', text: 'text-orange-700' },
                { key: 'DangDon', label: 'Đang dọn', color: 'bg-purple-500', text: 'text-purple-700' },
              ];
              const total = data.apartments.length || 1;
              return (
                <div className="space-y-4">
                  {configs.map(cfg => {
                    const count = statusCount[cfg.key] || 0;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={cfg.key}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-semibold text-slate-700">{cfg.label}</span>
                          <span className={`text-sm font-bold ${cfg.text}`}>{count} căn ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${cfg.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-5"> Tổng Hợp Hóa Đơn</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Tổng hóa đơn', value: data.invoices.length, color: 'border-blue-500 text-blue-600' },
              { label: 'Đã thanh toán', value: data.invoices.filter(i => i.TrangThai === 'DaTT').length, color: 'border-green-500 text-green-600' },
              { label: 'Chưa thanh toán', value: data.invoices.filter(i => i.TrangThai === 'ChuaTT').length, color: 'border-yellow-500 text-yellow-600' },
              { label: 'Quá hạn', value: summary.overdueInvoices, color: 'border-red-500 text-red-600' },
            ].map(item => (
              <div key={item.label} className={`border-l-4 ${item.color.split(' ')[0]} pl-4 py-2`}>
                <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                <p className={`text-3xl font-bold ${item.color.split(' ')[1]}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
