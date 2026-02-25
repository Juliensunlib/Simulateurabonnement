import React from 'react';
import { Sun, TrendingUp, Leaf, Calculator, CheckCircle, Download, Calendar, Phone } from 'lucide-react';
import { SimulationResult } from '../types/solar';

interface StepResultsProps {
  results: SimulationResult;
  onNext: () => void;
  onPrev: () => void;
  onRestart: () => void;
}

export const StepResults: React.FC<StepResultsProps> = ({ results, onNext, onPrev, onRestart }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-medium">
          <Calculator className="w-10 h-10 text-secondary-600" />
        </div>
        <h2 className="text-4xl font-bold font-display text-gray-900 mb-4">Résultats de votre simulation</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Découvrez le potentiel solaire de votre toiture</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 p-8 rounded-2xl border border-secondary-200 shadow-medium">
          <div className="flex items-center mb-4">
            <Sun className="w-10 h-10 text-secondary-600 mr-4" />
            <h3 className="text-xl font-semibold font-display text-gray-900">Puissance installable</h3>
          </div>
          <p className="text-4xl font-bold text-secondary-600 mb-3">{results.maxPower} kWc</p>
          <p className="text-base text-gray-700 font-medium">Puissance optimisée</p>
        </div>

        <div className="bg-gradient-to-br from-accent-50 to-accent-100 p-8 rounded-2xl border border-accent-200 shadow-medium">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-10 h-10 text-accent-600 mr-4" />
            <h3 className="text-xl font-semibold font-display text-gray-900">Production annuelle</h3>
          </div>
          <p className="text-4xl font-bold text-accent-600 mb-3">{results.annualProduction.toLocaleString()} kWh</p>
          <p className="text-base text-gray-700 font-medium">Électricité produite par an</p>
        </div>

        <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-2xl border border-primary-200 shadow-medium">
          <div className="flex items-center mb-4">
            <Leaf className="w-10 h-10 text-primary-600 mr-4" />
            <h3 className="text-xl font-semibold font-display text-gray-900">CO₂ évité</h3>
          </div>
          <p className="text-4xl font-bold text-primary-600 mb-3">{results.co2Reduction} kg</p>
          <p className="text-base text-gray-700 font-medium">Réduction d'émissions par an</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        <div className="bg-white p-8 rounded-2xl shadow-strong border border-gray-100">
          <h3 className="text-2xl font-bold font-display text-gray-900 mb-6">💰 Vos économies mensuelles estimées</h3>
          <div className="space-y-5">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-blue-900 mb-3">📊 Détail de vos économies annuelles :</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Électricité autoconsommée :</span>
                  <span className="font-medium">{Math.round((results.annualProduction * results.selfConsumption) / 100)} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Surplus vendu :</span>
                  <span className="font-medium">{Math.round(results.annualProduction - ((results.annualProduction * results.selfConsumption) / 100))} kWh</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-200">
                  <span className="font-semibold text-blue-900">Total économies annuelles :</span>
                  <span className="font-bold text-green-600">+{results.annualSavings}€</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Autoconsommation</span>
              <span className="font-bold text-lg">{results.selfConsumption}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Économies mensuelles</span>
              <span className="font-bold text-lg text-primary-600">{Math.round(results.annualSavings / 12)}€/mois</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Abonnement mensuel</span>
              <span className="font-bold text-lg text-accent-600">{results.monthlySubscription}€/mois</span>
            </div>
            <div className="flex justify-between pt-4 border-t-2 border-gray-100">
              <span className="text-gray-900 font-semibold">Gain net mensuel</span>
              <span className="font-bold text-xl text-green-600">+{Math.round((results.annualSavings - (results.monthlySubscription * 12)) / 12)}€/mois</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-strong border border-gray-100">
          <h3 className="text-2xl font-bold font-display text-gray-900 mb-6">📊 Données PVGIS officielles*</h3>
          <div className="space-y-5">
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Nombre de panneaux (500W)</span>
              <span className="font-bold text-lg">{Math.ceil(results.maxPower / 0.5)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Surface panneau utilisée</span>
              <span className="font-bold text-lg">{Math.ceil(results.maxPower * 4)} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Productivité spécifique</span>
              <span className="font-bold text-lg">{results.pvgisData?.specificProduction || Math.round(results.annualProduction / results.maxPower)} kWh/kWc/an</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Inclinaison optimale</span>
              <span className="font-bold text-lg">{results.pvgisData?.optimalInclination || 30}°</span>
            </div>
            <div className="flex justify-between pt-4 border-t-2 border-gray-100">
              <span className="text-gray-900 font-semibold">Production mensuelle moyenne</span>
              <span className="font-bold text-xl text-accent-600">{Math.round(results.annualProduction / 12)} kWh</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-10 rounded-2xl text-center mb-10 shadow-strong">
        <h3 className="text-3xl font-bold font-display mb-6">🎉 Économies estimées dès le premier mois !</h3>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white bg-opacity-20 rounded-xl p-6">
            <div className="text-3xl font-bold mb-2">{results.maxPower} kWc</div>
            <div className="text-lg opacity-90">Puissance optimisée</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-6">
            <div className="text-3xl font-bold mb-2">{results.monthlySubscription}€</div>
            <div className="text-lg opacity-90">Abonnement mensuel</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-6">
            <div className="text-3xl font-bold mb-2">+{Math.round((results.annualSavings - (results.monthlySubscription * 12)) / 12)}€</div>
            <div className="text-lg opacity-90">Gain net mensuel</div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto text-center mb-10">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-4">🎉 Demande envoyée avec succès !</h2>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <p className="text-lg text-gray-700 mb-4">
            Merci pour votre confiance ! Votre simulation solaire a été transmise à nos experts.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Download className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Étude personnalisée</h3>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Aucun investissement initial</h3>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Phone className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Service client dédié</h3>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-8">
          <h3 className="text-xl font-bold mb-2">🌟 Pourquoi choisir le solaire ?</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold">✓ Économies dès la première année</div>
              <div>Réduisez vos factures dès l'installation</div>
            </div>
            <div>
              <div className="font-semibold">✓ Installation clé en main</div>
              <div>Prise en charge complète de A à Z</div>
            </div>
            <div>
              <div className="font-semibold">✓ Garantie de bon fonctionnement</div>
              <div>Tranquillité d'esprit assurée</div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          Questions ? Contactez-nous au <span className="font-semibold">04 65 84 27 63 ou par mail à contact@sunlib.fr</span>
        </p>
      </div>

      <div className="flex space-x-6 justify-center">
        <button
          onClick={onRestart}
          className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
        >
          Faire une nouvelle simulation
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          * PVGIS = PHOTOVOLTAIC GEOGRAPHICAL INFORMATION SYSTEM
        </p>
      </div>
    </div>
  );
};