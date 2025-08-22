import React from 'react';
import { Sun, TrendingUp, Leaf, Calculator, Mail, Phone } from 'lucide-react';
import { SimulationResult } from '../types/solar';

interface StepResultsProps {
  results: SimulationResult;
  onNext: () => void;
  onPrev: () => void;
}

export const StepResults: React.FC<StepResultsProps> = ({ results, onNext, onPrev }) => {
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
                  <span className="text-blue-700">Économies facture (0,19€/kWh) :</span>
                  <span className="font-medium text-green-600">+{Math.round(((results.annualProduction * results.selfConsumption) / 100) * 0.19)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Surplus vendu :</span>
                  <span className="font-medium">{Math.round(results.annualProduction - ((results.annualProduction * results.selfConsumption) / 100))} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Revenus revente (0,40€/kWh) :</span>
                  <span className="font-medium text-green-600">+{Math.round((results.annualProduction - ((results.annualProduction * results.selfConsumption) / 100)) * 0.4)}€</span>
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
          <h3 className="text-2xl font-bold font-display text-gray-900 mb-6">📊 Données PVGIS officielles</h3>
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

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button
            onClick={onNext}
            className="bg-white text-primary-600 px-10 py-4 rounded-xl font-bold font-display text-lg hover:bg-gray-50 transition-all duration-300 flex items-center justify-center shadow-medium"
          >
            <Mail className="w-6 h-6 mr-3" />
            Souscrire à l'abonnement solaire
          </button>
          <button className="bg-primary-800 text-white px-10 py-4 rounded-xl font-bold font-display text-lg hover:bg-primary-900 transition-all duration-300 flex items-center justify-center shadow-medium">
            <Phone className="w-6 h-6 mr-3" />
            Être rappelé(e)
          </button>
        </div>
      </div>

      <div className="flex space-x-6">
        <button
          onClick={onPrev}
          className="flex-1 bg-gray-100 text-gray-700 py-4 px-8 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold font-display text-lg shadow-soft"
        >
          Modifier les paramètres
        </button>
      </div>
    </div>
  );
};