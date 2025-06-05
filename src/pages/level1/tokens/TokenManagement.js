import React, { useState, useEffect } from 'react';
import { ref, onValue, push, update, get } from 'firebase/database';
import { database } from '../../../services/firebase/config';
import { useAuth } from '../../../context/AuthContext';
import './TokenManagement.css';

const TokenManagement = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTokenBalance, setUserTokenBalance] = useState(0);
  const [tokenHistory, setTokenHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Estados para formularios
  const [tokensToAdd, setTokensToAdd] = useState(1);
  const [tokensToRemove, setTokensToRemove] = useState(1);
  const [reason, setReason] = useState('');
  
  // Estados para filtros
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar usuarios nivel 3
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = ref(database, 'users');
        onValue(usersRef, (snapshot) => {
          const usersList = [];
          
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const userData = childSnapshot.val();
              
              // Solo incluir usuarios con nivel 3 (empleados)
              if (userData.userLevel === 3 || userData.userLevel === '3') {
                usersList.push({
                  id: childSnapshot.key,
                  ...userData
                });
              }
            });
            
            // Ordenar por nombre
            usersList.sort((a, b) => {
              const nameA = a.displayName || a.email || '';
              const nameB = b.displayName || b.email || '';
              return nameA.localeCompare(nameB);
            });
            
            setUsers(usersList);
          }
        });
        
        setLoading(false);
      } catch (err) {
        setError('Error al cargar usuarios: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Cargar balance y historial del usuario seleccionado
  useEffect(() => {
    const fetchUserTokenData = async () => {
      if (!selectedUser) {
        setUserTokenBalance(0);
        setTokenHistory([]);
        return;
      }
      
      try {
        // Cargar balance de tokens en blanco
        const balanceRef = ref(database, `user_blank_tokens/${selectedUser.id}/balance`);
        onValue(balanceRef, (snapshot) => {
          setUserTokenBalance(snapshot.exists() ? snapshot.val() : 0);
        });
        
        // Cargar historial de transacciones de tokens
        const historyRef = ref(database, `user_blank_tokens/${selectedUser.id}/history`);
        onValue(historyRef, (snapshot) => {
          const historyList = [];
          
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              historyList.push({
                id: childSnapshot.key,
                ...childSnapshot.val(),
                createdAt: new Date(childSnapshot.val().createdAt)
              });
            });
            
            // Ordenar por fecha (más recientes primero)
            historyList.sort((a, b) => b.createdAt - a.createdAt);
          }
          
          setTokenHistory(historyList);
        });
        
      } catch (err) {
        setError('Error al cargar datos del usuario: ' + err.message);
      }
    };
    
    fetchUserTokenData();
  }, [selectedUser]);

  const handleUserChange = (e) => {
    const userId = e.target.value;
    const user = users.find(u => u.id === userId) || null;
    setSelectedUser(user);
    
    // Limpiar mensajes
    setError('');
    setSuccess('');
  };

  const handleAddTokens = async (e) => {
    e.preventDefault();
    
    if (!selectedUser || tokensToAdd < 1) {
      setError('Por favor, selecciona un usuario y especifica una cantidad válida');
      return;
    }
    
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      const userId = selectedUser.id;
      const currentTime = Date.now();
      
      // Obtener balance actual
      const balanceRef = ref(database, `user_blank_tokens/${userId}/balance`);
      const balanceSnapshot = await get(balanceRef);
      const currentBalance = balanceSnapshot.exists() ? balanceSnapshot.val() : 0;
      
      // Actualizar balance
      const newBalance = currentBalance + tokensToAdd;
      await update(ref(database, `user_blank_tokens/${userId}`), {
        balance: newBalance,
        lastUpdated: currentTime
      });
      
      // Registrar en historial
      const historyRef = ref(database, `user_blank_tokens/${userId}/history`);
      await push(historyRef, {
        type: 'add',
        amount: tokensToAdd,
        reason: reason || 'Tokens añadidos por administrador',
        adminId: currentUser.uid,
        adminName: currentUser.displayName || currentUser.email,
        createdAt: currentTime,
        balanceBefore: currentBalance,
        balanceAfter: newBalance
      });
      
      setSuccess(`Se añadieron ${tokensToAdd} tokens a ${selectedUser.displayName || selectedUser.email}`);
      
      // Limpiar formulario
      setTokensToAdd(1);
      setReason('');
      
      setActionLoading(false);
    } catch (err) {
      setError('Error al añadir tokens: ' + err.message);
      setActionLoading(false);
    }
  };

  const handleRemoveTokens = async (e) => {
    e.preventDefault();
    
    if (!selectedUser || tokensToRemove < 1) {
      setError('Por favor, selecciona un usuario y especifica una cantidad válida');
      return;
    }
    
    if (tokensToRemove > userTokenBalance) {
      setError(`No se pueden quitar ${tokensToRemove} tokens. El usuario solo tiene ${userTokenBalance} tokens.`);
      return;
    }
    
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      
      const userId = selectedUser.id;
      const currentTime = Date.now();
      
      // Calcular nuevo balance
      const newBalance = userTokenBalance - tokensToRemove;
      
      // Actualizar balance
      await update(ref(database, `user_blank_tokens/${userId}`), {
        balance: newBalance,
        lastUpdated: currentTime
      });
      
      // Registrar en historial
      const historyRef = ref(database, `user_blank_tokens/${userId}/history`);
      await push(historyRef, {
        type: 'remove',
        amount: tokensToRemove,
        reason: reason || 'Tokens removidos por administrador',
        adminId: currentUser.uid,
        adminName: currentUser.displayName || currentUser.email,
        createdAt: currentTime,
        balanceBefore: userTokenBalance,
        balanceAfter: newBalance
      });
      
      setSuccess(`Se quitaron ${tokensToRemove} tokens de ${selectedUser.displayName || selectedUser.email}`);
      
      // Limpiar formulario
      setTokensToRemove(1);
      setReason('');
      
      setActionLoading(false);
    } catch (err) {
      setError('Error al quitar tokens: ' + err.message);
      setActionLoading(false);
    }
  };

  const filteredHistory = () => {
    if (!tokenHistory.length) {
      return [];
    }
    
    let filtered = [...tokenHistory];
    
    // Filtrar por tipo
    if (filter !== 'all') {
      filtered = filtered.filter(item => item.type === filter);
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.reason.toLowerCase().includes(term) ||
        item.adminName.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'add': return 'Añadido';
      case 'remove': return 'Quitado';
      case 'used': return 'Canjeado';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="token-management-container">
        <h1>Gestión de Tokens</h1>
        <div className="loading-container">
          <div className="loading-spinner">Cargando datos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="token-management-container">
      <h1>Gestión de Tokens</h1>
      
      <div className="token-management-description">
        <p>Administra los tokens en blanco de los usuarios. Los usuarios pueden usar estos tokens para canjear por las experiencias que elijan.</p>
      </div>
      
      <div className="token-management-grid">
        {/* Panel de selección de usuario */}
        <div className="user-selection-card">
          <div className="card-header">
            <h2>Seleccionar Usuario</h2>
          </div>
          
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="userSelect">Usuario (Nivel 3)</label>
              <select 
                id="userSelect"
                value={selectedUser?.id || ''}
                onChange={handleUserChange}
              >
                <option value="">Selecciona un usuario</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.displayName || user.email}
                  </option>
                ))}
              </select>
              {users.length === 0 && (
                <div className="warning-message">
                  No hay usuarios de nivel 3 disponibles
                </div>
              )}
            </div>
            
            {selectedUser && (
              <div className="user-token-balance">
                <div className="balance-display">
                  <span className="balance-label">Balance actual:</span>
                  <span className="balance-value">{userTokenBalance} tokens</span>
                </div>
                <div className="user-info">
                  <span className="user-name">{selectedUser.displayName || selectedUser.email}</span>
                  {selectedUser.companyId && (
                    <span className="user-company">Empresa ID: {selectedUser.companyId}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Panel de acciones */}
        {selectedUser && (
          <div className="token-actions-card">
            <div className="card-header">
              <h2>Gestionar Tokens</h2>
            </div>
            
            <div className="card-body">
              {/* Formulario para añadir tokens */}
              <div className="action-section">
                <h3>Añadir Tokens</h3>
                <form onSubmit={handleAddTokens}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="tokensToAdd">Cantidad</label>
                      <input 
                        id="tokensToAdd"
                        type="number" 
                        min="1" 
                        max="100"
                        value={tokensToAdd}
                        onChange={(e) => setTokensToAdd(parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      className="add-tokens-button"
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Añadiendo...' : `Añadir ${tokensToAdd} Token${tokensToAdd > 1 ? 's' : ''}`}
                    </button>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="addReason">Motivo (opcional)</label>
                    <input 
                      id="addReason"
                      type="text" 
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Razón para añadir tokens..."
                    />
                  </div>
                </form>
              </div>
              
              {/* Separador */}
              <div className="action-separator"></div>
              
              {/* Formulario para quitar tokens */}
              <div className="action-section">
                <h3>Quitar Tokens</h3>
                <form onSubmit={handleRemoveTokens}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="tokensToRemove">Cantidad</label>
                      <input 
                        id="tokensToRemove"
                        type="number" 
                        min="1" 
                        max={userTokenBalance}
                        value={tokensToRemove}
                        onChange={(e) => setTokensToRemove(parseInt(e.target.value) || 1)}
                        required
                        disabled={userTokenBalance === 0}
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      className="remove-tokens-button"
                      disabled={actionLoading || userTokenBalance === 0}
                    >
                      {actionLoading ? 'Quitando...' : `Quitar ${tokensToRemove} Token${tokensToRemove > 1 ? 's' : ''}`}
                    </button>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="removeReason">Motivo (opcional)</label>
                    <input 
                      id="removeReason"
                      type="text" 
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Razón para quitar tokens..."
                    />
                  </div>
                </form>
              </div>
              
              {/* Mensajes */}
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
            </div>
          </div>
        )}
        
        {/* Panel de historial */}
        {selectedUser && (
          <div className="token-history-card">
            <div className="card-header">
              <h2>Historial de Tokens</h2>
            </div>
            
            <div className="card-body">
              <div className="history-filter-bar">
                <div className="filter-group">
                  <label htmlFor="typeFilter">Tipo:</label>
                  <select 
                    id="typeFilter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="add">Añadidos</option>
                    <option value="remove">Quitados</option>
                    <option value="used">Canjeados</option>
                  </select>
                </div>
                
                <div className="search-group">
                  <input 
                    type="text"
                    placeholder="Buscar en historial..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {filteredHistory().length === 0 ? (
                <div className="no-history-message">
                  No hay historial de tokens para este usuario
                </div>
              ) : (
                <div className="history-table-container">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>Cantidad</th>
                        <th>Balance</th>
                        <th>Motivo</th>
                        <th>Admin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory().map(item => (
                        <tr key={item.id} className={`history-row history-${item.type}`}>
                          <td>{formatDate(item.createdAt)}</td>
                          <td>
                            <span className={`type-badge type-${item.type}`}>
                              {getTypeText(item.type)}
                            </span>
                          </td>
                          <td className={`amount ${item.type === 'add' ? 'positive' : 'negative'}`}>
                            {item.type === 'add' ? '+' : '-'}{item.amount}
                          </td>
                          <td>
                            <span className="balance-change">
                              {item.balanceBefore} → {item.balanceAfter}
                            </span>
                          </td>
                          <td>{item.reason}</td>
                          <td>{item.adminName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenManagement;