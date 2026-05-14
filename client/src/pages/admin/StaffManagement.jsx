// client/src/pages/admin/StaffManagement.jsx
// ChuNha quản lý tài khoản nhân sự (QuanLy, NhanVienKyThuat, KeToan)

import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';

const STAFF_ROLES = ['QuanLy', 'NhanVienKyThuat', 'KeToan'];
const ROLE_LABELS = { QuanLy: 'Quản Lý', NhanVienKyThuat: 'Nhân Viên KT', KeToan: 'Kế Toán' };
const ROLE_COLORS = {
  QuanLy: 'bg-violet-100 text-violet-800',
  NhanVienKyThuat: 'bg-orange-100 text-orange-800',
  KeToan: 'bg-blue-100 text-blue-800',
};

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ TenDangNhap: '', HoTen: '', Email: '', SoDienThoai: '', MatKhau: '', VaiTro: 'NhanVienKyThuat' });

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/users', { params: { limit: 200, roles: 'QuanLy,NhanVienKyThuat,KeToan' } });
      const raw = res.data.data?.items || res.data.data || res.data.items || [];
      setStaff(Array.isArray(raw) ? raw : []);
    } catch { setError('Không thể tải danh sách nhân sự'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.TenDangNhap || !form.HoTen || !form.Email || !form.MatKhau) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc'); return;
    }
    setSubmitting(true); setError('');
    try {
      await axios.post('/users/create-staff', form);
      setSuccess(' Tạo tài khoản nhân sự thành công!');
      setShowForm(false);
      setForm({ TenDangNhap: '', HoTen: '', Email: '', SoDienThoai: '', MatKhau: '', VaiTro: 'NhanVienKyThuat' });
      fetchStaff();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) { setError(err.response?.data?.message || 'Không thể tạo tài khoản'); }
    finally { setSubmitting(false); }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus === 'HoatDong' ? 'khóa' : 'kích hoạt';
    if (!window.confirm(`Bạn có muốn ${action} tài khoản này?`)) return;
    try {
      await axios.patch(`/users/${userId}/toggle-status`);
      setSuccess(` Đã ${action} tài khoản!`);
      fetchStaff();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.message || `Không thể ${action} tài khoản`); }
  };

  const filtered = staff.filter(u => {
    const role = u.roles?.TenVaiTro || u.VaiTro;
    const matchRole = filterRole === 'all' || role === filterRole;
    const matchSearch = !search || u.HoTen?.toLowerCase().includes(search.toLowerCase()) || u.Email?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Quản Lý Nhân Sự</h1>
            <p className="text-gray-500 text-sm mt-1">Quản lý tài khoản Admin, Nhân viên kỹ thuật, Kế toán</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            + Tạo tài khoản nhân sự
          </button>
        </div>

        {success && <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-r-xl text-green-800 text-sm font-medium">{success}</div>}
        {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-xl text-red-800 text-sm">{error}</div>}

        {/* Search & Filter */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email..."
            className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          <div className="flex gap-2">
            {[['all', 'Tất cả'], ...STAFF_ROLES.map(r => [r, ROLE_LABELS[r]])].map(([val, label]) => (
              <button key={val} onClick={() => setFilterRole(val)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterRole === val ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {STAFF_ROLES.map(role => (
            <div key={role} className="bg-white rounded-2xl shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{staff.filter(u => (u.roles?.TenVaiTro || u.VaiTro) === role).length}</p>
              <p className="text-sm text-slate-500">{ROLE_LABELS[role]}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Họ tên', 'Email / SĐT', 'Vai trò', 'Trạng thái', 'Thao tác'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(u => {
                  const role = u.roles?.TenVaiTro || u.VaiTro;
                  const isActive = u.TrangThai !== 'KhongHoatDong';
                  return (
                    <tr key={u.ID} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm ${ROLE_COLORS[role]?.replace('bg-', 'bg-gradient-to-br from-') || 'bg-slate-400'}`}>
                            {u.HoTen?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{u.HoTen}</p>
                            <p className="text-xs text-slate-400">@{u.TenDangNhap}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-slate-700">{u.Email}</p>
                        <p className="text-xs text-slate-400">{u.SoDienThoai || 'Chưa cập nhật'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${ROLE_COLORS[role] || 'bg-slate-100 text-slate-800'}`}>
                          {ROLE_LABELS[role] || role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {isActive ? ' Hoạt động' : ' Bị khóa'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggleStatus(u.ID, u.TrangThai)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                          {isActive ? ' Khóa' : ' Mở khóa'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <div className="text-4xl mb-3"></div>
                <p>Không tìm thấy nhân sự phù hợp</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Staff Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="bg-gray-900 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-white font-bold">Tạo tài khoản nhân sự</h3>
              <button onClick={() => setShowForm(false)} className="text-white/70 hover:text-white text-xl"></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tên đăng nhập *</label>
                  <input value={form.TenDangNhap} onChange={e => setForm(f => ({ ...f, TenDangNhap: e.target.value }))}
                    placeholder="username" className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Họ tên *</label>
                  <input value={form.HoTen} onChange={e => setForm(f => ({ ...f, HoTen: e.target.value }))}
                    placeholder="Nguyễn Văn A" className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email *</label>
                <input type="email" value={form.Email} onChange={e => setForm(f => ({ ...f, Email: e.target.value }))}
                  placeholder="email@example.com" className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Số điện thoại</label>
                  <input value={form.SoDienThoai} onChange={e => setForm(f => ({ ...f, SoDienThoai: e.target.value }))}
                    placeholder="0901234567" className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Vai trò *</label>
                  <select value={form.VaiTro} onChange={e => setForm(f => ({ ...f, VaiTro: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm">
                    {STAFF_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu *</label>
                <input type="password" value={form.MatKhau} onChange={e => setForm(f => ({ ...f, MatKhau: e.target.value }))}
                  placeholder="Tối thiểu 6 ký tự" className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm" />
              </div>
              {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-50">
                  Hủy
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60">
                  {submitting ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
