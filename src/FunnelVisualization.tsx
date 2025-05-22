import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';

interface FunnelVisualizationProps {
  stages: {
    label: React.ReactNode;
    value: number;
    percent?: number;
    color: string;
    isFullWidth?: boolean;
  }[];
  isNegative?: boolean;
  formatShortNumber?: (num: number) => string;
  onStageSwipe?: (stageIndex: number, delta: number) => void;
}

const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(80px, 120px) 1fr minmax(56px, 80px);
  align-items: center;
  margin-bottom: 18px;
  min-height: 38px;
  gap: 0 8px;
`;
const LeftCol = styled.div<{ isNegative?: boolean }>`
  display: flex;
  align-items: center;
  min-width: 0;
  color: ${({ isNegative, theme }) => isNegative ? '#222' : theme.text};
`;
const BarWrap = styled.div`
  width: 100%;
  flex: 1 1 0;
  position: relative;
  height: 28px;
  display: flex;
  align-items: center;
`;
const Bar = styled.div<{ color: string; width: number }>`
  background: ${({ color }) => color};
  border-top-left-radius: 999px;
  border-bottom-left-radius: 999px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  height: 100%;
  min-width: 4px;
  width: ${({ width }) => width}px;
  position: absolute;
  left: 0;
  top: 0;
  transition: width 0.7s cubic-bezier(.4,2,.6,1);
`;
const ValueBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 56px;
  text-align: right;
  justify-self: end;
`;
const BarValue = styled.span<{ isNegative?: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: ${({ isNegative, theme }) => isNegative ? '#222' : theme.text};
  line-height: 1.1;
`;
const BarPercent = styled.span<{ isNegative?: boolean }>`
  font-size: 13px;
  font-weight: 500;
  color: ${({ isNegative, theme }) => isNegative ? '#222' : theme.text};
  margin-top: 1px;
`;
const Handle = styled.div<{ color: string; active?: boolean }>`
  position: absolute;
  right: -14px;
  top: 50%;
  transform: translateY(-50%) scale(${({ active }) => (active ? 1.18 : 1)});
  width: 28px;
  height: 28px;
  background: #fff;
  border: 3px solid ${({ color, active }) => active ? (color === '#bdbdbd' ? '#888' : color) : color};
  border-radius: 50%;
  box-shadow: 0 2px 8px #0002, ${({ active, color }) => active ? `0 0 0 4px ${color}33` : 'none'};
  cursor: ew-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
  &:hover {
    transform: translateY(-50%) scale(1.18);
    border-color: ${({ color }) => color === '#bdbdbd' ? '#888' : color};
    box-shadow: 0 2px 12px #0003, 0 0 0 4px ${({ color }) => color}33;
  }
  &:active {
    transform: translateY(-50%) scale(1.22);
    border-color: ${({ color }) => color === '#bdbdbd' ? '#222' : color};
    box-shadow: 0 2px 16px #0004, 0 0 0 6px ${({ color }) => color}44;
  }
`;

const FunnelVisualization: React.FC<FunnelVisualizationProps> = ({ stages, formatShortNumber, onStageSwipe, isNegative }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(320);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [handleHover, setHandleHover] = useState<number | null>(null);
  const [handleOffsetX, setHandleOffsetX] = useState(0);
  const [showTrafficPercent, setShowTrafficPercent] = useState<number | null>(null);
  const [animatedWidths, setAnimatedWidths] = useState(() => stages.map(() => 4));
  const lastDeltaRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  const maxValue = Math.max(...stages.map(s => s.value));
  const minBarWidth = 4;
  const rightColWidth = 80; // ширина ValueBlock
  const barToRedLineGap = 8; // отступ между баром и красной линией
  const redLineWidth = 5;
  const maxBarWidth = containerWidth - 120 - rightColWidth - barToRedLineGap - redLineWidth + 10; // 120 — max ширина левой колонки

  useEffect(() => {
    stages.forEach((stage, i) => {
      const widthPercent = maxValue ? stage.value / maxValue : 0;
      let barWidth = stage.isFullWidth
        ? maxBarWidth
        : (stage.value === 0 ? minBarWidth : minBarWidth + (maxBarWidth - minBarWidth) * Math.pow(widthPercent, 0.7));
      if (barWidth > maxBarWidth) barWidth = maxBarWidth;
      setTimeout(() => {
        setAnimatedWidths(prev => {
          const arr = [...prev];
          arr[i] = barWidth;
          return arr;
        });
      }, 100 + i * 120);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stages, maxBarWidth]);

  const PIXELS_PER_UNIT = 0.8; // 0.8px = 1 value (раньше было 1)
  const PIXELS_PER_PERCENT = 1.6; // 1.6px = 1% (раньше было 2)

  const handleHandlePointerDown = (i: number) => (e: React.PointerEvent) => {
    e.stopPropagation();
    setDragIndex(i);
    setDragStartX(e.clientX);
    setHandleOffsetX(0);
    lastDeltaRef.current = 0;
  };
  const handleHandlePointerMove = (i: number) => (e: React.PointerEvent) => {
    if (dragIndex === i && dragStartX !== null && onStageSwipe) {
      const delta = e.clientX - dragStartX;
      setHandleOffsetX(delta);
      lastDeltaRef.current = delta;
      
      const stage = stages[i];
      let change = 0;
      if (stage.percent !== undefined) {
        const baseStep = delta / PIXELS_PER_PERCENT;
        const currentPercent = stage.percent;
        const multiplier = Math.max(1, Math.log10(currentPercent + 1));
        change = Math.round(baseStep * multiplier);
      } else {
        const baseStep = delta / PIXELS_PER_UNIT;
        const currentValue = stage.value;
        const multiplier = Math.max(1, Math.log10(currentValue + 1));
        change = Math.round(baseStep * multiplier);
      }
      
      if (change !== 0) {
        onStageSwipe(i, change);
        setDragStartX(e.clientX);
        setHandleOffsetX(0);
      }
    }
  };
  const handleHandlePointerUp = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setDragIndex(null);
    setDragStartX(null);
    setHandleOffsetX(0);
    lastDeltaRef.current = 0;
  };
  const handleHandleTouchStart = (i: number) => (e: React.TouchEvent) => {
    e.stopPropagation();
    setDragIndex(i);
    setHandleOffsetX(0);
    lastDeltaRef.current = 0;
  };
  const handleHandleTouchEnd = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setDragIndex(null);
    setHandleOffsetX(0);
    lastDeltaRef.current = 0;
  };

  // Функция для непрерывного изменения значения
  const continueChange = useCallback((i: number) => {
    if (dragIndex === i && onStageSwipe) {
      const stage = stages[i];
      let change = 0;
      
      if (stage.percent !== undefined) {
        const baseStep = lastDeltaRef.current / PIXELS_PER_PERCENT;
        const currentPercent = stage.percent;
        const multiplier = Math.max(1, Math.log10(currentPercent + 1));
        change = Math.round(baseStep * multiplier * 0.1); // Уменьшаем шаг для плавности
      } else {
        const baseStep = lastDeltaRef.current / PIXELS_PER_UNIT;
        const currentValue = stage.value;
        const multiplier = Math.max(1, Math.log10(currentValue + 1));
        change = Math.round(baseStep * multiplier * 0.1); // Уменьшаем шаг для плавности
      }

      if (change !== 0) {
        onStageSwipe(i, change);
      }

      animationFrameRef.current = requestAnimationFrame(() => continueChange(i));
    }
  }, [dragIndex, onStageSwipe, stages]);

  // Запускаем непрерывное изменение при начале свайпа
  useEffect(() => {
    if (dragIndex !== null) {
      animationFrameRef.current = requestAnimationFrame(() => continueChange(dragIndex));
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dragIndex, continueChange]);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {stages.map((stage, i) => {
        const widthPercent = maxValue ? stage.value / maxValue : 0;
        let barWidth = stage.isFullWidth
          ? maxBarWidth
          : (stage.value === 0 ? minBarWidth : minBarWidth + (maxBarWidth - minBarWidth) * Math.pow(widthPercent, 0.7));
        if (barWidth > maxBarWidth) barWidth = maxBarWidth;

        const animatedWidth = animatedWidths[i] ?? minBarWidth;

        let percentBlock = null;
        if (stage.percent !== undefined && i > 0) {
          const stepPercent = stage.percent;
          const trafficValue = stages[0]?.value || 0;
          const percentOfTraffic = trafficValue > 0 ? (stage.value / trafficValue * 100) : 0;
          percentBlock = (
            <BarPercent isNegative={isNegative}
              style={{ cursor: 'pointer' }}
              onClick={() => setShowTrafficPercent(showTrafficPercent === i ? null : i)}
            >
              {stepPercent}%
              {showTrafficPercent === i && (
                <span style={{ marginLeft: 6, color: isNegative ? '#222' : '#888', fontSize: 13 }}>
                  | {Math.round(percentOfTraffic)}% от трафика
                </span>
              )}
            </BarPercent>
          );
        } else if (stage.percent !== undefined) {
          percentBlock = <BarPercent isNegative={isNegative}>{stage.percent}%</BarPercent>;
        }
        return (
          <Row
            key={i}
            style={{ touchAction: 'none', width: '100%' }}
          >
            <LeftCol isNegative={isNegative}>
              {stage.label}
            </LeftCol>
            <BarWrap>
              <Bar color={stage.color} width={animatedWidth} />
              <Handle
                color={stage.color}
                active={handleHover === i || dragIndex === i}
                style={{ left: (animatedWidth - 14) + 'px', transform: `translateY(-50%) translateX(${dragIndex === i ? handleOffsetX : 0}px) scale(${handleHover === i || dragIndex === i ? 1.18 : 1})`, transition: 'left 0.7s cubic-bezier(.4,2,.6,1), border-color 0.18s, box-shadow 0.18s, transform 0.18s' }}
                onPointerDown={handleHandlePointerDown(i)}
                onPointerMove={handleHandlePointerMove(i)}
                onPointerUp={handleHandlePointerUp}
                onPointerLeave={handleHandlePointerUp}
                onTouchStart={e => { setHandleHover(i); handleHandleTouchStart(i)(e); }}
                onTouchEnd={() => { setHandleHover(null); handleHandleTouchEnd(); }}
                onMouseEnter={() => setHandleHover(i)}
                onMouseLeave={() => setHandleHover(null)}
              />
            </BarWrap>
            <ValueBlock>
              <BarValue isNegative={isNegative}>{formatShortNumber ? formatShortNumber(stage.value) : stage.value.toLocaleString('ru-RU')}</BarValue>
              {percentBlock}
            </ValueBlock>
          </Row>
        );
      })}
    </div>
  );
};

export default FunnelVisualization; 