import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

// Các bước: 1=nhập email, 2=nhập OTP, 3=nhập mật khẩu mới, 4=thành công
const STEPS = { EMAIL: 1, OTP: 2, NEW_PASSWORD: 3, DONE: 4 };

const SpinnerIcon = () => (
  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

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

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.EMAIL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Bước 1: Gửi OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password/send-otp", { Email: email });
      setStep(STEPS.OTP);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác thực OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { setError("Vui lòng nhập đủ 6 chữ số OTP!"); return; }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password/verify-otp", { Email: email, Otp: otp });
      setStep(STEPS.NEW_PASSWORD);
    } catch (err) {
      setError(err.response?.data?.message || "Mã OTP không hợp lệ.");
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Đặt mật khẩu mới
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError("Mật khẩu xác nhận không khớp!"); return; }
    if (newPassword.length < 8) { setError("Mật khẩu phải có ít nhất 8 ký tự!"); return; }
    if (!/[A-Z]/.test(newPassword)) { setError("Mật khẩu phải có ít nhất 1 chữ hoa!"); return; }
    if (!/[a-z]/.test(newPassword)) { setError("Mật khẩu phải có ít nhất 1 chữ thường!"); return; }
    if (!/[0-9]/.test(newPassword)) { setError("Mật khẩu phải có ít nhất 1 chữ số!"); return; }

    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password/reset", {
        Email: email,
        Otp: otp,
        NewPassword: newPassword,
      });
      setStep(STEPS.DONE);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Step indicator
  const steps = [
    { num: 1, label: "Email" },
    { num: 2, label: "Mã OTP" },
    { num: 3, label: "Mật khẩu mới" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center px-4 z-50">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative">

        {/* Nút đóng */}
        <button
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 text-2xl z-10 leading-none"
          onClick={() => navigate("/login")}
        >×</button>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-6 text-center">
          <div className="text-3xl mb-1">🔐</div>
          <h2 className="text-xl font-bold text-white">Quên mật khẩu</h2>
          <p className="text-emerald-100 text-sm mt-1">SmartBuilding</p>
        </div>

        {/* Step indicator — chỉ hiện khi chưa done */}
        {step !== STEPS.DONE && (
          <div className="flex items-center justify-center gap-2 px-8 pt-6">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step > s.num ? "bg-emerald-600 text-white"
                  : step === s.num ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                  : "bg-gray-200 text-gray-500"
                }`}>
                  {step > s.num ? "✓" : s.num}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step >= s.num ? "text-emerald-700" : "text-gray-400"}`}>
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${step > s.num ? "bg-emerald-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="px-8 py-6">
          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl mb-4 text-sm border bg-red-50 text-red-700 border-red-200 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* ===== BƯỚC 1: NHẬP EMAIL ===== */}
          {step === STEPS.EMAIL && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Nhập email đã đăng ký. Chúng tôi sẽ gửi mã OTP để xác thực.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="email@gmail.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-500 outline-none transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full text-white font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:brightness-110 disabled:opacity-50 flex items-center justify-center transition"
              >
                {loading ? <><SpinnerIcon />Đang gửi...</> : "Gửi mã OTP"}
              </button>
              <button type="button" onClick={() => navigate("/login")} className="w-full py-2 text-sm text-gray-500 hover:text-emerald-700 transition">
                ← Quay lại đăng nhập
              </button>
            </form>
          )}

          {/* ===== BƯỚC 2: NHẬP OTP ===== */}
          {step === STEPS.OTP && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center py-2">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">Mã OTP đã gửi đến</p>
                <p className="font-semibold text-gray-800">{email}</p>
                <p className="text-xs text-gray-400 mt-1">Hiệu lực trong 5 phút</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Nhập mã OTP 6 chữ số</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="_ _ _ _ _ _"
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-500 outline-none transition text-center text-2xl font-bold tracking-[0.5em]"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 rounded-full text-white font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:brightness-110 disabled:opacity-50 flex items-center justify-center transition"
              >
                {loading ? <><SpinnerIcon />Đang xác thực...</> : "Xác nhận OTP"}
              </button>

              <div className="flex justify-between text-sm">
                <button type="button" onClick={() => { setStep(STEPS.EMAIL); setOtp(""); setError(""); }} className="text-gray-500 hover:text-emerald-700 transition">
                  ← Đổi email
                </button>
                <button type="button" onClick={handleSendOtp} disabled={loading} className="text-emerald-600 hover:underline disabled:opacity-50">
                  Gửi lại OTP
                </button>
              </div>
            </form>
          )}

          {/* ===== BƯỚC 3: MẬT KHẨU MỚI ===== */}
          {step === STEPS.NEW_PASSWORD && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-gray-600 mb-2">Nhập mật khẩu mới cho tài khoản <strong>{email}</strong></p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Ví dụ: MyPass123"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-500 outline-none transition"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Tối thiểu 8 ký tự, có chữ hoa, chữ thường và số</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-500 outline-none transition"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <EyeIcon /> : <EyeSlashIcon />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full text-white font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:brightness-110 disabled:opacity-50 flex items-center justify-center transition"
              >
                {loading ? <><SpinnerIcon />Đang cập nhật...</> : "Đặt lại mật khẩu"}
              </button>
            </form>
          )}

          {/* ===== BƯỚC 4: THÀNH CÔNG ===== */}
          {step === STEPS.DONE && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Đặt lại mật khẩu thành công!</h3>
              <p className="text-gray-500 text-sm mb-6">Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại.</p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 rounded-full text-white font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:brightness-110 transition"
              >
                Đăng nhập ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
