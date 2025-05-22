import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { ConversionData, conversionData } from '../data/conversionData';

interface ConversionSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (data: ConversionData) => void;
}

const ConversionSelector: React.FC<ConversionSelectorProps> = ({ open, onClose, onSelect }) => {
  const [selectedNiche, setSelectedNiche] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');

  const niches = Array.from(new Set(conversionData.map(item => item.niche)));
  const platforms = Array.from(new Set(conversionData.map(item => item.platform)));

  const handleApply = () => {
    const selectedData = conversionData.find(
      item => item.niche === selectedNiche && item.platform === selectedPlatform
    );
    if (selectedData) {
      onSelect(selectedData);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Выберите нишу и платформу</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Ниша</InputLabel>
          <Select
            value={selectedNiche}
            label="Ниша"
            onChange={(e) => setSelectedNiche(e.target.value)}
          >
            {niches.map((niche) => (
              <MenuItem key={niche} value={niche}>
                {niche}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Платформа</InputLabel>
          <Select
            value={selectedPlatform}
            label="Платформа"
            onChange={(e) => setSelectedPlatform(e.target.value)}
          >
            {platforms.map((platform) => (
              <MenuItem key={platform} value={platform}>
                {platform}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button 
          onClick={handleApply} 
          variant="contained" 
          disabled={!selectedNiche || !selectedPlatform}
        >
          Применить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConversionSelector; 