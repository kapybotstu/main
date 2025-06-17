import React, { useEffect, useRef } from 'react';
import './MapView.css';

// ################################################################################
// ### GOOGLE MAPS COMPONENT - REQUIERE API KEY CONFIGURADA                   ###
// ### Archivo de configuración: .env                                          ###
// ### Variable requerida: REACT_APP_GOOGLE_MAPS_API_KEY                      ###
// ################################################################################

const SimpleGoogleMap = ({ isOpen, onClose }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Agregar un pequeño delay para asegurar que el DOM esté listo
      const timeoutId = setTimeout(() => {
        if (mapRef.current) {
          loadGoogleMapsAndInitialize();
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  const loadGoogleMapsAndInitialize = () => {
    // Verificar si ya existe Google Maps
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // ################################################################################
    // ### IMPORTANTE: CONFIGURAR API KEY DE GOOGLE MAPS                           ###
    // ### 1. Ve a: https://console.cloud.google.com/                             ###
    // ### 2. Habilita Google Maps JavaScript API                                 ###
    // ### 3. Crea una API key                                                    ###
    // ### 4. Agrega al archivo .env: REACT_APP_GOOGLE_MAPS_API_KEY=tu_api_key   ###
    // ################################################################################
    
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    // ### VERIFICAR SI HAY API KEY CONFIGURADA ###
    if (!apiKey || apiKey === 'TU_API_KEY_AQUI') {
      console.warn('⚠️  API KEY DE GOOGLE MAPS NO CONFIGURADA');
      showApiKeyWarning();
      return;
    }

    // Cargar Google Maps directamente
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;

    // Función global para el callback
    window.initMap = initializeMap;

    // Agregar el script al DOM
    document.head.appendChild(script);
  };

  const showApiKeyWarning = () => {
    if (!mapRef.current) return;
    
    mapRef.current.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white;
        text-align: center;
        padding: 2rem;
        border-radius: 8px;
      ">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🗺️</div>
        <h2 style="margin: 0 0 1rem 0; font-size: 1.5rem;">API Key de Google Maps Requerida</h2>
        <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <h3 style="margin: 0 0 1rem 0; color: #ffd700;">### PASOS PARA CONFIGURAR ###</h3>
          <ol style="text-align: left; margin: 0; padding-left: 1.5rem;">
            <li>Ve a <strong>console.cloud.google.com</strong></li>
            <li>Habilita <strong>Google Maps JavaScript API</strong></li>
            <li>Crea una <strong>API Key</strong></li>
            <li>Agrega al archivo <strong>.env</strong>:</li>
          </ol>
          <code style="
            display: block;
            background: rgba(0,0,0,0.3);
            padding: 0.5rem;
            margin: 0.5rem 0;
            border-radius: 4px;
            font-family: monospace;
          ">REACT_APP_GOOGLE_MAPS_API_KEY=tu_api_key_aqui</code>
          <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">5. Reinicia el servidor con <strong>npm start</strong></p>
        </div>
        <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px;">
          <p style="margin: 0; font-size: 0.9rem;">📍 <strong>Ubicación objetivo:</strong> Monjitas 565, Santiago, Chile</p>
          <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; opacity: 0.8;">Coordenadas: -33.4373, -70.6506</p>
        </div>
      </div>
    `;
  };

  const initializeMap = () => {
    // Verificaciones más robustas
    if (!mapRef.current) {
      console.error('Map container ref is null');
      return;
    }
    
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not loaded');
      return;
    }

    // Verificar que el elemento DOM existe y está en el DOM
    if (!document.contains(mapRef.current)) {
      console.error('Map container element is not in the DOM');
      return;
    }

    console.log('Google Maps loaded, initializing map...');
    
    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: -33.4373, lng: -70.6506 }, // Monjitas 565, Santiago
        zoom: 15,
        mapTypeId: 'roadmap'
      });

      // Agregar marcador
      const marker = new window.google.maps.Marker({
        position: { lat: -33.4373, lng: -70.6506 },
        map: map,
        title: 'Monjitas 565, Santiago, Chile',
        animation: window.google.maps.Animation.DROP
      });

      // Info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 5px 0; color: #2d3748;">Monjitas 565</h3>
            <p style="margin: 0; color: #4a5568;">Santiago, Chile</p>
            <small style="color: #718096;">📌 -33.4373, -70.6506</small>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      console.log('Google Maps initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="map-fullscreen-overlay">
      <div className="map-fullscreen-container">
        <div className="map-header">
          <h2>Google Maps - Monjitas 565</h2>
          <button 
            className="close-map"
            onClick={onClose}
            title="Cerrar mapa"
          >
            ×
          </button>
        </div>
        
        <div className="map-content">
          <div 
            ref={mapRef} 
            style={{ 
              width: '100%', 
              height: '100%',
              minHeight: '600px'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SimpleGoogleMap;