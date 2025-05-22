import React, { useState, useEffect } from 'react';
import { ref, onValue, update, get } from 'firebase/database';
import { database } from '../../services/firebase/config';
import { useAuth } from '../../context/AuthContext';
import { registerUser } from '../../services/firebase/auth/authService';

const CompanyUsersManagement = () => {
  const { currentUser, companyId } = useAuth();
  const [users, setUsers] = useState([]);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estado para nuevo usuario
  const [newUser, setNewUser] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    if (!companyId) {
      setError('No se ha asignado una empresa a este usuario');
      setLoading(false);
      return;
    }
    
    const fetchCompanyData = async () => {
      try {
        // Obtener datos de la empresa
        const companyRef = ref(database, `companies/${companyId}`);
        onValue(companyRef, (snapshot) => {
          if (snapshot.exists()) {
            setCompanyData(snapshot.val());
          }
        });
        
        // Obtener usuarios de la empresa (nivel 3)
        const usersRef = ref(database, 'users');
        onValue(usersRef, (snapshot) => {
          if (snapshot.exists()) {
            const usersData = [];
            snapshot.forEach((childSnapshot) => {
              const user = childSnapshot.val();
              // Filtrar usuarios de nivel 3 que pertenezcan a esta empresa
              if (user.level === 3 && user.companyId === companyId) {
                usersData.push({
                  id: childSnapshot.key,
                  ...user
                });
              }
            });
            setUsers(usersData);
          } else {
            setUsers([]);
          }
          setLoading(false);
        });
      } catch (error) {
        setError(`Error al cargar datos: ${error.message}`);
        setLoading(false);
      }
    };
    
    fetchCompanyData();
  }, [companyId]);
  
  // Manejar cambios en formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Crear nuevo usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!companyId) {
      setError('No se ha asignado una empresa a este usuario');
      return;
    }
    
    try {
      setError('');
      
      // Validaciones
      if (newUser.password !== newUser.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      
      if (newUser.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      
      if (!companyData || !companyData.name) {
        setError('No se pudo obtener el nombre de la empresa');
        return;
      }
      
      // Verificar que el email contenga el dominio de la empresa
      const companyName = companyData.name.toLowerCase();
      let userEmail = newUser.email;
      
      // Si el email no contiene @empresa, añadirlo
      if (!userEmail.includes('@')) {
        userEmail = `${userEmail}@${companyName}`;
      } else if (!userEmail.includes(`@${companyName}`)) {
        // Si ya tiene @ pero no es de la empresa, mostrar error
        setError(`El correo debe pertenecer a la empresa: nombre@${companyName}`);
        return;
      }
      
      // Verificar límite de usuarios
      if (companyData.maxUsers && users.length >= companyData.maxUsers) {
        setError(`Se ha alcanzado el límite de usuarios para esta empresa (${companyData.maxUsers})`);
        return;
      }
      
      // Verificar que no exista otro usuario con el mismo email
      const allUsersRef = ref(database, 'users');
      const snapshot = await get(allUsersRef);
      
      if (snapshot.exists()) {
        let emailExists = false;
        snapshot.forEach((childSnapshot) => {
          const user = childSnapshot.val();
          if (user.email === userEmail) {
            emailExists = true;
          }
        });
        
        if (emailExists) {
          setError('Ya existe un usuario con ese correo electrónico');
          return;
        }
      }
      
      // Crear usuario
      await registerUser(
        userEmail,
        newUser.password,
        newUser.displayName
      );
      
      setSuccess('Usuario creado correctamente');
      
      // Resetear formulario
      setNewUser({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      setShowModal(false);
    } catch (error) {
      setError(`Error al crear usuario: ${error.message}`);
    }
  };
  
  // Activar/Desactivar usuario
  const handleToggleStatus = async (userId, currentStatus) => {
    if (!companyId) return;
    
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? 'activar' : 'desactivar';
    
    if (window.confirm(`¿Estás seguro de que deseas ${actionText} este usuario?`)) {
      try {
        const userRef = ref(database, `users/${userId}`);
        await update(userRef, {
          status: newStatus,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser.uid
        });
        
        setSuccess(`Usuario ${actionText}do correctamente`);
      } catch (error) {
        setError(`Error al ${actionText} usuario: ${error.message}`);
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
      <div className="users-container">
        <h1>Gestión de Usuarios</h1>
        <div className="error-alert">
          No se ha asignado una empresa a este usuario. Por favor, contacte con el administrador de Jobby.
        </div>
      </div>
    );
  }
  
  return (
    <div className="users-container">
      <div className="page-header">
        <h1>Gestión de Usuarios</h1>
        <button 
          className="btn-primary" 
          onClick={() => {
            setNewUser({
              displayName: '',
              email: '',
              password: '',
              confirmPassword: ''
            });
            setShowModal(true);
          }}
        >
          Agregar Usuario
        </button>
      </div>
      
      {error && <div className="error-alert">{error}</div>}
      {success && <div className="success-alert">{success}</div>}
      
      {/* Información de la empresa */}
      <div className="company-info card mb-4">
        <div className="card-header">
          <h2 className="card-title">Información de Empresa</h2>
        </div>
        <div className="card-body">
          <div className="company-details">
            <div className="detail-item">
              <span className="detail-label">Nombre:</span>
              <span className="detail-value">{companyData?.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Usuarios:</span>
              <span className="detail-value">
                {users.length} {companyData?.maxUsers ? `de ${companyData.maxUsers}` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lista de usuarios */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Usuarios de la Empresa</h2>
        </div>
        
        {users.length === 0 ? (
          <p>No hay usuarios registrados aún.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Fecha de Registro</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.displayName}</td>
                    <td>{user.email}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${user.status === 'inactive' ? 'error' : 'success'}`}>
                        {user.status === 'inactive' ? 'Inactivo' : 'Activo'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons small">
                        <button 
                          className={`btn-action ${user.status === 'inactive' ? 'activate' : 'deactivate'}`}
                          onClick={() => handleToggleStatus(user.id, user.status || 'active')}
                        >
                          {user.status === 'inactive' ? 'Activar' : 'Desactivar'}
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
      
      {/* Modal para crear usuario */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Agregar Usuario</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="displayName">Nombre Completo *</label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={newUser.displayName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico *</label>
                <div className="email-input-group">
                  <input
                    id="email"
                    name="email"
                    type="text"
                    value={newUser.email}
                    onChange={handleChange}
                    required
                    placeholder="usuario"
                  />
                  <span className="email-domain">@{companyData?.name.toLowerCase()}</span>
                </div>
                <small>
                  Puedes ingresar solo el nombre de usuario o el email completo.
                </small>
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Contraseña *</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={newUser.password}
                  onChange={handleChange}
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
                  value={newUser.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyUsersManagement;