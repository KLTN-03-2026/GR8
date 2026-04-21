// client/src/services/billingService.js
// API calls for billing workflow

import api from '../api/axios';

// ============================================
// BƯỚC 1: Nhân viên kỹ thuật ghi chỉ số
// ============================================

export const createMeterReading = async (data) => {
  const response = await api.post('/chisodiennuoc', data);
  return response.data;
};

export const getAllMeterReadings = async (params = {}) => {
  const response = await api.get('/chisodiennuoc', { params });
  return response.data;
};

export const getMeterReadingById = async (id) => {
  const response = await api.get(`/chisodiennuoc/${id}`);
  return response.data;
};

// ============================================
// BƯỚC 2: Kế toán xác nhận & phát hành
// ============================================

export const getPendingMeterReadings = async (params = {}) => {
  const response = await api.get('/chisodiennuoc/pending', { params });
  return response.data;
};

export const confirmReading = async (id, data) => {
  const response = await api.post(`/chisodiennuoc/${id}/confirm`, data);
  return response.data;
};

// Alias for backward compatibility
export const confirmAndGenerateInvoice = confirmReading;

// ============================================
// BƯỚC 3: Người thuê xem & thanh toán
// ============================================

export const getMyInvoices = async (params = {}) => {
  const response = await api.get('/hoadon/my-invoices', { params });
  return response.data;
};

export const getInvoiceDetail = async (id) => {
  const response = await api.get(`/hoadon/${id}`);
  return response.data;
};

// Alias for backward compatibility
export const getInvoiceById = getInvoiceDetail;

export const markInvoiceAsPaid = async (id, data = {}) => {
  const response = await api.post(`/hoadon/${id}/mark-paid`, data);
  return response.data;
};

export const getPendingReadings = getPendingMeterReadings;

// ============================================
// Manager/Accountant - Xem tất cả hóa đơn
// ============================================

export const getAllInvoices = async (params = {}) => {
  const response = await api.get('/hoadon', { params });
  return response.data;
};
