import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set, push, onValue, off } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';
import './BotMessaging.css';

const BotMessaging = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('config'); // config, profiles, analytics
  const [botInstructions, setBotInstructions] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeProfiles, setEmployeeProfiles] = useState({});
  const [companyConfig, setCompanyConfig] = useState({
    botEnabled: false,
    whatsappNumber: '',
    analysisFrequency: 'daily',
    stressKeywords: [],
    wellbeingIndicators: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCompanyData();
    loadEmployees();
  }, [currentUser]);

  const loadCompanyData = async () => {
    try {
      const database = getDatabase();
      const userRef = ref(database, `users/${currentUser.uid}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();
      const companyId = userData?.companyId;

      if (companyId) {
        // Cargar configuración del bot
        const configRef = ref(database, `companies/${companyId}/botConfig`);
        const configSnapshot = await get(configRef);
        if (configSnapshot.exists()) {
          setCompanyConfig(configSnapshot.val());
        }

        // Cargar instrucciones del bot
        const instructionsRef = ref(database, `companies/${companyId}/botInstructions`);
        const instructionsSnapshot = await get(instructionsRef);
        if (instructionsSnapshot.exists()) {
          setBotInstructions(instructionsSnapshot.val());
        }

        // Escuchar perfiles de empleados en tiempo real
        const profilesRef = ref(database, `companies/${companyId}/employeeProfiles`);
        const unsubscribe = onValue(profilesRef, (snapshot) => {
          if (snapshot.exists()) {
            setEmployeeProfiles(snapshot.val());
          }
        });

        return () => off(profilesRef, 'value', unsubscribe);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const database = getDatabase();
      const userRef = ref(database, `users/${currentUser.uid}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();
      const companyId = userData?.companyId;

      if (!companyId) return;

      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const companyEmployees = Object.entries(usersData)
          .filter(([id, user]) => user.companyId === companyId && user.level === 3)
          .map(([id, user]) => ({
            id,
            name: user.displayName || user.email,
            email: user.email,
            phone: user.phone || '',
            department: user.department || 'Sin departamento'
          }));
        
        setEmployees(companyEmployees);
      }
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    }
  };

  const saveConfiguration = async () => {
    setSaving(true);
    try {
      const database = getDatabase();
      const userRef = ref(database, `users/${currentUser.uid}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();
      const companyId = userData?.companyId;

      if (companyId) {
        // Guardar configuración
        await set(ref(database, `companies/${companyId}/botConfig`), {
          ...companyConfig,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser.uid
        });

        // Guardar instrucciones
        await set(ref(database, `companies/${companyId}/botInstructions`), botInstructions);

        // Crear estructura para el bot en Firebase
        const botRequest = {
          companyId,
          type: 'employee_wellbeing',
          status: 'pending',
          config: companyConfig,
          instructions: botInstructions,
          createdAt: new Date().toISOString(),
          createdBy: currentUser.uid
        };

        await push(ref(database, 'botRequests'), botRequest);

        alert('Configuración guardada exitosamente');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const getStressLevel = (profile) => {
    if (!profile) return 'Sin datos';
    const stressScore = profile.stressScore || 0;
    if (stressScore >= 7) return { level: 'Alto', color: '#ff4444' };
    if (stressScore >= 4) return { level: 'Medio', color: '#ff9800' };
    return { level: 'Bajo', color: '#4caf50' };
  };

  const defaultInstructions = `INSTRUCCIONES PARA BOT DE WHATSAPP - ANÁLISIS DE BIENESTAR LABORAL

1. OBJETIVO:
   - Realizar conversaciones casuales con empleados
   - Detectar señales de estrés, burnout o problemas laborales
   - Mantener un tono amigable y no intrusivo

2. FRECUENCIA DE CONTACTO:
   - Contactar cada empleado según configuración (diaria/semanal/mensual)
   - Horario preferido: 10:00-11:00 AM o 3:00-4:00 PM
   - Evitar horarios fuera de trabajo

3. ESTRUCTURA DE CONVERSACIÓN:
   a) Saludo inicial casual
   b) Pregunta abierta sobre el día/semana
   c) Indagar sutilmente sobre:
      - Carga de trabajo
      - Relación con compañeros
      - Balance vida-trabajo
      - Satisfacción general
   d) Ofrecer recursos si detecta problemas
   e) Despedida positiva

4. PALABRAS CLAVE A DETECTAR:
   - Estrés: "agotado", "cansado", "no puedo más", "saturado"
   - Sobrecarga: "mucho trabajo", "no alcanzo", "horas extra"
   - Conflicto: "problemas con", "no me entienden", "mal ambiente"
   - Desmotivación: "aburrido", "sin ganas", "no vale la pena"

5. REGISTRO DE DATOS:
   - Guardar: fecha, hora, resumen de conversación, palabras clave detectadas
   - Calcular score de bienestar (1-10)
   - Identificar tendencias en el tiempo

6. ESCALAMIENTO:
   - Score < 4: Notificar a RRHH inmediatamente
   - Score 4-6: Monitoreo frecuente
   - Score > 6: Mantener seguimiento regular

7. PRIVACIDAD:
   - No compartir información entre empleados
   - Mantener confidencialidad
   - Solo reportar métricas agregadas a RRHH`;

  if (loading) {
    return <div className="loading">Cargando configuración...</div>;
  }

  return (
    <div className="bot-messaging-container">
      <div className="messaging-header">
        <h1>Bot de WhatsApp - Bienestar Laboral</h1>
        <p>Configura y monitorea el bot de WhatsApp para análisis de bienestar de empleados</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          Configuración
        </button>
        <button 
          className={`tab ${activeTab === 'profiles' ? 'active' : ''}`}
          onClick={() => setActiveTab('profiles')}
        >
          Perfiles de Empleados
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Análisis y Alertas
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'config' && (
          <div className="config-section">
            <div className="config-card">
              <h3>Configuración del Bot de WhatsApp</h3>
              
              <div className="form-group">
                <label>Estado del Bot</label>
                <div className="toggle-container">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={companyConfig.botEnabled}
                      onChange={(e) => setCompanyConfig({...companyConfig, botEnabled: e.target.checked})}
                    />
                    <span className="slider"></span>
                  </label>
                  <span>{companyConfig.botEnabled ? 'Activo' : 'Inactivo'}</span>
                </div>
              </div>

              <div className="form-group">
                <label>Número de WhatsApp Business</label>
                <input
                  type="text"
                  placeholder="+56 9 1234 5678"
                  value={companyConfig.whatsappNumber}
                  onChange={(e) => setCompanyConfig({...companyConfig, whatsappNumber: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Frecuencia de Análisis</label>
                <select
                  value={companyConfig.analysisFrequency}
                  onChange={(e) => setCompanyConfig({...companyConfig, analysisFrequency: e.target.value})}
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="biweekly">Quincenal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
            </div>

            <div className="instructions-card">
              <h3>Instrucciones para el Bot</h3>
              <p className="help-text">
                Estas instrucciones se enviarán al bot para definir cómo debe interactuar con los empleados
              </p>
              
              <button 
                className="default-btn"
                onClick={() => setBotInstructions(defaultInstructions)}
              >
                Usar instrucciones por defecto
              </button>

              <textarea
                className="instructions-textarea"
                value={botInstructions}
                onChange={(e) => setBotInstructions(e.target.value)}
                placeholder="Escribe las instrucciones para el bot..."
                rows="20"
              />
            </div>

            <div className="api-instructions">
              <h3>📋 Instrucciones de Integración</h3>
              <div className="instruction-box">
                <h4>1. Estructura en Firebase:</h4>
                <pre>{`/botRequests/{requestId}
  - companyId: string
  - type: "employee_wellbeing"
  - status: "pending" | "active" | "paused"
  - config: object
  - instructions: string

/companies/{companyId}/employeeProfiles/{employeeId}
  - name: string
  - lastContact: timestamp
  - stressScore: number (1-10)
  - conversations: array
  - alerts: array`}</pre>

                <h4>2. Guardar Conversaciones:</h4>
                <pre>{`// Estructura para guardar conversación
const conversation = {
  employeeId: "userId",
  timestamp: new Date().toISOString(),
  messages: [
    { sender: "bot", text: "...", time: "..." },
    { sender: "employee", text: "...", time: "..." }
  ],
  analysis: {
    stressScore: 7,
    detectedKeywords: ["cansado", "mucho trabajo"],
    sentiment: "negative",
    requiresAttention: true
  }
};

// Guardar en Firebase
ref: /companies/{companyId}/conversations/{conversationId}`}</pre>

                <h4>3. Webhook para WhatsApp Business API:</h4>
                <pre>{`POST /webhook/whatsapp
{
  "from": "+56912345678",
  "body": "mensaje del empleado",
  "timestamp": "..."
}`}</pre>
              </div>
            </div>

            <button 
              className="save-button"
              onClick={saveConfiguration}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        )}

        {activeTab === 'profiles' && (
          <div className="profiles-section">
            <div className="profiles-grid">
              {employees.map(employee => {
                const profile = employeeProfiles[employee.id];
                const stress = getStressLevel(profile);
                
                return (
                  <div 
                    key={employee.id} 
                    className={`profile-card ${selectedEmployee?.id === employee.id ? 'selected' : ''}`}
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <div className="profile-header">
                      <h4>{employee.name}</h4>
                      <div 
                        className="stress-indicator"
                        style={{ backgroundColor: stress.color }}
                      >
                        Estrés: {stress.level}
                      </div>
                    </div>
                    
                    <div className="profile-info">
                      <p>{employee.department}</p>
                      <p className="phone">{employee.phone || 'Sin teléfono'}</p>
                    </div>
                    
                    {profile && (
                      <div className="profile-stats">
                        <div className="stat">
                          <span className="label">Último contacto:</span>
                          <span className="value">
                            {profile.lastContact 
                              ? new Date(profile.lastContact).toLocaleDateString('es-CL')
                              : 'Nunca'}
                          </span>
                        </div>
                        <div className="stat">
                          <span className="label">Conversaciones:</span>
                          <span className="value">{profile.conversationCount || 0}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <div className="alerts-container">
              <h3>🚨 Alertas Activas</h3>
              <div className="alerts-list">
                {Object.entries(employeeProfiles)
                  .filter(([_, profile]) => profile.stressScore >= 7)
                  .map(([employeeId, profile]) => {
                    const employee = employees.find(e => e.id === employeeId);
                    return (
                      <div key={employeeId} className="alert-card high">
                        <div className="alert-icon">⚠️</div>
                        <div className="alert-content">
                          <h4>{employee?.name || 'Empleado'}</h4>
                          <p>Nivel de estrés alto detectado</p>
                          <p className="alert-meta">
                            Último análisis: {new Date(profile.lastContact).toLocaleDateString('es-CL')}
                          </p>
                        </div>
                        <button className="action-btn">
                          Tomar Acción
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="metrics-container">
              <h3>📊 Métricas Generales</h3>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-value">
                    {employees.filter(e => employeeProfiles[e.id]?.stressScore >= 7).length}
                  </div>
                  <div className="metric-label">Empleados en Riesgo</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">
                    {Object.values(employeeProfiles).filter(p => p.lastContact).length}
                  </div>
                  <div className="metric-label">Empleados Contactados</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">
                    {Math.round(
                      Object.values(employeeProfiles).reduce((acc, p) => acc + (p.stressScore || 0), 0) / 
                      Object.keys(employeeProfiles).length || 0
                    )}
                  </div>
                  <div className="metric-label">Promedio de Estrés</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BotMessaging;