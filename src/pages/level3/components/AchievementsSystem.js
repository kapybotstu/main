import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './AchievementsSystem.css';

const AchievementsSystem = ({ userStats, userTokens, recentRequests }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('logros');
  const [userLevel, setUserLevel] = useState('Explorer');
  const [levelProgress, setLevelProgress] = useState(0);

  // Calcular nivel del usuario basado en actividad
  useEffect(() => {
    const totalActivity = (userStats.activeTokens || 0) + (recentRequests.length || 0);
    const availableTokens = (userTokens.currentMonthTokens || 0) + (userTokens.previousMonthTokens || 0);
    
    if (totalActivity >= 15) {
      setUserLevel('Experto');
      setLevelProgress(100);
    } else if (totalActivity >= 8) {
      setUserLevel('Aventurero');
      setLevelProgress((totalActivity / 15) * 100);
    } else if (totalActivity >= 3) {
      setUserLevel('Explorador');
      setLevelProgress((totalActivity / 8) * 100);
    } else {
      setUserLevel('Novato');
      setLevelProgress((totalActivity / 3) * 100);
    }
  }, [userStats, recentRequests, userTokens]);

  const achievements = [
    {
      id: 1,
      title: "Primer Paso",
      description: "Realiza tu primera solicitud de beneficio",
      icon: "🎯",
      unlocked: recentRequests.length > 0,
      progress: Math.min(recentRequests.length, 1),
      maxProgress: 1,
      points: 100
    },
    {
      id: 2,
      title: "Coleccionista",
      description: "Acumula 5 tokens activos",
      icon: "🎟️",
      unlocked: userStats.activeTokens >= 5,
      progress: Math.min(userStats.activeTokens, 5),
      maxProgress: 5,
      points: 250
    },
    {
      id: 3,
      title: "Explorador Activo",
      description: "Realiza 10 solicitudes de beneficios",
      icon: "🚀",
      unlocked: recentRequests.length >= 10,
      progress: Math.min(recentRequests.length, 10),
      maxProgress: 10,
      points: 500
    },
    {
      id: 4,
      title: "Maestro de Beneficios",
      description: "Mantén 20 tokens activos",
      icon: "👑",
      unlocked: userStats.activeTokens >= 20,
      progress: Math.min(userStats.activeTokens, 20),
      maxProgress: 20,
      points: 1000
    }
  ];

  const mockLeaderboard = [
    {
      rank: 1,
      name: "Ana García",
      points: 2850,
      level: "Experto",
      avatar: "👩‍💼",
      tokensUsed: 28
    },
    {
      rank: 2,
      name: "Carlos Mendez",
      points: 2340,
      level: "Aventurero",
      avatar: "👨‍💻",
      tokensUsed: 23
    },
    {
      rank: 3,
      name: currentUser?.displayName?.split(' ')[0] || "Usuario",
      points: achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0),
      level: userLevel,
      avatar: "🎯",
      tokensUsed: userStats.activeTokens || 0,
      isCurrentUser: true
    },
    {
      rank: 4,
      name: "María López",
      points: 1680,
      level: "Explorador",
      avatar: "👩‍🎨",
      tokensUsed: 16
    },
    {
      rank: 5,
      name: "Pedro Silva",
      points: 1450,
      level: "Explorador",
      avatar: "👨‍🔬",
      tokensUsed: 14
    }
  ];

  const getTrophyIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "🏅";
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "from-yellow-400 to-yellow-600";
    if (rank === 2) return "from-gray-300 to-gray-500";
    if (rank === 3) return "from-amber-600 to-amber-800";
    return "from-blue-400 to-blue-600";
  };

  const availableTokens = (userTokens.currentMonthTokens || 0) + (userTokens.previousMonthTokens || 0);
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="achievements-system">
      <div className="achievements-header">
        <div className="section-title">
          <h3>🏆 Sistema de Logros</h3>
          <p>Tu progreso y estadísticas</p>
        </div>
        
        {/* Barra de progreso de nivel */}
        <div className="level-progress">
          <div className="level-info">
            <span className="current-level">{userLevel}</span>
            <span className="level-points">{totalPoints} pts</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${levelProgress}%` }}
            ></div>
          </div>
          <div className="level-labels">
            <span>Novato</span>
            <span>Explorador</span>
            <span>Aventurero</span>
            <span>Experto</span>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="stats-grid">
        <div className="stat-card tokens-card">
          <div className="stat-icon">🎟️</div>
          <div className="stat-content">
            <div className="stat-number">{availableTokens}</div>
            <div className="stat-label">Tokens Disponibles</div>
            <div className="stat-sublabel">¡Úsalos para conseguir logros!</div>
          </div>
          <div className="stat-gradient"></div>
        </div>

        <div className="stat-card achievements-card">
          <div className="stat-icon">🏅</div>
          <div className="stat-content">
            <div className="stat-number">{achievements.filter(a => a.unlocked).length}</div>
            <div className="stat-label">Logros Desbloqueados</div>
            <div className="stat-sublabel">de {achievements.length} totales</div>
          </div>
          <div className="stat-gradient"></div>
        </div>

        <div className="stat-card ranking-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">#3</div>
            <div className="stat-label">Posición Ranking</div>
            <div className="stat-sublabel">¡Sigue participando!</div>
          </div>
          <div className="stat-gradient"></div>
        </div>
      </div>

      {/* Pestañas */}
      <div className="tabs-container">
        <div className="tabs-header">
          <button 
            className={`tab ${activeTab === 'logros' ? 'active' : ''}`}
            onClick={() => setActiveTab('logros')}
          >
            🏆 Logros
          </button>
          <button 
            className={`tab ${activeTab === 'ranking' ? 'active' : ''}`}
            onClick={() => setActiveTab('ranking')}
          >
            📊 Ranking
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'logros' && (
            <div className="achievements-grid">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="achievement-icon">
                    <span className={achievement.unlocked ? 'unlocked-icon' : 'locked-icon'}>
                      {achievement.unlocked ? achievement.icon : '🔒'}
                    </span>
                  </div>
                  <div className="achievement-content">
                    <h4>{achievement.title}</h4>
                    <p>{achievement.description}</p>
                    <div className="achievement-progress">
                      <div className="progress-bar small">
                        <div 
                          className="progress-fill"
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                    <div className="achievement-points">
                      +{achievement.points} pts
                    </div>
                  </div>
                  {achievement.unlocked && (
                    <div className="unlock-badge">✅</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ranking' && (
            <div className="leaderboard">
              <div className="leaderboard-header">
                <h4>🏆 Top Usuarios del Mes</h4>
                <p>Basado en tokens utilizados y logros desbloqueados</p>
              </div>
              <div className="leaderboard-list">
                {mockLeaderboard.map((user) => (
                  <div 
                    key={user.rank}
                    className={`leaderboard-item ${user.isCurrentUser ? 'current-user' : ''}`}
                  >
                    <div className="rank-badge">
                      <span className={`trophy ${getRankColor(user.rank)}`}>
                        {getTrophyIcon(user.rank)}
                      </span>
                      <span className="rank-number">#{user.rank}</span>
                    </div>
                    <div className="user-avatar">
                      {user.avatar}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      <div className="user-level">{user.level}</div>
                    </div>
                    <div className="user-stats">
                      <div className="points">{user.points} pts</div>
                      <div className="tokens-used">{user.tokensUsed} tokens</div>
                    </div>
                    {user.isCurrentUser && (
                      <div className="current-user-badge">¡Tú!</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call to action */}
      <div className="cta-section">
        <div className="cta-content">
          <h4>🚀 ¡Sigue Progresando!</h4>
          <p>Usa tus {availableTokens} tokens disponibles para desbloquear más logros</p>
          <button 
            className="cta-button"
            onClick={() => window.location.href = '/level3/jobby-benefits'}
          >
            <span>Explorar Beneficios</span>
            <span className="cta-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementsSystem;