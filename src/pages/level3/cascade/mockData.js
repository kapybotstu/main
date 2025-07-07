// Mock data para probar el layout Masonry
export const mockBenefits = [
  {
    id: 1,
    name: "Descuento 50% en McDonald's",
    description: "Obtén un 50% de descuento en tu combo favorito. Válido en todas las sucursales del país.",
    category: "Comida",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop",
    tokensRequired: 1,
    provider: "McDonald's",
    isJobbyBenefit: true
  },
  {
    id: 2,
    name: "Membresía Premium Netflix",
    description: "3 meses gratis de Netflix Premium. Disfruta de contenido 4K en múltiples dispositivos.",
    category: "Entretenimiento",
    image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=300&fit=crop",
    tokensRequired: 3,
    provider: "Netflix",
    isJobbyBenefit: true
  },
  {
    id: 3,
    name: "Clase de Yoga Grupal",
    description: "Una sesión de yoga relajante en nuestro estudio. Incluye mat y agua.",
    category: "Bienestar",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
    tokensRequired: 2,
    provider: "Yoga Studio",
    isJobbyBenefit: false
  },
  {
    id: 4,
    name: "Entrada al Cine",
    description: "Boleto para cualquier función en horario regular. Incluye descuento en confitería.",
    category: "Entretenimiento",
    image: "https://images.unsplash.com/photo-1489185078527-1e72695d2d7a?w=400&h=300&fit=crop",
    tokensRequired: 1,
    provider: "Cinemark",
    isJobbyBenefit: true
  },
  {
    id: 5,
    name: "Masaje Relajante 60min",
    description: "Masaje terapéutico de cuerpo completo. Perfecto para aliviar el estrés del trabajo.",
    category: "Bienestar",
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400&h=300&fit=crop",
    tokensRequired: 4,
    provider: "Spa Relax",
    isJobbyBenefit: false
  },
  {
    id: 6,
    name: "Curso Online de Programación",
    description: "Acceso completo a curso de React.js. Incluye certificado y soporte de instructor.",
    category: "Educación",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop",
    tokensRequired: 5,
    provider: "TechAcademy",
    isJobbyBenefit: true
  },
  {
    id: 7,
    name: "Cena Romántica para 2",
    description: "Menú degustación de 5 tiempos en restaurante gourmet. Incluye vino de la casa.",
    category: "Comida",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
    tokensRequired: 6,
    provider: "Restaurant Elite",
    isJobbyBenefit: false
  },
  {
    id: 8,
    name: "Suscripción Spotify Premium",
    description: "6 meses de Spotify Premium. Música sin límites y sin anuncios.",
    category: "Entretenimiento",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    tokensRequired: 2,
    provider: "Spotify",
    isJobbyBenefit: true
  },
  {
    id: 9,
    name: "Sesión de Entrenamiento Personal",
    description: "Una hora de entrenamiento personalizado con nuestro coach certificado.",
    category: "Bienestar",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    tokensRequired: 3,
    provider: "GymFit",
    isJobbyBenefit: false
  },
  {
    id: 10,
    name: "Tarde de Karting",
    description: "15 minutos de karting en pista profesional. Incluye casco y equipo de seguridad.",
    category: "Aventura",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    tokensRequired: 3,
    provider: "SpeedKart",
    isJobbyBenefit: true
  },
  {
    id: 11,
    name: "Consulta Nutricional",
    description: "Evaluación completa con nutricionista. Incluye plan alimentario personalizado.",
    category: "Salud",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop",
    tokensRequired: 2,
    provider: "NutriSalud",
    isJobbyBenefit: false
  },
  {
    id: 12,
    name: "Fin de Semana en Cabañas",
    description: "2 noches en cabaña para 4 personas. Incluye desayuno y acceso a piscina.",
    category: "Viajes",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
    tokensRequired: 10,
    provider: "Cabañas del Bosque",
    isJobbyBenefit: true
  }
];

// Función para simular carga de datos
export const loadBenefits = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBenefits);
    }, 1000);
  });
};