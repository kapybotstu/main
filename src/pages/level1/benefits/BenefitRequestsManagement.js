import React, { useState, useEffect } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { database } from '../../../services/firebase/config';
import { useAuth } from '../../../context/AuthContext';
import { updateBenefitRequest, processTokenPaidRequest } from '../../../services/firebase/database/databaseService';
import './BenefitRequestsManagement.css';

const BenefitRequestsManagement = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('view'); // view, approve, reject
  const [processingRequest, setProcessingRequest] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [adminInstructions, setAdminInstructions] = useState('');

  // Obtener las solicitudes de la base de datos
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Escuchar cambios en las solicitudes
        const requestsRef = ref(database, 'benefit_requests');
        
        onValue(requestsRef, async (snapshot) => {
          if (!snapshot.exists()) {
            setRequests([]);
            setFilteredRequests([]);
            setLoading(false);
            return;
          }
          
          const requestsData = [];
          const requestsPromises = [];
          
          // Recopilar todas las solicitudes, especialmente aquellas que son beneficios Jobby
          snapshot.forEach((childSnapshot) => {
            const requestId = childSnapshot.key;
            const requestData = childSnapshot.val();
            
            // Incluir solicitudes de beneficios Jobby y solicitudes que requieren aprobación admin
            if (requestData.isBenefitJobby || requestData.status === 'pending_admin_approval') {
              requestsPromises.push(
                Promise.all([
                  // Obtener datos del usuario que solicita
                  get(ref(database, `users/${requestData.userId}`)),
                  // Obtener datos del beneficio (Jobby o empresa)
                  requestData.isBenefitJobby 
                    ? get(ref(database, `jobby_benefits/${requestData.benefitId}`))
                    : get(ref(database, `company_benefits/${requestData.companyId}/${requestData.benefitId}`))
                ]).then(([userSnapshot, benefitSnapshot]) => {
                  const userData = userSnapshot.exists() ? userSnapshot.val() : {};
                  const benefitData = benefitSnapshot.exists() ? benefitSnapshot.val() : {};
                  
                  return {
                    id: requestId,
                    ...requestData,
                    requestDate: new Date(requestData.requestDate),
                    processedDate: requestData.processedDate ? new Date(requestData.processedDate) : null,
                    userName: userData.displayName || userData.email || 'Usuario desconocido',
                    userEmail: userData.email || 'Sin email',
                    benefitName: benefitData.name || benefitData.title || 'Beneficio sin nombre',
                    benefitDescription: benefitData.description || 'Sin descripción',
                    benefitCategory: benefitData.category || 'Sin categoría',
                    benefitValue: benefitData.value || '',
                    benefitType: benefitData.type || 'automatic'
                  };
                })
              );
            }
          });
          
          const resolvedRequests = await Promise.all(requestsPromises);
          // Ordenar por fecha de solicitud (más recientes primero)
          resolvedRequests.sort((a, b) => b.requestDate - a.requestDate);
          
          setRequests(resolvedRequests);
          applyFilters(resolvedRequests, filter, searchTerm);
          setLoading(false);
        });
      } catch (error) {
        console.error('Error al cargar solicitudes:', error);
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, []);
  
  // Aplicar filtros a las solicitudes
  const applyFilters = (requestsList, statusFilter, term) => {
    let filtered = [...requestsList];
    
    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }
    
    // Filtrar por término de búsqueda
    if (term) {
      const searchLower = term.toLowerCase();
      filtered = filtered.filter(req => 
        req.userName?.toLowerCase().includes(searchLower) ||
        req.userEmail?.toLowerCase().includes(searchLower) ||
        req.benefitName?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredRequests(filtered);
  };
  
  // Cambiar el filtro de estado
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    applyFilters(requests, newFilter, searchTerm);
  };
  
  // Manejar cambios en la búsqueda
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    applyFilters(requests, filter, term);
  };
  
  // Ver detalles de una solicitud
  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setModalAction('view');
    setShowModal(true);
  };
  
  // Abrir modal para aprobar una solicitud
  const handleApproveClick = (request) => {
    setSelectedRequest(request);
    setModalAction('approve');
    setShowModal(true);
  };
  
  // Abrir modal para rechazar una solicitud
  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setModalAction('reject');
    setShowModal(true);
  };
  
  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };
  
  // Procesar la solicitud (aprobar o rechazar)
  const handleProcessRequest = async (action) => {
    try {
      setProcessingRequest(true);
      setMessage({ type: '', content: '' });
      
      const status = action === 'approve' ? 'approved' : 'rejected';
      
      // Determinar si es una solicitud pagada con tokens que requiere gestión
      const isTokenPaidRequest = selectedRequest.paidWithTokens && 
                                 selectedRequest.status === 'pending_admin_approval';
      
      let result;
      if (isTokenPaidRequest) {
        // Usar la nueva función para solicitudes pagadas con tokens
        result = await processTokenPaidRequest(
          selectedRequest.id, 
          status, 
          currentUser.uid,
          action === 'approve' ? adminInstructions : ''
        );
      } else {
        // Usar la función tradicional
        result = await updateBenefitRequest(selectedRequest.id, status, currentUser.uid);
      }
      
      setProcessingRequest(false);
      setMessage({
        type: 'success',
        content: result.message || `La solicitud ha sido ${status === 'approved' ? 'aprobada' : 'rechazada'} correctamente.`
      });
      
      // Limpiar instrucciones
      setAdminInstructions('');
      
      // Cerrar el modal después de un breve retraso
      setTimeout(() => {
        setShowModal(false);
        setSelectedRequest(null);
      }, 1500);
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      setProcessingRequest(false);
      setMessage({
        type: 'error',
        content: `Error al ${action === 'approve' ? 'aprobar' : 'rechazar'} la solicitud: ${error.message}`
      });
    }
  };
  
  // Formatear fecha
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
  
  if (loading) {
    return <div className="loading">Cargando solicitudes...</div>;
  }
  
  return (
    <div className="requests-management-container">
      <h1>Gestión de Solicitudes</h1>
      <p className="requests-management-description">
        Aquí puedes ver y gestionar todas las solicitudes de beneficios Jobby. 
        Aprueba o rechaza las solicitudes pendientes para que los usuarios puedan acceder a sus beneficios.
      </p>
      
      {message.content && (
        <div className={`${message.type}-message`}>{message.content}</div>
      )}
      
      <div className="filter-controls">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            Todas
          </button>
          <button 
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => handleFilterChange('pending')}
          >
            Pendientes
          </button>
          <button 
            className={`filter-tab ${filter === 'pending_admin_approval' ? 'active' : ''}`}
            onClick={() => handleFilterChange('pending_admin_approval')}
          >
            Requieren Gestión
          </button>
          <button 
            className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => handleFilterChange('approved')}
          >
            Aprobadas
          </button>
          <button 
            className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => handleFilterChange('rejected')}
          >
            Rechazadas
          </button>
        </div>
        
        <div className="requests-count">
          {filteredRequests.length} {filteredRequests.length === 1 ? 'solicitud' : 'solicitudes'} encontradas
        </div>
        
        <input 
          type="text"
          className="search-input"
          placeholder="Buscar por usuario o beneficio..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      
      {filteredRequests.length === 0 ? (
        <div className="no-requests">
          <p>No hay solicitudes {filter !== 'all' ? `con estado "${filter}"` : ''}</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Solicitante</th>
                <th>Beneficio</th>
                <th>Fecha de Solicitud</th>
                <th>Pago</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.userName}</td>
                  <td>{request.benefitName}</td>
                  <td>{formatDate(request.requestDate)}</td>
                  <td>
                    {request.paidWithTokens ? (
                      <span className="badge badge-tokens">
                        🎟️ {request.tokenCost} tokens
                      </span>
                    ) : (
                      <span className="badge badge-traditional">Tradicional</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${
                      request.status === 'approved' 
                        ? 'approved' 
                        : request.status === 'rejected'
                          ? 'rejected'
                          : 'pending'
                    }`}>
                      {request.status === 'approved' 
                        ? 'Aprobada' 
                        : request.status === 'rejected'
                          ? 'Rechazada'
                          : request.status === 'pending_admin_approval'
                            ? 'Requiere Gestión'
                            : 'Pendiente'
                      }
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-action btn-view"
                        onClick={() => handleViewRequest(request)}
                      >
                        Ver
                      </button>
                      
                      {(request.status === 'pending' || request.status === 'pending_admin_approval') && (
                        <>
                          <button 
                            className="btn-action btn-approve"
                            onClick={() => handleApproveClick(request)}
                          >
                            Aprobar
                          </button>
                          <button 
                            className="btn-action btn-reject"
                            onClick={() => handleRejectClick(request)}
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal para ver, aprobar o rechazar solicitudes */}
      {showModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>
                {modalAction === 'view' 
                  ? 'Detalles de la Solicitud' 
                  : modalAction === 'approve'
                    ? 'Aprobar Solicitud'
                    : 'Rechazar Solicitud'
                }
              </h2>
              <button className="close-button" onClick={handleCloseModal}>×</button>
            </div>
            
            <div className="modal-content">
              {message.content && (
                <div className={`${message.type}-message`}>{message.content}</div>
              )}
              
              <div className="request-details">
                <div className="detail-group">
                  <div className="detail-label">Solicitante:</div>
                  <div className="detail-value">{selectedRequest.userName}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Email:</div>
                  <div className="detail-value">{selectedRequest.userEmail}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Beneficio:</div>
                  <div className="detail-value">{selectedRequest.benefitName}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Categoría:</div>
                  <div className="detail-value">{selectedRequest.benefitCategory}</div>
                </div>
                {selectedRequest.benefitValue && (
                  <div className="detail-group">
                    <div className="detail-label">Valor:</div>
                    <div className="detail-value">{selectedRequest.benefitValue}</div>
                  </div>
                )}
                <div className="detail-group">
                  <div className="detail-label">Fecha de Solicitud:</div>
                  <div className="detail-value">{formatDate(selectedRequest.requestDate)}</div>
                </div>
                <div className="detail-group">
                  <div className="detail-label">Estado:</div>
                  <div className="detail-value">
                    <span className={`badge badge-${
                      selectedRequest.status === 'approved' 
                        ? 'approved' 
                        : selectedRequest.status === 'rejected'
                          ? 'rejected'
                          : 'pending'
                    }`}>
                      {selectedRequest.status === 'approved' 
                        ? 'Aprobada' 
                        : selectedRequest.status === 'rejected'
                          ? 'Rechazada'
                          : selectedRequest.status === 'pending_admin_approval'
                            ? 'Requiere Gestión'
                            : 'Pendiente'
                      }
                    </span>
                  </div>
                </div>
                {selectedRequest.paidWithTokens && (
                  <>
                    <div className="detail-group">
                      <div className="detail-label">Pago:</div>
                      <div className="detail-value">
                        <span className="badge badge-tokens">
                          🎟️ Pagado con {selectedRequest.tokenCost} tokens
                        </span>
                      </div>
                    </div>
                    <div className="detail-group">
                      <div className="detail-label">Tipo de Beneficio:</div>
                      <div className="detail-value">
                        {selectedRequest.benefitType === 'third_party' ? 'Terceros (Requiere gestión manual)' : 
                         selectedRequest.benefitType === 'managed' ? 'Gestionado' : 'Automático'}
                      </div>
                    </div>
                  </>
                )}
                {selectedRequest.processedDate && (
                  <div className="detail-group">
                    <div className="detail-label">Fecha de Procesamiento:</div>
                    <div className="detail-value">{formatDate(selectedRequest.processedDate)}</div>
                  </div>
                )}
                <div className="detail-group">
                  <div className="detail-label">Descripción:</div>
                  <div className="detail-value">{selectedRequest.benefitDescription}</div>
                </div>
              </div>
              
              {/* Campo de instrucciones para solicitudes que requieren gestión */}
              {modalAction === 'approve' && 
               selectedRequest?.paidWithTokens && 
               selectedRequest?.status === 'pending_admin_approval' && (
                <div className="instructions-section">
                  <h3>Instrucciones para el Usuario</h3>
                  <p className="instructions-help">
                    Como este es un beneficio de terceros, proporciona instrucciones específicas 
                    sobre cómo el usuario debe canjear o usar este beneficio:
                  </p>
                  <textarea
                    className="instructions-textarea"
                    placeholder="Ej: Para canjear tu GamePass, presenta este código en el siguiente enlace: [URL]. El código es válido por 30 días..."
                    value={adminInstructions}
                    onChange={(e) => setAdminInstructions(e.target.value)}
                    rows={4}
                    required
                  />
                  <div className="instructions-note">
                    <strong>Nota:</strong> Estas instrucciones aparecerán junto con el código del token cuando el usuario vea sus solicitudes aprobadas.
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              {modalAction === 'view' ? (
                <button 
                  className="btn-modal btn-cancel"
                  onClick={handleCloseModal}
                >
                  Cerrar
                </button>
              ) : (
                <>
                  <button 
                    className="btn-modal btn-cancel"
                    onClick={handleCloseModal}
                    disabled={processingRequest}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn-modal btn-confirm"
                    onClick={() => handleProcessRequest(modalAction)}
                    disabled={processingRequest}
                  >
                    {processingRequest 
                      ? 'Procesando...' 
                      : modalAction === 'approve' 
                        ? 'Confirmar Aprobación' 
                        : 'Confirmar Rechazo'
                    }
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BenefitRequestsManagement;