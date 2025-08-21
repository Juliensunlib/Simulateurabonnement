// Service pour l'API Géoservice (adresse.data.gouv.fr)
export const searchAddresses = async (query: string): Promise<any[]> => {
  if (query.length < 3) return [];
  
  try {
    const response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
    );
    const data = await response.json();
    
    return data.features.map((feature: any) => ({
      label: feature.properties.label,
      value: feature.properties.label,
      city: feature.properties.city,
      postalCode: feature.properties.postcode,
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0],
      context: feature.properties.context
    }));
  } catch (error) {
    console.error('Erreur lors de la recherche d\'adresse:', error);
    return [];
  }
};

// Service pour obtenir les données d'irradiation solaire (API PVGIS)
export const getSolarIrradiation = async (lat: number, lon: number): Promise<number> => {
  try {
    const response = await fetch(
      `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat}&lon=${lon}&raddatabase=PVGIS-SARAH2&browser=1&outputformat=json&usehorizon=1&userhorizon=&startyear=2016&endyear=2020&peakpower=1&loss=14&trackingtype=0&optimalinclination=1&optimalangles=1`
    );
    const data = await response.json();
    
    // Retourne la production spécifique en kWh/kWc/an
    return data.outputs?.totals?.fixed?.E_y || 1200;
  } catch (error) {
    console.error('Erreur lors de la récupération des données solaires:', error);
    return 1200; // Valeur par défaut
  }
};

// Nouvelle fonction pour obtenir les données PVGIS complètes
export const getPVGISData = async (lat: number, lon: number, peakPower: number) => {
  try {
    const response = await fetch(
      `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat}&lon=${lon}&raddatabase=PVGIS-SARAH2&browser=1&outputformat=json&usehorizon=1&userhorizon=&startyear=2016&endyear=2020&peakpower=${peakPower}&loss=14&trackingtype=0&optimalinclination=1&optimalangles=1`
    );
    const data = await response.json();
    
    if (data.outputs && data.outputs.totals && data.outputs.totals.fixed) {
      return {
        annualProduction: Math.round(data.outputs.totals.fixed.E_y), // kWh/an
        specificProduction: Math.round(data.outputs.totals.fixed.E_y / peakPower), // kWh/kWc/an
        monthlyData: data.outputs.monthly || [],
        optimalInclination: data.inputs?.optimalinclination || 30,
        optimalAzimuth: data.inputs?.optimalazimuth || 180,
        systemLoss: data.inputs?.loss || 14
      };
    }
    
    // Valeurs par défaut si l'API échoue
    return {
      annualProduction: Math.round(peakPower * 1200),
      specificProduction: 1200,
      monthlyData: [],
      optimalInclination: 30,
      optimalAzimuth: 180,
      systemLoss: 14
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des données PVGIS:', error);
    return {
      annualProduction: Math.round(peakPower * 1200),
      specificProduction: 1200,
      monthlyData: [],
      optimalInclination: 30,
      optimalAzimuth: 180,
      systemLoss: 14
    };
  }
};

// Calcul de l'autoconsommation basé sur les profils de consommation
export const calculateSelfConsumption = (annualProduction: number, annualConsumption: number, heatingType: string, targetMinimum: number = 60): number => {
  // Facteurs d'autoconsommation selon le type de chauffage et le ratio production/consommation
  const productionRatio = annualProduction / annualConsumption;
  
  let baseAutoconsumption = targetMinimum; // Base minimum configurée (60% par défaut)
  
  // Ajustement selon le type de chauffage
  switch (heatingType) {
    case 'electrique':
      baseAutoconsumption = Math.max(targetMinimum, 65); // Plus de consommation diurne
      break;
    case 'gaz':
    case 'fioul':
      baseAutoconsumption = Math.max(targetMinimum, 60); // Moins de consommation électrique mais minimum 60%
      break;
    default:
      baseAutoconsumption = targetMinimum;
  }
  
  // Ajustement selon le ratio production/consommation
  if (productionRatio <= 0.5) {
    return Math.max(targetMinimum, Math.min(85, baseAutoconsumption + 20)); // Petite installation = plus d'autoconsommation
  } else if (productionRatio <= 1.0) {
    return Math.max(targetMinimum, Math.min(75, baseAutoconsumption + 10));
  } else if (productionRatio <= 1.5) {
    return Math.max(targetMinimum, Math.min(70, baseAutoconsumption + 5));
  } else {
    return Math.max(targetMinimum, baseAutoconsumption); // Toujours au minimum le seuil configuré
  }
};
// Simulation d'analyse d'exposition solaire du toit
export const analyzeSolarExposure = async (lat: number, lon: number, roofArea: number) => {
  // En réalité, ceci nécessiterait une API spécialisée comme Google Solar API
  // Pour la démo, on simule des zones d'exposition
  const baseIrradiation = await getSolarIrradiation(lat, lon);
  
  // Simulation de zones avec différents niveaux d'exposition
  const zones = [
    {
      area: roofArea * 0.4,
      exposureLevel: 'excellent' as const,
      annualIrradiation: baseIrradiation * 1.1
    },
    {
      area: roofArea * 0.35,
      exposureLevel: 'bon' as const,
      annualIrradiation: baseIrradiation * 0.95
    },
    {
      area: roofArea * 0.2,
      exposureLevel: 'moyen' as const,
      annualIrradiation: baseIrradiation * 0.8
    },
    {
      area: roofArea * 0.05,
      exposureLevel: 'faible' as const,
      annualIrradiation: baseIrradiation * 0.6
    }
  ];

  return {
    zones,
    averageIrradiation: baseIrradiation
  };
};

// Analyse automatique des caractéristiques de toiture
export const analyzeRoofCharacteristics = async (lat: number, lon: number) => {
  // Simulation d'analyse automatique de toiture
  // En réalité, ceci utiliserait des APIs comme Google Solar API ou des données cadastrales
  
  // Estimation de la surface de toiture basée sur la zone géographique
  const estimatedRoofArea = Math.floor(Math.random() * (150 - 80) + 80); // Entre 80 et 150 m²
  
  // Détermination automatique de l'orientation optimale basée sur la géolocalisation
  // En France, l'orientation sud est généralement optimale
  const optimalOrientation = 'sud';
  
  // Inclinaison moyenne optimale pour la France (30°)
  const averageInclination = 30;
  
  // Type de toiture le plus courant en France
  const commonRoofType = 'tuiles';
  
  // Analyse des obstacles potentiels (simulation)
  const hasObstacles = Math.random() > 0.7; // 30% de chance d'avoir des obstacles
  
  // Calcul de la surface utilisable (en tenant compte des obstacles et marges)
  const usableArea = hasObstacles ? 
    Math.floor(estimatedRoofArea * 0.65) : // 65% si obstacles
    Math.floor(estimatedRoofArea * 0.80);  // 80% sans obstacles majeurs
  
  return {
    estimatedTotalArea: estimatedRoofArea,
    usableArea,
    optimalOrientation,
    recommendedInclination: averageInclination,
    roofType: commonRoofType,
    hasObstacles,
    confidence: Math.floor(Math.random() * (95 - 75) + 75) // Score de confiance 75-95%
  };
};