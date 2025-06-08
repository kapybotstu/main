import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set, update } from 'firebase/database';
import './BotManagement.css';

const BotManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [savingCompany, setSavingCompany] = useState(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const database = getDatabase();
      const companiesRef = ref(database, 'companies');
      const snapshot = await get(companiesRef);
      
      if (snapshot.exists()) {
        const companiesData = snapshot.val();
        const companiesList = Object.entries(companiesData).map(([id, data]) => ({
          id,
          ...data,
          botEnabled: data.botEnabled || false
        }));
        setCompanies(companiesList);
      }
    } catch (error) {
      console.error('Error al cargar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBotAccess = async (companyId, currentStatus) => {
    setSavingCompany(companyId);
    try {
      const database = getDatabase();
      const companyRef = ref(database, `companies/${companyId}`);
      
      await update(companyRef, {
        botEnabled: !currentStatus,
        botEnabledDate: !currentStatus ? new Date().toISOString() : null
      });

      // Actualizar estado local
      setCompanies(prevCompanies => 
        prevCompanies.map(company => 
          company.id === companyId 
            ? { ...company, botEnabled: !currentStatus }
            : company
        )
      );
    } catch (error) {
      console.error('Error al actualizar acceso del bot:', error);
      alert('Error al actualizar el acceso del bot');
    } finally {
      setSavingCompany(null);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const enabledCount = companies.filter(c => c.botEnabled).length;

  if (loading) {
    return <div className="loading">Cargando empresas...</div>;
  }

  return (
    <div className="bot-management-container">
      <div className="bot-management-header">
        <h1>Gestión de Bot por Empresa</h1>
        <p>Administra qué empresas tienen acceso al asistente bot</p>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{companies.length}</div>
          <div className="stat-label">Total Empresas</div>
        </div>
        <div className="stat-card enabled">
          <div className="stat-value">{enabledCount}</div>
          <div className="stat-label">Bot Habilitado</div>
        </div>
        <div className="stat-card disabled">
          <div className="stat-value">{companies.length - enabledCount}</div>
          <div className="stat-label">Bot Deshabilitado</div>
        </div>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Buscar empresa..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="companies-grid">
        {filteredCompanies.map(company => (
          <div key={company.id} className={`company-card ${company.botEnabled ? 'enabled' : ''}`}>
            <div className="company-header">
              <h3>{company.name}</h3>
              <div className="company-meta">
                <span className="user-count">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  {company.userCount || 0} usuarios
                </span>
              </div>
            </div>

            <div className="bot-status">
              <div className="status-indicator">
                <div className={`status-dot ${company.botEnabled ? 'active' : ''}`}></div>
                <span>{company.botEnabled ? 'Bot Habilitado' : 'Bot Deshabilitado'}</span>
              </div>
            </div>

            <div className="company-actions">
              <button
                className={`toggle-btn ${company.botEnabled ? 'disable' : 'enable'}`}
                onClick={() => toggleBotAccess(company.id, company.botEnabled)}
                disabled={savingCompany === company.id}
              >
                {savingCompany === company.id ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {company.botEnabled ? (
                        <path d="M18 6L6 18M6 6l12 12"/>
                      ) : (
                        <path d="M5 13l4 4L19 7"/>
                      )}
                    </svg>
                    {company.botEnabled ? 'Deshabilitar Bot' : 'Habilitar Bot'}
                  </>
                )}
              </button>
            </div>

            {company.botEnabledDate && company.botEnabled && (
              <div className="enabled-date">
                Habilitado desde: {new Date(company.botEnabledDate).toLocaleDateString('es-CL')}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="empty-state">
          <p>No se encontraron empresas que coincidan con la búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default BotManagement;