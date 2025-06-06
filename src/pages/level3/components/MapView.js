import React, { useEffect, useRef, useState } from 'react';
import './MapView.css';
import { GoogleMapsService } from '../map/GoogleMapsService';

const MapView = ({ isOpen, onClose }) => {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    console.log('MapView useEffect triggered:', { isOpen, hasMapRef: !!mapRef.current, hasMapInstance: !!mapInstance });
    
    if (isOpen && mapRef.current && !mapInstance) {
      console.log('MapView: Starting map initialization...');
      initializeMap().then(() => {
        if (isMounted) {
          console.log('MapView: Map initialization completed');
        }
      }).catch((err) => {
        if (isMounted) {
          console.error('MapView: Map initialization failed:', err);
        }
      });
    } else if (!isOpen && mapInstance) {
      // Reset state when map is closed
      console.log('MapView: Resetting map state');
      setMapInstance(null);
      setIsLoading(true);
      setError(null);
    }
    
    return () => {
      isMounted = false;
    };
  }, [isOpen, mapInstance]);

  const initializeMap = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Initializing map...');
      const googleMapsService = new GoogleMapsService();
      const map = await googleMapsService.initializeMap(mapRef.current);
      
      // Solo agregar marcador si no es un mapa demo
      if (!map.isDemoMap) {
        console.log('Adding marker to Google Maps...');
        await googleMapsService.addMarker(map, {
          position: { lat: -33.4373, lng: -70.6506 }, // Coordenadas aproximadas de Monjitas 565
          title: "Monjitas 565, Santiago, Chile",
          info: "Ubicación de referencia"
        });
      } else {
        console.log('Demo map created successfully');
      }

      setMapInstance(map);
      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError(err.message || 'Error desconocido al cargar el mapa');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="map-fullscreen-overlay">
      <div className="map-fullscreen-container">
        <div className="map-header">
          <h2>Mapa de Beneficios</h2>
          <button 
            className="close-map"
            onClick={onClose}
            title="Cerrar mapa"
          >
            ×
          </button>
        </div>
        
        <div className="map-content">
          {isLoading && (
            <div className="map-loading">
              <div className="map-spinner"></div>
              <p>Cargando mapa...</p>
            </div>
          )}
          
          {error && (
            <div className="map-error">
              <span className="error-icon">⚠️</span>
              <h3>Error al cargar el mapa</h3>
              <p>{error}</p>
              <button onClick={initializeMap} className="retry-button">
                Reintentar
              </button>
            </div>
          )}
          
          <div 
            ref={mapRef} 
            className="google-map-container"
            style={{ 
              width: '100%', 
              height: '100%',
              display: isLoading || error ? 'none' : 'block'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MapView;