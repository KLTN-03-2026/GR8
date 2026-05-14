import { useState, useCallback, useRef, useLayoutEffect } from 'react';

/**
 * Hook để xử lý input số với format tự động (thêm dấu phẩy)
 * @param {number|string} initialValue - Giá trị ban đầu
 * @returns {[string, function, function, function, object]} - [formattedValue, handleChange, setValue, getRawValue, ref]
 */
export const useNumberInput = (initialValue = '') => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);
  const cursorState = useRef(null);


  // Format số với dấu phẩy
  const formatNumber = useCallback((num) => {
    if (!num || num === '') return '';
    const cleanNum = num.toString().replace(/[^\d]/g, '');
    if (cleanNum === '') return '';
    return Number(cleanNum).toLocaleString('vi-VN');
  }, []);

  // Parse số từ chuỗi có dấu phẩy
  const parseNumber = useCallback((str) => {
    if (!str || str === '') return '';
    return str.toString().replace(/[^\d]/g, '');
  }, []);

  // Handle change event
  const handleChange = useCallback((e) => {
    const input = e.target;
    const inputValue = input.value;
    const selectionStart = input.selectionStart;

    const parsedValue = parseNumber(inputValue);

    // Nếu input rỗng, set empty
    if (parsedValue === '') {
      setValue('');
      return;
    }

    const formattedValue = formatNumber(parsedValue);
    
    // Đếm số lượng ký tự số trước vị trí cursor
    let digitsBeforeCursor = 0;
    for (let i = 0; i < selectionStart; i++) {
      if (/[0-9]/.test(inputValue[i])) {
        digitsBeforeCursor++;
      }
    }
    
    cursorState.current = { digitsBeforeCursor };
    setValue(formattedValue);
  }, [formatNumber, parseNumber]);

  useLayoutEffect(() => {
    if (cursorState.current && inputRef.current) {
      const input = inputRef.current;
      const { digitsBeforeCursor } = cursorState.current;
      
      let newCursorPos = 0;
      let digitsCount = 0;
      
      for (let i = 0; i < value.length; i++) {
        if (digitsCount === digitsBeforeCursor) {
          newCursorPos = i;
          break;
        }
        if (/[0-9]/.test(value[i])) {
          digitsCount++;
        }
      }
      
      if (digitsCount === digitsBeforeCursor && newCursorPos === 0 && value.length > 0) {
        newCursorPos = value.length;
      }
      
      // Some browsers lose focus or have issues if we set selection on an unfocused input
      if (document.activeElement === input) {
        input.setSelectionRange(newCursorPos, newCursorPos);
      }
      cursorState.current = null;
    }
  }, [value]);

  // Get raw number value (không có dấu phẩy)
  const getRawValue = useCallback(() => {
    return parseNumber(value);
  }, [value, parseNumber]);

  return [value, handleChange, setValue, getRawValue, inputRef];
};

export default useNumberInput;