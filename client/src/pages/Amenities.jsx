// client/src/pages/Amenities.jsx
// Quản lý tiện ích căn hộ (WiFi, hồ bơi, gym, bãi đỗ xe...)
// Tab 1: Danh mục tiện ích (CRUD)
// Tab 2: Gán / gỡ tiện ích cho từng căn hộ

import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';

const AMENITY_ICONS = {
  'wifi': '', 'internet': '',
  'hồ bơi': '', 'ho boi': '', 'bơi': '',
  'gym': '', 'phòng tập': '', 'tập': '',
  'bãi đỗ': '', 'đỗ xe': '', 'parking': '',
  'thang máy': '', 'elevator': '',
  'bảo vệ': '', 'security': '',
  'điều hòa': '', 'máy lạnh': '',
  'tủ lạnh': '',
  'máy giặt': '', 'giặt': '',
  'bếp': '', 'kitchen': '',
  'tivi': '', 'tv': '',
  'sân': '', 'vườn': '', 'garden': '',
  'ban công': '', 'balcony': '',
  'lễ tân': '', 'reception': '',
};

const getIcon = (name = '') => {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(AMENITY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '';
};

//  Modal thêm / sửa tiện ích 
const AmenityModal = ({ amenity, onClose, onSaved }) => {
  const isEdit = !!amenity;
  const [form, setForm] = useState(
    isEdit
      ? { TenTienIch: amenity.TenTienIch, MoTa: amenity.MoTa || '' }
      : { TenTienIch: '', MoTa: '' }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (isEdit) await axios.put(`/tienich/${amenity.ID}`, form);
      else await axios.post('/tienich', form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {isEdit ? 'Sửa tiện ích' : 'Thêm tiện ích mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên tiện ích *</label>
            <input required value={form.TenTienIch}
              onChange={e => setForm(f => ({ ...f, TenTienIch: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="VD: WiFi tốc độ cao, Hồ bơi, Gym..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea rows={3} value={form.MoTa}
              onChange={e => setForm(f => ({ ...f, MoTa: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              placeholder="Mô tả chi tiết tiện ích..." />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium">Hủy</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium disabled:opacity-60">
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

//  Modal gán tiện ích cho căn hộ 
const AssignModal = ({ canho, allAmenities, assigned, onClose, onChanged }) => {
  const [saving, setSaving] = useState(null); // id đang xử lý
  const assignedIds = new Set(assigned.map(a => a.ID));

  const toggle = async (amenityId, isAssigned) => {
    setSaving(amenityId);
    try {
      if (isAssigned) {
        await axios.delete(`/tienich/canho/${canho.ID}/${amenityId}`);
      } else {
        await axios.post(`/tienich/canho/${canho.ID}`, { TienIchID: amenityId });
      }
      onChanged();
    } catch (err) {
      alert(err.response?.data?.message || 'Thao tác thất bại');
    } finally { setSaving(null); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Gán tiện ích</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {canho.MaCanHo}  Phòng {canho.SoPhong}, Tầng {canho.Tang}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto p-6 space-y-2">
          {allAmenities.length === 0 && (
            <p className="text-center text-gray-400 py-8">Chưa có tiện ích nào trong danh mục.</p>
          )}
          {allAmenities.map(a => {
            const isAssigned = assignedIds.has(a.ID);
            const isLoading = saving === a.ID;
            return (
              <div key={a.ID}
                className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                  isAssigned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getIcon(a.TenTienIch)}</span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{a.TenTienIch}</p>
                    {a.MoTa && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{a.MoTa}</p>}
                  </div>
                </div>
                <button
                  disabled={isLoading}
                  onClick={() => toggle(a.ID, isAssigned)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                    isAssigned
                      ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isLoading ? '...' : isAssigned ? 'Gỡ' : '+ Gán'}
                </button>
              </div>
            );
          })}
        </div>
        <div className="px-6 py-4 border-t flex-shrink-0">
          <button onClick={onClose}
            className="w-full py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

//  Trang chính 
const Amenities = () => {
  const [tab, setTab]             = useState('amenities'); // 'amenities' | 'assign'
  const [amenities, setAmenities] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);       // null | 'add' | amenity-obj
  const [assignModal, setAssignModal] = useState(null);   // null | { canho, assigned[] }
  const [toast, setToast]         = useState('');
  const [search, setSearch]       = useState('');
  const [aptSearch, setAptSearch] = useState('');
  const [deleteId, setDeleteId]   = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchAmenities = useCallback(async () => {
    try {
      const res = await axios.get('/tienich');
      setAmenities(res.data?.data || []);
    } catch { showToast(' Không thể tải tiện ích'); }
  }, []);

  const fetchApartments = useCallback(async () => {
    try {
      const res = await axios.get('/apartments', { params: { limit: 100 } });
      // getAllApartments trả về { items, pagination }
      const raw = res.data?.data;
      const list = Array.isArray(raw) ? raw : (raw?.items || []);
      setApartments(list);
    } catch { showToast(' Không thể tải căn hộ'); }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchAmenities(), fetchApartments()]);
      setLoading(false);
    };
    load();
  }, [fetchAmenities, fetchApartments]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/tienich/${id}`);
      showToast(' Đã xóa tiện ích');
      fetchAmenities();
    } catch (err) {
      showToast(' ' + (err.response?.data?.message || 'Xóa thất bại'));
    } finally { setDeleteId(null); }
  };

  // Mở modal gán: dùng data canho_tienich đã có sẵn từ fetchApartments
  const openAssign = (canho) => {
    const assigned = (canho.canho_tienich || [])
      .map(ct => ct.tienich)
      .filter(Boolean);
    setAssignModal({ canho, assigned });
  };

  const refreshAssign = async () => {
    if (!assignModal) return;
    try {
      const res = await axios.get(`/apartments/${assignModal.canho.ID}`);
      const assigned = (res.data?.data?.canho_tienich || [])
        .map(ct => ct.tienich)
        .filter(Boolean);
      setAssignModal(prev => ({ ...prev, assigned }));
      // Cập nhật luôn trong danh sách apartments
      fetchApartments();
    } catch { /* silent */ }
  };

  const filteredAmenities = amenities.filter(a =>
    !search || a.TenTienIch.toLowerCase().includes(search.toLowerCase())
  );

  const filteredApts = apartments.filter(a =>
    !aptSearch ||
    a.MaCanHo?.toLowerCase().includes(aptSearch.toLowerCase()) ||
    String(a.SoPhong).includes(aptSearch) ||
    String(a.Tang).includes(aptSearch)
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
    </div>
  );

  return (
    <div className="p-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 shadow-lg rounded-xl px-5 py-3 text-sm font-medium text-gray-800">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Quản lý Tiện ích Căn hộ</h1>
        {tab === 'amenities' && (
          <button onClick={() => setModal('add')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            <span className="text-lg leading-none">+</span> Thêm tiện ích
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button onClick={() => setTab('amenities')}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'amenities' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          Danh mục tiện ích
          <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{amenities.length}</span>
        </button>
        <button onClick={() => setTab('assign')}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'assign' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          Gán cho căn hộ
          <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{apartments.length}</span>
        </button>
      </div>

      {/*  Tab: Danh mục tiện ích  */}
      {tab === 'amenities' && (
        <>
          <div className="flex gap-3 mb-5">
            <input type="text" placeholder="Tìm tiện ích..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-green-400" />
            <span className="ml-auto text-sm text-gray-400 self-center">{filteredAmenities.length} tiện ích</span>
          </div>

          {filteredAmenities.length === 0 ? (
            <div className="text-center text-gray-400 py-20">
              <p className="text-lg">Chưa có tiện ích nào.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAmenities.map(a => (
                <div key={a.ID}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{getIcon(a.TenTienIch)}</span>
                      <p className="font-semibold text-gray-900 text-sm leading-tight">{a.TenTienIch}</p>
                    </div>
                  </div>
                  {a.MoTa && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{a.MoTa}</p>}
                  <div className="flex gap-2 mt-auto">
                    <button onClick={() => setModal(a)}
                      className="flex-1 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100">
                      Sửa
                    </button>
                    <button onClick={() => setDeleteId(a.ID)}
                      className="flex-1 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100">
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/*  Tab: Gán cho căn hộ  */}
      {tab === 'assign' && (
        <>
          <div className="flex gap-3 mb-5">
            <input type="text" placeholder="Tìm căn hộ (mã, phòng, tầng)..." value={aptSearch}
              onChange={e => setAptSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-green-400" />
            <span className="ml-auto text-sm text-gray-400 self-center">{filteredApts.length} căn hộ</span>
          </div>

          {filteredApts.length === 0 ? (
            <div className="text-center text-gray-400 py-20 text-lg">Không có căn hộ nào.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl shadow border border-gray-100">
              <table className="min-w-full bg-white text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Mã căn hộ', 'Phòng', 'Tầng', 'Diện tích', 'Trạng thái', 'Tiện ích đã gán', 'Thao tác'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredApts.map(apt => {
                    const tienichList = apt.canho_tienich || [];
                    return (
                      <tr key={apt.ID} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{apt.MaCanHo}</td>
                        <td className="px-4 py-3 text-gray-600">{apt.SoPhong}</td>
                        <td className="px-4 py-3 text-gray-600">{apt.Tang}</td>
                        <td className="px-4 py-3 text-gray-600">{apt.DienTich} m</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            apt.TrangThai === 'Trong'   ? 'bg-green-100 text-green-700' :
                            apt.TrangThai === 'DaThue'  ? 'bg-blue-100 text-blue-700' :
                            apt.TrangThai === 'BaoTri'  ? 'bg-yellow-100 text-yellow-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {apt.TrangThai === 'Trong' ? 'Trống' :
                             apt.TrangThai === 'DaThue' ? 'Đã thuê' :
                             apt.TrangThai === 'BaoTri' ? 'Bảo trì' : 'Đang dọn'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {tienichList.length === 0
                              ? <span className="text-gray-400 text-xs">Chưa có</span>
                              : tienichList.slice(0, 3).map(ct => (
                                  <span key={ct.TienIchID || ct.tienich?.ID}
                                    className="text-base" title={ct.tienich?.TenTienIch}>
                                    {getIcon(ct.tienich?.TenTienIch)}
                                  </span>
                                ))
                            }
                            {tienichList.length > 3 && (
                              <span className="text-xs text-gray-400">+{tienichList.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => openAssign(apt)}
                            className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100">
                            Quản lý
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal thêm/sửa tiện ích */}
      {modal && (
        <AmenityModal
          amenity={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); showToast(' Lưu thành công'); fetchAmenities(); }}
        />
      )}

      {/* Modal gán tiện ích cho căn hộ */}
      {assignModal && (
        <AssignModal
          canho={assignModal.canho}
          allAmenities={amenities}
          assigned={assignModal.assigned}
          onClose={() => { setAssignModal(null); fetchApartments(); }}
          onChanged={refreshAssign}
        />
      )}

      {/* Confirm xóa */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center">
            <div className="text-4xl mb-3"></div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Xác nhận xóa</h3>
            <p className="text-gray-600 text-sm mb-5">Tiện ích sẽ bị xóa khỏi tất cả căn hộ đang gán.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteId(null)}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium">Hủy</button>
              <button onClick={() => handleDelete(deleteId)}
                className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Amenities;
