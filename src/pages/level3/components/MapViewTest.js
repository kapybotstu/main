import React, { useEffect, useRef } from 'react';
import './MapView.css';

const MapViewTest = ({ isOpen, onClose }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (isOpen && mapRef.current) {
      console.log('Creating test demo map...');
      
      // Pequeño delay para asegurar que el DOM esté listo
      setTimeout(() => {
        // Crear directamente el mapa demo
        const demoMapHTML = `
          <div class="demo-map" style="width: 100%; height: 100%; border: 3px solid blue;">
            <div class="demo-map-header" style="background: white; padding: 1rem; text-align: center;">
              <h3 style="margin: 0; color: #2d3748;">🗺️ Vista Demo del Mapa (Test)</h3>
              <p style="margin: 0.5rem 0 0 0; color: #4a5568;">Monjitas 565, Santiago, Chile</p>
            </div>
            <div class="demo-map-content" style="flex: 1; position: relative; background: linear-gradient(45deg, #f0fff4 25%, #fafafa 25%); background-size: 20px 20px; min-height: 400px;">
              <div class="demo-marker" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 3rem; text-align: center;">
                📍
                <div class="demo-marker-label" style="background: white; color: #2d3748; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem; margin-top: 0.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">Monjitas 565</div>
              </div>
              <div class="demo-streets">
                <div class="demo-street horizontal" style="position: absolute; height: 3px; width: 100%; top: 30%; background: #cbd5e0; opacity: 0.6;"></div>
                <div class="demo-street vertical" style="position: absolute; width: 3px; height: 100%; left: 30%; background: #cbd5e0; opacity: 0.6;"></div>
                <div class="demo-street horizontal" style="position: absolute; height: 3px; width: 100%; top: 70%; background: #cbd5e0; opacity: 0.6;"></div>
                <div class="demo-street vertical" style="position: absolute; width: 3px; height: 100%; left: 70%; background: #cbd5e0; opacity: 0.6;"></div>
              </div>
            </div>
            <div class="demo-map-footer" style="background: rgba(255, 255, 255, 0.95); padding: 1rem; text-align: center;">
              <small style="color: #718096;">📌 Coordenadas: -33.4373, -70.6506</small>
            </div>
          </div>
        `;
        
        mapRef.current.innerHTML = demoMapHTML;
        console.log('Test demo map HTML set, container:', mapRef.current);
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="map-fullscreen-overlay">
      <div className="map-fullscreen-container">
        <div className="map-header">
          <h2>Mapa de Beneficios (Test)</h2>
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
            className="google-map-container"
            style={{ 
              width: '100%', 
              height: '100%',
              border: '2px solid red', // Para debuggear
              minHeight: '500px'
            }}
          >
            {/* El contenido será reemplazado por JavaScript */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapViewTest;