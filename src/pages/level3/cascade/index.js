import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Masonry from './components/Masonry';
import BenefitModal from './components/BenefitModal';
import { NotificationProvider, useNotification } from './components/NotificationSystem';
import BenefitsService from './services/benefitsService';
import '../styles/index.css';
import './styles/index.css';

const CascadeContent = () => {
  const { currentUser, companyId } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  const [loading, setLoading] = useState(true);
  const [benefits, setBenefits] = useState([]);
  const [benefitsLoading, setBenefitsLoading] = useState(true);
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [userTokenBalance, setUserTokenBalance] = useState(0);

  const loadUserTokenBalance = useCallback(async () => {
    try {
      if (currentUser?.uid) {
        const balance = await BenefitsService.getUserTokenBalance(currentUser.uid);
        setUserTokenBalance(balance);
      }
    } catch (error) {
      console.error('Error cargando balance de tokens:', error);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    if (currentUser?.uid) {
      setLoading(false);
      
      // Suscribirse a cambios en beneficios con cleanup
      setBenefitsLoading(true);
      setError(null);
      
      const unsubscribe = BenefitsService.subscribeToJobbyBenefits((jobbyBenefits) => {
        setBenefits(jobbyBenefits);
        setBenefitsLoading(false);
        console.log('Beneficios actualizados desde Firebase:', jobbyBenefits.length);
      });
      
      // Cargar balance de tokens
      loadUserTokenBalance();
      
      // Cleanup function
      return () => {
        unsubscribe();
      };
    }
  }, [currentUser, loadUserTokenBalance]);

  const loadBenefitsFromFirebase = useCallback(async () => {
    try {
      setBenefitsLoading(true);
      setError(null);
      
      const jobbyBenefits = await BenefitsService.getJobbyBenefits();
      setBenefits(jobbyBenefits);
      
      console.log('Beneficios cargados desde Firebase:', jobbyBenefits.length);
    } catch (error) {
      console.error('Error cargando beneficios:', error);
      setError('Error al cargar los beneficios. Por favor, intenta de nuevo.');
    } finally {
      setBenefitsLoading(false);
    }
  }, []);

  const handleBenefitRedeem = useMemo(() => (benefit) => {
    setSelectedBenefit(benefit);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useMemo(() => () => {
    setIsModalOpen(false);
    setSelectedBenefit(null);
  }, []);

  const handleConfirmRedeem = useMemo(() => async (benefit) => {
    try {
      console.log('Iniciando canje de beneficio:', benefit);
      
      // Verificar que el usuario tenga tokens suficientes
      if (userTokenBalance < benefit.tokensRequired) {
        showWarning(
          `Necesitas ${benefit.tokensRequired} tokens y tienes ${userTokenBalance}`,
          'Tokens Insuficientes'
        );
        return;
      }

      // Crear solicitud de beneficio en Firebase
      const requestId = await BenefitsService.requestBenefit(
        currentUser.uid,
        benefit,
        companyId
      );

      console.log('Solicitud creada con ID:', requestId);
      
      // Actualizar balance de tokens
      await loadUserTokenBalance();
      
      // Mostrar mensaje de éxito
      showSuccess(
        `¡${benefit.name} canjeado exitosamente! Tu solicitud ${requestId.slice(-8)} está siendo procesada.`,
        'Canje Exitoso'
      );
      
      handleCloseModal();
    } catch (error) {
      console.error('Error canjeando beneficio:', error);
      showError(
        'Hubo un problema al procesar tu solicitud. Por favor, intenta de nuevo.',
        'Error en el Canje'
      );
    }
  }, [userTokenBalance, currentUser?.uid, companyId, loadUserTokenBalance, handleCloseModal, showSuccess, showError, showWarning]);

  if (loading) {
    return (
      <div className="cascade-loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
        </div>
        <p>Cargando Cascade...</p>
      </div>
    );
  }

  return (
    <div className="cascade-container">
      <div className="cascade-content">
        {error ? (
          <div className="cascade-error">
            <div className="error-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h3>Error al cargar beneficios</h3>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={loadBenefitsFromFirebase}
            >
              Reintentar
            </button>
          </div>
        ) : (
          <Masonry
            items={benefits}
            onItemRedeem={handleBenefitRedeem}
            ease="cubic-bezier(0.23, 1, 0.32, 1)"
            duration={0.6}
            stagger={0.05}
            animateFrom="bottom"
            scaleOnHover={true}
            hoverScale={0.95}
            blurToFocus={false}
            colorShiftOnHover={true}
            loading={benefitsLoading}
          />
        )}
      </div>

      {/* Modal de canje */}
      <BenefitModal
        benefit={selectedBenefit}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirmRedeem={handleConfirmRedeem}
        userTokenBalance={userTokenBalance}
      />
    </div>
  );
};

// Componente principal con Provider de notificaciones
const Cascade = () => {
  return (
    <NotificationProvider>
      <CascadeContent />
    </NotificationProvider>
  );
};

export default Cascade;