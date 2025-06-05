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

// ===== SERVICIOS DE TOKENS SEPARADOS =====

// Obtener balance de tokens Jobby (beneficios flexibles)
export const getJobbyTokenBalance = async (userId) => {
  try {
    const jobbyRef = ref(database, `user_blank_tokens/${userId}/jobby_balance`);
    const jobbySnapshot = await get(jobbyRef);
    
    if (jobbySnapshot.exists()) {
      return jobbySnapshot.val();
    }
    
    // Si no existe jobby_balance, verificar si existe balance legacy
    const legacyRef = ref(database, `user_blank_tokens/${userId}/balance`);
    const legacySnapshot = await get(legacyRef);
    
    if (legacySnapshot.exists()) {
      const legacyBalance = legacySnapshot.val();
      console.log(`Migrando balance legacy ${legacyBalance} a jobby_balance para usuario ${userId}`);
      
      // Migrar el balance legacy a jobby_balance
      await update(ref(database, `user_blank_tokens/${userId}`), {
        jobby_balance: legacyBalance,
        company_balance: 0, // Inicializar company_balance en 0
        migration_date: new Date().toISOString()
      });
      
      return legacyBalance;
    }
    
    return 0;
  } catch (error) {
    console.error('Error getting Jobby token balance:', error);
    return 0;
  }
};

// Obtener balance de tokens Empresa (beneficios internos)
export const getCompanyTokenBalance = async (userId) => {
  try {
    const tokenRef = ref(database, `user_blank_tokens/${userId}/company_balance`);
    const snapshot = await get(tokenRef);
    return snapshot.exists() ? snapshot.val() : 0;
  } catch (error) {
    console.error('Error getting Company token balance:', error);
    return 0;
  }
};

// Gastar tokens Jobby
export const spendJobbyTokens = async (userId, amount, reason = 'Benefit redemption') => {
  try {
    const currentBalance = await getJobbyTokenBalance(userId);
    
    if (currentBalance < amount) {
      throw new Error(`Insufficient Jobby tokens. Required: ${amount}, Available: ${currentBalance}`);
    }
    
    const newBalance = currentBalance - amount;
    const timestamp = new Date().toISOString();
    
    // Actualizar balance
    await update(ref(database, `user_blank_tokens/${userId}`), {
      jobby_balance: newBalance
    });
    
    // Registrar en historial
    const historyRef = push(ref(database, `user_blank_tokens/${userId}/jobby_history`));
    await set(historyRef, {
      type: 'deduction',
      amount: amount,
      reason: reason,
      timestamp: timestamp,
      balance_after: newBalance
    });
    
    return { success: true, newBalance };
  } catch (error) {
    console.error('Error spending Jobby tokens:', error);
    throw error;
  }
};

// Gastar tokens Empresa
export const spendCompanyTokens = async (userId, amount, reason = 'Company benefit redemption') => {
  try {
    const currentBalance = await getCompanyTokenBalance(userId);
    
    if (currentBalance < amount) {
      throw new Error(`Insufficient Company tokens. Required: ${amount}, Available: ${currentBalance}`);
    }
    
    const newBalance = currentBalance - amount;
    const timestamp = new Date().toISOString();
    
    // Actualizar balance
    await update(ref(database, `user_blank_tokens/${userId}`), {
      company_balance: newBalance
    });
    
    // Registrar en historial
    const historyRef = push(ref(database, `user_blank_tokens/${userId}/company_history`));
    await set(historyRef, {
      type: 'deduction',
      amount: amount,
      reason: reason,
      timestamp: timestamp,
      balance_after: newBalance
    });
    
    return { success: true, newBalance };
  } catch (error) {
    console.error('Error spending Company tokens:', error);
    throw error;
  }
};

// Añadir tokens Jobby
export const addJobbyTokens = async (userId, amount, reason = 'Token allocation') => {
  try {
    const currentBalance = await getJobbyTokenBalance(userId);
    const newBalance = currentBalance + amount;
    const timestamp = new Date().toISOString();
    
    // Actualizar balance
    await update(ref(database, `user_blank_tokens/${userId}`), {
      jobby_balance: newBalance
    });
    
    // Registrar en historial
    const historyRef = push(ref(database, `user_blank_tokens/${userId}/jobby_history`));
    await set(historyRef, {
      type: 'addition',
      amount: amount,
      reason: reason,
      timestamp: timestamp,
      balance_after: newBalance
    });
    
    return { success: true, newBalance };
  } catch (error) {
    console.error('Error adding Jobby tokens:', error);
    throw error;
  }
};

// Añadir tokens Empresa
export const addCompanyTokens = async (userId, amount, reason = 'Company token allocation') => {
  try {
    const currentBalance = await getCompanyTokenBalance(userId);
    const newBalance = currentBalance + amount;
    const timestamp = new Date().toISOString();
    
    // Actualizar balance
    await update(ref(database, `user_blank_tokens/${userId}`), {
      company_balance: newBalance
    });
    
    // Registrar en historial
    const historyRef = push(ref(database, `user_blank_tokens/${userId}/company_history`));
    await set(historyRef, {
      type: 'addition',
      amount: amount,
      reason: reason,
      timestamp: timestamp,
      balance_after: newBalance
    });
    
    return { success: true, newBalance };
  } catch (error) {
    console.error('Error adding Company tokens:', error);
    throw error;
  }
};

// Obtener historial de tokens Jobby
export const getJobbyTokenHistory = async (userId) => {
  try {
    const historyRef = ref(database, `user_blank_tokens/${userId}/jobby_history`);
    const snapshot = await get(historyRef);
    
    const history = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        history.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    // Ordenar por timestamp descendente (más reciente primero)
    return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Error getting Jobby token history:', error);
    return [];
  }
};

// Obtener historial de tokens Empresa para un usuario específico
export const getUserCompanyTokenHistory = async (userId) => {
  try {
    const historyRef = ref(database, `user_blank_tokens/${userId}/company_history`);
    const snapshot = await get(historyRef);
    
    const history = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        history.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    // Ordenar por timestamp descendente (más reciente primero)
    return history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error getting user Company token history:', error);
    return [];
  }
};

// FUNCIÓN DE EMERGENCIA: Restaurar balance real del usuario
export const resetUserTokensToReal = async (userId, realJobbyBalance = 1, realCompanyBalance = 0) => {
  try {
    console.log(`🔧 RESET: Restaurando balance real para usuario ${userId}`);
    console.log(`💰 Jobby: ${realJobbyBalance}, 🏢 Empresa: ${realCompanyBalance}`);
    
    const userTokensRef = ref(database, `user_blank_tokens/${userId}`);
    
    // Resetear completamente con los valores reales
    await set(userTokensRef, {
      jobby_balance: realJobbyBalance,
      company_balance: realCompanyBalance,
      reset_at: new Date().toISOString(),
      reset_reason: 'Remove fake data, restore real balance'
    });
    
    console.log('✅ Balance real restaurado exitosamente');
    return { success: true, jobbyBalance: realJobbyBalance, companyBalance: realCompanyBalance };
  } catch (error) {
    console.error('Error resetting user tokens:', error);
    throw error;
  }
};

// ===== FUNCIONES PARA GESTIÓN DE TOKENS NIVEL 2 (EMPRESA) =====

// Obtener balance de tokens de empresa para múltiples usuarios
export const getCompanyUsersTokenBalance = async (companyId) => {
  try {
    const usersRef = ref(database, 'users');
    const usersSnapshot = await get(usersRef);
    
    const companyUsers = [];
    
    if (usersSnapshot.exists()) {
      // Obtener usuarios de la empresa
      usersSnapshot.forEach((childSnapshot) => {
        const userData = childSnapshot.val();
        
        if (userData.companyId === companyId && userData.level === 3) {
          companyUsers.push({
            id: childSnapshot.key,
            ...userData
          });
        }
      });
    }
    
    // Obtener balance de tokens para cada usuario
    const usersWithTokens = [];
    for (const user of companyUsers) {
      try {
        const tokensRef = ref(database, `user_blank_tokens/${user.id}`);
        const tokensSnapshot = await get(tokensRef);
        const tokensData = tokensSnapshot.val() || {};
        
        usersWithTokens.push({
          ...user,
          companyBalance: tokensData.company_balance || 0,
          jobbyBalance: tokensData.jobby_balance || 0,
          lastUpdated: tokensData.lastUpdated || null
        });
      } catch (error) {
        console.error(`Error obteniendo tokens para usuario ${user.id}:`, error);
        usersWithTokens.push({
          ...user,
          companyBalance: 0,
          jobbyBalance: 0,
          lastUpdated: null
        });
      }
    }
    
    return usersWithTokens;
  } catch (error) {
    console.error('Error getting company users token balance:', error);
    throw error;
  }
};

// Asignar tokens de empresa a un usuario específico
export const assignCompanyTokensToUser = async (companyId, userId, amount, reason, adminId, adminEmail) => {
  try {
    if (amount <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }
    
    // Verificar que el usuario pertenece a la empresa
    const userRef = ref(database, `users/${userId}`);
    const userSnapshot = await get(userRef);
    
    if (!userSnapshot.exists()) {
      throw new Error('Usuario no encontrado');
    }
    
    const userData = userSnapshot.val();
    if (userData.companyId !== companyId) {
      throw new Error('El usuario no pertenece a esta empresa');
    }
    
    if (userData.level !== 3) {
      throw new Error('Solo se pueden asignar tokens a empleados (nivel 3)');
    }
    
    // Obtener balance actual
    const tokensRef = ref(database, `user_blank_tokens/${userId}`);
    const tokensSnapshot = await get(tokensRef);
    const currentData = tokensSnapshot.val() || {};
    const currentBalance = currentData.company_balance || 0;
    const newBalance = currentBalance + amount;
    
    // Actualizar balance
    await update(tokensRef, {
      company_balance: newBalance,
      lastUpdated: new Date().toISOString()
    });
    
    // Registrar en historial
    const historyRef = ref(database, `user_blank_tokens/${userId}/company_history`);
    await push(historyRef, {
      type: 'add',
      amount: amount,
      reason: reason || 'Asignación manual',
      adminId: adminId,
      adminEmail: adminEmail,
      companyId: companyId,
      createdAt: new Date().toISOString(),
      balanceBefore: currentBalance,
      balanceAfter: newBalance
    });
    
    return { 
      success: true, 
      newBalance: newBalance,
      amountAdded: amount 
    };
  } catch (error) {
    console.error('Error assigning company tokens:', error);
    throw error;
  }
};

// Asignación masiva de tokens de empresa
export const bulkAssignCompanyTokens = async (companyId, userIds, amount, reason, adminId, adminEmail) => {
  try {
    if (amount <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }
    
    if (!userIds || userIds.length === 0) {
      throw new Error('Debe seleccionar al menos un usuario');
    }
    
    const results = [];
    const errors = [];
    
    for (const userId of userIds) {
      try {
        const result = await assignCompanyTokensToUser(companyId, userId, amount, reason, adminId, adminEmail);
        results.push({ userId, ...result });
      } catch (error) {
        console.error(`Error asignando tokens a usuario ${userId}:`, error);
        errors.push({ userId, error: error.message });
      }
    }
    
    return {
      success: results.length > 0,
      successCount: results.length,
      errorCount: errors.length,
      results,
      errors
    };
  } catch (error) {
    console.error('Error in bulk token assignment:', error);
    throw error;
  }
};

// Obtener estadísticas de tokens de empresa
export const getCompanyTokenStatistics = async (companyId) => {
  try {
    const users = await getCompanyUsersTokenBalance(companyId);
    
    const stats = {
      totalUsers: users.length,
      activeUsers: 0,
      totalAvailable: 0,
      totalDistributed: 0,
      totalUsed: 0,
      averageBalance: 0
    };
    
    // Calcular estadísticas básicas
    for (const user of users) {
      const balance = user.companyBalance || 0;
      stats.totalAvailable += balance;
      if (balance > 0) {
        stats.activeUsers++;
      }
    }
    
    if (users.length > 0) {
      stats.averageBalance = Math.round(stats.totalAvailable / users.length);
    }
    
    // Obtener historial para calcular total distribuido y usado
    const tokensRef = ref(database, 'user_blank_tokens');
    const tokensSnapshot = await get(tokensRef);
    
    if (tokensSnapshot.exists()) {
      tokensSnapshot.forEach((userSnapshot) => {
        const userId = userSnapshot.key;
        const user = users.find(u => u.id === userId);
        
        if (user) { // Solo contar historial de usuarios de esta empresa
          const companyHistoryRef = userSnapshot.child('company_history');
          
          if (companyHistoryRef.exists()) {
            companyHistoryRef.forEach((historySnapshot) => {
              const historyData = historySnapshot.val();
              
              if (historyData.type === 'add') {
                stats.totalDistributed += historyData.amount || 0;
              } else if (historyData.type === 'used') {
                stats.totalUsed += historyData.amount || 0;
              }
            });
          }
        }
      });
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting company token statistics:', error);
    throw error;
  }
};

// Obtener historial completo de tokens de empresa
export const getCompanyTokenHistory = async (companyId, limit = 50) => {
  try {
    const users = await getCompanyUsersTokenBalance(companyId);
    const userIds = users.map(u => u.id);
    
    const history = [];
    
    const tokensRef = ref(database, 'user_blank_tokens');
    const tokensSnapshot = await get(tokensRef);
    
    if (tokensSnapshot.exists()) {
      tokensSnapshot.forEach((userSnapshot) => {
        const userId = userSnapshot.key;
        
        // Solo incluir historial de usuarios de esta empresa
        if (userIds.includes(userId)) {
          const companyHistoryRef = userSnapshot.child('company_history');
          
          if (companyHistoryRef.exists()) {
            companyHistoryRef.forEach((historySnapshot) => {
              const historyData = historySnapshot.val();
              const user = users.find(u => u.id === userId);
              
              history.push({
                id: historySnapshot.key,
                userId: userId,
                userName: user?.displayName || 'Usuario desconocido',
                userEmail: user?.email || '',
                ...historyData
              });
            });
          }
        }
      });
    }
    
    // Ordenar por fecha más reciente
    history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return history.slice(0, limit);
  } catch (error) {
    console.error('Error getting company token history:', error);
    throw error;
  }
};

// Obtener solicitudes de beneficios internos de empresa
export const getCompanyBenefitRequests = async (companyId) => {
  try {
    const requestsRef = ref(database, 'benefit_requests');
    const requestsSnapshot = await get(requestsRef);
    
    const requests = [];
    
    if (requestsSnapshot.exists()) {
      requestsSnapshot.forEach((childSnapshot) => {
        const requestData = childSnapshot.val();
        
        // Solo solicitudes de beneficios internos de esta empresa
        if (requestData.companyId === companyId && !requestData.isBenefitJobby) {
          requests.push({
            id: childSnapshot.key,
            ...requestData
          });
        }
      });
    }
    
    return requests.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
  } catch (error) {
    console.error('Error getting company benefit requests:', error);
    throw error;
  }
};

// Crear token para beneficio interno de empresa (cuando se aprueba una solicitud)
export const createCompanyBenefitToken = async (requestId, companyId, adminId) => {
  try {
    // Obtener datos de la solicitud
    const requestRef = ref(database, `benefit_requests/${requestId}`);
    const requestSnapshot = await get(requestRef);
    
    if (!requestSnapshot.exists()) {
      throw new Error('Solicitud no encontrada');
    }
    
    const requestData = requestSnapshot.val();
    
    // Verificar que es una solicitud de beneficio interno de esta empresa
    if (requestData.companyId !== companyId || requestData.isBenefitJobby) {
      throw new Error('Esta solicitud no pertenece a los beneficios internos de la empresa');
    }
    
    if (requestData.status !== 'pending') {
      throw new Error('La solicitud ya ha sido procesada');
    }
    
    // Generar token de beneficio
    const tokenRef = push(ref(database, 'benefit_tokens'));
    const tokenId = tokenRef.key;
    const tokenCode = generateRandomToken();
    
    await set(tokenRef, {
      requestId: requestId,
      tokenCode: tokenCode,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: calculateExpiryDate(30), // 30 días por defecto
      createdBy: adminId,
      benefitId: requestData.benefitId,
      userId: requestData.userId,
      benefitName: requestData.benefitName,
      companyId: companyId
    });
    
    // Actualizar solicitud como aprobada
    await update(requestRef, {
      status: 'approved',
      adminId: adminId,
      processedDate: new Date().toISOString(),
      tokenId: tokenId
    });
    
    return {
      success: true,
      tokenId: tokenId,
      tokenCode: tokenCode
    };
  } catch (error) {
    console.error('Error creating company benefit token:', error);
    throw error;
  }
};