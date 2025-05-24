import React, { useRef, useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

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
  color: ${({ isNegative, theme }) =>
    isNegative
      ? (theme.background && theme.background.toLowerCase() === '#181c20' ? '#fff' : '#222')
      : ((theme.background && theme.background.toLowerCase() === '#181c20') ? '#fff' : theme.text)
  };
`;
const BarWrap = styled.div`
  width: 100%;
  flex: 1 1 0;
  position: relative;
  height: 28px;
  display: flex;
  align-items: center;
  padding-right: 14px;
`;
const pulseAnimation = keyframes`
  0% { transform: translateY(-50%) scale(1); }
  50% { transform: translateY(-50%) scale(1.1); }
  100% { transform: translateY(-50%) scale(1); }
`;
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const breatheAnimation = keyframes`
  0% { transform: scaleX(1); }
  50% { transform: scaleX(1.02); }
  100% { transform: scaleX(1); }
`;
const growAnimation = keyframes`
  0% { 
    transform: scaleX(0);
    opacity: 0;
  }
  60% { 
    transform: scaleX(1.02);
    opacity: 1;
  }
  100% { 
    transform: scaleX(1);
    opacity: 1;
  }
`;
const handleBounceAnimation = keyframes`
  0% { transform: translateY(-50%) scale(0.8); }
  50% { transform: translateY(-50%) scale(1.1); }
  100% { transform: translateY(-50%) scale(1); }
`;
const slideFadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px) scaleX(0.8);}
  to { opacity: 1; transform: translateY(0) scaleX(1);}
`;
const handleFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const handleBreathe = keyframes`
  0% { transform: translateY(-50%) scale(1); }
  50% { transform: translateY(-50%) scale(1.08); }
  100% { transform: translateY(-50%) scale(1); }
`;
const BarContainer = styled.div<{ showInitialAnimation?: boolean; delay?: number }>`
  position: relative;
  width: 100%;
  height: 100%;
  transform-origin: left center;
  will-change: transform, opacity;
  ${({ showInitialAnimation, delay }) => showInitialAnimation && css`
    animation: ${slideFadeIn} 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
    animation-delay: ${delay || 0}ms;
    animation-fill-mode: both;
  `}
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
  transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: width;
`;
const ValueBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 56px;
  text-align: right;
  justify-self: end;
  padding-left: 14px;
`;
const BarValue = styled.span<{ isNegative?: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: ${({ isNegative, theme }) =>
    isNegative
      ? (theme.background && theme.background.toLowerCase() === '#181c20' ? '#fff' : '#222')
      : ((theme.background && theme.background.toLowerCase() === '#181c20') ? '#fff' : theme.text)
  };
  line-height: 1.1;
  transition: all 0.3s ease-out;
  animation: ${fadeIn} 0.3s ease-out;
`;
const BarPercent = styled.span<{ isNegative?: boolean }>`
  font-size: 13px;
  font-weight: 500;
  color: ${({ isNegative, theme }) =>
    isNegative
      ? (theme.background && theme.background.toLowerCase() === '#181c20' ? '#fff' : '#222')
      : ((theme.background && theme.background.toLowerCase() === '#181c20') ? '#fff' : theme.text)
  };
  margin-top: 1px;
  transition: all 0.3s ease-out;
  animation: ${fadeIn} 0.3s ease-out;
`;
const Handle = styled.div<{ color: string; active?: boolean; isDragging?: boolean; showInitialAnimation?: boolean }>`
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
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-left: -14px;
  will-change: transform, border-color, box-shadow;
  opacity: 1;
  ${({ showInitialAnimation }) => showInitialAnimation && css`
    animation: ${handleFadeIn} 0.7s ease;
    animation-fill-mode: both;
  `}
  ${({ showInitialAnimation }) => !showInitialAnimation && css`
    animation: ${handleBreathe} 2.2s ease-in-out infinite;
  `}
  ${({ isDragging }) => isDragging && css`
    animation: ${pulseAnimation} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  `}

  &:hover {
    transform: translateY(-50%) scale(1.18);
    border-color: ${({ color }) => color === '#bdbdbd' ? '#888' : color};
    box-shadow: 0 2px 12px #0003, 0 0 0 4px ${({ color }) => color}33;
  }

  &:active {
    transform: translateY(-50%) scale(1.22);
    border-color: ${({ color }) => color === '#bdbdbd' ? '#222' : color};
    box-shadow: 0 2px 16px #0004, 0 0 0 6px ${({ color }) => color}44;
    cursor: grabbing;
  }
`;

const FunnelVisualization: React.FC<FunnelVisualizationProps> = ({ stages, formatShortNumber, onStageSwipe, isNegative }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(320);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [handleHover, setHandleHover] = useState<number | null>(null);
  const [showTrafficPercent, setShowTrafficPercent] = useState<number | null>(null);
  const [showInitialAnimation, setShowInitialAnimation] = useState(true);
  const barWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastXRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const lastVibrationTime = useRef<number>(0);
  const continuousChangeRef = useRef<{ direction: number; interval: NodeJS.Timeout | null }>({ direction: 0, interval: null });
  const isMobileRef = useRef(false);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    // Hide initial animation after it completes
    const timer = setTimeout(() => {
      setShowInitialAnimation(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Detect if device is mobile
    isMobileRef.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  // Add vibration feedback for mobile
  const vibrateOnKeyPoints = (value: number, oldValue: number) => {
    if (!navigator.vibrate) return;
    
    const now = Date.now();
    if (now - lastVibrationTime.current < 100) return; // Prevent too frequent vibrations
    
    const keyPoints = [25, 50, 75, 100];
    const crossedKeyPoint = keyPoints.some(point => 
      (oldValue < point && value >= point) || (oldValue > point && value <= point)
    );
    
    if (crossedKeyPoint) {
      navigator.vibrate(50);
      lastVibrationTime.current = now;
    }
  };

  // Modify the document-level pointer event handlers
  useEffect(() => {
    let lastMoveTime = Date.now();
    let lastMoveX = 0;
    let lastDeltaX = 0;
    let isNearEdge = false;
    let totalDragDistance = 0;
    const EDGE_THRESHOLD = 20;
    const STOP_THRESHOLD = 5;
    const MOBILE_ACCELERATION_THRESHOLD = 30; // Reduced threshold for faster acceleration
    const MOBILE_MAX_STEP = 20; // Increased maximum step
    const MOBILE_SENSITIVITY_MULTIPLIER = 2; // Multiplier for mobile drag sensitivity

    const handleDocumentPointerMove = (e: PointerEvent) => {
      if (isDraggingRef.current && dragIndex !== null && onStageSwipe && lastXRef.current !== null) {
        const stage = stages[dragIndex];
        const now = Date.now();
        const deltaX = e.clientX - lastXRef.current;
        const timeDelta = now - lastMoveTime;
        
        // Accumulate total drag distance
        totalDragDistance += Math.abs(deltaX);
        
        // Calculate step based on device and drag distance
        let step = 1;
        if (isMobileRef.current) {
          // On mobile, increase step size based on total drag distance
          if (totalDragDistance > MOBILE_ACCELERATION_THRESHOLD * 2) {
            step = MOBILE_MAX_STEP;
          } else if (totalDragDistance > MOBILE_ACCELERATION_THRESHOLD) {
            step = 8;
          }
        } else {
          // Desktop behavior remains unchanged
          if (Math.abs(deltaX) > 30 || timeDelta < 60) {
            step = 5;
          } else if (Math.abs(deltaX) > 10 || timeDelta < 120) {
            step = 2;
          }
        }
        
        // Check if finger is near screen edge
        const isNearLeftEdge = e.clientX <= EDGE_THRESHOLD;
        const isNearRightEdge = e.clientX >= window.innerWidth - EDGE_THRESHOLD;
        const isStopped = Math.abs(deltaX) < STOP_THRESHOLD;
        
        // Start continuous change if stopped near edge
        if (isMobileRef.current && isStopped && (isNearLeftEdge || isNearRightEdge)) {
          if (!isNearEdge) {
            isNearEdge = true;
            const direction = isNearLeftEdge ? -1 : 1;
            startContinuousChange(direction, step);
          }
        } else {
          isNearEdge = false;
          stopContinuousChange();
        }
        
        lastMoveTime = now;
        lastMoveX = e.clientX;
        lastDeltaX = deltaX;
        
        if (stage.percent !== undefined) {
          let change = Math.round((deltaX * (isMobileRef.current ? MOBILE_SENSITIVITY_MULTIPLIER : 1)) / 2);
          if (Math.abs(change) < step && change !== 0) {
            change = change > 0 ? step : -step;
          }
          if (change !== 0) {
            const oldValue = stage.percent;
            onStageSwipe(dragIndex, change);
            vibrateOnKeyPoints(stage.percent + change, oldValue);
            lastXRef.current = e.clientX;
          }
        } else {
          let change = Math.round(deltaX * (isMobileRef.current ? MOBILE_SENSITIVITY_MULTIPLIER : 1));
          if (Math.abs(change) < step && change !== 0) {
            change = change > 0 ? step : -step;
          }
          if (change !== 0) {
            onStageSwipe(dragIndex, change);
            lastXRef.current = e.clientX;
          }
        }
      }
    };

    const startContinuousChange = (direction: number, initialStep: number) => {
      if (!isMobileRef.current || continuousChangeRef.current.interval) return;

      const stage = stages[dragIndex!];
      let step = initialStep;
      let speed = 80; // Reduced initial speed for faster response
      let accelerationCounter = 0;

      const changeValue = () => {
        if (!dragIndex || !onStageSwipe) return;

        // Gradually increase step size for continuous change
        if (accelerationCounter < 5) { // Reduced number of steps to reach max speed
          step = Math.min(step + 2, MOBILE_MAX_STEP);
          accelerationCounter++;
        }

        if (stage.percent !== undefined) {
          onStageSwipe(dragIndex, direction * step);
        } else {
          onStageSwipe(dragIndex, direction * step);
        }

        // Gradually increase speed
        if (speed > 40) { // Reduced minimum speed
          speed -= 4; // Faster speed increase
          continuousChangeRef.current.interval = setTimeout(changeValue, speed);
        } else {
          continuousChangeRef.current.interval = setInterval(changeValue, speed);
        }
      };

      continuousChangeRef.current.direction = direction;
      continuousChangeRef.current.interval = setTimeout(changeValue, speed);
    };

    const stopContinuousChange = () => {
      if (continuousChangeRef.current.interval) {
        clearTimeout(continuousChangeRef.current.interval);
        clearInterval(continuousChangeRef.current.interval);
        continuousChangeRef.current.interval = null;
      }
    };

    const handleDocumentPointerUp = () => {
      isNearEdge = false;
      stopContinuousChange();
      isDraggingRef.current = false;
      setIsDragging(false);
      setDragIndex(null);
      lastXRef.current = null;
      lastDeltaX = 0;
      totalDragDistance = 0;
    };

    document.addEventListener('pointermove', handleDocumentPointerMove);
    document.addEventListener('pointerup', handleDocumentPointerUp);
    document.addEventListener('pointercancel', stopContinuousChange);

    return () => {
      document.removeEventListener('pointermove', handleDocumentPointerMove);
      document.removeEventListener('pointerup', handleDocumentPointerUp);
      document.removeEventListener('pointercancel', stopContinuousChange);
      stopContinuousChange();
    };
  }, [dragIndex, onStageSwipe, stages]);

  const maxValue = Math.max(...stages.map(s => s.value));
  const minBarWidth = 4;
  const rightColWidth = 80;
  const barToRedLineGap = 8;
  const redLineWidth = 5;
  const maxBarWidth = containerWidth - 120 - rightColWidth - barToRedLineGap - redLineWidth + 10;

  const handleHandlePointerDown = (i: number) => (e: React.PointerEvent) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    setIsDragging(true);
    setDragIndex(i);
    lastXRef.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {stages.map((stage, i) => {
        const widthPercent = maxValue ? stage.value / maxValue : 0;
        let barWidth = stage.isFullWidth
          ? maxBarWidth
          : (stage.value === 0 ? minBarWidth : minBarWidth + (maxBarWidth - minBarWidth) * Math.pow(widthPercent, 0.7));
        if (barWidth > maxBarWidth) barWidth = maxBarWidth;

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
            <BarWrap ref={el => barWrapRefs.current[i] = el}>
              <BarContainer showInitialAnimation={showInitialAnimation} delay={i * 120}>
                <Bar 
                  color={stage.color} 
                  width={barWidth}
                />
                <Handle
                  color={stage.color}
                  active={handleHover === i || dragIndex === i}
                  isDragging={isDragging && dragIndex === i}
                  showInitialAnimation={showInitialAnimation}
                  style={{ 
                    left: `${barWidth}px`,
                    transform: `translateY(-50%) scale(${handleHover === i || dragIndex === i ? 1.18 : 1})`
                  }}
                  onPointerDown={handleHandlePointerDown(i)}
                  onMouseEnter={() => setHandleHover(i)}
                  onMouseLeave={() => setHandleHover(null)}
                />
              </BarContainer>
            </BarWrap>
            <ValueBlock>
              <BarValue isNegative={isNegative}>
                {formatShortNumber ? formatShortNumber(stage.value) : stage.value.toLocaleString('ru-RU')}
              </BarValue>
              {percentBlock}
            </ValueBlock>
          </Row>
        );
      })}
    </div>
  );
};

export default FunnelVisualization; 