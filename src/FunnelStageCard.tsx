import React from 'react';
import styled from 'styled-components';
import Slider from '@mui/material/Slider';

interface FunnelStageCardProps {
  icon: string;
  label: string;
  value: number | string;
  percent?: number;
  color: string;
  sliderValue?: number;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  onSliderChange?: (value: number) => void;
  sliderExplain?: string;
}

const Card = styled.div<{ color: string }>`
  background: ${({ color }) => color};
  border-radius: 32px;
  padding: 18px 20px 16px 20px;
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-shadow: 0 2px 12px #0001;
  color: ${({ color }) => (color === '#f7b731' || color === '#fab1a0' || color === '#eaf7f0' || color === '#1bb36a' ? '#222' : '#fff')};
`;
const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
`;
const Icon = styled.span`
  font-size: 26px;
  margin-right: 6px;
`;
const Label = styled.span`
  font-size: 18px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const Value = styled.span`
  font-size: 26px;
  font-weight: 700;
  margin-right: 10px;
`;
const Percent = styled.span`
  font-size: 18px;
  font-weight: 500;
  margin-left: auto;
`;
const SliderExplain = styled.div`
  font-size: 13px;
  color: #444;
  margin: 6px 0 2px 2px;
`;

const FunnelStageCard: React.FC<FunnelStageCardProps> = ({
  icon, label, value, percent, color,
  sliderValue, sliderMin = 0, sliderMax = 100, sliderStep = 1,
  onSliderChange, sliderExplain
}) => {
  return (
    <Card color={color}>
      <TopRow>
        <Value>{value}</Value>
        <Icon>{icon}</Icon>
        <Label>{label}</Label>
        {typeof percent === 'number' && <Percent>{percent}%</Percent>}
      </TopRow>
      {sliderExplain && <SliderExplain>{sliderExplain}</SliderExplain>}
      {typeof sliderValue === 'number' && onSliderChange && (
        <Slider
          value={sliderValue}
          min={sliderMin}
          max={sliderMax}
          step={sliderStep}
          onChange={(_, v) => onSliderChange(Number(v))}
          sx={{
            color,
            marginTop: 1,
            width: '100%',
            '& .MuiSlider-thumb': { boxShadow: '0 2px 8px #0002' },
          }}
        />
      )}
    </Card>
  );
};

export default FunnelStageCard; 