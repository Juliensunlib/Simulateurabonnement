import React from 'react';
import { CheckCircle, Download, Calendar, Phone } from 'lucide-react';

interface StepCompleteProps {
  onRestart: () => void;
}

export const StepComplete: React.FC<StepCompleteProps> = ({ onRestart }) => {
  return (
    <div className="max-w-2xl mx-auto text-center">
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

      <div className="space-y-4">
        <button
          onClick={onRestart}
          className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
        >
          Faire une nouvelle simulation
        </button>
        
        <p className="text-sm text-gray-500">
          Questions ? Contactez-nous au <span className="font-semibold">04 65 84 27 63 ou par mail à contact@sunlib.fr</span>
        </p>
      </div>
    </div>
  );
};