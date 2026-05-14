// client/src/pages/lichtruc/DutySchedule.jsx
// Trang quản lý lịch trực cho kỹ thuật viên

import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';

const SHIFT_CONFIG = {
  Sang:   { label: 'Ca sáng',   color: 'bg-yellow-100 text-yellow-800', time: '6:00 - 12:00' },
  Chieu:  { label: 'Ca chiều',  color: 'bg-orange-100 text-orange-800', time: '12:00 - 18:00' },
  Toi:    { label: 'Ca tối',    color: 'bg-indigo-100 text-indigo-800', time: '18:00 - 24:00' },
  CaNgay: { label: 'Cả ngày',   color: 'bg-green-100 text-green-800',   time: '6:00 - 18:00' },
};

const STATUS_CONFIG = {
  DangTruc: { label: 'Đang trực', color: 'bg-blue-100 text-blue-800' },
  DaTruc:   { label: 'Đã trực',   color: 'bg-gray-100 text-gray-800' },
  Huy:      { label: 'Đã hủy',    color: 'bg-red-100 text-red-800' },
};

const DutySchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month'); // 'month' or 'week'
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [formData, setFormData] = useState({
    NhanVienID: '',
    NgayTruc: '',
    CaTruc: 'CaNgay',
    GhiChu: ''
  });

  // Bulk add state
  const [bulkData, setBulkData] = useState({
    NhanVienID: '',
    startDate: '',
    endDate: '',
    CaTruc: 'CaNgay',
    daysOfWeek: [1, 2, 3, 4, 5] // Mon-Fri
  });

  useEffect(() => {
    fetchSchedules();
    fetchStaff();
  }, [currentDate]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const res = await axios.get(`/lichtruc/month/${year}/${month}`);
      setSchedules(res.data.data || []);
      setError('');
    } catch (err) {
      setError('Không thể tải lịch trực');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await axios.get('/yeucausuco/staff/available');
      setStaff(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/lichtruc', formData);
      setSuccess('Đã thêm lịch trực thành công!');
      setShowAddModal(false);
      setFormData({ NhanVienID: '', NgayTruc: '', CaTruc: 'CaNgay', GhiChu: '' });
      fetchSchedules();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể thêm lịch trực');
    }
  };

  const handleBulkAdd = async (e) => {
    e.preventDefault();
    try {
      const { NhanVienID, startDate, endDate, CaTruc, daysOfWeek } = bulkData;
      
      // Generate schedules for selected days
      const schedules = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay(); // Convert Sunday from 0 to 7
        if (daysOfWeek.includes(dayOfWeek)) {
          schedules.push({
            NhanVienID,
            NgayTruc: d.toISOString().split('T')[0],
            CaTruc
          });
        }
      }

      await axios.post('/lichtruc/bulk', { schedules });
      setSuccess(`Đã tạo ${schedules.length} lịch trực!`);
      setShowBulkModal(false);
      setBulkData({ NhanVienID: '', startDate: '', endDate: '', CaTruc: 'CaNgay', daysOfWeek: [1, 2, 3, 4, 5] });
      fetchSchedules();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo lịch trực hàng loạt');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy lịch trực này?')) return;
    
    try {
      await axios.put(`/lichtruc/${id}/cancel`);
      setSuccess('Đã hủy lịch trực');
      fetchSchedules();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Không thể hủy lịch trực');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa lịch trực này? Hành động này không thể hoàn tác.')) return;
    
    try {
      await axios.delete(`/lichtruc/${id}`);
      setSuccess('Đã xóa lịch trực');
      fetchSchedules();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Không thể xóa lịch trực');
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getSchedulesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(s => {
      const scheduleDate = new Date(s.NgayTruc).toISOString().split('T')[0];
      return scheduleDate === dateStr && s.TrangThai !== 'Huy';
    });
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const days = [];
    const today = new Date().toISOString().split('T')[0];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-24 bg-gray-50 border border-gray-200" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const daySchedules = getSchedulesForDate(date);
      const isToday = dateStr === today;

      days.push(
        <div
          key={day}
          className={`min-h-24 border border-gray-200 p-2 ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}
        >
          <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
            {day}
            {isToday && <span className="ml-1 text-xs">(Hôm nay)</span>}
          </div>
          <div className="space-y-1">
            {daySchedules.map(schedule => {
              const shift = SHIFT_CONFIG[schedule.CaTruc] || SHIFT_CONFIG.CaNgay;
              return (
                <div
                  key={schedule.ID}
                  className={`text-xs p-1.5 rounded ${shift.color} cursor-pointer hover:opacity-80`}
                  title={`${schedule.nguoidung_lichtruc_NhanVienIDTonguoidung?.HoTen} - ${shift.label}`}
                >
                  <div className="font-semibold truncate">
                    {schedule.nguoidung_lichtruc_NhanVienIDTonguoidung?.HoTen}
                  </div>
                  <div className="text-xs opacity-75">{shift.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return days;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="w-full">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">📅 Lịch Trực Kỹ Thuật</h1>
            <p className="text-slate-500">Quản lý lịch trực theo ngày và ca</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowBulkModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Tạo hàng loạt
            </button>
            <button onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm lịch trực
            </button>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-r-xl text-green-800 text-sm flex items-center gap-2">
            <span>✅</span> {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-xl text-red-800 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Calendar Controls */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-slate-900 min-w-48 text-center">
              Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}
            </h2>
            <button onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <button onClick={goToToday}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors">
            Hôm nay
          </button>
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 bg-slate-100 border-b border-gray-200">
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-semibold text-slate-700">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {renderCalendar()}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-5 bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Chú thích ca trực</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(SHIFT_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${config.color}`} />
                <div>
                  <div className="text-sm font-semibold text-slate-900">{config.label}</div>
                  <div className="text-xs text-slate-500">{config.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">➕ Thêm lịch trực</h3>
              <button onClick={() => { setShowAddModal(false); setError(''); }}
                className="text-white/80 hover:text-white text-3xl leading-none">×</button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Kỹ thuật viên <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.NhanVienID}
                  onChange={e => setFormData({ ...formData, NhanVienID: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                >
                  <option value="">-- Chọn kỹ thuật viên --</option>
                  {staff.map(s => (
                    <option key={s.ID} value={s.ID}>{s.HoTen}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ngày trực <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.NgayTruc}
                  onChange={e => setFormData({ ...formData, NgayTruc: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ca trực <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.CaTruc}
                  onChange={e => setFormData({ ...formData, CaTruc: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                >
                  {Object.entries(SHIFT_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label} ({config.time})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={formData.GhiChu}
                  onChange={e => setFormData({ ...formData, GhiChu: e.target.value })}
                  rows={2}
                  placeholder="Ghi chú về lịch trực..."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2 border-t">
                <button type="button" onClick={() => { setShowAddModal(false); setError(''); }}
                  className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50">
                  Hủy
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
                  Thêm lịch trực
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">📅 Tạo lịch trực hàng loạt</h3>
              <button onClick={() => { setShowBulkModal(false); setError(''); }}
                className="text-white/80 hover:text-white text-3xl leading-none">×</button>
            </div>
            <form onSubmit={handleBulkAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Kỹ thuật viên <span className="text-red-500">*</span>
                </label>
                <select
                  value={bulkData.NhanVienID}
                  onChange={e => setBulkData({ ...bulkData, NhanVienID: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  required
                >
                  <option value="">-- Chọn kỹ thuật viên --</option>
                  {staff.map(s => (
                    <option key={s.ID} value={s.ID}>{s.HoTen}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Từ ngày <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={bulkData.startDate}
                    onChange={e => setBulkData({ ...bulkData, startDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Đến ngày <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={bulkData.endDate}
                    onChange={e => setBulkData({ ...bulkData, endDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ca trực <span className="text-red-500">*</span>
                </label>
                <select
                  value={bulkData.CaTruc}
                  onChange={e => setBulkData({ ...bulkData, CaTruc: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  required
                >
                  {Object.entries(SHIFT_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label} ({config.time})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Các ngày trong tuần
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {[
                    { value: 1, label: 'T2' },
                    { value: 2, label: 'T3' },
                    { value: 3, label: 'T4' },
                    { value: 4, label: 'T5' },
                    { value: 5, label: 'T6' },
                    { value: 6, label: 'T7' },
                    { value: 7, label: 'CN' }
                  ].map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => {
                        const days = bulkData.daysOfWeek.includes(day.value)
                          ? bulkData.daysOfWeek.filter(d => d !== day.value)
                          : [...bulkData.daysOfWeek, day.value];
                        setBulkData({ ...bulkData, daysOfWeek: days });
                      }}
                      className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                        bulkData.daysOfWeek.includes(day.value)
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t">
                <button type="button" onClick={() => { setShowBulkModal(false); setError(''); }}
                  className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50">
                  Hủy
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700">
                  Tạo lịch trực
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DutySchedule;
