import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronRight, Circle, Gift, Package, Users, 
  FileCheck, Book, Award, Heart
} from 'lucide-react';

// Dashboard para "Onboarding para empresas"
const OnboardingDashboard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [benefitsSelected, setBenefitsSelected] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  
  // Pasos del onboarding
  const steps = [
    { id: 'welcome', title: 'Bienvenida', description: 'Empecemos el proceso de configuración' },
    { id: 'company', title: 'Empresa', description: 'Información de tu organización' },
    { id: 'benefits', title: 'Beneficios', description: 'Selecciona los beneficios para tu equipo' },
    { id: 'budget', title: 'Presupuesto', description: 'Define el presupuesto por empleado' },
    { id: 'employees', title: 'Empleados', description: 'Invita a tu equipo' },
    { id: 'review', title: 'Revisión', description: 'Confirma la configuración' }
  ];
  
  // Catálogo de beneficios disponibles
  const benefitsCatalog = [
    { id: 'health', name: 'Salud y Bienestar', icon: <Heart size={24} />, description: 'Seguro médico, dental, óptico, gimnasio, mindfulness' },
    { id: 'food', name: 'Alimentación', icon: <Package size={24} />, description: 'Tarjetas de comida, cupones para restaurantes, comida a domicilio' },
    { id: 'education', name: 'Educación', icon: <Book size={24} />, description: 'Cursos online, libros, conferencias, certificaciones' },
    { id: 'entertainment', name: 'Entretenimiento', icon: <Gift size={24} />, description: 'Streaming, eventos culturales, conciertos, cine' }
  ];
  
  // Planes de precios
  const pricingPlans = [
    { 
      id: 'basic', 
      name: 'Básico', 
      price: 50, 
      features: [
        'Hasta 3 categorías de beneficios',
        'Panel de control básico',
        'Soporte por email'
      ],
      recommended: false
    },
    { 
      id: 'pro', 
      name: 'Profesional', 
      price: 75, 
      features: [
        'Beneficios ilimitados',
        'Panel de análisis avanzado',
        'Integraciones con HRIS',
        'Soporte prioritario'
      ],
      recommended: true
    },
    { 
      id: 'enterprise', 
      name: 'Empresarial', 
      price: 100, 
      features: [
        'Soluciones personalizadas',
        'API dedicada',
        'Gerente de cuenta exclusivo',
        'SLA garantizado'
      ],
      recommended: false
    }
  ];
  
  const handleBenefitToggle = (benefitId: string) => {
    if (benefitsSelected.includes(benefitId)) {
      setBenefitsSelected(benefitsSelected.filter(id => id !== benefitId));
    } else {
      setBenefitsSelected([...benefitsSelected, benefitId]);
    }
  };
  
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Componente para la barra de progreso
  const ProgressBar = () => (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Paso */}
            <div className="flex flex-col items-center">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  index < currentStep 
                    ? 'bg-jobby-purple text-white' 
                    : index === currentStep 
                      ? 'bg-white border-2 border-jobby-purple text-jobby-purple' 
                      : 'bg-white border-2 border-jobby-gray-300 text-jobby-gray-400'
                }`}
              >
                {index < currentStep ? (
                  <Circle size={20} />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span className={`text-xs mt-2 ${
                index <= currentStep ? 'text-jobby-gray-800 font-medium' : 'text-jobby-gray-500'
              }`}>
                {step.title}
              </span>
            </div>
            
            {/* Línea conectora (excepto para el último paso) */}
            {index < steps.length - 1 && (
              <div className="w-full max-w-[80px] h-0.5 bg-jobby-gray-200 mx-1">
                <div className={`h-full bg-jobby-purple transition-all ${
                  index < currentStep ? 'w-full' : 'w-0'
                }`}></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
  
  // Vamos a renderizar solo la página de revisión (paso final)
  // Este será nuestro dashboard "freemium" con solo 3 widgets principales
  return (
    <div className="bg-jobby-gray-100 p-6 min-h-screen">
      <ProgressBar />
      
      {/* Panel de revisión - Versión freemium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-8 max-w-2xl mx-auto"
      >
        <div className="text-center mb-6">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileCheck size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-jobby-gray-800 mb-2">¡Todo listo!</h2>
          <p className="text-jobby-gray-600">
            Has completado la configuración inicial de beneficios para tu empresa.
          </p>
        </div>
        
        <div className="bg-jobby-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-jobby-gray-800 mb-3">Resumen de la configuración</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-jobby-gray-500">Empresa</p>
              <p className="font-medium text-jobby-gray-800">TechCorp Inc.</p>
            </div>
            
            <div>
              <p className="text-sm text-jobby-gray-500">Beneficios seleccionados</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {benefitsSelected.length > 0 ? benefitsSelected.map((id) => {
                  const benefit = benefitsCatalog.find(b => b.id === id);
                  return benefit ? (
                    <div key={id} className="flex items-center bg-jobby-purple/10 text-jobby-purple px-2 py-1 rounded-md text-xs">
                      {benefit.name}
                    </div>
                  ) : null;
                }) : (
                  <div className="flex items-center bg-jobby-purple/10 text-jobby-purple px-2 py-1 rounded-md text-xs">
                    Salud y Bienestar
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-jobby-gray-500">Plan</p>
              <p className="font-medium text-jobby-gray-800">
                {pricingPlans.find(p => p.id === selectedPlan)?.name} - ${pricingPlans.find(p => p.id === selectedPlan)?.price}/mes por empleado
              </p>
            </div>
            
            <div>
              <p className="text-sm text-jobby-gray-500">Empleados invitados</p>
              <p className="font-medium text-jobby-gray-800">3 invitaciones enviadas</p>
            </div>
          </div>
        </div>
        
        {/* Widgets simplificados (versión freemium) */}
        <div className="space-y-6 mb-6">
          <h3 className="font-medium text-jobby-gray-800">Funciones disponibles (3)</h3>
          
          {/* Widget 1: Progreso */}
          <div className="p-4 bg-white border border-jobby-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center mb-3">
              <div className="p-2 rounded-full bg-jobby-purple/10 text-jobby-purple mr-2">
                <ChevronRight size={18} />
              </div>
              <h4 className="font-medium text-jobby-gray-800">Progreso de implementación</h4>
            </div>
            <div className="w-full h-2 bg-jobby-gray-100 rounded-full">
              <div className="h-full bg-jobby-purple rounded-full" style={{ width: '30%' }}></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-jobby-gray-600">30% completado</span>
              <span className="text-sm text-jobby-gray-600">2 de 6 pasos</span>
            </div>
          </div>
          
          {/* Widget 2: Beneficios */}
          <div className="p-4 bg-white border border-jobby-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center mb-3">
              <div className="p-2 rounded-full bg-jobby-purple/10 text-jobby-purple mr-2">
                <Gift size={18} />
              </div>
              <h4 className="font-medium text-jobby-gray-800">Beneficios seleccionados</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Salud (40%)</div>
              <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">Alimentación (25%)</div>
              <div className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">Entretenimiento (15%)</div>
            </div>
          </div>
          
          {/* Widget 3: Empleados */}
          <div className="p-4 bg-white border border-jobby-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center mb-3">
              <div className="p-2 rounded-full bg-jobby-purple/10 text-jobby-purple mr-2">
                <Users size={18} />
              </div>
              <h4 className="font-medium text-jobby-gray-800">Empleados invitados</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-jobby-gold flex items-center justify-center text-white">
                    MG
                  </div>
                  <span className="ml-2 text-sm">María González</span>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Activo</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-jobby-purple flex items-center justify-center text-white">
                    CL
                  </div>
                  <span className="ml-2 text-sm">Carlos López</span>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pendiente</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-jobby-gold flex items-center justify-center text-white">
                    LM
                  </div>
                  <span className="ml-2 text-sm">Laura Martínez</span>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pendiente</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Widgets bloqueados */}
        <div className="bg-jobby-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-full bg-jobby-purple/10 text-jobby-purple mr-3 flex-shrink-0">
              <Award size={18} />
            </div>
            <h4 className="font-medium text-jobby-gray-800">Funciones premium (bloqueadas)</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              'Dashboard personalizable',
              'Análisis avanzado',
              'Integraciones API',
              'Reportes automáticos',
              'Administración de usuarios',
              'Gestión de proveedores',
              'Calendario y eventos',
              'Notificaciones'
            ].map((feature, index) => (
              <div key={index} className="p-3 border border-dashed border-gray-300 rounded-lg bg-white/50 flex items-center">
                <div className="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center mr-2">
                  <span className="text-gray-300 text-xs">+</span>
                </div>
                <span className="text-sm text-gray-500">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={goToPreviousStep}
            className="flex-1 flex items-center justify-center gap-2 bg-jobby-gray-100 text-jobby-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-jobby-gray-200"
          >
            Editar configuración
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 bg-jobby-purple text-white py-3 px-4 rounded-lg font-medium hover:bg-jobby-purple-dark"
          >
            Desbloquear Funciones Premium
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingDashboard;