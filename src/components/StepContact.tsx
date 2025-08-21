import React from 'react';
import { User, CheckCircle } from 'lucide-react';
import { ContactInfo } from '../types/solar';
import { sendLeadToAirtable, LeadData } from '../services/airtableService';

interface StepContactProps {
  data: ContactInfo;
  onChange: (data: ContactInfo) => void;
  onComplete: () => void;
  onPrev: () => void;
  leadData?: {
    addressInfo: any;
    roofInfo: any;
    consumptionInfo: any;
    simulationResult: any;
  };
}

export const StepContact: React.FC<StepContactProps> = ({ 
  data, 
  onChange, 
  onComplete, 
  onPrev, 
  leadData 
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (data.firstName && data.lastName && data.email && data.phone) {
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        // Envoyer les données vers Airtable si toutes les données sont disponibles
        if (leadData) {
          const completeLeadData: LeadData = {
            addressInfo: leadData.addressInfo,
            roofInfo: leadData.roofInfo,
            consumptionInfo: leadData.consumptionInfo,
            contactInfo: data,
            simulationResult: leadData.simulationResult
          };
          
          const result = await sendLeadToAirtable(completeLeadData);
          if (result === 'no-airtable-config' || result === 'invalid-api-key' || result === 'invalid-base-id') {
            console.log('Simulation terminée (Airtable non configuré)');
          } else {
            console.log('Données envoyées vers Airtable avec succès');
          }
        }
        
        onComplete();
      } catch (error) {
        console.error('Erreur lors de l\'envoi:', error);
        
        // Ne pas bloquer l'utilisateur si Airtable n'est pas configuré ou mal configuré
        if (error.message?.includes('Configuration Airtable') || 
            error.message?.includes('Clé API Airtable invalide') ||
            error.message?.includes('permissions insuffisantes')) {
          console.warn('Airtable non configuré, mais simulation terminée');
          onComplete();
        } else {
          setSubmitError('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vos coordonnées</h2>
        <p className="text-gray-600">Pour être contacté par un installateur RGE partenaire de SunLib</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prénom *
            </label>
            <input
              type="text"
              value={data.firstName}
              onChange={(e) => onChange({ ...data, firstName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Jean"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom *
            </label>
            <input
              type="text"
              value={data.lastName}
              onChange={(e) => onChange({ ...data, lastName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Dupont"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code postal *
          </label>
          <input
            type="text"
            value={data.postalCode || ''}
            onChange={(e) => onChange({ ...data, postalCode: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="75001"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="jean.dupont@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Téléphone *
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="06 12 34 56 78"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Préférence de contact
          </label>
          <div className="space-y-3">
            <label className={`cursor-pointer border-2 rounded-lg p-4 block transition-all hover:border-purple-300 ${
              data.contactPreference === 'email' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="contactPreference"
                value="email"
                checked={data.contactPreference === 'email'}
                onChange={(e) => onChange({ ...data, contactPreference: e.target.value as any })}
                className="sr-only"
              />
              <div className="font-medium text-gray-900">Par email</div>
            </label>
            <label className={`cursor-pointer border-2 rounded-lg p-4 block transition-all hover:border-purple-300 ${
              data.contactPreference === 'phone' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="contactPreference"
                value="phone"
                checked={data.contactPreference === 'phone'}
                onChange={(e) => onChange({ ...data, contactPreference: e.target.value as any })}
                className="sr-only"
              />
              <div className="font-medium text-gray-900">Par téléphone</div>
            </label>
          </div>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{submitError}</p>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onPrev}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
          >
            Précédent
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Envoyer ma demande
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>En soumettant ce formulaire, vous acceptez d'être contacté par nos experts solaires et que vos données soient traitées.</p>
      </div>
    </div>
  );
};