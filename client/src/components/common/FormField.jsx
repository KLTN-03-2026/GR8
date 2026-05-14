/**
 * FormField — Wrapper component cho input có validation
 * Hiển thị label, input, error message theo chuẩn production
 */

const ErrorIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

/**
 * FieldError — Hiển thị thông báo lỗi dưới input
 */
export const FieldError = ({ error, touched }) => {
  if (!touched || !error) return null;
  return (
    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1" role="alert">
      <ErrorIcon />
      {error}
    </p>
  );
};

/**
 * getInputCls — Trả về className cho input theo trạng thái validation
 * @param {string} base - Class cơ bản
 * @param {boolean} hasError
 * @param {boolean} isValid
 */
export const getInputCls = (base, hasError, isValid) => {
  if (hasError) return `${base} !border-red-400 !bg-red-50/20 focus:!border-red-400 focus:!ring-red-300/40`;
  if (isValid)  return `${base} !border-green-400 focus:!border-green-500 focus:!ring-green-300/40`;
  return base;
};

/**
 * FormField — Full wrapper với label + input + error
 */
const FormField = ({
  label,
  required,
  error,
  touched,
  children,
  hint,
}) => (
  <div>
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    {children}
    {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    <FieldError error={error} touched={touched} />
  </div>
);

export default FormField;
