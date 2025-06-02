import React, { useState } from 'react';
import { addDemoData } from '../scripts/addDemoData';

const DemoDataManager = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [demoUserId, setDemoUserId] = useState('');

  const handleAddDemoData = async () => {
    if (!demoUserId.trim()) {
      setResult({
        success: false,
        error: 'Por favor ingresa el ID del usuario demo'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await addDemoData(demoUserId.trim());
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'white',
      padding: '2rem',
      borderRadius: '10px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      maxWidth: '600px',
      margin: '2rem auto'
    }}>
      <h2>🎮 Administrador de Datos Demo</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Agrega datos de ejemplo al usuario demo@demo.cl para probar todas las funcionalidades del sistema.
      </p>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          ID del Usuario Demo:
        </label>
        <input
          type="text"
          value={demoUserId}
          onChange={(e) => setDemoUserId(e.target.value)}
          placeholder="Ingresa el UID del usuario demo@demo.cl"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '1rem'
          }}
        />
        <small style={{ color: '#666', fontSize: '0.85rem' }}>
          Puedes encontrar el UID en Firebase Auth → Users → demo@demo.cl
        </small>
      </div>

      <button
        onClick={handleAddDemoData}
        disabled={loading}
        style={{
          background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          padding: '1rem 2rem',
          borderRadius: '25px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%',
          marginBottom: '1.5rem'
        }}
      >
        {loading ? 'Agregando datos demo...' : '🚀 Agregar Datos Demo'}
      </button>

      {result && (
        <div style={{
          padding: '1rem',
          borderRadius: '5px',
          background: result.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          color: result.success ? '#155724' : '#721c24'
        }}>
          {result.success ? (
            <div>
              <h4>✅ ¡Datos demo agregados exitosamente!</h4>
              <p>El usuario demo@demo.cl ahora tiene:</p>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                <li>🎯 320 tokens disponibles</li>
                <li>🏆 4 logros desbloqueados de 6</li>
                <li>📈 Nivel: Bronze Explorer</li>
                <li>📋 4 solicitudes de beneficios</li>
                <li>🎫 2 tokens activos</li>
                <li>🎮 5 beneficios Jobby disponibles</li>
                <li>🏢 3 beneficios de empresa</li>
              </ul>
            </div>
          ) : (
            <div>
              <h4>❌ Error al agregar datos demo</h4>
              <p>{result.error}</p>
            </div>
          )}
        </div>
      )}

      <div style={{
        background: '#f8f9fa',
        padding: '1rem',
        borderRadius: '5px',
        marginTop: '1.5rem',
        fontSize: '0.9rem'
      }}>
        <h4>📋 Datos que se crearán:</h4>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
          <li><strong>Beneficios Jobby:</strong> 5 beneficios variados (Netflix, cena, spa, curso, aventura)</li>
          <li><strong>Beneficios Empresa:</strong> 3 beneficios internos (día libre, almuerzo, home office)</li>
          <li><strong>Solicitudes:</strong> 4 solicitudes con diferentes estados</li>
          <li><strong>Tokens:</strong> 3 tokens con códigos reales</li>
          <li><strong>Logros:</strong> Sistema gamificado con progreso</li>
          <li><strong>Estadísticas:</strong> Nivel, puntos, actividad reciente</li>
          <li><strong>Balance:</strong> 320 tokens disponibles</li>
        </ul>
      </div>
    </div>
  );
};

export default DemoDataManager;