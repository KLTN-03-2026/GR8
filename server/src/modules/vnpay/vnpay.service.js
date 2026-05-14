import crypto from "crypto";
import prisma from "../../config/prisma.js";
import vnpayConfig from "../../config/vnpay.config.js";

const { VNPAY } = vnpayConfig;

const formatDate = (date) => {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(
    date.getHours(),
  )}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
};

const sortObjectByKey = (obj) =>
  Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});

const buildQueryString = (params) =>
  Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");

export const getVnpayCheckoutUrl = async (invoiceId, ipAddress) => {
  if (!VNPAY.tmnCode || !VNPAY.hashSecret) {
    throw Object.assign(
      new Error("Cấu hình VNPay chưa đầy đủ. Vui lòng thiết lập VNPAY_TMN_CODE và VNPAY_HASH_SECRET."),
      { statusCode: 500 },
    );
  }

  const invoice = await prisma.hoadon.findUnique({
    where: { ID: Number(invoiceId) },
    include: {
      hopdong: {
        select: {
          NguoiThueID: true,
        },
      },
    },
  });

  if (!invoice) {
    throw Object.assign(new Error("Không tìm thấy hóa đơn VNPay"), { statusCode: 404 });
  }

  const amount = Math.round(Number(invoice.TongTien) * 100);
  const reference = `INV${invoice.ID}`;
  const createDate = formatDate(new Date());
  const expireDate = formatDate(
    new Date(Date.now() + VNPAY.expireMinutes * 60 * 1000),
  );

  const vnpParams = {
    vnp_Version: VNPAY.version,
    vnp_Command: VNPAY.command,
    vnp_TmnCode: VNPAY.tmnCode,
    vnp_Amount: String(amount),
    vnp_CurrCode: "VND",
    vnp_TxnRef: reference,
    vnp_OrderInfo: `Thanh toán hóa đơn ${invoice.MaHoaDon || invoice.ID}`,
    vnp_OrderType: VNPAY.orderType,
    vnp_Locale: VNPAY.locale,
    vnp_ReturnUrl: `${VNPAY.returnUrl}?invoiceId=${invoiceId}`,
    vnp_IpAddr: ipAddress || "127.0.0.1",
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  const sortedParams = sortObjectByKey(vnpParams);
  const queryString = buildQueryString(sortedParams);
  const secureHash = crypto
    .createHmac("sha512", VNPAY.hashSecret)
    .update(queryString)
    .digest("hex");

  return `${VNPAY.paymentUrl}?${queryString}&vnp_SecureHashType=SHA512&vnp_SecureHash=${secureHash}`;
};

const parseInvoiceId = (txnRef) => {
  if (!txnRef) return null;
  const match = String(txnRef).match(/^INV(\d+)$/);
  if (match) {
    return Number(match[1]);
  }
  const maybeId = Number(txnRef);
  return Number.isInteger(maybeId) ? maybeId : null;
};

export const verifyVnpaySignature = (query) => {
  const secureHash = query.vnp_SecureHash;
  const hashType = query.vnp_SecureHashType;

  if (!secureHash || !hashType) {
    return false;
  }

  const inputData = { ...query };
  delete inputData.vnp_SecureHash;
  delete inputData.vnp_SecureHashType;

  const sorted = sortObjectByKey(inputData);
  const signData = buildQueryString(sorted);
  const computedHash = crypto
    .createHmac("sha512", VNPAY.hashSecret)
    .update(signData)
    .digest("hex");

  return computedHash === secureHash;
};

export const handleVnpayReturn = async (query) => {
  if (!verifyVnpaySignature(query)) {
    return {
      success: false,
      message: "Chữ ký VNPay không hợp lệ. Không thể xác thực giao dịch.",
    };
  }

  const responseCode = query.vnp_ResponseCode;
  const txnRef = query.vnp_TxnRef;
  const transactionNo = query.vnp_TransactionNo || query.vnp_BankTranNo || "";

  if (responseCode !== "00") {
    return {
      success: false,
      message: `Thanh toán VNPay chưa hoàn thành. Mã trả về: ${responseCode}`,
    };
  }

  const invoiceId = parseInvoiceId(txnRef);
  if (!invoiceId) {
    return {
      success: false,
      message: "Không xác định được hóa đơn từ tham số VNPay.",
    };
  }

  const invoice = await prisma.hoadon.findUnique({
    where: { ID: invoiceId },
    include: {
      hopdong: {
        select: {
          NguoiThueID: true,
        },
      },
    },
  });

  if (!invoice) {
    return {
      success: false,
      message: "Không tìm thấy hóa đơn tương ứng với giao dịch VNPay.",
    };
  }

  if (invoice.TrangThai !== "DaTT") {
    await prisma.$transaction(async (tx) => {
      await tx.hoadon.update({
        where: { ID: invoiceId },
        data: { TrangThai: "DaTT" },
      });

      await tx.thanhtoan.create({
        data: {
          HoaDonID: invoiceId,
          SoTien: invoice.TongTien,
          NgayThanhToan: new Date(),
          PhuongThuc: "VNPay",
          MaGiaoDich: transactionNo || null,
          NganHang: invoice.NganHang || null,
          GhiChu: "Thanh toán VNPay",
        },
      });
    });
  }

  return {
    success: true,
    message: `Thanh toán VNPay thành công. Mã giao dịch: ${transactionNo}`,
  };
};
