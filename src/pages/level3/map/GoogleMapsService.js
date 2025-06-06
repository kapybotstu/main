/**
 * Servicio para manejar Google Maps
 */

class GoogleMapsService {
  constructor() {
    this.googleMaps = null;
    this.apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'demo'; // Usaremos demo por ahora
  }

  /**
   * Carga la API de Google Maps
   */
  async loadGoogleMapsAPI() {
    // Si ya está cargada, la retornamos
    if (window.google && window.google.maps) {
      console.log('Google Maps API already loaded');
      return window.google.maps;
    }

    // Si no hay API key válida, lanzar error
    if (this.apiKey === 'demo') {
      throw new Error('Google Maps API key no configurada');
    }

    console.log('Loading Google Maps API...');
    return new Promise((resolve, reject) => {
      // Verificar si ya hay un script cargándose
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Esperar a que termine de cargar
        existingScript.onload = () => {
          if (window.google && window.google.maps) {
            resolve(window.google.maps);
          } else {
            reject(new Error('Error al cargar Google Maps API'));
          }
        };
        return;
      }

      // Crear script para cargar Google Maps
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('Google Maps script loaded');
        if (window.google && window.google.maps) {
          resolve(window.google.maps);
        } else {
          reject(new Error('Error al cargar Google Maps API'));
        }
      };

      script.onerror = (error) => {
        console.error('Error loading Google Maps script:', error);
        reject(new Error('Error al cargar el script de Google Maps'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Inicializa el mapa
   */
  async initializeMap(container) {
    // Si no hay API key, ir directo al demo
    if (this.apiKey === 'demo') {
      console.log('No Google Maps API key found, using demo map');
      return this.createDemoMap(container);
    }

    try {
      this.googleMaps = await this.loadGoogleMapsAPI();
      
      const mapOptions = {
        center: { lat: -33.4373, lng: -70.6506 }, // Monjitas 565, Santiago
        zoom: 15,
        mapTypeId: this.googleMaps.MapTypeId.ROADMAP,
        styles: this.getMapStyles(),
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true
      };

      const map = new this.googleMaps.Map(container, mapOptions);
      return map;
    } catch (error) {
      console.error('Error loading Google Maps, falling back to demo:', error);
      // Si falla, crear un mapa demo
      return this.createDemoMap(container);
    }
  }

  /**
   * Agrega un marcador al mapa
   */
  async addMarker(map, markerData) {
    if (!this.googleMaps || !map) {
      console.warn('Google Maps no disponible para agregar marcador');
      return null;
    }

    const marker = new this.googleMaps.Marker({
      position: markerData.position,
      map: map,
      title: markerData.title,
      animation: this.googleMaps.Animation.DROP
    });

    // Agregar info window si hay información
    if (markerData.info) {
      const infoWindow = new this.googleMaps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 5px 0; color: #2d3748;">${markerData.title}</h3>
            <p style="margin: 0; color: #4a5568;">${markerData.info}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    }

    return marker;
  }

  /**
   * Crea un mapa demo cuando Google Maps no está disponible
   */
  createDemoMap(container) {
    console.log('Creating demo map in container:', container);
    
    // Limpiar el container
    container.innerHTML = '';
    
    // Crear un div que simule un mapa
    const demoMapHTML = `
      <div class="demo-map">
        <div class="demo-map-header">
          <h3>🗺️ Vista Demo del Mapa</h3>
          <p>Monjitas 565, Santiago, Chile</p>
        </div>
        <div class="demo-map-content">
          <div class="demo-marker">
            📍
            <div class="demo-marker-label">Monjitas 565</div>
          </div>
          <div class="demo-streets">
            <div class="demo-street horizontal"></div>
            <div class="demo-street vertical"></div>
            <div class="demo-street horizontal" style="top: 70%;"></div>
            <div class="demo-street vertical" style="left: 70%;"></div>
          </div>
        </div>
        <div class="demo-map-footer">
          <small>📌 Coordenadas: -33.4373, -70.6506</small>
        </div>
      </div>
    `;
    
    container.innerHTML = demoMapHTML;
    console.log('Demo map HTML created successfully');

    return {
      isDemoMap: true,
      container: container
    };
  }

  /**
   * Estilos personalizados para el mapa
   */
  getMapStyles() {
    return [
      {
        "featureType": "all",
        "elementType": "geometry.fill",
        "stylers": [{"weight": "2.00"}]
      },
      {
        "featureType": "all",
        "elementType": "geometry.stroke",
        "stylers": [{"color": "#9c9c9c"}]
      },
      {
        "featureType": "all",
        "elementType": "labels.text",
        "stylers": [{"visibility": "on"}]
      },
      {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [{"color": "#f2f2f2"}]
      },
      {
        "featureType": "landscape",
        "elementType": "geometry.fill",
        "stylers": [{"color": "#ffffff"}]
      },
      {
        "featureType": "landscape.man_made",
        "elementType": "geometry.fill",
        "stylers": [{"color": "#ffffff"}]
      },
      {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [{"visibility": "off"}]
      },
      {
        "featureType": "road",
        "elementType": "all",
        "stylers": [{"saturation": -100}, {"lightness": 45}]
      },
      {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [{"color": "#eeeeee"}]
      },
      {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{"color": "#7b7b7b"}]
      },
      {
        "featureType": "road",
        "elementType": "labels.text.stroke",
        "stylers": [{"color": "#ffffff"}]
      },
      {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [{"visibility": "simplified"}]
      },
      {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [{"visibility": "off"}]
      },
      {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [{"visibility": "off"}]
      },
      {
        "featureType": "water",
        "elementType": "all",
        "stylers": [{"color": "#46bcec"}, {"visibility": "on"}]
      },
      {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [{"color": "#c8d7d4"}]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [{"color": "#070707"}]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.stroke",
        "stylers": [{"color": "#ffffff"}]
      }
    ];
  }
}

export { GoogleMapsService };