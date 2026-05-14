/**
 * useFormValidation — Generic form validation hook
 * Dùng lại cho mọi form trong project
 *
 * @param {Object} initialValues - Giá trị khởi tạo
 * @param {Function} validateFn  - Hàm validate(values) → { field: errorMsg }
 *
 * @example
 * const { values, errors, touched, handleChange, handleBlur, handleSubmit, isValid } =
 *   useFormValidation({ TieuDe: '', MoTa: '' }, (v) => ({
 *     TieuDe: !v.TieuDe.trim() ? 'Vui lòng nhập tiêu đề' : '',
 *     MoTa:   !v.MoTa.trim()   ? 'Vui lòng nhập mô tả'   : '',
 *   }));
 */
import { useState, useCallback, useRef } from "react";

const useFormValidation = (initialValues, validateFn) => {
  const [values, setValues]   = useState(initialValues);
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const firstErrorRef = useRef(null);

  // Validate toàn bộ form
  const validate = useCallback(
    (vals = values) => {
      const errs = validateFn(vals);
      setErrors(errs);
      return errs;
    },
    [values, validateFn]
  );

  // Validate 1 field
  const validateOne = useCallback(
    (name, val) => {
      const errs = validateFn({ ...values, [name]: val });
      setErrors((prev) => ({ ...prev, [name]: errs[name] ?? "" }));
    },
    [values, validateFn]
  );

  // onChange — validate realtime nếu field đã touched
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const newVal = type === "checkbox" ? checked : value;
      const newValues = { ...values, [name]: newVal };
      setValues(newValues);
      if (touched[name]) {
        const errs = validateFn(newValues);
        setErrors((prev) => ({ ...prev, [name]: errs[name] ?? "" }));
      }
    },
    [values, touched, validateFn]
  );

  // Setter thủ công (dùng cho select, date picker, ...)
  const setValue = useCallback(
    (name, value) => {
      const newValues = { ...values, [name]: value };
      setValues(newValues);
      if (touched[name]) {
        const errs = validateFn(newValues);
        setErrors((prev) => ({ ...prev, [name]: errs[name] ?? "" }));
      }
    },
    [values, touched, validateFn]
  );

  // onBlur — mark touched + validate
  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      validateOne(name, values[name]);
    },
    [values, validateOne]
  );

  // Submit — touch all + validate + scroll to first error
  const handleSubmit = useCallback(
    (onValid) => async (e) => {
      e?.preventDefault();
      const allTouched = Object.fromEntries(Object.keys(values).map((k) => [k, true]));
      setTouched(allTouched);
      const errs = validateFn(values);
      setErrors(errs);

      const hasError = Object.values(errs).some(Boolean);
      if (hasError) {
        // Scroll + focus vào field lỗi đầu tiên
        const firstErrField = Object.keys(errs).find((k) => errs[k]);
        if (firstErrField) {
          const el = document.querySelector(`[name="${firstErrField}"]`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            setTimeout(() => el.focus(), 300);
          }
        }
        return;
      }

      await onValid(values);
    },
    [values, validateFn]
  );

  // Reset form
  const reset = useCallback(
    (newValues = initialValues) => {
      setValues(newValues);
      setErrors({});
      setTouched({});
    },
    [initialValues]
  );

  // CSS class helper
  const inputCls = useCallback(
    (field, base = "") => {
      const hasErr = touched[field] && errors[field];
      const isOk   = touched[field] && !errors[field] && values[field];
      if (hasErr) return `${base} border-red-400 bg-red-50/20 focus:border-red-400 focus:ring-red-300/40`;
      if (isOk)   return `${base} border-green-400 focus:border-green-500 focus:ring-green-300/40`;
      return base;
    },
    [touched, errors, values]
  );

  const isValid = Object.values(errors).every((e) => !e);

  return {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    validate,
    reset,
    inputCls,
    setValues,
    setErrors,
    setTouched,
  };
};

export default useFormValidation;
