// client/src/pages/theguixe/ParkingManagement.jsx
// Quản lý thẻ xe gửi - Admin

import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';

const STATUS_CONFIG = {
  Active:   { label: 'Hoạt động', color: 'bg-green-100 text-green-800 border-green-300',   icon: '' },
  HetHan:   { label: 'Hết hạn',   color: 'bg-red-100 text-red-800 border-red-300',         icon: '' },
  MatThe:   { label: 'Mất thẻ',   color: 'bg-gray-100 text-gray-800 border-gray-300',      icon: '' },
  TamKhoa:  { label: 'Tạm khóa',  color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '' },
};

const VEHICLE_ICONS = { OTo: '', XeMay: '' };
const CARD_TYPE = { Thang: 'Theo tháng', Ngay: 'Theo ngày', Tam: 'Tạm thời' };

const ParkingManagement = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ TrangThai: '', LoaiXe: '' });
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0 });
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    NguoiDungID: '', LoaiThe: 'Thang', LoaiXe: 'XeMay',
    BienSoXe: '', NgayLap: new Date().toISOString().split('T')[0],
    NgayHetHan: '', TrangThai: 'Active', GhiChu: '',
  });

  useEffect(() => { fetchCards(); fetchUsers(); }, [filter]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/theguixe', { params: filter });
      const data = res.data.data || res.data.items || res.data || [];
      const arr = Array.isArray(data) ? data : [];
      setCards(arr);
      setStats({
        total: arr.length,
        active: arr.filter(c => c.TrangThai === 'Active').length,
        expired: arr.filter(c => c.TrangThai === 'HetHan').length,
      });
    } catch {
      setError('Không thể tải danh sách thẻ xe');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users', { params: { limit: 500, roles: 'NguoiThue,KhachVangLai' } });
      const data = res.data.data?.items || res.data.items || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch {}
  };

  const resetForm = () => {
    setForm({ NguoiDungID: '', LoaiThe: 'Thang', LoaiXe: 'XeMay', BienSoXe: '', NgayLap: new Date().toISOString().split('T')[0], NgayHetHan: '', TrangThai: 'Active', GhiChu: '' });
    setEditTarget(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreate(true);
  };

  const openEditModal = (card) => {
    setEditTarget(card);
    setForm({
      NguoiDungID: card.NguoiDungID || '',
      LoaiThe: card.LoaiThe || 'Thang',
      LoaiXe: card.LoaiXe || 'XeMay',
      BienSoXe: card.BienSoXe || '',
      NgayLap: card.NgayLap ? new Date(card.NgayLap).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      NgayHetHan: card.NgayHetHan ? new Date(card.NgayHetHan).toISOString().split('T')[0] : '',
      TrangThai: card.TrangThai || 'Active',
      GhiChu: card.GhiChu || '',
    });
    setShowCreate(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editTarget) {
        await axios.put(`/theguixe/${editTarget.ID}`, {
          TrangThai: form.TrangThai,
          NgayHetHan: form.NgayHetHan || null,
          BienSoXe: form.BienSoXe || null,
          GhiChu: form.GhiChu || null,
        });
      } else {
        const MaThe = `XE-${Date.now()}`;
        await axios.post('/theguixe', {
          ...form,
          MaThe,
          NguoiDungID: Number(form.NguoiDungID),
        });
      }
      setShowCreate(false);
      resetForm();
      fetchCards();
    } catch (err) {
      setError(err.response?.data?.message || (editTarget ? 'Không thể cập nhật thẻ xe' : 'Không thể tạo thẻ xe'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa thẻ xe này? Hành động này không thể hoàn tác.')) return;
    try {
      await axios.delete(`/theguixe/${id}`);
      fetchCards();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa thẻ xe');
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Quản Lý Xe Gửi</h1>
            <p className="text-gray-500 text-sm mt-1">Quản lý thẻ xe gửi trong tòa nhà</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchCards} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors">
              Làm mới
            </button>
            <button onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              + Thêm thẻ xe
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Tổng thẻ', value: stats.total, color: 'border-l-blue-500', text: 'text-blue-600' },
            { label: 'Đang hoạt động', value: stats.active, color: 'border-l-green-500', text: 'text-green-600' },
            { label: 'Hết hạn', value: stats.expired, color: 'border-l-red-500', text: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className={`bg-white border border-gray-200 rounded-xl p-4 border-l-4 ${s.color}`}>
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-semibold ${s.text}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-xl text-red-800 text-sm">{error}</div>}

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 flex gap-3 flex-wrap">
          <select value={filter.TrangThai} onChange={e => setFilter(f => ({ ...f, TrangThai: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Hoạt động</option>
            <option value="HetHan">Hết hạn</option>
            <option value="TamKhoa">Tạm khóa</option>
          </select>
          <select value={filter.LoaiXe} onChange={e => setFilter(f => ({ ...f, LoaiXe: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            <option value="">Tất cả loại xe</option>
            <option value="OTo">Ô tô</option>
            <option value="XeMay">Xe máy</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : cards.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center text-slate-400">
            <div className="text-5xl mb-3"></div>
            <p>Chưa có thẻ xe nào</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Mã thẻ', 'Chủ xe', 'Căn hộ', 'Loại xe', 'Biển số', 'Loại thẻ', 'Hết hạn', 'Trạng thái', 'Hành động'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cards.map(card => {
                    const status = STATUS_CONFIG[card.TrangThai] || STATUS_CONFIG.Active;
                    return (
                      <tr key={card.ID} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">{card.MaThe}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{card.nguoidung?.HoTen || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{card.canho?.MaCanHo || '-'}</td>
                        <td className="px-4 py-3 text-sm">{VEHICLE_ICONS[card.LoaiXe]} {card.LoaiXe === 'OTo' ? 'Ô tô' : 'Xe máy'}</td>
                        <td className="px-4 py-3 text-sm font-mono text-slate-700">{card.BienSoXe || '-'}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{CARD_TYPE[card.LoaiThe]}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {card.NgayHetHan ? new Date(card.NgayHetHan).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                            {status.icon} {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button onClick={() => openEditModal(card)}
                            className="mr-2 px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                            Sửa
                          </button>
                          <button onClick={() => handleDelete(card.ID)}
                            className="px-3 py-1 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gray-900 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-white font-bold">{editTarget ? 'Cập nhật thẻ xe' : 'Thêm thẻ xe mới'}</h3>
              <button onClick={() => { setShowCreate(false); resetForm(); }} className="text-slate-400 hover:text-white"></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Chủ xe *</label>
                  <select required value={form.NguoiDungID} onChange={e => setForm(f => ({ ...f, NguoiDungID: e.target.value }))}
                    disabled={!!editTarget}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-100 disabled:text-slate-500">
                    <option value="">Chọn người dùng</option>
                    {users.map(u => <option key={u.ID} value={u.ID}>{u.HoTen} {u.SoDienThoai ? `— ${u.SoDienThoai}` : ''}</option>)}
                  </select>
                </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Loại xe *</label>
                  <select value={form.LoaiXe} onChange={e => setForm(f => ({ ...f, LoaiXe: e.target.value }))}
                    disabled={!!editTarget}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-100 disabled:text-slate-500">
                    <option value="XeMay">Xe máy</option>
                    <option value="OTo">Ô tô</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Loại thẻ *</label>
                  <select value={form.LoaiThe} onChange={e => setForm(f => ({ ...f, LoaiThe: e.target.value }))}
                    disabled={!!editTarget}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-100 disabled:text-slate-500">
                    <option value="Thang">Theo tháng</option>
                    <option value="Ngay">Theo ngày</option>
                    <option value="Tam">Tạm thời</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Biển số xe</label>
                <input type="text" value={form.BienSoXe} onChange={e => setForm(f => ({ ...f, BienSoXe: e.target.value }))}
                  placeholder="VD: 59-X1 1234"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ngày lập *</label>
                  <input type="date" required value={form.NgayLap} onChange={e => setForm(f => ({ ...f, NgayLap: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ngày hết hạn</label>
                  <input type="date" value={form.NgayHetHan} onChange={e => setForm(f => ({ ...f, NgayHetHan: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              {editTarget && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Trạng thái</label>
                  <select value={form.TrangThai} onChange={e => setForm(f => ({ ...f, TrangThai: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="Active">Hoạt động</option>
                    <option value="HetHan">Hết hạn</option>
                    <option value="TamKhoa">Tạm khóa</option>
                    <option value="MatThe">Mất thẻ</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ghi chú</label>
                <textarea value={form.GhiChu} onChange={e => setForm(f => ({ ...f, GhiChu: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowCreate(false); resetForm(); }}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50">
                  Hủy
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                  {editTarget ? 'Cập nhật thẻ xe' : 'Tạo thẻ xe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingManagement;
