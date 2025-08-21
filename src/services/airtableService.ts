import Airtable from 'airtable';
import { AddressInfo, RoofInfo, ConsumptionInfo, ContactInfo, SimulationResult } from '../types/solar';

// Configuration Airtable
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = 'Leads Solaires';

// Initialiser Airtable
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

export interface LeadData {
  addressInfo: AddressInfo;
  roofInfo: RoofInfo;
  consumptionInfo: ConsumptionInfo;
  contactInfo: ContactInfo;
  simulationResult: SimulationResult;
}

/**
 * Envoie les données du lead vers Airtable
 */
export const sendLeadToAirtable = async (leadData: LeadData): Promise<string> => {
  try {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      throw new Error('Configuration Airtable manquante. Vérifiez vos variables d\'environnement.');
    }

    const record = await base(AIRTABLE_TABLE_NAME).create({
      // Informations contact
      'Prénom': leadData.contactInfo.firstName,
      'Nom': leadData.contactInfo.lastName,
      'Email': leadData.contactInfo.email,
      'Téléphone': leadData.contactInfo.phone,
      'Code postal': leadData.contactInfo.postalCode || leadData.addressInfo.postalCode,
      'Préférence contact': leadData.contactInfo.contactPreference === 'email' ? 'Email' : 'Téléphone',
      
      // Informations adresse
      'Adresse complète': leadData.addressInfo.fullAddress || leadData.addressInfo.address,
      'Ville': leadData.addressInfo.city,
      
      // Informations toiture
      'Surface toiture': leadData.roofInfo.surface,
      'Orientation': capitalizeFirst(leadData.roofInfo.orientation),
      'Inclinaison': leadData.roofInfo.inclination,
      'Type toiture': getFormattedRoofType(leadData.roofInfo.roofType),
      'Obstacles': leadData.roofInfo.obstacles,
      
      // Informations consommation
      'Consommation annuelle': leadData.consumptionInfo.annualConsumption,
      'Facture mensuelle': leadData.consumptionInfo.monthlyBill,
      'Type chauffage': capitalizeFirst(leadData.consumptionInfo.heatingType),
      
      // Résultats simulation
      'Puissance recommandée': leadData.simulationResult.maxPower,
      'Production annuelle': leadData.simulationResult.annualProduction,
      'Autoconsommation': leadData.simulationResult.selfConsumption,
      'Économies annuelles': leadData.simulationResult.annualSavings,
      'Abonnement mensuel': leadData.simulationResult.monthlySubscription,
      'Réduction CO2': leadData.simulationResult.co2Reduction,
      
      // Métadonnées
      'Date création': new Date().toISOString().split('T')[0],
      'Statut': 'Nouveau'
    });

    console.log('Lead envoyé vers Airtable avec succès:', record.id);
    return record.id;
  } catch (error) {
    console.error('Erreur lors de l\'envoi vers Airtable:', error);
    throw new Error('Impossible d\'envoyer les données vers Airtable');
  }
};

/**
 * Met en forme le type de toiture pour Airtable
 */
const getFormattedRoofType = (roofType: string): string => {
  const mapping: { [key: string]: string } = {
    'tuiles': 'Tuiles',
    'ardoises': 'Ardoises',
    'bac-acier': 'Bac acier',
    'membrane': 'Membrane EPDM',
    'autre': 'Autre'
  };
  return mapping[roofType] || 'Autre';
};

/**
 * Capitalise la première lettre
 */
const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Teste la connexion Airtable
 */
export const testAirtableConnection = async (): Promise<boolean> => {
  try {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return false;
    }
    
    // Essaie de lister les enregistrements (limite à 1 pour tester)
    await base(AIRTABLE_TABLE_NAME).select({ maxRecords: 1 }).firstPage();
    return true;
  } catch (error) {
    console.error('Erreur de connexion Airtable:', error);
    return false;
  }
};