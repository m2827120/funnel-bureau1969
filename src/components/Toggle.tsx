import React, { useRef, useCallback } from 'react';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

const Slider: React.FC<SliderProps> = ({ value, min, max, step = 1, onChange, disabled = false }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  // refs для хранения обработчиков, чтобы removeEventListener работал корректно
  const mouseMoveRef = useRef<(e: MouseEvent) => void>();
  const mouseUpRef = useRef<(e: MouseEvent) => void>();
  const touchMoveRef = useRef<(e: TouchEvent) => void>();
  const touchEndRef = useRef<(e: TouchEvent) => void>();

  const percent = ((value - min) / (max - min)) * 100;

  const getValueFromPosition = (clientX: number) => {
    if (!sliderRef.current) return value;
    const rect = sliderRef.current.getBoundingClientRect();
    let x = clamp(clientX - rect.left, 0, rect.width);
    let percent = x / rect.width;
    let raw = min + percent * (max - min);
    let stepped = Math.round(raw / step) * step;
    return clamp(stepped, min, max);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    dragging.current = true;
    onChange(getValueFromPosition(e.clientX));
    document.addEventListener('mousemove', mouseMoveRef.current!);
    document.addEventListener('mouseup', mouseUpRef.current!);
  };
  mouseMoveRef.current = (e: MouseEvent) => {
    if (!dragging.current) return;
    onChange(getValueFromPosition(e.clientX));
  };
  mouseUpRef.current = () => {
    dragging.current = false;
    document.removeEventListener('mousemove', mouseMoveRef.current!);
    document.removeEventListener('mouseup', mouseUpRef.current!);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    dragging.current = true;
    onChange(getValueFromPosition(e.touches[0].clientX));
    document.addEventListener('touchmove', touchMoveRef.current!, { passive: false });
    document.addEventListener('touchend', touchEndRef.current!);
  };
  touchMoveRef.current = (e: TouchEvent) => {
    if (!dragging.current) return;
    if (e.touches.length > 0) {
      e.preventDefault();
      onChange(getValueFromPosition(e.touches[0].clientX));
    }
  };
  touchEndRef.current = () => {
    dragging.current = false;
    document.removeEventListener('touchmove', touchMoveRef.current!);
    document.removeEventListener('touchend', touchEndRef.current!);
  };

  // Click on bar
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    onChange(getValueFromPosition(e.clientX));
  };

  return (
    <div
      ref={sliderRef}
      className={`relative w-32 h-6 rounded-full select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={handleClick}
      style={{
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        background: '#e5e7eb',
      }}
    >
      {/* Заливка */}
      <div
        className="absolute top-0 left-0 h-full rounded-full"
        style={{
          width: `${percent}%`,
          background: '#3b82f6',
          transition: dragging.current ? 'none' : 'width 0.2s',
        }}
      />
      {/* Ручка */}
      <div
        className="absolute top-1/2 w-6 h-6 bg-white rounded-full shadow-md border border-gray-300"
        style={{
          left: `calc(${percent}% - 12px)`,
          transform: 'translateY(-50%)',
          transition: dragging.current ? 'none' : 'left 0.2s',
          WebkitTapHighlightColor: 'transparent',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      />
    </div>
  );
};

export default Slider; 