import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, Circle, ChevronRight, ArrowRight, 
  Gift, Package, Users, Settings, FileCheck, Clock, 
  Briefcase, Book, Award, Heart
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
    { id: 'entertainment', name: 'Entretenimiento', icon: <Gift size={24} />, description: 'Streaming, eventos culturales, conciertos, cine' },
    { id: 'work_life', name: 'Equilibrio Vida-Trabajo', icon: <Briefcase size={24} />, description: 'Días libres, teletrabajo, horario flexible' },
    { id: 'recognition', name: 'Reconocimiento', icon: <Award size={24} />, description: 'Premios, incentivos, programas de referidos' }
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
                  <CheckCircle size={20} />
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
  
  // Render el paso actual del onboarding
  const renderStep = () => {
    switch (steps[currentStep].id) {
      // Casos case 'welcome' hasta case 'employees' omitidos para brevedad
        
      case 'review':
        return (
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
                    {benefitsSelected.map((id) => {
                      const benefit = benefitsCatalog.find(b => b.id === id);
                      return benefit ? (
                        <div key={id} className="flex items-center bg-jobby-purple/10 text-jobby-purple px-2 py-1 rounded-md text-xs">
                          {benefit.name}
                        </div>
                      ) : null;
                    })}
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
            
            <div className="space-y-4 mb-6">
              <h3 className="font-medium text-jobby-gray-800">Próximos pasos</h3>
              
              <div className="flex items-start">
                <div className="bg-jobby-purple text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium mr-3 flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-jobby-gray-800">Personaliza los beneficios</p>
                  <p className="text-sm text-jobby-gray-600">Define opciones específicas para cada categoría de beneficios</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-jobby-purple text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium mr-3 flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-jobby-gray-800">Configura políticas</p>
                  <p className="text-sm text-jobby-gray-600">Establece reglas de uso y aprobación para los beneficios</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-jobby-purple text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium mr-3 flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-jobby-gray-800">Explora el panel de control</p>
                  <p className="text-sm text-jobby-gray-600">Conoce todas las funciones disponibles para gestionar los beneficios</p>
                </div>
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
                Ir al Panel de Control
              </button>
            </div>
          </motion.div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="bg-jobby-gray-100 p-6 min-h-screen">
      <ProgressBar />
      {renderStep()}
    </div>
  );
};

export default OnboardingDashboard;