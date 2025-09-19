import React from 'react';
import { Zap, Euro } from 'lucide-react';
import { ConsumptionInfo } from '../types/solar';

interface StepConsumptionProps {
  data: ConsumptionInfo;
  onChange: (data: ConsumptionInfo) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const StepConsumption: React.FC<StepConsumptionProps> = ({ data, onChange, onNext, onPrev }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const heatingTypes = [
    { value: 'electrique', label: 'Électrique' },
    { value: 'gaz', label: 'Gaz' },
    { value: 'fioul', label: 'Fioul' },
    { value: 'autre', label: 'Autre (bois, pompe à chaleur...)' }
  ];

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Votre consommation électrique</h2>
        <p className="text-gray-600">Pour dimensionner au mieux votre installation solaire</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Consommation annuelle (kWh)
          </label>
          <input
            type="number"
            value={data.annualConsumption || ''}
            onChange={(e) => onChange({ ...data, annualConsumption: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            placeholder="3500"
            min="1"
          />
          <p className="text-sm text-gray-500 mt-1">
            Vous pouvez trouver cette information sur votre facture d'électricité (optionnel)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Facture mensuelle moyenne (€) *
          </label>
          <div className="relative">
            <Euro className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={data.monthlyBill || ''}
              onChange={(e) => onChange({ ...data, monthlyBill: parseInt(e.target.value) || 0 })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="120"
              min="1"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Type de chauffage principal *
          </label>
          <div className="space-y-3">
            {heatingTypes.map((type) => (
              <label
                key={type.value}
                className={`cursor-pointer border-2 rounded-lg p-4 block transition-all hover:border-green-300 ${
                  data.heatingType === type.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="heatingType"
                  value={type.value}
                  checked={data.heatingType === type.value}
                  onChange={(e) => onChange({ ...data, heatingType: e.target.value as any })}
                  className="sr-only"
                />
                <div className="font-medium text-gray-900">{type.label}</div>
              </label>
            ))}
          </div>
        </div>

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
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium"
          >
            Calculer
          </button>
        </div>
      </form>
    </div>
  );
};