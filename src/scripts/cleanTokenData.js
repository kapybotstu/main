import { ref, get, set, remove } from 'firebase/database';
import { database } from '../services/firebase/config.js';

// Script para limpiar datos falsos de tokens y restaurar balance real
const cleanTokenData = async (userId) => {
  try {
    console.log(`🧹 Limpiando datos de tokens para usuario: ${userId}`);
    
    // 1. Obtener datos actuales
    const userTokensRef = ref(database, `user_blank_tokens/${userId}`);
    const snapshot = await get(userTokensRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log('📊 Datos actuales:', data);
      
      // 2. Verificar si hay historial real vs fake data
      const jobbyHistory = data.jobby_history || {};
      const companyHistory = data.company_history || {};
      
      console.log('📜 Historial Jobby:', jobbyHistory);
      console.log('📜 Historial Empresa:', companyHistory);
      
      // 3. Calcular balance real basado en historial
      let realJobbyBalance = 0;
      let realCompanyBalance = 0;
      
      // Sumar/restar basado en el historial real
      Object.values(jobbyHistory).forEach(transaction => {
        if (transaction.type === 'addition') {
          realJobbyBalance += transaction.amount;
        } else if (transaction.type === 'deduction') {
          realJobbyBalance -= transaction.amount;
        }
      });
      
      Object.values(companyHistory).forEach(transaction => {
        if (transaction.type === 'addition') {
          realCompanyBalance += transaction.amount;
        } else if (transaction.type === 'deduction') {
          realCompanyBalance -= transaction.amount;
        }
      });
      
      console.log(`💰 Balance real calculado - Jobby: ${realJobbyBalance}, Empresa: ${realCompanyBalance}`);
      
      // 4. Actualizar con los balances reales
      await set(userTokensRef, {
        jobby_balance: realJobbyBalance,
        company_balance: realCompanyBalance,
        jobby_history: jobbyHistory,
        company_history: companyHistory,
        cleaned_at: new Date().toISOString(),
        original_data: data // Backup de los datos originales
      });
      
      console.log('✅ Datos limpiados y balance real restaurado');
      return {
        success: true,
        realJobbyBalance,
        realCompanyBalance
      };
    } else {
      console.log('❌ No se encontraron datos de tokens para este usuario');
      return { success: false, message: 'No data found' };
    }
  } catch (error) {
    console.error('💥 Error limpiando datos:', error);
    return { success: false, error };
  }
};

// Función para usar en consola del navegador
window.cleanUserTokens = cleanTokenData;

export default cleanTokenData;