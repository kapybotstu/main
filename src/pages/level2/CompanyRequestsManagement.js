import React, { useState, useEffect } from 'react';
import { ref, onValue, get, update } from 'firebase/database';
import { database } from '../../services/firebase/config';
import { useAuth } from '../../context/AuthContext';

const CompanyRequestsManagement = () => {
  const { currentUser, companyId } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    if (!companyId) {
      setError('No se ha asignado una empresa a este usuario');
      setLoading(false);
      return;
    }
    
    const fetchRequests = async () => {
      try {
        // Obtener solicitudes para beneficios internos de esta empresa
        const requestsRef = ref(database, 'benefit_requests');
        
        onValue(requestsRef, async (snapshot) => {
          if (snapshot.exists()) {
            const requestsData = [];
            const promises = [];
            
            snapshot.forEach((childSnapshot) => {
              const request = childSnapshot.val();
              
              // Solo obtener solicitudes para beneficios internos de esta empresa
              if (!request.isBenefitJobby && request.companyId === companyId) {
                // Obtener información adicional del usuario y del beneficio
                const userPromise = get(ref(database, `users/${request.userId}`))
                  .then(userSnapshot => {
                    const userData = userSnapshot.exists() ? userSnapshot.val() : {};
                    return userData;
                  });
                
                const benefitPromise = get(ref(database, `company_benefits/${companyId}/${request.benefitId}`))
                  .then(benefitSnapshot => {
                    const benefitData = benefitSnapshot.exists() ? benefitSnapshot.val() : {};
                    return benefitData;
                  });
                
                promises.push(Promise.all([userPromise, benefitPromise]).then(([user, benefit]) => {
                  requestsData.push({
                    id: childSnapshot.key,
                    ...request,
                    userName: user.displayName || 'Usuario desconocido',
                    userEmail: user.email || '',
                    benefitName: benefit.title || 'Beneficio desconocido'
                  });
                }));
              }
            });
            
            await Promise.all(promises);
            
            // Ordenar solicitudes: pendientes primero, luego por fecha (más recientes arriba)
            requestsData.sort((a, b) => {
              if (a.status === 'pending' && b.status !== 'pending') return -1;
              if (a.status !== 'pending' && b.status === 'pending') return 1;
              return new Date(b.requestDate) - new Date(a.requestDate);
            });
            
            setRequests(requestsData);
          } else {
            setRequests([]);
          }
          setLoading(false);
        });
      } catch (error) {
        setError(`Error al cargar solicitudes: ${error.message}`);
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, [companyId]);
  
  // Aprobar solicitud
  const handleApproveRequest = async (requestId) => {
    if (!companyId || !currentUser) return;
    
    if (window.confirm('¿Estás seguro de que deseas aprobar esta solicitud?')) {
      try {
        const requestRef = ref(database, `benefit_requests/${requestId}`);
        await update(requestRef, {
          status: 'approved',
          adminId: currentUser.uid,
          processedDate: new Date().toISOString()
        });
        
        // Crear token para el beneficio aprobado (esto lo maneja el databaseService)
        // Aquí podríamos implementar llamada específica, pero mantendremos simplicidad
        
        setSuccess('Solicitud aprobada correctamente');
      } catch (error) {
        setError(`Error al aprobar solicitud: ${error.message}`);
      }
    }
  };
  
  // Rechazar solicitud
  const handleRejectRequest = async (requestId) => {
    if (!companyId || !currentUser) return;
    
    if (window.confirm('¿Estás seguro de que deseas rechazar esta solicitud?')) {
      try {
        const requestRef = ref(database, `benefit_requests/${requestId}`);
        await update(requestRef, {
          status: 'rejected',
          adminId: currentUser.uid,
          processedDate: new Date().toISOString()
        });
        
        setSuccess('Solicitud rechazada correctamente');
      } catch (error) {
        setError(`Error al rechazar solicitud: ${error.message}`);
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
      <div className="requests-container">
        <h1>Gestión de Solicitudes</h1>
        <div className="error-alert">
          No se ha asignado una empresa a este usuario. Por favor, contacte con el administrador de Jobby.
        </div>
      </div>
    );
  }
  
  return (
    <div className="requests-container">
      <div className="page-header">
        <h1>Gestión de Solicitudes</h1>
      </div>
      
      {error && <div className="error-alert">{error}</div>}
      {success && <div className="success-alert">{success}</div>}
      
      <div className="card mt-4">
        <div className="card-header">
          <h2 className="card-title">Solicitudes de Beneficios Internos</h2>
        </div>
        
        {requests.length === 0 ? (
          <p>No hay solicitudes pendientes.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Beneficio</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.userName}</td>
                    <td>{request.userEmail}</td>
                    <td>{request.benefitName}</td>
                    <td>{new Date(request.requestDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${
                        request.status === 'approved' 
                          ? 'success' 
                          : request.status === 'rejected'
                            ? 'error'
                            : 'warning'
                      }`}>
                        {request.status === 'approved' 
                          ? 'Aprobado' 
                          : request.status === 'rejected'
                            ? 'Rechazado'
                            : 'Pendiente'
                        }
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons small">
                        {request.status === 'pending' && (
                          <>
                            <button 
                              className="btn-action activate"
                              onClick={() => handleApproveRequest(request.id)}
                            >
                              Aprobar
                            </button>
                            <button 
                              className="btn-action deactivate"
                              onClick={() => handleRejectRequest(request.id)}
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        
                        {request.status === 'approved' && request.tokenId && (
                          <div className="token-info-container">
                            <span className="token-info-label">Token generado</span>
                          </div>
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

export default CompanyRequestsManagement;