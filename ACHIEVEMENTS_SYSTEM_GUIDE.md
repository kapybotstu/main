# SISTEMA DE LOGROS JOBBY - GUÍA COMPLETA PARA LLM

## RESUMEN EJECUTIVO
El sistema de logros de Jobby detecta automáticamente patrones de uso de tokens y otorga recompensas a los usuarios. Funciona en tiempo real analizando la base de datos Firebase.

## ESTRUCTURA DE DATOS EN FIREBASE

### 1. Reglas de Logros (`achievements/`)
```json
{
  "achievements": {
    "rule_id_123": {
      "name": "Canjeo Conjunto",
      "description": "2 usuarios canjean en el mismo proveedor en 40 minutos",
      "condition": {
        "type": "same_provider_timeframe",
        "value": 40,
        "minUsers": 2
      },
      "rewards": {
        "tokens": 5
      },
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z",
      "createdBy": "admin_user_id"
    }
  }
}
```

### 2. Logros Otorgados (`user_achievements/`)
```json
{
  "user_achievements": {
    "user_id_456": {
      "achievement_id_789": {
        "ruleId": "rule_id_123",
        "ruleName": "Canjeo Conjunto",
        "userId": "user_id_456",
        "grantedAt": "2024-01-15T14:35:00Z",
        "context": {
          "concurrentTokens": 2,
          "providerId": "provider_id_abc",
          "timeframe": 40
        },
        "tokenId": "token_that_triggered_achievement",
        "rewardTokens": 5
      }
    }
  }
}
```

### 3. Recompensas de Tokens (`user_token_bonuses/`)
```json
{
  "user_token_bonuses": {
    "user_id_456": {
      "bonus_id_101": {
        "amount": 5,
        "reason": "achievement_reward",
        "grantedAt": "2024-01-15T14:35:00Z"
      }
    }
  }
}
```

## TIPOS DE REGLAS DISPONIBLES

### 1. `same_provider_timeframe` - Canjeo Conjunto por Tiempo
**Descripción**: Detecta cuando X usuarios canjean tokens en el mismo proveedor dentro de Y minutos.

**Configuración**:
```json
{
  "condition": {
    "type": "same_provider_timeframe",
    "value": 40,        // Minutos máximo entre canjeos
    "minUsers": 2       // Mínimo usuarios requeridos
  }
}
```

**Ejemplo**: 2 usuarios canjean en McDonald's dentro de 40 minutos → Ambos reciben logro.

### 2. `tokens_used_count` - Tokens Utilizados Total
**Descripción**: Usuario que ha usado X tokens en total.

**Configuración**:
```json
{
  "condition": {
    "type": "tokens_used_count",
    "value": 10         // Cantidad de tokens requeridos
  }
}
```

### 3. `weekend_usage` - Uso en Fin de Semana
**Descripción**: Usuario que canjea tokens en sábado o domingo.

**Configuración**:
```json
{
  "condition": {
    "type": "weekend_usage"
  }
}
```

### 4. `first_company_user` - Primer Usuario de Empresa
**Descripción**: Primer usuario de una empresa en usar el sistema.

**Configuración**:
```json
{
  "condition": {
    "type": "first_company_user"
  }
}
```

## CÓMO FUNCIONA LA DETECCIÓN AUTOMÁTICA

### Flujo de Procesamiento:
1. **Trigger**: Un token cambia a estado `"used"` en `benefit_tokens/`
2. **Enriquecimiento**: Se obtienen datos del usuario, empresa, proveedor
3. **Evaluación**: Se evalúa contra todas las reglas activas
4. **Otorgamiento**: Si se cumple una regla, se otorga el logro
5. **Recompensa**: Se agregan tokens bonus si corresponde

### Código de Ejemplo - Detección:
```javascript
// El servicio escucha cambios en benefit_tokens
onValue(tokensRef, (snapshot) => {
  snapshot.forEach((childSnapshot) => {
    const token = childSnapshot.val();
    
    // Solo procesar tokens recién utilizados
    if (token.status === 'used' && token.usedAt) {
      this.processTokenUsage(token);
    }
  });
});
```

## CONSULTAS PARA VER LOGROS

### 1. Ver Logros de un Usuario Específico
```javascript
import { ref, get } from 'firebase/database';

async function getUserAchievements(userId) {
  const userAchievementsRef = ref(database, `user_achievements/${userId}`);
  const snapshot = await get(userAchievementsRef);
  
  if (snapshot.exists()) {
    const achievements = [];
    snapshot.forEach((childSnapshot) => {
      achievements.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    return achievements;
  }
  
  return [];
}
```

### 2. Ver Todas las Reglas Activas
```javascript
async function getActiveRules() {
  const rulesRef = ref(database, 'achievements');
  const snapshot = await get(rulesRef);
  
  const activeRules = [];
  if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
      const rule = { id: childSnapshot.key, ...childSnapshot.val() };
      if (rule.status === 'active') {
        activeRules.push(rule);
      }
    });
  }
  
  return activeRules;
}
```

### 3. Ver Logros Recientes (Últimos 7 días)
```javascript
async function getRecentAchievements(days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const allUsersRef = ref(database, 'user_achievements');
  const snapshot = await get(allUsersRef);
  
  const recentAchievements = [];
  
  if (snapshot.exists()) {
    snapshot.forEach((userSnapshot) => {
      const userId = userSnapshot.key;
      
      userSnapshot.forEach((achievementSnapshot) => {
        const achievement = achievementSnapshot.val();
        const grantedAt = new Date(achievement.grantedAt);
        
        if (grantedAt >= cutoffDate) {
          recentAchievements.push({
            ...achievement,
            achievementId: achievementSnapshot.key,
            userId
          });
        }
      });
    });
  }
  
  return recentAchievements.sort((a, b) => 
    new Date(b.grantedAt) - new Date(a.grantedAt)
  );
}
```

### 4. Estadísticas de Logros
```javascript
async function getAchievementStats() {
  const usersRef = ref(database, 'user_achievements');
  const snapshot = await get(usersRef);
  
  const stats = {
    totalUsers: 0,
    totalAchievements: 0,
    achievementsByRule: {},
    tokensAwarded: 0
  };
  
  if (snapshot.exists()) {
    snapshot.forEach((userSnapshot) => {
      stats.totalUsers++;
      
      userSnapshot.forEach((achievementSnapshot) => {
        const achievement = achievementSnapshot.val();
        stats.totalAchievements++;
        
        // Contar por regla
        const ruleName = achievement.ruleName;
        if (!stats.achievementsByRule[ruleName]) {
          stats.achievementsByRule[ruleName] = 0;
        }
        stats.achievementsByRule[ruleName]++;
        
        // Sumar tokens otorgados
        stats.tokensAwarded += achievement.rewardTokens || 0;
      });
    });
  }
  
  return stats;
}
```

## COMPONENTE REACT PARA VER LOGROS

### Ejemplo de Componente para Usuario (Nivel 3):
```javascript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const MyAchievements = () => {
  const { currentUser } = useAuth();
  const [achievements, setAchievements] = useState([]);
  
  useEffect(() => {
    if (currentUser?.uid) {
      getUserAchievements(currentUser.uid).then(setAchievements);
    }
  }, [currentUser]);
  
  return (
    <div>
      <h2>Mis Logros</h2>
      {achievements.length === 0 ? (
        <p>No tienes logros aún</p>
      ) : (
        achievements.map((achievement) => (
          <div key={achievement.id} className="achievement-card">
            <h3>{achievement.ruleName}</h3>
            <p>Obtenido: {new Date(achievement.grantedAt).toLocaleDateString()}</p>
            <p>Recompensa: +{achievement.rewardTokens} tokens</p>
          </div>
        ))
      )}
    </div>
  );
};
```

## RUTAS DE ACCESO EN LA APLICACIÓN

### Para Administradores (Nivel 1):
- **URL**: `/level1/achievements`
- **Componente**: `AchievementsManagement.js`
- **Funciones**: Crear reglas, ver estadísticas, análisis

### Para Usuarios (Nivel 3):
- **URL**: `/level3/achievements` (a implementar)
- **Componente**: `MyAchievements.js` (a implementar)
- **Funciones**: Ver logros obtenidos, progreso

## COMANDOS FRECUENTES PARA LLM

### Crear nueva regla desde código:
```javascript
import { ref, push } from 'firebase/database';

const newRule = {
  name: "Nombre del logro",
  description: "Descripción detallada",
  condition: {
    type: "same_provider_timeframe",
    value: 40,
    minUsers: 2
  },
  rewards: { tokens: 5 },
  status: "active",
  createdAt: new Date().toISOString(),
  createdBy: "admin_user_id"
};

await push(ref(database, 'achievements'), newRule);
```

### Verificar si usuario tiene un logro específico:
```javascript
async function userHasAchievement(userId, ruleId) {
  const userAchievementsRef = ref(database, `user_achievements/${userId}`);
  const snapshot = await get(userAchievementsRef);
  
  if (snapshot.exists()) {
    let hasAchievement = false;
    snapshot.forEach((childSnapshot) => {
      const achievement = childSnapshot.val();
      if (achievement.ruleId === ruleId) {
        hasAchievement = true;
      }
    });
    return hasAchievement;
  }
  
  return false;
}
```

## DEBUGGING Y MONITOREO

### Ver logs del sistema:
```javascript
// El servicio imprime logs automáticamente:
console.log(`Logro otorgado: ${rule.name} a usuario ${userId}`);
```

### Verificar reglas activas:
```javascript
// En la consola del navegador:
import achievementsService from './services/achievementsService';
console.log(achievementsService.activeRules);
```

---

**NOTA IMPORTANTE**: El sistema funciona automáticamente. Las reglas se evalúan en tiempo real cuando los usuarios usan tokens. Los logros se otorgan instantáneamente y las recompensas se aplican automáticamente.