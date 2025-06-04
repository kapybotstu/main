import React, { useState, useEffect } from 'react';
import { ref, onValue, push, update } from 'firebase/database';
import { database } from '../../../services/firebase/config';
import './JobbyBenefitsManagement.css';

const JobbyBenefitsManagement = () => {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estado para nuevo beneficio
  const [newBenefit, setNewBenefit] = useState({
    title: '',
    description: '',
    type: 'automatic', // automatic, managed, third_party
    value: '',
    provider: '',
    category: '',
    image: '',
    isHighlighted: false,
    availableTokens: 100
  });
  
  // Estado para modo edición
  const [editMode, setEditMode] = useState(false);
  const [currentBenefitId, setCurrentBenefitId] = useState(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  
  // Obtener beneficios
  useEffect(() => {
    const fetchBenefits = () => {
      const benefitsRef = ref(database, 'jobby_benefits');
      
      onValue(benefitsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const benefitsList = Object.entries(data).map(([id, benefit]) => ({
            id,
            ...benefit
          }));
          
          // Ordenar por fecha de creación, más recientes primero
          benefitsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          setBenefits(benefitsList);
        } else {
          setBenefits([]);
        }
        setLoading(false);
      });
    };
    
    fetchBenefits();
  }, []);
  
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
    
    try {
      setError('');
      
      // Validar datos
      if (!newBenefit.title || !newBenefit.description || !newBenefit.type) {
        setError('Los campos Título, Descripción y Tipo son obligatorios');
        return;
      }
      
      if (editMode && currentBenefitId) {
        // Actualizar beneficio existente
        const benefitRef = ref(database, `jobby_benefits/${currentBenefitId}`);
        await update(benefitRef, {
          ...newBenefit,
          updatedAt: new Date().toISOString()
        });
        
        setSuccess('Beneficio actualizado correctamente');
        setEditMode(false);
        setCurrentBenefitId(null);
      } else {
        // Crear nuevo beneficio
        const newBenefitRef = push(ref(database, 'jobby_benefits'));
        
        await update(newBenefitRef, {
          ...newBenefit,
          status: 'active',
          createdAt: new Date().toISOString()
        });
        
        setSuccess('Beneficio creado correctamente');
      }
      
      // Resetear formulario
      setNewBenefit({
        title: '',
        description: '',
        type: 'automatic',
        value: '',
        provider: '',
        category: '',
        image: '',
        isHighlighted: false,
        availableTokens: 100
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
      type: benefit.type,
      value: benefit.value || '',
      provider: benefit.provider || '',
      category: benefit.category || '',
      image: benefit.image || '',
      isHighlighted: benefit.isHighlighted || false,
      availableTokens: benefit.availableTokens || 100
    });
    
    setEditMode(true);
    setCurrentBenefitId(benefit.id);
    setShowModal(true);
  };
  
  // Desactivar beneficio
  const handleDeactivateBenefit = async (benefitId) => {
    if (window.confirm('¿Estás seguro de que deseas desactivar este beneficio?')) {
      try {
        const benefitRef = ref(database, `jobby_benefits/${benefitId}`);
        await update(benefitRef, {
          status: 'inactive',
          updatedAt: new Date().toISOString()
        });
        
        setSuccess('Beneficio desactivado correctamente');
      } catch (error) {
        setError(`Error al desactivar beneficio: ${error.message}`);
      }
    }
  };
  
  // Activar beneficio
  const handleActivateBenefit = async (benefitId) => {
    try {
      const benefitRef = ref(database, `jobby_benefits/${benefitId}`);
      await update(benefitRef, {
        status: 'active',
        updatedAt: new Date().toISOString()
      });
      
      setSuccess('Beneficio activado correctamente');
    } catch (error) {
      setError(`Error al activar beneficio: ${error.message}`);
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
  
  // Obtener etiqueta para tipo de beneficio
  const getBenefitTypeLabel = (type) => {
    switch (type) {
      case 'automatic':
        return 'Automático';
      case 'managed':
        return 'Gestionado';
      case 'third_party':
        return 'Terceros';
      default:
        return type;
    }
  };
  
  // Obtener clase de color para tipo de beneficio
  const getBenefitTypeClass = (type) => {
    switch (type) {
      case 'automatic':
        return 'badge-success';
      case 'managed':
        return 'badge-info';
      case 'third_party':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };
  
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  return (
    <div className="jobby-benefits-container">
      <div className="jobby-benefits-page-header">
        <h1>Gestión de Beneficios Jobby</h1>
        <button 
          className="jobby-benefits-btn-primary" 
          onClick={() => {
            setEditMode(false);
            setNewBenefit({
              title: '',
              description: '',
              type: 'automatic',
              value: '',
              provider: '',
              category: '',
              image: '',
              isHighlighted: false,
              availableTokens: 100
            });
            setShowModal(true);
          }}
        >
          Agregar Beneficio
        </button>
      </div>
      
      {error && <div className="jobby-benefits-alert jobby-benefits-alert-error">{error}</div>}
      {success && <div className="jobby-benefits-alert jobby-benefits-alert-success">{success}</div>}
      
      {/* Lista de beneficios */}
      <div className="jobby-benefits-card jobby-benefits-mt-4">
        <div className="jobby-benefits-card-header">
          <h2 className="jobby-benefits-card-title">Beneficios Registrados</h2>
        </div>
        
        {benefits.length === 0 ? (
          <p>No hay beneficios registrados aún.</p>
        ) : (
          <div className="jobby-benefits-table-container">
            <table className="jobby-benefits-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Categoría</th>
                  <th>Valor</th>
                  <th>Proveedor</th>
                  <th>Tokens</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {benefits.map((benefit) => (
                  <tr key={benefit.id}>
                    <td>
                      {benefit.title}
                      {benefit.isHighlighted && <span className="jobby-benefits-highlight-badge">⭐</span>}
                    </td>
                    <td>
                      <span className={`jobby-benefits-badge jobby-benefits-${getBenefitTypeClass(benefit.type)}`}>
                        {getBenefitTypeLabel(benefit.type)}
                      </span>
                    </td>
                    <td>{benefit.category || '-'}</td>
                    <td>{benefit.value || '-'}</td>
                    <td>{benefit.provider || '-'}</td>
                    <td>{benefit.availableTokens || 0}</td>
                    <td>
                      <span className={`jobby-benefits-badge jobby-benefits-badge-${benefit.status === 'active' ? 'success' : 'danger'}`}>
                        {benefit.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="jobby-benefits-action-buttons small">
                        <button 
                          className="jobby-benefits-btn-action edit"
                          onClick={() => handleEditBenefit(benefit)}
                        >
                          Editar
                        </button>
                        
                        {benefit.status === 'active' ? (
                          <button 
                            className="jobby-benefits-btn-action deactivate"
                            onClick={() => handleDeactivateBenefit(benefit.id)}
                          >
                            Desactivar
                          </button>
                        ) : (
                          <button 
                            className="jobby-benefits-btn-action activate"
                            onClick={() => handleActivateBenefit(benefit.id)}
                          >
                            Activar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modal para crear/editar beneficio */}
      {showModal && (
        <div className="jobby-benefits-modal-overlay">
          <div className="jobby-benefits-modal-content">
            <div className="jobby-benefits-modal-header">
              <h2>{editMode ? 'Editar Beneficio' : 'Agregar Beneficio'}</h2>
              <button className="jobby-benefits-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="jobby-benefits-form-group">
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
              
              <div className="jobby-benefits-form-group">
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
              
              <div className="jobby-benefits-form-group">
                <label htmlFor="type">Tipo de Beneficio *</label>
                <select
                  id="type"
                  name="type"
                  value={newBenefit.type}
                  onChange={handleChange}
                  required
                >
                  <option value="automatic">Automático (Restaurantes, Experiencias)</option>
                  <option value="managed">Gestionado (Requiere agenda con profesional)</option>
                  <option value="third_party">Terceros (Gamepass, Entradas, etc.)</option>
                </select>
              </div>
              
              <div className="jobby-benefits-form-group">
                <label htmlFor="value">Valor</label>
                <input
                  id="value"
                  name="value"
                  type="text"
                  value={newBenefit.value}
                  onChange={handleChange}
                  placeholder="Ej: $15,000"
                />
              </div>
              
              <div className="jobby-benefits-form-group">
                <label htmlFor="provider">Proveedor</label>
                <input
                  id="provider"
                  name="provider"
                  type="text"
                  value={newBenefit.provider}
                  onChange={handleChange}
                />
              </div>
              
              <div className="jobby-benefits-form-group">
                <label htmlFor="category">Categoría</label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={newBenefit.category}
                  onChange={handleChange}
                  placeholder="Ej: Restaurantes, Entretenimiento, Salud"
                />
              </div>
              
              <div className="jobby-benefits-form-group">
                <label htmlFor="image">URL de Imagen</label>
                <input
                  id="image"
                  name="image"
                  type="text"
                  value={newBenefit.image}
                  onChange={handleChange}
                />
              </div>
              
              <div className="jobby-benefits-form-group">
                <label htmlFor="availableTokens">Tokens Disponibles</label>
                <input
                  id="availableTokens"
                  name="availableTokens"
                  type="number"
                  min="0"
                  value={newBenefit.availableTokens}
                  onChange={handleChange}
                />
              </div>
              
              <div className="jobby-benefits-form-group jobby-benefits-checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isHighlighted"
                    checked={newBenefit.isHighlighted}
                    onChange={handleChange}
                  />
                  Destacar en listados
                </label>
              </div>
              
              <div className="jobby-benefits-form-actions">
                <button type="button" className="jobby-benefits-btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="jobby-benefits-btn-primary">
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

export default JobbyBenefitsManagement;

