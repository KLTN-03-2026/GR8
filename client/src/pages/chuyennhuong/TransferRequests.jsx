// client/src/pages/chuyennhuong/TransferRequests.jsx
// ChuNha duyệt yêu cầu chuyển nhượng

import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';

const STATUS_CONFIG = {
  ChoDuyet: { label: 'Chờ xét duyệt', color: 'bg-yellow-100 text-yellow-800', icon: '' },
  DaDuyet: { label: 'Đã chấp thuận họp mặt', color: 'bg-green-100 text-green-800', icon: '' },
  TuChoi: { label: 'Từ chối', color: 'bg-red-100 text-red-800', icon: '' },
  DaHoanThanh: { label: 'Hoàn thành', color: 'bg-blue-100 text-blue-800', icon: '' },
};

const TransferRequests = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approveModal, setApproveModal] = useState(null);
  const [meetingDay, setMeetingDay] = useState('');
  const [meetingMonth, setMeetingMonth] = useState('');
  const [meetingYear, setMeetingYear] = useState('');
  const [meetingHour, setMeetingHour] = useState('');
  const [meetingMinute, setMeetingMinute] = useState('');
  const [meetingPlace, setMeetingPlace] = useState('');

  useEffect(() => { fetchTransfers(); }, [filterStatus]);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  const years = [currentYear, currentYear + 1];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const getDaysInMonth = (year, month) => {
    if (!year || !month) return 31;
    return new Date(year, month, 0).getDate();
  };

  const getAvailableMonths = (year) => {
    if (Number(year) !== currentYear) return months;
    return months.filter((m) => m >= currentMonth);
  };

  const getAvailableDays = (year, month) => {
    const selectedYear = Number(year) || currentYear;
    const selectedMonth = Number(month) || currentMonth;
    const totalDays = getDaysInMonth(selectedYear, selectedMonth);
    const startDay = selectedYear === currentYear && selectedMonth === currentMonth ? currentDay : 1;
    return Array.from({ length: totalDays - startDay + 1 }, (_, i) => i + startDay);
  };

  const pad2 = (value) => String(value).padStart(2, '0');
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18 ,19, 20, 21, 22];
  const minutes = ['00', '15', '30', '45'];

  const getAvailableHours = () => {
    if (Number(meetingYear) === currentYear && Number(meetingMonth) === currentMonth && Number(meetingDay) === currentDay) {
      return hours.filter((h) => h >= today.getHours());
    }
    return hours;
  };

  useEffect(() => {
    const available = getAvailableHours();
    if (meetingHour && !available.includes(Number(meetingHour))) {
      setMeetingHour('');
    }
  }, [meetingDay, meetingMonth, meetingYear]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const params = filterStatus !== 'all' ? { TrangThai: filterStatus } : {};
      const res = await axios.get('/chuyennhuong', { params });
      const data = res.data.data || res.data || [];
      setTransfers(Array.isArray(data) ? data : []);
    } catch { setError('Không thể tải danh sách chuyển nhượng'); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    if (!meetingDay || !meetingMonth || !meetingYear || !meetingHour || !meetingMinute || !meetingPlace.trim()) {
      setError('Vui lòng chọn ngày giờ và địa điểm họp mặt');
      return;
    }

    const year = Number(meetingYear);
    const month = Number(meetingMonth) - 1;
    const day = Number(meetingDay);
    const hour = Number(meetingHour);
    const minute = Number(meetingMinute);

    const datetime = new Date(year, month, day, hour, minute);
    if (Number.isNaN(datetime.getTime())) {
      setError('Ngày giờ họp mặt không hợp lệ');
      return;
    }

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const selectedDate = new Date(year, month, day);
    if (selectedDate < todayStart) {
      setError('Vui lòng chọn ngày hôm nay hoặc sau hôm nay');
      return;
    }
    if (datetime < today) {
      setError('Vui lòng chọn giờ trong tương lai');
      return;
    }

    setProcessingId(id);
    setError('');

    try {
      await axios.put(`/chuyennhuong/${id}/duyet`, {
        NgayHen: datetime.toISOString(),
        NoiDungHen: meetingPlace.trim(),
      });
      setSuccess('Đã duyệt và lên lịch họp mặt cho yêu cầu chuyển nhượng.');
      setApproveModal(null);
      setMeetingDay('');
      setMeetingMonth('');
      setMeetingYear('');
      setMeetingHour('');
      setMeetingMinute('');
      setMeetingPlace('');
      fetchTransfers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể duyệt yêu cầu');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setProcessingId(rejectModal);
    setError('');

    try {
      await axios.put(`/chuyennhuong/${rejectModal}/tuchoi`, { LyDoTuChoi: rejectReason });
      setSuccess('Đã từ chối yêu cầu chuyển nhượng.');
      setRejectModal(null);
      setRejectReason('');
      fetchTransfers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể từ chối yêu cầu');
    } finally {
      setProcessingId(null);
    }
  };

  const pending = transfers.filter(t => t.TrangThai === 'ChoDuyet').length;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Duyệt Chuyển Nhượng</h1>
            <p className="text-gray-500 text-sm mt-1">
              Xem xét và lên lịch họp mặt cho yêu cầu chuyển nhượng hợp đồng thuê
              {pending > 0 && <span className="ml-2 px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-medium">{pending} chờ duyệt</span>}
            </p>
          </div>
          <button onClick={fetchTransfers} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors">
            Làm mới
          </button>
        </div>

        {success && <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-r-xl text-green-800 text-sm font-medium">{success}</div>}
        {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-xl text-red-800 text-sm">{error}</div>}

        {/* Filter */}
        <div className="bg-white border border-gray-200 rounded-xl p-2 inline-flex gap-2 mb-6">
          {[['all', 'Tất cả'], ['ChoDuyet', 'Chờ duyệt'], ['DaDuyet', 'Đã chấp thuận'], ['TuChoi', 'Từ chối']].map(([val, label]) => (
            <button key={val} onClick={() => setFilterStatus(val)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === val ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
          </div>
        ) : transfers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <div className="text-5xl mb-4"></div>
            <h3 className="text-lg font-semibold text-slate-900">Không có yêu cầu chuyển nhượng</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {transfers.map(tr => {
              const st = STATUS_CONFIG[tr.TrangThai] || STATUS_CONFIG.ChoDuyet;
              return (
                <div key={tr.ID} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-slate-900 text-lg">Yêu cầu chuyển nhượng #{tr.ID}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${st.color}`}>{st.icon} {st.label}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                        <p><span className="font-medium">Người yêu cầu:</span> {tr.nguoidung_chuyennhuong_NguoiThueCuIDTonguoidung?.HoTen || 'N/A'}</p>
                        <p><span className="font-medium">Hợp đồng #:</span> {tr.HopDongID}</p>
                        <p><span className="font-medium">Căn hộ:</span> {tr.hopdong_chuyennhuong_HopDongIDTohopdong?.canho?.MaCanHo || 'N/A'}</p>
                        <p><span className="font-medium">Ngày yêu cầu:</span> {tr.NgayYeuCau ? new Date(tr.NgayYeuCau).toLocaleDateString('vi-VN') : 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 mb-4">
                    <p className="text-sm"><span className="font-semibold text-slate-700">Người chuyển vào: </span>{tr.ThongTinNguoiChuyenVao || tr.nguoidung_chuyennhuong_NguoiThueMoiIDTonguoidung?.HoTen || 'Chưa có thông tin'}</p>
                    <p className="text-sm mt-2"><span className="font-semibold text-slate-700">Lý do: </span>{tr.LyDo}</p>
                    {tr.GhiChu && <p className="text-sm mt-1"><span className="font-semibold text-slate-700">Ghi chú: </span>{tr.GhiChu}</p>}
                    {tr.TrangThai === 'TuChoi' && tr.LyDoTuChoi && <p className="text-sm mt-1 text-red-600"><span className="font-semibold">Lý do từ chối: </span>{tr.LyDoTuChoi}</p>}
                    {tr.TrangThai === 'DaDuyet' && tr.NgayHen && <p className="text-sm mt-1 text-green-700"><span className="font-semibold">Lịch hẹn: </span>{new Date(tr.NgayHen).toLocaleString('vi-VN')} - {tr.NoiDungHen}</p>}
                  </div>

                  {tr.TrangThai === 'ChoDuyet' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setApproveModal(tr.ID)}
                        disabled={processingId === tr.ID}
                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
                      >
                        {processingId === tr.ID ? 'Đang xử lý...' : 'Duyệt và hẹn gặp'}
                      </button>
                      <button
                        onClick={() => setRejectModal(tr.ID)}
                        disabled={processingId === tr.ID}
                        className="flex-1 py-2.5 bg-red-50 text-red-600 border-2 border-red-200 rounded-xl font-semibold text-sm hover:bg-red-100 transition-all disabled:opacity-60"
                      >
                         Từ chối
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Lên lịch họp mặt</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Ngày</label>
                <div className="grid grid-cols-3 gap-3">
                  <select value={meetingDay} onChange={e => setMeetingDay(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white cursor-pointer hover:border-indigo-300 transition-colors">
                    <option value="">Ngày</option>
                    {getAvailableDays(meetingYear, meetingMonth).map((day) => (
                      <option key={day} value={day}>{pad2(day)}</option>
                    ))}
                  </select>
                  <select value={meetingMonth} onChange={e => setMeetingMonth(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white cursor-pointer hover:border-indigo-300 transition-colors">
                    <option value="">Tháng</option>
                    {getAvailableMonths(meetingYear).map((month) => (
                      <option key={month} value={month}>{pad2(month)}</option>
                    ))}
                  </select>
                  <select value={meetingYear} onChange={e => setMeetingYear(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white cursor-pointer hover:border-indigo-300 transition-colors">
                    <option value="">Năm</option>
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Giờ</label>
                <div className="grid grid-cols-2 gap-3">
                  <select value={meetingHour} onChange={e => setMeetingHour(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white cursor-pointer hover:border-indigo-300 transition-colors">
                    <option value="">Giờ</option>
                    {getAvailableHours().map((hour) => (
                      <option key={hour} value={pad2(hour)}>{pad2(hour)}</option>
                    ))}
                  </select>
                  <select value={meetingMinute} onChange={e => setMeetingMinute(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white cursor-pointer hover:border-indigo-300 transition-colors">
                    <option value="">Phút</option>
                    {minutes.map((minute) => (
                      <option key={minute} value={minute}>{minute}</option>
                    ))}
                  </select>
                </div>
                {meetingHour && meetingMinute && (
                  <p className="text-sm text-slate-600 mt-2">Giờ đã chọn: <span className="font-semibold">{meetingHour}:{meetingMinute}</span></p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Địa điểm / Ghi chú</label>
                <textarea value={meetingPlace} onChange={e => setMeetingPlace(e.target.value)} rows={3}
                  placeholder="Ví dụ: Văn phòng quản lý tầng 1 hoặc hotline để liên hệ"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setApproveModal(null); setMeetingDay(''); setMeetingMonth(''); setMeetingYear(''); setMeetingHour(''); setMeetingMinute(''); setMeetingPlace(''); }}
                className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-50">
                Hủy
              </button>
              <button onClick={() => handleApprove(approveModal)} disabled={processingId === approveModal}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60">
                {processingId === approveModal ? 'Đang xử lý...' : 'Xác nhận lên lịch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4"> Từ chối yêu cầu</h3>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Lý do từ chối (tùy chọn)</label>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                rows={3} placeholder="Nhập lý do từ chối..."
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-50">
                Hủy
              </button>
              <button onClick={handleReject} disabled={processingId !== null}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-60">
                {processingId !== null ? 'Đang xử lý...' : ' Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferRequests;
