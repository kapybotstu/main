import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../../services/firebase/config';
import { useAuth } from '../../context/AuthContext';
import './Level2Dashboard.css';

const Level2Dashboard = () => {
  const { currentUser, companyId } = useAuth();
  const [stats, setStats] = useState({
    companyUsers: 0,
    companyBenefits: 0,
    pendingRequests: 0,
    activeTokens: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!companyId) {
        console.error('No hay ID de empresa disponible');
        setLoading(false);
        return;
      }

      try {
        // Obtener datos de la empresa
        const companyRef = ref(database, `companies/${companyId}`);
        onValue(companyRef, (snapshot) => {
          if (snapshot.exists()) {
            setCompanyData(snapshot.val());
          }
        });
        
        // Estadísticas de usuarios de la empresa
        const usersRef = ref(database, 'users');
        onValue(usersRef, (snapshot) => {
          const users = [];
          let usersCount = 0;
          
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const userData = childSnapshot.val();
              
              if (userData.companyId === companyId && userData.level === 3) {
                usersCount++;
                users.push({
                  id: childSnapshot.key,
                  ...userData
                });
              }
            });
          }
          
          // Ya no necesitamos guardar todos los usuarios para el gráfico
          setRecentUsers(users.slice(0, 5));
          setStats(prevStats => ({
            ...prevStats,
            companyUsers: usersCount
          }));
        });
        
        // Estadísticas de beneficios internos
        const benefitsRef = ref(database, `company_benefits/${companyId}`);
        onValue(benefitsRef, (snapshot) => {
          let benefitsCount = 0;
          
          if (snapshot.exists()) {
            snapshot.forEach(() => {
              benefitsCount++;
            });
          }
          
          setStats(prevStats => ({
            ...prevStats,
            companyBenefits: benefitsCount
          }));
        });
        
        // Contar solicitudes pendientes de la empresa
        const requestsRef = ref(database, 'benefit_requests');
        onValue(requestsRef, (snapshot) => {
          let pendingCount = 0;
          
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const requestData = childSnapshot.val();
              
              // Contar solicitudes pendientes de la empresa
              if (requestData.status === 'pending' && 
                  !requestData.isBenefitJobby && 
                  requestData.companyId === companyId) {
                pendingCount++;
              }
            });
          }
          
          setStats(prevStats => ({
            ...prevStats,
            pendingRequests: pendingCount
          }));
        });
        
        // Tokens activos
        const tokensQuery = query(ref(database, 'benefit_tokens'), orderByChild('status'), equalTo('active'));
        onValue(tokensQuery, (snapshot) => {
          let activeTokensCount = 0;
          
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const tokenData = childSnapshot.val();
              // Verificar si el token está relacionado con un beneficio de la empresa
              const requestRef = ref(database, `benefit_requests/${tokenData.requestId}`);
              
              onValue(requestRef, (requestSnapshot) => {
                if (requestSnapshot.exists()) {
                  const requestData = requestSnapshot.val();
                  
                  if (!requestData.isBenefitJobby && requestData.companyId === companyId) {
                    activeTokensCount++;
                  }
                }
              });
            });
          }
          
          setStats(prevStats => ({
            ...prevStats,
            activeTokens: activeTokensCount
          }));
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setLoading(false);
      }
    };
    
    if (companyId) {
      fetchDashboardData();
    }
  }, [companyId]);

  if (loading) {
    return <div>Cargando datos del dashboard...</div>;
  }
  
  if (!companyId || !companyData) {
    return (
      <div className="level2-dashboard-container">
        <h1>Dashboard Recursos Humanos</h1>
        <div className="error-alert">
          No se ha asignado una empresa a este usuario. Por favor, contacte con el administrador de Jobby.
        </div>
      </div>
    );
  }
  
  return (
    <div className="level2-dashboard-container">
      <h1>Dashboard Recursos Humanos</h1>
      <p className="level2-welcome-message">
        Bienvenido, {currentUser?.displayName || 'Administrador'} | Empresa: {companyData.name}
      </p>
      
      <div className="level2-dashboard-grid">
        <div className="level2-stats-card">
          <div className="level2-stats-card-title">Usuarios</div>
          <div className="level2-stats-card-value">{stats.companyUsers}</div>
          <div className="level2-stats-card-description">Usuarios de la empresa</div>
        </div>
        
        <div className="level2-stats-card">
          <div className="level2-stats-card-title">Beneficios Internos</div>
          <div className="level2-stats-card-value">{stats.companyBenefits}</div>
          <div className="level2-stats-card-description">Beneficios activos</div>
        </div>
        
        <div className="level2-stats-card">
          <div className="level2-stats-card-title">Solicitudes Pendientes</div>
          <div className="level2-stats-card-value">{stats.pendingRequests}</div>
          <div className="level2-stats-card-description">Requieren aprobación</div>
        </div>
        
        <div className="level2-stats-card">
          <div className="level2-stats-card-title">Tokens Activos</div>
          <div className="level2-stats-card-value">{stats.activeTokens}</div>
          <div className="level2-stats-card-description">Tokens para beneficios</div>
        </div>
      </div>
      
      <div className="dashboard-actions mt-5">
        <h2>Acciones Rápidas</h2>
        <div className="action-buttons">
          <Link to="/level2/users" className="action-button">
            Gestionar Usuarios
          </Link>
          <Link to="/level2/benefits" className="action-button">
            Gestionar Beneficios Internos
          </Link>
          <Link to="/level2/requests" className="action-button">
            Ver Solicitudes Pendientes
          </Link>
        </div>
      </div>
      
      <div className="recent-users mt-5">
        <div className="level2-card">
          <div className="level2-card-header">
            <h2 className="level2-card-title">Usuarios Recientes</h2>
            <Link to="/level2/users">Ver todos</Link>
          </div>
          
          {recentUsers.length === 0 ? (
            <p>No hay usuarios registrados en la empresa aún.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Fecha de Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.displayName}</td>
                      <td>{user.email}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <div className="benefits-analysis mt-5">
        <div className="level2-card">
          <div className="level2-card-header">
            <h2 className="level2-card-title">Análisis de Beneficios</h2>
          </div>
          
          <div className="analysis-content p-4">
            <p>Para ver estadísticas detalladas, análisis de uso de beneficios y enlaces a productos solicitados por los empleados, vaya a la sección de <Link to="/level2/benefits">Gestión de Beneficios</Link>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Level2Dashboard;