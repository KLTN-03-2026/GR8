// client/src/pages/thanhvien/ThanhVienCanHo.jsx
// Quản lý thành viên / khai báo ngoại trú

import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../api/axios';

const QUAN_HE = ['Vợ/Chồng', 'Con', 'Cha/Mẹ', 'Anh/Chị/Em', 'Bạn cùng phòng', 'Khác'];

const EMPTY_FORM = {
  HoTen: '', NgaySinh: '', GioiTinh: '', CCCD: '',
  SoDienThoai: '', QuanHe: '', DiaChiThuongTru: '', GhiChu: '',
};

const ThanhVienCanHo = ({ canHoID, gioiHan, readOnly = false, isAdmin = false, contract = null }) => {
  const [members, setMembers]     = useState([]);
  const [tenant, setTenant]       = useState(null);
  const [activeContract, setActiveContract] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const isSamePerson = (member, tenantData) => {
    if (!member || !tenantData) return false;
    if (tenantData.CCCD && member.CCCD && tenantData.CCCD === member.CCCD) return true;
    if (tenantData.SoDienThoai && member.SoDienThoai && tenantData.SoDienThoai === member.SoDienThoai) return true;
    if (tenantData.HoTen && member.HoTen && tenantData.NgaySinh && member.NgaySinh) {
      const tenantDob = new Date(tenantData.NgaySinh).toISOString().slice(0, 10);
      const memberDob = new Date(member.NgaySinh).toISOString().slice(0, 10);
      if (tenantData.HoTen === member.HoTen && tenantDob === memberDob) return true;
    }
    return false;
  };

  const dangO = members.filter(m => m.TrangThai === 'DangO');
  const daRoi = members.filter(m => m.TrangThai === 'DaRoi');

  const fetch = useCallback(async () => {
    if (!canHoID) return;
    try {
      setLoading(true);

      const membersRes = await axios.get(`/thanhvien/canho/${canHoID}`);
      const memberList = membersRes.data?.data || [];
      setMembers(memberList);

      if (contract) {
        setActiveContract(contract);
        setTenant(contract.nguoidung || null);
        return;
      }

      try {
        const contractRes = await axios.get(`/hopdong?canHoID=${canHoID}&trangThai=DangThue`);
        const active = contractRes.data?.data?.items?.[0] || contractRes.data?.data?.[0] || null;
        setActiveContract(active);
        setTenant(active?.nguoidung || null);
      } catch {
        setActiveContract(null);
        setTenant(null);
      }
    } catch {
      setMembers([]);
      setTenant(null);
      setActiveContract(null);
    } finally { setLoading(false); }
  }, [canHoID, contract]);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  const tenantDuplicate = tenant && members.some((m) => m.TrangThai === 'DangO' && isSamePerson(m, tenant));
  const occupiedCount = dangO.length + (tenant && !tenantDuplicate ? 1 : 0);
  const canAddMore = !gioiHan || occupiedCount < gioiHan;

  const openEdit = (m) => {
    setEditTarget(m);
    setForm({
      HoTen: m.HoTen || '',
      NgaySinh: m.NgaySinh ? m.NgaySinh.slice(0, 10) : '',
      GioiTinh: m.GioiTinh || '',
      CCCD: m.CCCD || '',
      SoDienThoai: m.SoDienThoai || '',
      QuanHe: m.QuanHe || '',
      DiaChiThuongTru: m.DiaChiThuongTru || '',
      GhiChu: m.GhiChu || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (editTarget) {
        await axios.patch(`/thanhvien/${editTarget.ID}`, form);
        setSuccess('Cập nhật thành công!');
      } else {
        await axios.post(`/thanhvien/canho/${canHoID}`, form);
        setSuccess('Thêm thành viên thành công!');
      }
      setShowModal(false);
      fetch();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally { setSaving(false); }
  };

  const handleCheckOut = async (id, name) => {
    if (!window.confirm(`Xác nhận ${name} đã rời khỏi căn hộ?`)) return;
    try {
      await axios.patch(`/thanhvien/${id}/checkout`);
      setSuccess(`Đã đánh dấu ${name} rời đi`);
      fetch();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa thành viên ${name}? Hành động này không thể hoàn tác.`)) return;
    try {
      await axios.delete(`/thanhvien/${id}`);
      setSuccess(`Đã xóa ${name}`);
      fetch();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Thành viên đang ở
            <span className={`ml-2 px-2 py-0.5 rounded-full text-sm font-bold ${
              gioiHan && occupiedCount >= gioiHan
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {occupiedCount}{gioiHan ? `/${gioiHan}` : ''} người
            </span>
          </h3>
          {gioiHan && (
            <p className="text-xs text-gray-500 mt-0.5">
              Giới hạn: {gioiHan} người ở (bao gồm chủ hộ)
            </p>
          )}
        </div>
        {!readOnly && (
          <button
            onClick={openAdd}
            disabled={!canAddMore}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              !canAddMore
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            + Thêm thành viên
          </button>
        )}
      </div>

      {/* Messages */}
      {success && <div className="bg-green-50 border-l-4 border-green-500 p-3 mb-3 rounded-r text-green-800 text-sm">{success}</div>}
      {error   && <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-3 rounded-r text-red-800 text-sm">{error}</div>}

      {/* Danh sách */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-3 mb-6">

          {/* Card Chủ hộ */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-base shadow">
                {tenant?.HoTen?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">{tenant?.HoTen || '—'}</p>
                  <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-semibold rounded-full">Chủ hộ</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-xs text-gray-500">
                  {(tenant?.CCCD || tenant?.SoGiayTo) && <span>CCCD: {tenant.CCCD || tenant.SoGiayTo}</span>}
                  {tenant?.SoDienThoai && <span>SĐT: {tenant.SoDienThoai}</span>}
                  {tenant?.NgaySinh && <span>Ngày sinh: {formatDate(tenant.NgaySinh)}</span>}
                  {tenant?.GioiTinh && <span>{tenant.GioiTinh}</span>}
                  {tenant?.Email && <span>{tenant.Email}</span>}
                </div>
                {(tenant?.DiaChi || tenant?.DiaChiThuongTru) && (
                  <p className="text-xs text-gray-400 mt-0.5">Địa chỉ: {tenant?.DiaChi || tenant?.DiaChiThuongTru}</p>
                )}
                {activeContract?.NgayBatDau && (
                  <p className="text-xs text-indigo-400 mt-0.5">Thuê từ: {formatDate(activeContract.NgayBatDau)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Thành viên phụ */}
          {dangO.filter(m => !tenant || !isSamePerson(m, tenant)).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Thành viên cùng ở</p>
              {dangO.filter(m => !tenant || !isSamePerson(m, tenant)).map(m => (
                <div key={m.ID} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 font-bold text-sm">
                      {m.HoTen?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{m.HoTen}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-gray-500">
                        {m.QuanHe      && <span>Quan hệ: {m.QuanHe}</span>}
                        {m.NgaySinh    && <span>Ngày sinh: {formatDate(m.NgaySinh)}</span>}
                        {m.CCCD        && <span>CCCD: {m.CCCD}</span>}
                        {m.SoDienThoai && <span>SĐT: {m.SoDienThoai}</span>}
                        {m.GioiTinh    && <span>{m.GioiTinh}</span>}
                      </div>
                      {m.DiaChiThuongTru && (
                        <p className="text-xs text-gray-400 mt-0.5">Địa chỉ: {m.DiaChiThuongTru}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">Đăng ký: {formatDate(m.NgayDangKy)}</p>
                    </div>
                  </div>
                  {!readOnly && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => openEdit(m)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200">
                        Sửa
                      </button>
                      <button onClick={() => handleCheckOut(m.ID, m.HoTen)}
                        className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-200">
                        Rời đi
                      </button>
                      {isAdmin && (
                        <button onClick={() => handleDelete(m.ID, m.HoTen)}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200">
                          Xóa
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!tenant && dangO.length === 0 && (
            <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">
              <p>Chưa có thành viên nào đăng ký</p>
            </div>
          )}
        </div>
      )}

      {/* Lịch sử đã rời */}
      {daRoi.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 font-medium">
            Lịch sử đã rời ({daRoi.length} người)
          </summary>
          <div className="mt-3 space-y-2">
            {daRoi.map(m => (
              <div key={m.ID} className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex items-center justify-between opacity-70">
                <div>
                  <p className="text-sm font-medium text-gray-700 line-through">{m.HoTen}</p>
                  <p className="text-xs text-gray-400">
                    {m.QuanHe && `${m.QuanHe} • `}
                    Rời: {formatDate(m.NgayRoi)}
                  </p>
                </div>
                {!readOnly && isAdmin && (
                  <button onClick={() => handleDelete(m.ID, m.HoTen)}
                    className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200">
                    Xóa
                  </button>
                )}
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Modal thêm/sửa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-lg font-bold text-white">
                {editTarget ? 'Sửa thông tin thành viên' : 'Thêm thành viên mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white hover:bg-white/20 rounded-full p-1 text-xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                  <input required value={form.HoTen} onChange={e => setF('HoTen', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="Nguyễn Văn A" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Ngày sinh</label>
                  <input type="date" value={form.NgaySinh} onChange={e => setF('NgaySinh', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Giới tính</label>
                  <select value={form.GioiTinh} onChange={e => setF('GioiTinh', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    <option value="">-- Chọn --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nu">Nữ</option>
                    <option value="Khac">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">CCCD/CMND</label>
                  <input value={form.CCCD} onChange={e => setF('CCCD', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="012345678901" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Số điện thoại</label>
                  <input value={form.SoDienThoai} onChange={e => setF('SoDienThoai', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="0901234567" />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Quan hệ với chủ hộ</label>
                  <select value={form.QuanHe} onChange={e => setF('QuanHe', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    <option value="">-- Chọn quan hệ --</option>
                    {QUAN_HE.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Địa chỉ thường trú</label>
                  <input value={form.DiaChiThuongTru} onChange={e => setF('DiaChiThuongTru', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Ghi chú</label>
                  <textarea rows={2} value={form.GhiChu} onChange={e => setF('GhiChu', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Ghi chú thêm..." />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50">
                  Hủy
                </button>
                <button type="submit" disabled={saving}
                  className={`flex-1 py-2.5 rounded-lg text-white text-sm font-semibold ${
                    saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}>
                  {saving ? 'Đang lưu...' : editTarget ? 'Cập nhật' : 'Thêm thành viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThanhVienCanHo;
