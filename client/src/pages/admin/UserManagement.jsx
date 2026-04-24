// client/src/pages/admin/UserManagement.jsx
// Quản lý người dùng - dành cho QuanLy

import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../api/axios';

const ROLES = ['NguoiThue', 'QuanLy', 'KeToan', 'NhanVienKyThuat', 'ChuNha', 'KhachVangLai'];
const ROLE_LABELS = {
  NguoiThue: { label: 'Người Thuê', color: 'bg-green-100 text-green-800' },
  QuanLy: { label: 'Quản Lý', color: 'bg-purple-100 text-purple-800' },
  KeToan: { label: 'Kế Toán', color: 'bg-blue-100 text-blue-800' },
  NhanVienKyThuat: { label: 'Kỹ Thuật', color: 'bg-orange-100 text-orange-800' },
  ChuNha: { label: 'Chủ Nhà', color: 'bg-red-100 text-red-800' },
  KhachVangLai: { label: 'Khách', color: 'bg-gray-100 text-gray-800' },
};
const STATUS_LABELS = {
  Active: { label: 'Hoạt động', color: 'bg-green-100 text-green-800' },
  Inactive: { label: 'Không HĐ', color: 'bg-gray-100 text-gray-800' },
  Locked: { label: 'Bị khóa', color: 'bg-red-100 text-red-800' },
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [createForm, setCreateForm] = useState({
    TenDangNhap: '', MatKhau: '', HoTen: '', Email: '',
    SoDienThoai: '', RoleID: '', TrangThai: 'Active'
  });
  const [roles, setRoles] = useState([]);

  useEffect(() => { fetchRoles(); }, []);
  useEffect(() => { fetchUsers(); }, [pagination.page, search]);

  const fetchRoles = async () => {
    try {
      const res = await axios.get('/users/roles').catch(() => null);
      if (res?.data?.data) setRoles(res.data.data);
    } catch {}
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page: pagination.page, limit: pagination.limit };
      if (search) params.search = search;
      const res = await axios.get('/users', { params });
      const data = res.data.data;
      setUsers(data.items || []);
      setPagination(p => ({ ...p, total: data.pagination?.total || 0, totalPages: data.pagination?.totalPages || 1 }));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPagination(p => ({ ...p, page: 1 }));
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      HoTen: user.HoTen || '',
      Email: user.Email || '',
      SoDienThoai: user.SoDienThoai || '',
      DiaChi: user.DiaChi || '',
      TrangThai: user.TrangThai || 'Active',
      RoleID: user.RoleID || '',
    });
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/users/${selectedUser.ID}`, editForm);
      setSuccess('✅ Cập nhật thành công!');
      setShowModal(false);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xác nhận xóa người dùng "${name}"?`)) return;
    try {
      await axios.delete(`/users/${id}`);
      setSuccess('✅ Đã xóa người dùng!');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Xóa thất bại');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/register', createForm);
      setSuccess('✅ Tạo tài khoản thành công!');
      setShowCreateModal(false);
      setCreateForm({ TenDangNhap: '', MatKhau: '', HoTen: '', Email: '', SoDienThoai: '', RoleID: '', TrangThai: 'Active' });
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Tạo tài khoản thất bại');
    }
  };

  const getRoleBadge = (roleName) => {
    const cfg = ROLE_LABELS[roleName] || { label: roleName, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-bold ${cfg.color}`}>{cfg.label}</span>;
  };

  const getStatusBadge = (status) => {
    const cfg = STATUS_LABELS[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-bold ${cfg.color}`}>{cfg.label}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">👥 Quản Lý Người Dùng</h1>
            <p className="text-gray-500 mt-1">Tổng: {pagination.total} tài khoản</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-md font-semibold"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Tạo Tài Khoản
          </button>
        </div>

        {/* Alerts */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-r-lg flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-800 font-medium">{success}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-lg flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-800 font-medium">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">✕</button>
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow p-4 mb-6 flex gap-3">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên, email, username..."
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold">
            Tìm kiếm
          </button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); setSearchInput(''); }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
              Xóa
            </button>
          )}
        </form>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">👥</div>
              <p className="text-lg">Không tìm thấy người dùng</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['#', 'Họ Tên', 'Tài Khoản', 'Email', 'SĐT', 'Vai Trò', 'Trạng Thái', 'Ngày Tạo', 'Thao Tác'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u, i) => (
                    <tr key={u.ID} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500">{(pagination.page - 1) * pagination.limit + i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm mr-3">
                            {u.HoTen?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">{u.HoTen}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{u.TenDangNhap}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{u.Email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{u.SoDienThoai || '—'}</td>
                      <td className="px-4 py-3">{getRoleBadge(u.roles?.TenVaiTro)}</td>
                      <td className="px-4 py-3">{getStatusBadge(u.TrangThai)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {u.NgayTao ? new Date(u.NgayTao).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(u)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200">
                            Sửa
                          </button>
                          <button onClick={() => handleDelete(u.ID, u.HoTen)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200">
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Trang {pagination.page} / {pagination.totalPages} • {pagination.total} người dùng
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  ← Trước
                </button>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">✏️ Chỉnh Sửa: {selectedUser.HoTen}</h3>
              <button onClick={() => setShowModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1">✕</button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Họ Tên</label>
                  <input type="text" value={editForm.HoTen || ''} onChange={e => setEditForm(f => ({ ...f, HoTen: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input type="email" value={editForm.Email || ''} onChange={e => setEditForm(f => ({ ...f, Email: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Số Điện Thoại</label>
                  <input type="tel" value={editForm.SoDienThoai || ''} onChange={e => setEditForm(f => ({ ...f, SoDienThoai: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Trạng Thái</label>
                  <select value={editForm.TrangThai || 'Active'} onChange={e => setEditForm(f => ({ ...f, TrangThai: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="Active">Hoạt động</option>
                    <option value="Inactive">Không hoạt động</option>
                    <option value="Locked">Khóa</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Địa Chỉ</label>
                <input type="text" value={editForm.DiaChi || ''} onChange={e => setEditForm(f => ({ ...f, DiaChi: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold">Hủy</button>
                <button type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">➕ Tạo Tài Khoản Mới</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tên Đăng Nhập *</label>
                  <input required type="text" value={createForm.TenDangNhap}
                    onChange={e => setCreateForm(f => ({ ...f, TenDangNhap: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mật Khẩu *</label>
                  <input required type="password" value={createForm.MatKhau}
                    onChange={e => setCreateForm(f => ({ ...f, MatKhau: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Họ Tên *</label>
                  <input required type="text" value={createForm.HoTen}
                    onChange={e => setCreateForm(f => ({ ...f, HoTen: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                  <input required type="email" value={createForm.Email}
                    onChange={e => setCreateForm(f => ({ ...f, Email: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Số Điện Thoại</label>
                  <input type="tel" value={createForm.SoDienThoai}
                    onChange={e => setCreateForm(f => ({ ...f, SoDienThoai: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Vai Trò *</label>
                  <select required value={createForm.VaiTro || ''}
                    onChange={e => setCreateForm(f => ({ ...f, VaiTro: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option value="">-- Chọn vai trò --</option>
                    {ROLES.map(r => (
                      <option key={r} value={r}>{ROLE_LABELS[r]?.label || r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold">Hủy</button>
                <button type="submit"
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold">Tạo Tài Khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
