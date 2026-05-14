// client/src/components/tenant/TenantUI.jsx
// Shared UI primitives for all tenant pages — clean, professional design

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({ label, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-50 text-green-700 ring-1 ring-green-200',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    danger:  'bg-red-50 text-red-700 ring-1 ring-red-200',
    info:    'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    purple:  'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.default}`}>
      {label}
    </span>
  );
};

// ── Page wrapper ──────────────────────────────────────────────────────────────
export const PageWrapper = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {children}
    </div>
  </div>
);

// ── Page header ───────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ── Alert ─────────────────────────────────────────────────────────────────────
export const Alert = ({ type = 'error', message, onClose }) => {
  if (!message) return null;
  const styles = {
    error:   'bg-red-50 border-red-200 text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    info:    'bg-blue-50 border-blue-200 text-blue-700',
  };
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm mb-4 ${styles[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-3 opacity-60 hover:opacity-100">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, className = '', onClick }) => (
  <div
    className={`bg-white rounded-xl border border-gray-200 shadow-sm ${onClick ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

// ── Empty state ───────────────────────────────────────────────────────────────
export const EmptyState = ({ title, description, action }) => (
  <Card className="p-12 text-center">
    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
    {action}
  </Card>
);

// ── Loading skeleton ──────────────────────────────────────────────────────────
export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

export const PageSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
    </div>
    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
  </div>
);

// ── Button ────────────────────────────────────────────────────────────────────
export const Btn = ({ children, variant = 'primary', size = 'md', disabled, onClick, type = 'button', className = '' }) => {
  const variants = {
    primary:   'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    danger:    'bg-red-600 text-white hover:bg-red-700',
    ghost:     'text-gray-600 hover:bg-gray-100',
    outline:   'border border-emerald-600 text-emerald-600 hover:bg-emerald-50',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">{footer}</div>}
      </div>
    </div>
  );
};

// ── Form fields ───────────────────────────────────────────────────────────────
export const Field = ({ label, required, children, hint }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
  </div>
);

export const Input = ({ className = '', ...props }) => (
  <input
    {...props}
    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors ${className}`}
  />
);

export const Textarea = ({ className = '', ...props }) => (
  <textarea
    {...props}
    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none ${className}`}
  />
);

export const Select = ({ children, className = '', ...props }) => (
  <select
    {...props}
    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white transition-colors ${className}`}
  >
    {children}
  </select>
);

// ── Tab bar ───────────────────────────────────────────────────────────────────
export const TabBar = ({ tabs, active, onChange }) => (
  <div className="flex gap-1 border-b border-gray-200 mb-6">
    {tabs.map(tab => (
      <button
        key={tab.key}
        onClick={() => onChange(tab.key)}
        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
          active === tab.key
            ? 'border-emerald-600 text-emerald-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
      >
        {tab.label}
        {tab.count !== undefined && (
          <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${active === tab.key ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);
