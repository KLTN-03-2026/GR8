// Trang này nhận token từ backend sau khi Google OAuth thành công
// Backend redirect về: /auth/google/callback?token=...&user=...

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const userRaw = searchParams.get("user");
    const error = searchParams.get("error");

    if (error || !token || !userRaw) {
      navigate("/login?error=google_failed", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      loginWithToken(token, user);
      navigate("/dashboard", { replace: true });
    } catch {
      navigate("/login?error=google_failed", { replace: true });
    }
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Đang xử lý đăng nhập Google...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
