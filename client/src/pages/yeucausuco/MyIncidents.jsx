// client/src/pages/yeucausuco/MyIncidents.jsx
import { useState, useEffect } from 'react';
import { formatDateTime } from '../../utils/formatDate';
import axios from '../../api/axios';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import {
  PageWrapper, PageHeader, Alert, Card, Badge, Btn,
  EmptyState, PageSkeleton, Modal, Field, Input, Textarea, Select,
} from '../../components/tenant/TenantUI';
import { useActiveContract } from '../../hooks/useActiveContract';
import NoContractNotice from '../../components/common/NoContractNotice';

const PRIORITY_MAP = {
  Cao:   { label: 'Khẩn cấp',  variant: 'danger'  },
  Trung: { label: 'Trung bình', variant: 'warning' },
  Thap:  { label: 'Thấp',       variant: 'default' },
};

const STATUS_MAP = {
  Moi:           { label: 'Mới',           variant: 'info'    },
  QuanLyDaNhan:  { label: 'Đã nhận',       variant: 'purple'  },
  DangXuLy:      { label: 'Đang xử lý',    variant: 'warning' },
  DaGiaiQuyet:   { label: 'Đã giải quyết', variant: 'success' },
};

const MyIncidents = ({ defaultCanHoID } = {}) => {
  const { hasActiveContract, loading: contractLoading } = useActiveContract();
  const [incidents, setIncidents]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [contracts, setContracts]   = useState([]);
  const [form, setForm] = useState({ CanHoID: defaultCanHoID ? String(defaultCanHoID) : '', TieuDe: '', MoTa: '', DoUuTien: 'Trung', images: [] });
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});

  const validateIncidentForm = (f) => ({
    CanHoID: !f.CanHoID ? 'Vui lòng chọn căn hộ' : '',
    TieuDe:  !f.TieuDe?.trim() ? 'Vui lòng nhập tiêu đề sự cố' : f.TieuDe.trim().length < 5 ? 'Tiêu đề phải có ít nhất 5 ký tự' : '',
    MoTa:    !f.MoTa?.trim() ? 'Vui lòng nhập mô tả chi tiết' : f.MoTa.trim().length < 10 ? 'Mô tả phải có ít nhất 10 ký tự' : '',
  });

  const handleFormChange = (field, value) => {
    const newForm = { ...form, [field]: value };
    setForm(newForm);
    if (formTouched[field]) {
      setFormErrors(prev => ({ ...prev, [field]: validateIncidentForm(newForm)[field] }));
    }
  };

  useEffect(() => { fetchMyIncidents(); fetchContracts(); }, []);

  // Khi defaultCanHoID thay đổi (chuyển căn hộ), cập nhật form và filter
  useEffect(() => {
    if (defaultCanHoID) {
      setForm(f => ({ ...f, CanHoID: String(defaultCanHoID) }));
    }
  }, [defaultCanHoID]);

  const fetchMyIncidents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/yeucausuco/my');
      const data = res.data.data || res.data.items || res.data || [];
      setIncidents(Array.isArray(data) ? data : []);
    } catch { setError('Không thể tải danh sách sự cố'); }
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
    e?.preventDefault();
    // Touch all + validate
    const allTouched = { CanHoID: true, TieuDe: true, MoTa: true };
    setFormTouched(allTouched);
    const errs = validateIncidentForm(form);
    setFormErrors(errs);
    if (Object.values(errs).some(Boolean)) {
      // Focus first error
      const firstErr = Object.keys(errs).find(k => errs[k]);
      if (firstErr) {
        const el = document.querySelector(`[data-field="${firstErr}"]`);
        if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => el.focus(), 200); }
      }
      return;
    }
    setSubmitting(true); setError('');
    try {
      const payload = new FormData();
      payload.append('CanHoID', form.CanHoID);
      payload.append('TieuDe', form.TieuDe);
      payload.append('MoTa', form.MoTa);
      payload.append('DoUuTien', form.DoUuTien);
      form.images.forEach(f => payload.append('images', f));
      await axios.post('/yeucausuco', payload);
      setSuccess('Báo cáo sự cố thành công!');
      setForm({ CanHoID: '', TieuDe: '', MoTa: '', DoUuTien: 'Trung', images: [] });
      setFormErrors({}); setFormTouched({});
      setShowForm(false);
      fetchMyIncidents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Không thể gửi báo cáo'); }
    finally { setSubmitting(false); }
  };

  if (contractLoading || loading) return <PageSkeleton />;

  if (!hasActiveContract) {
    return (
      <NoContractNotice
        title="Bạn chưa thuê căn hộ nào"
        message="Bạn cần có hợp đồng thuê căn hộ đang hoạt động để báo cáo sự cố."
      />
    );
  }

  // Lọc incidents theo căn hộ đang xem (nếu có defaultCanHoID)
  const filteredIncidents = defaultCanHoID
    ? incidents.filter(inc => inc.CanHoID === Number(defaultCanHoID) || inc.canho?.ID === Number(defaultCanHoID))
    : incidents;

  // Tên căn hộ đang xem
  const currentApt = contracts.find(c => c.CanHoID === Number(defaultCanHoID));
  const aptLabel = currentApt?.canho?.MaCanHo ? `Căn hộ ${currentApt.canho.MaCanHo}` : '';

  return (
    <PageWrapper>
      <PageHeader
        title="Sự cố của tôi"
        subtitle={aptLabel ? `Báo cáo sự cố — ${aptLabel}` : 'Báo cáo và theo dõi sự cố trong căn hộ'}
        action={
          <Btn variant="primary" onClick={() => setShowForm(true)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Báo cáo sự cố
          </Btn>
        }
      />

      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert type="error"   message={error}   onClose={() => setError('')}   />

      {loading ? <PageSkeleton /> : filteredIncidents.length === 0 ? (
        <EmptyState
          title={defaultCanHoID ? `Chưa có sự cố nào cho ${aptLabel}` : 'Chưa có sự cố nào'}
          description="Nếu có vấn đề với căn hộ, hãy báo cáo để được hỗ trợ"
          action={<Btn variant="primary" size="sm" onClick={() => setShowForm(true)}>Báo cáo ngay</Btn>}
        />
      ) : (
        <div className="space-y-3">
          {filteredIncidents.map(inc => {
            const st = STATUS_MAP[inc.TrangThai]   || STATUS_MAP.Moi;
            const pr = PRIORITY_MAP[inc.DoUuTien]  || PRIORITY_MAP.Trung;
            return (
              <Card key={inc.ID} className="p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowDetail(inc)}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{inc.TieuDe}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {inc.NgayBao ? new Date(inc.NgayBao).toLocaleDateString('vi-VN') : ''}
                      {inc.canho?.MaCanHo && ` · ${inc.canho.MaCanHo}`}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Badge label={pr.label} variant={pr.variant} />
                    <Badge label={st.label} variant={st.variant} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{inc.MoTa}</p>
                {inc.HinhAnh && Array.isArray(inc.HinhAnh) && inc.HinhAnh.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {inc.HinhAnh.slice(0, 3).map((img, idx) => (
                      <img key={idx} src={resolveMediaUrl(img)} alt="" className="w-16 h-16 object-cover rounded border" />
                    ))}
                    {inc.HinhAnh.length > 3 && (
                      <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-600">
                        +{inc.HinhAnh.length - 3}
                      </div>
                    )}
                  </div>
                )}
                {inc.KetQua && (
                  <div className="mt-3 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                    <p className="text-xs font-semibold text-green-700 mb-0.5">✅ Kết quả xử lý</p>
                    <p className="text-xs text-green-800 line-clamp-2">{inc.KetQua}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Report form modal */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setError(''); }}
        title="Báo cáo sự cố mới"
        footer={
          <div className="flex gap-3">
            <Btn variant="secondary" className="flex-1" onClick={() => { setShowForm(false); setError(''); }}>Hủy</Btn>
            <Btn variant="primary" className="flex-1" disabled={submitting} onClick={handleSubmit} type="submit">
              {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
            </Btn>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Tiêu đề sự cố" required>
            <Input
              type="text"
              data-field="TieuDe"
              value={form.TieuDe}
              onChange={e => handleFormChange('TieuDe', e.target.value)}
              onBlur={() => { setFormTouched(p => ({ ...p, TieuDe: true })); setFormErrors(p => ({ ...p, TieuDe: validateIncidentForm(form).TieuDe })); }}
              placeholder="VD: Máy lạnh không hoạt động"
              className={formTouched.TieuDe && formErrors.TieuDe ? 'border-red-400 bg-red-50/20' : ''}
            />
            {formTouched.TieuDe && formErrors.TieuDe && <p className="mt-1 text-xs text-red-600 flex items-center gap-1">⚠ {formErrors.TieuDe}</p>}
          </Field>
          <Field label="Căn hộ" required>
            <Select
              data-field="CanHoID"
              value={form.CanHoID}
              onChange={e => handleFormChange('CanHoID', e.target.value)}
              onBlur={() => { setFormTouched(p => ({ ...p, CanHoID: true })); setFormErrors(p => ({ ...p, CanHoID: validateIncidentForm(form).CanHoID })); }}
              className={formTouched.CanHoID && formErrors.CanHoID ? 'border-red-400 bg-red-50/20' : ''}
            >
              <option value="">-- Chọn căn hộ --</option>
              {contracts.map(c => (
                <option key={c.ID} value={c.CanHoID}>
                  {c.canho?.MaCanHo || `Căn hộ #${c.CanHoID}`} — HĐ #{c.ID}
                </option>
              ))}
            </Select>
            {formTouched.CanHoID && formErrors.CanHoID && <p className="mt-1 text-xs text-red-600 flex items-center gap-1">⚠ {formErrors.CanHoID}</p>}
          </Field>
          <Field label="Mô tả chi tiết" required>
            <Textarea
              data-field="MoTa"
              value={form.MoTa}
              onChange={e => handleFormChange('MoTa', e.target.value)}
              onBlur={() => { setFormTouched(p => ({ ...p, MoTa: true })); setFormErrors(p => ({ ...p, MoTa: validateIncidentForm(form).MoTa })); }}
              rows={4}
              placeholder="Mô tả vấn đề một cách chi tiết..."
              className={formTouched.MoTa && formErrors.MoTa ? 'border-red-400 bg-red-50/20' : ''}
            />
            {formTouched.MoTa && formErrors.MoTa && <p className="mt-1 text-xs text-red-600 flex items-center gap-1">⚠ {formErrors.MoTa}</p>}
          </Field>
          <Field label="Mức độ ưu tiên">
            <Select value={form.DoUuTien} onChange={e => setForm(f => ({ ...f, DoUuTien: e.target.value }))}>
              <option value="Thap">Thấp — Không khẩn cấp</option>
              <option value="Trung">Trung bình — Cần xử lý sớm</option>
              <option value="Cao">Cao — Khẩn cấp</option>
            </Select>
          </Field>
          <Field label="Hình ảnh (tùy chọn)">
            <input
              type="file" accept="image/*" multiple
              onChange={e => setForm(f => ({ ...f, images: Array.from(e.target.files || []) }))}
              className="w-full text-sm text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:text-xs"
            />
            {form.images.length > 0 && <p className="text-xs text-gray-500 mt-1">{form.images.length} ảnh đã chọn</p>}
          </Field>
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        </div>
      </Modal>

      {/* Detail Modal */}
      {showDetail && (
        <Modal
          open={!!showDetail}
          onClose={() => setShowDetail(null)}
          title={`Chi tiết sự cố #${showDetail.ID}`}
          size="large"
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Tiêu đề</p>
              <p className="font-semibold text-gray-900">{showDetail.TieuDe}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Mô tả</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{showDetail.MoTa}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                <Badge label={(STATUS_MAP[showDetail.TrangThai] || STATUS_MAP.Moi).label} 
                       variant={(STATUS_MAP[showDetail.TrangThai] || STATUS_MAP.Moi).variant} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Mức ưu tiên</p>
                <Badge label={(PRIORITY_MAP[showDetail.DoUuTien] || PRIORITY_MAP.Trung).label} 
                       variant={(PRIORITY_MAP[showDetail.DoUuTien] || PRIORITY_MAP.Trung).variant} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Ngày báo</p>
                <p className="text-sm font-medium">{showDetail.NgayBao ? new Date(showDetail.NgayBao).toLocaleString('vi-VN') : 'N/A'}</p>
              </div>
              {showDetail.NgayXuLy && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ngày xử lý</p>
                  <p className="text-sm font-medium">{new Date(showDetail.NgayXuLy).toLocaleString('vi-VN')}</p>
                </div>
              )}
            </div>

            {/* Hình ảnh sự cố */}
            {showDetail.HinhAnh && Array.isArray(showDetail.HinhAnh) && showDetail.HinhAnh.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2 font-semibold">📸 Hình ảnh sự cố ({showDetail.HinhAnh.length})</p>
                <div className="grid grid-cols-3 gap-2">
                  {showDetail.HinhAnh.map((img, idx) => (
                    <a key={idx} href={resolveMediaUrl(img)} target="_blank" rel="noopener noreferrer" 
                       className="relative group overflow-hidden rounded-lg border-2 border-gray-200 hover:border-indigo-500 transition-all">
                      <img 
                        src={resolveMediaUrl(img)} 
                        alt={`Sự cố ${idx + 1}`}
                        className="w-full h-32 object-cover group-hover:scale-110 transition-transform"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-semibold">🔍 Xem</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Kết quả xử lý */}
            {showDetail.KetQua && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <p className="text-xs text-green-700 font-semibold mb-1">✅ Kết quả xử lý</p>
                <p className="text-sm text-green-800 whitespace-pre-wrap">{showDetail.KetQua}</p>
              </div>
            )}

            {/* Hình ảnh hoàn thành */}
            {showDetail.HinhAnhHoanThanh && Array.isArray(showDetail.HinhAnhHoanThanh) && showDetail.HinhAnhHoanThanh.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2 font-semibold">✅ Hình ảnh hoàn thành ({showDetail.HinhAnhHoanThanh.length})</p>
                <div className="grid grid-cols-3 gap-2">
                  {showDetail.HinhAnhHoanThanh.map((img, idx) => (
                    <a key={idx} href={resolveMediaUrl(img)} target="_blank" rel="noopener noreferrer"
                       className="relative group overflow-hidden rounded-lg border-2 border-green-200 hover:border-green-500 transition-all">
                      <img 
                        src={resolveMediaUrl(img)} 
                        alt={`Hoàn thành ${idx + 1}`}
                        className="w-full h-32 object-cover group-hover:scale-110 transition-transform"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-semibold">🔍 Xem</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <Btn variant="secondary" className="w-full" onClick={() => setShowDetail(null)}>Đóng</Btn>
            </div>
          </div>
        </Modal>
      )}
    </PageWrapper>
  );
};

export default MyIncidents;
