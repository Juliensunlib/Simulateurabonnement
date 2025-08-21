import { AddressInfo, RoofInfo, ConsumptionInfo, SimulationResult } from '../types/solar';
import { getPVGISData, calculateSelfConsumption } from '../services/geoService';

// Configuration des tarifs et paramètres
const SUBSCRIPTION_CONFIG = {
  electricityPrice: 0.19, // €/kWh (corrigé de 0.25 à 0.19)
  sellingPrice: 0.4, // €/kWh rachat EDF OA
};

// Contraintes de puissance
const MIN_POWER = 2.5; // kWc minimum
const MAX_POWER = 12;   // kWc maximum

// Taux d'autoconsommation maximum fixé à 60%
const MAX_SELF_CONSUMPTION = 60;

// Grille tarifaire SunLib (EUR TTC mensuel) pour 25 ans selon la puissance
// Puissances: 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, etc.
const SUNLIB_TARIFS = {
  2.5: 49.0,
  3.0: 59.0,
  3.5: 68.5,
  4.0: 78.0,
  4.5: 87.0,
  5.0: 96.0,
  5.5: 105.5,
  6.0: 115.0,
  6.5: 124.0,
  7.0: 132.0,
  7.5: 140.0,
  8.0: 149.0,
  8.5: 158.0,
  9.0: 167.0,
  // Pour les puissances supérieures, extrapolation linéaire
};

/**
 * Obtient l'abonnement SunLib selon la puissance (TTC mensuel)
 */
const getSunLibSubscription = (power: number): number => {
  // Arrondir à 0.5 kWc près
  const roundedPower = Math.round(power * 2) / 2;
  
  // Si la puissance existe directement dans la grille
  if (SUNLIB_TARIFS[roundedPower]) {
    return SUNLIB_TARIFS[roundedPower];
  }
  
  // Pour les puissances inférieures à 2.5 kWc, utiliser le tarif minimum
  if (roundedPower < 2.5) {
    return SUNLIB_TARIFS[2.5];
  }
  
  // Pour les puissances supérieures à 9 kWc, extrapolation linéaire
  if (roundedPower > 9) {
    // Progression moyenne entre 8.5 et 9 kWc = 9€
    const progressionMoyenne = SUNLIB_TARIFS[9.0] - SUNLIB_TARIFS[8.5]; // 167 - 158 = 9€
    const ecartPuissance = roundedPower - 9;
    const nbPas = ecartPuissance / 0.5;
    return SUNLIB_TARIFS[9.0] + (nbPas * progressionMoyenne);
  }
  
  // Interpolation entre deux valeurs connues
  const puissancesTriees = Object.keys(SUNLIB_TARIFS)
    .map(p => parseFloat(p))
    .sort((a, b) => a - b);
  
  for (let i = 0; i < puissancesTriees.length - 1; i++) {
    const p1 = puissancesTriees[i];
    const p2 = puissancesTriees[i + 1];
    
    if (roundedPower >= p1 && roundedPower <= p2) {
      const tarif1 = SUNLIB_TARIFS[p1];
      const tarif2 = SUNLIB_TARIFS[p2];
      
      // Interpolation linéaire
      const ratio = (roundedPower - p1) / (p2 - p1);
      return tarif1 + (ratio * (tarif2 - tarif1));
    }
  }
  
  // Par défaut, retourner le tarif le plus proche
  return SUNLIB_TARIFS[2.5];
};

/**
 * Fonction pour calculer la puissance optimale qui garantit des économies
 */
const calculateOptimalPowerForProfit = (
  annualConsumption: number,
  specificProduction: number,
  maxPowerFromSurface: number
): number => {
  let optimalPower = 0;
  let maxMonthlyProfit = 0;
  
  // Calcul de la puissance maximale pour ne pas dépasser 130% de la consommation annuelle
  const maxProductionAllowed = annualConsumption * 1.5; // 150% de la consommation
  const maxPowerFromConsumption = maxProductionAllowed / specificProduction;
  
  // Limiter la puissance maximale testée par toutes les contraintes
  const maxTestPower = Math.min(maxPowerFromSurface, MAX_POWER, maxPowerFromConsumption);
  
  // Tester de MIN_POWER (2.5 kWc) jusqu'à la puissance max limitée par pas de 0.5 kWc
  for (let power = MIN_POWER; power <= maxTestPower; power += 0.5) {
    const annualProduction = power * specificProduction;
    
    // Calcul autoconsommation fixé à MAX_SELF_CONSUMPTION (60%)
    const selfConsumption = MAX_SELF_CONSUMPTION;
    
    const selfConsumedEnergy = (annualProduction * selfConsumption) / 100;
    const soldEnergy = annualProduction - selfConsumedEnergy;
    
    // Économies annuelles
    const annualSavings = (selfConsumedEnergy * SUBSCRIPTION_CONFIG.electricityPrice) + 
                         (soldEnergy * SUBSCRIPTION_CONFIG.sellingPrice);
    
    // Abonnement SunLib mensuel
    const monthlySubscription = getSunLibSubscription(power);
    
    // Profit mensuel net
    const monthlyProfit = (annualSavings / 12) - monthlySubscription;
    
    // Garder la puissance qui donne le meilleur profit mensuel
    if (monthlyProfit > maxMonthlyProfit && monthlyProfit > 0) {
      maxMonthlyProfit = monthlyProfit;
      optimalPower = power;
    }
  }
  
  // Si aucune puissance n'est rentable, prendre une puissance qui couvre au moins 30% de la consommation
  // mais toujours dans la plage MIN_POWER - MAX_POWER
  if (optimalPower === 0) {
    const minPower = Math.max(MIN_POWER, Math.min(maxTestPower, (annualConsumption * 0.3) / specificProduction));
    optimalPower = Math.round(minPower * 2) / 2; // Arrondir au 0.5 kWc près
  }
  
  // S'assurer que la puissance optimale reste dans la plage autorisée
  optimalPower = Math.max(MIN_POWER, Math.min(MAX_POWER, optimalPower));
  
  return Math.round(optimalPower * 2) / 2; // Arrondir au 0.5 kWc près
};

export const calculateSolarPotential = async (
  addressInfo: AddressInfo,
  roofInfo: RoofInfo,
  consumptionInfo: ConsumptionInfo
): Promise<SimulationResult> => {
  // Vérification des coordonnées GPS
  if (!addressInfo.latitude || !addressInfo.longitude) {
    throw new Error('Coordonnées GPS manquantes pour le calcul');
  }

  // Calcul de la puissance installable (environ 0.6 kWc/m²)
  const availableSurface = roofInfo.obstacles ? roofInfo.surface * 0.8 : roofInfo.surface;
  const maxPowerFromSurface = Math.floor(availableSurface * 0.6);
  
  // Récupération des données PVGIS pour estimer la production spécifique
  const tempPvgisData = await getPVGISData(addressInfo.latitude, addressInfo.longitude, 1);
  const specificProduction = tempPvgisData.specificProduction;
  
  // Calcul de la puissance optimale qui garantit des économies (limitée entre MIN_POWER et MAX_POWER)
  const maxPower = calculateOptimalPowerForProfit(
    consumptionInfo.annualConsumption,
    specificProduction,
    maxPowerFromSurface
  );

  // Récupération des données PVGIS réelles
  const pvgisData = await getPVGISData(addressInfo.latitude, addressInfo.longitude, maxPower);
  const annualProduction = pvgisData.annualProduction;
  
  // Calcul de l'autoconsommation fixé à MAX_SELF_CONSUMPTION (60%)
  const selfConsumption = MAX_SELF_CONSUMPTION;

  // Calcul des économies
  const selfConsumedEnergy = (annualProduction * selfConsumption) / 100;
  const soldEnergy = annualProduction - selfConsumedEnergy;
  
  const annualSavings = Math.round(
    (selfConsumedEnergy * SUBSCRIPTION_CONFIG.electricityPrice) + 
    (soldEnergy * SUBSCRIPTION_CONFIG.sellingPrice)
  );

  // Calcul de l'abonnement mensuel SunLib (TTC)
  const monthlySubscription = Math.round(getSunLibSubscription(maxPower));

  // Réduction CO2 (0.079 kg CO2/kWh évité)
  const co2Reduction = Math.round(annualProduction * 0.079);

  return {
    maxPower,
    annualProduction,
    selfConsumption,
    annualSavings,
    co2Reduction,
    monthlySubscription,
    pvgisData: {
      specificProduction: pvgisData.specificProduction,
      optimalInclination: pvgisData.optimalInclination,
      optimalAzimuth: pvgisData.optimalAzimuth,
      systemLoss: pvgisData.systemLoss,
      monthlyData: pvgisData.monthlyData
    }
  };
};