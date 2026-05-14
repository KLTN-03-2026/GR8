// ─── Validation rules ─────────────────────────────────────────────────────────

export const RULES = {
  username: {
    required: "Vui lòng nhập tên đăng nhập",
    minLength: { value: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự" },
    maxLength: { value: 20, message: "Tên đăng nhập không được vượt quá 20 ký tự" },
    pattern: {
      value: /^[a-zA-Z0-9_]+$/,
      message: "Chỉ được chứa chữ cái, số và dấu gạch dưới (_)",
    },
  },
  email: {
    required: "Vui lòng nhập email",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      message: "Email không đúng định dạng",
    },
  },
  password: {
    required: "Vui lòng nhập mật khẩu",
    minLength: { value: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
    uppercase: { pattern: /[A-Z]/, message: "Phải chứa ít nhất 1 chữ hoa (A-Z)" },
    lowercase: { pattern: /[a-z]/, message: "Phải chứa ít nhất 1 chữ thường (a-z)" },
    number: { pattern: /[0-9]/, message: "Phải chứa ít nhất 1 chữ số (0-9)" },
    special: { pattern: /[^a-zA-Z0-9]/, message: "Phải chứa ít nhất 1 ký tự đặc biệt (!@#$...)" },
  },
  // ─── Profile rules ──────────────────────────────────────────────────────────
  phone: {
    // Số điện thoại Việt Nam: 0xxxxxxxxx hoặc +84xxxxxxxxx
    pattern: {
      value: /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/,
      message: "Số điện thoại không đúng định dạng Việt Nam",
    },
  },
  cccd: {
    // CCCD Việt Nam: đúng 12 chữ số
    pattern: {
      value: /^[0-9]{12}$/,
      message: "CCCD phải gồm đúng 12 chữ số",
    },
  },
};

// ─── Date helpers ─────────────────────────────────────────────────────────────

/**
 * Parse date string YYYY-MM-DD hoặc DD/MM/YYYY → Date object
 * Trả null nếu không hợp lệ
 */
export const parseDate = (value) => {
  if (!value) return null;
  let d;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    // ISO format từ input[type=date]
    d = new Date(value + "T00:00:00");
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/").map(Number);
    d = new Date(year, month - 1, day);
    // Kiểm tra ngày thực sự tồn tại (VD: 31/02 sẽ bị lệch tháng)
    if (d.getDate() !== day || d.getMonth() !== month - 1 || d.getFullYear() !== year) return null;
  } else {
    return null;
  }
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Validate ngày sinh: phải hợp lệ và >= 14 tuổi
 */
export const validateNgaySinh = (value) => {
  if (!value) return ""; // optional
  const d = parseDate(value);
  if (!d) return "Ngày sinh không hợp lệ";
  const today = new Date();
  const age = today.getFullYear() - d.getFullYear() -
    (today < new Date(today.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
  if (age < 14) return "Người dùng phải từ 14 tuổi trở lên";
  if (d > today) return "Ngày sinh không được là ngày tương lai";
  return "";
};

/**
 * Validate ngày cấp CCCD: phải hợp lệ và không được là ngày tương lai
 */
export const validateNgayCapCCCD = (value) => {
  if (!value) return ""; // optional
  const d = parseDate(value);
  if (!d) return "Ngày cấp CCCD không hợp lệ";
  if (d > new Date()) return "Ngày cấp CCCD không được là ngày tương lai";
  return "";
};

// ─── Validate single field ────────────────────────────────────────────────────

export const validateField = (name, value, extraData = {}) => {
  switch (name) {
    case "username": {
      if (!value.trim()) return RULES.username.required;
      if (value.trim().length < RULES.username.minLength.value) return RULES.username.minLength.message;
      if (value.trim().length > RULES.username.maxLength.value) return RULES.username.maxLength.message;
      if (!RULES.username.pattern.value.test(value.trim())) return RULES.username.pattern.message;
      return "";
    }
    case "fullName":
    case "HoTen": {
      if (!value?.trim()) return "Vui lòng nhập họ và tên";
      if (value.trim().length < 2) return "Họ tên phải có ít nhất 2 ký tự";
      return "";
    }
    case "email":
    case "Email": {
      if (!value?.trim()) return RULES.email.required;
      if (!RULES.email.pattern.value.test(value.trim())) return RULES.email.pattern.message;
      return "";
    }
    case "phone":
    case "SoDienThoai": {
      if (!value) return "Vui lòng nhập số điện thoại";
      const cleaned = value.replace(/\s/g, "");
      if (!RULES.phone.pattern.value.test(cleaned)) return RULES.phone.pattern.message;
      return "";
    }
    case "CCCD": {
      if (!value) return "Vui lòng nhập số CCCD";
      if (!RULES.cccd.pattern.value.test(value.trim())) return RULES.cccd.pattern.message;
      return "";
    }
    case "NgaySinh": {
      return validateNgaySinh(value);
    }
    case "NgayCapCCCD": {
      return validateNgayCapCCCD(value);
    }
    case "password": {
      if (!value) return RULES.password.required;
      if (value.length < 8) return RULES.password.minLength.message;
      if (!RULES.password.uppercase.pattern.test(value)) return RULES.password.uppercase.message;
      if (!RULES.password.lowercase.pattern.test(value)) return RULES.password.lowercase.message;
      if (!RULES.password.number.pattern.test(value)) return RULES.password.number.message;
      if (!RULES.password.special.pattern.test(value)) return RULES.password.special.message;
      if (extraData.username && value.toLowerCase().includes(extraData.username.toLowerCase())) {
        return "Mật khẩu không được chứa tên đăng nhập";
      }
      if (extraData.email) {
        const emailPrefix = extraData.email.split("@")[0].toLowerCase();
        if (emailPrefix.length >= 3 && value.toLowerCase().includes(emailPrefix)) {
          return "Mật khẩu không được chứa phần tên trong email";
        }
      }
      return "";
    }
    case "confirmPassword": {
      if (!value) return "Vui lòng xác nhận mật khẩu";
      if (value !== extraData.password) return "Mật khẩu xác nhận không khớp";
      return "";
    }
    case "loginIdentifier": {
      if (!value.trim()) return "Vui lòng nhập tên đăng nhập hoặc email";
      if (value.trim().length < 3) return "Phải có ít nhất 3 ký tự";
      return "";
    }
    case "loginPassword": {
      if (!value) return "Vui lòng nhập mật khẩu";
      return "";
    }
    default:
      return "";
  }
};

// ─── Validate profile form ────────────────────────────────────────────────────

export const validateProfileForm = (data) => ({
  HoTen:       validateField("HoTen", data.HoTen),
  Email:       validateField("Email", data.Email),
  SoDienThoai: validateField("SoDienThoai", data.SoDienThoai),
  CCCD:        validateField("CCCD", data.CCCD),
  NgaySinh:    validateField("NgaySinh", data.NgaySinh),
  NgayCapCCCD: validateField("NgayCapCCCD", data.NgayCapCCCD),
});

// ─── Validate full form ───────────────────────────────────────────────────────

export const validateLoginForm = (data) => ({
  username: validateField("loginIdentifier", data.username),
  password: validateField("loginPassword", data.password),
});

export const validateRegisterForm = (data) => ({
  username:        validateField("username", data.username),
  fullName:        validateField("fullName", data.fullName),
  email:           validateField("email", data.email),
  phone:           validateField("phone", data.phone),
  password:        validateField("password", data.password, { username: data.username, email: data.email }),
  confirmPassword: validateField("confirmPassword", data.confirmPassword, { password: data.password }),
});

export const isFormValid = (errors) =>
  Object.values(errors).every((e) => !e);

// ─── Password strength score (0-4) ───────────────────────────────────────────

export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  const levels = [
    { label: "", color: "" },
    { label: "Yếu", color: "bg-red-500" },
    { label: "Trung bình", color: "bg-orange-400" },
    { label: "Khá", color: "bg-yellow-400" },
    { label: "Mạnh", color: "bg-emerald-500" },
  ];
  return { score, ...levels[score] };
};
