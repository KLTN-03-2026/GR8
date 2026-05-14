// client/src/pages/yeucauthue/MyRentalRequests.jsx
import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { useNavigate } from 'react-router-dom';
import {
  PageWrapper, PageHeader, Alert, Card, Badge, Btn, EmptyState, PageSkeleton,
} from '../../components/tenant/TenantUI';
import HopDongPreview from '../../components/HopDongPreview';

const STATUS_MAP = {
  ChoKiemTra: { label: 'Chờ duyệt',       variant: 'warning' },
  DatLich:    { label: 'Đã đặt lịch xem', variant: 'info'    },
  DaDuyet:    { label: 'Đã duyệt',         variant: 'success' },
  TuChoi:     { label: 'Từ chối',          variant: 'danger'  },
};

const CONTRACT_STATUS = {
  ChoKy:    { label: 'Chờ ký',    color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  DaKy:     { label: 'Đã ký',     color: 'bg-blue-100 text-blue-800 border-blue-300'       },
  DangThue: { label: 'Đang thuê', color: 'bg-green-100 text-green-800 border-green-300'    },
  HetHan:   { label: 'Hết hạn',   color: 'bg-orange-100 text-orange-800 border-orange-300' },
  KetThuc:  { label: 'Kết thúc',  color: 'bg-gray-100 text-gray-800 border-gray-300'       },
};

const MyRentalRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [cancelingId, setCancelingId] = useState(null);
  const [signingId, setSigningId]   = useState(null);

  // Modal xem hợp đồng
  const [contractDetail, setContractDetail] = useState(null);
  const [showContract, setShowContract]     = useState(false);
  const [loadingContract, setLoadingContract] = useState(false);

  useEffect(() => { fetchMyRequests(); }, []);

  const fetchMyRequests = async () => {
    try {
      setLoading(true); setError('');
      const res = await axios.get('/yeucauthue/my');
      const data = res.data.data || [];
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy yêu cầu thuê này không?')) return;
    setCancelingId(id);
    try {
      await axios.put(`/yeucauthue/cancel/${id}`);
      setRequests(prev => prev.map(r =>
        r.ID === id ? { ...r, TrangThai: 'TuChoi' } : r
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể hủy yêu cầu');
    } finally {
      setCancelingId(null);
    }
  };

  const handleViewContract = async (contractId) => {
    setLoadingContract(true);
    try {
      const res = await axios.get(`/hopdong/${contractId}`);
      setContractDetail(res.data.data);
      setShowContract(true);
    } catch {
      setError('Không thể tải thông tin hợp đồng');
    } finally {
      setLoadingContract(false);
    }
  };

  const handleSign = async (contractId) => {
    if (!window.confirm('Bạn xác nhận ký hợp đồng này? Sau khi ký, hợp đồng sẽ có hiệu lực.')) return;
    setSigningId(contractId);
    try {
      await axios.put(`/hopdong/sign/${contractId}`);
      setSuccess('Ký hợp đồng thành công! Hợp đồng đã có hiệu lực.');
      setShowContract(false);
      fetchMyRequests();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Ký hợp đồng thất bại');
    } finally {
      setSigningId(null);
    }
  };

  // Lấy hợp đồng đầu tiên của yêu cầu
  const getContract = (req) => req.hopdong?.[0] || null;

  return (
    <PageWrapper>
      <PageHeader
        title="Yêu cầu thuê của tôi"
        subtitle="Theo dõi trạng thái yêu cầu thuê căn hộ"
        action={
          <div className="flex gap-2">
            <Btn variant="secondary" onClick={fetchMyRequests}>Làm mới</Btn>
            <Btn variant="primary" onClick={() => navigate('/browse-apartments')}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Tìm căn hộ
            </Btn>
          </div>
        }
      />

      <Alert type="error"   message={error}   onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? <PageSkeleton /> : requests.length === 0 ? (
        <EmptyState
          title="Chưa có yêu cầu thuê nào"
          description="Tìm căn hộ phù hợp và gửi yêu cầu thuê"
          action={
            <Btn variant="primary" size="sm" onClick={() => navigate('/browse-apartments')}>
              Tìm căn hộ ngay
            </Btn>
          }
        />
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const st       = STATUS_MAP[req.TrangThai] || STATUS_MAP.ChoKiemTra;
            const contract = getContract(req);
            const contractCfg = contract ? (CONTRACT_STATUS[contract.TrangThai] || CONTRACT_STATUS.ChoKy) : null;

            return (
              <Card key={req.ID} className="overflow-hidden">
                {/* Banner hợp đồng chờ ký */}
                {contract?.TrangThai === 'ChoKy' && (
                  <div className="bg-yellow-500 text-white px-5 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-bold">Hợp đồng đã được tạo — Vui lòng xem và ký hợp đồng!</span>
                    </div>
                    <button
                      onClick={() => handleViewContract(contract.ID)}
                      disabled={loadingContract}
                      className="text-xs bg-white text-yellow-700 font-bold px-3 py-1 rounded-lg hover:bg-yellow-50 transition flex-shrink-0"
                    >
                      {loadingContract ? 'Đang tải...' : 'Xem & Ký ngay'}
                    </button>
                  </div>
                )}

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Yêu cầu #{req.ID}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Gửi ngày {new Date(req.NgayYeuCau).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <Badge label={st.label} variant={st.variant} />
                  </div>

                  {/* Apartment info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-700">Căn hộ</p>
                      {req.canho?.ID && (
                        <button onClick={() => navigate(`/apartments/${req.canho.ID}`)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                          Xem chi tiết
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Mã căn hộ</p>
                        <p className="font-medium text-gray-900">{req.canho?.MaCanHo}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Giá thuê</p>
                        <p className="font-semibold text-indigo-600">{formatCurrency(req.canho?.GiaThue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Diện tích</p>
                        <p className="font-medium text-gray-900">{req.canho?.DienTich} m²</p>
                      </div>
                    </div>
                  </div>

                  {/* Ghi chú */}
                  {req.GhiChu && (
                    <p className="text-xs text-gray-600 mb-3 bg-blue-50 px-3 py-2 rounded-lg">
                      <span className="font-medium">Ghi chú: </span>{req.GhiChu}
                    </p>
                  )}

                  {/* Trạng thái yêu cầu */}
                  {req.TrangThai === 'DatLich' ? (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-3">
                      <p className="text-xs font-semibold text-blue-800 mb-0.5">Đã xếp lịch xem căn hộ</p>
                      {req.NgayXemDuKien && (
                        <p className="text-xs text-blue-700">
                          Thời gian: <strong>{new Date(req.NgayXemDuKien).toLocaleString('vi-VN')}</strong>
                        </p>
                      )}
                      <p className="text-xs text-blue-600 mt-1">Vui lòng đến đúng giờ. Sau khi xem, quản lý sẽ duyệt hợp đồng.</p>
                    </div>
                  ) : req.TrangThai === 'TuChoi' ? (
                    <p className="text-xs px-3 py-2 rounded-lg bg-red-50 text-red-700 mb-3">
                      Rất tiếc, yêu cầu đã bị từ chối. Bạn có thể gửi yêu cầu cho căn hộ khác.
                    </p>
                  ) : req.TrangThai === 'DaDuyet' && !contract ? (
                    <p className="text-xs px-3 py-2 rounded-lg bg-green-50 text-green-700 mb-3">
                      Yêu cầu đã được duyệt. Quản lý đang chuẩn bị hợp đồng, vui lòng chờ thông báo.
                    </p>
                  ) : null}

                  {/* Thông tin hợp đồng (nếu có) */}
                  {contract && (
                    <div className={`border rounded-xl p-4 mb-3 ${contract.TrangThai === 'ChoKy' ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-sm font-bold text-gray-800">Hợp đồng #{contract.ID}</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${contractCfg.color}`}>
                          {contractCfg.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                        <div>
                          <p className="text-gray-500">Ngày bắt đầu</p>
                          <p className="font-semibold text-gray-800">
                            {new Date(contract.NgayBatDau).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Ngày kết thúc</p>
                          <p className="font-semibold text-gray-800">
                            {new Date(contract.NgayKetThuc).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Giá thuê</p>
                          <p className="font-semibold text-indigo-600">{formatCurrency(contract.GiaThue)}/tháng</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tiền cọc</p>
                          <p className="font-semibold text-gray-800">{formatCurrency(contract.TienCoc)}</p>
                        </div>
                        {contract.NgayKy && (
                          <div className="col-span-2">
                            <p className="text-gray-500">Ngày ký</p>
                            <p className="font-semibold text-green-700">
                              {new Date(contract.NgayKy).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Nút xem & ký */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewContract(contract.ID)}
                          disabled={loadingContract}
                          className="flex-1 py-2 text-xs font-semibold text-indigo-600 bg-white border border-indigo-300 rounded-lg hover:bg-indigo-50 transition disabled:opacity-50"
                        >
                          Xem chi tiết hợp đồng
                        </button>
                        {contract.TrangThai === 'ChoKy' && (
                          <button
                            onClick={() => handleSign(contract.ID)}
                            disabled={signingId === contract.ID}
                            className="flex-1 py-2 text-xs font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            {signingId === contract.ID ? (
                              <>
                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                </svg>
                                Đang ký...
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Ký hợp đồng
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Nút hủy yêu cầu */}
                  {['ChoKiemTra', 'DatLich'].includes(req.TrangThai) && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleCancel(req.ID)}
                        disabled={cancelingId === req.ID}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition disabled:opacity-50"
                      >
                        {cancelingId === req.ID ? 'Đang hủy...' : 'Hủy yêu cầu'}
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal xem chi tiết hợp đồng — dùng HopDongPreview giống bên quản lý */}
      {showContract && contractDetail && (
        <>
          <HopDongPreview
            contract={contractDetail}
            onClose={() => setShowContract(false)}
          />
          {/* Nút ký — hiện đè lên toolbar của HopDongPreview khi trạng thái ChoKy */}
          {contractDetail.TrangThai === 'ChoKy' && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70]">
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4">
                <div>
                  <p className="text-sm font-bold text-yellow-800">Hợp đồng đang chờ bạn ký</p>
                  <p className="text-xs text-yellow-700">Bằng cách ký, bạn đồng ý với toàn bộ điều khoản trên</p>
                </div>
                <button
                  onClick={() => handleSign(contractDetail.ID)}
                  disabled={signingId === contractDetail.ID}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-50 whitespace-nowrap shadow-lg"
                >
                  {signingId === contractDetail.ID ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Đang ký...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Ký hợp đồng
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
};

export default MyRentalRequests;
