import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue, get } from 'firebase/database';
import { database } from '../../services/firebase/config';
import { useAuth } from '../../context/AuthContext';
import './Level1Dashboard.css';

const Level1Dashboard = () => {
  console.log("Rendering Level1Dashboard component");
  
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    companies: 0,
    users: 0,
    jobbyBenefits: 0,
    pendingRequests: 0,
    completedTokens: 0
  });
  const [recentCompanies, setRecentCompanies] = useState([]);
  const [completedTokens, setCompletedTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Level1Dashboard useEffect running");
    
    const fetchDashboardData = async () => {
      try {
        console.log("Fetching dashboard data...");
        
        // Estadísticas de empresas
        const companiesRef = ref(database, 'companies');
        onValue(companiesRef, (snapshot) => {
          const companies = [];
          let companiesCount = 0;
          
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              companiesCount++;
              companies.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
              });
            });
          }
          
          console.log(`Found ${companiesCount} companies`);
          setRecentCompanies(companies.slice(0, 5));
          setStats(prevStats => ({
            ...prevStats,
            companies: companiesCount
          }));
        });
        
        // Estadísticas de usuarios
        const usersRef = ref(database, 'users');
        onValue(usersRef, (snapshot) => {
          let usersCount = 0;
          
          if (snapshot.exists()) {
            snapshot.forEach(() => {
              usersCount++;
            });
          }
          
          console.log(`Found ${usersCount} users`);
          setStats(prevStats => ({
            ...prevStats,
            users: usersCount
          }));
        });
        
        // Estadísticas de beneficios Jobby
        const jobbyBenefitsRef = ref(database, 'jobby_benefits');
        onValue(jobbyBenefitsRef, (snapshot) => {
          let benefitsCount = 0;
          
          if (snapshot.exists()) {
            snapshot.forEach(() => {
              benefitsCount++;
            });
          }
          
          console.log(`Found ${benefitsCount} Jobby benefits`);
          setStats(prevStats => ({
            ...prevStats,
            jobbyBenefits: benefitsCount
          }));
        });
        
        // Estadísticas de solicitudes pendientes
        const requestsRef = ref(database, 'benefit_requests');
        onValue(requestsRef, (snapshot) => {
          let pendingCount = 0;
          
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const requestData = childSnapshot.val();
              
              if (requestData.status === 'pending' && requestData.isBenefitJobby) {
                pendingCount++;
              }
            });
          }
          
          console.log(`Found ${pendingCount} pending requests`);
          setStats(prevStats => ({
            ...prevStats,
            pendingRequests: pendingCount
          }));
        });
        
        // Obtener tokens completados (utilizados por proveedores)
        const tokensRef = ref(database, 'benefit_tokens');
        onValue(tokensRef, async (snapshot) => {
          let usedTokensCount = 0;
          const usedTokensData = [];
          
          if (snapshot.exists()) {
            const promises = [];
            
            snapshot.forEach((childSnapshot) => {
              const token = childSnapshot.val();
              
              // Solo nos interesan los tokens que han sido utilizados
              if (token.status === 'used' && token.usedBy && token.usedAt) {
                usedTokensCount++;
                
                // Crear una promesa para obtener datos adicionales
                const promise = (async () => {
                  try {
                    // 1. Obtener datos de la solicitud
                    const requestSnapshot = await get(ref(database, `benefit_requests/${token.requestId}`));
                    if (!requestSnapshot.exists()) return null;
                    
                    const requestData = requestSnapshot.val();
                    
                    // 2. Obtener datos del usuario
                    const userSnapshot = await get(ref(database, `users/${requestData.userId}`));
                    let userData = {};
                    if (userSnapshot.exists()) {
                      userData = userSnapshot.val();
                    }
                    
                    // 3. Obtener datos de la empresa
                    let companyData = {};
                    if (userData.companyId) {
                      const companySnapshot = await get(ref(database, `companies/${userData.companyId}`));
                      if (companySnapshot.exists()) {
                        companyData = companySnapshot.val();
                      }
                    }
                    
                    // 4. Obtener datos del proveedor
                    const providerSnapshot = await get(ref(database, `users/${token.usedBy}`));
                    let providerData = {};
                    if (providerSnapshot.exists()) {
                      providerData = providerSnapshot.val();
                    }
                    
                    // 5. Obtener datos del beneficio
                    let benefitData = {};
                    if (requestData.isBenefitJobby) {
                      const benefitSnapshot = await get(ref(database, `jobby_benefits/${requestData.benefitId}`));
                      if (benefitSnapshot.exists()) {
                        benefitData = benefitSnapshot.val();
                      }
                    } else if (requestData.companyId) {
                      const benefitSnapshot = await get(ref(database, `company_benefits/${requestData.companyId}/${requestData.benefitId}`));
                      if (benefitSnapshot.exists()) {
                        benefitData = benefitSnapshot.val();
                      }
                    }
                    
                    return {
                      id: childSnapshot.key,
                      ...token,
                      requestData: {
                        ...requestData,
                        id: token.requestId
                      },
                      userData: {
                        ...userData,
                        id: requestData.userId
                      },
                      companyData: {
                        ...companyData,
                        id: userData.companyId
                      },
                      providerData: {
                        ...providerData,
                        id: token.usedBy
                      },
                      benefitData: {
                        ...benefitData,
                        id: requestData.benefitId,
                        isBenefitJobby: requestData.isBenefitJobby
                      },
                      usedAt: new Date(token.usedAt)
                    };
                  } catch (error) {
                    console.error('Error al obtener datos del token:', error);
                    return null;
                  }
                })();
                
                promises.push(promise);
              }
            });
            
            // Esperar a que se resuelvan todas las promesas
            const results = await Promise.all(promises);
            const validResults = results.filter(result => result !== null);
            
            // Ordenar por fecha de uso (más recientes primero)
            validResults.sort((a, b) => b.usedAt - a.usedAt);
            
            setCompletedTokens(validResults);
            setStats(prevStats => ({
              ...prevStats,
              completedTokens: usedTokensCount
            }));
            
            console.log(`Found ${usedTokensCount} completed tokens`);
          }
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  console.log("Level1Dashboard render state:", { loading, stats, currentUser: !!currentUser });

  if (loading) {
    return <div>Cargando datos del dashboard...</div>;
  }
  
  return (
    <div className="dashboard-container">
      <h1>Dashboard Administración Jobby</h1>
      <p className="welcome-message">Bienvenido, {currentUser?.displayName || currentUser?.email || 'Administrador'}</p>
      
      <div className="dashboard-grid">
        <div className="stats-card">
          <div className="stats-card-title">Empresas</div>
          <div className="stats-card-value">{stats.companies}</div>
          <div className="stats-card-description">Empresas registradas</div>
        </div>
        
        <div className="stats-card">
          <div className="stats-card-title">Usuarios</div>
          <div className="stats-card-value">{stats.users}</div>
          <div className="stats-card-description">Usuarios totales</div>
        </div>
        
        <div className="stats-card">
          <div className="stats-card-title">Beneficios Jobby</div>
          <div className="stats-card-value">{stats.jobbyBenefits}</div>
          <div className="stats-card-description">Beneficios activos</div>
        </div>
        
        <div className="stats-card">
          <div className="stats-card-title">Solicitudes Pendientes</div>
          <div className="stats-card-value">{stats.pendingRequests}</div>
          <div className="stats-card-description">Requieren aprobación</div>
        </div>
        
        <div className="stats-card">
          <div className="stats-card-title">Tokens Completados</div>
          <div className="stats-card-value">{stats.completedTokens}</div>
          <div className="stats-card-description">Ciclo completo</div>
        </div>
      </div>
      
      <div className="dashboard-actions mt-5">
        <h2>Acciones Rápidas</h2>
        <div className="action-buttons">
          <Link to="/level1/companies" className="action-button">
            Gestionar Empresas
          </Link>
          <Link to="/level1/benefits" className="action-button">
            Gestionar Beneficios Jobby
          </Link>
          <Link to="/level1/requests" className="action-button">
            Ver Solicitudes Pendientes
          </Link>
          <Link to="/level1/providers" className="action-button">
            Gestionar Proveedores
          </Link>
          <Link to="/level1/tokens" className="action-button">
            Gestionar Tokens
          </Link>
          <Link to="/level1/diagnostico-usuarios" className="action-button">
            Diagnóstico de Usuarios
          </Link>
          <Link to="/level1/asignar-niveles" className="action-button">
            Asignar Niveles de Usuario
          </Link>
        </div>
      </div>
      
      <div className="recent-companies mt-5">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Empresas Recientes</h2>
            <Link to="/level1/companies">Ver todas</Link>
          </div>
          
          {recentCompanies.length === 0 ? (
            <p>No hay empresas registradas aún.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email de Contacto</th>
                    <th>Estado</th>
                    <th>Fecha de Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCompanies.map((company) => (
                    <tr key={company.id}>
                      <td>{company.name}</td>
                      <td>{company.contactEmail}</td>
                      <td>
                        <span className={`badge badge-${company.status === 'active' ? 'success' : 'warning'}`}>
                          {company.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>{new Date(company.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <div className="completed-tokens mt-5">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Tokens Completados (Canjeados)</h2>
          </div>
          
          {completedTokens.length === 0 ? (
            <p>No hay tokens completados aún.</p>
          ) : (
            <div className="table-container">
              <table className="completed-tokens-table">
                <thead>
                  <tr>
                    <th>Código Token</th>
                    <th>Beneficio</th>
                    <th>Empleado</th>
                    <th>Empresa</th>
                    <th>Proveedor</th>
                    <th>Fecha de Canje</th>
                  </tr>
                </thead>
                <tbody>
                  {completedTokens.slice(0, 10).map((token) => (
                    <tr key={token.id}>
                      <td>
                        <span className="token-code">{token.tokenCode}</span>
                      </td>
                      <td>
                        {token.benefitData?.name || 'Beneficio no disponible'}
                        {token.benefitData?.isBenefitJobby !== undefined && (
                          <span className={`token-type ${token.benefitData.isBenefitJobby ? 'token-jobby' : 'token-company'}`}>
                            {token.benefitData.isBenefitJobby ? ' (Jobby)' : ' (Empresa)'}
                          </span>
                        )}
                      </td>
                      <td>
                        {token.userData?.displayName || token.userData?.email || 'Usuario desconocido'}
                      </td>
                      <td>
                        {token.companyData?.name || 'N/A'}
                      </td>
                      <td>
                        {token.providerData?.displayName || token.providerData?.email || 'Proveedor desconocido'}
                      </td>
                      <td>
                        {token.usedAt.toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Level1Dashboard;