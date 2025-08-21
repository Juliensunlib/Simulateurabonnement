import React from 'react';
import { Home, Compass, Sun, Zap, Brain, CheckCircle } from 'lucide-react';
import { RoofInfo } from '../types/solar';
import { analyzeSolarExposure, analyzeRoofCharacteristics } from '../services/geoService';
import { SolarMap } from './SolarMap';

interface StepRoofProps {
  data: RoofInfo;
  onChange: (data: RoofInfo) => void;
  onNext: () => void;
  onPrev: () => void;
  addressInfo: {
    latitude?: number;
    longitude?: number;
    fullAddress?: string;
  };
}

export const StepRoof: React.FC<StepRoofProps> = ({ data, onChange, onNext, onPrev, addressInfo }) => {
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [autoAnalysisComplete, setAutoAnalysisComplete] = React.useState(false);
  const [showManualInputs, setShowManualInputs] = React.useState(false);

  // Lancer l'analyse automatique au chargement si on a les coordonnées
  React.useEffect(() => {
    if (addressInfo.latitude && addressInfo.longitude && !autoAnalysisComplete && !data.autoAnalysis) {
      handleAutoAnalysis();
    }
  }, [addressInfo.latitude, addressInfo.longitude]);

  const handleAutoAnalysis = async () => {
    if (!addressInfo.latitude || !addressInfo.longitude) return;
    
    setIsAnalyzing(true);
    try {
      const autoAnalysis = await analyzeRoofCharacteristics(
        addressInfo.latitude,
        addressInfo.longitude
      );
      
      // Appliquer automatiquement les résultats
      const updatedData = {
        ...data,
        surface: autoAnalysis.usableArea,
        orientation: autoAnalysis.optimalOrientation as any,
        inclination: autoAnalysis.recommendedInclination,
        roofType: autoAnalysis.roofType as any,
        obstacles: autoAnalysis.hasObstacles,
        autoAnalysis
      };
      
      onChange(updatedData);
      setAutoAnalysisComplete(true);
      
      // Lancer aussi l'analyse d'exposition solaire
      const solarExposure = await analyzeSolarExposure(
        addressInfo.latitude,
        addressInfo.longitude,
        autoAnalysis.usableArea
      );
      
      onChange({ ...updatedData, solarExposure });
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse automatique:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (addressInfo.latitude && addressInfo.longitude && data.surface > 0) {
      setIsAnalyzing(true);
      try {
        const solarExposure = await analyzeSolarExposure(
          addressInfo.latitude,
          addressInfo.longitude,
          data.surface
        );
        onChange({ ...data, solarExposure });
      } catch (error) {
        console.error('Erreur lors de l\'analyse solaire:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }
    
    onNext();
  };

  const orientations = [
    { value: 'sud', label: 'Sud', efficiency: '100%' },
    { value: 'sud-est', label: 'Sud-Est', efficiency: '95%' },
    { value: 'sud-ouest', label: 'Sud-Ouest', efficiency: '95%' },
    { value: 'est', label: 'Est', efficiency: '85%' },
    { value: 'ouest', label: 'Ouest', efficiency: '85%' },
    { value: 'nord', label: 'Nord', efficiency: '60%' }
  ];

  const roofTypes = [
    { value: 'tuiles', label: 'Tuiles' },
    { value: 'ardoises', label: 'Ardoises' },
    { value: 'bac-acier', label: 'Bac acier' },
    { value: 'membrane', label: 'Membrane EPDM' },
    { value: 'autre', label: 'Autre' }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {isAnalyzing ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          ) : autoAnalysisComplete ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <Home className="w-8 h-8 text-orange-600" />
          )}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isAnalyzing ? 'Analyse en cours...' : 
           autoAnalysisComplete ? 'Analyse terminée !' : 
           'Analyse de votre toiture'}
        </h2>
        <p className="text-gray-600">
          {isAnalyzing ? 'Notre IA analyse votre toiture automatiquement' :
           autoAnalysisComplete ? 'Caractéristiques détectées automatiquement' :
           'Détection automatique des caractéristiques de votre toit'}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          {/* Résultats de l'analyse automatique */}
          {data.autoAnalysis && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-center space-x-2 text-green-800 mb-4">
                <Brain className="w-6 h-6" />
                <span className="font-semibold text-lg">Analyse automatique terminée</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {data.autoAnalysis.confidence}% de confiance
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-gray-600">Surface totale estimée:</span>
                  <div className="font-bold text-blue-600">{data.autoAnalysis.estimatedTotalArea} m²</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-gray-600">Surface utilisable:</span>
                  <div className="font-bold text-green-600">{data.autoAnalysis.usableArea} m²</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-gray-600">Orientation optimale:</span>
                  <div className="font-bold text-orange-600 capitalize">{data.autoAnalysis.optimalOrientation}</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-gray-600">Inclinaison recommandée:</span>
                  <div className="font-bold text-purple-600">{data.autoAnalysis.recommendedInclination}°</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {data.autoAnalysis.hasObstacles ? 
                    '⚠️ Obstacles détectés sur la toiture' : 
                    '✅ Aucun obstacle majeur détecté'
                  }
                </div>
                <button
                  type="button"
                  onClick={() => setShowManualInputs(!showManualInputs)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {showManualInputs ? 'Masquer les réglages' : 'Ajuster manuellement'}
                </button>
              </div>
            </div>
          )}

          {/* Formulaire manuel (masqué par défaut si analyse auto réussie) */}
          {(!autoAnalysisComplete || showManualInputs) && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {autoAnalysisComplete && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">🔧 Ajustements manuels</h4>
                <p className="text-sm text-blue-800">
                  Vous pouvez modifier les valeurs détectées automatiquement si nécessaire.
                </p>
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📐 Surface disponible (m²) *
                </label>
                <input
                  type="number"
                  value={data.surface || ''}
                  onChange={(e) => onChange({ ...data, surface: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="50"
                  min="1"
                  required={!autoAnalysisComplete}
                />
                <p className="text-xs text-gray-500 mt-1">Surface exploitable pour les panneaux</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📐 Inclinaison (degrés) *
                </label>
                <input
                  type="number"
                  value={data.inclination || ''}
                  onChange={(e) => onChange({ ...data, inclination: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="30"
                  min="0"
                  max="90"
                  required={!autoAnalysisComplete}
                />
                <p className="text-xs text-gray-500 mt-1">30° = inclinaison optimale</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                🧭 Orientation principale *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {orientations.map((orientation) => (
                  <label
                    key={orientation.value}
                    className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all hover:border-orange-300 ${
                      data.orientation === orientation.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="orientation"
                      value={orientation.value}
                      checked={data.orientation === orientation.value}
                      onChange={(e) => onChange({ ...data, orientation: e.target.value as any })}
                      className="sr-only"
                    />
                    <Compass className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    <div className="font-medium text-gray-900">{orientation.label}</div>
                    <div className="text-sm text-gray-500">{orientation.efficiency}</div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                🏠 Type de couverture *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {roofTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all hover:border-orange-300 ${
                      data.roofType === type.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="roofType"
                      value={type.value}
                      checked={data.roofType === type.value}
                      onChange={(e) => onChange({ ...data, roofType: e.target.value as any })}
                      className="sr-only"
                    />
                    <div className="font-medium text-gray-900">{type.label}</div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data.obstacles}
                  onChange={(e) => onChange({ ...data, obstacles: e.target.checked })}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">
                  ⚠️ Il y a des obstacles sur la toiture (cheminées, antennes, etc.)
                </span>
              </label>
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
                disabled={isAnalyzing}
                className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 px-6 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 font-medium disabled:opacity-50 flex items-center justify-center"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    {autoAnalysisComplete ? 'Voir les résultats' : 'Calculer le potentiel'}
                  </>
                )}
              </button>
            </div>
          </form>
          )}

          {/* Bouton direct si analyse automatique terminée */}
          {autoAnalysisComplete && !showManualInputs && (
            <div className="space-y-4">
              {data.solarExposure && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-green-800 mb-3">
                    <Sun className="w-5 h-5" />
                    <span className="font-medium">Analyse d'exposition solaire terminée</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Irradiation moyenne:</span>
                      <div className="font-semibold text-orange-600">
                        {Math.round(data.solarExposure.averageIrradiation)} kWh/m²/an
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Zones analysées:</span>
                      <div className="font-semibold text-blue-600">
                        {data.solarExposure.zones.length} zones
                      </div>
                    </div>
                  </div>
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
                  onClick={onNext}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium flex items-center justify-center"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Voir mes résultats
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          {addressInfo.latitude && addressInfo.longitude ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                🛰️ Vue détaillée avec analyse solaire
              </h3>
              <SolarMap
                latitude={addressInfo.latitude}
                longitude={addressInfo.longitude}
                address={addressInfo.fullAddress || ''}
                onPositionChange={(lat, lng) => {
                  // Optionnel: mettre à jour les coordonnées si nécessaire
                }}
                solarExposure={data.solarExposure}
              />
              <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">☀️ Analyse en temps réel</h4>
                <p className="text-sm text-orange-800">
                  {autoAnalysisComplete ? 
                    'Analyse automatique terminée ! Les zones colorées montrent l\'exposition solaire optimale détectée par notre IA.' :
                    'Les zones colorées sur la carte indiquent les différents niveaux d\'exposition solaire de votre toiture.'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Analyse en cours...</h3>
                  <p className="text-gray-500">
                    Notre IA analyse votre toiture pour déterminer automatiquement les meilleures caractéristiques
                  </p>
                </>
              ) : (
                <>
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Analyse automatique</h3>
                  <p className="text-gray-500">
                    L'analyse automatique de votre toiture démarrera dès que l'adresse sera localisée
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Informations sur l'analyse automatique */}
      {!autoAnalysisComplete && !isAnalyzing && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Brain className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">🤖 Analyse automatique intelligente</h4>
              <p className="text-gray-500">
                Notre système détermine automatiquement :
              </p>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>• La surface utilisable de votre toiture</li>
                <li>• L'orientation optimale pour vos panneaux</li>
                <li>• L'inclinaison recommandée selon votre région</li>
                <li>• La détection d'obstacles potentiels</li>
                <li>• L'exposition solaire précise par zones</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};