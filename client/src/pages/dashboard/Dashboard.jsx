// client/src/pages/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, sub, color, icon, link, navigate }) => (
  <div
    className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
    onClick={() => link && navigate(link)}
  >
    <div className={`bg-gradient-to-br ${color} p-6`}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-2xl">{icon}</div>
        <span className="text-white text-opacity-80 text-sm font-semibold">{title}</span>
      </div>
      <p className="text-4xl font-bold text-white mb-1">{value}</p>
      {sub && <p className="text-white text-opacity-75 text-sm">{sub}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.roles?.TenVaiTro || user?.VaiTro;

  const [stats, setStats] = useState({
    apartments: { total: 0, available: 0, rented: 0, maintenance: 0 },
    contracts: { total: 0, active: 0, pending: 0, expiringSoon: 0 },
    invoices: { total: 0, paid: 0, unpaid: 0, overdue: 0, totalUnpaid: 0 },
    requests: { total: 0, pending: 0, approved: 0, rejected: 0 },
    users: { total: 0, tenants: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [recentContracts, setRecentContracts] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const isAdmin = ['QuanLy', 'KeToan', 'ChuNha'].includes(role);
      const isTenant = role === 'NguoiThue';

      const promises = [
        axios.get('/apartments').catch(() => ({ data: { data: [] } })),
      ];
      if (isAdmin) {
        promises.push(
          axios.get('/hopdong').catch(() => ({ data: { data: [] } })),
          axios.get('/hoadon').catch(() => ({ data: { data: [] } })),
          axios.get('/yeucauthue').catch(() => ({ data: { data: [] } })),
          axios.get('/users').catch(() => ({ data: { data: { items: [] } } })),
        );
      }
      if (isTenant) {
        promises.push(
          axios.get('/hopdong/my').catch(() => ({ data: { data: [] } })),
          axios.get('/hoadon/my-invoices').catch(() => ({ data: { data: [] } })),
          axios.get('/yeucauthue/my').catch(() => ({ data: { data: [] } })),
        );
      }

      const results = await Promise.all(promises);
      const [aptRes, ...rest] = results;

      // Apartments
      let apts = aptRes.data.data || [];
      if (!Array.isArray(apts)) apts = apts.items || [];
      if (!Array.isArray(apts)) apts = [];
      const aptStats = apts.reduce((a, x) => {
        a.total++;
        if (x.TrangThai === 'Trong') a.available++;
        else if (x.TrangThai === 'DaThue') a.rented++;
        else if (x.TrangThai === 'BaoTri') a.maintenance++;
        return a;
      }, { total: 0, available: 0, rented: 0, maintenance: 0 });

      let contractStats = { total: 0, active: 0, pending: 0, expiringSoon: 0 };
      let invoiceStats = { total: 0, paid: 0, unpaid: 0, overdue: 0, totalUnpaid: 0 };
      let requestStats = { total: 0, pending: 0, approved: 0, rejected: 0 };
      let userStats = { total: 0, tenants: 0 };
      let recentC = [], recentR = [];

      if (isAdmin && rest.length >= 4) {
        let contracts = rest[0].data.data || [];
        if (!Array.isArray(contracts)) contracts = [];
        const today = new Date();
        contractStats = contracts.reduce((a, x) => {
          a.total++;
          if (x.TrangThai === 'DangThue') {
            a.active++;
            const days = Math.ceil((new Date(x.NgayKetThuc) - today) / 86400000);
            if (days > 0 && days <= 30) a.expiringSoon++;
          }
          if (x.TrangThai === 'ChoKy') a.pending++;
          return a;
        }, { total: 0, active: 0, pending: 0, expiringSoon: 0 });
        recentC = contracts.slice(0, 5);

        let invoices = rest[1].data.data || rest[1].data.items || [];
        if (!Array.isArray(invoices)) invoices = [];
        invoiceStats = invoices.reduce((a, x) => {
          a.total++;
          if (x.TrangThai === 'DaTT') a.paid++;
          else {
            a.unpaid++;
            a.totalUnpaid += parseFloat(x.TongTien || 0);
            if (new Date(x.NgayDenHan) < today) a.overdue++;
          }
          return a;
        }, { total: 0, paid: 0, unpaid: 0, overdue: 0, totalUnpaid: 0 });

        let requests = rest[2].data.data || [];
        if (!Array.isArray(requests)) requests = [];
        requestStats = requests.reduce((a, x) => {
          a.total++;
          if (x.TrangThai === 'ChoKiemTra') a.pending++;
          else if (x.TrangThai === 'DaDuyet') a.approved++;
          else if (x.TrangThai === 'TuChoi') a.rejected++;
          return a;
        }, { total: 0, pending: 0, approved: 0, rejected: 0 });
        recentR = requests.filter(r => r.TrangThai === 'ChoKiemTra').slice(0, 5);

        let users = rest[3].data.data?.items || rest[3].data.items || [];
        if (!Array.isArray(users)) users = [];
        userStats = { total: users.length, tenants: users.filter(u => u.roles?.TenVaiTro === 'NguoiThue').length };
      }

      if (isTenant && rest.length >= 3) {
        let contracts = rest[0].data.data || [];
        if (!Array.isArray(contracts)) contracts = [];
        contractStats = contracts.reduce((a, x) => {
          a.total++;
          if (x.TrangThai === 'DangThue') a.active++;
          if (x.TrangThai === 'ChoKy') a.pending++;
          return a;
        }, { total: 0, active: 0, pending: 0, expiringSoon: 0 });

        let invoices = rest[1].data.data || rest[1].data.items || [];
        if (!Array.isArray(invoices)) invoices = [];
        invoiceStats = invoices.reduce((a, x) => {
          a.total++;
          if (x.TrangThai === 'DaTT') a.paid++;
          else { a.unpaid++; a.totalUnpaid += parseFloat(x.TongTien || 0); }
          return a;
        }, { total: 0, paid: 0, unpaid: 0, overdue: 0, totalUnpaid: 0 });

        let requests = rest[2].data.data || [];
        if (!Array.isArray(requests)) requests = [];
        requestStats = requests.reduce((a, x) => {
          a.total++;
          if (x.TrangThai === 'ChoKiemTra') a.pending++;
          else if (x.TrangThai === 'DaDuyet') a.approved++;
          return a;
        }, { total: 0, pending: 0, approved: 0, rejected: 0 });
      }

      setStats({ apartments: aptStats, contracts: contractStats, invoices: invoiceStats, requests: requestStats, users: userStats });
      setRecentContracts(recentC);
      setRecentRequests(recentR);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải dữ liệu...</p>
      </div>
    </div>
  );

  const isAdmin = ['QuanLy', 'KeToan', 'ChuNha'].includes(role);
  const isTenant = role === 'NguoiThue';
  const isTech = role === 'NhanVienKyThuat';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Welcome */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              👋 Xin chào, {user?.HoTen}!
            </h1>
            <p className="text-gray-500 mt-1">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button onClick={fetchDashboardData} className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-600 shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Làm mới
          </button>
        </div>

        {/* ===== ADMIN / QUANLY / KETOAN / CHUNHA ===== */}
        {isAdmin && (
          <>
            {/* KPI Row 1 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard title="Căn Hộ" value={stats.apartments.total}
                sub={`Trống: ${stats.apartments.available} | Thuê: ${stats.apartments.rented}`}
                color="from-blue-500 to-blue-600" icon="🏢" link="/apartments" navigate={navigate} />
              <StatCard title="Hợp Đồng" value={stats.contracts.total}
                sub={`Đang thuê: ${stats.contracts.active} | Chờ ký: ${stats.contracts.pending}`}
                color="from-indigo-500 to-indigo-600" icon="📄" link="/hopdong" navigate={navigate} />
              <StatCard title="Yêu Cầu Thuê" value={stats.requests.pending}
                sub="Đang chờ duyệt"
                color="from-amber-500 to-orange-500" icon="📝" link="/yeucauthue" navigate={navigate} />
              <StatCard title="Công Nợ" value={formatCurrency(stats.invoices.totalUnpaid)}
                sub={`${stats.invoices.unpaid} hóa đơn chưa TT`}
                color="from-red-500 to-rose-600" icon="💰" link="/hoadon-all" navigate={navigate} />
            </div>

            {/* KPI Row 2 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-500">
                <p className="text-sm text-gray-500">Hóa đơn đã TT</p>
                <p className="text-3xl font-bold text-green-600">{stats.invoices.paid}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-5 border-l-4 border-red-500">
                <p className="text-sm text-gray-500">Hóa đơn quá hạn</p>
                <p className="text-3xl font-bold text-red-600">{stats.invoices.overdue}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-5 border-l-4 border-orange-500">
                <p className="text-sm text-gray-500">HĐ sắp hết hạn</p>
                <p className="text-3xl font-bold text-orange-600">{stats.contracts.expiringSoon}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-5 border-l-4 border-purple-500">
                <p className="text-sm text-gray-500">Tỷ lệ lấp đầy</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.apartments.total > 0
                    ? Math.round((stats.apartments.rented / stats.apartments.total) * 100)
                    : 0}%
                </p>
              </div>
            </div>

            {/* Tables */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pending Requests */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">⏳ Yêu Cầu Chờ Duyệt</h2>
                  <button onClick={() => navigate('/yeucauthue')} className="text-sm text-blue-600 hover:underline">Xem tất cả</button>
                </div>
                {recentRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-4xl mb-2">✅</div>
                    <p>Không có yêu cầu chờ duyệt</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentRequests.map(r => (
                      <div key={r.ID} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {r.nguoidung_yeucauthue_NguoiYeuCauIDTonguoidung?.HoTen || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">Căn hộ {r.canho?.MaCanHo}</p>
                        </div>
                        <button
                          onClick={() => navigate('/yeucauthue')}
                          className="px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600"
                        >
                          Duyệt
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Contracts */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">📄 Hợp Đồng Gần Đây</h2>
                  <button onClick={() => navigate('/hopdong')} className="text-sm text-blue-600 hover:underline">Xem tất cả</button>
                </div>
                {recentContracts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-4xl mb-2">📄</div>
                    <p>Chưa có hợp đồng</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentContracts.map(c => {
                      const statusColor = { DangThue: 'green', ChoKy: 'yellow', KetThuc: 'gray', HetHan: 'red' }[c.TrangThai] || 'gray';
                      return (
                        <div key={c.ID} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{c.nguoidung?.HoTen}</p>
                            <p className="text-xs text-gray-500">Căn hộ {c.canho?.MaCanHo} • {formatCurrency(c.GiaThue)}/tháng</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold bg-${statusColor}-100 text-${statusColor}-800`}>
                            {c.TrangThai}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">⚡ Thao Tác Nhanh</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Duyệt Yêu Cầu', icon: '✅', path: '/yeucauthue', color: 'bg-amber-50 hover:bg-amber-100 border-amber-200' },
                  { label: 'Tạo Hợp Đồng', icon: '📝', path: '/hopdong', color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200' },
                  { label: 'Duyệt Chỉ Số', icon: '🔢', path: '/pending-readings', color: 'bg-green-50 hover:bg-green-100 border-green-200' },
                  { label: 'Quản Lý Căn Hộ', icon: '🏢', path: '/apartments', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
                ].map(a => (
                  <button key={a.path} onClick={() => navigate(a.path)}
                    className={`p-4 rounded-xl border-2 ${a.color} transition-all text-left`}>
                    <div className="text-2xl mb-2">{a.icon}</div>
                    <p className="font-semibold text-gray-800 text-sm">{a.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ===== NGUOI THUE ===== */}
        {isTenant && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard title="Hợp Đồng" value={stats.contracts.active}
                sub="Đang thuê" color="from-green-500 to-emerald-600" icon="🏠" link="/my-contracts" navigate={navigate} />
              <StatCard title="Hóa Đơn Chưa TT" value={stats.invoices.unpaid}
                sub={formatCurrency(stats.invoices.totalUnpaid)} color="from-red-500 to-rose-600" icon="💳" link="/my-invoices" navigate={navigate} />
              <StatCard title="Yêu Cầu Thuê" value={stats.requests.total}
                sub={`Chờ duyệt: ${stats.requests.pending}`} color="from-blue-500 to-cyan-600" icon="📝" link="/my-rental-requests" navigate={navigate} />
              <StatCard title="Đã Thanh Toán" value={stats.invoices.paid}
                sub="Hóa đơn" color="from-purple-500 to-violet-600" icon="✅" link="/my-invoices" navigate={navigate} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">⚡ Thao Tác Nhanh</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Tìm Căn Hộ', icon: '🔍', path: '/browse-apartments', desc: 'Xem căn hộ còn trống' },
                    { label: 'Hóa Đơn Của Tôi', icon: '💳', path: '/my-invoices', desc: 'Xem và thanh toán hóa đơn' },
                    { label: 'Hợp Đồng Của Tôi', icon: '📄', path: '/my-contracts', desc: 'Xem chi tiết hợp đồng' },
                    { label: 'Yêu Cầu Thuê', icon: '📝', path: '/my-rental-requests', desc: 'Theo dõi yêu cầu' },
                  ].map(a => (
                    <button key={a.path} onClick={() => navigate(a.path)}
                      className="w-full flex items-center p-4 bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all text-left">
                      <span className="text-2xl mr-4">{a.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{a.label}</p>
                        <p className="text-xs text-gray-500">{a.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
                <h2 className="text-lg font-bold mb-4">📊 Tóm Tắt</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white bg-opacity-10 rounded-lg">
                    <span>Hợp đồng đang thuê</span>
                    <span className="font-bold text-xl">{stats.contracts.active}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white bg-opacity-10 rounded-lg">
                    <span>Hóa đơn chưa thanh toán</span>
                    <span className="font-bold text-xl">{stats.invoices.unpaid}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white bg-opacity-10 rounded-lg">
                    <span>Tổng nợ</span>
                    <span className="font-bold">{formatCurrency(stats.invoices.totalUnpaid)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ===== NHAN VIEN KY THUAT ===== */}
        {isTech && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <StatCard title="Căn Hộ" value={stats.apartments.total}
                sub={`Đang thuê: ${stats.apartments.rented}`} color="from-blue-500 to-blue-600" icon="🏢" link="/apartments" navigate={navigate} />
              <StatCard title="Cần Ghi Chỉ Số" value={stats.apartments.rented}
                sub="Căn hộ đang thuê" color="from-green-500 to-emerald-600" icon="📊" link="/meter-reading" navigate={navigate} />
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">⚡ Thao Tác Nhanh</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Ghi Chỉ Số Điện Nước', icon: '📝', path: '/meter-reading', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
                  { label: 'Quản Lý Tài Sản', icon: '🔧', path: '/assets', color: 'bg-green-50 hover:bg-green-100 border-green-200' },
                ].map(a => (
                  <button key={a.path} onClick={() => navigate(a.path)}
                    className={`p-6 rounded-xl border-2 ${a.color} transition-all text-center`}>
                    <div className="text-3xl mb-2">{a.icon}</div>
                    <p className="font-semibold text-gray-800">{a.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
