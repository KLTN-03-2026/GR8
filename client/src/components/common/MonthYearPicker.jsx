// Dropdown chọn tháng + năm — nhanh hơn input type="month"
const MONTHS = [
  'Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12',
];

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const MonthYearPicker = ({ value, onChange, maxValue, className = '' }) => {
  const [year, month] = (value || getCurrentMonth()).split('-').map(Number);
  const [maxYear, maxMonth] = (maxValue || getCurrentMonth()).split('-').map(Number);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);

  const handleChange = (newYear, newMonth) => {
    const m = String(newMonth).padStart(2, '0');
    onChange(`${newYear}-${m}`);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <select
        value={month}
        onChange={e => handleChange(year, Number(e.target.value))}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {MONTHS.map((label, i) => {
          const m = i + 1;
          const disabled = year === maxYear && m > maxMonth;
          return <option key={m} value={m} disabled={disabled}>{label}</option>;
        })}
      </select>
      <select
        value={year}
        onChange={e => handleChange(Number(e.target.value), month)}
        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {years.map(y => (
          <option key={y} value={y} disabled={y > maxYear}>{y}</option>
        ))}
      </select>
    </div>
  );
};

export default MonthYearPicker;
