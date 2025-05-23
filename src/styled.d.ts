import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    cardBackground: string;
    resultsCardBackground: string;
    labelColor: string;
    borderColor: string;
    shadowColor: string;
    resetButtonBackground: string;
    resetButtonColor: string;
    metricLabelColor: string;
    metricValueColor: string;
    sliderExplainColor: string;
    footerColor: string;
    darkRed?: string;
    lightRed?: string;
    darkInputBackground?: string;
  }
} 