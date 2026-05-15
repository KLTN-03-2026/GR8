// client/src/pages/hoadon/MyInvoicesList.jsx
import { useState, useEffect } from 'react';
import { getMyInvoices } from '../../services/billingService';
import { formatCurrency } from '../../utils/formatCurrency';
import PaymentModal from '../../components/billing/PaymentModal';
import {
  PageWrapper, PageHeader, Alert, Card, Badge, Btn,
  TabBar, EmptyState, PageSkeleton,
} from '../../components/tenant/TenantUI';

const STATUS_MAP = {
  ChuaTT: { label: 'Chưa thanh toán', variant: 'warning' },
  ChoXacNhan: { label: 'Chờ xác nhận', variant: 'info' },
  DaTT:   { label: 'Đã thanh toán',   variant: 'success' },
  QuaHan: { label: 'Quá hạn',         variant: 'danger'  },
};

const LOAI_LABELS = {
  TienThue: 'Tiền thuê',
  Dien:     'Tiền điện',
  Nuoc:     'Tiền nước',
  DichVu:   'Phí dịch vụ',
  Phat:     'Tiền phạt',
};

const isOverdue = (inv) =>
  inv.TrangThai !== 'DaTT' && new Date(inv.NgayDenHan) < new Date();

const MyInvoicesList = ({ canHoID, contractId } = {}) => {
  const [invoices, setInvoices]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [activeTab, setActiveTab]         = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => { fetchInvoices(); }, [contractId]);

  const fetchInvoices = async () => {
    try {
      setLoading(true); setError('');
      const res = await getMyInvoices({});
      const data = res.data.items || res.data || [];
      let list = Array.isArray(data) ? data : [];
      // Lọc theo căn hộ nếu có
      if (contractId) list = list.filter(inv => inv.HopDongID === Number(contractId));
      else if (canHoID) list = list.filter(inv => inv.hopdong?.CanHoID === Number(canHoID));
      setInvoices(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải hóa đơn');
    } finally { setLoading(false); }
  };

  const total   = invoices.length;
  const paid    = invoices.filter(i => i.TrangThai === 'DaTT').length;
  const unpaid  = invoices.filter(i => i.TrangThai !== 'DaTT').length;
  const overdue = invoices.filter(isOverdue).length;
  const totalDebt = invoices.filter(i => i.TrangThai !== 'DaTT').reduce((s, i) => s + parseFloat(i.TongTien || 0), 0);

  const filtered = invoices.filter(inv => {
    if (activeTab === 'unpaid') return inv.TrangThai !== 'DaTT';
    if (activeTab === 'paid')   return inv.TrangThai === 'DaTT';
    return true;
  });

  const tabs = [
    { key: 'all',    label: 'Tất cả',           count: total  },
    { key: 'unpaid', label: 'Chưa thanh toán',   count: unpaid },
    { key: 'paid',   label: 'Đã thanh toán',     count: paid   },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Hóa đơn của tôi"
        subtitle="Xem và thanh toán hóa đơn căn hộ"
        action={
          <Btn variant="secondary" size="md" onClick={fetchInvoices}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </Btn>
        }
      />

      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng hóa đơn',       value: total,                    sub: null },
          { label: 'Đã thanh toán',       value: paid,                     sub: null },
          { label: 'Chưa thanh toán',     value: unpaid,                   sub: null },
          { label: 'Tổng nợ',             value: formatCurrency(totalDebt), sub: overdue > 0 ? `${overdue} quá hạn` : null },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{s.value}</p>
            {s.sub && <p className="text-xs text-red-500 mt-0.5">{s.sub}</p>}
          </Card>
        ))}
      </div>

      <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {loading ? <PageSkeleton /> : filtered.length === 0 ? (
        <EmptyState title="Không có hóa đơn" description="Chưa có hóa đơn nào trong mục này" />
      ) : (
        <div className="space-y-3">
          {filtered.map(inv => {
            const overdueBool = isOverdue(inv);
            const st = STATUS_MAP[overdueBool ? 'QuaHan' : inv.TrangThai] || STATUS_MAP.ChuaTT;
            return (
              <Card key={inv.ID} className={overdueBool ? 'border-red-200' : ''}>
                {overdueBool && (
                  <div className="px-5 py-2 bg-red-50 border-b border-red-100 rounded-t-xl">
                    <p className="text-xs font-semibold text-red-600">Hóa đơn quá hạn — vui lòng thanh toán ngay</p>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Hóa đơn #{inv.MaHoaDon || inv.ID}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {inv.hopdong?.canho?.MaCanHo} &bull; Tháng {inv.ThangNam}
                      </p>
                    </div>
                    <Badge label={st.label} variant={st.variant} />
                  </div>

                  {/* Line items */}
                  {inv.hoadonchitiet?.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                      {inv.hoadonchitiet.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.MoTa || LOAI_LABELS[item.Loai] || item.Loai}</span>
                          <span className="font-medium text-gray-900">{formatCurrency(item.SoTien)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200">
                        <span className="text-gray-900">Tổng cộng</span>
                        <span className="text-indigo-600">{formatCurrency(inv.TongTien)}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <p>Ngày lập: {new Date(inv.NgayLap).toLocaleDateString('vi-VN')}</p>
                      <p className={overdueBool ? 'text-red-500 font-medium' : ''}>
                        Hạn TT: {new Date(inv.NgayDenHan).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    {inv.TrangThai !== 'DaTT' ? (
                      <Btn variant="primary" size="md" onClick={() => setSelectedInvoice(inv)}>
                        Thanh toán
                      </Btn>
                    ) : (
                      <Btn variant="secondary" size="md" onClick={() => setSelectedInvoice(inv)}>
                        Xem chi tiết
                      </Btn>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedInvoice && (
        <PaymentModal
          invoice={selectedInvoice}
          onClose={() => { setSelectedInvoice(null); fetchInvoices(); }}
        />
      )}
    </PageWrapper>
  );
};

export default MyInvoicesList;
