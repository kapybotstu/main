import { 
  ref, 
  set, 
  get, 
  push, 
  update, 
  remove, 
  query, 
  orderByChild, 
  equalTo,
  onValue,
  off 
} from "firebase/database";
import { database } from "../config";

// ===== SERVICIOS PARA EMPRESAS =====

// Crear nueva empresa (nivel 1)
export const createCompany = async (companyData) => {
  try {
    const newCompanyRef = push(ref(database, 'companies'));
    const companyId = newCompanyRef.key;
    
    await set(newCompanyRef, {
      ...companyData,
      createdAt: new Date().toISOString(),
      status: 'active'
    });
    
    return { companyId };
  } catch (error) {
    throw error;
  }
};

// Obtener lista de empresas (nivel 1)
export const getCompanies = async () => {
  try {
    const companiesRef = ref(database, 'companies');
    const snapshot = await get(companiesRef);
    
    const companies = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        companies.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    return companies;
  } catch (error) {
    throw error;
  }
};

// Actualizar empresa (nivel 1)
export const updateCompany = async (companyId, updates) => {
  try {
    const companyRef = ref(database, `companies/${companyId}`);
    await update(companyRef, { 
      ...updates, 
      updatedAt: new Date().toISOString() 
    });
    
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// ===== SERVICIOS PARA BENEFICIOS JOBBY =====

// Crear beneficio Jobby (nivel 1)
export const createJobbyBenefit = async (benefitData) => {
  try {
    const newBenefitRef = push(ref(database, 'jobby_benefits'));
    const benefitId = newBenefitRef.key;
    
    await set(newBenefitRef, {
      ...benefitData,
      type: benefitData.type || 'automatic', // automatic, managed, third_party
      createdAt: new Date().toISOString(),
      status: 'active'
    });
    
    return { benefitId };
  } catch (error) {
    throw error;
  }
};

// Obtener todos los beneficios Jobby
export const getJobbyBenefits = async () => {
  try {
    const benefitsRef = ref(database, 'jobby_benefits');
    const snapshot = await get(benefitsRef);
    
    const benefits = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        benefits.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    return benefits;
  } catch (error) {
    throw error;
  }
};

// ===== SERVICIOS PARA BENEFICIOS INTERNOS DE EMPRESA =====

// Crear beneficio interno (nivel 2)
export const createCompanyBenefit = async (companyId, benefitData) => {
  try {
    const newBenefitRef = push(ref(database, `company_benefits/${companyId}`));
    const benefitId = newBenefitRef.key;
    
    await set(newBenefitRef, {
      ...benefitData,
      createdAt: new Date().toISOString(),
      status: 'active'
    });
    
    return { benefitId };
  } catch (error) {
    throw error;
  }
};

// Obtener beneficios internos de empresa (nivel 2)
export const getCompanyBenefits = async (companyId) => {
  try {
    const benefitsRef = ref(database, `company_benefits/${companyId}`);
    const snapshot = await get(benefitsRef);
    
    const benefits = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        benefits.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    return benefits;
  } catch (error) {
    throw error;
  }
};

// ===== SERVICIOS PARA TOKENS/SOLICITUDES =====

// Solicitar beneficio (nivel 3)
// Canjear experiencia por tokens
export const redeemExperience = async (userId, benefitId, isBenefitJobby, companyId, tokenCost, additionalData = {}) => {
  try {
    // 1. Verificar tokens disponibles del usuario
    const userTokensRef = ref(database, `user_tokens/${userId}`);
    const tokensSnapshot = await get(userTokensRef);
    
    let availableTokens = 0;
    if (tokensSnapshot.exists()) {
      const userTokens = tokensSnapshot.val();
      // Sumar tokens del mes actual y anterior disponibles
      availableTokens = (userTokens.currentMonthTokens || 0) + (userTokens.previousMonthTokens || 0);
    }
    
    // 2. Verificar si tiene suficientes tokens
    if (availableTokens < tokenCost) {
      throw new Error(`No tienes suficientes tokens. Necesitas ${tokenCost} tokens, pero solo tienes ${availableTokens}.`);
    }
    
    // 3. Crear el registro de canje
    const newRedemptionRef = push(ref(database, 'experience_redemptions'));
    const redemptionId = newRedemptionRef.key;
    
    const redemptionData = {
      userId,
      benefitId,
      isBenefitJobby,
      tokenCost,
      status: 'redeemed',
      redemptionDate: new Date().toISOString(),
      redemptionCode: generateRedemptionCode(),
      ...additionalData
    };
    
    if (!isBenefitJobby) {
      redemptionData.companyId = companyId;
    }
    
    // 4. Guardar el canje
    await set(newRedemptionRef, redemptionData);
    
    // 5. Descontar tokens del usuario (priorizar mes anterior primero)
    let remainingCost = tokenCost;
    const updates = {};
    
    if (tokensSnapshot.exists()) {
      const userTokens = tokensSnapshot.val();
      let previousMonthTokens = userTokens.previousMonthTokens || 0;
      let currentMonthTokens = userTokens.currentMonthTokens || 0;
      
      // Descontar primero del mes anterior
      if (remainingCost > 0 && previousMonthTokens > 0) {
        const deductFromPrevious = Math.min(remainingCost, previousMonthTokens);
        updates[`user_tokens/${userId}/previousMonthTokens`] = previousMonthTokens - deductFromPrevious;
        remainingCost -= deductFromPrevious;
      }
      
      // Luego descontar del mes actual si es necesario
      if (remainingCost > 0 && currentMonthTokens > 0) {
        const deductFromCurrent = Math.min(remainingCost, currentMonthTokens);
        updates[`user_tokens/${userId}/currentMonthTokens`] = currentMonthTokens - deductFromCurrent;
      }
      
      await update(ref(database), updates);
    }
    
    return { 
      redemptionId, 
      redemptionCode: redemptionData.redemptionCode,
      remainingTokens: availableTokens - tokenCost 
    };
  } catch (error) {
    throw error;
  }
};

// Generar código de canje único
const generateRedemptionCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Función legacy mantenida para compatibilidad (marcada como deprecated)
export const requestBenefit = async (userId, benefitId, isBenefitJobby, companyId, additionalData = {}) => {
  console.warn('requestBenefit is deprecated. Use redeemExperience instead.');
  // Para compatibilidad temporal, redirigir al nuevo sistema con costo de 1 token
  return redeemExperience(userId, benefitId, isBenefitJobby, companyId, 1, additionalData);
};

// Aprobar/Rechazar solicitud (nivel 1 o 2 dependiendo del beneficio)
export const updateBenefitRequest = async (requestId, status, adminId) => {
  try {
    const requestRef = ref(database, `benefit_requests/${requestId}`);
    await update(requestRef, {
      status, // approved, rejected
      adminId,
      processedDate: new Date().toISOString()
    });
    
    if (status === 'approved') {
      // Generar token para beneficio aprobado
      const tokenRef = push(ref(database, 'benefit_tokens'));
      const tokenId = tokenRef.key;
      
      await set(tokenRef, {
        requestId,
        tokenCode: generateRandomToken(),
        status: 'active',
        createdAt: new Date().toISOString(),
        expiresAt: calculateExpiryDate() // 30 días por defecto
      });
      
      // Actualizar solicitud con el token
      await update(requestRef, { tokenId });
    }
    
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Verificar token (nivel 4 - proveedores)
export const verifyAndUseToken = async (tokenCode, providerId) => {
  try {
    // Obtener todos los tokens en lugar de usar una consulta indexada
    // para evitar el error "Index not defined, add '.indexOn': 'tokenCode'"
    const tokensRef = ref(database, 'benefit_tokens');
    const snapshot = await get(tokensRef);
    
    if (!snapshot.exists()) {
      throw new Error('No hay tokens disponibles');
    }
    
    let tokenId = null;
    let tokenData = null;
    
    // Filtrar tokens manualmente para encontrar el que coincide con el código
    snapshot.forEach((childSnapshot) => {
      const token = childSnapshot.val();
      if (token.tokenCode === tokenCode) {
        tokenId = childSnapshot.key;
        tokenData = token;
      }
    });
    
    // Verificar si se encontró un token con ese código
    if (!tokenId || !tokenData) {
      throw new Error('Token no encontrado');
    }
    
    // Verificar que el token esté activo
    if (tokenData.status !== 'active') {
      throw new Error('El token ya ha sido utilizado o ha expirado');
    }
    
    // Verificar que no haya expirado
    if (new Date(tokenData.expiresAt) < new Date()) {
      throw new Error('El token ha expirado');
    }
    
    // Marcar token como utilizado
    await update(ref(database, `benefit_tokens/${tokenId}`), {
      status: 'used',
      usedBy: providerId,
      usedAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// ===== FUNCIONES PARA GESTIÓN DIRECTA DE TOKENS (NIVEL 1) =====

// Crear token directamente para un usuario (sin solicitud previa)
export const createUserToken = async (userId, benefitId, isBenefitJobby, companyId = null, adminId, expiryDays = 30) => {
  try {
    // 1. Crear una solicitud automática aprobada
    const requestRef = push(ref(database, 'benefit_requests'));
    const requestId = requestRef.key;
    
    const requestData = {
      userId,
      benefitId,
      isBenefitJobby,
      status: 'approved',
      requestDate: new Date().toISOString(),
      processedDate: new Date().toISOString(),
      adminId,
      autoGenerated: true // Marca que fue generado por admin, no solicitado por usuario
    };
    
    if (!isBenefitJobby && companyId) {
      requestData.companyId = companyId;
    }
    
    await set(requestRef, requestData);
    
    // 2. Crear el token asociado a esta solicitud
    const tokenRef = push(ref(database, 'benefit_tokens'));
    const tokenId = tokenRef.key;
    const tokenCode = generateRandomToken();
    
    await set(tokenRef, {
      requestId,
      tokenCode,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: calculateExpiryDate(expiryDays),
      createdBy: adminId
    });
    
    // 3. Actualizar la solicitud con el ID del token
    await update(requestRef, { tokenId });
    
    return { 
      requestId,
      tokenId,
      tokenCode
    };
  } catch (error) {
    throw error;
  }
};

// Revocar/cancelar token (cambiar estado a 'revoked')
export const revokeToken = async (tokenId, adminId, reason = '') => {
  try {
    const tokenRef = ref(database, `benefit_tokens/${tokenId}`);
    const snapshot = await get(tokenRef);
    
    if (!snapshot.exists()) {
      throw new Error('Token no encontrado');
    }
    
    const tokenData = snapshot.val();
    
    // Solo se pueden revocar tokens activos
    if (tokenData.status !== 'active') {
      throw new Error(`No se puede revocar un token con estado ${tokenData.status}`);
    }
    
    await update(tokenRef, {
      status: 'revoked',
      revokedBy: adminId,
      revokedAt: new Date().toISOString(),
      revocationReason: reason
    });
    
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Obtener todos los tokens
export const getAllTokens = async () => {
  try {
    const tokensRef = ref(database, 'benefit_tokens');
    const snapshot = await get(tokensRef);
    
    const tokens = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        tokens.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    return tokens;
  } catch (error) {
    throw error;
  }
};

// Obtener tokens de un usuario específico
export const getUserTokens = async (userId) => {
  try {
    // Primero obtenemos todas las solicitudes del usuario
    const requestsRef = ref(database, 'benefit_requests');
    const requestSnapshot = await get(requestsRef);
    
    const userRequests = [];
    if (requestSnapshot.exists()) {
      requestSnapshot.forEach((childSnapshot) => {
        const request = childSnapshot.val();
        if (request.userId === userId && request.tokenId) {
          userRequests.push({
            id: childSnapshot.key,
            ...request
          });
        }
      });
    }
    
    // Luego obtenemos todos los tokens
    const tokensRef = ref(database, 'benefit_tokens');
    const tokenSnapshot = await get(tokensRef);
    
    const tokensMap = {};
    if (tokenSnapshot.exists()) {
      tokenSnapshot.forEach((childSnapshot) => {
        tokensMap[childSnapshot.key] = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        };
      });
    }
    
    // Mapear solicitudes con sus tokens
    const userTokens = userRequests
      .filter(request => tokensMap[request.tokenId])
      .map(request => ({
        ...tokensMap[request.tokenId],
        requestData: request
      }));
    
    return userTokens;
  } catch (error) {
    throw error;
  }
};

// ===== FUNCIONES PARA USUARIOS =====

// Actualizar nivel de usuario
export const updateUserLevel = async (userId, userLevel) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    await update(userRef, { 
      userLevel,
      updatedAt: new Date().toISOString() 
    });
    
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Obtener todos los usuarios
export const getAllUsers = async () => {
  try {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    const users = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        users.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    return users;
  } catch (error) {
    throw error;
  }
};

// ===== FUNCIONES AUXILIARES =====

// Generar token aleatorio para beneficio
export const generateRandomToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Calcular fecha de expiración (30 días por defecto)
export const calculateExpiryDate = (days = 30) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// ===== FUNCIONES PARA ENCUESTA DE PERFILAMIENTO =====

// Obtener estado de encuesta del usuario
export const getUserSurveyStatus = async (userId) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      throw new Error('Usuario no encontrado');
    }
    
    const userData = snapshot.val();
    return {
      surveyCompleted: userData.surveyCompleted || false,
      surveyCompletedAt: userData.surveyCompletedAt || null,
      benefitPreferences: userData.benefitPreferences || null
    };
  } catch (error) {
    throw error;
  }
};

// Actualizar estado de encuesta del usuario
export const updateUserSurveyStatus = async (userId, completed = true) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const updates = {
      surveyCompleted: completed,
      surveyUpdatedAt: new Date().toISOString(),
      ...(completed && { surveyCompletedAt: new Date().toISOString() })
    };
    
    await update(userRef, updates);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Guardar preferencias de beneficios del usuario
export const saveSurveyPreferences = async (userId, preferences, generationalMemory = null) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    
    const surveyData = {
      benefitPreferences: preferences,
      surveyCompleted: true,
      surveyCompletedAt: new Date().toISOString(),
      surveyUpdatedAt: new Date().toISOString()
    };
    
    // Agregar dato generacional si se proporciona
    if (generationalMemory) {
      surveyData.generationalMemory = generationalMemory;
    }
    
    await update(userRef, surveyData);
    
    return { success: true };
  } catch (error) {
    throw error;
  }
};