# Módulo de Mapa - Nivel 3

Este módulo contiene toda la funcionalidad relacionada con el mapa de beneficios en el nivel 3.

## Estructura

```
map/
├── index.js           # Exportaciones principales del módulo
├── mapUtils.js        # Utilidades y configuración del mapa
├── useMapData.js      # Hook personalizado para datos del mapa
└── README.md          # Este archivo
```

## Componentes

### MapView
- **Ubicación**: `../components/MapView.js`
- **Descripción**: Componente principal del mapa en pantalla completa
- **Props**:
  - `isOpen`: Boolean - Estado de visibilidad del mapa
  - `onClose`: Function - Callback para cerrar el mapa

## Utilidades

### mapUtils.js
Contiene funciones y constantes para el manejo del mapa:
- `MAP_CONFIG`: Configuración predeterminada del mapa
- `MARKER_TYPES`: Tipos de marcadores disponibles
- `MARKER_ICONS`: Iconos para cada tipo de marcador
- `convertBenefitsToMarkers()`: Convierte beneficios a marcadores
- `filterMarkersByType()`: Filtra marcadores por tipo
- `calculateMapCenter()`: Calcula el centro del mapa

### useMapData.js
Hook personalizado que maneja el estado del mapa:
- Estado de marcadores
- Marcador seleccionado
- Centro del mapa
- Filtros activos
- Funciones de manejo de eventos

## Uso

```javascript
import { MapView, useMapData } from './map';

// En el componente
const { markers, selectedMarker, handleMarkerClick } = useMapData(benefits);

// Renderizar
<MapView isOpen={showMap} onClose={() => setShowMap(false)} />
```

## Google Maps Integration

### Configuración

1. **Obtener API Key de Google Maps**:
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Habilita la API de Google Maps JavaScript
   - Crea una API key
   - Agrega la key al archivo `.env`:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
   ```

2. **Modo Demo**: 
   - Si no hay API key configurada, se muestra un mapa demo
   - Incluye marcador animado en Monjitas 565, Santiago
   - Diseño responsivo y soporte para modo oscuro

### Funcionalidades Actuales

- ✅ **Mapa de Google Maps** con marcador en Monjitas 565, Santiago, Chile
- ✅ **Vista demo** cuando no hay API key disponible
- ✅ **Estados de carga** y manejo de errores
- ✅ **Estilos personalizados** del mapa
- ✅ **Info windows** con información del marcador
- ✅ **Soporte para modo oscuro**
- ✅ **Diseño responsivo**

### Coordenadas

- **Monjitas 565, Santiago, Chile**: `-33.4373, -70.6506`
- **Zoom predeterminado**: 15
- **Tipo de mapa**: Roadmap

## Futuras Implementaciones

1. **Múltiples marcadores de beneficios**
2. **Filtros por categoría**
3. **Rutas y direcciones**
4. **Geolocalización del usuario**
5. **Clustering de marcadores**
6. **Integración con lugares de Google**