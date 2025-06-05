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

// Solicitar beneficio con pago de tokens (nivel 3)
export const requestBenefitWithTokens = async (userId, benefitId, isBenefitJobby, companyId, tokenCost, additionalData = {}) => {
  try {
    // 1. Verificar tokens disponibles del usuario
    const userTokensRef = ref(database, `user_blank_tokens/${userId}/balance`);
    const tokensSnapshot = await get(userTokensRef);
    
    let availableTokens = 0;
    if (tokensSnapshot.exists()) {
      availableTokens = tokensSnapshot.val();
    }
    
    // 2. Verificar si tiene suficientes tokens
    if (availableTokens < tokenCost) {
      throw new Error(`No tienes suficientes tokens. Necesitas ${tokenCost} tokens, pero solo tienes ${availableTokens}.`);
    }
    
    // 3. Obtener información del beneficio y su tipo
    let benefitName = 'Beneficio';
    let benefitType = 'automatic'; // Por defecto
    let benefitData = {};
    
    if (isBenefitJobby) {
      const benefitRef = ref(database, `jobby_benefits/${benefitId}`);
      const benefitSnapshot = await get(benefitRef);
      if (benefitSnapshot.exists()) {
        benefitData = benefitSnapshot.val();
        benefitName = benefitData.title || benefitData.name || 'Beneficio Jobby';
        benefitType = benefitData.type || 'automatic';
      }
    } else {
      const benefitRef = ref(database, `company_benefits/${companyId}/${benefitId}`);
      const benefitSnapshot = await get(benefitRef);
      if (benefitSnapshot.exists()) {
        benefitData = benefitSnapshot.val();
        benefitName = benefitData.title || benefitData.name || 'Beneficio Empresa';
        benefitType = benefitData.type || 'automatic';
      }
    }
    
    // 4. Determinar el estado según el tipo de beneficio
    let requestStatus = 'pending';
    let processedDate = null;
    let adminId = null;
    
    if (benefitType === 'automatic') {
      // Beneficios automáticos se aprueban instantáneamente
      requestStatus = 'approved';
      processedDate = new Date().toISOString();
      adminId = 'system';
    } else if (benefitType === 'managed') {
      // Beneficios gestionados requieren aprobación manual del proveedor
      requestStatus = 'pending_provider_approval';
    } else if (benefitType === 'third_party') {
      // Beneficios de terceros van al nivel 1 para gestión
      requestStatus = 'pending_admin_approval';
    }
    
    // 5. Crear la solicitud con el estado apropiado
    const requestRef = push(ref(database, 'benefit_requests'));
    const requestId = requestRef.key;
    const currentTime = new Date().toISOString();
    
    const requestData = {
      userId,
      benefitId,
      benefitName,
      benefitType,
      isBenefitJobby,
      status: requestStatus,
      requestDate: currentTime,
      processedDate,
      adminId,
      paidWithTokens: true,
      tokenCost,
      ...additionalData
    };
    
    if (!isBenefitJobby && companyId) {
      requestData.companyId = companyId;
    }
    
    await set(requestRef, requestData);
    
    let tokenId = null;
    let tokenCode = null;
    
    // 6. Solo crear token automáticamente para beneficios automáticos
    if (benefitType === 'automatic' && requestStatus === 'approved') {
      const tokenRef = push(ref(database, 'benefit_tokens'));
      tokenId = tokenRef.key;
      tokenCode = generateRandomToken();
      
      await set(tokenRef, {
        requestId,
        tokenCode,
        status: 'active',
        createdAt: currentTime,
        expiresAt: calculateExpiryDate(30),
        createdBy: 'system',
        benefitId,
        userId,
        benefitName
      });
      
      // Actualizar la solicitud con el ID del token
      await update(requestRef, { tokenId });
    }
    
    // 7. Descontar tokens del usuario y registrar en historial
    const currentTimeMs = Date.now();
    const newBalance = availableTokens - tokenCost;
    
    // Actualizar balance
    await update(ref(database, `user_blank_tokens/${userId}`), {
      balance: newBalance,
      lastUpdated: currentTimeMs
    });
    
    // 8. Registrar en historial de tokens
    const historyRef = ref(database, `user_blank_tokens/${userId}/history`);
    await push(historyRef, {
      type: 'used',
      amount: tokenCost,
      reason: `Canjeado por: ${benefitName}`,
      requestId: requestId,
      tokenId: tokenId,
      benefitId: benefitId,
      createdAt: currentTimeMs,
      balanceBefore: availableTokens,
      balanceAfter: newBalance
    });
    
    return { 
      requestId,
      tokenId,
      tokenCode,
      remainingTokens: newBalance 
    };
  } catch (error) {
    throw error;
  }
};

// Solicitar beneficio sin tokens (mantener flujo tradicional)
export const requestBenefitTraditional = async (userId, benefitId, isBenefitJobby, companyId, additionalData = {}) => {
  try {
    const newRequestRef = push(ref(database, 'benefit_requests'));
    const requestId = newRequestRef.key;
    
    const requestData = {
      userId,
      benefitId,
      isBenefitJobby,
      status: 'pending', // Requiere aprobación manual
      requestDate: new Date().toISOString(),
      paidWithTokens: false,
      ...additionalData
    };
    
    if (!isBenefitJobby) {
      requestData.companyId = companyId;
    }
    
    await set(newRequestRef, requestData);
    
    return { requestId };
  } catch (error) {
    throw error;
  }
};

// Solicitar beneficio (nivel 3) - DEPRECATED
// Canjear experiencia por tokens
export const redeemExperience = async (userId, benefitId, isBenefitJobby, companyId, tokenCost, additionalData = {}) => {
  try {
    // 1. Verificar tokens disponibles del usuario (usar user_blank_tokens)
    const userTokensRef = ref(database, `user_blank_tokens/${userId}/balance`);
    const tokensSnapshot = await get(userTokensRef);
    
    let availableTokens = 0;
    if (tokensSnapshot.exists()) {
      availableTokens = tokensSnapshot.val();
    }
    
    // 2. Verificar si tiene suficientes tokens
    if (availableTokens < tokenCost) {
      throw new Error(`No tienes suficientes tokens. Necesitas ${tokenCost} tokens, pero solo tienes ${availableTokens}.`);
    }
    
    // 3. Obtener información del beneficio
    let benefitName = 'Beneficio';
    if (isBenefitJobby) {
      const benefitRef = ref(database, `jobby_benefits/${benefitId}`);
      const benefitSnapshot = await get(benefitRef);
      if (benefitSnapshot.exists()) {
        benefitName = benefitSnapshot.val().title || benefitSnapshot.val().name || 'Beneficio Jobby';
      }
    } else {
      const benefitRef = ref(database, `company_benefits/${companyId}/${benefitId}`);
      const benefitSnapshot = await get(benefitRef);
      if (benefitSnapshot.exists()) {
        benefitName = benefitSnapshot.val().title || benefitSnapshot.val().name || 'Beneficio Empresa';
      }
    }
    
    // 4. Crear el registro de canje
    const newRedemptionRef = push(ref(database, 'experience_redemptions'));
    const redemptionId = newRedemptionRef.key;
    
    const redemptionData = {
      userId,
      benefitId,
      benefitName,
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
    
    // 5. Guardar el canje
    await set(newRedemptionRef, redemptionData);
    
    // 6. Descontar tokens del usuario y registrar en historial
    const currentTime = Date.now();
    const newBalance = availableTokens - tokenCost;
    
    // Actualizar balance
    await update(ref(database, `user_blank_tokens/${userId}`), {
      balance: newBalance,
      lastUpdated: currentTime
    });
    
    // 7. Registrar en historial de tokens
    const historyRef = ref(database, `user_blank_tokens/${userId}/history`);
    await push(historyRef, {
      type: 'used',
      amount: tokenCost,
      reason: `Canjeado por: ${benefitName}`,
      redemptionId: redemptionId,
      benefitId: benefitId,
      createdAt: currentTime,
      balanceBefore: availableTokens,
      balanceAfter: newBalance
    });
    
    return { 
      redemptionId, 
      redemptionCode: redemptionData.redemptionCode,
      remainingTokens: newBalance 
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

// Aprobar/Rechazar solicitud pagada con tokens que requiere gestión manual (nivel 1)
export const processTokenPaidRequest = async (requestId, status, adminId, instructions = '') => {
  try {
    const requestRef = ref(database, `benefit_requests/${requestId}`);
    const requestSnapshot = await get(requestRef);
    
    if (!requestSnapshot.exists()) {
      throw new Error('Solicitud no encontrada');
    }
    
    const requestData = requestSnapshot.val();
    const currentTime = new Date().toISOString();
    
    // Actualizar el estado de la solicitud
    await update(requestRef, {
      status, // approved, rejected
      adminId,
      processedDate: currentTime,
      adminInstructions: instructions || ''
    });
    
    if (status === 'approved') {
      // Generar token para beneficio aprobado
      const tokenRef = push(ref(database, 'benefit_tokens'));
      const tokenId = tokenRef.key;
      const tokenCode = generateRandomToken();
      
      await set(tokenRef, {
        requestId,
        tokenCode,
        status: 'active',
        createdAt: currentTime,
        expiresAt: calculateExpiryDate(30),
        createdBy: adminId,
        benefitId: requestData.benefitId,
        userId: requestData.userId,
        benefitName: requestData.benefitName,
        benefitType: requestData.benefitType,
        adminInstructions: instructions || ''
      });
      
      // Actualizar solicitud con el ID del token
      await update(requestRef, { tokenId });
      
      return { 
        success: true, 
        tokenId, 
        tokenCode,
        message: 'Solicitud aprobada y token generado correctamente'
      };
    }
    
    return { 
      success: true,
      message: `Solicitud ${status === 'rejected' ? 'rechazada' : 'procesada'} correctamente`
    };
  } catch (error) {
    throw error;
  }
};

// Aprobar/Rechazar solicitud tradicional (nivel 1 o 2 dependiendo del beneficio)
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

// ===== THEME PREFERENCES =====

// Save user's theme preference
export const saveUserThemePreference = async (userId, theme) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    await update(userRef, {
      themePreference: theme,
      themeUpdatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error saving theme preference:', error);
    throw error;
  }
};

// Get user's theme preference
export const getUserThemePreference = async (userId) => {
  try {
    const userRef = ref(database, `users/${userId}/themePreference`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    
    // Default to light theme if no preference exists
    return 'light';
  } catch (error) {
    console.error('Error getting theme preference:', error);
    return 'light'; // Default to light theme on error
  }
};