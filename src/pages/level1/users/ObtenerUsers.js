import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../services/firebase/config';
import './ObtenerUsers.css';

const ObtenerUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Cargar todos los usuarios para diagnóstico
    const usersRef = ref(database, 'users');
    onValue(usersRef, (snapshot) => {
      const usersList = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val();
          usersList.push({
            id: childSnapshot.key,
            ...userData
          });
        });
        
        setUsers(usersList);
      }
      
      setLoading(false);
    });
  }, []);
  
  return (
    <div className="obtain-users-container">
      <h1>Diagnóstico de Usuarios</h1>
      
      {loading ? (
        <div className="loading">Cargando usuarios...</div>
      ) : (
        <>
          <div className="users-summary">
            <div className="summary-item">
              <span className="summary-label">Total de usuarios:</span>
              <span className="summary-value">{users.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Usuarios nivel 1 (Admin):</span>
              <span className="summary-value">
                {users.filter(u => u.userLevel === 1 || u.userLevel === '1').length}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Usuarios nivel 2 (RRHH):</span>
              <span className="summary-value">
                {users.filter(u => u.userLevel === 2 || u.userLevel === '2').length}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Usuarios nivel 3 (Empleados):</span>
              <span className="summary-value">
                {users.filter(u => u.userLevel === 3 || u.userLevel === '3').length}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Usuarios nivel 4 (Proveedores):</span>
              <span className="summary-value">
                {users.filter(u => u.userLevel === 4 || u.userLevel === '4').length}
              </span>
            </div>
          </div>
          
          <h2>Lista de Usuarios</h2>
          
          {users.length === 0 ? (
            <div className="no-users">No hay usuarios registrados</div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Nombre</th>
                    <th>Nivel</th>
                    <th>Compañía</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className={`level-${user.userLevel}`}>
                      <td>{user.id}</td>
                      <td>{user.email || 'N/A'}</td>
                      <td>{user.displayName || 'N/A'}</td>
                      <td>{user.userLevel}</td>
                      <td>{user.companyId || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="recommendations">
            <h2>Recomendaciones</h2>
            <ul>
              <li>Para que la gestión de tokens funcione, debe haber al menos un usuario con nivel 3 (Empleado).</li>
              <li>Si no hay usuarios de nivel 3, crea uno usando la función de registro y establece su nivel en 3.</li>
              <li>Verifica que el campo userLevel esté correctamente establecido (como número o string).</li>
              <li>Los usuarios de nivel 3 deben estar asociados a una compañía para poder asignarles beneficios de empresa.</li>
            </ul>
            <div className="action-links">
              <Link to="/level1/asignar-niveles" className="action-button">
                Ir a Asignar Niveles
              </Link>
              <Link to="/level1/tokens" className="action-button">
                Volver a Gestión de Tokens
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ObtenerUsers;