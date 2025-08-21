import React from 'react';
import { MapPin, Map } from 'lucide-react';
import { AddressInfo } from '../types/solar';
import { AddressAutocomplete } from './AddressAutocomplete';
import { SolarMap } from './SolarMap';
import { AddressSuggestion } from '../types/solar';

interface StepAddressProps {
  data: AddressInfo;
  onChange: (data: AddressInfo) => void;
  onNext: () => void;
}

export const StepAddress: React.FC<StepAddressProps> = ({ data, onChange, onNext }) => {
  const [showMap, setShowMap] = React.useState(false);
  const [preciseCoordinates, setPreciseCoordinates] = React.useState<{lat: number, lng: number} | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalLat = preciseCoordinates?.lat || data.latitude;
    const finalLng = preciseCoordinates?.lng || data.longitude;
    
    if (data.fullAddress && finalLat && finalLng) {
      // Mettre à jour avec les coordonnées précises si elles ont été ajustées
      if (preciseCoordinates) {
        onChange({
          ...data,
          latitude: preciseCoordinates.lat,
          longitude: preciseCoordinates.lng
        });
      }
      onNext();
    }
  };

  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    onChange({
      ...data,
      address: suggestion.value.split(',')[0] || suggestion.value,
      city: suggestion.city,
      postalCode: suggestion.postalCode,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      fullAddress: suggestion.label
    });
    setShowMap(true);
  };

  const handlePositionChange = (lat: number, lng: number) => {
    setPreciseCoordinates({ lat, lng });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-medium">
          <MapPin className="w-10 h-10 text-primary-600" />
        </div>
        <h2 className="text-4xl font-bold font-display text-gray-900 mb-4">Localisation de votre projet</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Trouvez votre adresse et visualisez votre toiture depuis l'espace</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-4 font-display">
                🔍 Recherchez votre adresse *
              </label>
              <AddressAutocomplete
                value={data.fullAddress || ''}
                onChange={(value) => onChange({ ...data, fullAddress: value })}
                onSelect={handleAddressSelect}
                placeholder="Tapez votre adresse (ex: 123 rue de la République, Paris)"
              />
              <p className="text-sm text-gray-600 mt-3 font-medium">
                💡 L'adresse se complète automatiquement grâce à la base nationale
              </p>
            </div>

            {data.latitude && data.longitude && (
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 shadow-soft">
                <div className="flex items-center space-x-3 text-primary-800">
                  <Map className="w-6 h-6" />
                  <span className="font-medium">
                    {preciseCoordinates ? 'Position ajustée avec précision !' : 'Adresse localisée avec succès !'}
                  </span>
                </div>
                <p className="text-sm text-primary-700 mt-2 font-medium">
                  📍 {data.fullAddress}
                </p>
                <p className="text-xs text-primary-600 mt-1">
                  Coordonnées: {(preciseCoordinates?.lat || data.latitude).toFixed(6)}, {(preciseCoordinates?.lng || data.longitude).toFixed(6)}
                </p>
                {preciseCoordinates && (
                  <p className="text-xs text-accent-600 mt-1 font-medium">
                    ✅ Position ajustée manuellement pour plus de précision
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={!data.latitude || !data.longitude}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-8 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-semibold font-display text-lg shadow-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {data.latitude && data.longitude ? 
                (preciseCoordinates ? 'Analyser ma toiture (position ajustée)' : 'Analyser ma toiture') : 
                'Sélectionnez une adresse'}
            </button>
          </form>
        </div>

        <div>
          {showMap && data.latitude && data.longitude ? (
            <div>
              <h3 className="text-xl font-semibold font-display text-gray-900 mb-6 flex items-center">
                🛰️ Positionnez précisément votre toit
              </h3>
              <SolarMap
                latitude={data.latitude}
                longitude={data.longitude}
                address={data.fullAddress || ''}
                onPositionChange={handlePositionChange}
              />
              <div className="mt-6 p-6 bg-accent-50 rounded-xl border border-accent-100 shadow-soft">
                <h4 className="font-semibold font-display text-accent-900 mb-3">🎯 Positionnement précis</h4>
                <p className="text-sm text-accent-800 leading-relaxed">
                  Cliquez directement sur votre toit ou déplacez le marqueur pour une localisation ultra-précise. 
                  Cela permettra une analyse d'exposition solaire plus exacte et des calculs optimisés.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-200">
              <Map className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold font-display text-gray-600 mb-3">Vue satellite</h3>
              <p className="text-gray-500 leading-relaxed">
                Sélectionnez une adresse pour voir la vue aérienne de votre toiture
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};