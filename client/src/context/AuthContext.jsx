import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);

      // Fetch /me để đồng bộ + đảm bảo VaiTro luôn có
      api.get("/users/me", { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          const meData = res.data.data;
          // VaiTro lấy từ roles.TenVaiTro (DB) hoặc giữ từ token cũ
          const vaiTro = meData.roles?.TenVaiTro || meData.VaiTro || parsed.VaiTro || null;
          const freshUser = { ...parsed, ...meData, VaiTro: vaiTro };
          localStorage.setItem("user", JSON.stringify(freshUser));
          setUser(freshUser);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    const { user, accessToken } = response.data.data;
    localStorage.setItem("token", accessToken);

    // Lấy đầy đủ thông tin user từ /users/me sau khi login
    try {
      const meRes = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const meData = meRes.data.data;
      const vaiTro = meData.roles?.TenVaiTro || meData.VaiTro || user.VaiTro || null;
      const fullUser = { ...user, ...meData, VaiTro: vaiTro };
      localStorage.setItem("user", JSON.stringify(fullUser));
      setUser(fullUser);
    } catch {
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
    }

    return response.data;
  };

  const register = async (userData) => {
    if (userData._sendOtp) {
      const { _sendOtp, ...data } = userData;
      const response = await api.post("/auth/register/send-otp", data);
      return response.data;
    }
    if (userData._verifyOtp) {
      const { _verifyOtp, ...data } = userData;
      const response = await api.post("/auth/register/verify-otp", data);
      return response.data;
    }
    // fallback legacy
    const response = await api.post("/auth/register", userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("chat_session_id");
    setUser(null);
  };

  const loginWithToken = async (token, user) => {
    localStorage.setItem("token", token);

    // Lấy đầy đủ thông tin user từ /users/me
    try {
      const meRes = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fullUser = { ...user, ...meRes.data.data };
      localStorage.setItem("user", JSON.stringify(fullUser));
      setUser(fullUser);
    } catch {
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
    }
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loginWithToken, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
