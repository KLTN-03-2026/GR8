import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  validateField,
  validateLoginForm,
  validateRegisterForm,
  isFormValid,
  getPasswordStrength,
} from "../utils/authValidation";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
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
const SpinnerIcon = () => (
  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);
const XIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ─── Reusable UI components ───────────────────────────────────────────────────

const FieldError = ({ msg }) =>
  msg ? (
    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1" role="alert">
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {msg}
    </p>
  ) : null;

const inputCls = (hasError, touched) => {
  const base = "w-full px-4 py-2.5 border rounded-xl bg-gray-50 outline-none transition-all text-sm";
  if (!touched) return `${base} border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/30`;
  if (hasError) return `${base} border-red-400 bg-red-50/30 focus:border-red-400 focus:ring-2 focus:ring-red-300/30`;
  return `${base} border-emerald-400 bg-emerald-50/20 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/30`;
};

const PasswordStrengthBar = ({ password }) => {
  const { score, label, color } = getPasswordStrength(password);
  if (!password) return null;
  const checks = [
    { ok: password.length >= 8, label: "8+ ký tự" },
    { ok: /[A-Z]/.test(password), label: "Chữ hoa" },
    { ok: /[a-z]/.test(password), label: "Chữ thường" },
    { ok: /[0-9]/.test(password), label: "Số" },
    { ok: /[^a-zA-Z0-9]/.test(password), label: "Ký tự đặc biệt" },
  ];
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1 items-center">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? color : "bg-gray-200"}`} />
        ))}
        {label && <span className={`text-xs font-medium ml-1 ${score <= 1 ? "text-red-500" : score === 2 ? "text-orange-500" : score === 3 ? "text-yellow-600" : "text-emerald-600"}`}>{label}</span>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {checks.map((c) => (
          <span key={c.label} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors ${c.ok ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
            {c.ok ? <CheckIcon /> : <XIcon />} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const GlobalAlert = ({ type, msg }) => {
  if (!msg) return null;
  const isError = type === "error";
  return (
    <div className={`p-3 rounded-xl mb-4 text-sm border flex items-start gap-2 ${isError ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`} role="alert">
      <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        {isError
          ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        }
      </svg>
      {msg}
    </div>
  );
};

// ─── OTP Input — 6 ô riêng biệt ─────────────────────────────────────────────
const OtpStep = ({ email, otp, setOtp, loading, alert, setAlert, onSubmit, onBack, onResend }) => {
  // Dùng useRef để refs không bị reset mỗi render
  const inputRefs = [
    React.useRef(null), React.useRef(null), React.useRef(null),
    React.useRef(null), React.useRef(null), React.useRef(null),
  ];

  // digits luôn là mảng 6 phần tử, mỗi phần tử là "" hoặc 1 chữ số
  const digits = Array.from({ length: 6 }, (_, i) => otp[i] || "");

  const [countdown, setCountdown] = React.useState(60);
  const [resendLoading, setResendLoading] = React.useState(false);

  React.useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Cập nhật otp từ mảng digits
  const updateOtp = (newDigits) => {
    setOtp(newDigits.join(""));
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await onResend();
      setCountdown(60);
      setOtp("");
      setAlert({ type: "success", msg: "Mã OTP mới đã được gửi!" });
    } catch {
      setAlert({ type: "error", msg: "Gửi lại thất bại. Vui lòng thử lại." });
    } finally {
      setResendLoading(false);
    }
  };

  const handleDigitChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;
    const newDigits = [...digits];
    newDigits[index] = val.slice(-1); // chỉ lấy 1 ký tự cuối
    updateOtp(newDigits);
    setAlert({ type: "", msg: "" });
    // Auto-focus ô tiếp theo
    if (index < 5) inputRefs[index + 1].current?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newDigits = [...digits];
      if (newDigits[index]) {
        // Xóa ô hiện tại
        newDigits[index] = "";
        updateOtp(newDigits);
      } else if (index > 0) {
        // Ô hiện tại rỗng → lùi về ô trước và xóa
        newDigits[index - 1] = "";
        updateOtp(newDigits);
        inputRefs[index - 1].current?.focus();
      }
      setAlert({ type: "", msg: "" });
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = Array.from({ length: 6 }, (_, i) => pasted[i] || "");
    updateOtp(newDigits);
    setAlert({ type: "", msg: "" });
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs[focusIdx].current?.focus();
  };

  // Đếm số ô đã điền (không tính ô rỗng)
  const filledCount = digits.filter((d) => d !== "").length;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">Xác thực email</h3>
        <p className="text-sm text-gray-500">Mã xác thực đã được gửi đến</p>
        <p className="text-sm font-semibold text-emerald-700 mt-0.5">{email}</p>
        <p className="text-xs text-gray-400 mt-1">Hiệu lực trong 5 phút</p>
      </div>

      {/* 6 ô OTP */}
      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            ref={inputRefs[i]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[i]}
            onChange={(e) => handleDigitChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            className={`w-11 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all
              ${digits[i]
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-gray-300 bg-gray-50 text-gray-800"
              }
              focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/30 focus:bg-white`}
          />
        ))}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || filledCount !== 6}
        className="w-full py-3 rounded-full text-white font-semibold shadow-md transition bg-gradient-to-r from-emerald-600 to-emerald-700 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? <><SpinnerIcon />Đang xác thực...</> : "Xác nhận & Đăng ký"}
      </button>

      {/* Gửi lại + Quay lại */}
      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} className="text-gray-500 hover:text-emerald-700 transition flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>

        {countdown > 0 ? (
          <span className="text-gray-400">
            Gửi lại sau <span className="font-semibold text-gray-600">{countdown}s</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="text-emerald-600 font-medium hover:underline disabled:opacity-50 flex items-center gap-1"
          >
            {resendLoading ? <><SpinnerIcon />Đang gửi...</> : "Gửi lại mã"}
          </button>
        )}
      </div>
    </form>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const Login = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") === "register" ? "register" : "login");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", msg: "" });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // ── Login form ──────────────────────────────────────────────────────────────
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({ username: "", password: "" });
  const [loginTouched, setLoginTouched] = useState({ username: false, password: false });

  // ── Register form ───────────────────────────────────────────────────────────
  const [regData, setRegData] = useState({ username: "", fullName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [regErrors, setRegErrors] = useState({ username: "", fullName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [regTouched, setRegTouched] = useState({ username: false, fullName: false, email: false, phone: false, password: false, confirmPassword: false });

  // ── OTP ─────────────────────────────────────────────────────────────────────
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setAlert({ type: "", msg: "" });
    setOtpSent(false);
    setOtp("");
    setLoginTouched({ username: false, password: false });
    setRegTouched({ username: false, fullName: false, email: false, phone: false, password: false, confirmPassword: false });
  };

  // ── Login handlers ──────────────────────────────────────────────────────────
  const handleLoginChange = (field) => (e) => {
    const val = e.target.value;
    setLoginData((p) => ({ ...p, [field]: val }));
    setLoginTouched((p) => ({ ...p, [field]: true }));
    const fieldKey = field === "username" ? "loginIdentifier" : "loginPassword";
    setLoginErrors((p) => ({ ...p, [field]: validateField(fieldKey, val) }));
    setAlert({ type: "", msg: "" });
  };

  const loginFormErrors = validateLoginForm(loginData);
  const loginValid = isFormValid(loginFormErrors) && loginData.username && loginData.password;

  const handleLogin = async (e) => {
    e.preventDefault();
    // Touch all fields to show errors
    setLoginTouched({ username: true, password: true });
    const errs = validateLoginForm(loginData);
    setLoginErrors(errs);
    if (!isFormValid(errs)) return;

    setLoading(true);
    setAlert({ type: "", msg: "" });
    try {
      await login({ TenDangNhapOrEmail: loginData.username, MatKhau: loginData.password });
      setAlert({ type: "success", msg: "Đăng nhập thành công!" });
      setTimeout(() => navigate("/dashboard"), 600);
    } catch (err) {
      const serverErrors = err.response?.data?.errors || [];
      const msg = err.response?.data?.message || "";
      // Map server errors to fields
      if (serverErrors.length > 0) {
        const fieldMap = {};
        serverErrors.forEach(({ field, message }) => {
          if (field === "TenDangNhapOrEmail") fieldMap.username = message;
          else if (field === "MatKhau") fieldMap.password = message;
        });
        if (Object.keys(fieldMap).length > 0) {
          setLoginErrors((p) => ({ ...p, ...fieldMap }));
          return;
        }
      }
      // Generic auth error - don't reveal which field is wrong (security)
      setAlert({ type: "error", msg: "Tài khoản hoặc mật khẩu không đúng" });
    } finally {
      setLoading(false);
    }
  };

  // ── Register handlers ───────────────────────────────────────────────────────
  const handleRegChange = (field) => (e) => {
    const val = e.target.value;
    const newData = { ...regData, [field]: val };
    setRegData(newData);
    setRegTouched((p) => ({ ...p, [field]: true }));
    // Re-validate affected fields
    const fieldKey = field === "username" ? "username"
      : field === "fullName" ? "fullName"
      : field === "email" ? "email"
      : field === "phone" ? "phone"
      : field === "password" ? "password"
      : "confirmPassword";
    const newErr = validateField(fieldKey, val, {
      username: newData.username,
      email: newData.email,
      password: newData.password,
    });
    setRegErrors((p) => {
      const updated = { ...p, [field]: newErr };
      // Re-validate confirmPassword when password changes
      if (field === "password" && regTouched.confirmPassword) {
        updated.confirmPassword = validateField("confirmPassword", newData.confirmPassword, { password: val });
      }
      return updated;
    });
    setAlert({ type: "", msg: "" });
  };

  const regFormErrors = validateRegisterForm(regData);
  const regValid = isFormValid(regFormErrors);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(Object.keys(regTouched).map((k) => [k, true]));
    setRegTouched(allTouched);
    const errs = validateRegisterForm(regData);
    setRegErrors(errs);
    if (!isFormValid(errs)) return;

    setOtpLoading(true);
    setAlert({ type: "", msg: "" });
    try {
      await register({ TenDangNhap: regData.username, MatKhau: regData.password, HoTen: regData.fullName, Email: regData.email, SoDienThoai: regData.phone, _sendOtp: true });
      setOtpSent(true);
      setAlert({ type: "success", msg: "Mã OTP đã được gửi đến " + regData.email + ". Kiểm tra hộp thư!" });
    } catch (err) {
      const serverErrors = err.response?.data?.errors || [];
      if (serverErrors.length > 0) {
        const fieldMap = {};
        serverErrors.forEach(({ field, message }) => {
          if (field === "TenDangNhap") fieldMap.username = message;
          else if (field === "Email") fieldMap.email = message;
          else if (field === "SoDienThoai") fieldMap.phone = message;
        });
        if (Object.keys(fieldMap).length > 0) {
          setRegErrors((p) => ({ ...p, ...fieldMap }));
          return;
        }
      }
      setAlert({ type: "error", msg: err.response?.data?.message || "Gửi OTP thất bại. Vui lòng thử lại." });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    // otp là chuỗi 6 ký tự từ digits.join(""), lọc sạch khoảng trắng
    const cleanOtp = otp.replace(/\s/g, "");
    if (cleanOtp.length !== 6) {
      setAlert({ type: "error", msg: "Vui lòng nhập đủ 6 chữ số OTP" });
      return;
    }
    setLoading(true);
    setAlert({ type: "", msg: "" });
    try {
      await register({ Email: regData.email, Otp: cleanOtp, _verifyOtp: true });
      setAlert({ type: "success", msg: "Đăng ký thành công! Vui lòng đăng nhập." });
      setTimeout(() => {
        switchTab("login");
        setRegData({ username: "", fullName: "", email: "", phone: "", password: "", confirmPassword: "" });
      }, 1500);
    } catch (err) {
      setAlert({ type: "error", msg: err.response?.data?.message || "Xác thực OTP thất bại." });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    await register({
      TenDangNhap: regData.username,
      MatKhau: regData.password,
      HoTen: regData.fullName,
      Email: regData.email,
      SoDienThoai: regData.phone,
      _sendOtp: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center px-4 z-50">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 relative">
        <button className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 text-2xl z-10 leading-none" onClick={() => navigate("/")} aria-label="Dong">x</button>

        {/* LEFT PANEL */}
        <div className="p-8 flex flex-col justify-center overflow-y-auto max-h-screen">
          <h2 className="text-2xl font-bold text-gray-900">Chào mừng bạn đến với</h2>
          <h2 className="text-3xl font-extrabold text-emerald-700 mb-5 tracking-tight">SMARTBUILDING</h2>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-5">
            {[["login", "Đăng nhập"], ["register", "Đăng ký"]].map(([tab, label]) => (
              <button key={tab} onClick={() => switchTab(tab)}
                className={`flex-1 pb-3 text-sm font-semibold transition-colors ${activeTab === tab ? "text-emerald-700 border-b-2 border-emerald-600" : "text-gray-500 hover:text-gray-700"}`}>
                {label}
              </button>
            ))}
          </div>

          <GlobalAlert type={alert.type} msg={alert.msg} />

          {/* LOGIN FORM */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên đăng nhập hoặc Email <span className="text-red-500">*</span>
                </label>
                <input type="text" autoComplete="username" placeholder="Nhập tên đăng nhập hoặc email"
                  className={inputCls(loginErrors.username, loginTouched.username)}
                  value={loginData.username} onChange={handleLoginChange("username")}
                  onBlur={() => setLoginTouched((p) => ({ ...p, username: true }))}
                  aria-invalid={!!(loginTouched.username && loginErrors.username)}
                />
                <FieldError msg={loginTouched.username ? loginErrors.username : ""} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} autoComplete="current-password" placeholder="Nhập mật khẩu"
                    className={inputCls(loginErrors.password, loginTouched.password) + " pr-12"}
                    value={loginData.password} onChange={handleLoginChange("password")}
                    onBlur={() => setLoginTouched((p) => ({ ...p, password: true }))}
                    aria-invalid={!!(loginTouched.password && loginErrors.password)}
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                    {showPw ? <EyeIcon /> : <EyeSlashIcon />}
                  </button>
                </div>
                <FieldError msg={loginTouched.password ? loginErrors.password : ""} />
                <div className="flex justify-end mt-1">
                  <button type="button" onClick={() => navigate("/forgot-password")} className="text-xs text-emerald-600 hover:underline">Quên mật khẩu?</button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-full text-white font-semibold shadow-md transition bg-gradient-to-r from-emerald-600 to-emerald-700 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                {loading ? <><SpinnerIcon />Đang xử lý...</> : "Đăng nhập"}
              </button>

              <div className="flex items-center gap-3"><div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">hoặc</span><div className="flex-1 h-px bg-gray-200" /></div>

              <button type="button" onClick={() => { window.location.href = `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/auth/google`; }}
                className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Đăng nhập với Google
              </button>
            </form>
          )}

          {/* REGISTER FORM - STEP 1 */}
          {activeTab === "register" && !otpSent && (
            <form onSubmit={handleSendOtp} className="space-y-3" noValidate>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập <span className="text-red-500">*</span></label>
                  <input type="text" autoComplete="username" placeholder="username"
                    className={inputCls(regErrors.username, regTouched.username)}
                    value={regData.username} onChange={handleRegChange("username")}
                    onBlur={() => setRegTouched((p) => ({ ...p, username: true }))} />
                  <FieldError msg={regTouched.username ? regErrors.username : ""} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                  <input type="text" autoComplete="name" placeholder="Nguyễn Văn A"
                    className={inputCls(regErrors.fullName, regTouched.fullName)}
                    value={regData.fullName} onChange={handleRegChange("fullName")}
                    onBlur={() => setRegTouched((p) => ({ ...p, fullName: true }))} />
                  <FieldError msg={regTouched.fullName ? regErrors.fullName : ""} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input type="text" autoComplete="email" placeholder="email@gmail.com"
                    className={inputCls(regErrors.email, regTouched.email)}
                    value={regData.email} onChange={handleRegChange("email")}
                    onBlur={() => setRegTouched((p) => ({ ...p, email: true }))} />
                  <FieldError msg={regTouched.email ? regErrors.email : ""} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input type="tel" autoComplete="tel" placeholder="0901234567"
                    className={inputCls(regErrors.phone, regTouched.phone)}
                    value={regData.phone} onChange={handleRegChange("phone")}
                    onBlur={() => setRegTouched((p) => ({ ...p, phone: true }))} />
                  <FieldError msg={regTouched.phone ? regErrors.phone : ""} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} autoComplete="new-password" placeholder="Ví dụ: MyPass@123"
                    className={inputCls(regErrors.password, regTouched.password) + " pr-12"}
                    value={regData.password} onChange={handleRegChange("password")}
                    onBlur={() => setRegTouched((p) => ({ ...p, password: true }))} />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                    {showPw ? <EyeIcon /> : <EyeSlashIcon />}
                  </button>
                </div>
                <FieldError msg={regTouched.password ? regErrors.password : ""} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showConfirmPw ? "text" : "password"} autoComplete="new-password" placeholder="Nhập lại mật khẩu"
                    className={inputCls(regErrors.confirmPassword, regTouched.confirmPassword) + " pr-12"}
                    value={regData.confirmPassword} onChange={handleRegChange("confirmPassword")}
                    onBlur={() => setRegTouched((p) => ({ ...p, confirmPassword: true }))} />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowConfirmPw(!showConfirmPw)} tabIndex={-1}>
                    {showConfirmPw ? <EyeIcon /> : <EyeSlashIcon />}
                  </button>
                </div>
                <FieldError msg={regTouched.confirmPassword ? regErrors.confirmPassword : ""} />
              </div>

              <button type="submit" disabled={otpLoading}
                className="w-full py-3 rounded-full text-white font-semibold shadow-md transition bg-gradient-to-r from-emerald-600 to-emerald-700 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                {otpLoading ? <><SpinnerIcon />Đang gửi OTP...</> : "Gửi mã OTP"}
              </button>
            </form>
          )}

          {/* REGISTER FORM - STEP 2 OTP */}
          {activeTab === "register" && otpSent && (
            <OtpStep
              email={regData.email}
              otp={otp}
              setOtp={setOtp}
              loading={loading}
              alert={alert}
              setAlert={setAlert}
              onSubmit={handleVerifyOtp}
              onBack={() => { setOtpSent(false); setOtp(""); setAlert({ type: "", msg: "" }); }}
              onResend={handleResendOtp}
            />
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="hidden lg:flex flex-col relative bg-emerald-900">
          <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1200&q=80" alt="Apartment" className="w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 flex flex-col justify-end p-10 bg-gradient-to-t from-emerald-900/80 to-transparent">
            <h3 className="text-white text-2xl font-bold mb-2">Quản lý chung cư thông minh</h3>
            <p className="text-emerald-100 text-sm leading-relaxed">Hệ thống quản lý toàn diện — hợp đồng, hóa đơn, sự cố, dịch vụ và nhiều hơn nữa.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
