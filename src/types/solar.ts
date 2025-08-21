export interface AddressInfo {
  address: string;
  city: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  fullAddress?: string;
}

export interface RoofInfo {
  surface: number;
  orientation: 'sud' | 'sud-est' | 'sud-ouest' | 'est' | 'ouest' | 'nord';
  inclination: number;
  roofType: 'tuiles' | 'ardoises' | 'bac-acier' | 'membrane' | 'autre';
  obstacles: boolean;
  autoAnalysis?: {
    estimatedTotalArea: number;
    usableArea: number;
    optimalOrientation: string;
    recommendedInclination: number;
    roofType: string;
    hasObstacles: boolean;
    confidence: number;
  };
  solarExposure?: {
    zones: Array<{
      area: number;
      exposureLevel: 'excellent' | 'bon' | 'moyen' | 'faible';
      annualIrradiation: number;
    }>;
    averageIrradiation: number;
  };
}

export interface ConsumptionInfo {
  annualConsumption: number;
  monthlyBill: number;
  heatingType: 'electrique' | 'gaz' | 'fioul' | 'autre';
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  postalCode?: string;
  contactPreference: 'email' | 'phone';
}

export interface SimulationResult {
  maxPower: number;
  annualProduction: number;
  selfConsumption: number;
  annualSavings: number;
  co2Reduction: number;
  monthlySubscription: number;
  pvgisData?: {
    specificProduction: number;
    optimalInclination: number;
    optimalAzimuth: number;
    systemLoss: number;
    monthlyData: any[];
  };
}

export interface AddressSuggestion {
  label: string;
  value: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}