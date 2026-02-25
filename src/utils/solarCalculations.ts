import { AddressInfo, RoofInfo, ConsumptionInfo, SimulationResult } from '../types/solar';
import { getPVGISData, calculateSelfConsumption } from '../services/geoService';

// Configuration des tarifs et paramètres
const SUBSCRIPTION_CONFIG = {
  defaultElectricityPrice: 0.1952, // €/kWh (prix par défaut si pas de consommation renseignée)
};

/**
 * Calcule le prix de rachat de l'électricité selon la puissance installée
 * < 9 kWc : 0,04 €/kWh
 * ≥ 9 kWc et ≤ 100 kWc : 0,0617 €/kWh
 */
const getSellingPrice = (power: number): number => {
  if (power < 9) {
    return 0.04;
  } else if (power <= 100) {
    return 0.0617;
  }
  return 0.0617; // Pour les puissances > 100 kWc (cas rare)
};

// Contraintes de puissance
const MIN_POWER = 2.5; // kWc minimum
const MAX_POWER = 36;   // kWc maximum (pour les grosses consommations)

// Taux d'autoconsommation maximum fixé à 60%
const TARGET_MIN_SELF_CONSUMPTION = 60; // Minimum garanti, mais peut être plus élevé

/**
 * Calcule le prix personnalisé de l'électricité basé sur la consommation et la facture
 * Retourne aussi une estimation de la consommation si non renseignée
 */
const calculatePersonalizedElectricityPrice = (
  annualConsumption: number,
  monthlyBill: number
): { price: number; estimatedConsumption: number } => {
  // Si pas de facture mensuelle renseignée, utiliser les valeurs par défaut
  if (!monthlyBill || monthlyBill <= 0) {
    return {
      price: SUBSCRIPTION_CONFIG.defaultElectricityPrice,
      estimatedConsumption: annualConsumption > 0 ? annualConsumption : 4000
    };
  }

  // Si consommation renseignée, calculer le prix réel
  if (annualConsumption && annualConsumption > 0) {
    const monthlyConsumption = annualConsumption / 12;
    const personalizedPrice = monthlyBill / monthlyConsumption;

    // Vérification de cohérence : prix entre 0,10 € et 0,50 €/kWh
    if (personalizedPrice >= 0.10 && personalizedPrice <= 0.50) {
      return {
        price: personalizedPrice,
        estimatedConsumption: annualConsumption
      };
    }

    // Prix incohérent, utiliser le défaut mais garder la consommation
    return {
      price: SUBSCRIPTION_CONFIG.defaultElectricityPrice,
      estimatedConsumption: annualConsumption
    };
  }

  // Si pas de consommation renseignée, l'estimer à partir de la facture
  // Facture annuelle / prix moyen de l'électricité
  const annualBill = monthlyBill * 12;
  const estimatedConsumption = Math.round(annualBill / SUBSCRIPTION_CONFIG.defaultElectricityPrice);

  return {
    price: SUBSCRIPTION_CONFIG.defaultElectricityPrice,
    estimatedConsumption: estimatedConsumption
  };
};

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
  9.5: 176.0,
  10.0: 185.0,
  10.5: 194.0,
  11.0: 203.0,
  11.5: 212.0,
  12.0: 221.0,
  15.0: 275.0,
  18.0: 329.0,
  20.0: 365.0,
  25.0: 455.0,
  30.0: 545.0,
  36.0: 654.0,
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
  
  // Pour les puissances supérieures à 36 kWc, extrapolation linéaire
  if (roundedPower > 36) {
    // Progression moyenne : ~18€ par kWc supplémentaire
    const progressionMoyenne = 18;
    const ecartPuissance = roundedPower - 36;
    return SUNLIB_TARIFS[36.0] + (ecartPuissance * progressionMoyenne);
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
  heatingType: string,
  specificProduction: number,
  maxPowerFromSurface: number,
  electricityPrice: number
): number => {
  let optimalPower = 0;
  let maxMonthlyProfit = 0;

  // Pour les grosses consommations (> 15000 kWh/an), permettre jusqu'à 120% de la consommation
  // Pour les petites consommations, limiter à 150%
  const maxProductionRatio = annualConsumption > 15000 ? 1.2 : 1.5;
  const maxProductionAllowed = annualConsumption * maxProductionRatio;
  const maxPowerFromConsumption = maxProductionAllowed / specificProduction;

  // Limiter la puissance maximale testée par toutes les contraintes
  const maxTestPower = Math.min(maxPowerFromSurface, MAX_POWER, maxPowerFromConsumption);

  // Tester de MIN_POWER (2.5 kWc) jusqu'à la puissance max limitée par pas de 0.5 kWc
  for (let power = MIN_POWER; power <= maxTestPower; power += 0.5) {
    const annualProduction = power * specificProduction;

    // Calcul autoconsommation dynamique selon la production et la consommation
    const selfConsumption = calculateSelfConsumption(
      annualProduction,
      annualConsumption,
      heatingType,
      TARGET_MIN_SELF_CONSUMPTION
    );

    const selfConsumedEnergy = (annualProduction * selfConsumption) / 100;
    const soldEnergy = annualProduction - selfConsumedEnergy;

    // Prix de rachat selon la puissance
    const sellingPrice = getSellingPrice(power);

    // Économies annuelles
    const annualSavings = (selfConsumedEnergy * electricityPrice) +
                         (soldEnergy * sellingPrice);
    
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
  
  // Calcul du prix personnalisé de l'électricité et estimation de la consommation
  const { price: electricityPrice, estimatedConsumption } = calculatePersonalizedElectricityPrice(
    consumptionInfo.annualConsumption,
    consumptionInfo.monthlyBill
  );
  
  // Calcul de la puissance optimale qui garantit des économies (limitée entre MIN_POWER et MAX_POWER)
  // Utiliser la consommation estimée si la consommation n'est pas renseignée
  const maxPower = calculateOptimalPowerForProfit(
    estimatedConsumption,
    consumptionInfo.heatingType,
    specificProduction,
    maxPowerFromSurface,
    electricityPrice
  );

  // Récupération des données PVGIS réelles
  const pvgisData = await getPVGISData(addressInfo.latitude, addressInfo.longitude, maxPower);
  const annualProduction = pvgisData.annualProduction;

  // Utiliser la consommation estimée pour tous les calculs
  const effectiveConsumption = estimatedConsumption;
  
  // Calcul de l'autoconsommation dynamique
  const selfConsumption = calculateSelfConsumption(
    annualProduction,
    effectiveConsumption,
    consumptionInfo.heatingType,
    TARGET_MIN_SELF_CONSUMPTION
  );

  // Calcul des économies
  const selfConsumedEnergy = (annualProduction * selfConsumption) / 100;
  const soldEnergy = annualProduction - selfConsumedEnergy;

  // Prix de rachat selon la puissance installée
  const sellingPrice = getSellingPrice(maxPower);

  // Calcul des économies complètes :
  // 1. Économies sur la facture (électricité non achetée grâce à l'autoconsommation)
  const billSavings = selfConsumedEnergy * electricityPrice;

  // 2. Revenus de la revente du surplus
  const saleRevenue = soldEnergy * sellingPrice;
  
  // 3. Total des économies annuelles
  const annualSavings = Math.round(billSavings + saleRevenue);

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