// client/src/pages/yeucausuco/AssignIncidents.jsx
// Trang phân công sự cố cho Quản lý

import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const PRIORITY_CONFIG = {
  Cao:   { label: 'Cao',   color: 'bg-slate-100 text-slate-800 border-slate-300', dot: 'bg-slate-400' },
  Trung: { label: 'Trung', color: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-300' },
  Thap:  { label: 'Thấp',  color: 'bg-slate-100 text-slate-600 border-slate-300', dot: 'bg-slate-200' },
};

const STATUS_CONFIG = {
  Moi:           { label: 'Chưa phân công', color: 'bg-slate-100 text-slate-700' },
  DangXuLy:      { label: 'Đã phân công',   color: 'bg-slate-200 text-slate-800' },
  DaGiaiQuyet:   { label: 'Đã hoàn thành',  color: 'bg-slate-700 text-white' },
};

const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format "YYYY-MM-DD" → "DD/MM/YYYY" không bị lệch timezone
const formatLocalDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const AssignIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState({ TrangThai: 'Moi', DoUuTien: '', search: '' });
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ total: 0, unassigned: 0, assigned: 0, completed: 0 });
  
  // New states for staff work detail modal
  const [showStaffWorkModal, setShowStaffWorkModal] = useState(false);
  const [selectedStaffWork, setSelectedStaffWork] = useState(null);
  const [staffWorkList, setStaffWorkList] = useState([]);
  const [loadingStaffWork, setLoadingStaffWork] = useState(false);
  const [staffWorkFilter, setStaffWorkFilter] = useState('all'); // 'all', 'inProgress', 'completed'
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [selectedDate, setSelectedDate] = useState(toLocalDateString(new Date()));
  
  // New states for duty schedule management
  const [showDutyCalendar, setShowDutyCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthSchedules, setMonthSchedules] = useState([]);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [showAddDutyModal, setShowAddDutyModal] = useState(false);
  const [selectedDutyDate, setSelectedDutyDate] = useState('');
  const [dutyForm, setDutyForm] = useState({
    NhanVienID: '',
    CaTruc: 'CaNgay',
    GhiChu: ''
  });

  useEffect(() => { fetchIncidents(); fetchStaff(); }, [filter]);
  
  // Update schedule data when selectedDate changes
  useEffect(() => {
    if (showScheduleModal && selectedDate) {
      handleSearchSchedule(selectedDate);
    }
  }, [selectedDate, showScheduleModal]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/yeucausuco', { params: filter });
      const data = res.data.data || res.data.items || res.data || [];
      const arr = Array.isArray(data) ? data : [];
      setIncidents(arr);
      setStats({
        total: arr.length,
        unassigned: arr.filter(i => i.TrangThai === 'Moi').length,
        assigned: arr.filter(i => i.TrangThai === 'DangXuLy').length,
        completed: arr.filter(i => i.TrangThai === 'DaGiaiQuyet').length,
      });
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách sự cố');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await axios.get('/yeucausuco/staff/available');
      const data = res.data.data || [];
      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    }
  };

  const handleOpenAssign = (incident) => {
    setSelectedIncident(incident);
    setSelectedStaff(incident.NhanVienXuLyID || '');
    setAssignNote('');
    setShowAssignModal(true);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedStaff) {
      setError('Vui lòng chọn kỹ thuật viên');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await axios.post(`/yeucausuco/${selectedIncident.ID}/assign`, {
        NhanVienXuLyID: selectedStaff,
        GhiChu: assignNote
      });

      setSuccess('Phân công kỹ thuật viên thành công!');
      setShowAssignModal(false);
      setSelectedIncident(null);
      setSelectedStaff('');
      setAssignNote('');
      fetchIncidents();
      fetchStaff();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể phân công');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoAssign = async (incidentId) => {
    try {
      await axios.post(`/yeucausuco/${incidentId}/auto-assign`);
      setSuccess('Phân công tự động thành công!');
      fetchIncidents();
      fetchStaff();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể phân công tự động');
    }
  };

  // Fetch staff work details
  const handleViewStaffWork = async (staffMember) => {
    setSelectedStaffWork(staffMember);
    setShowStaffWorkModal(true);
    setLoadingStaffWork(true);
    setStaffWorkFilter('all'); // Reset filter
    
    try {
      // Fetch all incidents assigned to this staff
      const res = await axios.get('/yeucausuco', { 
        params: { NhanVienXuLyID: staffMember.ID } 
      });
      const data = res.data.data || [];
      setStaffWorkList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch staff work:', err);
      setStaffWorkList([]);
    } finally {
      setLoadingStaffWork(false);
    }
  };

  // Fetch duty schedule for a specific date
  const handleSearchSchedule = async (date) => {
    setLoadingSchedule(true);
    try {
      const res = await axios.get('/lichtruc', {
        params: { NgayTruc: date }
      });
      const data = res.data.data || res.data.items || [];
      setScheduleData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
      setScheduleData([]);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleViewSchedule = async () => {
    const today = toLocalDateString(new Date());
    setSelectedDate(today);
    setShowScheduleModal(true);
    setLoadingSchedule(true);
    try {
      const res = await axios.get('/lichtruc/today');
      const data = res.data.data || res.data.items || [];
      setScheduleData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch today schedule:', err);
      setScheduleData([]);
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Auto assign based on schedule
  const handleAssignFromSchedule = async (incidentId, staffId) => {
    try {
      await axios.post(`/yeucausuco/${incidentId}/assign`, {
        NhanVienXuLyID: staffId,
        GhiChu: 'Phân công theo lịch trực'
      });
      setSuccess('Phân công theo lịch trực thành công!');
      fetchIncidents();
      fetchStaff();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể phân công');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch month schedules for calendar
  const fetchMonthSchedules = async (date) => {
    setLoadingMonth(true);
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const res = await axios.get(`/lichtruc/month/${year}/${month}`);
      setMonthSchedules(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch month schedules:', err);
      setMonthSchedules([]);
    } finally {
      setLoadingMonth(false);
    }
  };

  // Open duty calendar
  const handleOpenDutyCalendar = () => {
    setShowDutyCalendar(true);
    fetchMonthSchedules(currentMonth);
  };

  // Navigate months
  const prevMonth = () => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(newDate);
    fetchMonthSchedules(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(newDate);
    fetchMonthSchedules(newDate);
  };

  // Get calendar days
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  // Get schedules for a specific date
  const getSchedulesForDate = (date) => {
    const dateStr = toLocalDateString(date);
    return monthSchedules.filter(s => {
      // NgayTruc từ server là ISO string UTC, lấy phần date theo UTC
      const d = new Date(s.NgayTruc);
      const scheduleDate = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
      return scheduleDate === dateStr && s.TrangThai !== 'Huy';
    });
  };

  // Open add duty modal for a specific date
  const handleAddDuty = (dateStr) => {
    setSelectedDutyDate(dateStr);
    setDutyForm({ NhanVienID: '', CaTruc: 'CaNgay', GhiChu: '' });
    setShowAddDutyModal(true);
  };

  // Submit duty assignment
  const handleSubmitDuty = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/lichtruc', {
        NhanVienID: dutyForm.NhanVienID,
        NgayTruc: selectedDutyDate,
        CaTruc: dutyForm.CaTruc,
        GhiChu: dutyForm.GhiChu
      });
      setSuccess('Đã thêm lịch trực thành công!');
      setShowAddDutyModal(false);
      fetchMonthSchedules(currentMonth);
      fetchStaff();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể thêm lịch trực');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Filter staff work list
  const getFilteredStaffWork = () => {
    if (staffWorkFilter === 'inProgress') {
      return staffWorkList.filter(w => w.TrangThai === 'DangXuLy');
    } else if (staffWorkFilter === 'completed') {
      return staffWorkList.filter(w => w.TrangThai === 'DaGiaiQuyet');
    }
    return staffWorkList;
  };

  const statCards = [
    { label: 'Tổng sự cố', value: stats.total },
    { label: 'Chưa phân công', value: stats.unassigned },
    { label: 'Đã phân công', value: stats.assigned },
    { label: 'Đã hoàn thành', value: stats.completed },
  ];

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Quản Lý Sự Cố</h1>
            <p className="text-gray-500 text-sm mt-1">Phân công kỹ thuật viên xử lý sự cố</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {success && (
          <div className="bg-slate-100 border-l-4 border-slate-700 p-4 mb-4 rounded-r-xl text-slate-800 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-4 rounded-r-xl text-red-800 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 flex flex-wrap gap-3">
          <select value={filter.TrangThai} onChange={e => setFilter(f => ({ ...f, TrangThai: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            <option value="">Tất cả trạng thái</option>
            <option value="Moi">Chưa phân công</option>
            <option value="DangXuLy">Đã phân công</option>
            <option value="DaGiaiQuyet">Đã hoàn thành</option>
          </select>
          <select value={filter.DoUuTien} onChange={e => setFilter(f => ({ ...f, DoUuTien: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            <option value="">Tất cả mức ưu tiên</option>
            <option value="Cao">Khẩn cấp</option>
            <option value="Trung">Trung bình</option>
            <option value="Thap">Thấp</option>
          </select>
          <input type="text" value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            placeholder="Tìm theo tiêu đề, căn hộ..."
            className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          <button onClick={fetchIncidents}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </button>
        </div>

        {/* Staff Summary */}
        {staff.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Kỹ thuật viên ({staff.length})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleViewSchedule}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Xem lịch hôm nay
                </button>
                <button
                  onClick={handleOpenDutyCalendar}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Quản lý lịch trực
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {staff.map(s => (
                <button
                  key={s.ID}
                  onClick={() => handleViewStaffWork(s)}
                  className="bg-white rounded-lg p-3 border border-slate-200 hover:border-slate-400 hover:shadow-sm transition-all text-left cursor-pointer"
                >
                  <p className="text-sm font-semibold text-slate-900 truncate">{s.HoTen}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.SoDienThoai || 'N/A'}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-xs text-slate-600">Đang xử lý:</span>
                    <span className="text-xs font-bold text-slate-900">
                      {s.SoCongViecDangXuLy} việc
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-600 font-semibold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    Xem chi tiết
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Incident List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : incidents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center text-slate-400">
            <svg className="w-20 h-20 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-semibold text-lg">Không có sự cố nào</p>
            <p className="text-sm mt-1">Tất cả sự cố đã được xử lý</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {incidents.map(inc => {
              const priority = PRIORITY_CONFIG[inc.DoUuTien] || PRIORITY_CONFIG.Trung;
              const status = STATUS_CONFIG[inc.TrangThai] || STATUS_CONFIG.Moi;
              const isUnassigned = inc.TrangThai === 'Moi';
              const isCompleted = inc.TrangThai === 'DaGiaiQuyet';
              
              return (
                <div key={inc.ID} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-slate-200">
                  <div className="p-5 flex items-start gap-4">
                    {/* Priority Indicator */}
                    <div className={`w-3 h-full rounded-full flex-shrink-0 mt-1 ${priority.dot}`} style={{ minHeight: 80 }} />
                    
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 text-lg mb-1">{inc.TieuDe}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="font-semibold">{inc.canho?.MaCanHo}</span>
                            <span>•</span>
                            <span>Tầng {inc.canho?.Tang}</span>
                            <span>•</span>
                            <span>{inc.nguoidung_yeucausuco_NguoiThueIDTonguoidung?.HoTen || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${priority.color}`}>
                            {priority.label}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{inc.MoTa}</p>

                      {/* Assigned Staff Info */}
                      {inc.nguoidung_yeucausuco_NhanVienXuLyIDTonguoidung && (
                        <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-200">
                          <p className="text-xs text-slate-600 mb-1 font-semibold">Kỹ thuật viên phụ trách</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {inc.nguoidung_yeucausuco_NhanVienXuLyIDTonguoidung.HoTen}
                          </p>
                          <p className="text-xs text-slate-600">
                            {inc.nguoidung_yeucausuco_NhanVienXuLyIDTonguoidung.SoDienThoai || 'N/A'}
                          </p>
                        </div>
                      )}

                      {/* Images Preview */}
                      {inc.HinhAnh && Array.isArray(inc.HinhAnh) && inc.HinhAnh.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-slate-500 mb-2 font-semibold">Hình ảnh ({inc.HinhAnh.length})</p>
                          <div className="flex gap-2 overflow-x-auto">
                            {inc.HinhAnh.slice(0, 4).map((img, idx) => (
                              <a key={idx} href={resolveMediaUrl(img)} target="_blank" rel="noopener noreferrer"
                                 className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-slate-200 hover:border-indigo-500 transition-all">
                                <img src={resolveMediaUrl(img)} alt="" className="w-full h-full object-cover" 
                                     onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }} />
                              </a>
                            ))}
                            {inc.HinhAnh.length > 4 && (
                              <div className="flex-shrink-0 w-20 h-20 bg-slate-100 rounded-lg border-2 border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                +{inc.HinhAnh.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-3 border-t">
                        {isUnassigned && (
                          <>
                            <button onClick={() => handleOpenAssign(inc)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                              Phân công
                            </button>
                            {/* Đã tắt nút Tự động để giảm test case */}
                            {/* <button onClick={() => handleAutoAssign(inc.ID)}
                              className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-semibold hover:bg-slate-600 transition-colors flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Tự động
                            </button> */}
                          </>
                        )}
                        {!isUnassigned && !isCompleted && (
                          <button onClick={() => handleOpenAssign(inc)}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            Chuyển người
                          </button>
                        )}
                        <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDateTime(inc.NgayBao)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedIncident && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gray-900 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Phân công kỹ thuật viên</h3>
              <button onClick={() => { setShowAssignModal(false); setError(''); }} 
                className="text-white/80 hover:text-white text-3xl leading-none">×</button>
            </div>
            <form onSubmit={handleAssign} className="p-6 space-y-4">
              {/* Incident Info */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm font-semibold text-blue-900 mb-1">{selectedIncident.TieuDe}</p>
                <p className="text-xs text-blue-700">
                  {selectedIncident.canho?.MaCanHo} - Tầng {selectedIncident.canho?.Tang}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {selectedIncident.nguoidung_yeucausuco_NguoiThueIDTonguoidung?.HoTen}
                </p>
              </div>

              {/* Quick Action: View Schedule */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    handleViewSchedule();
                  }}
                  className="w-full flex items-center justify-center gap-2 text-indigo-700 font-semibold text-sm hover:text-indigo-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Xem lịch trực và phân công theo lịch
                </button>
              </div>

              {/* Select Staff */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Chọn kỹ thuật viên <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStaff}
                  onChange={e => setSelectedStaff(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                >
                  <option value="">-- Chọn kỹ thuật viên --</option>
                  {staff.map(s => (
                    <option key={s.ID} value={s.ID}>
                      {s.HoTen} - Đang xử lý: {s.SoCongViecDangXuLy} việc
                    </option>
                  ))}
                </select>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={assignNote}
                  onChange={e => setAssignNote(e.target.value)}
                  rows={3}
                  placeholder="Ghi chú cho kỹ thuật viên..."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg text-red-800 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t">
                <button type="button" onClick={() => { setShowAssignModal(false); setError(''); }}
                  className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50">
                  Hủy
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Xác nhận phân công
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Work Detail Modal */}
      {showStaffWorkModal && selectedStaffWork && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            <div className="bg-gray-900 px-6 py-4 rounded-t-2xl flex justify-between items-center sticky top-0">
              <div>
                <h3 className="text-white font-bold text-lg">Công việc của {selectedStaffWork.HoTen}</h3>
                <p className="text-slate-300 text-sm mt-0.5">{selectedStaffWork.SoDienThoai}</p>
              </div>
              <button onClick={() => { setShowStaffWorkModal(false); setStaffWorkList([]); }} 
                className="text-white/80 hover:text-white text-3xl leading-none">×</button>
            </div>
            
            <div className="p-6">
              {loadingStaffWork ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : staffWorkList.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <svg className="w-20 h-20 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="font-semibold">Chưa có công việc nào</p>
                </div>
              ) : (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-600 mb-1">Đang xử lý</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {staffWorkList.filter(w => w.TrangThai === 'DangXuLy').length}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-600 mb-1">Đã hoàn thành</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {staffWorkList.filter(w => w.TrangThai === 'DaGiaiQuyet').length}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-600 mb-1">Tổng cộng</p>
                      <p className="text-2xl font-bold text-slate-900">{staffWorkList.length}</p>
                    </div>
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setStaffWorkFilter('all')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        staffWorkFilter === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Tất cả ({staffWorkList.length})
                    </button>
                    <button
                      onClick={() => setStaffWorkFilter('inProgress')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        staffWorkFilter === 'inProgress'
                          ? 'bg-orange-600 text-white'
                          : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                      }`}
                    >
                      Đang xử lý ({staffWorkList.filter(w => w.TrangThai === 'DangXuLy').length})
                    </button>
                    <button
                      onClick={() => setStaffWorkFilter('completed')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        staffWorkFilter === 'completed'
                          ? 'bg-green-600 text-white'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      Đã hoàn thành ({staffWorkList.filter(w => w.TrangThai === 'DaGiaiQuyet').length})
                    </button>
                  </div>

                  {/* Work List */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getFilteredStaffWork().length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <p className="text-sm">Không có công việc nào</p>
                      </div>
                    ) : getFilteredStaffWork().map(work => {
                      const priority = PRIORITY_CONFIG[work.DoUuTien] || PRIORITY_CONFIG.Trung;
                      const status = STATUS_CONFIG[work.TrangThai] || STATUS_CONFIG.Moi;
                      const isCompleted = work.TrangThai === 'DaGiaiQuyet';
                      
                      return (
                        <div key={work.ID} className="border rounded-xl p-4 bg-white">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-900 mb-1">{work.TieuDe}</h4>
                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <span>{work.canho?.MaCanHo}</span>
                                <span>•</span>
                                <span>Tầng {work.canho?.Tang}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${priority.color}`}>
                                {priority.label}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${status.color}`}>
                                {status.label}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-slate-600 mb-2 line-clamp-2">{work.MoTa}</p>
                          
                          <div className="flex flex-col gap-1 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-semibold">Báo cáo:</span> {formatDateTime(work.NgayBao)}
                            </div>
                            {work.NgayXuLy && (
                              <div className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="font-semibold">Bắt đầu:</span> {formatDateTime(work.NgayXuLy)}
                              </div>
                            )}
                            {isCompleted && work.NgayHoanThanh && (
                              <div className="flex items-center gap-1 text-green-600">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-semibold">Hoàn thành:</span> {formatDateTime(work.NgayHoanThanh)}
                              </div>
                            )}
                          </div>

                          {/* Completion Images */}
                          {isCompleted && work.HinhAnhHoanThanh && Array.isArray(work.HinhAnhHoanThanh) && work.HinhAnhHoanThanh.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <p className="text-xs text-slate-700 font-semibold mb-2">Hình ảnh hoàn thành:</p>
                              <div className="flex gap-2 overflow-x-auto">
                                {work.HinhAnhHoanThanh.slice(0, 3).map((img, idx) => (
                                  <a key={idx} href={resolveMediaUrl(img)} target="_blank" rel="noopener noreferrer"
                                     className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-slate-300 hover:border-slate-500 transition-all">
                                    <img src={resolveMediaUrl(img)} alt="" className="w-full h-full object-cover" 
                                         onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=No+Image'; }} />
                                  </a>
                                ))}
                                {work.HinhAnhHoanThanh.length > 3 && (
                                  <div className="flex-shrink-0 w-16 h-16 bg-slate-100 rounded-lg border-2 border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700">
                                    +{work.HinhAnhHoanThanh.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Duty Calendar Modal */}
      {showDutyCalendar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-purple-600 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold text-lg">Quản Lý Lịch Trực Kỹ Thuật</h3>
                <p className="text-purple-100 text-sm mt-0.5">Bấm vào ngày để thêm lịch trực</p>
              </div>
              <button onClick={() => setShowDutyCalendar(false)} 
                className="text-white/80 hover:text-white text-3xl leading-none">×</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {/* Calendar Controls */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4 mb-5 flex items-center justify-between">
                <button onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-xl font-bold text-gray-900">
                  Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
                </h2>
                <button onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {loadingMonth ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200">
                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                      <div key={day} className="p-3 text-center text-sm font-semibold text-gray-700">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar days */}
                  <div className="grid grid-cols-7">
                    {(() => {
                      const { daysInMonth, startingDayOfWeek, year, month } = getCalendarDays();
                      const days = [];
                      const today = new Date();
                      const todayStr = toLocalDateString(today);
                      today.setHours(0, 0, 0, 0);

                      // Empty cells for days before month starts
                      for (let i = 0; i < startingDayOfWeek; i++) {
                        days.push(<div key={`empty-${i}`} className="min-h-28 bg-gray-50 border border-gray-200" />);
                      }

                      // Days of the month
                      for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(year, month, day);
                        const dateStr = toLocalDateString(date);
                        const daySchedules = getSchedulesForDate(date);
                        const isToday = dateStr === toLocalDateString(today);
                        const isPast = dateStr < todayStr;

                        days.push(
                          <div
                            key={day}
                            className={`min-h-28 border border-gray-200 p-2 ${
                              isToday ? 'bg-blue-50 border-blue-300' : isPast ? 'bg-gray-50' : 'bg-white'
                            } hover:bg-purple-50 transition-colors cursor-pointer`}
                            onClick={() => !isPast && handleAddDuty(dateStr)}
                          >
                            <div className={`text-sm font-semibold mb-1 ${
                              isToday ? 'text-blue-600' : isPast ? 'text-gray-400' : 'text-gray-700'
                            }`}>
                              {day}
                              {isToday && <span className="ml-1 text-xs">(Hôm nay)</span>}
                            </div>
                            <div className="space-y-1">
                              {daySchedules.map(schedule => {
                                const staffName = schedule.nguoidung_lichtruc_NhanVienIDTonguoidung?.HoTen || 'N/A';
                                const shift = schedule.CaTruc;
                                const shiftColors = {
                                  Sang: 'bg-yellow-100 text-yellow-800',
                                  Chieu: 'bg-orange-100 text-orange-800',
                                  Toi: 'bg-indigo-100 text-indigo-800',
                                  CaNgay: 'bg-green-100 text-green-800'
                                };
                                
                                return (
                                  <div
                                    key={schedule.ID}
                                    className={`text-xs p-1.5 rounded ${shiftColors[shift] || 'bg-gray-100 text-gray-800'}`}
                                    title={`${staffName} - ${shift}`}
                                  >
                                    <div className="font-semibold truncate">{staffName}</div>
                                    <div className="text-xs opacity-75">{shift}</div>
                                  </div>
                                );
                              })}
                              {daySchedules.length === 0 && !isPast && (
                                <div className="text-xs text-gray-400 italic text-center py-2">
                                  Bấm để thêm
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      return days;
                    })()}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="mt-5 bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Chú thích ca trực</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Ca sáng', color: 'bg-yellow-100 text-yellow-800', time: '6:00 - 12:00' },
                    { label: 'Ca chiều', color: 'bg-orange-100 text-orange-800', time: '12:00 - 18:00' },
                    { label: 'Cả ngày', color: 'bg-green-100 text-green-800', time: '6:00 - 18:00' }
                  ].map(shift => (
                    <div key={shift.label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${shift.color}`} />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{shift.label}</div>
                        <div className="text-xs text-gray-500">{shift.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t p-4 bg-gray-50">
              <button
                onClick={() => setShowDutyCalendar(false)}
                className="w-full py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Duty Modal */}
      {showAddDutyModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-purple-600 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Thêm Lịch Trực</h3>
              <button onClick={() => setShowAddDutyModal(false)} 
                className="text-white/80 hover:text-white text-3xl leading-none">×</button>
            </div>
            <form onSubmit={handleSubmitDuty} className="p-6 space-y-4">
              <div className="bg-purple-50 rounded-lg p-3 text-sm text-purple-900">
                <span className="font-semibold">Ngày trực:</span> {formatLocalDate(selectedDutyDate)}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kỹ thuật viên <span className="text-red-500">*</span>
                </label>
                <select
                  value={dutyForm.NhanVienID}
                  onChange={e => setDutyForm({ ...dutyForm, NhanVienID: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  required
                >
                  <option value="">-- Chọn kỹ thuật viên --</option>
                  {staff.map(s => (
                    <option key={s.ID} value={s.ID}>
                      {s.HoTen} - Đang xử lý: {s.SoCongViecDangXuLy} việc
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ca trực <span className="text-red-500">*</span>
                </label>
                <select
                  value={dutyForm.CaTruc}
                  onChange={e => setDutyForm({ ...dutyForm, CaTruc: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  required
                >
                  <option value="CaNgay">Cả ngày (6:00 - 18:00)</option>
                  <option value="Sang">Ca sáng (6:00 - 12:00)</option>
                  <option value="Chieu">Ca chiều (12:00 - 18:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={dutyForm.GhiChu}
                  onChange={e => setDutyForm({ ...dutyForm, GhiChu: e.target.value })}
                  rows={2}
                  placeholder="Ghi chú về lịch trực..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddDutyModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                  Hủy
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors">
                  Thêm lịch trực
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold text-lg">Lịch Trực Kỹ Thuật Viên</h3>
                <p className="text-indigo-100 text-sm mt-0.5">Phân công dựa vào lịch trực</p>
              </div>
              <button onClick={() => setShowScheduleModal(false)} 
                className="text-white/80 hover:text-white text-3xl leading-none">×</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {/* Date Picker */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn ngày</label>
                <div className="flex gap-3">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {loadingSchedule ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : scheduleData.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="font-semibold">Không có lịch trực</p>
                  <p className="text-sm mt-1">Chưa có kỹ thuật viên nào trực ngày này</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-indigo-900 font-semibold">
                      Lịch trực ngày {formatLocalDate(selectedDate)}
                    </p>
                    <p className="text-xs text-indigo-700 mt-1">
                      Có {scheduleData.length} kỹ thuật viên đang trực
                    </p>
                  </div>

                  {scheduleData.map((schedule) => {
                    const staffMember = schedule.nguoidung_lichtruc_NhanVienIDTonguoidung;
                    const workload = staff.find(s => s.ID === staffMember?.ID)?.SoCongViecDangXuLy || 0;
                    
                    return (
                      <div key={schedule.ID} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{staffMember?.HoTen || 'N/A'}</p>
                                <p className="text-xs text-gray-500">{staffMember?.SoDienThoai || 'N/A'}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="bg-gray-50 rounded-lg p-2">
                                <p className="text-xs text-gray-600 mb-1">Ca trực</p>
                                <p className="font-semibold text-gray-900">{schedule.CaTruc || 'N/A'}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-2">
                                <p className="text-xs text-gray-600 mb-1">Công việc hiện tại</p>
                                <p className="font-semibold text-gray-900">{workload} việc</p>
                              </div>
                            </div>

                            {schedule.GhiChu && (
                              <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                <span className="font-semibold">Ghi chú:</span> {schedule.GhiChu}
                              </div>
                            )}
                          </div>

                          {/* Quick Assign Button */}
                          {selectedIncident && (
                            <button
                              onClick={() => {
                                handleAssignFromSchedule(selectedIncident.ID, staffMember.ID);
                                setShowScheduleModal(false);
                              }}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                              Phân công
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t p-4 bg-gray-50">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="w-full py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignIncidents;
