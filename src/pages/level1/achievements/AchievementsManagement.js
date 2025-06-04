import React, { useState, useEffect } from 'react';
import { ref, push, onValue, remove, update } from 'firebase/database';
import { database } from '../../../services/firebase/config';
import { useAuth } from '../../../context/AuthContext';
import achievementsService from '../../../services/achievementsService';
import './AchievementsManagement.css';

const AchievementsManagement = () => {
  const { currentUser } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [recentActivity, setRecentActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rules');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    condition: {
      type: 'same_provider_timeframe',
      value: 40,
      minUsers: 2
    },
    rewards: {
      tokens: 5
    },
    status: 'active'
  });

  const achievementTypes = [
    { 
      value: 'same_provider_timeframe', 
      label: 'Canjeo Conjunto por Tiempo', 
      description: 'X usuarios canjean en el mismo proveedor dentro de Y minutos'
    },
    { 
      value: 'tokens_used_count', 
      label: 'Tokens Utilizados', 
      description: 'Usuario que ha usado X tokens en total'
    },
    { 
      value: 'weekend_usage', 
      label: 'Uso en Fin de Semana', 
      description: 'Usuario que canjea tokens en fin de semana'
    },
    { 
      value: 'first_company_user', 
      label: 'Primer Usuario de Empresa', 
      description: 'Primer usuario de una empresa en usar el sistema'
    }
  ];

  useEffect(() => {
    fetchAchievements();
    analyzeActivity();
  }, []);

  const fetchAchievements = () => {
    const achievementsRef = ref(database, 'achievements');
    onValue(achievementsRef, (snapshot) => {
      const achievementsData = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          achievementsData.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
      }
      
      achievementsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAchievements(achievementsData);
      setLoading(false);
    });
  };

  const analyzeActivity = async () => {
    const activity = await achievementsService.analyzeRecentActivity(7);
    setRecentActivity(activity);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const achievementData = {
        ...formData,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.uid
      };

      const achievementsRef = ref(database, 'achievements');
      await push(achievementsRef, achievementData);

      // Reset form
      setFormData({
        name: '',
        description: '',
        condition: {
          type: 'same_provider_timeframe',
          value: 40,
          minUsers: 2
        },
        rewards: {
          tokens: 5
        },
        status: 'active'
      });

      // Reload active rules in service
      await achievementsService.loadActiveRules();
    } catch (error) {
      console.error('Error al crear regla:', error);
      alert('Error al crear la regla');
    }
  };

  const toggleStatus = async (achievement) => {
    try {
      const achievementRef = ref(database, `achievements/${achievement.id}`);
      await update(achievementRef, {
        status: achievement.status === 'active' ? 'inactive' : 'active'
      });
      
      // Reload active rules
      await achievementsService.loadActiveRules();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const deleteAchievement = async (achievementId) => {
    if (window.confirm('¿Eliminar esta regla de logro?')) {
      try {
        const achievementRef = ref(database, `achievements/${achievementId}`);
        await remove(achievementRef);
        
        // Reload active rules
        await achievementsService.loadActiveRules();
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Cargando sistema de logros...</div>;
  }

  return (
    <div className="achievements-management-simple">
      <h1>Sistema de Logros - Detección Automática</h1>
      
      <div className="tabs">
        <button 
          className={activeTab === 'rules' ? 'active' : ''}
          onClick={() => setActiveTab('rules')}
        >
          Reglas ({achievements.filter(a => a.status === 'active').length} activas)
        </button>
        <button 
          className={activeTab === 'analysis' ? 'active' : ''}
          onClick={() => setActiveTab('analysis')}
        >
          Análisis Reciente
        </button>
      </div>

      {activeTab === 'rules' && (
        <div className="rules-section">
          <div className="create-rule">
            <h3>Nueva Regla de Logro</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Tipo de Condición:</label>
                <select
                  value={formData.condition.type}
                  onChange={(e) => setFormData({
                    ...formData,
                    condition: { ...formData.condition, type: e.target.value }
                  })}
                >
                  {achievementTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <small>{achievementTypes.find(t => t.value === formData.condition.type)?.description}</small>
              </div>
              
              {formData.condition.type === 'same_provider_timeframe' && (
                <>
                  <div className="form-group">
                    <label>Minutos máximo entre canjeos:</label>
                    <input
                      type="number"
                      value={formData.condition.value}
                      onChange={(e) => setFormData({
                        ...formData,
                        condition: { ...formData.condition, value: parseInt(e.target.value) }
                      })}
                      min="1"
                      max="120"
                    />
                  </div>
                  <div className="form-group">
                    <label>Mínimo usuarios:</label>
                    <input
                      type="number"
                      value={formData.condition.minUsers}
                      onChange={(e) => setFormData({
                        ...formData,
                        condition: { ...formData.condition, minUsers: parseInt(e.target.value) }
                      })}
                      min="2"
                      max="10"
                    />
                  </div>
                </>
              )}
              
              {formData.condition.type === 'tokens_used_count' && (
                <div className="form-group">
                  <label>Cantidad de tokens requeridos:</label>
                  <input
                    type="number"
                    value={formData.condition.value}
                    onChange={(e) => setFormData({
                      ...formData,
                      condition: { ...formData.condition, value: parseInt(e.target.value) }
                    })}
                    min="1"
                  />
                </div>
              )}
              
              <div className="form-group">
                <label>Recompensa en tokens:</label>
                <input
                  type="number"
                  value={formData.rewards.tokens}
                  onChange={(e) => setFormData({
                    ...formData,
                    rewards: { tokens: parseInt(e.target.value) }
                  })}
                  min="0"
                />
              </div>
              
              <button type="submit">Crear Regla</button>
            </form>
          </div>
          
          <div className="rules-list">
            <h3>Reglas Existentes</h3>
            {achievements.length === 0 ? (
              <p>No hay reglas creadas</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Condición</th>
                    <th>Recompensa</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {achievements.map((achievement) => (
                    <tr key={achievement.id}>
                      <td>{achievement.name}</td>
                      <td>{achievementTypes.find(t => t.value === achievement.condition.type)?.label}</td>
                      <td>
                        {achievement.condition.type === 'same_provider_timeframe' 
                          ? `${achievement.condition.minUsers} usuarios en ${achievement.condition.value} min`
                          : `Valor: ${achievement.condition.value}`
                        }
                      </td>
                      <td>{achievement.rewards.tokens} tokens</td>
                      <td>
                        <span className={`status ${achievement.status}`}>
                          {achievement.status === 'active' ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => toggleStatus(achievement)}>
                          {achievement.status === 'active' ? 'Desactivar' : 'Activar'}
                        </button>
                        <button onClick={() => deleteAchievement(achievement.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analysis' && recentActivity && (
        <div className="analysis-section">
          <h3>Análisis de Actividad (Últimos 7 días)</h3>
          
          <div className="analysis-card">
            <h4>Canjeos Conjuntos Detectados</h4>
            {recentActivity.sameProviderGroups.length === 0 ? (
              <p>No se detectaron canjeos conjuntos</p>
            ) : (
              <ul>
                {recentActivity.sameProviderGroups.map((group, index) => (
                  <li key={index}>
                    Proveedor {group.providerId}: {group.count} usuarios canjearon juntos
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="analysis-card">
            <h4>Uso en Fin de Semana</h4>
            <p>{recentActivity.weekendUsers.length} tokens canjeados en fin de semana</p>
          </div>
          
          <button onClick={analyzeActivity}>Actualizar Análisis</button>
        </div>
      )}
    </div>
  );
};

export default AchievementsManagement;