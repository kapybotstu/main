// Script para crear usuario demo con datos de ejemplo
import { 
  ref, 
  set, 
  push, 
  get 
} from "firebase/database";
import { database } from '../services/firebase/config.js';

const createDemoUser = async () => {
  try {
    console.log('Creando usuario demo...');
    
    // 1. Crear datos del usuario demo
    const demoUserId = 'demo-user-123'; // ID fijo para el usuario demo
    const demoUserData = {
      email: 'demo@demo.cl',
      displayName: 'Usuario Demo',
      level: 3,
      companyId: 'company-demo-456',
      surveyCompleted: true,
      surveyCompletedAt: new Date().toISOString(),
      benefitPreferences: 'descuentos,entretenimiento,gastronomia,viajes',
      generationalMemory: 'millennial',
      satisfactionLevel: 'muy-satisfecho',
      themePreference: 'light',
      createdAt: new Date().toISOString()
    };

    await set(ref(database, `users/${demoUserId}`), demoUserData);
    console.log('✅ Usuario demo creado');

    // 2. Crear empresa demo
    const demoCompanyId = 'company-demo-456';
    const demoCompanyData = {
      name: 'Empresa Demo',
      domain: 'demo.cl',
      industry: 'Tecnología',
      size: 'mediana',
      status: 'active',
      createdAt: new Date().toISOString(),
      contactEmail: 'admin@demo.cl'
    };

    await set(ref(database, `companies/${demoCompanyId}`), demoCompanyData);
    console.log('✅ Empresa demo creada');

    // 3. Crear beneficios Jobby de ejemplo
    const jobbyBenefits = [
      {
        id: 'jobby-1',
        name: 'Descuento Netflix Premium',
        description: 'Disfruta de 3 meses gratis de Netflix Premium',
        category: 'entretenimiento',
        value: '3 meses gratis',
        tokenCost: 150,
        provider: 'Netflix',
        status: 'active',
        image: 'https://via.placeholder.com/300x200?text=Netflix'
      },
      {
        id: 'jobby-2', 
        name: 'Cena Romántica',
        description: 'Cena para dos en restaurante premium',
        category: 'gastronomia',
        value: '$50.000 CLP',
        tokenCost: 200,
        provider: 'Restaurante Elite',
        status: 'active',
        image: 'https://via.placeholder.com/300x200?text=Cena+Romantica'
      },
      {
        id: 'jobby-3',
        name: 'Fin de Semana Spa',
        description: 'Relajación completa con masajes y tratamientos',
        category: 'bienestar',
        value: '$80.000 CLP',
        tokenCost: 300,
        provider: 'Spa Zen',
        status: 'active',
        image: 'https://via.placeholder.com/300x200?text=Spa+Zen'
      }
    ];

    for (const benefit of jobbyBenefits) {
      await set(ref(database, `jobby_benefits/${benefit.id}`), benefit);
    }
    console.log('✅ Beneficios Jobby creados');

    // 4. Crear beneficios de empresa demo
    const companyBenefits = [
      {
        id: 'comp-1',
        name: 'Día Libre Extra',
        description: 'Un día libre adicional por trimestre',
        category: 'tiempo',
        value: '1 día',
        tokenCost: 100,
        provider: 'Empresa Demo',
        status: 'active',
        maxRedemptions: 50,
        currentRedemptions: 12
      },
      {
        id: 'comp-2',
        name: 'Almuerzo Team Building',
        description: 'Almuerzo grupal para fortalecer el equipo',
        category: 'social',
        value: 'Almuerzo',
        tokenCost: 75,
        provider: 'Empresa Demo',
        status: 'active',
        maxRedemptions: 20,
        currentRedemptions: 8
      }
    ];

    for (const benefit of companyBenefits) {
      await set(ref(database, `company_benefits/${demoCompanyId}/${benefit.id}`), benefit);
    }
    console.log('✅ Beneficios de empresa creados');

    // 5. Crear solicitudes de beneficios de ejemplo
    const benefitRequests = [
      {
        userId: demoUserId,
        benefitId: 'jobby-1',
        benefitName: 'Descuento Netflix Premium',
        isBenefitJobby: true,
        status: 'approved',
        tokenCost: 150,
        requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 días atrás
        approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días atrás
        tokenId: 'token-demo-1'
      },
      {
        userId: demoUserId,
        benefitId: 'comp-1',
        benefitName: 'Día Libre Extra',
        isBenefitJobby: false,
        companyId: demoCompanyId,
        status: 'pending',
        tokenCost: 100,
        requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
        justification: 'Necesito un día para asuntos personales importantes'
      },
      {
        userId: demoUserId,
        benefitId: 'jobby-2',
        benefitName: 'Cena Romántica',
        isBenefitJobby: true,
        status: 'used',
        tokenCost: 200,
        requestedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 días atrás
        approvedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 días atrás
        usedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días atrás
        tokenId: 'token-demo-2'
      }
    ];

    for (const request of benefitRequests) {
      const requestRef = push(ref(database, 'benefit_requests'));
      await set(requestRef, request);
    }
    console.log('✅ Solicitudes de beneficios creadas');

    // 6. Crear tokens de ejemplo
    const tokens = [
      {
        id: 'token-demo-1',
        userId: demoUserId,
        benefitId: 'jobby-1',
        tokenCode: 'NETFLIX2024DEMO',
        status: 'active',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(), // 27 días desde ahora
        instructions: 'Usa este código en netflix.com/redeem para obtener 3 meses gratis'
      },
      {
        id: 'token-demo-2',
        userId: demoUserId,
        benefitId: 'jobby-2',
        tokenCode: 'CENA2024USADO',
        status: 'used',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        usedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        usedBy: 'proveedor-restaurante',
        instructions: 'Presenta este código en Restaurante Elite para tu cena romántica'
      }
    ];

    for (const token of tokens) {
      await set(ref(database, `benefit_tokens/${token.id}`), token);
    }
    console.log('✅ Tokens creados');

    // 7. Crear balance de tokens actual
    const tokenBalance = {
      userId: demoUserId,
      currentTokens: 250, // Tokens disponibles
      totalEarned: 800,   // Total ganado historicamente
      totalSpent: 550,    // Total gastado
      lastUpdated: new Date().toISOString(),
      monthlyAllocation: 200, // Tokens que recibe cada mes
      bonusTokens: 50     // Tokens bonus por logros
    };

    await set(ref(database, `user_tokens/${demoUserId}`), tokenBalance);
    console.log('✅ Balance de tokens creado');

    // 8. Crear datos de logros/achievements
    const achievements = [
      {
        id: 'first-benefit',
        name: 'Primer Beneficio',
        description: 'Solicita tu primer beneficio',
        icon: '🎯',
        points: 50,
        unlocked: true,
        unlockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'netflix-fan',
        name: 'Fan de Netflix',
        description: 'Solicita beneficios de entretenimiento',
        icon: '🎬',
        points: 25,
        unlocked: true,
        unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'social-butterfly',
        name: 'Mariposa Social',
        description: 'Usa 3 beneficios sociales',
        icon: '🦋',
        points: 100,
        unlocked: false,
        progress: 1,
        target: 3
      },
      {
        id: 'survey-master',
        name: 'Maestro de Encuestas',
        description: 'Completa tu perfil de preferencias',
        icon: '📊',
        points: 75,
        unlocked: true,
        unlockedAt: new Date(demoUserData.surveyCompletedAt).toISOString()
      }
    ];

    for (const achievement of achievements) {
      await set(ref(database, `user_achievements/${demoUserId}/${achievement.id}`), achievement);
    }
    console.log('✅ Logros creados');

    // 9. Crear estadísticas del usuario
    const userStats = {
      level: 'Bronze Explorer', // Nivel actual
      totalPoints: 200,        // Puntos acumulados
      nextLevelPoints: 500,    // Puntos necesarios para siguiente nivel
      benefitsRequested: 3,    // Total de beneficios solicitados
      benefitsUsed: 1,         // Beneficios utilizados
      favoriteCategory: 'entretenimiento',
      joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Hace 30 días
      lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // Hace 1 hora
    };

    await set(ref(database, `user_stats/${demoUserId}`), userStats);
    console.log('✅ Estadísticas de usuario creadas');

    console.log('\n🎉 ¡Usuario demo creado exitosamente!');
    console.log('📧 Email: demo@demo.cl');
    console.log('🔑 Password: demo123 (configúralo en Firebase Auth)');
    console.log('🏢 Empresa: Empresa Demo');
    console.log('📊 Nivel: 3 (Usuario final)');
    console.log('🎯 Tokens disponibles: 250');
    console.log('🏆 Logros desbloqueados: 3/4');
    
    return {
      success: true,
      userId: demoUserId,
      companyId: demoCompanyId,
      message: 'Usuario demo creado con datos de ejemplo'
    };

  } catch (error) {
    console.error('❌ Error creando usuario demo:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Función para limpiar datos del usuario demo
const cleanDemoUser = async () => {
  try {
    const demoUserId = 'demo-user-123';
    const demoCompanyId = 'company-demo-456';
    
    // Eliminar todos los datos relacionados
    const pathsToClean = [
      `users/${demoUserId}`,
      `companies/${demoCompanyId}`,
      `company_benefits/${demoCompanyId}`,
      `user_tokens/${demoUserId}`,
      `user_achievements/${demoUserId}`,
      `user_stats/${demoUserId}`
    ];

    for (const path of pathsToClean) {
      await set(ref(database, path), null);
    }

    // Limpiar tokens específicos
    await set(ref(database, 'benefit_tokens/token-demo-1'), null);
    await set(ref(database, 'benefit_tokens/token-demo-2'), null);

    // Limpiar beneficios Jobby demo
    await set(ref(database, 'jobby_benefits/jobby-1'), null);
    await set(ref(database, 'jobby_benefits/jobby-2'), null);
    await set(ref(database, 'jobby_benefits/jobby-3'), null);

    console.log('🧹 Datos del usuario demo limpiados');
    return { success: true };
  } catch (error) {
    console.error('❌ Error limpiando datos demo:', error);
    return { success: false, error: error.message };
  }
};

export { createDemoUser, cleanDemoUser };