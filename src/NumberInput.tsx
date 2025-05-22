import React from 'react';

interface NumberInputProps {
  value: number | '';
  onChange: (value: number | '') => void;
  placeholder?: string;
  min?: number;
  max?: number;
  style?: React.CSSProperties;
}

const formatNumber = (value: number | '') => {
  if (value === '' || isNaN(Number(value))) return '';
  return Number(value).toLocaleString('ru-RU');
};

const parseNumber = (value: string) => {
  const digits = value.replace(/[^\d]/g, '');
  return digits ? Number(digits) : '';
};

const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, placeholder, min, max, style }) => {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="tel"
        inputMode="numeric"
        pattern="[0-9 ]*"
        value={value === '' ? '' : formatNumber(value)}
        onChange={e => {
          const parsed = parseNumber(e.target.value);
          if (parsed === '' || (min !== undefined && parsed < min) || (max !== undefined && parsed > max)) {
            onChange('');
          } else {
            onChange(parsed);
          }
        }}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: 48,
          lineHeight: '48px',
          padding: '12px 36px 12px 12px',
          border: '1px solid #ddd',
          borderRadius: 8,
          fontSize: 18,
          fontFamily: 'inherit',
          boxSizing: 'border-box',
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'textfield',
          ...style,
        }}
        autoComplete="off"
        min={min}
        max={max}
      />
      <span
        style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#888',
          fontSize: 18,
          pointerEvents: 'none',
        }}
      >
        ₸
      </span>
    </div>
  );
};

export default NumberInput; 