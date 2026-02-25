import React, { useState } from 'react';
import { Sun } from 'lucide-react';
import { ProgressBar } from './components/ProgressBar';
import { StepAddress } from './components/StepAddress';
import { StepRoof } from './components/StepRoof';
import { StepConsumption } from './components/StepConsumption';
import { StepResults } from './components/StepResults';
import { StepContact } from './components/StepContact';
import { StepComplete } from './components/StepComplete';
import { calculateSolarPotential } from './utils/solarCalculations';
import { AddressInfo, RoofInfo, ConsumptionInfo, ContactInfo, SimulationResult } from './types/solar';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [addressInfo, setAddressInfo] = useState<AddressInfo>({
    address: '',
    city: '',
    postalCode: ''
  });
  const [roofInfo, setRoofInfo] = useState<RoofInfo>({
    surface: 0,
    orientation: 'sud',
    inclination: 30,
    roofType: 'tuiles',
    obstacles: false
  });
  const [consumptionInfo, setConsumptionInfo] = useState<ConsumptionInfo>({
    annualConsumption: 0,
    monthlyBill: 0,
    heatingType: 'electrique'
  });
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    postalCode: '',
    contactPreference: 'email',
    rgpdConsent: false
  });
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const totalSteps = 5;

  const nextStep = () => {
    if (currentStep === 4) {
      // Calculer les résultats après avoir rempli le formulaire de contact
      calculateSolarPotential(addressInfo, roofInfo, consumptionInfo)
        .then(results => {
          setSimulationResult(results);
        })
        .catch(error => {
          console.error('Erreur lors du calcul:', error);
        });
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    // Faire défiler vers le haut de la page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completeSimulation = () => {
    nextStep();
  };

  const restartSimulation = () => {
    setCurrentStep(1);
    setAddressInfo({ address: '', city: '', postalCode: '' });
    setRoofInfo({ surface: 0, orientation: 'sud', inclination: 30, roofType: 'tuiles', obstacles: false });
    setConsumptionInfo({ annualConsumption: 0, monthlyBill: 0, heatingType: 'electrique' });
    setContactInfo({ firstName: '', lastName: '', email: '', phone: '', postalCode: '', contactPreference: 'email', rgpdConsent: false });
    setSimulationResult(null);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepAddress
            data={addressInfo}
            onChange={setAddressInfo}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <StepRoof
            data={roofInfo}
            onChange={setRoofInfo}
            onNext={nextStep}
            onPrev={prevStep}
            addressInfo={addressInfo}
          />
        );
      case 3:
        return (
          <StepConsumption
            data={consumptionInfo}
            onChange={setConsumptionInfo}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <StepContact
            data={contactInfo}
            onChange={setContactInfo}
            onComplete={completeSimulation}
            onPrev={prevStep}
            leadData={{
              addressInfo,
              roofInfo,
              consumptionInfo,
              simulationResult
            }}
          />
        );
      case 5:
        return simulationResult ? (
          <StepResults
            results={simulationResult}
            onNext={nextStep}
            onPrev={prevStep}
            onRestart={restartSimulation}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-soft border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-3">
              <img
                src="/logo.svg"
                alt="Logo SunLib"
                className="w-12 h-12 rounded-xl shadow-medium object-contain"
              />
              <div className="text-left">
                <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                  Simulateur d'abonnement solaire SunLib
                </h1>
                <p className="text-base text-gray-600 font-medium">Calculez le potentiel de votre toiture</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {currentStep < 5 && (
          <ProgressBar currentStep={currentStep} totalSteps={4} />
        )}
        
        <div className="bg-white rounded-3xl shadow-strong p-10 min-h-[600px] border border-gray-100">
          {renderStep()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sun className="w-6 h-6 text-primary-400" />
                <span className="text-xl font-bold font-display">Simulateur d'abonnement solaire SunLib</span>
              </div>
              <p className="text-gray-400">
                Votre partenaire pour la transition énergétique. 
                Simulations gratuites et accompagnement personnalisé.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 font-display">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>• Simulation gratuite</li>
                <li>• Étude personnalisée</li>
                <li>• Installation clé en main</li>
                <li>• Maintenance & SAV</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 font-display">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <p>📞 04 65 84 27 63</p>
                <p>📧 contact@sunlib.fr</p>
                <p>⏰ Lun-Ven 9h-18h</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Simulateur Solaire. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;