// Script para agregar datos demo al usuario demo@demo.cl existente
import { 
  ref, 
  set, 
  push, 
  get,
  update 
} from "firebase/database";
import { database } from '../services/firebase/config.js';

const addDemoData = async (demoUserId) => {
  try {
    console.log('Agregando datos demo al usuario existente...');
    
    // 1. Verificar que el usuario existe
    const userRef = ref(database, `users/${demoUserId}`);
    const userSnapshot = await get(userRef);
    
    if (!userSnapshot.exists()) {
      throw new Error('Usuario demo no encontrado. Asegúrate de crear primero el usuario demo@demo.cl');
    }

    const userData = userSnapshot.val();
    console.log('✅ Usuario encontrado:', userData.email);

    // 2. Completar datos del usuario si faltan
    const userUpdates = {
      displayName: userData.displayName || 'Usuario Demo',
      benefitPreferences: userData.benefitPreferences || 'descuentos,entretenimiento,gastronomia,viajes',
      generationalMemory: userData.generationalMemory || 'millennial',
      satisfactionLevel: userData.satisfactionLevel || 'muy-satisfecho',
      surveyCompleted: true,
      surveyCompletedAt: userData.surveyCompletedAt || new Date().toISOString()
    };

    await update(userRef, userUpdates);
    console.log('✅ Datos del usuario actualizados');

    // 3. Crear beneficios Jobby de ejemplo (si no existen)
    const jobbyBenefits = [
      {
        id: 'jobby-demo-1',
        name: 'Descuento Netflix Premium',
        description: 'Disfruta de 3 meses gratis de Netflix Premium. Accede a todo el contenido exclusivo y disfruta en hasta 4 dispositivos simultáneamente.',
        category: 'entretenimiento',
        value: '3 meses gratis',
        tokenCost: 150,
        provider: 'Netflix',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=250&fit=crop',
        popularity: 95,
        availableUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 días
      },
      {
        id: 'jobby-demo-2', 
        name: 'Cena Romántica para Dos',
        description: 'Experiencia gastronómica premium en restaurante 5 estrellas. Incluye entrada, plato principal, postre y copa de vino.',
        category: 'gastronomia',
        value: '$50.000 CLP',
        tokenCost: 200,
        provider: 'Restaurante Elite',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop',
        popularity: 87,
        availableUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'jobby-demo-3',
        name: 'Fin de Semana Spa Relajante',
        description: 'Escapada de bienestar completa con masajes, tratamientos faciales, acceso a sauna y piscina temperada.',
        category: 'bienestar',
        value: '$80.000 CLP',
        tokenCost: 300,
        provider: 'Spa Zen Relax',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
        popularity: 78,
        availableUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'jobby-demo-4',
        name: 'Curso Online de Desarrollo Web',
        description: 'Curso completo de desarrollo web full-stack con certificación incluida. 40 horas de contenido premium.',
        category: 'educacion',
        value: 'Curso completo',
        tokenCost: 180,
        provider: 'TechAcademy Pro',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
        popularity: 92,
        availableUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'jobby-demo-5',
        name: 'Aventura de Fin de Semana',
        description: 'Escapada aventurera con actividades al aire libre: trekking, kayak y camping glamping.',
        category: 'viajes',
        value: 'Paquete completo',
        tokenCost: 350,
        provider: 'Adventure Tours',
        status: 'active',
        image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=250&fit=crop',
        popularity: 83,
        availableUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    for (const benefit of jobbyBenefits) {
      await set(ref(database, `jobby_benefits/${benefit.id}`), benefit);
    }
    console.log('✅ Beneficios Jobby demo creados');

    // 4. Crear beneficios de empresa (obtener companyId del usuario)
    const companyId = userData.companyId;
    if (companyId) {
      const companyBenefits = [
        {
          id: 'comp-demo-1',
          name: 'Día Libre Extra por Trimestre',
          description: 'Un día libre adicional que puedes usar cuando lo necesites durante el trimestre.',
          category: 'tiempo',
          value: '1 día libre',
          tokenCost: 100,
          provider: 'Recursos Humanos',
          status: 'active',
          maxRedemptions: 50,
          currentRedemptions: 12,
          quarterly: true
        },
        {
          id: 'comp-demo-2',
          name: 'Almuerzo Team Building',
          description: 'Almuerzo grupal especial para fortalecer los lazos del equipo y celebrar logros.',
          category: 'social',
          value: 'Almuerzo grupal',
          tokenCost: 75,
          provider: 'Recursos Humanos',
          status: 'active',
          maxRedemptions: 20,
          currentRedemptions: 8
        },
        {
          id: 'comp-demo-3',
          name: 'Home Office Premium',
          description: 'Semana completa de trabajo remoto con kit de productividad incluido.',
          category: 'flexibilidad',
          value: '1 semana remota',
          tokenCost: 120,
          provider: 'Recursos Humanos',
          status: 'active',
          maxRedemptions: 30,
          currentRedemptions: 15
        }
      ];

      for (const benefit of companyBenefits) {
        await set(ref(database, `company_benefits/${companyId}/${benefit.id}`), benefit);
      }
      console.log('✅ Beneficios de empresa demo creados');
    }

    // 5. Crear solicitudes de beneficios de ejemplo
    const benefitRequests = [
      {
        userId: demoUserId,
        benefitId: 'jobby-demo-1',
        benefitName: 'Descuento Netflix Premium',
        isBenefitJobby: true,
        status: 'approved',
        tokenCost: 150,
        requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        tokenId: 'token-demo-1',
        justification: 'Quiero disfrutar contenido premium en mis tiempos libres'
      },
      {
        userId: demoUserId,
        benefitId: 'comp-demo-1',
        benefitName: 'Día Libre Extra por Trimestre',
        isBenefitJobby: false,
        companyId: companyId,
        status: 'pending',
        tokenCost: 100,
        requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        justification: 'Necesito un día para asuntos médicos familiares importantes'
      },
      {
        userId: demoUserId,
        benefitId: 'jobby-demo-2',
        benefitName: 'Cena Romántica para Dos',
        isBenefitJobby: true,
        status: 'used',
        tokenCost: 200,
        requestedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        approvedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        usedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        tokenId: 'token-demo-2',
        justification: 'Aniversario con mi pareja, queremos celebrar especialmente'
      },
      {
        userId: demoUserId,
        benefitId: 'jobby-demo-4',
        benefitName: 'Curso Online de Desarrollo Web',
        isBenefitJobby: true,
        status: 'approved',
        tokenCost: 180,
        requestedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        approvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        tokenId: 'token-demo-3',
        justification: 'Desarrollo profesional - quiero mejorar mis habilidades técnicas'
      }
    ];

    for (const request of benefitRequests) {
      const requestRef = push(ref(database, 'benefit_requests'));
      await set(requestRef, request);
    }
    console.log('✅ Solicitudes de beneficios demo creadas');

    // 6. Crear tokens de ejemplo
    const tokens = [
      {
        id: 'token-demo-1',
        userId: demoUserId,
        benefitId: 'jobby-demo-1',
        tokenCode: 'NETFLIX2024DEMO',
        status: 'active',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
        instructions: 'Visita netflix.com/redeem e ingresa este código para activar tus 3 meses gratis de Netflix Premium. El código debe ser usado antes de la fecha de expiración.'
      },
      {
        id: 'token-demo-2',
        userId: demoUserId,
        benefitId: 'jobby-demo-2',
        tokenCode: 'CENA2024USADO',
        status: 'used',
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        usedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        usedBy: 'proveedor-restaurante-elite',
        instructions: 'Presenta este código en Restaurante Elite (Av. Providencia 1234) junto con tu identificación para disfrutar tu cena romántica para dos.'
      },
      {
        id: 'token-demo-3',
        userId: demoUserId,
        benefitId: 'jobby-demo-4',
        tokenCode: 'TECH2024LEARN',
        status: 'active',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 84 * 24 * 60 * 60 * 1000).toISOString(),
        instructions: 'Regístrate en techacademy.pro/redeem con este código para acceder al curso completo de Desarrollo Web Full-Stack. Tienes 90 días para completar el curso.'
      }
    ];

    for (const token of tokens) {
      await set(ref(database, `benefit_tokens/${token.id}`), token);
    }
    console.log('✅ Tokens demo creados');

    // 7. Crear balance de tokens actual
    const tokenBalance = {
      userId: demoUserId,
      currentTokens: 320, // Tokens disponibles actuales
      totalEarned: 1050,   // Total ganado desde que se unió
      totalSpent: 730,    // Total gastado en beneficios
      lastUpdated: new Date().toISOString(),
      monthlyAllocation: 200, // Tokens base mensuales
      bonusTokens: 120,   // Tokens bonus por logros y desafíos
      lastMonthlyGrant: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    };

    await set(ref(database, `user_tokens/${demoUserId}`), tokenBalance);
    console.log('✅ Balance de tokens demo creado');

    // 8. Crear logros/achievements
    const achievements = [
      {
        id: 'first-benefit',
        name: 'Primer Beneficio',
        description: 'Solicita tu primer beneficio exitosamente',
        icon: '🎯',
        points: 50,
        unlocked: true,
        unlockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'milestone'
      },
      {
        id: 'netflix-fan',
        name: 'Amante del Entretenimiento',
        description: 'Solicita un beneficio de entretenimiento',
        icon: '🎬',
        points: 25,
        unlocked: true,
        unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'category'
      },
      {
        id: 'social-butterfly',
        name: 'Mariposa Social',
        description: 'Usa 3 beneficios diferentes en un mes',
        icon: '🦋',
        points: 100,
        unlocked: false,
        progress: 2,
        target: 3,
        category: 'challenge'
      },
      {
        id: 'survey-master',
        name: 'Explorador de Preferencias',
        description: 'Completa tu perfil de preferencias',
        icon: '📊',
        points: 75,
        unlocked: true,
        unlockedAt: new Date(userUpdates.surveyCompletedAt).toISOString(),
        category: 'profile'
      },
      {
        id: 'learning-enthusiast',
        name: 'Entusiasta del Aprendizaje',
        description: 'Solicita un beneficio educativo',
        icon: '📚',
        points: 60,
        unlocked: true,
        unlockedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'category'
      },
      {
        id: 'month-streak',
        name: 'Racha Mensual',
        description: 'Usa al menos un beneficio cada mes por 3 meses',
        icon: '🔥',
        points: 150,
        unlocked: false,
        progress: 1,
        target: 3,
        category: 'streak'
      }
    ];

    for (const achievement of achievements) {
      await set(ref(database, `user_achievements/${demoUserId}/${achievement.id}`), achievement);
    }
    console.log('✅ Logros demo creados');

    // 9. Crear estadísticas del usuario
    const userStats = {
      level: 'Bronze Explorer', // Nivel actual
      levelIcon: '🥉',
      totalPoints: 310,        // Puntos acumulados
      nextLevel: 'Silver Adventurer',
      nextLevelIcon: '🥈',
      nextLevelPoints: 500,    // Puntos necesarios para siguiente nivel
      benefitsRequested: 4,    // Total de beneficios solicitados
      benefitsUsed: 1,         // Beneficios ya utilizados
      benefitsActive: 2,       // Beneficios activos (aprobados pero no usados)
      favoriteCategory: 'entretenimiento',
      secondaryCategory: 'educacion',
      joinedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // Hace 45 días
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Hace 2 horas
      loginStreak: 7, // Días consecutivos de login
      monthlyGoal: {
        target: 3,
        current: 1,
        description: 'Usar 3 beneficios este mes'
      }
    };

    await set(ref(database, `user_stats/${demoUserId}`), userStats);
    console.log('✅ Estadísticas demo creadas');

    // 10. Crear actividad reciente
    const recentActivities = [
      {
        type: 'benefit_used',
        description: 'Usaste el beneficio "Cena Romántica para Dos"',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        icon: '🍽️',
        points: 25
      },
      {
        type: 'benefit_approved',
        description: 'Tu solicitud de "Curso Online de Desarrollo Web" fue aprobada',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        icon: '✅',
        points: 10
      },
      {
        type: 'achievement_unlocked',
        description: 'Desbloqueaste el logro "Entusiasta del Aprendizaje"',
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        icon: '🏆',
        points: 60
      },
      {
        type: 'tokens_received',
        description: 'Recibiste 200 tokens mensuales',
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        icon: '💰',
        points: 0
      }
    ];

    for (let i = 0; i < recentActivities.length; i++) {
      await set(ref(database, `user_activity/${demoUserId}/activity_${Date.now() - i}`), recentActivities[i]);
    }
    console.log('✅ Actividad reciente demo creada');

    console.log('\n🎉 ¡Datos demo agregados exitosamente!');
    console.log('📧 Usuario: demo@demo.cl');
    console.log('🎯 Tokens disponibles: 320');
    console.log('🏆 Logros desbloqueados: 4/6');
    console.log('📈 Nivel: Bronze Explorer (310/500 puntos)');
    console.log('📋 Solicitudes: 4 (1 pendiente, 2 aprobadas, 1 usada)');
    console.log('🎫 Tokens activos: 2');
    
    return {
      success: true,
      userId: demoUserId,
      stats: userStats,
      message: 'Datos demo agregados exitosamente'
    };

  } catch (error) {
    console.error('❌ Error agregando datos demo:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export { addDemoData };