// client/src/pages/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { validateField, validateProfileForm, isFormValid } from '../utils/authValidation';

const SERVER_URL = 'http://localhost:5000';

// ─── Icons ────────────────────────────────────────────────────────────────────
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const avatarInputRef = useRef(null);

  // CCCD state
  const [cccdLoading, setCccdLoading] = useState({ matTruoc: false, matSau: false });
  const [cccdPreview, setCccdPreview] = useState({ matTruoc: null, matSau: null });
  const [cccdMsg, setCccdMsg] = useState({ type: '', text: '' });
  const cccdTruocRef = useRef(null);
  const cccdSauRef = useRef(null);

  // Profile validation
  const [profileErrors, setProfileErrors] = useState({});
  const [profileTouched, setProfileTouched] = useState({});

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [avatarMsg, setAvatarMsg] = useState({ type: '', text: '' });

  const isGoogleUser = !!user?.isGoogleUser;

  const [profileData, setProfileData] = useState({
    HoTen: '', Email: '', SoDienThoai: '',
    DiaChi: '', NgaySinh: '', GioiTinh: '', CCCD: '',
    NgayCapCCCD: '', NoiCapCCCD: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        HoTen: user.HoTen || '',
        Email: user.Email || '',
        SoDienThoai: user.SoDienThoai || '',
        DiaChi: user.DiaChi || '',
        NgaySinh: user.NgaySinh ? user.NgaySinh.split('T')[0] : '',
        GioiTinh: user.GioiTinh || '',
        CCCD: user.CCCD || '',
        NgayCapCCCD: user.NgayCapCCCD ? user.NgayCapCCCD.split('T')[0] : '',
        NoiCapCCCD: user.NoiCapCCCD || ''
      });
      if (user.Avatar) {
        setAvatarPreview(
          user.Avatar.startsWith('http') ? user.Avatar : `${SERVER_URL}${user.Avatar}`
        );
      }
      // Load CCCD previews nếu đã có
      setCccdPreview({
        matTruoc: user.AnhCCCDMatTruoc
          ? (user.AnhCCCDMatTruoc.startsWith('http') ? user.AnhCCCDMatTruoc : `${SERVER_URL}${user.AnhCCCDMatTruoc}`)
          : null,
        matSau: user.AnhCCCDMatSau
          ? (user.AnhCCCDMatSau.startsWith('http') ? user.AnhCCCDMatSau : `${SERVER_URL}${user.AnhCCCDMatSau}`)
          : null,
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    // Validate realtime — chỉ hiện lỗi nếu field đã được touch
    if (profileTouched[name] !== undefined || value === '') {
      setProfileTouched(prev => ({ ...prev, [name]: true }));
      setProfileErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  // ===== AVATAR UPLOAD =====
  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarMsg({ type: '', text: '' });

    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setAvatarMsg({ type: 'error', text: 'Chỉ chấp nhận ảnh JPEG, PNG, GIF hoặc WebP' });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setAvatarMsg({ type: 'error', text: 'Ảnh không được vượt quá 3MB' });
      return;
    }

    // Preview ngay lập tức
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    doUploadAvatar(file);
  };

  const doUploadAvatar = async (file) => {
    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await axios.post('/users/me/avatar', formData);
      const newUrl = res.data.avatarUrl;
      updateUser({ Avatar: newUrl });
      setAvatarPreview(`${SERVER_URL}${newUrl}`);
      setAvatarMsg({ type: 'success', text: 'Cập nhật ảnh đại diện thành công!' });
      setTimeout(() => setAvatarMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setAvatarMsg({ type: 'error', text: err.response?.data?.message || 'Tải ảnh lên thất bại' });
      if (user?.Avatar) {
        setAvatarPreview(user.Avatar.startsWith('http') ? user.Avatar : `${SERVER_URL}${user.Avatar}`);
      } else {
        setAvatarPreview(null);
      }
    } finally {
      setAvatarLoading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // ===== CCCD UPLOAD =====
  const validateCCCDFile = (file) => {
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type))
      return 'Chỉ chấp nhận ảnh JPEG, PNG, GIF hoặc WebP';
    if (file.size > 5 * 1024 * 1024)
      return 'Ảnh không được vượt quá 5MB';
    return null;
  };

  const handleCCCDChange = async (e, side) => {
    const file = e.target.files[0];
    if (!file) return;
    setCccdMsg({ type: '', text: '' });

    const err = validateCCCDFile(file);
    if (err) { setCccdMsg({ type: 'error', text: err }); return; }

    // Preview ngay
    const reader = new FileReader();
    reader.onloadend = () => setCccdPreview(prev => ({ ...prev, [side]: reader.result }));
    reader.readAsDataURL(file);

    // Upload
    setCccdLoading(prev => ({ ...prev, [side]: true }));
    try {
      const formData = new FormData();
      formData.append(side, file); // field name: matTruoc hoặc matSau
      const res = await axios.post('/users/me/cccd', formData);
      const fieldKey = side === 'matTruoc' ? 'AnhCCCDMatTruoc' : 'AnhCCCDMatSau';
      const newUrl = res.data[fieldKey];
      if (newUrl) {
        // Chỉ cập nhật preview, KHÔNG gọi updateUser để tránh reset form
        setCccdPreview(prev => ({ ...prev, [side]: `${SERVER_URL}${newUrl}` }));
      }
      setCccdMsg({ type: 'success', text: `Cập nhật ảnh ${side === 'matTruoc' ? 'mặt trước' : 'mặt sau'} CCCD thành công!` });
      setTimeout(() => setCccdMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setCccdMsg({ type: 'error', text: err.response?.data?.message || 'Tải ảnh CCCD thất bại' });
      // Revert preview
      const fieldKey = side === 'matTruoc' ? 'AnhCCCDMatTruoc' : 'AnhCCCDMatSau';
      const oldUrl = user?.[fieldKey];
      setCccdPreview(prev => ({
        ...prev,
        [side]: oldUrl ? (oldUrl.startsWith('http') ? oldUrl : `${SERVER_URL}${oldUrl}`) : null
      }));
    } finally {
      setCccdLoading(prev => ({ ...prev, [side]: false }));
      const ref = side === 'matTruoc' ? cccdTruocRef : cccdSauRef;
      if (ref.current) ref.current.value = '';
    }
  };

  // ===== PROFILE UPDATE =====
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    // Touch tất cả fields và validate
    const allTouched = Object.fromEntries(Object.keys(profileData).map(k => [k, true]));
    setProfileTouched(allTouched);
    const errs = validateProfileForm(profileData);
    setProfileErrors(errs);
    if (!isFormValid(errs)) return;

    setLoading(true);
    setProfileMsg({ type: '', text: '' });
    const payload = {};
    Object.entries(profileData).forEach(([k, v]) => { if (v) payload[k] = v; });
    if ('NoiCapCCCD' in profileData) payload.NoiCapCCCD = profileData.NoiCapCCCD || undefined;
    try {
      const res = await axios.patch('/users/me', payload);
      updateUser(res.data?.data || payload);
      setProfileMsg({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      // Map server errors về từng field nếu có
      const serverErrors = err.response?.data?.errors;
      if (serverErrors?.length) {
        const fieldMap = {};
        serverErrors.forEach(({ field, message }) => { fieldMap[field] = message; });
        setProfileErrors(prev => ({ ...prev, ...fieldMap }));
      }
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật' });
    } finally {
      setLoading(false);
    }
  };

  // ===== PASSWORD CHANGE =====
  const [pwErrors, setPwErrors] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwTouched, setPwTouched] = useState({ currentPassword: false, newPassword: false, confirmPassword: false });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });

  const validatePwField = (name, value, allData) => {
    if (name === 'currentPassword') {
      if (!value) return 'Vui lòng nhập mật khẩu hiện tại';
      return '';
    }
    if (name === 'newPassword') {
      if (!value) return 'Vui lòng nhập mật khẩu mới';
      if (value.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
      if (!/[A-Z]/.test(value)) return 'Phải có ít nhất 1 chữ hoa (A-Z)';
      if (!/[a-z]/.test(value)) return 'Phải có ít nhất 1 chữ thường (a-z)';
      if (!/[0-9]/.test(value)) return 'Phải có ít nhất 1 chữ số (0-9)';
      if (!/[^a-zA-Z0-9]/.test(value)) return 'Phải có ít nhất 1 ký tự đặc biệt (!@#$...)';
      return '';
    }
    if (name === 'confirmPassword') {
      if (!value) return 'Vui lòng xác nhận mật khẩu';
      if (value !== (allData?.newPassword ?? passwordData.newPassword)) return 'Mật khẩu xác nhận không khớp';
      return '';
    }
    return '';
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...passwordData, [name]: value };
    setPasswordData(newData);
    setPwTouched(prev => ({ ...prev, [name]: true }));
    setPwErrors(prev => ({ ...prev, [name]: validatePwField(name, value, newData) }));
    // Re-validate confirm khi đổi newPassword
    if (name === 'newPassword' && pwTouched.confirmPassword) {
      setPwErrors(prev => ({ ...prev, confirmPassword: validatePwField('confirmPassword', newData.confirmPassword, newData) }));
    }
  };

  // Strength indicator
  const getPwStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: '' };
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^a-zA-Z0-9]/.test(pw)) s++;
    const levels = [
      { label: '', color: '' },
      { label: 'Yếu', color: 'bg-red-500' },
      { label: 'Trung bình', color: 'bg-orange-400' },
      { label: 'Khá', color: 'bg-yellow-400' },
      { label: 'Mạnh', color: 'bg-green-500' },
    ];
    return { score: s, ...levels[s] };
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    // Touch all
    const allTouched = { currentPassword: true, newPassword: true, confirmPassword: true };
    setPwTouched(allTouched);
    const errs = {
      currentPassword: validatePwField('currentPassword', passwordData.currentPassword, passwordData),
      newPassword: validatePwField('newPassword', passwordData.newPassword, passwordData),
      confirmPassword: validatePwField('confirmPassword', passwordData.confirmPassword, passwordData),
    };
    setPwErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setLoading(true);
    setPasswordMsg({ type: '', text: '' });
    try {
      await axios.post('/auth/change-password', {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwTouched({ currentPassword: false, newPassword: false, confirmPassword: false });
      setPwErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = () => {
    const configs = {
      QuanLy:          { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Quản Lý' },
      KeToan:          { bg: 'bg-blue-100',   text: 'text-blue-800',   label: 'Kế Toán' },
      NhanVienKyThuat: { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Kỹ Thuật' },
      NguoiThue:       { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Người Thuê' },
      ChuNha:          { bg: 'bg-red-100',    text: 'text-red-800',    label: 'Chủ Nhà' },
    };
    const c = configs[user?.VaiTro] || { bg: 'bg-gray-100', text: 'text-gray-800', label: user?.VaiTro || 'User' };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  const Alert = ({ msg }) => {
    if (!msg.text) return null;
    const ok = msg.type === 'success';
    return (
      <div className={`flex items-center gap-3 p-4 mb-5 rounded-lg border-l-4 ${ok ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
        <span>{ok ? '✅' : '❌'}</span>
        <p className={`font-medium ${ok ? 'text-green-800' : 'text-red-800'}`}>{msg.text}</p>
      </div>
    );
  };

  const inputCls = "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500";

  // Input class có validation state
  const inputClsV = (field) => {
    const base = "w-full px-4 py-3 border-2 rounded-lg focus:ring-2 transition-colors";
    if (profileTouched[field] && profileErrors[field])
      return `${base} border-red-400 bg-red-50/30 focus:ring-red-300 focus:border-red-400`;
    if (profileTouched[field] && !profileErrors[field])
      return `${base} border-green-400 focus:ring-green-300 focus:border-green-400`;
    return `${base} border-gray-300 focus:ring-purple-500 focus:border-purple-500`;
  };

  // Field error message
  const FieldErr = ({ field }) =>
    profileTouched[field] && profileErrors[field] ? (
      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {profileErrors[field]}
      </p>
    ) : null;
  const btnCls = (disabled) => `w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-200 ${
    disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
  }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 px-8 py-10">
            <div className="flex items-center gap-6">

              {/* Avatar */}
              <div className="relative group flex-shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-white shadow-lg ring-4 ring-white/30 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-purple-600 select-none">
                      {user?.HoTen?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>

                {/* Overlay hover */}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarLoading}
                  title="Đổi ảnh đại diện"
                  className="absolute inset-0 rounded-full bg-black/55 flex flex-col items-center justify-center
                             opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                >
                  {avatarLoading ? (
                    <svg className="w-7 h-7 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <>
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-white text-xs mt-1 font-medium">Đổi ảnh</span>
                    </>
                  )}
                </button>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />
              </div>

              {/* Info */}
              <div className="text-white min-w-0">
                <h1 className="text-2xl font-bold mb-1 truncate">{user?.HoTen || 'User'}</h1>
                <p className="text-purple-100 text-sm mb-3 truncate">{user?.Email}</p>
                {getRoleBadge()}
                {avatarMsg.text && (
                  <p className={`text-xs mt-2 font-medium ${avatarMsg.type === 'success' ? 'text-green-200' : 'text-red-200'}`}>
                    {avatarMsg.type === 'success' ? '✅' : '❌'} {avatarMsg.text}
                  </p>
                )}
                <p className="text-purple-200/70 text-xs mt-2"></p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 flex">
            {[{ key: 'info', label: 'Thông Tin Cá Nhân' }, { key: 'password', label: 'Đổi Mật Khẩu' }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                  activeTab === tab.key
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* Tab thông tin */}
          {activeTab === 'info' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Cập Nhật Thông Tin</h2>
              <Alert msg={profileMsg} />
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và Tên <span className="text-red-500">*</span></label>
                  <input type="text" name="HoTen" value={profileData.HoTen} onChange={handleProfileChange}
                    onBlur={() => { setProfileTouched(p => ({ ...p, HoTen: true })); setProfileErrors(p => ({ ...p, HoTen: validateField('HoTen', profileData.HoTen) })); }}
                    className={inputClsV('HoTen')} />
                  <FieldErr field="HoTen" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                  <input type="text" name="Email" value={profileData.Email} onChange={handleProfileChange}
                    onBlur={() => setProfileTouched(p => ({ ...p, Email: true }))}
                    className={inputClsV('Email')} />
                  <FieldErr field="Email" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Số Điện Thoại <span className="text-red-500">*</span></label>
                  <input type="tel" name="SoDienThoai" value={profileData.SoDienThoai} onChange={handleProfileChange}
                    onBlur={() => { setProfileTouched(p => ({ ...p, SoDienThoai: true })); setProfileErrors(p => ({ ...p, SoDienThoai: validateField('SoDienThoai', profileData.SoDienThoai) })); }}
                    placeholder="0987654321 hoặc +84987654321"
                    className={inputClsV('SoDienThoai')} />
                  <FieldErr field="SoDienThoai" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CCCD/CMND <span className="text-red-500">*</span></label>
                  <input type="text" name="CCCD" value={profileData.CCCD} onChange={handleProfileChange}
                    onBlur={() => { setProfileTouched(p => ({ ...p, CCCD: true })); setProfileErrors(p => ({ ...p, CCCD: validateField('CCCD', profileData.CCCD) })); }}
                    placeholder="12 chữ số"
                    className={inputClsV('CCCD')} />
                  <FieldErr field="CCCD" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày cấp CCCD</label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={profileData.NgayCapCCCD ? parseInt(profileData.NgayCapCCCD.split('-')[2]) : ''}
                      onChange={e => {
                        const parts = profileData.NgayCapCCCD ? profileData.NgayCapCCCD.split('-') : [new Date().getFullYear(), '01', ''];
                        const newVal = e.target.value ? `${parts[0]}-${parts[1]}-${e.target.value.padStart(2,'0')}` : '';
                        setProfileData(prev => ({ ...prev, NgayCapCCCD: newVal }));
                        setProfileTouched(p => ({ ...p, NgayCapCCCD: true }));
                        setProfileErrors(p => ({ ...p, NgayCapCCCD: validateField('NgayCapCCCD', newVal) }));
                      }}
                      className={inputClsV('NgayCapCCCD')}
                    >
                      <option value="">Ngày</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select
                      value={profileData.NgayCapCCCD ? parseInt(profileData.NgayCapCCCD.split('-')[1]) : ''}
                      onChange={e => {
                        const parts = profileData.NgayCapCCCD ? profileData.NgayCapCCCD.split('-') : [new Date().getFullYear(), '', '01'];
                        const newVal = e.target.value ? `${parts[0]}-${e.target.value.padStart(2,'0')}-${parts[2]}` : '';
                        setProfileData(prev => ({ ...prev, NgayCapCCCD: newVal }));
                        setProfileTouched(p => ({ ...p, NgayCapCCCD: true }));
                        setProfileErrors(p => ({ ...p, NgayCapCCCD: validateField('NgayCapCCCD', newVal) }));
                      }}
                      className={inputClsV('NgayCapCCCD')}
                    >
                      <option value="">Tháng</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
                    </select>
                    <select
                      value={profileData.NgayCapCCCD ? profileData.NgayCapCCCD.split('-')[0] : ''}
                      onChange={e => {
                        const parts = profileData.NgayCapCCCD ? profileData.NgayCapCCCD.split('-') : ['', '01', '01'];
                        const newVal = e.target.value ? `${e.target.value}-${parts[1]}-${parts[2]}` : '';
                        setProfileData(prev => ({ ...prev, NgayCapCCCD: newVal }));
                        setProfileTouched(p => ({ ...p, NgayCapCCCD: true }));
                        setProfileErrors(p => ({ ...p, NgayCapCCCD: validateField('NgayCapCCCD', newVal) }));
                      }}
                      className={inputClsV('NgayCapCCCD')}
                    >
                      <option value="">Năm</option>
                      {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <FieldErr field="NgayCapCCCD" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày Sinh</label>
                  <input type="date" name="NgaySinh" value={profileData.NgaySinh} onChange={handleProfileChange}
                    onBlur={() => setProfileTouched(p => ({ ...p, NgaySinh: true }))}
                    className={inputClsV('NgaySinh')} />
                  <FieldErr field="NgaySinh" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Giới Tính</label>
                  <select name="GioiTinh" value={profileData.GioiTinh} onChange={handleProfileChange} className={inputCls}>
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nu">Nữ</option>
                    <option value="Khac">Khác</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nơi cấp CCCD</label>
                <input type="text" name="NoiCapCCCD" value={profileData.NoiCapCCCD} onChange={handleProfileChange}
                  className={inputCls} placeholder="VD: Cục Cảnh sát QLHC về TTXH" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Địa Chỉ</label>
                <textarea name="DiaChi" value={profileData.DiaChi} onChange={handleProfileChange}
                  rows={3} className={inputCls} placeholder="Nhập địa chỉ đầy đủ..." />
              </div>

              {/* ===== CCCD IMAGES ===== */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-base font-bold text-gray-800 mb-1">Ảnh Căn Cước Công Dân</h3>
                <p className="text-sm text-gray-500 mb-4">Tải lên ảnh mặt trước và mặt sau CCCD để xác minh danh tính · JPEG/PNG/WebP · tối đa 5MB</p>

                {cccdMsg.text && (
                  <div className={`flex items-center gap-2 p-3 mb-4 rounded-lg text-sm font-medium ${cccdMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    <span>{cccdMsg.type === 'success' ? '✅' : '❌'}</span>
                    {cccdMsg.text}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Mặt trước */}
                  {[
                    { side: 'matTruoc', label: 'Mặt trước', ref: cccdTruocRef, icon: '🪪' },
                    { side: 'matSau',   label: 'Mặt sau',   ref: cccdSauRef,   icon: '🔄' },
                  ].map(({ side, label, ref, icon }) => (
                    <div key={side} className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors">
                      <p className="text-sm font-semibold text-gray-700 mb-3">{icon} {label}</p>

                      {/* Preview */}
                      <div
                        className="relative w-full h-40 bg-gray-50 rounded-lg overflow-hidden mb-3 cursor-pointer group"
                        onClick={() => ref.current?.click()}
                      >
                        {cccdPreview[side] ? (
                          <>
                            <img src={cccdPreview[side]} alt={label} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-sm font-medium">Đổi ảnh</span>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs">Nhấn để chọn ảnh</span>
                          </div>
                        )}
                        {cccdLoading[side] && (
                          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                            <svg className="w-8 h-8 text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => ref.current?.click()}
                        disabled={cccdLoading[side]}
                        className="w-full py-2 text-sm font-medium text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                      >
                        {cccdLoading[side] ? 'Đang tải...' : cccdPreview[side] ? 'Đổi ảnh' : 'Chọn ảnh'}
                      </button>

                      <input
                        ref={ref}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                        onChange={(e) => handleCCCDChange(e, side)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} className={btnCls(loading)}>
                {loading ? 'Đang cập nhật...' : 'Lưu Thay Đổi'}
              </button>
            </form>
          )}

          {/* Tab đổi mật khẩu */}
          {activeTab === 'password' && (
            isGoogleUser ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Tài khoản Google</h3>
                <p className="text-gray-500 max-w-sm">Tài khoản của bạn đăng nhập qua Google. Mật khẩu được quản lý bởi Google.</p>
                <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer"
                  className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
                  Quản lý bảo mật Google →
                </a>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-5" noValidate>
                <h2 className="text-2xl font-bold text-gray-900">Đổi Mật Khẩu</h2>
                <Alert msg={passwordMsg} />

                {/* Mật khẩu hiện tại */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật Khẩu Hiện Tại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPw.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      onBlur={() => setPwTouched(p => ({ ...p, currentPassword: true }))}
                      className={`${inputCls} pr-12 ${pwTouched.currentPassword && pwErrors.currentPassword ? 'border-red-400' : pwTouched.currentPassword && !pwErrors.currentPassword ? 'border-green-400' : ''}`}
                      placeholder="Nhập mật khẩu hiện tại"
                      autoComplete="current-password"
                    />
                    <button type="button" tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}>
                      {showPw.current ? <EyeIcon /> : <EyeSlashIcon />}
                    </button>
                  </div>
                  {pwTouched.currentPassword && pwErrors.currentPassword && (
                    <p className="mt-1.5 text-xs text-red-600">⚠ {pwErrors.currentPassword}</p>
                  )}
                </div>

                {/* Mật khẩu mới */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật Khẩu Mới <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPw.newPw ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      onBlur={() => setPwTouched(p => ({ ...p, newPassword: true }))}
                      className={`${inputCls} pr-12 ${pwTouched.newPassword && pwErrors.newPassword ? 'border-red-400' : pwTouched.newPassword && !pwErrors.newPassword ? 'border-green-400' : ''}`}
                      placeholder="Ví dụ: MyPass@123"
                      autoComplete="new-password"
                    />
                    <button type="button" tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPw(p => ({ ...p, newPw: !p.newPw }))}>
                      {showPw.newPw ? <EyeIcon /> : <EyeSlashIcon />}
                    </button>
                  </div>
                  {pwTouched.newPassword && pwErrors.newPassword && (
                    <p className="mt-1.5 text-xs text-red-600">⚠ {pwErrors.newPassword}</p>
                  )}
                </div>

                {/* Xác nhận mật khẩu */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Xác Nhận Mật Khẩu Mới <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPw.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      onBlur={() => setPwTouched(p => ({ ...p, confirmPassword: true }))}
                      className={`${inputCls} pr-12 ${pwTouched.confirmPassword && pwErrors.confirmPassword ? 'border-red-400' : pwTouched.confirmPassword && !pwErrors.confirmPassword ? 'border-green-400' : ''}`}
                      placeholder="Nhập lại mật khẩu mới"
                      autoComplete="new-password"
                    />
                    <button type="button" tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}>
                      {showPw.confirm ? <EyeIcon /> : <EyeSlashIcon />}
                    </button>
                  </div>
                  {pwTouched.confirmPassword && pwErrors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-600">⚠ {pwErrors.confirmPassword}</p>
                  )}
                  {pwTouched.confirmPassword && !pwErrors.confirmPassword && passwordData.confirmPassword && (
                    <p className="mt-1.5 text-xs text-green-600">✓ Mật khẩu khớp</p>
                  )}
                </div>

                <button type="submit" disabled={loading} className={btnCls(loading)}>
                  {loading ? 'Đang xử lý...' : 'Đổi Mật Khẩu'}
                </button>
              </form>
            )
          )}
        </div>

        {/* ACCOUNT INFO */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Thông Tin Tài Khoản</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg gap-3">
              <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-gray-500">Tên đăng nhập</p>
                <p className="font-semibold text-gray-900">{user?.TenDangNhap}</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg gap-3">
              <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-gray-500">Ngày đăng ký</p>
                <p className="font-semibold text-gray-900">
                  {user?.NgayTao ? new Date(user.NgayTao).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
