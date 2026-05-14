// client/src/pages/admin/ActivityLog.jsx
// Nhật ký hoạt động hệ thống - QuanLy / ChuNha

import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../api/axios';

const UNDOABLE_ACTIONS = new Set(['Xóa tài sản', 'Xóa người dùng', 'Kết thúc hợp đồng', 'Xóa tiện ích', 'Xóa thẻ gửi xe']);

const LEVEL_CFG = {
  INFO:  { label: 'Thông tin', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  WARN:  { label: 'Cảnh báo',  color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  ERROR: { label: 'Lỗi',       color: 'bg-red-100 text-red-700 border-red-200' },
};

const ROLE_CFG = {
  QuanLy:          { label: 'Quản Lý',    color: 'bg-purple-100 text-purple-700' },
  ChuNha:          { label: 'Chủ Nhà',    color: 'bg-red-100 text-red-700' },
  NguoiThue:       { label: 'Người Thuê', color: 'bg-green-100 text-green-700' },
  KhachVangLai:    { label: 'Khách',      color: 'bg-gray-100 text-gray-600' },
  KeToan:          { label: 'Kế Toán',    color: 'bg-blue-100 text-blue-700' },
  NhanVienKyThuat: { label: 'Kỹ Thuật',   color: 'bg-orange-100 text-orange-700' },
};

const fmtDate = (d) => d
  ? new Date(d).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
  : '—';

// Nút hoàn tác tĩnh (không giới hạn thời gian)
const UndoButton = ({ logId, onUndo }) => {
  const [undoing, setUndoing] = useState(false);

  const handleUndo = async () => {
    if (!window.confirm('Hoàn tác hành động này?')) return;
    setUndoing(true);
    try {
      const res = await axios.post(`/activitylog/${logId}/undo`);
      onUndo(res.data?.message || 'Đã hoàn tác');
    } catch (err) {
      onUndo(null, err.response?.data?.message || 'Hoàn tác thất bại');
    } finally {
      setUndoing(false);
    }
  };

  return (
    <button
      onClick={handleUndo}
      disabled={undoing}
      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 disabled:opacity-50 transition-colors"
    >
      {undoing ? <span className="animate-spin inline-block">↻</span> : '↩'} Hoàn tác
    </button>
  );
};

const StatCard = ({ label, value, sub, color = 'text-gray-800' }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const ActivityLog = () => {
  const [logs, setLogs]       = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [undoneIds, setUndoneIds]   = useState(new Set()); // log IDs đã hoàn tác

  // Filters
  const [search, setSearch]   = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [level, setLevel]     = useState('');
  const [from, setFrom]       = useState('');
  const [to, setTo]           = useState('');
  const [toast, setToast]     = useState(null); // { type: 'success'|'error', msg }

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get('/activitylog/stats');
      setStats(res.data?.data || null);
    } catch { /* silent */ }
  }, []);

  const fetchLogs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: pagination.limit };
      if (search) params.search = search;
      if (level)  params.level  = level;
      if (from)   params.from   = from;
      if (to)     params.to     = to;

      const res = await axios.get('/activitylog', { params });
      const data = res.data?.data;
      setLogs(data?.items || []);
      setPagination(p => ({
        ...p,
        page: data?.page || 1,
        total: data?.total || 0,
        totalPages: data?.totalPages || 1,
      }));
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [search, level, from, to, pagination.limit]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchLogs(1); }, [search, level, from, to]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleUndoResult = (successMsg, errorMsg) => {
    if (successMsg) {
      setToast({ type: 'success', msg: successMsg });
      fetchLogs(pagination.page); // refresh
      fetchStats();
    } else {
      setToast({ type: 'error', msg: errorMsg });
    }
    setTimeout(() => setToast(null), 4000);
  };

  const clearFilters = () => {
    setSearch(''); setSearchInput('');
    setLevel(''); setFrom(''); setTo('');
  };

  const hasFilter = search || level || from || to;

  return (
    <div className="p-6 space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border ${
          toast.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nhật ký hoạt động</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ghi lại toàn bộ thao tác trên hệ thống</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Tổng log" value={stats.total?.toLocaleString()} />
          <StatCard label="Hôm nay" value={stats.todayCount?.toLocaleString()} color="text-indigo-600" />
          {stats.byLevel?.map(b => (
            <StatCard
              key={b.level}
              label={LEVEL_CFG[b.level]?.label || b.level}
              value={b._count.ID?.toLocaleString()}
              color={b.level === 'ERROR' ? 'text-red-600' : b.level === 'WARN' ? 'text-yellow-600' : 'text-blue-600'}
            />
          ))}
        </div>
      )}

      {/* Top actions */}
      {stats?.topActions?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Thao tác nhiều nhất</p>
          <div className="flex flex-wrap gap-2">
            {stats.topActions.map(a => (
              <span key={a.Action} className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-medium">
                {a.Action} <span className="font-bold">({a._count.ID})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-gray-600 mb-1">Tìm kiếm</label>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Tên người dùng, hành động, mô tả..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mức độ</label>
            <select
              value={level}
              onChange={e => setLevel(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Tất cả</option>
              <option value="INFO">Thông tin</option>
              <option value="WARN">Cảnh báo</option>
              <option value="ERROR">Lỗi</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Từ ngày</label>
            <input
              type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Đến ngày</label>
            <input
              type="date" value={to} onChange={e => setTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">
            Tìm
          </button>
          {hasFilter && (
            <button type="button" onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
              ✕ Xóa lọc
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">
            {loading ? 'Đang tải...' : `${pagination.total.toLocaleString()} bản ghi`}
          </p>
          <button onClick={() => fetchLogs(pagination.page)}
            className="text-xs text-indigo-600 hover:underline font-medium">
            ↻ Làm mới
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">📋</p>
            <p>Không có bản ghi nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Thời gian', 'Người dùng', 'Vai trò', 'Hành động', 'Đối tượng', 'Mức độ', 'Thao tác'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map(log => {
                  const role = log.nguoidung?.roles?.TenVaiTro;
                  const roleCfg = ROLE_CFG[role] || { label: role || '—', color: 'bg-gray-100 text-gray-600' };
                  const lvl = LEVEL_CFG[log.level] || LEVEL_CFG.INFO;
                  return (
                    <tr key={log.ID} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap text-xs">
                        {fmtDate(log.CreatedAt)}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-gray-800 text-xs">{log.nguoidung?.HoTen || '—'}</div>
                        <div className="text-gray-400 text-xs">{log.nguoidung?.TenDangNhap}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleCfg.color}`}>
                          {roleCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">
                        {log.Action}
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">
                        {log.EntityType && (
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-medium mb-0.5">
                            {(log.Description || log.EntityType).split('||SNAPSHOT:')[0]}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${lvl.color}`}>
                          {lvl.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {UNDOABLE_ACTIONS.has(log.Action) &&
                         log.level === 'INFO' &&
                         !undoneIds.has(log.ID) && (
                          <UndoButton
                            logId={log.ID}
                            onUndo={(ok, err) => {
                              if (ok) setUndoneIds(s => new Set([...s, log.ID]));
                              handleUndoResult(ok, err);
                            }}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Trang {pagination.page} / {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchLogs(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50"
              >
                ← Trước
              </button>
              {/* Page numbers (max 5 around current) */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(pagination.page - 2, pagination.totalPages - 4));
                const p = start + i;
                return (
                  <button
                    key={p}
                    onClick={() => fetchLogs(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      p === pagination.page
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => fetchLogs(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
