import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../services/firebase/config';
import { updateUserLevel, getAllUsers } from '../../../services/firebase/database/databaseService';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';
import './AsignarNiveles.css';

const AsignarNiveles = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('');
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = ref(database, 'users');
        onValue(usersRef, (snapshot) => {
          const usersList = [];
          
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const userData = childSnapshot.val();
              usersList.push({
                id: childSnapshot.key,
                ...userData,
                // Asegurar que userLevel sea siempre un número para la interfaz
                userLevel: userData.userLevel ? Number(userData.userLevel) : null
              });
            });
            
            // Ordenar por nivel y luego por nombre
            usersList.sort((a, b) => {
              // Primero ordenar por nivel
              const levelA = a.userLevel || 0;
              const levelB = b.userLevel || 0;
              
              if (levelA !== levelB) {
                return levelA - levelB;
              }
              
              // Si el nivel es el mismo, ordenar por nombre
              const nameA = a.displayName || a.email || '';
              const nameB = b.displayName || b.email || '';
              return nameA.localeCompare(nameB);
            });
            
            setUsers(usersList);
          }
          
          setLoading(false);
        });
      } catch (err) {
        setError('Error al cargar usuarios: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  const handleLevelChange = async (userId, newLevel) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await updateUserLevel(userId, Number(newLevel));
      
      setSuccess(`Nivel de usuario actualizado correctamente`);
      
      // No hace falta actualizar manualmente los usuarios
      // porque onValue se encargará de eso
      
      setSaving(false);
    } catch (err) {
      setError('Error al actualizar nivel de usuario: ' + err.message);
      setSaving(false);
    }
  };
  
  const filteredUsers = () => {
    if (!filter) {
      return users;
    }
    
    const lowerFilter = filter.toLowerCase();
    return users.filter(user => 
      (user.email && user.email.toLowerCase().includes(lowerFilter)) ||
      (user.displayName && user.displayName.toLowerCase().includes(lowerFilter)) ||
      (user.userLevel && user.userLevel.toString().includes(lowerFilter))
    );
  };
  
  const renderLevelBadge = (level) => {
    if (!level && level !== 0) return <span className="badge badge-unknown">Sin nivel</span>;
    
    switch(Number(level)) {
      case 1:
        return <span className="badge badge-admin">Nivel 1 (Admin)</span>;
      case 2:
        return <span className="badge badge-hr">Nivel 2 (RRHH)</span>;
      case 3:
        return <span className="badge badge-employee">Nivel 3 (Empleado)</span>;
      case 4:
        return <span className="badge badge-provider">Nivel 4 (Proveedor)</span>;
      default:
        return <span className="badge badge-unknown">Nivel {level}</span>;
    }
  };
  
  const countByLevel = () => {
    const counts = {
      total: users.length,
      level1: users.filter(u => u.userLevel === 1).length,
      level2: users.filter(u => u.userLevel === 2).length,
      level3: users.filter(u => u.userLevel === 3).length,
      level4: users.filter(u => u.userLevel === 4).length,
      noLevel: users.filter(u => !u.userLevel && u.userLevel !== 0).length
    };
    
    return counts;
  };
  
  if (loading) {
    return (
      <div className="asignar-niveles-container">
        <h1>Asignar Niveles a Usuarios</h1>
        <div className="loading-container">
          <div className="loading-spinner">Cargando usuarios...</div>
        </div>
      </div>
    );
  }
  
  const counts = countByLevel();
  
  return (
    <div className="asignar-niveles-container">
      <h1>Asignar Niveles a Usuarios</h1>
      
      <div className="page-description">
        <p>
          Esta herramienta te permite asignar niveles a los usuarios del sistema.
          Los niveles determinan a qué funcionalidades tienen acceso los usuarios:
        </p>
        <ul>
          <li><strong>Nivel 1 (Admin):</strong> Administradores con acceso completo</li>
          <li><strong>Nivel 2 (RRHH):</strong> Recursos Humanos de empresas</li>
          <li><strong>Nivel 3 (Empleado):</strong> Usuarios finales que reciben tokens</li>
          <li><strong>Nivel 4 (Proveedor):</strong> Proveedores que verifican tokens</li>
        </ul>
      </div>
      
      <div className="stats-summary">
        <div className="stats-card">
          <div className="stats-header">Total de Usuarios</div>
          <div className="stats-value">{counts.total}</div>
        </div>
        <div className="stats-card">
          <div className="stats-header">Nivel 1 (Admin)</div>
          <div className="stats-value">{counts.level1}</div>
        </div>
        <div className="stats-card">
          <div className="stats-header">Nivel 2 (RRHH)</div>
          <div className="stats-value">{counts.level2}</div>
        </div>
        <div className="stats-card">
          <div className="stats-header">Nivel 3 (Empleado)</div>
          <div className="stats-value">{counts.level3}</div>
        </div>
        <div className="stats-card">
          <div className="stats-header">Nivel 4 (Proveedor)</div>
          <div className="stats-value">{counts.level4}</div>
        </div>
        <div className="stats-card">
          <div className="stats-header">Sin Nivel</div>
          <div className="stats-value">{counts.noLevel}</div>
        </div>
      </div>
      
      {counts.level3 === 0 && (
        <div className="warning-message">
          <h3>⚠️ No hay usuarios de nivel 3</h3>
          <p>
            Los usuarios con nivel 3 son necesarios para la gestión de tokens. 
            Sin usuarios de nivel 3, no podrás asignar tokens a nadie.
          </p>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="users-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        
        <div className="navigation-links">
          <Link to="/level1/tokens" className="nav-link">
            Volver a Gestión de Tokens
          </Link>
          <Link to="/level1/diagnostico-usuarios" className="nav-link">
            Ver Diagnóstico de Usuarios
          </Link>
        </div>
      </div>
      
      {filteredUsers().length === 0 ? (
        <div className="no-results">
          No se encontraron usuarios que coincidan con el filtro.
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Nombre</th>
                <th>Nivel Actual</th>
                <th>Asignar Nivel</th>
                <th>Empresa</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers().map(user => (
                <tr key={user.id} className={`user-row ${user.userLevel === 3 ? 'level-3-row' : ''}`}>
                  <td className="user-id">{user.id}</td>
                  <td className="user-email">{user.email || 'N/A'}</td>
                  <td className="user-name">{user.displayName || 'Sin nombre'}</td>
                  <td className="user-level">
                    {renderLevelBadge(user.userLevel)}
                  </td>
                  <td className="level-selector">
                    <select 
                      value={user.userLevel || ''} 
                      onChange={(e) => handleLevelChange(user.id, e.target.value)}
                      disabled={saving}
                    >
                      <option value="">Sin nivel</option>
                      <option value="1">Nivel 1 (Admin)</option>
                      <option value="2">Nivel 2 (RRHH)</option>
                      <option value="3">Nivel 3 (Empleado)</option>
                      <option value="4">Nivel 4 (Proveedor)</option>
                    </select>
                  </td>
                  <td className="user-company">
                    {user.companyId || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="help-section">
        <h2>Ayuda</h2>
        <div className="help-content">
          <p><strong>¿Cómo asignar un nivel a un usuario?</strong></p>
          <p>
            Selecciona el nivel deseado en el menú desplegable junto al usuario.
            El cambio se guardará automáticamente.
          </p>
          
          <p><strong>¿Por qué necesito usuarios de nivel 3?</strong></p>
          <p>
            Los usuarios de nivel 3 (Empleados) son los destinatarios de los tokens.
            Sin usuarios de nivel 3, no podrás asignar tokens a nadie en el sistema.
          </p>
          
          <p><strong>¿Cómo afecta el nivel al acceso?</strong></p>
          <p>
            El nivel determina a qué secciones de la aplicación tiene acceso el usuario:
          </p>
          <ul>
            <li>Nivel 1: Acceso a toda la administración del sistema</li>
            <li>Nivel 2: Acceso a la gestión de recursos humanos de una empresa</li>
            <li>Nivel 3: Acceso como usuario final para solicitar y canjear beneficios</li>
            <li>Nivel 4: Acceso como proveedor para verificar tokens</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AsignarNiveles;