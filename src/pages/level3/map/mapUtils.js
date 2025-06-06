/**
 * Utilidades para el mapa de beneficios
 * Este archivo contendrá las funciones y constantes para manejar el mapa
 */

// Configuración del mapa
export const MAP_CONFIG = {
  defaultZoom: 13,
  defaultCenter: {
    lat: -33.4489, // Santiago, Chile
    lng: -70.6693
  },
  styles: {
    // Estilos personalizados del mapa (futuro)
  }
};

// Tipos de marcadores para beneficios
export const MARKER_TYPES = {
  RESTAURANT: 'restaurant',
  ENTERTAINMENT: 'entertainment',
  WELLNESS: 'wellness',
  SHOPPING: 'shopping',
  EDUCATION: 'education',
  TRAVEL: 'travel'
};

// Iconos para cada tipo de beneficio
export const MARKER_ICONS = {
  [MARKER_TYPES.RESTAURANT]: '🍽️',
  [MARKER_TYPES.ENTERTAINMENT]: '🎭',
  [MARKER_TYPES.WELLNESS]: '💪',
  [MARKER_TYPES.SHOPPING]: '🛍️',
  [MARKER_TYPES.EDUCATION]: '📚',
  [MARKER_TYPES.TRAVEL]: '✈️'
};

/**
 * Convierte beneficios a marcadores del mapa
 * @param {Array} benefits - Array de beneficios
 * @returns {Array} - Array de marcadores para el mapa
 */
export const convertBenefitsToMarkers = (benefits) => {
  return benefits
    .filter(benefit => benefit.location && benefit.location.lat && benefit.location.lng)
    .map(benefit => ({
      id: benefit.id,
      position: {
        lat: benefit.location.lat,
        lng: benefit.location.lng
      },
      title: benefit.name,
      description: benefit.description,
      type: benefit.category || MARKER_TYPES.ENTERTAINMENT,
      icon: MARKER_ICONS[benefit.category] || MARKER_ICONS[MARKER_TYPES.ENTERTAINMENT],
      tokenCost: benefit.tokenCost || 0,
      image: benefit.image
    }));
};

/**
 * Filtra marcadores por tipo
 * @param {Array} markers - Array de marcadores
 * @param {string} type - Tipo de marcador a filtrar
 * @returns {Array} - Marcadores filtrados
 */
export const filterMarkersByType = (markers, type) => {
  if (!type || type === 'all') return markers;
  return markers.filter(marker => marker.type === type);
};

/**
 * Calcula el centro del mapa basado en los marcadores
 * @param {Array} markers - Array de marcadores
 * @returns {Object} - Coordenadas del centro
 */
export const calculateMapCenter = (markers) => {
  if (!markers || markers.length === 0) {
    return MAP_CONFIG.defaultCenter;
  }

  const bounds = markers.reduce(
    (acc, marker) => ({
      minLat: Math.min(acc.minLat, marker.position.lat),
      maxLat: Math.max(acc.maxLat, marker.position.lat),
      minLng: Math.min(acc.minLng, marker.position.lng),
      maxLng: Math.max(acc.maxLng, marker.position.lng)
    }),
    {
      minLat: Infinity,
      maxLat: -Infinity,
      minLng: Infinity,
      maxLng: -Infinity
    }
  );

  return {
    lat: (bounds.minLat + bounds.maxLat) / 2,
    lng: (bounds.minLng + bounds.maxLng) / 2
  };
};