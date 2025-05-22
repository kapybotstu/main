import React, { useState, useEffect } from 'react';
import { verifyAndUseToken } from '../../services/firebase/database/databaseService';
import { useAuth } from '../../context/AuthContext';
import { ref, onValue, get } from 'firebase/database';
import { database } from '../../services/firebase/config';
import './TokenVerification.css';

const TokenVerification = () => {
  const { currentUser } = useAuth();
  const [tokenCode, setTokenCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState(null);
  const [error, setError] = useState('');
  const [recentVerifications, setRecentVerifications] = useState([]);
  const [benefitDetails, setBenefitDetails] = useState(null);
  
  useEffect(() => {
    // Cargar historial de verificaciones recientes usando client-side filtering
    if (currentUser?.uid) {
      const tokensRef = ref(database, 'benefit_tokens');
      
      onValue(tokensRef, (snapshot) => {
        const tokens = [];
        
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const token = childSnapshot.val();
            
            // Filtrar sólo los tokens usados por este proveedor
            if (token.usedBy === currentUser.uid && token.status === 'used') {
              tokens.push({
                id: childSnapshot.key,
                ...token,
                usedAt: new Date(token.usedAt)
              });
            }
          });
        }
        
        // Ordenar por fecha de uso (más recientes primero)
        tokens.sort((a, b) => b.usedAt - a.usedAt);
        
        // Cargar información adicional para cada token
        Promise.all(tokens.slice(0, 5).map(async (token) => {
          // Obtener datos de la solicitud relacionada
          const requestRef = ref(database, `benefit_requests/${token.requestId}`);
          const requestSnapshot = await get(requestRef);
          
          if (!requestSnapshot.exists()) {
            return token; // No se encontró la solicitud
          }
          
          const requestData = requestSnapshot.val();
          
          // Obtener información del beneficio
          let benefitData = {};
          const benefitRef = ref(
            database, 
            requestData.isBenefitJobby 
              ? `jobby_benefits/${requestData.benefitId}`
              : `company_benefits/${requestData.companyId}/${requestData.benefitId}`
          );
          
          const benefitSnapshot = await get(benefitRef);
          if (benefitSnapshot.exists()) {
            benefitData = benefitSnapshot.val();
          }
          
          // Obtener información del usuario
          let userData = {};
          const userRef = ref(database, `users/${requestData.userId}`);
          const userSnapshot = await get(userRef);
          
          if (userSnapshot.exists()) {
            userData = userSnapshot.val();
          }
          
          return {
            ...token,
            request: {
              ...requestData,
              id: token.requestId
            },
            benefit: {
              ...benefitData,
              id: requestData.benefitId,
              isBenefitJobby: requestData.isBenefitJobby
            },
            user: {
              ...userData,
              id: requestData.userId
            }
          };
        })).then((enrichedTokens) => {
          setRecentVerifications(enrichedTokens);
        });
      });
    }
  }, [currentUser]);
  
  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!tokenCode.trim()) {
      setError('Por favor, ingresa un código de token');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setVerification(null);
      setBenefitDetails(null);
      
      // Buscar información del token usando client-side filtering para evitar error de índice
      const tokensRef = ref(database, 'benefit_tokens');
      const tokenSnapshot = await get(tokensRef);
      let tokenData = null;
      let tokenId = null;
      
      if (tokenSnapshot.exists()) {
        // Filtrar manualmente para encontrar el token con el código buscado
        tokenSnapshot.forEach((childSnapshot) => {
          const token = childSnapshot.val();
          if (token.tokenCode === tokenCode) {
            tokenId = childSnapshot.key;
            tokenData = childSnapshot.val();
          }
        });
        
        // Si no se encontró el token, mostrar mensaje de error
        if (!tokenData) {
          setVerification({
            valid: false,
            message: 'Token no encontrado'
          });
          setLoading(false);
          return;
        }
        
        // Obtener información de la solicitud
        const requestRef = ref(database, `benefit_requests/${tokenData.requestId}`);
        const requestSnapshot = await get(requestRef);
        
        if (requestSnapshot.exists()) {
          const requestData = requestSnapshot.val();
          
          // Obtener información del beneficio
          const benefitRef = ref(
            database, 
            requestData.isBenefitJobby 
              ? `jobby_benefits/${requestData.benefitId}`
              : `company_benefits/${requestData.companyId}/${requestData.benefitId}`
          );
          
          const benefitSnapshot = await get(benefitRef);
          
          if (benefitSnapshot.exists()) {
            const benefitData = benefitSnapshot.val();
            
            // Obtener información del usuario
            const userRef = ref(database, `users/${requestData.userId}`);
            const userSnapshot = await get(userRef);
            let userData = {};
            
            if (userSnapshot.exists()) {
              userData = userSnapshot.val();
            }
            
            // Verificar si el token está activo
            const isExpired = new Date(tokenData.expiresAt) < new Date();
            const isUsed = tokenData.status === 'used';
            
            if (isExpired) {
              setVerification({
                valid: false,
                message: 'El token ha expirado',
                status: 'expired'
              });
              setBenefitDetails({
                token: {
                  ...tokenData,
                  id: tokenId,
                  expiresAt: new Date(tokenData.expiresAt)
                },
                request: requestData,
                benefit: {
                  ...benefitData,
                  id: requestData.benefitId
                },
                user: {
                  ...userData,
                  id: requestData.userId
                }
              });
              setLoading(false);
              return;
            }
            
            if (isUsed) {
              setVerification({
                valid: false,
                message: 'El token ya ha sido utilizado',
                status: 'used',
                usedAt: new Date(tokenData.usedAt),
                usedBy: tokenData.usedBy
              });
              setBenefitDetails({
                token: {
                  ...tokenData,
                  id: tokenId,
                  expiresAt: new Date(tokenData.expiresAt),
                  usedAt: new Date(tokenData.usedAt)
                },
                request: requestData,
                benefit: {
                  ...benefitData,
                  id: requestData.benefitId
                },
                user: {
                  ...userData,
                  id: requestData.userId
                }
              });
              setLoading(false);
              return;
            }
            
            // Guardar la información del beneficio para mostrarla
            setBenefitDetails({
              token: {
                ...tokenData,
                id: tokenId,
                expiresAt: new Date(tokenData.expiresAt)
              },
              request: requestData,
              benefit: {
                ...benefitData,
                id: requestData.benefitId
              },
              user: {
                ...userData,
                id: requestData.userId
              }
            });
          }
        }
      }
      
      // Verificar y usar el token en Firebase
      await verifyAndUseToken(tokenCode, currentUser.uid);
      
      // Si llega aquí, el token es válido
      setVerification({
        valid: true,
        message: 'Token verificado y procesado correctamente'
      });
      
      // Limpiar el campo después de una verificación exitosa
      setTokenCode('');
    } catch (error) {
      setVerification({
        valid: false,
        message: error.message || 'Token inválido o ya utilizado'
      });
    } finally {
      setLoading(false);
    }
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
  
  const handleKeyPress = (e) => {
    // Verificar automáticamente cuando se presiona Enter
    if (e.key === 'Enter') {
      handleVerify(e);
    }
  };
  
  return (
    <div className="token-verification-container">
      <h1>Verificación de Token</h1>
      <p className="verification-description">
        Ingresa el código de token proporcionado por el usuario para verificar su validez 
        y redimir el beneficio correspondiente.
      </p>
      
      <div className="token-card">
        <div className="token-card-header">
          <h2>Verificar Token</h2>
        </div>
        
        <div className="token-card-body">
          <form onSubmit={handleVerify} className="token-form">
            <div className="token-input-group">
              <label htmlFor="tokenCode">Código de Token</label>
              <input
                id="tokenCode"
                type="text"
                value={tokenCode}
                onChange={(e) => setTokenCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Ingresa código aquí"
                disabled={loading}
                autoComplete="off"
                className="token-input"
                autoFocus
              />
            </div>
            
            <div className="scanner-container">
              <button type="button" className="scanner-button">
                <span className="scanner-icon">📷</span>
                Escanear código
              </button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            {verification && (
              <div className={`verification-result ${verification.valid ? 'success-result' : 'error-result'}`}>
                {verification.valid ? (
                  <span className="verification-icon">✓</span>
                ) : (
                  <span className="verification-icon">✗</span>
                )}
                
                <div>
                  <strong>{verification.valid ? 'Token Válido' : 'Token Inválido'}</strong>
                  <p>{verification.message}</p>
                  
                  {verification.status === 'used' && (
                    <div className="verification-details">
                      <p>Este token ya fue utilizado el {formatDate(verification.usedAt)}</p>
                    </div>
                  )}
                  
                  {benefitDetails && (
                    <div className="verification-details">
                      <div className="detail-item">
                        <span className="detail-label">Beneficio:</span>
                        <span>{benefitDetails.benefit.name || 'N/A'}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Tipo:</span>
                        <span>
                          {benefitDetails.request.isBenefitJobby ? 'Jobby' : 'Empresa'}
                        </span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Usuario:</span>
                        <span>{benefitDetails.user.displayName || benefitDetails.user.email || 'N/A'}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Expira:</span>
                        <span>{formatDate(benefitDetails.token.expiresAt)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <button 
              type="submit" 
              className="verify-button"
              disabled={loading || !tokenCode.trim()}
            >
              {loading ? 'Verificando...' : 'Verificar Token'}
            </button>
          </form>
        </div>
      </div>
      
      <div className="verification-help">
        <div className="help-card">
          <div className="help-card-header">
            <h2>Instrucciones de Verificación</h2>
          </div>
          
          <div className="help-card-body">
            <div className="verification-steps">
              <ol>
                <li>Solicita al usuario el código del token de beneficio</li>
                <li>Ingresa el código exactamente como aparece (respeta mayúsculas y minúsculas)</li>
                <li>Haz clic en "Verificar Token" o presiona Enter</li>
                <li>Si el token es válido, procede a entregar el beneficio al usuario</li>
                <li>El sistema marcará automáticamente el token como utilizado</li>
              </ol>
            </div>
            
            <div className="token-notes">
              <p><strong>Nota importante:</strong> Cada token solo puede ser utilizado una vez. 
              Si el sistema indica que el token ya fue utilizado, por favor informa al usuario que no es posible
              redimir nuevamente el mismo beneficio.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="token-history">
        <h2>Tokens Verificados Recientemente</h2>
        
        {recentVerifications.length === 0 ? (
          <div className="no-records">
            <p>No hay registros de verificaciones recientes.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Beneficio</th>
                  <th>Usuario</th>
                  <th>Verificado</th>
                </tr>
              </thead>
              <tbody>
                {recentVerifications.map((item) => (
                  <tr key={item.id}>
                    <td>{item.tokenCode}</td>
                    <td>
                      {item.benefit?.name || 'Beneficio no disponible'}
                      {item.benefit?.isBenefitJobby !== undefined && (
                        <span className={`token-type ${item.benefit.isBenefitJobby ? 'token-jobby' : 'token-company'}`}>
                          {item.benefit.isBenefitJobby ? ' (Jobby)' : ' (Empresa)'}
                        </span>
                      )}
                    </td>
                    <td>{item.user?.displayName || item.user?.email || 'Usuario desconocido'}</td>
                    <td>{formatDate(item.usedAt)}</td>
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

export default TokenVerification;