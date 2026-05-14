/**
 * vnpay.config.js
 * Cấu hình kết nối VNPay
 */

export default {
  VNPAY: {
    tmnCode: process.env.VNPAY_TMN_CODE || "",
    hashSecret: process.env.VNPAY_HASH_SECRET || "",
    paymentUrl:
      process.env.VNPAY_PAYMENT_URL ||
      "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    returnUrl:
      process.env.VNPAY_RETURN_URL ||
      `${process.env.CLIENT_URL || "http://localhost:3000"}/vnpay-status`,
    locale: process.env.VNPAY_LOCALE || "vn",
    version: process.env.VNPAY_VERSION || "2.1.0",
    command: process.env.VNPAY_COMMAND || "pay",
    orderType: process.env.VNPAY_ORDER_TYPE || "billpayment",
    expireMinutes: Number(process.env.VNPAY_EXPIRE_MINUTES || 15),
  },
};
