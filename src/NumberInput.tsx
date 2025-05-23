import React from 'react';
import { useTheme, createGlobalStyle } from 'styled-components';

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

const DarkInputPlaceholder = createGlobalStyle`
  input::placeholder {
    color: #b0b0b0 !important;
    opacity: 1;
  }
`;

const LightInputPlaceholder = createGlobalStyle`
  input::placeholder {
    color: #888 !important;
    opacity: 1;
  }
`;

const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, placeholder, min, max, style }) => {
  const theme = useTheme();
  const isDark = theme.background && theme.background.toLowerCase() === '#181c20';
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {isDark ? <DarkInputPlaceholder /> : <LightInputPlaceholder />}
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
          border: style && style.borderColor ? `2px solid ${style.borderColor}` : (isDark ? '1px solid #333' : '1px solid #ddd'),
          borderRadius: 8,
          fontSize: 18,
          fontFamily: 'inherit',
          boxSizing: 'border-box',
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'textfield',
          background: style && style.background ? style.background : (isDark ? theme.darkInputBackground : '#fff'),
          color: isDark ? theme.text : '#222',
          transition: 'all 0.2s',
          boxShadow: style && style.borderColor ? `0 0 0 2px ${style.borderColor}33` : undefined,
          ...style,
        }}
        autoComplete="off"
        min={min}
        max={max}
        enterKeyHint="done"
      />
      <span
        style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          color: isDark ? '#b0b0b0' : '#888',
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