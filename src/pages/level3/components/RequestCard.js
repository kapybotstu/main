import React from 'react';

const RequestCard = ({ request, onViewDetails, onCopyToken }) => {
  const getStatusClass = (status) => {
    const statusClasses = {
      'pendiente': 'pending',
      'aprobado': 'approved',
      'rechazado': 'rejected',
      'usado': 'used'
    };
    return statusClasses[status] || 'pending';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <tr className="request-row">
      <td>{request.benefitName}</td>
      <td>{request.providerName}</td>
      <td>
        <span className={`status-badge ${getStatusClass(request.status)}`}>
          {request.status === 'pendiente' && '⏳'}
          {request.status === 'aprobado' && '✅'}
          {request.status === 'rechazado' && '❌'}
          {request.status === 'usado' && '✓'}
          {request.status}
        </span>
      </td>
      <td>{formatDate(request.requestDate)}</td>
      <td>{request.tokenCost} tokens</td>
      <td>
        <div className="request-actions">
          <button 
            className="action-button"
            onClick={() => onViewDetails(request)}
            title="Ver detalles"
          >
            👁️
          </button>
          {request.status === 'aprobado' && request.token && (
            <button 
              className="action-button"
              onClick={() => onCopyToken(request.token)}
              title="Copiar token"
            >
              📋
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default RequestCard;