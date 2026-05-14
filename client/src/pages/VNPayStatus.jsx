import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getInvoiceDetail } from "../services/billingService";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDateTime } from "../utils/formatDate";

const VNPayStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const vnpayResponseCode = searchParams.get("vnp_ResponseCode");
        const invoiceId = searchParams.get("invoiceId");
        const transactionNo = searchParams.get("vnp_TransactionNo");

        if (!invoiceId) {
          setPaymentStatus({
            success: false,
            message: "Không tìm thấy thông tin hóa đơn",
          });
          setLoading(false);
          return;
        }

        // Try to fetch invoice if user is authenticated
        if (user && user.ID) {
          try {
            const response = await getInvoiceDetail(invoiceId);
            setInvoice(response.data);
          } catch (err) {
            console.warn("Không thể lấy thông tin hóa đơn:", err);
          }
        }

        if (vnpayResponseCode === "00") {
          setPaymentStatus({
            success: true,
            message: "Thanh toán VNPay thành công!",
            transactionNo,
          });
        } else if (vnpayResponseCode === "24") {
          setPaymentStatus({
            success: false,
            message: "Người dùng đã hủy giao dịch",
          });
        } else {
          setPaymentStatus({
            success: false,
            message: `Lỗi thanh toán VNPay. Mã: ${vnpayResponseCode}`,
          });
        }
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái VNPay:", error);
        setPaymentStatus({
          success: false,
          message: "Lỗi khi kiểm tra trạng thái thanh toán",
        });
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [searchParams, user]);

  useEffect(() => {
    if (paymentStatus?.success && invoice?.TrangThai === "DaTT") {
      const timer = setTimeout(() => {
        navigate("/my-invoices");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [paymentStatus, invoice, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-300 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">
            Đang kiểm tra trạng thái thanh toán...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div
        className={`max-w-md w-full rounded-3xl shadow-2xl overflow-hidden border-2 ${
          paymentStatus?.success
            ? "border-emerald-300 bg-white"
            : "border-red-300 bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-8 text-center ${
            paymentStatus?.success
              ? "bg-gradient-to-r from-emerald-600 to-teal-600"
              : "bg-gradient-to-r from-red-600 to-orange-600"
          }`}
        >
          <div className="text-5xl mb-4">
            {paymentStatus?.success ? "" : ""}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {paymentStatus?.message}
          </h1>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {invoice && (
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Mã hóa đơn:</span>
                <span className="font-semibold text-slate-900">
                  {invoice.MaHoaDon || invoice.ID}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Tổng tiền:</span>
                <span className="font-semibold text-lg text-blue-600">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(invoice.TongTien)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Trạng thái:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    invoice.TrangThai === "DaTT"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {invoice.TrangThai === "DaTT"
                    ? "Đã thanh toán"
                    : "Chờ xác nhận"}
                </span>
              </div>
              {paymentStatus?.transactionNo && (
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-600 text-sm">Mã giao dịch:</span>
                  <span className="font-mono text-sm text-slate-700">
                    {paymentStatus.transactionNo}
                  </span>
                </div>
              )}
            </div>
          )}

          <div
            className={`rounded-2xl p-4 text-sm ${
              paymentStatus?.success
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {paymentStatus?.success
              ? "Thanh toán đã được ghi nhận. Bạn sẽ được chuyển hướng về trang hóa đơn trong vài giây..."
              : "Vui lòng kiểm tra lại thông tin thanh toán hoặc liên hệ với ban quản lý."}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/my-invoices")}
              className="flex-1 rounded-2xl bg-blue-600 text-white font-semibold py-3 hover:bg-blue-700 transition"
            >
              Về hóa đơn
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 rounded-2xl bg-slate-200 text-slate-900 font-semibold py-3 hover:bg-slate-300 transition"
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 text-center text-xs text-slate-500 border-t border-slate-200">
          Ngày giờ: {formatDateTime(new Date())}
        </div>
      </div>
    </div>
  );
};

export default VNPayStatus;
