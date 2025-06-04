import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue, get } from 'firebase/database';
import { database } from '../../../services/firebase/config';
import { useAuth } from '../../../context/AuthContext';
import {
  getUserTokens,
  createUserToken,
  revokeToken,
  getJobbyBenefits,
  getCompanyBenefits
} from '../../../services/firebase/database/databaseService';
import './TokenManagement.css';

const TokenManagement = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [benefits, setBenefits] = useState([]);
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [userTokens, setUserTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [expiryDays, setExpiryDays] = useState(30);
  const [isBenefitJobby, setIsBenefitJobby] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [tokenToRevoke, setTokenToRevoke] = useState(null);
  const [revocationReason, setRevocationReason] = useState('');
  
  // Cargar usuarios, empresas y beneficios
  useEffect(() => {
    const fetchData = async () => {
      console.log("Iniciando carga de datos...");
      try {
        // Cargar usuarios
        console.log("Cargando usuarios de nivel 3...");
        const usersRef = ref(database, 'users');
        onValue(usersRef, (snapshot) => {
          const usersList = [];
          console.log("Datos de usuarios recibidos:", snapshot.exists());
          
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const userData = childSnapshot.val();
              
                  // Verificar y registrar cada usuario para depuración
              console.log(`Usuario encontrado: ${userData.email || userData.displayName || childSnapshot.key}, Nivel: ${userData.userLevel}, Tipo: ${typeof userData.userLevel}`);
              
              // Solo incluir usuarios con nivel 3 (empleados)
              // Convertir a número para comparar correctamente (puede estar almacenado como string)
              if (userData.userLevel === 3 || userData.userLevel === '3') {
                console.log(`✅ Usuario de nivel 3 añadido: ${userData.email || userData.displayName || childSnapshot.key}`);
                usersList.push({
                  id: childSnapshot.key,
                  ...userData
                });
              } else {
                console.log(`❌ Usuario NO añadido (nivel diferente de 3): ${userData.email || userData.displayName || childSnapshot.key}`);
              }
            });
            
            // Ordenar por nombre
            usersList.sort((a, b) => {
              const nameA = a.displayName || a.email || '';
              const nameB = b.displayName || b.email || '';
              return nameA.localeCompare(nameB);
            });
            
            console.log(`Se encontraron ${usersList.length} usuarios de nivel 3:`, usersList);
            setUsers(usersList);
          }
        });
        
        // Cargar empresas
        const companiesRef = ref(database, 'companies');
        onValue(companiesRef, (snapshot) => {
          const companiesList = [];
          
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              companiesList.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
              });
            });
            
            // Ordenar por nombre
            companiesList.sort((a, b) => a.name.localeCompare(b.name));
            
            setCompanies(companiesList);
          }
        });
        
        // Cargar beneficios de Jobby
        const jobbyBenefits = await getJobbyBenefits();
        
        // Ordenar por nombre (asegurando que name existe)
        const validBenefits = jobbyBenefits.filter(benefit => benefit && benefit.name);
        validBenefits.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        
        setBenefits(validBenefits.map(benefit => ({
          ...benefit,
          isBenefitJobby: true
        })));
        
        setLoading(false);
      } catch (err) {
        setError('Error al cargar datos: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Cargar tokens del usuario seleccionado
  useEffect(() => {
    const fetchUserTokens = async () => {
      if (!selectedUser) {
        setUserTokens([]);
        return;
      }
      
      try {
        setTokenLoading(true);
        const tokens = await getUserTokens(selectedUser.id);
        
        // Enriquecer tokens con información adicional
        const enrichedTokens = await Promise.all(tokens.map(async (token) => {
          try {
            const requestData = token.requestData;
            
            // Obtener información del beneficio
            let benefitData = {};
            
            if (requestData.isBenefitJobby) {
              const benefitRef = ref(database, `jobby_benefits/${requestData.benefitId}`);
              const benefitSnapshot = await get(benefitRef);
              
              if (benefitSnapshot.exists()) {
                benefitData = benefitSnapshot.val();
              }
            } else if (requestData.companyId) {
              const benefitRef = ref(database, `company_benefits/${requestData.companyId}/${requestData.benefitId}`);
              const benefitSnapshot = await get(benefitRef);
              
              if (benefitSnapshot.exists()) {
                benefitData = benefitSnapshot.val();
              }
            }
            
            // Obtener información de la empresa
            let companyData = {};
            
            if (requestData.companyId) {
              const companyRef = ref(database, `companies/${requestData.companyId}`);
              const companySnapshot = await get(companyRef);
              
              if (companySnapshot.exists()) {
                companyData = companySnapshot.val();
              }
            }
            
            return {
              ...token,
              benefitData: {
                ...benefitData,
                id: requestData.benefitId
              },
              companyData: {
                ...companyData,
                id: requestData.companyId
              },
              createdAt: new Date(token.createdAt),
              expiresAt: new Date(token.expiresAt),
              usedAt: token.usedAt ? new Date(token.usedAt) : null,
              revokedAt: token.revokedAt ? new Date(token.revokedAt) : null
            };
          } catch (error) {
            console.error('Error al enriquecer token:', error);
            return token;
          }
        }));
        
        // Ordenar por fecha de creación (más recientes primero)
        enrichedTokens.sort((a, b) => b.createdAt - a.createdAt);
        
        setUserTokens(enrichedTokens);
        setTokenLoading(false);
      } catch (err) {
        setError('Error al cargar tokens del usuario: ' + err.message);
        setTokenLoading(false);
      }
    };
    
    fetchUserTokens();
  }, [selectedUser]);
  
  // Cuando cambia la selección de empresa, cargar sus beneficios
  useEffect(() => {
    const fetchCompanyBenefits = async () => {
      if (!selectedCompany || isBenefitJobby) {
        return;
      }
      
      try {
        const companyBenefits = await getCompanyBenefits(selectedCompany.id);
        
        // Ordenar por nombre (asegurando que name existe)
        const validBenefits = companyBenefits.filter(benefit => benefit && benefit.name);
        validBenefits.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        
        setBenefits(validBenefits.map(benefit => ({
          ...benefit,
          isBenefitJobby: false
        })));
      } catch (err) {
        setError('Error al cargar beneficios de la empresa: ' + err.message);
      }
    };
    
    const fetchJobbyBenefits = async () => {
      if (!isBenefitJobby) {
        return;
      }
      
      try {
        const jobbyBenefits = await getJobbyBenefits();
        
        // Ordenar por nombre (asegurando que name existe)
        const validBenefits = jobbyBenefits.filter(benefit => benefit && benefit.name);
        validBenefits.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        
        setBenefits(validBenefits.map(benefit => ({
          ...benefit,
          isBenefitJobby: true
        })));
      } catch (err) {
        setError('Error al cargar beneficios de Jobby: ' + err.message);
      }
    };
    
    if (isBenefitJobby) {
      fetchJobbyBenefits();
    } else {
      fetchCompanyBenefits();
    }
  }, [selectedCompany, isBenefitJobby]);
  
  const handleBenefitTypeChange = (e) => {
    const value = e.target.value === 'jobby';
    setIsBenefitJobby(value);
    setSelectedBenefit(null);
  };
  
  const handleUserChange = (e) => {
    const userId = e.target.value;
    const user = users.find(u => u.id === userId) || null;
    setSelectedUser(user);
    
    // Si el usuario tiene compañía, seleccionarla por defecto
    if (user && user.companyId) {
      const company = companies.find(c => c.id === user.companyId) || null;
      setSelectedCompany(company);
    } else {
      setSelectedCompany(null);
    }
  };
  
  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    const company = companies.find(c => c.id === companyId) || null;
    setSelectedCompany(company);
  };
  
  const handleBenefitChange = (e) => {
    const benefitId = e.target.value;
    const benefit = benefits.find(b => b.id === benefitId) || null;
    setSelectedBenefit(benefit);
  };
  
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };
  
  const handleCreateToken = async (e) => {
    e.preventDefault();
    
    if (!selectedUser || !selectedBenefit) {
      setError('Por favor, selecciona un usuario y un beneficio');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Datos para crear el token
      const userId = selectedUser.id;
      const benefitId = selectedBenefit.id;
      const companyId = !isBenefitJobby ? selectedCompany?.id : null;
      const adminId = currentUser.uid;
      
      // Crear token
      const result = await createUserToken(
        userId,
        benefitId,
        isBenefitJobby,
        companyId,
        adminId,
        expiryDays
      );
      
      setSuccess(`Token creado exitosamente para ${selectedUser.displayName || selectedUser.email}`);
      
      // Recargar tokens del usuario
      const tokens = await getUserTokens(selectedUser.id);
      setUserTokens(tokens);
      
      setLoading(false);
    } catch (err) {
      setError('Error al crear token: ' + err.message);
      setLoading(false);
    }
  };
  
  const handleOpenRevokeModal = (token) => {
    setTokenToRevoke(token);
    setShowRevokeModal(true);
  };
  
  const handleCloseRevokeModal = () => {
    setTokenToRevoke(null);
    setShowRevokeModal(false);
    setRevocationReason('');
  };
  
  const handleRevokeToken = async () => {
    if (!tokenToRevoke) {
      return;
    }
    
    try {
      setLoading(true);
      
      await revokeToken(tokenToRevoke.id, currentUser.uid, revocationReason);
      
      setSuccess(`Token revocado exitosamente`);
      
      // Recargar tokens del usuario
      const tokens = await getUserTokens(selectedUser.id);
      setUserTokens(tokens);
      
      handleCloseRevokeModal();
      setLoading(false);
    } catch (err) {
      setError('Error al revocar token: ' + err.message);
      setLoading(false);
    }
  };
  
  const filteredTokens = () => {
    if (!userTokens.length) {
      return [];
    }
    
    let filtered = [...userTokens];
    
    // Filtrar por estado
    if (filter !== 'all') {
      filtered = filtered.filter(token => token.status === filter);
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(token => 
        token.tokenCode.toLowerCase().includes(term) ||
        token.benefitData?.name?.toLowerCase().includes(term) ||
        token.companyData?.name?.toLowerCase().includes(term)
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
  
  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'used': return 'Utilizado';
      case 'expired': return 'Expirado';
      case 'revoked': return 'Revocado';
      default: return status;
    }
  };
  
  // Mostrar indicador de carga mientras se obtienen los datos iniciales
  if (loading && users.length === 0) {
    return (
      <div className="token-management-container">
        <h1>Gestión de Tokens</h1>
        <div className="loading-container">
          <div className="loading-spinner">Cargando datos iniciales...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="token-management-container">
      <h1>Gestión de Tokens</h1>
      
      <div className="token-management-grid">
        <div className="token-creation-card">
          <div className="card-header">
            <h2>Crear Token</h2>
          </div>
          
          <div className="card-body">
            <form onSubmit={handleCreateToken}>
              <div className="form-group">
                <label htmlFor="userSelect">Usuario (Nivel 3)</label>
                <select 
                  id="userSelect"
                  value={selectedUser?.id || ''}
                  onChange={handleUserChange}
                  required
                >
                  <option value="">Selecciona un usuario</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.displayName || user.email} 
                      {user.companyId && ` - ${companies.find(c => c.id === user.companyId)?.name || 'Empresa'}`}
                    </option>
                  ))}
                </select>
                {users.length === 0 && (
                  <div className="error-message" style={{marginTop: '10px', padding: '10px'}}>
                    <p><strong>No hay usuarios de nivel 3 disponibles</strong></p>
                    <p>Para la gestión de tokens, se requieren usuarios con nivel 3.</p>
                    <p>Verifica el <Link to="/level1/diagnostico-usuarios" style={{color: '#0066cc', textDecoration: 'underline'}}>Diagnóstico de Usuarios</Link> para más información.</p>
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label>Tipo de Beneficio</label>
                <div className="radio-group">
                  <div className="radio-item">
                    <input 
                      type="radio" 
                      id="benefitTypeJobby" 
                      name="benefitType" 
                      value="jobby"
                      checked={isBenefitJobby}
                      onChange={handleBenefitTypeChange}
                    />
                    <label htmlFor="benefitTypeJobby">Beneficio Jobby</label>
                  </div>
                  
                  <div className="radio-item">
                    <input 
                      type="radio" 
                      id="benefitTypeCompany" 
                      name="benefitType" 
                      value="company"
                      checked={!isBenefitJobby}
                      onChange={handleBenefitTypeChange}
                      disabled={!selectedUser?.companyId}
                    />
                    <label htmlFor="benefitTypeCompany">Beneficio de Empresa</label>
                  </div>
                </div>
                
                {!selectedUser?.companyId && !isBenefitJobby && (
                  <div className="warning-message">
                    Este usuario no está asociado a ninguna empresa
                  </div>
                )}
              </div>
              
              {!isBenefitJobby && (
                <div className="form-group">
                  <label htmlFor="companySelect">Empresa</label>
                  <select 
                    id="companySelect"
                    value={selectedCompany?.id || ''}
                    onChange={handleCompanyChange}
                    required={!isBenefitJobby}
                  >
                    <option value="">Selecciona una empresa</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="benefitSelect">Beneficio</label>
                <select 
                  id="benefitSelect"
                  value={selectedBenefit?.id || ''}
                  onChange={handleBenefitChange}
                  required
                  disabled={!isBenefitJobby && !selectedCompany}
                >
                  <option value="">Selecciona un beneficio</option>
                  {benefits.map(benefit => (
                    <option key={benefit.id} value={benefit.id}>
                      {benefit.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="expiryDays">Días para expiración</label>
                <input 
                  id="expiryDays"
                  type="number" 
                  min="1" 
                  max="365"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                  required
                />
              </div>
              
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
              
              <button 
                type="submit" 
                className="create-token-button"
                disabled={loading || !selectedUser || !selectedBenefit}
              >
                {loading ? 'Creando...' : 'Crear Token'}
              </button>
            </form>
          </div>
        </div>
        
        <div className="user-tokens-card">
          <div className="card-header">
            <h2>Tokens del Usuario</h2>
            
            {selectedUser && (
              <div className="user-info">
                <span className="user-name">
                  {selectedUser.displayName || selectedUser.email}
                </span>
                {selectedUser.companyId && (
                  <span className="user-company">
                    {companies.find(c => c.id === selectedUser.companyId)?.name || 'Empresa'}
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="card-body">
            {!selectedUser ? (
              <div className="no-user-selected">
                Selecciona un usuario para ver sus tokens
              </div>
            ) : tokenLoading ? (
              <div className="loading-spinner">Cargando tokens...</div>
            ) : (
              <>
                <div className="tokens-filter-bar">
                  <div className="filter-group">
                    <label htmlFor="statusFilter">Estado:</label>
                    <select 
                      id="statusFilter"
                      value={filter}
                      onChange={handleFilterChange}
                    >
                      <option value="all">Todos</option>
                      <option value="active">Activos</option>
                      <option value="used">Utilizados</option>
                      <option value="expired">Expirados</option>
                      <option value="revoked">Revocados</option>
                    </select>
                  </div>
                  
                  <div className="search-group">
                    <input 
                      type="text"
                      placeholder="Buscar tokens..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                {filteredTokens().length === 0 ? (
                  <div className="no-tokens-message">
                    No hay tokens {filter !== 'all' ? `con estado "${getStatusText(filter)}"` : ''}
                  </div>
                ) : (
                  <div className="tokens-table-container">
                    <table className="tokens-table">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Beneficio</th>
                          <th>Creado</th>
                          <th>Expira</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTokens().map(token => (
                          <tr key={token.id} className={`token-row token-${token.status}`}>
                            <td className="token-code">{token.tokenCode}</td>
                            <td>
                              {token.benefitData?.name || 'Beneficio no disponible'}
                              <span className={`token-type ${token.requestData.isBenefitJobby ? 'token-jobby' : 'token-company'}`}>
                                {token.requestData.isBenefitJobby ? ' (Jobby)' : ` (${token.companyData?.name || 'Empresa'})`}
                              </span>
                            </td>
                            <td>{formatDate(token.createdAt)}</td>
                            <td>{formatDate(token.expiresAt)}</td>
                            <td>
                              <span className={`status-badge status-${token.status}`}>
                                {getStatusText(token.status)}
                              </span>
                              
                              {token.status === 'used' && (
                                <div className="status-info">
                                  {formatDate(token.usedAt)}
                                </div>
                              )}
                              
                              {token.status === 'revoked' && (
                                <div className="status-info">
                                  {formatDate(token.revokedAt)}
                                </div>
                              )}
                            </td>
                            <td>
                              {token.status === 'active' && (
                                <button 
                                  className="revoke-button"
                                  onClick={() => handleOpenRevokeModal(token)}
                                >
                                  Revocar
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {showRevokeModal && tokenToRevoke && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Revocar Token</h3>
              <button className="close-button" onClick={handleCloseRevokeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <p>¿Estás seguro de que deseas revocar el siguiente token?</p>
              
              <div className="token-info">
                <div className="token-info-item">
                  <span className="info-label">Código:</span>
                  <span className="token-code">{tokenToRevoke.tokenCode}</span>
                </div>
                
                <div className="token-info-item">
                  <span className="info-label">Beneficio:</span>
                  <span>{tokenToRevoke.benefitData?.name || 'Beneficio no disponible'}</span>
                </div>
                
                <div className="token-info-item">
                  <span className="info-label">Tipo:</span>
                  <span>
                    {tokenToRevoke.requestData.isBenefitJobby 
                      ? 'Beneficio Jobby' 
                      : `Beneficio de ${tokenToRevoke.companyData?.name || 'Empresa'}`}
                  </span>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="revocationReason">Motivo de revocación (opcional)</label>
                <textarea 
                  id="revocationReason"
                  value={revocationReason}
                  onChange={(e) => setRevocationReason(e.target.value)}
                  placeholder="Ingresa el motivo de la revocación..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="cancel-button" onClick={handleCloseRevokeModal}>
                Cancelar
              </button>
              <button className="confirm-button" onClick={handleRevokeToken}>
                Confirmar Revocación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenManagement;