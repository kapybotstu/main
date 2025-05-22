import React, { useState, useEffect } from 'react';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { database } from '../../services/firebase/config';
import { registerUser } from '../../services/firebase/auth/authService';

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estado para nueva empresa
  const [newCompany, setNewCompany] = useState({
    name: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    maxUsers: 10,
    address: ''
  });
  
  // Estado para crear administrador de empresa
  const [adminData, setAdminData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyId: ''
  });
  
  // Estado para modo edición
  const [editMode, setEditMode] = useState(false);
  const [currentCompanyId, setCurrentCompanyId] = useState(null);
  
  // Modal states
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  
  useEffect(() => {
    const fetchCompanies = () => {
      const companiesRef = ref(database, 'companies');
      
      onValue(companiesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const companiesList = Object.entries(data).map(([id, company]) => ({
            id,
            ...company
          }));
          
          // Ordenar por fecha de creación, más recientes primero
          companiesList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          setCompanies(companiesList);
        } else {
          setCompanies([]);
        }
        setLoading(false);
      });
    };
    
    fetchCompanies();
  }, []);
  
  // Manejar cambios en formulario de nueva empresa
  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setNewCompany(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manejar cambios en formulario de nuevo administrador
  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Crear o actualizar empresa
  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      
      // Validar datos
      if (!newCompany.name || !newCompany.contactName || !newCompany.contactEmail) {
        setError('Los campos Nombre, Contacto y Email son obligatorios');
        return;
      }
      
      if (editMode && currentCompanyId) {
        // Actualizar empresa existente
        const companyRef = ref(database, `companies/${currentCompanyId}`);
        await update(companyRef, {
          ...newCompany,
          updatedAt: new Date().toISOString()
        });
        
        setSuccess('Empresa actualizada correctamente');
        setEditMode(false);
        setCurrentCompanyId(null);
      } else {
        // Crear nueva empresa
        const newCompanyRef = push(ref(database, 'companies'));
        
        await update(newCompanyRef, {
          ...newCompany,
          status: 'active',
          createdAt: new Date().toISOString()
        });
        
        setSuccess('Empresa creada correctamente');
      }
      
      // Resetear formulario
      setNewCompany({
        name: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        maxUsers: 10,
        address: ''
      });
      
      setShowCompanyModal(false);
    } catch (error) {
      setError(`Error: ${error.message}`);
    }
  };
  
  // Crear administrador para empresa
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      
      // Validaciones
      if (adminData.password !== adminData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      
      if (adminData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      
      if (!adminData.email.startsWith('admin@')) {
        setError('El correo del administrador debe comenzar con "admin@"');
        return;
      }
      
      // Crear usuario administrador
      await registerUser(
        adminData.email,
        adminData.password,
        adminData.displayName
      );
      
      setSuccess('Administrador creado correctamente');
      
      // Resetear formulario
      setAdminData({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyId: ''
      });
      
      setShowAdminModal(false);
    } catch (error) {
      setError(`Error al crear administrador: ${error.message}`);
    }
  };
  
  // Editar empresa
  const handleEditCompany = (company) => {
    setNewCompany({
      name: company.name,
      contactName: company.contactName || '',
      contactEmail: company.contactEmail || '',
      contactPhone: company.contactPhone || '',
      maxUsers: company.maxUsers || 10,
      address: company.address || ''
    });
    
    setEditMode(true);
    setCurrentCompanyId(company.id);
    setShowCompanyModal(true);
  };
  
  // Eliminar empresa (desactivar)
  const handleDeactivateCompany = async (companyId) => {
    if (window.confirm('¿Estás seguro de que deseas desactivar esta empresa?')) {
      try {
        const companyRef = ref(database, `companies/${companyId}`);
        await update(companyRef, {
          status: 'inactive',
          updatedAt: new Date().toISOString()
        });
        
        setSuccess('Empresa desactivada correctamente');
      } catch (error) {
        setError(`Error al desactivar empresa: ${error.message}`);
      }
    }
  };
  
  // Activar empresa
  const handleActivateCompany = async (companyId) => {
    try {
      const companyRef = ref(database, `companies/${companyId}`);
      await update(companyRef, {
        status: 'active',
        updatedAt: new Date().toISOString()
      });
      
      setSuccess('Empresa activada correctamente');
    } catch (error) {
      setError(`Error al activar empresa: ${error.message}`);
    }
  };
  
  // Preparar creación de administrador para una empresa
  const handleShowCreateAdmin = (company) => {
    setAdminData(prev => ({
      ...prev,
      email: `admin@${company.name.toLowerCase()}`,
      companyId: company.id
    }));
    
    setShowAdminModal(true);
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
  
  return (
    <div className="companies-container">
      <div className="page-header">
        <h1>Gestión de Empresas</h1>
        <button 
          className="btn-primary" 
          onClick={() => {
            setEditMode(false);
            setNewCompany({
              name: '',
              contactName: '',
              contactEmail: '',
              contactPhone: '',
              maxUsers: 10,
              address: ''
            });
            setShowCompanyModal(true);
          }}
        >
          Agregar Empresa
        </button>
      </div>
      
      {error && <div className="error-alert">{error}</div>}
      {success && <div className="success-alert">{success}</div>}
      
      {/* Lista de empresas */}
      <div className="card mt-4">
        <div className="card-header">
          <h2 className="card-title">Empresas Registradas</h2>
        </div>
        
        {companies.length === 0 ? (
          <p>No hay empresas registradas aún.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Contacto</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Fecha Registro</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td>{company.name}</td>
                    <td>{company.contactName || '-'}</td>
                    <td>{company.contactEmail || '-'}</td>
                    <td>{company.contactPhone || '-'}</td>
                    <td>{new Date(company.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${company.status === 'active' ? 'success' : 'error'}`}>
                        {company.status === 'active' ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons small">
                        <button 
                          className="btn-action edit"
                          onClick={() => handleEditCompany(company)}
                        >
                          Editar
                        </button>
                        
                        {company.status === 'active' ? (
                          <button 
                            className="btn-action deactivate"
                            onClick={() => handleDeactivateCompany(company.id)}
                          >
                            Desactivar
                          </button>
                        ) : (
                          <button 
                            className="btn-action activate"
                            onClick={() => handleActivateCompany(company.id)}
                          >
                            Activar
                          </button>
                        )}
                        
                        <button 
                          className="btn-action create-admin"
                          onClick={() => handleShowCreateAdmin(company)}
                        >
                          Crear Admin
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modal para crear/editar empresa */}
      {showCompanyModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{editMode ? 'Editar Empresa' : 'Agregar Empresa'}</h2>
              <button className="close-button" onClick={() => setShowCompanyModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleCompanySubmit}>
              <div className="form-group">
                <label htmlFor="name">Nombre de la Empresa *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={newCompany.name}
                  onChange={handleCompanyChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="contactName">Nombre de Contacto *</label>
                <input
                  id="contactName"
                  name="contactName"
                  type="text"
                  value={newCompany.contactName}
                  onChange={handleCompanyChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="contactEmail">Email de Contacto *</label>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={newCompany.contactEmail}
                  onChange={handleCompanyChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="contactPhone">Teléfono de Contacto</label>
                <input
                  id="contactPhone"
                  name="contactPhone"
                  type="text"
                  value={newCompany.contactPhone}
                  onChange={handleCompanyChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="maxUsers">Número Máximo de Usuarios</label>
                <input
                  id="maxUsers"
                  name="maxUsers"
                  type="number"
                  min="1"
                  value={newCompany.maxUsers}
                  onChange={handleCompanyChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Dirección</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={newCompany.address}
                  onChange={handleCompanyChange}
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCompanyModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editMode ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal para crear administrador */}
      {showAdminModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Crear Administrador de Empresa</h2>
              <button className="close-button" onClick={() => setShowAdminModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleAdminSubmit}>
              <div className="form-group">
                <label htmlFor="displayName">Nombre Completo *</label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={adminData.displayName}
                  onChange={handleAdminChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={adminData.email}
                  onChange={handleAdminChange}
                  required
                />
                <small>Debe comenzar con admin@</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Contraseña *</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={adminData.password}
                  onChange={handleAdminChange}
                  required
                />
                <small>Mínimo 6 caracteres</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={adminData.confirmPassword}
                  onChange={handleAdminChange}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAdminModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear Administrador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManagement;