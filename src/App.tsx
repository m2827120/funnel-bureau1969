import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import WebApp from '@twa-dev/sdk';
import FunnelVisualization from './FunnelVisualization';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Slider from '@mui/material/Slider';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Tooltip from '@mui/material/Tooltip';
import NumberInput from './NumberInput';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ConversionSelector from './components/ConversionSelector';
import { ConversionData } from './data/conversionData';

// Initialize Telegram WebApp
WebApp.ready();

const Container = styled.div`
  padding: 16px;
  max-width: 100%;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  box-sizing: border-box;
  min-height: 100vh;
  padding-bottom: 96px; /* для кнопки */
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
`;

const Button = styled.button`
  flex: 1 1 auto;
  min-width: 0;
  padding: 10px 0;
  background: #2481cc;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.18s;
  margin: 0;
  box-sizing: border-box;
  &:hover {
    background: #1c6aa3;
  }
`;

const ResetButton = styled.button`
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  background: #f5f6fa;
  color: #2481cc;
  border: none;
  border-radius: 12px;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.18s;
  &:hover {
    background: #e3e8f0;
  }
`;

const MainCard = styled.div`
  background: #f4f8fd;
  border-radius: 18px;
  box-shadow: 0 2px 12px #0001;
  padding: 24px 16px 16px 16px;
  margin-bottom: 24px;
`;

const ResultsCard = styled.div`
  background: #eaf7f0;
  border-radius: 18px;
  box-shadow: 0 2px 12px #0001;
  padding: 24px 16px 16px 16px;
  margin-bottom: 24px;
  border-top: 4px solid #1bb36a;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 18px;
  color: #2481cc;
`;

const SliderLabel = styled.div`
  display: flex;
  align-items: center;
  font-size: 15px;
  margin-bottom: 4px;
`;

const SliderValue = styled.span`
  margin-left: 12px;
  font-weight: bold;
  color: #2481cc;
`;

const SliderExplain = styled.div`
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
`;

const MetricIcon = styled.div`
  font-size: 22px;
  margin-bottom: 2px;
`;

const MetricLabel = styled.div`
  font-size: 11px;
  color: #888;
  margin-bottom: 2px;
`;

const MetricValue = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #2481cc;
`;

const STAGE_ICONS = ['👥', '📝', '⭐', '💰'];

const StickyButtons = styled.div<{
  visible: boolean;
}>`
  position: fixed;
  left: 50%;
  bottom: 0;
  width: 100vw;
  max-width: 420px;
  transform: ${({ visible }) => (visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(120%)')};
  background: transparent;
  box-shadow: 0 -2px 16px #0001;
  padding: 0 12px 18px 12px;
  display: flex;
  gap: 10px;
  z-index: 100;
  transition: transform 0.35s cubic-bezier(.4,0,.2,1);
  opacity: 1;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 28px;
  row-gap: 18px;
  justify-items: center;
  margin: 32px auto 0 auto;
  padding: 0 0 24px 0;
  max-width: 340px;
`;

const CardBox = styled.div<{ color?: string }>`
  border-radius: 18px;
  box-shadow: 0 1px 8px #0001;
  min-width: 0;
  width: 100%;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: ${({ color }) => color || '#222'};
  background: #fff;
`;

const FooterCreds = styled.div`
  color: #888;
  font-size: 13px;
  text-align: center;
  margin: 36px 0 12px 0;
  a {
    color: #888;
    text-decoration: underline;
    transition: color 0.18s;
    &:hover {
      color: #2481cc;
    }
  }
`;

function formatShortNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toLocaleString('ru-RU');
}

interface FunnelData {
  budget: number;
  cpc: number;
  averageCheck: number;
  trafficToLeads: number;
  leadsToQualified: number;
  qualifiedToSales: number;
}

interface FunnelResults {
  traffic: number;
  leads: number;
  qualifiedLeads: number;
  sales: number;
  revenue: number;
  roi: number;
}

function App() {
  const [funnelData, setFunnelData] = useState<FunnelData>({
    budget: 1000000,
    cpc: 520,
    averageCheck: 250000,
    trafficToLeads: 10,
    leadsToQualified: 50,
    qualifiedToSales: 20,
  });

  const [results, setResults] = useState<FunnelResults>({
    traffic: 0,
    leads: 0,
    qualifiedLeads: 0,
    sales: 0,
    revenue: 0,
    roi: 0,
  });

  const [errors, setErrors] = useState<{ budget?: string; cpc?: string; averageCheck?: string }>({});

  const [showSticky, setShowSticky] = useState(true);
  const lastScroll = useRef(0);
  const ticking = useRef(false);

  const [editingPrice, setEditingPrice] = useState<null | 'traffic' | 'lead' | 'qualifiedLead' | 'sale'>(null);
  const [editingValue, setEditingValue] = useState('');

  const [tooltipOpen, setTooltipOpen] = useState<string | null>(null);
  const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isTouch, setIsTouch] = useState(false);

  const [isConversionSelectorOpen, setIsConversionSelectorOpen] = useState(false);

  const resetDefaults = useCallback(() => {
    setFunnelData({
      budget: 1000000,
      cpc: 520,
      averageCheck: 250000,
      trafficToLeads: 10,
      leadsToQualified: 50,
      qualifiedToSales: 20,
    });
    setErrors({});
  }, []);

  const calculateFunnel = () => {
    const { budget, cpc, averageCheck, trafficToLeads, leadsToQualified, qualifiedToSales } = funnelData;
    if (budget <= 0 || cpc <= 0 || averageCheck <= 0) {
      setResults({ traffic: 0, leads: 0, qualifiedLeads: 0, sales: 0, revenue: 0, roi: 0 });
      return;
    }
    // Трафик (клики)
    const traffic = budget / cpc;
    // Лиды
    const leads = traffic * (trafficToLeads / 100);
    // Качественные лиды
    const qualifiedLeads = leads * (leadsToQualified / 100);
    // Продажи
    const sales = qualifiedLeads * (qualifiedToSales / 100);
    // Выручка
    const revenue = Math.round(sales) * averageCheck;
    // ROI
    const roi = ((revenue - budget) / budget) * 100;

    setResults({
      traffic: Math.round(traffic),
      leads: Math.round(leads),
      qualifiedLeads: Math.round(qualifiedLeads),
      sales: Math.round(sales),
      revenue: Math.round(revenue),
      roi: Math.round(roi * 100) / 100,
    });
  };

  const handleInputChange = (field: keyof FunnelData, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    if (numValue <= 0) {
      setErrors(prev => ({ ...prev, [field]: 'Введите положительное число' }));
    } else {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    setFunnelData(prev => ({ ...prev, [field]: numValue }));
  };

  const handleStageSwipe = useCallback((stageIndex: number, steps: number) => {
    if (stageIndex === 0) {
      setFunnelData(prev => ({ ...prev, cpc: Math.max(1, prev.cpc - steps) }));
    } else if (stageIndex === 1) {
      setFunnelData(prev => {
        const traffic = prev.budget / prev.cpc;
        let value = Math.round(traffic * (prev.trafficToLeads / 100)) + steps;
        value = Math.max(0, Math.min(Math.round(traffic), value));
        const percent = traffic > 0 ? Math.max(0, Math.min(100, (value / traffic) * 100)) : 0;
        return { ...prev, trafficToLeads: percent };
      });
    } else if (stageIndex === 2) {
      setFunnelData(prev => {
        const traffic = prev.budget / prev.cpc;
        const leads = traffic * (prev.trafficToLeads / 100);
        let value = Math.round(leads * (prev.leadsToQualified / 100)) + steps;
        value = Math.max(0, Math.min(Math.round(leads), value));
        const percent = leads > 0 ? Math.max(0, Math.min(100, (value / leads) * 100)) : 0;
        return { ...prev, leadsToQualified: percent };
      });
    } else if (stageIndex === 3) {
      setFunnelData(prev => {
        const traffic = prev.budget / prev.cpc;
        const leads = traffic * (prev.trafficToLeads / 100);
        const qualified = leads * (prev.leadsToQualified / 100);
        let value = Math.round(qualified * (prev.qualifiedToSales / 100)) + steps;
        value = Math.max(0, Math.min(Math.round(qualified), value));
        const percent = qualified > 0 ? Math.max(0, Math.min(100, (value / qualified) * 100)) : 0;
        return { ...prev, qualifiedToSales: percent };
      });
    }
  }, []);

  useEffect(() => {
    calculateFunnel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funnelData]);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const curr = window.scrollY;
          if (curr < 10) {
            setShowSticky(true);
          } else if (curr > lastScroll.current) {
            setShowSticky(false); // вниз — скрыть
          } else {
            setShowSticky(true); // вверх — показать
          }
          lastScroll.current = curr;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isNegative = results.roi < 0;
  const funnelStages = [
    {
      label: <><span style={{ fontSize: 20, marginRight: 6 }}>{STAGE_ICONS[0]}</span>Трафик</>,
      value: results.traffic,
      percent: 100,
      color: '#bdbdbd',
      isFullWidth: true,
    },
    {
      label: <><span style={{ fontSize: 20, marginRight: 6 }}>{STAGE_ICONS[1]}</span>Лиды</>,
      value: results.leads,
      percent: Math.round(funnelData.trafficToLeads),
      color: isNegative ? '#ff7675' : '#3a8dde',
    },
    {
      label: <><span style={{ fontSize: 20, marginRight: 6 }}>{STAGE_ICONS[2]}</span>Кач. Лиды</>,
      value: results.qualifiedLeads,
      percent: Math.round(funnelData.leadsToQualified),
      color: isNegative ? '#fab1a0' : '#f7b731',
    },
    {
      label: <><span style={{ fontSize: 20, marginRight: 6 }}>{STAGE_ICONS[3]}</span>Продажи</>,
      value: results.sales,
      percent: Math.round(funnelData.qualifiedToSales),
      color: isNegative ? '#d63031' : '#1bb36a',
    },
  ];

  const handleTooltipClick = (id: string) => {
    setIsTouch(true);
    if (tooltipOpen === id) {
      setTooltipOpen(null);
      if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
      return;
    }
    setTooltipOpen(id);
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    tooltipTimeout.current = setTimeout(() => setTooltipOpen(null), 2000);
  };

  const handleTooltipHover = (id: string) => {
    if (isTouch) return;
    setTooltipOpen(id);
  };

  const handleTooltipLeave = () => {
    if (isTouch) return;
    setTooltipOpen(null);
  };

  const handleConversionSelect = (data: ConversionData) => {
    setFunnelData(prev => ({
      ...prev,
      cpc: data.cpc,
      averageCheck: data.averageCheck,
      trafficToLeads: data.trafficToLead,
      leadsToQualified: data.leadToQualified,
      qualifiedToSales: data.qualifiedToSale,
    }));
  };

  return (
    <Container>
      <MainCard>
        <SectionTitle>Ваши данные</SectionTitle>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <InputGroup style={{ flex: 1, minWidth: 180 }}>
            <Label>
              Рекламный бюджет
              <span
                style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}
                onClick={() => handleTooltipClick('budget')}
                onMouseEnter={() => handleTooltipHover('budget')}
                onMouseLeave={handleTooltipLeave}
              >
                <InfoOutlinedIcon fontSize="small" style={{ marginLeft: 4, verticalAlign: 'middle', color: '#2481cc' }} />
                {tooltipOpen === 'budget' && (
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '120%',
                    transform: 'translateX(-50%)',
                    background: '#f3f3f3',
                    color: '#222',
                    borderRadius: 10,
                    padding: '10px 16px',
                    fontSize: 14,
                    boxShadow: '0 2px 12px #0001',
                    zIndex: 10,
                    whiteSpace: 'pre-line',
                    minWidth: 180,
                    maxWidth: 260,
                  }}>
                    Сколько вы готовы потратить на рекламу?
                  </div>
                )}
              </span>
            </Label>
            <NumberInput
              value={funnelData.budget === 0 ? '' : funnelData.budget}
              onChange={v => handleInputChange('budget', v === '' ? '0' : v)}
              placeholder="Введите сумму"
              min={0}
              style={errors.budget ? { borderColor: '#e74c3c', background: '#fff6f6' } : {}}
            />
            {errors.budget && <div style={{ color: '#e74c3c', fontSize: 13, marginTop: 2 }}>{errors.budget}</div>}
          </InputGroup>
          <InputGroup style={{ flex: 1, minWidth: 180 }}>
            <Label>
              Средний чек
              <span
                style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}
                onClick={() => handleTooltipClick('avg-check')}
                onMouseEnter={() => handleTooltipHover('avg-check')}
                onMouseLeave={handleTooltipLeave}
              >
                <InfoOutlinedIcon fontSize="small" style={{ marginLeft: 4, verticalAlign: 'middle', color: '#2481cc' }} />
                {tooltipOpen === 'avg-check' && (
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '120%',
                    transform: 'translateX(-50%)',
                    background: '#f3f3f3',
                    color: '#222',
                    borderRadius: 10,
                    padding: '10px 16px',
                    fontSize: 14,
                    boxShadow: '0 2px 12px #0001',
                    zIndex: 10,
                    whiteSpace: 'pre-line',
                    minWidth: 180,
                    maxWidth: 260,
                  }}>
                    Сколько стоит ваш продукт или услуга?
                  </div>
                )}
              </span>
            </Label>
            <NumberInput
              value={funnelData.averageCheck === 0 ? '' : funnelData.averageCheck}
              onChange={v => handleInputChange('averageCheck', v === '' ? '0' : v)}
              placeholder="Введите сумму"
              min={0}
              style={errors.averageCheck ? { borderColor: '#e74c3c', background: '#fff6f6' } : {}}
            />
            {errors.averageCheck && <div style={{ color: '#e74c3c', fontSize: 13, marginTop: 2 }}>{errors.averageCheck}</div>}
          </InputGroup>
        </div>
        <Accordion sx={{ background: 'transparent', boxShadow: 'none' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <span style={{ fontWeight: 500 }}>Дополнительно</span>
          </AccordionSummary>
          <AccordionDetails>
            <InputGroup>
              <Label>
                Стоимость клика / трафика
                <span
                  style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}
                  onClick={() => handleTooltipClick('cpc')}
                  onMouseEnter={() => handleTooltipHover('cpc')}
                  onMouseLeave={handleTooltipLeave}
                >
                  <InfoOutlinedIcon fontSize="small" style={{ marginLeft: 4, verticalAlign: 'middle', color: '#2481cc' }} />
                  {tooltipOpen === 'cpc' && (
                    <div style={{
                      position: 'absolute',
                      left: '50%',
                      top: '120%',
                      transform: 'translateX(-50%)',
                      background: '#f3f3f3',
                      color: '#222',
                      borderRadius: 10,
                      padding: '10px 16px',
                      fontSize: 14,
                      boxShadow: '0 2px 12px #0001',
                      zIndex: 10,
                      whiteSpace: 'pre-line',
                      minWidth: 180,
                      maxWidth: 260,
                    }}>
                      Средняя цена за 1 клик по вашей рекламе.
                    </div>
                  )}
                </span>
              </Label>
              <NumberInput
                value={funnelData.cpc === 0 ? '' : funnelData.cpc}
                onChange={v => handleInputChange('cpc', v === '' ? '0' : v)}
                min={0}
                style={errors.cpc ? { borderColor: '#e74c3c', background: '#fff6f6' } : {}}
              />
              {errors.cpc && <div style={{ color: '#e74c3c', fontSize: 13, marginTop: 2 }}>{errors.cpc}</div>}
            </InputGroup>
            <div style={{ margin: '24px 0 0 0' }}>
              <SliderLabel>
                Конверсия трафик → лиды
                <SliderValue>{Math.round(funnelData.trafficToLeads)}%</SliderValue>
              </SliderLabel>
              <SliderExplain>Сколько из 100 человек оставят заявку?</SliderExplain>
              <Slider
                value={funnelData.trafficToLeads}
                min={0}
                max={100}
                step={1}
                onChange={(_, v) => handleInputChange('trafficToLeads', String(v))}
                color="primary"
              />
            </div>
            <div style={{ margin: '18px 0 0 0' }}>
              <SliderLabel>
                Конверсия лиды → качественные лиды
                <SliderValue>{Math.round(funnelData.leadsToQualified)}%</SliderValue>
              </SliderLabel>
              <SliderExplain>Сколько из 100 лидов действительно заинтересованы?</SliderExplain>
              <Slider
                value={funnelData.leadsToQualified}
                min={0}
                max={100}
                step={1}
                onChange={(_, v) => handleInputChange('leadsToQualified', String(v))}
                color="warning"
              />
            </div>
            <div style={{ margin: '18px 0 0 0' }}>
              <SliderLabel>
                Конверсия качественные лиды → продажи
                <SliderValue>{Math.round(funnelData.qualifiedToSales)}%</SliderValue>
              </SliderLabel>
              <SliderExplain>Сколько из 100 качественных лидов купят?</SliderExplain>
              <Slider
                value={funnelData.qualifiedToSales}
                min={0}
                max={100}
                step={1}
                onChange={(_, v) => handleInputChange('qualifiedToSales', String(v))}
                color="success"
              />
            </div>
          </AccordionDetails>
        </Accordion>
      </MainCard>
      <ResultsCard style={isNegative ? { background: '#fff4f4', borderTop: '4px solid #e74c3c' } : {}}>
        <SectionTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Воронка продаж
          <span
            style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}
            onClick={() => handleTooltipClick('funnel-anno')}
            onMouseEnter={() => handleTooltipHover('funnel-anno')}
            onMouseLeave={handleTooltipLeave}
          >
            <InfoOutlinedIcon fontSize="small" style={{ color: '#2481cc', verticalAlign: 'middle' }} />
            {tooltipOpen === 'funnel-anno' && (
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '120%',
                transform: 'translateX(-50%)',
                background: '#f3f3f3',
                color: '#222',
                borderRadius: 10,
                padding: '10px 16px',
                fontSize: 14,
                boxShadow: '0 2px 12px #0001',
                zIndex: 10,
                whiteSpace: 'pre-line',
                minWidth: 180,
                maxWidth: 260,
              }}>
                Потяните за ползунки,
                чтобы изменить
                процент конверсии из
                этапа в этап
              </div>
            )}
          </span>
        </SectionTitle>
        <FunnelVisualization stages={funnelStages} isNegative={isNegative} formatShortNumber={formatShortNumber} onStageSwipe={handleStageSwipe} />
        <CardGrid style={{ margin: 0 }}>
          <CardBox color={isNegative ? '#e74c3c' : '#222'} style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {results.revenue !== 0
                  ? (results.revenue < 0
                      ? '-' + Math.abs(results.revenue).toLocaleString('ru-RU') + ' ₸'
                      : results.revenue.toLocaleString('ru-RU') + ' ₸')
                  : '—'}
              </div>
              <div style={{ fontSize: 20, marginLeft: 6 }}>💸</div>
              <div style={{ fontSize: 13, color: '#888', marginLeft: 4, fontWeight: 500 }}>
                {results.revenue < 0 ? 'Убыток' : 'Выручка'}
              </div>
            </div>
            <div style={{ fontSize: 12, color: isNegative ? '#e74c3c' : '#1bb36a', marginTop: 2, fontWeight: 500 }}>
              ROI: {results.revenue !== 0 ? results.roi + '%' : '—'}
            </div>
          </CardBox>
          <CardBox color={isNegative ? '#e74c3c' : '#222'} style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {results.revenue !== 0
                  ? ((results.revenue - funnelData.budget) < 0
                      ? '-' + Math.abs(results.revenue - funnelData.budget).toLocaleString('ru-RU') + ' ₸'
                      : (results.revenue - funnelData.budget).toLocaleString('ru-RU') + ' ₸')
                  : '—'}
              </div>
              <div style={{ fontSize: 20, marginLeft: 6 }}>
                {(results.revenue - funnelData.budget) < 0 ? '🤯' : '💰'}
              </div>
              <div style={{ fontSize: 13, color: '#888', marginLeft: 4, fontWeight: 500 }}>
                {(results.revenue - funnelData.budget) < 0 ? 'Убыток' : 'Прибыль'}
              </div>
            </div>
          </CardBox>
          <CardBox onClick={() => { setEditingPrice('traffic'); setEditingValue(funnelData.cpc ? funnelData.cpc.toString() : ''); }}>
            <MetricIcon>👥</MetricIcon>
            <MetricLabel>Цена за трафик</MetricLabel>
            {editingPrice === 'traffic' ? (
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={editingValue}
                onChange={e => {
                  const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
                  setEditingValue(e.target.value.replace(/\D/g, ''));
                  if (val > 0) {
                    setFunnelData(prev => ({ ...prev, cpc: val }));
                  }
                }}
                onBlur={() => setEditingPrice(null)}
                onKeyDown={e => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  if (e.key === 'Escape') setEditingPrice(null);
                }}
                style={{ fontSize: 20, width: 80, textAlign: 'center' }}
                autoFocus
              />
            ) : (
              <MetricValue>
                {funnelData.cpc ? funnelData.cpc.toLocaleString('ru-RU') : '—'} ₸
              </MetricValue>
            )}
          </CardBox>
          <CardBox onClick={() => { setEditingPrice('lead'); setEditingValue(results.leads > 0 ? Math.round(funnelData.budget / results.leads).toString() : ''); }}>
            <MetricIcon>📝</MetricIcon>
            <MetricLabel>Цена за лид</MetricLabel>
            {editingPrice === 'lead' ? (
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={editingValue}
                onChange={e => {
                  const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
                  setEditingValue(e.target.value.replace(/\D/g, ''));
                  if (val > 0 && results.leads > 0) {
                    setFunnelData(prev => {
                      const traffic = prev.budget / prev.cpc;
                      const percent = traffic > 0 ? Math.max(0, Math.min(100, (prev.budget / val) / traffic * 100)) : 0;
                      return { ...prev, trafficToLeads: percent };
                    });
                  }
                }}
                onBlur={() => setEditingPrice(null)}
                onKeyDown={e => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  if (e.key === 'Escape') setEditingPrice(null);
                }}
                style={{ fontSize: 20, width: 80, textAlign: 'center' }}
                autoFocus
              />
            ) : (
              <MetricValue>
                {results.leads > 0 ? Math.round(funnelData.budget / results.leads).toLocaleString('ru-RU') : '—'} ₸
              </MetricValue>
            )}
          </CardBox>
          <CardBox onClick={() => { setEditingPrice('qualifiedLead'); setEditingValue(results.qualifiedLeads > 0 ? Math.round(funnelData.budget / results.qualifiedLeads).toString() : ''); }}>
            <MetricIcon>⭐</MetricIcon>
            <MetricLabel>Цена за кач. лид</MetricLabel>
            {editingPrice === 'qualifiedLead' ? (
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={editingValue}
                onChange={e => {
                  const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
                  setEditingValue(e.target.value.replace(/\D/g, ''));
                  if (val > 0 && results.qualifiedLeads > 0) {
                    setFunnelData(prev => {
                      const traffic = prev.budget / prev.cpc;
                      const leads = traffic * (prev.trafficToLeads / 100);
                      const percent = leads > 0 ? Math.max(0, Math.min(100, (prev.budget / val) / leads * 100)) : 0;
                      return { ...prev, leadsToQualified: percent };
                    });
                  }
                }}
                onBlur={() => setEditingPrice(null)}
                onKeyDown={e => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  if (e.key === 'Escape') setEditingPrice(null);
                }}
                style={{ fontSize: 20, width: 80, textAlign: 'center' }}
                autoFocus
              />
            ) : (
              <MetricValue>
                {results.qualifiedLeads > 0 ? Math.round(funnelData.budget / results.qualifiedLeads).toLocaleString('ru-RU') : '—'} ₸
              </MetricValue>
            )}
          </CardBox>
          <CardBox onClick={() => { setEditingPrice('sale'); setEditingValue(results.sales > 0 ? Math.round(funnelData.budget / results.sales).toString() : ''); }}>
            <MetricIcon>💰</MetricIcon>
            <MetricLabel>Цена за продажу</MetricLabel>
            {editingPrice === 'sale' ? (
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={editingValue}
                onChange={e => {
                  const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
                  setEditingValue(e.target.value.replace(/\D/g, ''));
                  if (val > 0 && results.sales > 0) {
                    setFunnelData(prev => {
                      const traffic = prev.budget / prev.cpc;
                      const leads = traffic * (prev.trafficToLeads / 100);
                      const qualified = leads * (prev.leadsToQualified / 100);
                      const percent = qualified > 0 ? Math.max(0, Math.min(100, (prev.budget / val) / qualified * 100)) : 0;
                      return { ...prev, qualifiedToSales: percent };
                    });
                  }
                }}
                onBlur={() => setEditingPrice(null)}
                onKeyDown={e => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  if (e.key === 'Escape') setEditingPrice(null);
                }}
                style={{ fontSize: 20, width: 80, textAlign: 'center' }}
                autoFocus
              />
            ) : (
              <MetricValue>
                {results.sales > 0 ? Math.round(funnelData.budget / results.sales).toLocaleString('ru-RU') : '—'} ₸
              </MetricValue>
            )}
          </CardBox>
        </CardGrid>
        <StickyButtons visible={showSticky}>
          <Button onClick={() => setIsConversionSelectorOpen(true)}>
            Подставить конверсию
          </Button>
          <ResetButton onClick={resetDefaults} title="Сбросить поля">
            <DeleteOutlineIcon fontSize="inherit" />
          </ResetButton>
        </StickyButtons>
      </ResultsCard>
      <FooterCreds>
        big poppa: <a href="https://t.me/m2827120" target="_blank" rel="noopener noreferrer">m2827120</a>
      </FooterCreds>
      <ConversionSelector
        open={isConversionSelectorOpen}
        onClose={() => setIsConversionSelectorOpen(false)}
        onSelect={handleConversionSelect}
      />
    </Container>
  );
}

export default App; 