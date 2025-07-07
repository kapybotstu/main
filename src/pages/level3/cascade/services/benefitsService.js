import { ref, onValue, push, get } from 'firebase/database';
import { database } from '../../../../services/firebase/config';

/**
 * Servicio para manejar beneficios Jobby desde Firebase
 */
export class BenefitsService {
  /**
   * Obtiene todos los beneficios Jobby activos
   * @returns {Promise} Promise que resuelve con array de beneficios
   */
  static async getJobbyBenefits() {
    return new Promise((resolve, reject) => {
      const benefitsRef = ref(database, 'jobby_benefits');
      
      onValue(benefitsRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const benefitsList = Object.entries(data)
              .map(([id, benefit]) => ({
                id,
                ...benefit,
                // Asegurar que tenemos los campos necesarios para el cascade
                name: benefit.title || benefit.name || 'Beneficio sin nombre',
                description: benefit.description || 'Sin descripción',
                category: benefit.category || 'General',
                tokensRequired: benefit.tokenCost || 1,
                provider: benefit.provider || 'Jobby',
                isJobbyBenefit: true,
                image: benefit.image || '/api/placeholder/400/300'
              }))
              // Filtrar solo beneficios activos
              .filter(benefit => benefit.status === 'active');
            
            // Ordenar por fecha de creación, más recientes primero
            benefitsList.sort((a, b) => {
              const dateA = new Date(a.createdAt || 0);
              const dateB = new Date(b.createdAt || 0);
              return dateB - dateA;
            });
            
            resolve(benefitsList);
          } else {
            resolve([]);
          }
        } catch (error) {
          console.error('Error procesando beneficios:', error);
          reject(error);
        }
      }, (error) => {
        console.error('Error obteniendo beneficios:', error);
        reject(error);
      });
    });
  }

  /**
   * Obtiene un beneficio específico por ID
   * @param {string} benefitId - ID del beneficio
   * @returns {Promise} Promise que resuelve con el beneficio
   */
  static async getBenefitById(benefitId) {
    try {
      const benefitRef = ref(database, `jobby_benefits/${benefitId}`);
      const snapshot = await get(benefitRef);
      
      if (snapshot.exists()) {
        const benefit = snapshot.val();
        return {
          id: benefitId,
          ...benefit,
          name: benefit.title || benefit.name || 'Beneficio sin nombre',
          description: benefit.description || 'Sin descripción',
          category: benefit.category || 'General',
          tokensRequired: benefit.tokenCost || 1,
          provider: benefit.provider || 'Jobby',
          isJobbyBenefit: true,
          image: benefit.image || '/api/placeholder/400/300'
        };
      } else {
        throw new Error('Beneficio no encontrado');
      }
    } catch (error) {
      console.error('Error obteniendo beneficio:', error);
      throw error;
    }
  }

  /**
   * Crea una solicitud de beneficio en Firebase
   * @param {string} userId - ID del usuario
   * @param {object} benefit - Datos del beneficio
   * @param {string} companyId - ID de la empresa (opcional)
   * @returns {Promise} Promise que resuelve con el ID de la solicitud
   */
  static async requestBenefit(userId, benefit, companyId = null) {
    try {
      const requestsRef = ref(database, 'benefit_requests');
      
      const requestData = {
        userId,
        benefitId: benefit.id,
        benefitName: benefit.name,
        benefitType: benefit.type || 'automatic',
        isBenefitJobby: true,
        status: benefit.type === 'automatic' ? 'approved' : 'pending',
        requestDate: new Date().toISOString(),
        paidWithTokens: true,
        tokenCost: benefit.tokensRequired || 1,
        companyId: companyId || null
      };

      // Si es automático, procesarlo inmediatamente
      if (benefit.type === 'automatic') {
        requestData.processedDate = new Date().toISOString();
        requestData.status = 'approved';
        
        // Generar token si es necesario
        if (benefit.requiresToken !== false) {
          const tokenId = await this.generateBenefitToken(benefit, userId);
          requestData.tokenId = tokenId;
        }
      }

      const newRequestRef = await push(requestsRef, requestData);
      
      console.log('Solicitud de beneficio creada:', newRequestRef.key);
      return newRequestRef.key;
      
    } catch (error) {
      console.error('Error creando solicitud de beneficio:', error);
      throw error;
    }
  }

  /**
   * Genera un token de beneficio
   * @param {object} benefit - Datos del beneficio
   * @param {string} userId - ID del usuario
   * @returns {Promise} Promise que resuelve con el ID del token
   */
  static async generateBenefitToken(benefit, userId) {
    try {
      const tokensRef = ref(database, 'benefit_tokens');
      
      // Generar código único
      const tokenCode = this.generateTokenCode();
      
      const tokenData = {
        benefitId: benefit.id,
        benefitName: benefit.name,
        userId,
        tokenCode,
        status: 'active',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + (90 * 24 * 60 * 60 * 1000)).toISOString(), // 90 días
        instructions: this.generateInstructions(benefit)
      };

      const newTokenRef = await push(tokensRef, tokenData);
      
      console.log('Token generado:', newTokenRef.key);
      return newTokenRef.key;
      
    } catch (error) {
      console.error('Error generando token:', error);
      throw error;
    }
  }

  /**
   * Genera un código de token único
   * @returns {string} Código del token
   */
  static generateTokenCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'JBY-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Genera instrucciones de uso para el beneficio
   * @param {object} benefit - Datos del beneficio
   * @returns {string} Instrucciones de uso
   */
  static generateInstructions(benefit) {
    const defaultInstructions = `
¿Cómo usar tu beneficio "${benefit.name}"?

1. Presenta este código en el establecimiento o úsalo online
2. El código es válido por 90 días desde su generación
3. Solo puede usarse una vez
4. Si tienes problemas, contacta a soporte

¡Disfruta tu beneficio!
    `.trim();

    return benefit.instructions || defaultInstructions;
  }

  /**
   * Obtiene las solicitudes de beneficios de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise} Promise que resuelve con array de solicitudes
   */
  static async getUserBenefitRequests(userId) {
    return new Promise((resolve, reject) => {
      const requestsRef = ref(database, 'benefit_requests');
      
      onValue(requestsRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const userRequests = Object.entries(data)
              .map(([id, request]) => ({
                id,
                ...request
              }))
              .filter(request => request.userId === userId)
              .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
            
            resolve(userRequests);
          } else {
            resolve([]);
          }
        } catch (error) {
          console.error('Error procesando solicitudes:', error);
          reject(error);
        }
      }, (error) => {
        console.error('Error obteniendo solicitudes:', error);
        reject(error);
      });
    });
  }

  /**
   * Obtiene el balance de tokens de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise} Promise que resuelve con el balance
   */
  static async getUserTokenBalance(userId) {
    try {
      // Esta función debería existir en databaseService, la importamos
      const { getJobbyTokenBalance } = await import('../../../../services/firebase/database/databaseService');
      return await getJobbyTokenBalance(userId);
    } catch (error) {
      console.error('Error obteniendo balance de tokens:', error);
      return 0;
    }
  }
}

export default BenefitsService;