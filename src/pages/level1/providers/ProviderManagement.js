import React, { useState, useEffect } from 'react';
import { ref, get, set, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../../../services/firebase/config';
import { useAuth } from '../../../context/AuthContext';
import { registerUser } from '../../../services/firebase/auth/authService';
import './ProviderManagement.css';

const ProviderManagement = () => {
  const { currentUser } = useAuth();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    password: '',
    status: 'active',
    category: '',
    description: '',
    contactPhone: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  
  useEffect(() => {
    fetchProviders();
  }, []);
  
  const fetchProviders = async () => {
    try {
      setLoading(true);
      
      // Buscar usuarios con nivel 4 (proveedores)
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      const providersList = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val();
          
          if (userData.level === 4) {
            providersList.push({
              id: childSnapshot.key,
              ...userData
            });
          }
        });
      }
      
      setProviders(providersList);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      setMessage({ 
        type: 'error', 
        content: `Error al cargar proveedores: ${error.message}` 
      });
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    if (!formData.email || !formData.email.endsWith('@jobby.sup')) {
      setMessage({ 
        type: 'error', 
        content: 'El email debe terminar con @jobby.sup para ser un proveedor' 
      });
      return false;
    }
    
    if (!formData.displayName || formData.displayName.trim().length < 3) {
      setMessage({ 
        type: 'error', 
        content: 'El nombre debe tener al menos 3 caracteres' 
      });
      return false;
    }
    
    if (!editMode && (!formData.password || formData.password.length < 6)) {
      setMessage({ 
        type: 'error', 
        content: 'La contraseña debe tener al menos 6 caracteres' 
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setMessage({ type: '', content: '' });
      
      if (editMode) {
        // Actualizar proveedor existente
        const providerRef = ref(database, `users/${editId}`);
        
        const updates = {
          displayName: formData.displayName,
          status: formData.status,
          category: formData.category,
          description: formData.description,
          contactPhone: formData.contactPhone,
          updatedAt: new Date().toISOString()
        };
        
        await update(providerRef, updates);
        
        setMessage({
          type: 'success',
          content: 'Proveedor actualizado correctamente'
        });
      } else {
        // Crear nuevo proveedor
        const { user } = await registerUser(
          formData.email,
          formData.password,
          formData.displayName
        );
        
        // Añadir información adicional específica de proveedores
        const providerRef = ref(database, `users/${user.uid}`);
        await update(providerRef, {
          status: formData.status,
          category: formData.category,
          description: formData.description,
          contactPhone: formData.contactPhone,
          createdBy: currentUser.uid,
          updatedAt: new Date().toISOString()
        });
        
        setMessage({
          type: 'success',
          content: 'Proveedor creado correctamente'
        });
      }
      
      // Limpiar formulario y recargar datos
      resetForm();
      fetchProviders();
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      setMessage({
        type: 'error',
        content: `Error al ${editMode ? 'actualizar' : 'crear'} proveedor: ${error.message}`
      });
    }
  };
  
  const handleEdit = (provider) => {
    setEditMode(true);
    setEditId(provider.id);
    setFormData({
      email: provider.email,
      displayName: provider.displayName,
      password: '', // No mostrar contraseña por seguridad
      status: provider.status || 'active',
      category: provider.category || '',
      description: provider.description || '',
      contactPhone: provider.contactPhone || ''
    });
    setShowForm(true);
    
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleUpdateStatus = async (providerId, newStatus) => {
    try {
      const providerRef = ref(database, `users/${providerId}`);
      await update(providerRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      setMessage({
        type: 'success',
        content: `Estado del proveedor actualizado a: ${newStatus}`
      });
      
      // Actualizar estado local
      setProviders(prevProviders => 
        prevProviders.map(provider => 
          provider.id === providerId 
            ? { ...provider, status: newStatus } 
            : provider
        )
      );
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      setMessage({
        type: 'error',
        content: `Error al actualizar estado: ${error.message}`
      });
    }
  };
  
  const resetForm = () => {
    setFormData({
      email: '',
      displayName: '',
      password: '',
      status: 'active',
      category: '',
      description: '',
      contactPhone: ''
    });
    setEditMode(false);
    setEditId(null);
    setShowForm(false);
  };
  
  return (
    <div className="provider-mgmt-container">
      <h1>Gestión de Proveedores</h1>
      
      <div className="provider-mgmt-action-bar">
        <button 
          className="provider-mgmt-add-provider-btn" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : 'Agregar Nuevo Proveedor'}
        </button>
      </div>
      
      {message.content && (
        <div className={`provider-mgmt-message ${message.type}`}>
          {message.content}
        </div>
      )}
      
      {showForm && (
        <div className="provider-mgmt-provider-form-container">
          <h2>{editMode ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
          
          <form onSubmit={handleSubmit} className="provider-mgmt-provider-form">
            <div className="provider-mgmt-form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="proveedor@jobby.sup"
                required
                disabled={editMode} // No permitir cambiar email en modo edición
              />
              {!editMode && (
                <small>El email debe terminar con @jobby.sup</small>
              )}
            </div>
            
            <div className="provider-mgmt-form-group">
              <label htmlFor="displayName">Nombre del Proveedor:</label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="Nombre del proveedor o empresa"
                required
              />
            </div>
            
            {!editMode && (
              <div className="provider-mgmt-form-group">
                <label htmlFor="password">Contraseña:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
            )}
            
            <div className="provider-mgmt-form-group">
              <label htmlFor="status">Estado:</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
            
            <div className="provider-mgmt-form-group">
              <label htmlFor="category">Categoría:</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Ej: Restaurante, Gimnasio, Salud, etc."
              />
            </div>
            
            <div className="provider-mgmt-form-group">
              <label htmlFor="description">Descripción:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descripción del proveedor y sus servicios"
                rows="4"
              ></textarea>
            </div>
            
            <div className="provider-mgmt-form-group">
              <label htmlFor="contactPhone">Teléfono de Contacto:</label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                placeholder="+56 9 XXXX XXXX"
              />
            </div>
            
            <div className="provider-mgmt-form-actions">
              <button type="button" className="provider-mgmt-cancel-btn" onClick={resetForm}>
                Cancelar
              </button>
              <button type="submit" className="provider-mgmt-submit-btn">
                {editMode ? 'Actualizar Proveedor' : 'Crear Proveedor'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="provider-mgmt-providers-list-container">
        <h2>Proveedores Registrados</h2>
        
        {loading ? (
          <p>Cargando proveedores...</p>
        ) : providers.length === 0 ? (
          <p>No hay proveedores registrados.</p>
        ) : (
          <div className="provider-mgmt-table-container">
            <table className="provider-mgmt-providers-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Categoría</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => (
                  <tr key={provider.id} className={provider.status === 'inactive' ? 'inactive-row' : ''}>
                    <td>{provider.displayName}</td>
                    <td>{provider.email}</td>
                    <td>{provider.category || 'N/A'}</td>
                    <td>{provider.contactPhone || 'N/A'}</td>
                    <td>
                      <span className={`provider-mgmt-status-badge ${provider.status || 'active'}`}>
                        {provider.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="provider-mgmt-action-buttons">
                        <button
                          onClick={() => handleEdit(provider)}
                          className="provider-mgmt-edit-btn"
                          title="Editar proveedor"
                        >
                          ✏️
                        </button>
                        
                        {provider.status === 'active' ? (
                          <button
                            onClick={() => handleUpdateStatus(provider.id, 'inactive')}
                            className="provider-mgmt-deactivate-btn"
                            title="Desactivar proveedor"
                          >
                            🚫
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(provider.id, 'active')}
                            className="provider-mgmt-activate-btn"
                            title="Activar proveedor"
                          >
                            ✅
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
    </div>
  );
};

export default ProviderManagement;