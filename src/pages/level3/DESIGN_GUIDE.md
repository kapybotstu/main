# Guía de Diseño - Nivel 3 Jobby

## 🎨 Sistema de Border Radius Unificado

### Variables CSS Estandarizadas

Utiliza **SIEMPRE** estas variables CSS en lugar de valores hardcoded:

```css
--radius-sm: 8px    /* Elementos pequeños: badges, pills, chips */
--radius-md: 15px   /* Elementos medianos: botones, inputs, cards pequeñas */
--radius-lg: 20px   /* Elementos principales: cards, modales, contenedores */
--radius-xl: 25px   /* Elementos especiales: hero sections, destacados */
--radius-full: 9999px /* Elementos circulares: avatars, pills, indicadores */
```

### Jerarquía Visual por Componente

#### 🏆 Elementos Principales
- **Cards principales**: `var(--radius-lg)` - 20px
- **Modales**: `var(--radius-xl)` - 25px
- **Hero sections**: `var(--radius-xl)` - 25px

#### 🔘 Elementos Interactivos
- **Botones primarios**: `var(--radius-md)` - 15px
- **Botones CTA**: `var(--radius-full)` - circular
- **Inputs/Forms**: `var(--radius-md)` - 15px

#### 🏷️ Elementos Secundarios
- **Badges/Status**: `var(--radius-sm)` - 8px
- **Tags/Categories**: `var(--radius-sm)` - 8px
- **Small pills**: `var(--radius-md)` - 15px

#### ⭕ Elementos Circulares
- **Avatars**: `var(--radius-full)`
- **Icon buttons**: `var(--radius-full)`
- **Progress indicators**: `var(--radius-full)`

## 📐 Reglas de Aplicación

### ✅ HACER
```css
/* ✅ Correcto */
.card {
  border-radius: var(--radius-lg);
}

.button-primary {
  border-radius: var(--radius-md);
}

.status-badge {
  border-radius: var(--radius-sm);
}
```

### ❌ NO HACER
```css
/* ❌ Incorrecto */
.card {
  border-radius: 20px; /* Usar variable */
}

.button {
  border-radius: 12px; /* Usar var(--radius-md) */
}

.badge {
  border-radius: 6px; /* Usar var(--radius-sm) */
}
```

## 🎯 Casos de Uso Específicos

### Dashboard Components
- **Token cards**: `var(--radius-lg)`
- **Achievement items**: `var(--radius-md)`
- **Navigation cards**: `var(--radius-lg)`

### Benefits Components
- **Benefit cards**: `var(--radius-lg)`
- **Filter buttons**: `var(--radius-lg)`
- **Modal overlays**: `var(--radius-xl)`
- **Category pills**: `var(--radius-sm)`

### Form Elements
- **Input fields**: `var(--radius-md)`
- **Textareas**: `var(--radius-md)`
- **Submit buttons**: `var(--radius-md)`

## 🔄 Migración Completada

Los siguientes archivos han sido actualizados para usar el sistema unificado:

- ✅ `/styles/pages/Dashboard.css`
- ✅ `/styles/pages/AvailableBenefits.css`
- ✅ `/styles/components/card.css`

## 🚀 Para Futuras Iteraciones

### Antes de añadir nuevos componentes:

1. **Identifica el tipo de elemento** (principal, interactivo, secundario, circular)
2. **Consulta la jerarquía** definida arriba
3. **Usa la variable CSS** correspondiente
4. **NO uses valores hardcoded** como `20px`, `15px`, etc.

### Checklist de Revisión:

- [ ] ¿Usa variables CSS en lugar de valores fijos?
- [ ] ¿Respeta la jerarquía visual establecida?
- [ ] ¿Es consistente con elementos similares?
- [ ] ¿Mejora la experiencia de usuario?

## 📱 Responsive Considerations

Las variables CSS se mantienen iguales en todos los breakpoints para consistencia visual. Si necesitas ajustes específicos para mobile, considera usar las mismas variables pero aplicarlas diferente:

```css
@media (max-width: 768px) {
  .card-large {
    border-radius: var(--radius-md); /* Reduce de lg a md en mobile */
  }
}
```

## 🎨 Extensiones Futuras

Si necesitas nuevos tamaños de radius:

1. **Añádelos a variables.css** siguiendo el patrón
2. **Actualiza esta guía** con los nuevos casos de uso
3. **Mantén la consistencia** con el sistema existente

---

**Fecha**: $(date)  
**Versión**: 1.0  
**Estado**: ✅ Implementado