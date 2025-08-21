import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet
const customIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface SolarMapProps {
  latitude: number;
  longitude: number;
  address: string;
  onPositionChange?: (lat: number, lng: number) => void;
  solarExposure?: {
    zones: Array<{
      area: number;
      exposureLevel: 'excellent' | 'bon' | 'moyen' | 'faible';
      annualIrradiation: number;
    }>;
    averageIrradiation: number;
  };
}

export const SolarMap: React.FC<SolarMapProps> = ({ 
  latitude, 
  longitude, 
  address, 
  onPositionChange,
  solarExposure 
}) => {
  const mapRef = useRef<any>(null);
  const [markerPosition, setMarkerPosition] = React.useState<[number, number]>([latitude, longitude]);

  useEffect(() => {
    // Centrer la carte sur les nouvelles coordonnées
    if (mapRef.current) {
      mapRef.current.setView([latitude, longitude], 18);
    }
    setMarkerPosition([latitude, longitude]);
  }, [latitude, longitude]);

  // Composant pour gérer les événements de la carte
  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);
        if (onPositionChange) {
          onPositionChange(lat, lng);
        }
      },
    });
    return null;
  };

  // Gestionnaire pour le déplacement du marqueur
  const handleMarkerDragEnd = (e: any) => {
    const marker = e.target;
    const position = marker.getLatLng();
    setMarkerPosition([position.lat, position.lng]);
    if (onPositionChange) {
      onPositionChange(position.lat, position.lng);
    }
  };

  const getExposureColor = (level: string) => {
    switch (level) {
      case 'excellent': return '#22c55e';
      case 'bon': return '#84cc16';
      case 'moyen': return '#f59e0b';
      case 'faible': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={[latitude, longitude]}
        zoom={18}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <MapEvents />
        {/* Couche satellite */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
        />
        
        {/* Marqueur de l'adresse */}
        <Marker 
          position={markerPosition} 
          icon={customIcon}
          draggable={true}
          eventHandlers={{
            dragend: handleMarkerDragEnd,
          }}
        >
          <Popup>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">📍 Position du toit</h3>
              <p className="text-sm text-gray-600 mb-3">{address}</p>
              <p className="text-xs text-blue-600 mb-2">
                📌 Déplacez le marqueur sur votre toit pour plus de précision
              </p>
              {solarExposure && (
                <div className="text-left">
                  <h4 className="font-medium text-gray-800 mb-2">☀️ Exposition solaire</h4>
                  <div className="space-y-1 text-xs">
                    {solarExposure.zones.map((zone, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: getExposureColor(zone.exposureLevel) }}
                          />
                          <span className="capitalize">{zone.exposureLevel}</span>
                        </div>
                        <span>{Math.round(zone.area)}m²</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t text-center">
                    <span className="font-medium">
                      Irradiation moyenne: {Math.round(solarExposure.averageIrradiation)} kWh/m²/an
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Légende d'exposition solaire */}
      {solarExposure && (
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-md">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Exposition solaire</h4>
          <div className="space-y-1">
            {['excellent', 'bon', 'moyen', 'faible'].map((level) => (
              <div key={level} className="flex items-center text-xs">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getExposureColor(level) }}
                />
                <span className="capitalize">{level}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Instructions pour déplacer le marqueur */}
      <div className="absolute top-4 right-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-md max-w-xs">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">🎯 Positionnement précis</h4>
        <p className="text-xs text-gray-600">
          Cliquez sur la carte ou déplacez le marqueur directement sur votre toit pour une analyse plus précise.
        </p>
      </div>
    </div>
  );
};