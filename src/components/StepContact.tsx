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

    if (data.firstName && data.lastName && data.email && data.phone && data.rgpdConsent) {
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        // Envoyer les données vers Airtable si toutes les données sont disponibles
        if (leadData) {
          console.log('📤 Préparation envoi vers Airtable...');
          console.log('leadData:', leadData);
          console.log('contactInfo:', data);

          const completeLeadData: LeadData = {
            addressInfo: leadData.addressInfo,
            roofInfo: leadData.roofInfo,
            consumptionInfo: leadData.consumptionInfo,
            contactInfo: data,
            simulationResult: leadData.simulationResult
          };

          console.log('completeLeadData:', completeLeadData);

          const result = await sendLeadToAirtable(completeLeadData);
          console.log('Résultat envoi Airtable:', result);

          if (result === 'no-airtable-config' ||
              result === 'invalid-api-key' ||
              result === 'invalid-base-id' ||
              result === 'authorization-error' ||
              result === 'generic-error') {
            console.log('⚠️ Simulation terminée (Airtable non configuré ou erreur)');
          } else {
            console.log('✅ Données envoyées vers Airtable avec succès, ID:', result);
          }
        } else {
          console.log('⚠️ leadData est undefined, impossible d\'envoyer vers Airtable');
        }

        onComplete();
      } catch (error) {
        // En cas d'erreur inattendue, continuer quand même
        console.error('❌ Erreur inattendue:', error);
        console.log('Simulation terminée malgré l\'erreur');
        onComplete();
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
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Type de client *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`cursor-pointer border-2 rounded-lg p-4 block transition-all hover:border-purple-300 ${
              data.clientType === 'particulier' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="clientType"
                value="particulier"
                checked={data.clientType === 'particulier'}
                onChange={(e) => onChange({ ...data, clientType: e.target.value as any })}
                className="sr-only"
              />
              <div className="font-medium text-gray-900 text-center">Particulier</div>
            </label>
            <label className={`cursor-pointer border-2 rounded-lg p-4 block transition-all hover:border-purple-300 ${
              data.clientType === 'entreprise' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="clientType"
                value="entreprise"
                checked={data.clientType === 'entreprise'}
                onChange={(e) => onChange({ ...data, clientType: e.target.value as any })}
                className="sr-only"
              />
              <div className="font-medium text-gray-900 text-center">Entreprise</div>
            </label>
          </div>
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

        <div>
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.rgpdConsent}
              onChange={(e) => onChange({ ...data, rgpdConsent: e.target.checked })}
              className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              required
            />
            <span className="text-sm text-gray-700">
              J'accepte d'être contacté par les experts solaires de SunLib et que mes données soient traitées conformément à la politique de confidentialité. *
            </span>
          </label>
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
            disabled={isSubmitting || !data.rgpdConsent}
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
                Envoyer ma demande et voir mes économies
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};