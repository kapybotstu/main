import { useState, useEffect } from 'react';
import { convertBenefitsToMarkers, filterMarkersByType } from './mapUtils';

/**
 * Hook personalizado para manejar los datos del mapa
 * @param {Array} benefits - Array de beneficios
 * @returns {Object} - Estado y funciones del mapa
 */
export const useMapData = (benefits = []) => {
  const [markers, setMarkers] = useState([]);
  const [filteredMarkers, setFilteredMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [filterType, setFilterType] = useState('all');

  // Convertir beneficios a marcadores cuando cambien los beneficios
  useEffect(() => {
    const newMarkers = convertBenefitsToMarkers(benefits);
    setMarkers(newMarkers);
  }, [benefits]);

  // Filtrar marcadores cuando cambien los marcadores o el filtro
  useEffect(() => {
    const filtered = filterMarkersByType(markers, filterType);
    setFilteredMarkers(filtered);
  }, [markers, filterType]);

  // Funciones para manejar el mapa
  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  const handleCloseInfoWindow = () => {
    setSelectedMarker(null);
  };

  const handleFilterChange = (newFilter) => {
    setFilterType(newFilter);
  };

  return {
    markers: filteredMarkers,
    selectedMarker,
    mapCenter,
    filterType,
    handleMarkerClick,
    handleCloseInfoWindow,
    handleFilterChange,
    setMapCenter
  };
};