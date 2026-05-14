// client/src/pages/chuyennhuong/MyTransfers.jsx
import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import {
  PageWrapper, PageHeader, Alert, Card, Badge, Btn,
  EmptyState, PageSkeleton, Modal, Field, Textarea, Select,
} from '../../components/tenant/TenantUI';

const STATUS_MAP = {
  ChoXet:      { label: 'Chờ xét duyệt', variant: 'warning' },
  DaDuyet:     { label: 'Đã đồng ý họp mặt', variant: 'success' },
  TuChoi:      { label: 'Từ chối',        variant: 'danger'  },
  DaHoanThanh: { label: 'Hoàn thành',     variant: 'info'    },
};

const MyTransfers = () => {
  const [transfers, setTransfers]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [contracts, setContracts]   = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [form, setForm]             = useState({ HopDongID: '', LyDo: '', ThongTinNguoiChuyenVao: '', GhiChu: '' });

  useEffect(() => { fetchTransfers(); fetchContracts(); }, []);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/chuyennhuong/my');
      const data = res.data.data || res.data || [];
      setTransfers(Array.isArray(data) ? data : []);
    } catch { setError('Không thể tải danh sách chuyển nhượng'); }
    finally { setLoading(false); }
  };

  const fetchContracts = async () => {
    try {
      const res = await axios.get('/hopdong/my');
      const data = res.data.data || [];
      setContracts(Array.isArray(data) ? data.filter(c => c.TrangThai === 'DangThue') : []);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.HopDongID || !form.LyDo.trim() || !form.ThongTinNguoiChuyenVao.trim()) {
      setError('Vui lòng chọn hợp đồng, nhập lý do và thông tin người chuyển vào');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await axios.post('/chuyennhuong', form);
      setSuccess('Đã gửi yêu cầu chuyển nhượng thành công!');
      setShowForm(false);
      setForm({ HopDongID: '', LyDo: '', ThongTinNguoiChuyenVao: '', GhiChu: '' });
      fetchTransfers();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Chuyển nhượng hợp đồng"
        subtitle="Đăng ký chuyển nhượng hợp đồng thuê"
        action={
          <Btn variant="primary" onClick={() => setShowForm(true)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yêu cầu chuyển nhượng
          </Btn>
        }
      />

      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert type="error"   message={error}   onClose={() => setError('')}   />

      {/* Process info */}
      <Card className="p-4 mb-6">
        <p className="text-xs font-semibold text-gray-700 mb-2">Quy trình chuyển nhượng</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {['Gửi yêu cầu', 'Quản lý kiểm tra', 'Lên lịch họp mặt', 'Hoàn tất thủ tục'].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                <span>{step}</span>
              </div>
              {i < arr.length - 1 && <svg className="w-3 h-3 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>}
            </div>
          ))}
        </div>
      </Card>

      {loading ? <PageSkeleton /> : transfers.length === 0 ? (
        <EmptyState
          title="Chưa có yêu cầu chuyển nhượng"
          description="Gửi yêu cầu nếu bạn muốn chuyển nhượng hợp đồng thuê"
          action={<Btn variant="primary" size="sm" onClick={() => setShowForm(true)}>Gửi yêu cầu ngay</Btn>}
        />
      ) : (
        <div className="space-y-3">
          {transfers.map(tr => {
            const st = STATUS_MAP[tr.TrangThai] || STATUS_MAP.ChoXet;
            return (
              <Card key={tr.ID} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Yêu cầu #{tr.ID}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      HĐ #{tr.HopDongID}
                      {tr.NgayYeuCau && ` · ${new Date(tr.NgayYeuCau).toLocaleDateString('vi-VN')}`}
                    </p>
                  </div>
                  <Badge label={st.label} variant={st.variant} />
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm mb-3">
                  <p className="text-xs font-medium text-gray-600">Thông tin người chuyển vào:</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{tr.ThongTinNguoiChuyenVao || tr.nguoidung_chuyennhuong_NguoiThueMoiIDTonguoidung?.HoTen || 'Chưa có thông tin'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
                  <p><span className="text-xs font-medium text-gray-600">Lý do: </span><span className="text-gray-700">{tr.LyDo}</span></p>
                </div>
                {tr.GhiChu && (
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="font-medium">Ghi chú: </span>{tr.GhiChu}
                  </p>
                )}
                {tr.TrangThai === 'TuChoi' && tr.LyDoTuChoi && (
                  <p className="text-xs text-red-600 mt-2"><span className="font-medium">Lý do từ chối: </span>{tr.LyDoTuChoi}</p>
                )}
                {tr.TrangThai === 'DaDuyet' && tr.NgayHen && (
                  <p className="text-xs text-green-700 mt-2"><span className="font-medium">Lịch hẹn gặp: </span>{new Date(tr.NgayHen).toLocaleString('vi-VN')} - {tr.NoiDungHen}</p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setError(''); }}
        title="Yêu cầu chuyển nhượng hợp đồng"
        footer={
          <div className="flex gap-3">
            <Btn variant="secondary" className="flex-1" onClick={() => { setShowForm(false); setError(''); }}>Hủy</Btn>
            <Btn variant="primary" className="flex-1" disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </Btn>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Hợp đồng" required>
            <Select value={form.HopDongID} onChange={e => setForm(f => ({ ...f, HopDongID: e.target.value }))}>
              <option value="">-- Chọn hợp đồng đang thuê --</option>
              {contracts.map(c => (
                <option key={c.ID} value={c.ID}>HĐ #{c.ID} — Căn hộ {c.canho?.MaCanHo || c.CanHoID}</option>
              ))}
            </Select>
          </Field>
          <Field label="Thông tin người sẽ chuyển vào" required>
            <Textarea
              value={form.ThongTinNguoiChuyenVao}
              onChange={e => setForm(f => ({ ...f, ThongTinNguoiChuyenVao: e.target.value }))}
              rows={3}
              placeholder="Tên, số điện thoại, email hoặc thông tin liên hệ của người chuyển vào"
            />
          </Field>
          <Field label="Lý do chuyển nhượng" required>
            <Textarea
              value={form.LyDo}
              onChange={e => setForm(f => ({ ...f, LyDo: e.target.value }))}
              rows={3}
              placeholder="VD: Chuyển công tác, hoàn cảnh gia đình..."
            />
          </Field>
          <Field label="Ghi chú thêm">
            <Textarea
              value={form.GhiChu}
              onChange={e => setForm(f => ({ ...f, GhiChu: e.target.value }))}
              rows={2}
              placeholder="Thông tin bổ sung (không bắt buộc)"
            />
          </Field>
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        </div>
      </Modal>
    </PageWrapper>
  );
};

export default MyTransfers;
