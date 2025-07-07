# Instructivo: Rutas de Firebase para Solicitudes de Beneficios Jobby

## Estructura de Base de Datos en Firebase

### 1. Ruta Principal de Solicitudes
```
/benefit_requests/
  ├── {requestId}/
  │   ├── userId: "string"              // ID del usuario que solicita (nivel 3)
  │   ├── benefitId: "string"           // ID del beneficio solicitado
  │   ├── benefitName: "string"         // Nombre del beneficio
  │   ├── benefitType: "string"         // Tipo: automatic, managed, third_party
  │   ├── isBenefitJobby: boolean       // true = beneficio Jobby, false = beneficio empresa
  │   ├── status: "string"              // Estados posibles:
  │   │                                 // - pending
  │   │                                 // - pending_admin_approval (requiere gestión nivel 1)
  │   │                                 // - pending_provider_approval
  │   │                                 // - approved
  │   │                                 // - rejected
  │   ├── requestDate: "ISO string"     // Fecha de solicitud
  │   ├── processedDate: "ISO string"   // Fecha de procesamiento (si aplica)
  │   ├── adminId: "string"             // ID del admin que procesó (si aplica)
  │   ├── paidWithTokens: boolean       // Si se pagó con tokens
  │   ├── tokenCost: number             // Cantidad de tokens usados
  │   ├── tokenId: "string"             // ID del token generado (si aplica)
  │   └── companyId: "string"           // ID de empresa (solo para beneficios empresa)
```

## Cómo Detectar Nuevas Solicitudes en Nivel 1

### Listener en Tiempo Real para Solicitudes de Beneficios Jobby

```javascript
// En el componente BenefitRequestsManagement.js (Nivel 1)
const requestsRef = ref(database, 'benefit_requests');

onValue(requestsRef, (snapshot) => {
  if (!snapshot.exists()) return;
  
  const newRequests = [];
  
  snapshot.forEach((childSnapshot) => {
    const requestData = childSnapshot.val();
    
    // FILTRAR SOLO SOLICITUDES DE BENEFICIOS JOBBY
    // Condiciones para incluir una solicitud:
    if (requestData.isBenefitJobby || 
        requestData.status === 'pending_admin_approval') {
      
      newRequests.push({
        id: childSnapshot.key,
        ...requestData
      });
    }
  });
  
  // Ordenar por fecha más reciente
  newRequests.sort((a, b) => 
    new Date(b.requestDate) - new Date(a.requestDate)
  );
});
```

### Estados que Requieren Atención en Nivel 1

1. **`pending`**: Solicitudes tradicionales pendientes de aprobación
2. **`pending_admin_approval`**: Solicitudes de beneficios de terceros que requieren gestión manual

### Flujo de Solicitudes por Tipo de Beneficio

#### 1. Beneficios Automáticos (`type: 'automatic'`)
- Se aprueban instantáneamente al solicitar
- Estado inicial: `approved`
- Token generado automáticamente
- NO requieren intervención del nivel 1

#### 2. Beneficios Gestionados (`type: 'managed'`)
- Requieren aprobación del proveedor (nivel 4)
- Estado inicial: `pending_provider_approval`
- Solo aparecen en nivel 1 si el proveedor las rechaza

#### 3. Beneficios de Terceros (`type: 'third_party'`)
- Requieren gestión manual del administrador
- Estado inicial: `pending_admin_approval`
- SIEMPRE aparecen en nivel 1 para gestión
- El admin debe proporcionar instrucciones de canje

## Información Complementaria en Firebase

### Datos del Beneficio Jobby
```
/jobby_benefits/{benefitId}/
  ├── name: "string"
  ├── title: "string"
  ├── description: "string"
  ├── category: "string"
  ├── type: "automatic|managed|third_party"
  ├── value: "string"
  └── status: "active|inactive"
```

### Datos del Usuario Solicitante
```
/users/{userId}/
  ├── displayName: "string"
  ├── email: "string"
  └── ...otros datos del perfil
```

### Tokens Generados (cuando aplica)
```
/benefit_tokens/{tokenId}/
  ├── requestId: "string"
  ├── tokenCode: "string"
  ├── status: "active|used|expired"
  ├── createdAt: "ISO string"
  ├── expiresAt: "ISO string"
  └── adminInstructions: "string" (solo para third_party)
```

## Notificaciones y Alertas

### Detectar Nuevas Solicitudes Pendientes
```javascript
// Contador de solicitudes pendientes
const pendingCount = newRequests.filter(req => 
  req.status === 'pending' || 
  req.status === 'pending_admin_approval'
).length;

// Mostrar badge o notificación si hay nuevas
if (pendingCount > 0) {
  // Mostrar indicador visual de solicitudes pendientes
}
```

### Priorización de Solicitudes
1. **Alta Prioridad**: `status === 'pending_admin_approval'` (requieren gestión manual)
2. **Media Prioridad**: `status === 'pending'` (solicitudes tradicionales)
3. **Baja Prioridad**: Estados aprobados o rechazados (solo consulta)

## Acciones Disponibles en Nivel 1

### Aprobar Solicitud
```javascript
// Para solicitudes con tokens de terceros
await processTokenPaidRequest(
  requestId, 
  'approved', 
  adminUserId,
  adminInstructions // Instrucciones de cómo canjear el beneficio
);
```

### Rechazar Solicitud
```javascript
await updateBenefitRequest(
  requestId, 
  'rejected', 
  adminUserId
);
```

## Consideraciones Importantes

1. **Tiempo Real**: El listener `onValue` actualiza automáticamente cuando hay cambios
2. **Filtrado**: Solo mostrar solicitudes `isBenefitJobby === true` o que requieran gestión admin
3. **Ordenamiento**: Mostrar primero las más recientes
4. **Estados Críticos**: Priorizar solicitudes con `pending_admin_approval`
5. **Historial**: Las solicitudes procesadas se mantienen para auditoría