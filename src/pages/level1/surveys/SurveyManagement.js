import React, { useState, useEffect } from 'react';
import { database } from '../../../services/firebase/config';
import { ref, onValue, off } from 'firebase/database';
import './SurveyManagement.css';

const SurveyManagement = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const surveysRef = ref(database, 'encuestas-perfilamiento');
    
    const unsubscribe = onValue(surveysRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const surveysArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setSurveys(surveysArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } else {
        setSurveys([]);
      }
      setLoading(false);
    });

    return () => {
      off(surveysRef);
    };
  }, []);

  const filteredSurveys = surveys.filter(survey =>
    survey.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Santiago'
    });
  };

  const renderAnswerValue = (answer) => {
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    if (typeof answer === 'object' && answer !== null) {
      return JSON.stringify(answer, null, 2);
    }
    return String(answer);
  };

  if (loading) {
    return (
      <div className="survey-mgmt-container">
        <div className="survey-mgmt-page-header">
          <h1>Gestión de Encuestas de Perfilamiento</h1>
        </div>
        <div className="survey-mgmt-loading-container">
          <p>Cargando encuestas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-mgmt-container">
      <div className="survey-mgmt-page-header">
        <div>
          <h1>Gestión de Encuestas de Perfilamiento</h1>
          <p>Total de encuestas completadas: {surveys.length}</p>
        </div>
      </div>

      <div className="survey-mgmt-controls">
        <div className="survey-mgmt-search-container">
          <input
            type="text"
            placeholder="Buscar por nombre de usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="survey-mgmt-search-input"
          />
        </div>
      </div>

      <div className="survey-mgmt-content">
        {!selectedSurvey ? (
          <div className="survey-mgmt-surveys-list">
            {filteredSurveys.length === 0 ? (
              <div className="survey-mgmt-no-data">
                <p>No se encontraron encuestas</p>
              </div>
            ) : (
              <div className="survey-mgmt-surveys-grid">
                {filteredSurveys.map((survey) => (
                  <div key={survey.id} className="survey-mgmt-survey-card">
                    <div className="survey-mgmt-survey-header">
                      <h3>{survey.userName}</h3>
                      <span className="survey-mgmt-survey-date">
                        {formatDate(survey.timestamp)}
                      </span>
                    </div>
                    <div className="survey-mgmt-survey-stats">
                      <div className="survey-mgmt-stat">
                        <span className="survey-mgmt-stat-label">Respuestas</span>
                        <span className="survey-mgmt-stat-value">
                          {Object.keys(survey.answers || {}).length}
                        </span>
                      </div>
                      <div className="survey-mgmt-stat">
                        <span className="survey-mgmt-stat-label">Beneficios</span>
                        <span className="survey-mgmt-stat-value">
                          {survey.selectedBenefits?.length || 0}
                        </span>
                      </div>
                      <div className="survey-mgmt-stat">
                        <span className="survey-mgmt-stat-label">Medallas</span>
                        <span className="survey-mgmt-stat-value">
                          {survey.medals?.length || 0}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="survey-mgmt-view-details-btn"
                      onClick={() => setSelectedSurvey(survey)}
                    >
                      Ver Detalles
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="survey-mgmt-survey-details">
            <div className="survey-mgmt-details-header">
              <button 
                className="survey-mgmt-back-btn"
                onClick={() => setSelectedSurvey(null)}
              >
                ← Volver a la lista
              </button>
              <h2>Detalles de la Encuesta - {selectedSurvey.userName}</h2>
            </div>

            <div className="survey-mgmt-details-content">
              <div className="survey-mgmt-details-section">
                <h3>Información General</h3>
                <div className="survey-mgmt-info-grid">
                  <div className="survey-mgmt-info-item">
                    <strong>Usuario:</strong> {selectedSurvey.userName}
                  </div>
                  <div className="survey-mgmt-info-item">
                    <strong>Fecha de Finalización:</strong> {selectedSurvey.completedAt}
                  </div>
                  <div className="survey-mgmt-info-item">
                    <strong>Timestamp:</strong> {formatDate(selectedSurvey.timestamp)}
                  </div>
                </div>
              </div>

              <div className="survey-mgmt-details-section">
                <h3>Respuestas ({Object.keys(selectedSurvey.answers || {}).length})</h3>
                <div className="survey-mgmt-answers-list">
                  {Object.entries(selectedSurvey.answers || {}).map(([questionId, answer]) => (
                    <div key={questionId} className="survey-mgmt-answer-item">
                      <div className="survey-mgmt-question-id">
                        <strong>Pregunta {questionId}:</strong>
                      </div>
                      <div className="survey-mgmt-answer-value">
                        <pre>{renderAnswerValue(answer)}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="survey-mgmt-details-section">
                <h3>Beneficios Seleccionados ({selectedSurvey.selectedBenefits?.length || 0})</h3>
                <div className="survey-mgmt-benefits-list">
                  {selectedSurvey.selectedBenefits?.length > 0 ? (
                    selectedSurvey.selectedBenefits.map((benefit, index) => (
                      <div key={index} className="survey-mgmt-benefit-item">
                        {benefit}
                      </div>
                    ))
                  ) : (
                    <p>No se seleccionaron beneficios</p>
                  )}
                </div>
              </div>

              <div className="survey-mgmt-details-section">
                <h3>Medallas Obtenidas ({selectedSurvey.medals?.length || 0})</h3>
                <div className="survey-mgmt-medals-list">
                  {selectedSurvey.medals?.length > 0 ? (
                    selectedSurvey.medals.map((medal, index) => (
                      <div key={index} className="survey-mgmt-medal-item">
                        {medal}
                      </div>
                    ))
                  ) : (
                    <p>No se obtuvieron medallas</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyManagement;