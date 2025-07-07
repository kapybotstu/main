# Cascade Module

Este módulo implementa un diseño tipo "Masonry" (cascading grid) para mostrar beneficios de manera visual y atractiva.

## Estructura de Archivos

```
cascade/
├── index.js              # Componente principal de Cascade
├── components/           # Componentes específicos de Cascade
│   ├── BenefitCard.js           # Card individual de beneficio
│   ├── BenefitCard.css          # Estilos del card
│   ├── BenefitMasonryGrid.js    # Grid tipo masonry
│   ├── BenefitMasonryGrid.css   # Estilos del grid
│   └── index.js                 # Exports de componentes
├── styles/              # Estilos específicos de Cascade
│   └── index.css        # Estilos principales
├── mockData.js          # Datos de prueba para beneficios
└── README.md            # Este archivo
```

## Características del Diseño

### BenefitCard
- **Esquinas redondeadas**: 24px border-radius para efecto "flotante"
- **Gradientes vibrantes**: Overlay semitransparente sobre imagen de fondo
- **Badge de categoría**: Circular con backdrop-filter blur
- **Información del beneficio**: Título, descripción y proveedor en blanco
- **Footer interactivo**: Contador de tokens y botón de canje rojo suave
- **Sombras suaves**: Box-shadow para separación visual

### BenefitMasonryGrid
- **Layout responsivo**: 1-4 columnas según tamaño de pantalla
- **Cards modulares**: Algunos cards "spanean" múltiples columnas
- **Distribución dinámica**: Auto-balance de contenido en columnas
- **Estados de carga**: Spinner y estado vacío incluidos

## Uso

```javascript
import Cascade from '../pages/level3/cascade';
import { BenefitCard, BenefitMasonryGrid } from '../pages/level3/cascade/components';
```

## Responsive Design

- **Desktop (1440px+)**: 4 columnas
- **Laptop (1024px+)**: 3 columnas  
- **Tablet (768px+)**: 2 columnas
- **Mobile (<768px)**: 1 columna

## Datos de Prueba

El archivo `mockData.js` contiene beneficios de ejemplo con:
- Imágenes de Unsplash
- Categorías variadas (Comida, Entretenimiento, Bienestar, etc.)
- Diferentes precios en tokens
- Proveedores simulados

## Desarrollo

Para agregar nuevos componentes:

1. Crear el componente en `/components/`
2. Agregar estilos correspondientes
3. Exportar en `/components/index.js`
4. Importar en el componente principal

## Rutas

- Ruta principal: `/level3/cascade`
- Aparece en el sidebar del nivel 3 con el nombre "Cascade"