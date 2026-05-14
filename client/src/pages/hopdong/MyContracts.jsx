// client/src/pages/hopdong/MyContracts.jsx
import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';
import {
  PageWrapper, PageHeader, Alert, Card, Badge, Btn,
  TabBar, EmptyState, PageSkeleton, Modal, Field, Textarea,
} from '../../components/tenant/TenantUI';
import HopDongPreview from '../../components/HopDongPreview';

const STATUS_MAP = {
  ChoKy:         { label: 'Chờ ký',        variant: 'warning' },
  DaKy:          { label: 'Đã ký',          variant: 'info'    },
  DangThue:      { label: 'Đang thuê',      variant: 'success' },
  HetHan:        { label: 'Hết hạn',        variant: 'default' },
  KetThuc:       { label: 'Kết thúc',       variant: 'default' },
  ChuyenNhuong:  { label: 'Chuyển nhượng',  variant: 'purple'  },
};

const diffDays = (date) => Math.ceil((new Date(date) - new Date()) / 86400000);
const diffMonths = (date) => Math.floor((new Date() - new Date(date)) / (86400000 * 30));


const MyContracts = ({ contractId } = {}) => {
  const navigate = useNavigate();
  const [contracts, setContracts]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');
  const [activeTab, setActiveTab]         = useState('all');
  const [signingId, setSigningId]         = useState(null);
  const [terminateId, setTerminateId]     = useState(null);
  const [terminateReason, setTerminateReason] = useState('');
  const [terminating, setTerminating]     = useState(false);
  const [previewContract, setPreviewContract] = useState(null);

  useEffect(() => { fetchMyContracts(); }, []);

  const fetchMyContracts = async () => {
    try {
      setLoading(true); setError('');
      const res = await axios.get('/hopdong/my');
      const data = res.data.data || [];
      setContracts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải hợp đồng');
    } finally { setLoading(false); }
  };

  const handleSign = async (id) => {
    if (!window.confirm('Xác nhận ký hợp đồng này?')) return;
    setSigningId(id);
    try {
      await axios.put(`/hopdong/sign/${id}`);
      setSuccess('Ký hợp đồng thành công!');
      fetchMyContracts();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) { setError(err.response?.data?.message || 'Ký hợp đồng thất bại'); }
    finally { setSigningId(null); }
  };

  const handleTerminate = async () => {
    if (!terminateId) return;
    setTerminating(true);
    try {
      await axios.post(`/hopdong/${terminateId}/request-terminate`, {
        LyDo: terminateReason || 'Người thuê yêu cầu kết thúc hợp đồng',
      });
      setSuccess('Đã gửi yêu cầu kết thúc hợp đồng!');
      setTerminateId(null); setTerminateReason('');
      fetchMyContracts();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) { setError(err.response?.data?.message || 'Không thể gửi yêu cầu'); }
    finally { setTerminating(false); }
  };

  const tabs = [
    { key: 'all',      label: 'Tất cả' },
    { key: 'DangThue', label: 'Đang thuê' },
    { key: 'HetHan',   label: 'Hết hạn' },
    { key: 'KetThuc',  label: 'Kết thúc' },
  ];

  const filtered = contracts
    .filter(c => contractId ? c.ID === Number(contractId) : true)
    .filter(c => activeTab === 'all' || c.TrangThai === activeTab);

  return (
    <PageWrapper>
      <PageHeader
        title="Hợp đồng của tôi"
        subtitle="Quản lý và theo dõi hợp đồng thuê căn hộ"
        action={
          <Btn variant="secondary" onClick={fetchMyContracts}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </Btn>
        }
      />

      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert type="error"   message={error}   onClose={() => setError('')}   />

      <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {loading ? <PageSkeleton /> : filtered.length === 0 ? (
        <EmptyState title="Không có hợp đồng" description="Chưa có hợp đồng nào trong mục này" />
      ) : (
        <div className="space-y-4">
          {filtered.map(c => {
            const days = diffDays(c.NgayKetThuc);
            const months = diffMonths(c.NgayBatDau);
            const expiringSoon = c.TrangThai === 'DangThue' && days > 0 && days <= 30;
            const st = STATUS_MAP[c.TrangThai] || STATUS_MAP.KetThuc;

            return (
              <Card key={c.ID} className={expiringSoon ? 'border-amber-200' : ''}>
                {expiringSoon && (
                  <div className="px-5 py-2 bg-amber-50 border-b border-amber-100 rounded-t-xl">
                    <p className="text-xs font-semibold text-amber-700">Hợp đồng sắp hết hạn — còn {days} ngày</p>
                  </div>
                )}
                <div className="p-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Hợp đồng #{c.ID}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {c.canho?.MaCanHo} &bull; Phòng {c.canho?.SoPhong} &bull; Tầng {c.canho?.Tang}
                      </p>
                    </div>
                    <Badge label={st.label} variant={st.variant} />
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                    <div>
                      <p className="text-xs text-gray-500">Bắt đầu</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{new Date(c.NgayBatDau).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kết thúc</p>
                      <p className={`text-sm font-medium mt-0.5 ${expiringSoon ? 'text-amber-600' : 'text-gray-900'}`}>{new Date(c.NgayKetThuc).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Giá thuê / tháng</p>
                      <p className="text-sm font-semibold text-indigo-600 mt-0.5">{formatCurrency(c.GiaThue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tiền cọc</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{formatCurrency(c.TienCoc)}</p>
                    </div>
                  </div>

                  {/* Progress for active contracts */}
                  {c.TrangThai === 'DangThue' && (
                    <div className="flex gap-4 mb-5">
                      <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Đã thuê</p>
                        <p className="text-lg font-bold text-gray-900">{months} tháng</p>
                      </div>
                      <div className={`flex-1 rounded-lg p-3 text-center ${days <= 30 ? 'bg-amber-50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-500">Còn lại</p>
                        <p className={`text-lg font-bold ${days <= 30 ? 'text-amber-600' : 'text-gray-900'}`}>
                          {days > 0 ? `${days} ngày` : 'Đã hết hạn'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Btn
                      variant="primary" size="sm"
                      onClick={async () => {
                        try {
                          const res = await axios.get(`/hopdong/${c.ID}`);
                          setPreviewContract(res.data.data);
                        } catch { setError('Không thể tải hợp đồng'); }
                      }}
                    >
                      📄 Xem & In hợp đồng
                    </Btn>
                    {c.canho?.ID && (
                      <Btn variant="secondary" size="sm" onClick={() => navigate(`/apartments/${c.canho.ID}`)}>
                        Xem căn hộ
                      </Btn>
                    )}
                    {c.TrangThai === 'ChoKy' && (
                      <Btn
                        variant="primary" size="sm"
                        disabled={signingId === c.ID}
                        onClick={() => handleSign(c.ID)}
                      >
                        {signingId === c.ID ? 'Đang xử lý...' : '✍️ Ký hợp đồng'}
                      </Btn>
                    )}
                    {c.TrangThai === 'DangThue' && (
                      <Btn variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 ml-auto" onClick={() => setTerminateId(c.ID)}>
                        Yêu cầu kết thúc
                      </Btn>
                    )}
                  </div>

                  {/* Sign notice */}
                  {c.TrangThai === 'ChoKy' && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      <p className="text-xs font-semibold text-amber-800 mb-0.5">Hợp đồng đang chờ bạn ký</p>
                      <p className="text-xs text-amber-700">Vui lòng đọc kỹ điều khoản trước khi ký. Sau khi ký, hợp đồng sẽ có hiệu lực.</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Terminate modal */}
      <Modal
        open={!!terminateId}
        onClose={() => { setTerminateId(null); setTerminateReason(''); }}
        title="Yêu cầu kết thúc hợp đồng"
        footer={
          <div className="flex gap-3">
            <Btn variant="secondary" className="flex-1" onClick={() => { setTerminateId(null); setTerminateReason(''); }}>Hủy</Btn>
            <Btn variant="danger" className="flex-1" disabled={terminating} onClick={handleTerminate}>
              {terminating ? 'Đang gửi...' : 'Xác nhận gửi'}
            </Btn>
          </div>
        }
      >
        <p className="text-sm text-gray-500 mb-4">Sau khi gửi, quản lý sẽ liên hệ để xác nhận và hướng dẫn thủ tục bàn giao.</p>
        <Field label="Lý do kết thúc">
          <Textarea
            value={terminateReason}
            onChange={e => setTerminateReason(e.target.value)}
            rows={3}
            placeholder="VD: Chuyển công tác, mua nhà riêng..."
          />
        </Field>
      </Modal>

      {/* HopDong Preview + Print */}
      {previewContract && (
        <HopDongPreview
          contract={previewContract}
          onClose={() => setPreviewContract(null)}
        />
      )}
    </PageWrapper>
  );
};

export default MyContracts;
