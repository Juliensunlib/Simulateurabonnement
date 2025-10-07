import Airtable from 'airtable';
import { AddressInfo, RoofInfo, ConsumptionInfo, ContactInfo, SimulationResult } from '../types/solar';

// Configuration Airtable
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = 'Leads Solaires';

// Initialiser Airtable seulement si les clés sont disponibles
let base: any = null;

const initializeAirtable = () => {
  console.log('🔍 Debug Airtable Config:', {
    hasApiKey: !!AIRTABLE_API_KEY,
    apiKeyPreview: AIRTABLE_API_KEY ? `${AIRTABLE_API_KEY.substring(0, 10)}...` : 'undefined',
    hasBaseId: !!AIRTABLE_BASE_ID,
    baseId: AIRTABLE_BASE_ID || 'undefined',
    tableName: AIRTABLE_TABLE_NAME
  });

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.warn('Configuration Airtable manquante. Les données ne seront pas envoyées vers Airtable.');
    return null;
  }

  if (!base) {
    base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
  }

  return base;
};

/**
 * Formate un numéro de téléphone français pour Airtable
 */
const formatPhoneForAirtable = (phone: string): string => {
  // Nettoyer le numéro (supprimer espaces, points, tirets)
  const cleanPhone = phone.replace(/[\s\.\-]/g, '');
  
  // Si le numéro commence déjà par +33, le retourner tel quel
  if (cleanPhone.startsWith('+33')) {
    return cleanPhone;
  }
  
  // Si le numéro commence par 0, le remplacer par +33
  if (cleanPhone.startsWith('0')) {
    return '+33' + cleanPhone.substring(1);
  }
  
  // Si le numéro commence par 33, ajouter le +
  if (cleanPhone.startsWith('33')) {
    return '+' + cleanPhone;
  }
  
  // Sinon, considérer que c'est un numéro français sans le 0 initial
  return '+33' + cleanPhone;
};

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
    const airtableBase = initializeAirtable();
    
    if (!airtableBase) {
      console.log('Airtable non configuré. Simulation terminée sans sauvegarde.');
      return 'no-airtable-config';
    }

    // Vérifier que les clés API sont valides
    if (!AIRTABLE_API_KEY || AIRTABLE_API_KEY === 'your_airtable_api_key_here') {
      console.log('Clé API Airtable non configurée. Simulation terminée sans sauvegarde.');
      return 'invalid-api-key';
    }

    if (!AIRTABLE_BASE_ID || AIRTABLE_BASE_ID === 'your_airtable_base_id_here') {
      console.log('Base ID Airtable non configurée. Simulation terminée sans sauvegarde.');
      return 'invalid-base-id';
    }

    const record = await airtableBase(AIRTABLE_TABLE_NAME).create({
      // Informations contact
      'Prénom': leadData.contactInfo.firstName,
      'Nom': leadData.contactInfo.lastName,
      'Email': leadData.contactInfo.email,
      'Téléphone': formatPhoneForAirtable(leadData.contactInfo.phone),
      'Code postal': leadData.contactInfo.postalCode || leadData.addressInfo.postalCode,
      'Préférence contact': leadData.contactInfo.contactPreference === 'email' ? 'Email' : 'Téléphone',
      
      // Informations adresse
      'Adresse complète': leadData.addressInfo.fullAddress || leadData.addressInfo.address,
      'Ville': leadData.addressInfo.city,
      
      // Informations consommation
      'Consommation annuelle': leadData.consumptionInfo.annualConsumption,
      'Facture mensuelle': leadData.consumptionInfo.monthlyBill,
      
      // Résultats simulation
      'Puissance recommandée': leadData.simulationResult.maxPower,
      
      // Métadonnées
      'Date création': new Date().toISOString().split('T')[0],
      'Statut': 'Nouveau'
    });

    console.log('Lead envoyé vers Airtable avec succès:', record.id);
    return record.id;
  } catch (error) {
    console.error('Erreur lors de l\'envoi vers Airtable:', error);
    
    // Gestion spécifique des erreurs d'autorisation - ne pas bloquer l'utilisateur
    if (error.message?.includes('NOT_AUTHORIZED') || 
        error.message?.includes('You are not authorized') ||
        error.message?.includes('AUTHENTICATION_REQUIRED')) {
      console.log('Erreur d\'autorisation Airtable. Simulation terminée sans sauvegarde.');
      return 'authorization-error';
    }
    
    // Autres erreurs - ne pas bloquer non plus
    console.log('Erreur Airtable générique. Simulation terminée sans sauvegarde.');
    return 'generic-error';
  }
};

/**
 * Teste la connexion Airtable
 */
export const testAirtableConnection = async (): Promise<boolean> => {
  try {
    const airtableBase = initializeAirtable();
    
    if (!airtableBase) {
      return false;
    }
    
    // Essaie de lister les enregistrements (limite à 1 pour tester)
    await airtableBase(AIRTABLE_TABLE_NAME).select({ maxRecords: 1 }).firstPage();
    return true;
  } catch (error) {
    console.error('Erreur de connexion Airtable:', error);
    return false;
  }
};