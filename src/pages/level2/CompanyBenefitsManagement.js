import React, { useState, useEffect } from 'react';
import { ref, onValue, push, update, get } from 'firebase/database';
import { database } from '../../services/firebase/config';
import { useAuth } from '../../context/AuthContext';
import BenefitUsageChart from '../../components/BenefitUsageChart';
import EmployeeBenefitUsageChart from '../../components/EmployeeBenefitUsageChart';
import './CompanyBenefitsManagement.css';

const CompanyBenefitsManagement = () => {
  const { currentUser, companyId } = useAuth();
  const [companyBenefits, setCompanyBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estado para nuevo beneficio
  const [newBenefit, setNewBenefit] = useState({
    title: '',
    description: '',
    availableTokens: 10,
    limitPerUser: 1,
    startDate: '',
    endDate: ''
  });
  
  // Estado para modo edición
  const [editMode, setEditMode] = useState(false);
  const [currentBenefitId, setCurrentBenefitId] = useState(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  
  // Estado para estadísticas y gráficos
  const [companyUsers, setCompanyUsers] = useState([]);
  const [benefitRequests, setBenefitRequests] = useState([]);
  const [jobbyBenefitStats, setJobbyBenefitStats] = useState([]);
  const [companyBenefitStats, setCompanyBenefitStats] = useState([]);
  
  useEffect(() => {
    if (!companyId) {
      setError('No se ha asignado una empresa a este usuario');
      setLoading(false);
      return;
    }
    
    const fetchBenefits = () => {
      const benefitsRef = ref(database, `company_benefits/${companyId}`);
      
      onValue(benefitsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const benefitsList = Object.entries(data).map(([id, benefit]) => ({
            id,
            ...benefit
          }));
          
          // Ordenar por fecha de creación
          benefitsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          setCompanyBenefits(benefitsList);
        } else {
          setCompanyBenefits([]);
        }
        setLoading(false);
      });
    };
    
    // Obtener usuarios de la empresa
    const fetchUsers = () => {
      const usersRef = ref(database, 'users');
      
      onValue(usersRef, (snapshot) => {
        const users = [];
        
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const userData = childSnapshot.val();
            
            if (userData.companyId === companyId && userData.level === 3) {
              users.push({
                id: childSnapshot.key,
                ...userData
              });
            }
          });
        }
        
        setCompanyUsers(users);
      });
    };
    
    // Obtener solicitudes de beneficios para estadísticas
    const fetchBenefitRequests = () => {
      const requestsRef = ref(database, 'benefit_requests');
      
      onValue(requestsRef, (snapshot) => {
        const allRequests = [];
        const jobbyStats = [];
        const companyStats = [];
        
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const requestData = childSnapshot.val();
            const requestId = childSnapshot.key;
            
            // Buscar solicitudes relacionadas con esta empresa
            // Usamos companyId como filtro principal
            if (requestData.companyId === companyId) {
              
              allRequests.push({
                id: requestId,
                ...requestData
              });
              
              // Datos para gráficos según tipo de beneficio
              if (requestData.isBenefitJobby) {
                jobbyStats.push({
                  id: requestId,
                  ...requestData
                });
              } else if (requestData.companyId === companyId) {
                companyStats.push({
                  id: requestId,
                  ...requestData
                });
              }
            }
          });
        }
        
        setBenefitRequests(allRequests);
        setJobbyBenefitStats(jobbyStats);
        setCompanyBenefitStats(companyStats);
      });
    };
    
    fetchBenefits();
    fetchUsers();
    
    // Pequeño retraso para asegurar que tenemos los usuarios antes de buscar solicitudes
    const timer = setTimeout(() => {
      fetchBenefitRequests();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [companyId]);
  
  // Manejar cambios en formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewBenefit(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Crear o actualizar beneficio
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!companyId) {
      setError('No se ha asignado una empresa a este usuario');
      return;
    }
    
    try {
      setError('');
      
      // Validar datos
      if (!newBenefit.title || !newBenefit.description) {
        setError('Los campos Título y Descripción son obligatorios');
        return;
      }
      
      if (editMode && currentBenefitId) {
        // Actualizar beneficio existente
        const benefitRef = ref(database, `company_benefits/${companyId}/${currentBenefitId}`);
        await update(benefitRef, {
          ...newBenefit,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser.uid
        });
        
        setSuccess('Beneficio actualizado correctamente');
        setEditMode(false);
        setCurrentBenefitId(null);
      } else {
        // Crear nuevo beneficio
        const newBenefitRef = push(ref(database, `company_benefits/${companyId}`));
        
        await update(newBenefitRef, {
          ...newBenefit,
          status: 'active',
          createdAt: new Date().toISOString(),
          createdBy: currentUser.uid
        });
        
        setSuccess('Beneficio creado correctamente');
      }
      
      // Resetear formulario
      setNewBenefit({
        title: '',
        description: '',
        availableTokens: 10,
        limitPerUser: 1,
        startDate: '',
        endDate: ''
      });
      
      setShowModal(false);
    } catch (error) {
      setError(`Error: ${error.message}`);
    }
  };
  
  // Editar beneficio
  const handleEditBenefit = (benefit) => {
    setNewBenefit({
      title: benefit.title,
      description: benefit.description,
      availableTokens: benefit.availableTokens || 10,
      limitPerUser: benefit.limitPerUser || 1,
      startDate: benefit.startDate || '',
      endDate: benefit.endDate || ''
    });
    
    setEditMode(true);
    setCurrentBenefitId(benefit.id);
    setShowModal(true);
  };
  
  // Activar/Desactivar beneficio
  const handleToggleStatus = async (benefitId, currentStatus) => {
    if (!companyId) return;
    
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? 'activar' : 'desactivar';
    
    if (window.confirm(`¿Estás seguro de que deseas ${actionText} este beneficio?`)) {
      try {
        const benefitRef = ref(database, `company_benefits/${companyId}/${benefitId}`);
        await update(benefitRef, {
          status: newStatus,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser.uid
        });
        
        setSuccess(`Beneficio ${actionText}do correctamente`);
      } catch (error) {
        setError(`Error al ${actionText} beneficio: ${error.message}`);
      }
    }
  };
  
  // Mensaje temporal de éxito o error
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);
  
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  if (!companyId) {
    return (
      <div className="level2-benefits-container">
        <div className="level2-benefits-header">
          <h1>Gestión de Beneficios Internos</h1>
        </div>
        <div className="level2-benefits-content">
          <div className="level2-error-alert">
            No se ha asignado una empresa a este usuario. Por favor, contacte con el administrador de Jobby.
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="level2-benefits-container">
      {/* HEADER PRINCIPAL FIJO */}
      <div className="level2-benefits-header">
        <h1>Gestión de Beneficios Internos</h1>
        <button 
          className="level2-btn-primary" 
          onClick={() => {
            setEditMode(false);
            setNewBenefit({
              title: '',
              description: '',
              availableTokens: 10,
              limitPerUser: 1,
              startDate: '',
              endDate: ''
            });
            setShowModal(true);
          }}
        >
          Agregar Beneficio
        </button>
      </div>
      
      {/* CONTENIDO DEL DASHBOARD */}
      <div className="level2-benefits-content">
        {error && <div className="level2-error-alert">{error}</div>}
        {success && <div className="level2-success-alert">{success}</div>}
        
        {/* LAYOUT PRINCIPAL */}
        <div className="level2-main-layout">
        {/* Card 1: Uso de Beneficios (gráfico) */}
        <div className="level2-stats-section">
          <div className="level2-card">
            <div className="level2-card-header">
              <h2 className="level2-card-title">Uso de Beneficios</h2>
              <div className="level2-card-subtitle">Análisis de beneficios Jobby vs. beneficios de empresa</div>
            </div>
            
            <div className="level2-chart-section">
              <div className="level2-chart-container">
                <BenefitUsageChart 
                  jobbyBenefitData={jobbyBenefitStats} 
                  companyBenefitData={companyBenefitStats} 
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Card 2: Enlaces a Productos */}
        <div className="level2-links-section">
          <div className="level2-card">
            <div className="level2-card-header">
              <h2 className="level2-card-title">Enlaces a Productos</h2>
              <div className="level2-card-subtitle">Últimas solicitudes con enlaces de productos</div>
            </div>
            
            <div className="level2-benefit-insights">
              <div className="level2-links-container">
                {benefitRequests
                  .filter(req => req.productLink && req.isBenefitJobby)
                  .slice(0, 8)
                  .map((req, index) => (
                    <div key={req.id} className="level2-product-link-item">
                      <span className="level2-employee-name">
                        {req.userEmail || req.userName || 'Usuario'}
                      </span>
                      <a href={req.productLink} target="_blank" rel="noopener noreferrer" className="level2-product-link">
                        {req.productLink}
                      </a>
                      <span className="level2-request-date">
                        {new Date(req.requestDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                
                {benefitRequests.filter(req => req.productLink && req.isBenefitJobby).length === 0 && (
                  <div className="level2-no-links-message">
                    No hay enlaces a productos solicitados todavía.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Card 3: Beneficios Internos (tabla) */}
        <div className="level2-benefits-section">
          <div className="level2-card">
            <div className="level2-card-header">
              <h2 className="level2-card-title">Beneficios Internos</h2>
              <div className="level2-card-subtitle">Lista de beneficios creados por la empresa</div>
            </div>
            
            {companyBenefits.length === 0 ? (
              <div className="level2-no-data-message">
                <p>No hay beneficios internos registrados aún.</p>
              </div>
            ) : (
              <div className="level2-table-container">
                <div className="level2-table-wrapper">
                  <table className="level2-table">
                    <thead>
                      <tr>
                        <th>Información del Beneficio</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companyBenefits.map((benefit) => (
                        <tr key={benefit.id}>
                          <td>
                            <div className="level2-benefit-title">
                              {benefit.title}
                            </div>
                            <div className="level2-benefit-description">
                              {benefit.description.length > 60 
                                ? `${benefit.description.substring(0, 60)}...` 
                                : benefit.description}
                            </div>
                          </td>
                          <td>
                            <span className={`level2-badge level2-badge-${benefit.status === 'active' ? 'success' : 'error'}`}>
                              {benefit.status === 'active' ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td>
                            <div className="level2-action-buttons">
                              <button 
                                className="level2-btn-action edit"
                                onClick={() => handleEditBenefit(benefit)}
                              >
                                Editar
                              </button>
                              
                              <button 
                                className={`level2-btn-action ${benefit.status === 'active' ? 'deactivate' : 'activate'}`}
                                onClick={() => handleToggleStatus(benefit.id, benefit.status)}
                              >
                                {benefit.status === 'active' ? 'Desactivar' : 'Activar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
      
      {/* Modal para crear/editar beneficio */}
      {showModal && (
        <div className="level2-modal-overlay">
          <div className="level2-modal-container">
            <div className="level2-modal-header">
              <h2>{editMode ? 'Editar Beneficio Interno' : 'Agregar Beneficio Interno'}</h2>
              <button className="level2-close-button" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form className="level2-form" onSubmit={handleSubmit}>
              <div className="level2-form-group">
                <label htmlFor="title">Título *</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={newBenefit.title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="level2-form-group">
                <label htmlFor="description">Descripción *</label>
                <textarea
                  id="description"
                  name="description"
                  value={newBenefit.description}
                  onChange={handleChange}
                  required
                  rows="4"
                />
              </div>
              
              <div className="level2-form-group">
                <label htmlFor="availableTokens">Tokens Disponibles</label>
                <input
                  id="availableTokens"
                  name="availableTokens"
                  type="number"
                  min="1"
                  value={newBenefit.availableTokens}
                  onChange={handleChange}
                />
                <small>Número máximo de veces que se puede usar este beneficio</small>
              </div>
              
              <div className="level2-form-group">
                <label htmlFor="limitPerUser">Límite por Usuario</label>
                <input
                  id="limitPerUser"
                  name="limitPerUser"
                  type="number"
                  min="1"
                  value={newBenefit.limitPerUser}
                  onChange={handleChange}
                />
                <small>Número máximo de veces que un usuario puede solicitar este beneficio</small>
              </div>
              
              <div className="level2-form-group">
                <label htmlFor="startDate">Fecha de Inicio</label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={newBenefit.startDate}
                  onChange={handleChange}
                />
              </div>
              
              <div className="level2-form-group">
                <label htmlFor="endDate">Fecha de Fin</label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={newBenefit.endDate}
                  onChange={handleChange}
                />
              </div>
              
              <div className="level2-form-actions">
                <button type="button" className="level2-btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="level2-btn-primary">
                  {editMode ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyBenefitsManagement;