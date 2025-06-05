import React, { useState, useEffect } from 'react';
import { ref, onValue, push, update, get, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../../services/firebase/config';
import { useAuth } from '../../context/AuthContext';
import './CompanyTokensManagement.css';

const CompanyTokensManagement = () => {
  const { currentUser, companyId } = useAuth();
  
  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados de datos
  const [companyUsers, setCompanyUsers] = useState([]);
  const [tokenStats, setTokenStats] = useState({
    totalDistributed: 0,
    totalUsed: 0,
    totalAvailable: 0,
    activeUsers: 0
  });
  const [tokenHistory, setTokenHistory] = useState([]);
  const [benefitRequests, setBenefitRequests] = useState([]);
  
  // Estados de modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Estados de formulario
  const [assignForm, setAssignForm] = useState({
    userId: '',
    amount: 10,
    reason: '',
    sendNotification: true
  });
  
  const [bulkAssignForm, setBulkAssignForm] = useState({
    amount: 10,
    reason: '',
    selectedUsers: [],
    sendNotification: true
  });

  // Cargar datos iniciales
  useEffect(() => {
    if (!companyId) {
      setError('No se ha asignado una empresa a este usuario');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        await Promise.all([
          fetchCompanyUsers(),
          fetchTokenHistory(),
          fetchBenefitRequests()
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError('Error al cargar los datos');
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  // Obtener usuarios de la empresa con sus balances de tokens
  const fetchCompanyUsers = async () => {
    const usersRef = ref(database, 'users');
    
    onValue(usersRef, async (snapshot) => {
      const users = [];
      const usersList = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val();
          
          if (userData.companyId === companyId && userData.level === 3) {
            usersList.push({
              id: childSnapshot.key,
              ...userData
            });
          }
        });
      }
      
      // Obtener balance de tokens para cada usuario
      for (const user of usersList) {
        try {
          const tokensRef = ref(database, `user_blank_tokens/${user.id}`);
          const tokensSnapshot = await get(tokensRef);
          const tokensData = tokensSnapshot.val() || {};
          
          users.push({
            ...user,
            companyBalance: tokensData.company_balance || 0,
            jobbyBalance: tokensData.jobby_balance || 0,
            lastUpdated: tokensData.lastUpdated || null
          });
        } catch (error) {
          console.error(`Error obteniendo tokens para usuario ${user.id}:`, error);
          users.push({
            ...user,
            companyBalance: 0,
            jobbyBalance: 0,
            lastUpdated: null
          });
        }
      }
      
      setCompanyUsers(users);
      calculateTokenStats(users);
    });
  };

  // Obtener historial de tokens de empresa
  const fetchTokenHistory = () => {
    const historyRef = ref(database, 'user_blank_tokens');
    
    onValue(historyRef, (snapshot) => {
      const history = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((userSnapshot) => {
          const userId = userSnapshot.key;
          const companyHistoryRef = userSnapshot.child('company_history');
          
          if (companyHistoryRef.exists()) {
            companyHistoryRef.forEach((historySnapshot) => {
              const historyData = historySnapshot.val();
              
              // Solo incluir historial de usuarios de esta empresa
              history.push({
                id: historySnapshot.key,
                userId: userId,
                ...historyData
              });
            });
          }
        });
      }
      
      // Ordenar por fecha más reciente
      history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTokenHistory(history.slice(0, 50)); // Limitar a últimas 50 transacciones
    });
  };

  // Obtener solicitudes de beneficios internos
  const fetchBenefitRequests = () => {
    const requestsRef = ref(database, 'benefit_requests');
    
    onValue(requestsRef, (snapshot) => {
      const requests = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const requestData = childSnapshot.val();
          
          // Solo solicitudes de beneficios internos de esta empresa
          if (requestData.companyId === companyId && !requestData.isBenefitJobby) {
            requests.push({
              id: childSnapshot.key,
              ...requestData
            });
          }
        });
      }
      
      setBenefitRequests(requests);
    });
  };

  // Calcular estadísticas de tokens
  const calculateTokenStats = (users) => {
    const stats = users.reduce((acc, user) => {
      const balance = user.companyBalance || 0;
      acc.totalAvailable += balance;
      if (balance > 0) acc.activeUsers++;
      return acc;
    }, {
      totalDistributed: 0,
      totalUsed: 0,
      totalAvailable: 0,
      activeUsers: 0
    });

    // Calcular total distribuido desde el historial
    tokenHistory.forEach(transaction => {
      if (transaction.type === 'add') {
        stats.totalDistributed += transaction.amount || 0;
      } else if (transaction.type === 'used') {
        stats.totalUsed += transaction.amount || 0;
      }
    });

    setTokenStats(stats);
  };

  // Asignar tokens a un usuario
  const handleAssignTokens = async (e) => {
    e.preventDefault();
    
    if (!assignForm.userId || !assignForm.amount || assignForm.amount <= 0) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      setError('');
      const userId = assignForm.userId;
      const amount = parseInt(assignForm.amount);
      
      // Obtener balance actual
      const tokensRef = ref(database, `user_blank_tokens/${userId}`);
      const tokensSnapshot = await get(tokensRef);
      const currentData = tokensSnapshot.val() || {};
      const currentBalance = currentData.company_balance || 0;
      const newBalance = currentBalance + amount;
      
      // Actualizar balance
      await update(tokensRef, {
        company_balance: newBalance,
        lastUpdated: new Date().toISOString()
      });
      
      // Registrar en historial
      const historyRef = ref(database, `user_blank_tokens/${userId}/company_history`);
      await push(historyRef, {
        type: 'add',
        amount: amount,
        reason: assignForm.reason || 'Asignación manual',
        adminId: currentUser.uid,
        adminEmail: currentUser.email,
        createdAt: new Date().toISOString()
      });
      
      setSuccess(`${amount} tokens asignados correctamente`);
      
      // Resetear formulario
      setAssignForm({
        userId: '',
        amount: 10,
        reason: '',
        sendNotification: true
      });
      
      setShowAssignModal(false);
      
    } catch (error) {
      console.error('Error asignando tokens:', error);
      setError('Error al asignar tokens: ' + error.message);
    }
  };

  // Asignación masiva de tokens
  const handleBulkAssign = async (e) => {
    e.preventDefault();
    
    if (bulkAssignForm.selectedUsers.length === 0 || !bulkAssignForm.amount || bulkAssignForm.amount <= 0) {
      setError('Seleccione usuarios y especifique una cantidad válida');
      return;
    }

    try {
      setError('');
      const amount = parseInt(bulkAssignForm.amount);
      let successCount = 0;
      
      for (const userId of bulkAssignForm.selectedUsers) {
        try {
          // Obtener balance actual
          const tokensRef = ref(database, `user_blank_tokens/${userId}`);
          const tokensSnapshot = await get(tokensRef);
          const currentData = tokensSnapshot.val() || {};
          const currentBalance = currentData.company_balance || 0;
          const newBalance = currentBalance + amount;
          
          // Actualizar balance
          await update(tokensRef, {
            company_balance: newBalance,
            lastUpdated: new Date().toISOString()
          });
          
          // Registrar en historial
          const historyRef = ref(database, `user_blank_tokens/${userId}/company_history`);
          await push(historyRef, {
            type: 'add',
            amount: amount,
            reason: bulkAssignForm.reason || 'Asignación masiva',
            adminId: currentUser.uid,
            adminEmail: currentUser.email,
            createdAt: new Date().toISOString()
          });
          
          successCount++;
        } catch (error) {
          console.error(`Error asignando tokens a usuario ${userId}:`, error);
        }
      }
      
      setSuccess(`Tokens asignados correctamente a ${successCount} usuarios`);
      
      // Resetear formulario
      setBulkAssignForm({
        amount: 10,
        reason: '',
        selectedUsers: [],
        sendNotification: true
      });
      
      setShowBulkModal(false);
      
    } catch (error) {
      console.error('Error en asignación masiva:', error);
      setError('Error en la asignación masiva: ' + error.message);
    }
  };

  // Manejar selección de usuarios para asignación masiva
  const handleUserSelection = (userId, checked) => {
    setBulkAssignForm(prev => ({
      ...prev,
      selectedUsers: checked 
        ? [...prev.selectedUsers, userId]
        : prev.selectedUsers.filter(id => id !== userId)
    }));
  };

  // Seleccionar todos los usuarios
  const handleSelectAll = (checked) => {
    setBulkAssignForm(prev => ({
      ...prev,
      selectedUsers: checked ? companyUsers.map(user => user.id) : []
    }));
  };

  // Limpiar mensajes después de un tiempo
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
    return (
      <div className="level2-tokens-container">
        <div className="level2-tokens-header">
          <h1>Gestión de Tokens de Empresa</h1>
        </div>
        <div className="level2-loading">Cargando datos de tokens...</div>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="level2-tokens-container">
        <div className="level2-tokens-header">
          <h1>Gestión de Tokens de Empresa</h1>
        </div>
        <div className="level2-tokens-content">
          <div className="level2-error-alert">
            No se ha asignado una empresa a este usuario. Por favor, contacte con el administrador de Jobby.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="level2-tokens-container">
      {/* HEADER PRINCIPAL */}
      <div className="level2-tokens-header">
        <h1>Gestión de Tokens de Empresa</h1>
        <div className="level2-tokens-header-actions">
          <button 
            className="level2-btn-secondary"
            onClick={() => setShowBulkModal(true)}
          >
            Asignación Masiva
          </button>
          <button 
            className="level2-btn-primary"
            onClick={() => setShowAssignModal(true)}
          >
            Asignar Tokens
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="level2-tokens-content">
        {error && <div className="level2-error-alert">{error}</div>}
        {success && <div className="level2-success-alert">{success}</div>}

        {/* ESTADÍSTICAS */}
        <div className="level2-tokens-stats">
          <div className="level2-stat-card">
            <div className="level2-stat-icon">💰</div>
            <div className="level2-stat-content">
              <div className="level2-stat-value">{tokenStats.totalAvailable}</div>
              <div className="level2-stat-label">Tokens Disponibles</div>
            </div>
          </div>

          <div className="level2-stat-card">
            <div className="level2-stat-icon">🎯</div>
            <div className="level2-stat-content">
              <div className="level2-stat-value">{tokenStats.totalUsed}</div>
              <div className="level2-stat-label">Tokens Utilizados</div>
            </div>
          </div>

          <div className="level2-stat-card">
            <div className="level2-stat-icon">👥</div>
            <div className="level2-stat-content">
              <div className="level2-stat-value">{tokenStats.activeUsers}</div>
              <div className="level2-stat-label">Usuarios Activos</div>
            </div>
          </div>

          <div className="level2-stat-card">
            <div className="level2-stat-icon">📊</div>
            <div className="level2-stat-content">
              <div className="level2-stat-value">{companyUsers.length}</div>
              <div className="level2-stat-label">Total Empleados</div>
            </div>
          </div>
        </div>

        {/* LAYOUT PRINCIPAL */}
        <div className="level2-tokens-layout">
          {/* LISTA DE EMPLEADOS */}
          <div className="level2-tokens-users-section">
            <div className="level2-card">
              <div className="level2-card-header">
                <h2 className="level2-card-title">Empleados y Tokens</h2>
                <div className="level2-card-subtitle">Balance de tokens por empleado</div>
              </div>

              {companyUsers.length === 0 ? (
                <div className="level2-no-data-message">
                  <p>No hay empleados registrados en la empresa.</p>
                </div>
              ) : (
                <div className="level2-table-container">
                  <div className="level2-table-wrapper">
                    <table className="level2-table">
                      <thead>
                        <tr>
                          <th>Empleado</th>
                          <th>Tokens Empresa</th>
                          <th>Tokens Jobby</th>
                          <th>Última Actualización</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {companyUsers.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <div className="level2-user-info">
                                <div className="level2-user-name">{user.displayName}</div>
                                <div className="level2-user-email">{user.email}</div>
                              </div>
                            </td>
                            <td>
                              <span className="level2-token-balance company">
                                {user.companyBalance || 0}
                              </span>
                            </td>
                            <td>
                              <span className="level2-token-balance jobby">
                                {user.jobbyBalance || 0}
                              </span>
                            </td>
                            <td>
                              <span className="level2-last-updated">
                                {user.lastUpdated 
                                  ? new Date(user.lastUpdated).toLocaleDateString()
                                  : 'Nunca'
                                }
                              </span>
                            </td>
                            <td>
                              <button
                                className="level2-btn-action assign"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setAssignForm(prev => ({
                                    ...prev,
                                    userId: user.id
                                  }));
                                  setShowAssignModal(true);
                                }}
                              >
                                Asignar
                              </button>
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

          {/* HISTORIAL DE TRANSACCIONES */}
          <div className="level2-tokens-history-section">
            <div className="level2-card">
              <div className="level2-card-header">
                <h2 className="level2-card-title">Historial de Transacciones</h2>
                <div className="level2-card-subtitle">Últimas asignaciones de tokens</div>
              </div>

              {tokenHistory.length === 0 ? (
                <div className="level2-no-data-message">
                  <p>No hay transacciones registradas.</p>
                </div>
              ) : (
                <div className="level2-history-container">
                  {tokenHistory.slice(0, 10).map((transaction, index) => {
                    const user = companyUsers.find(u => u.id === transaction.userId);
                    return (
                      <div key={transaction.id || index} className="level2-history-item">
                        <div className="level2-history-icon">
                          {transaction.type === 'add' ? '➕' : 
                           transaction.type === 'used' ? '🎯' : '➖'}
                        </div>
                        <div className="level2-history-content">
                          <div className="level2-history-main">
                            <span className="level2-history-amount">
                              {transaction.type === 'add' ? '+' : '-'}{transaction.amount}
                            </span>
                            <span className="level2-history-user">
                              {user?.displayName || 'Usuario desconocido'}
                            </span>
                          </div>
                          <div className="level2-history-details">
                            <span className="level2-history-reason">
                              {transaction.reason || 'Sin motivo especificado'}
                            </span>
                            <span className="level2-history-date">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL ASIGNACIÓN INDIVIDUAL */}
      {showAssignModal && (
        <div className="level2-modal-overlay">
          <div className="level2-modal-container">
            <div className="level2-modal-header">
              <h2>Asignar Tokens</h2>
              <button 
                className="level2-close-button" 
                onClick={() => setShowAssignModal(false)}
              >
                ×
              </button>
            </div>

            <form className="level2-form" onSubmit={handleAssignTokens}>
              <div className="level2-form-group">
                <label htmlFor="userId">Empleado *</label>
                <select
                  id="userId"
                  value={assignForm.userId}
                  onChange={(e) => setAssignForm(prev => ({...prev, userId: e.target.value}))}
                  required
                >
                  <option value="">Seleccionar empleado</option>
                  {companyUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.displayName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="level2-form-group">
                <label htmlFor="amount">Cantidad de Tokens *</label>
                <input
                  id="amount"
                  type="number"
                  min="1"
                  value={assignForm.amount}
                  onChange={(e) => setAssignForm(prev => ({...prev, amount: e.target.value}))}
                  required
                />
              </div>

              <div className="level2-form-group">
                <label htmlFor="reason">Motivo</label>
                <textarea
                  id="reason"
                  value={assignForm.reason}
                  onChange={(e) => setAssignForm(prev => ({...prev, reason: e.target.value}))}
                  placeholder="Motivo de la asignación (opcional)"
                  rows="3"
                />
              </div>

              <div className="level2-form-actions">
                <button 
                  type="button" 
                  className="level2-btn-secondary"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="level2-btn-primary">
                  Asignar Tokens
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ASIGNACIÓN MASIVA */}
      {showBulkModal && (
        <div className="level2-modal-overlay">
          <div className="level2-modal-container level2-modal-large">
            <div className="level2-modal-header">
              <h2>Asignación Masiva de Tokens</h2>
              <button 
                className="level2-close-button" 
                onClick={() => setShowBulkModal(false)}
              >
                ×
              </button>
            </div>

            <form className="level2-form" onSubmit={handleBulkAssign}>
              <div className="level2-form-group">
                <label htmlFor="bulkAmount">Cantidad de Tokens por Usuario *</label>
                <input
                  id="bulkAmount"
                  type="number"
                  min="1"
                  value={bulkAssignForm.amount}
                  onChange={(e) => setBulkAssignForm(prev => ({...prev, amount: e.target.value}))}
                  required
                />
              </div>

              <div className="level2-form-group">
                <label htmlFor="bulkReason">Motivo</label>
                <textarea
                  id="bulkReason"
                  value={bulkAssignForm.reason}
                  onChange={(e) => setBulkAssignForm(prev => ({...prev, reason: e.target.value}))}
                  placeholder="Motivo de la asignación masiva"
                  rows="3"
                />
              </div>

              <div className="level2-form-group">
                <label>Seleccionar Empleados *</label>
                <div className="level2-user-selection">
                  <div className="level2-select-all">
                    <label>
                      <input
                        type="checkbox"
                        checked={bulkAssignForm.selectedUsers.length === companyUsers.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                      Seleccionar todos ({companyUsers.length} empleados)
                    </label>
                  </div>
                  
                  <div className="level2-users-list">
                    {companyUsers.map(user => (
                      <label key={user.id} className="level2-user-checkbox">
                        <input
                          type="checkbox"
                          checked={bulkAssignForm.selectedUsers.includes(user.id)}
                          onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                        />
                        <span className="level2-user-label">
                          {user.displayName} ({user.companyBalance || 0} tokens)
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="level2-form-actions">
                <button 
                  type="button" 
                  className="level2-btn-secondary"
                  onClick={() => setShowBulkModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="level2-btn-primary">
                  Asignar a {bulkAssignForm.selectedUsers.length} Usuarios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyTokensManagement;