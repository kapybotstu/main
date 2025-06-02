import { ref, push, onValue, get, query, orderByChild, equalTo, limitToLast } from 'firebase/database';
import { database } from './firebase/config';

class AchievementsService {
  constructor() {
    this.activeRules = [];
    this.recentTokenUsage = new Map(); // Cache para análisis rápido
    this.init();
  }

  async init() {
    // Cargar reglas activas
    await this.loadActiveRules();
    
    // Escuchar cambios en tokens para procesamiento en tiempo real
    this.listenToTokenUsage();
  }

  async loadActiveRules() {
    try {
      const rulesRef = ref(database, 'achievements');
      const snapshot = await get(rulesRef);
      
      if (snapshot.exists()) {
        this.activeRules = [];
        snapshot.forEach((childSnapshot) => {
          const rule = { id: childSnapshot.key, ...childSnapshot.val() };
          if (rule.status === 'active') {
            this.activeRules.push(rule);
          }
        });
      }
    } catch (error) {
      console.error('Error cargando reglas de logros:', error);
    }
  }

  listenToTokenUsage() {
    const tokensRef = ref(database, 'benefit_tokens');
    
    onValue(tokensRef, (snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const token = { id: childSnapshot.key, ...childSnapshot.val() };
          
          // Solo procesar tokens recién utilizados
          if (token.status === 'used' && token.usedAt) {
            this.processTokenUsage(token);
          }
        });
      }
    });
  }

  async processTokenUsage(token) {
    try {
      // Obtener datos completos del token
      const tokenData = await this.enrichTokenData(token);
      
      // Procesar cada regla activa
      for (const rule of this.activeRules) {
        await this.checkRule(rule, tokenData);
      }
    } catch (error) {
      console.error('Error procesando uso de token:', error);
    }
  }

  async enrichTokenData(token) {
    try {
      // Obtener datos de la solicitud
      const requestRef = ref(database, `benefit_requests/${token.requestId}`);
      const requestSnapshot = await get(requestRef);
      const requestData = requestSnapshot.val();

      // Obtener datos del usuario
      const userRef = ref(database, `users/${requestData.userId}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();

      return {
        ...token,
        requestData,
        userData,
        usedAt: new Date(token.usedAt)
      };
    } catch (error) {
      console.error('Error enriqueciendo datos del token:', error);
      return token;
    }
  }

  async checkRule(rule, tokenData) {
    switch (rule.condition.type) {
      case 'same_provider_timeframe':
        await this.checkSameProviderTimeframe(rule, tokenData);
        break;
      case 'tokens_used_count':
        await this.checkTokensUsedCount(rule, tokenData);
        break;
      case 'consecutive_days':
        await this.checkConsecutiveDays(rule, tokenData);
        break;
      case 'first_company_user':
        await this.checkFirstCompanyUser(rule, tokenData);
        break;
      case 'weekend_usage':
        await this.checkWeekendUsage(rule, tokenData);
        break;
    }
  }

  async checkSameProviderTimeframe(rule, tokenData) {
    const { value: timeframeMinutes, minUsers } = rule.condition;
    const { usedBy: providerId, usedAt } = tokenData;
    
    try {
      // Buscar otros tokens usados por el mismo proveedor en el rango de tiempo
      const tokensRef = ref(database, 'benefit_tokens');
      const snapshot = await get(tokensRef);
      
      const concurrentTokens = [];
      const timeThreshold = new Date(usedAt.getTime() - (timeframeMinutes * 60 * 1000));
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const otherToken = childSnapshot.val();
          
          if (otherToken.status === 'used' && 
              otherToken.usedBy === providerId && 
              otherToken.id !== tokenData.id) {
            
            const otherUsedAt = new Date(otherToken.usedAt);
            
            // Verificar si está dentro del rango de tiempo
            if (otherUsedAt >= timeThreshold && otherUsedAt <= usedAt) {
              concurrentTokens.push(otherToken);
            }
          }
        });
      }

      // Si hay suficientes tokens concurrentes, otorgar logro
      if (concurrentTokens.length >= (minUsers - 1)) {
        await this.grantAchievement(rule, tokenData, {
          concurrentTokens: concurrentTokens.length + 1,
          providerId,
          timeframe: timeframeMinutes
        });
      }
    } catch (error) {
      console.error('Error checking same provider timeframe:', error);
    }
  }

  async checkTokensUsedCount(rule, tokenData) {
    const { value: requiredCount } = rule.condition;
    const { userId } = tokenData.requestData;
    
    try {
      // Contar tokens usados por el usuario
      const tokensRef = ref(database, 'benefit_tokens');
      const snapshot = await get(tokensRef);
      
      let userTokenCount = 0;
      
      if (snapshot.exists()) {
        for (const childSnapshot of snapshot.val()) {
          const token = childSnapshot.val();
          
          if (token.status === 'used') {
            // Obtener datos de la solicitud para verificar el usuario
            const requestRef = ref(database, `benefit_requests/${token.requestId}`);
            const requestSnapshot = await get(requestRef);
            const requestData = requestSnapshot.val();
            
            if (requestData && requestData.userId === userId) {
              userTokenCount++;
            }
          }
        }
      }

      if (userTokenCount >= requiredCount) {
        await this.grantAchievement(rule, tokenData, {
          tokenCount: userTokenCount
        });
      }
    } catch (error) {
      console.error('Error checking tokens used count:', error);
    }
  }

  async checkWeekendUsage(rule, tokenData) {
    const { usedAt } = tokenData;
    const dayOfWeek = usedAt.getDay(); // 0 = domingo, 6 = sábado
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      await this.grantAchievement(rule, tokenData, {
        dayOfWeek: dayOfWeek === 0 ? 'domingo' : 'sábado'
      });
    }
  }

  async checkFirstCompanyUser(rule, tokenData) {
    const { companyId } = tokenData.userData;
    
    try {
      // Verificar si es el primer usuario de la empresa en usar tokens
      const tokensRef = ref(database, 'benefit_tokens');
      const snapshot = await get(tokensRef);
      
      let companyTokens = [];
      
      if (snapshot.exists()) {
        for (const childSnapshot of snapshot.val()) {
          const token = childSnapshot.val();
          
          if (token.status === 'used') {
            const requestRef = ref(database, `benefit_requests/${token.requestId}`);
            const requestSnapshot = await get(requestRef);
            const requestData = requestSnapshot.val();
            
            if (requestData) {
              const userRef = ref(database, `users/${requestData.userId}`);
              const userSnapshot = await get(userRef);
              const userData = userSnapshot.val();
              
              if (userData && userData.companyId === companyId) {
                companyTokens.push({
                  ...token,
                  usedAt: new Date(token.usedAt)
                });
              }
            }
          }
        }
      }

      // Ordenar por fecha de uso
      companyTokens.sort((a, b) => a.usedAt - b.usedAt);
      
      // Si este token es el primero, otorgar logro
      if (companyTokens.length > 0 && companyTokens[0].id === tokenData.id) {
        await this.grantAchievement(rule, tokenData, {
          companyId,
          position: 'first'
        });
      }
    } catch (error) {
      console.error('Error checking first company user:', error);
    }
  }

  async grantAchievement(rule, tokenData, context) {
    try {
      const { userId } = tokenData.requestData;
      
      // Verificar si el usuario ya tiene este logro
      const userAchievementsRef = ref(database, `user_achievements/${userId}`);
      const existingSnapshot = await get(userAchievementsRef);
      
      let hasAchievement = false;
      if (existingSnapshot.exists()) {
        existingSnapshot.forEach((childSnapshot) => {
          const achievement = childSnapshot.val();
          if (achievement.ruleId === rule.id) {
            hasAchievement = true;
          }
        });
      }

      if (!hasAchievement) {
        // Otorgar logro
        const achievementData = {
          ruleId: rule.id,
          ruleName: rule.name,
          userId,
          grantedAt: new Date().toISOString(),
          context,
          tokenId: tokenData.id,
          rewardTokens: rule.rewards.tokens || 0
        };

        await push(userAchievementsRef, achievementData);

        // Si hay recompensa en tokens, agregarlos al usuario
        if (rule.rewards.tokens > 0) {
          await this.grantTokenReward(userId, rule.rewards.tokens);
        }

        console.log(`Logro otorgado: ${rule.name} a usuario ${userId}`);
      }
    } catch (error) {
      console.error('Error otorgando logro:', error);
    }
  }

  async grantTokenReward(userId, tokenAmount) {
    try {
      const userTokensRef = ref(database, `user_tokens/${userId}`);
      const snapshot = await get(userTokensRef);
      
      let currentTokens = 0;
      if (snapshot.exists()) {
        const tokenData = snapshot.val();
        currentTokens = (tokenData.currentMonthTokens || 0) + (tokenData.previousMonthTokens || 0);
      }

      // Agregar tokens como bonus
      const bonusTokensRef = ref(database, `user_token_bonuses/${userId}`);
      await push(bonusTokensRef, {
        amount: tokenAmount,
        reason: 'achievement_reward',
        grantedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error otorgando recompensa de tokens:', error);
    }
  }

  // Método para análisis manual desde la interfaz
  async analyzeRecentActivity(days = 7) {
    const results = {
      sameProviderGroups: [],
      weekendUsers: [],
      activeUsers: []
    };

    try {
      const tokensRef = ref(database, 'benefit_tokens');
      const snapshot = await get(tokensRef);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const recentTokens = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const token = childSnapshot.val();
          
          if (token.status === 'used' && token.usedAt) {
            const usedAt = new Date(token.usedAt);
            if (usedAt >= cutoffDate) {
              recentTokens.push({
                id: childSnapshot.key,
                ...token,
                usedAt
              });
            }
          }
        });
      }

      // Analizar patrones
      await this.analyzeProviderGroups(recentTokens, results);
      await this.analyzeWeekendUsage(recentTokens, results);
      
      return results;
    } catch (error) {
      console.error('Error analizando actividad reciente:', error);
      return results;
    }
  }

  async analyzeProviderGroups(tokens, results) {
    const providerGroups = new Map();
    
    for (const token of tokens) {
      const providerId = token.usedBy;
      const hour = token.usedAt.getHours();
      const dateKey = token.usedAt.toDateString();
      
      const key = `${providerId}-${dateKey}-${hour}`;
      
      if (!providerGroups.has(key)) {
        providerGroups.set(key, []);
      }
      
      providerGroups.get(key).push(token);
    }

    // Buscar grupos con múltiples usuarios
    for (const [key, groupTokens] of providerGroups.entries()) {
      if (groupTokens.length >= 2) {
        results.sameProviderGroups.push({
          providerId: groupTokens[0].usedBy,
          count: groupTokens.length,
          tokens: groupTokens,
          timeframe: key
        });
      }
    }
  }

  async analyzeWeekendUsage(tokens, results) {
    for (const token of tokens) {
      const dayOfWeek = token.usedAt.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        results.weekendUsers.push(token);
      }
    }
  }
}

// Instancia singleton
const achievementsService = new AchievementsService();

export default achievementsService;