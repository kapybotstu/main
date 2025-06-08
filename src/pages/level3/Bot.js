import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off, push, update } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';
import './Bot.css';

const Bot = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: '¡Hola! Soy tu asistente virtual de Jobby. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hrMessages, setHrMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    // Agregar mensaje del usuario
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simular respuesta del bot
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        text: getBotResponse(inputValue)
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('token') || input.includes('tokens')) {
      return 'Los tokens son la moneda digital de Jobby. Tienes dos tipos: Tokens Flexibles (para beneficios Jobby) y Tokens de Empresa (para beneficios internos de tu empresa).';
    } else if (input.includes('beneficio') || input.includes('beneficios')) {
      return 'Puedes acceder a beneficios flexibles de Jobby y beneficios internos de tu empresa. Ve a las secciones correspondientes en el menú lateral para explorarlos.';
    } else if (input.includes('solicitud') || input.includes('solicitudes')) {
      return 'Puedes ver el estado de todas tus solicitudes en la sección "Mis Solicitudes". Ahí encontrarás el historial completo.';
    } else if (input.includes('ayuda') || input.includes('help')) {
      return 'Puedo ayudarte con: \n• Información sobre tokens\n• Beneficios disponibles\n• Estado de solicitudes\n• Navegación en la plataforma\n\n¿Sobre qué tema necesitas ayuda?';
    } else {
      return 'Entiendo tu consulta. Por el momento puedo ayudarte con información sobre tokens, beneficios y solicitudes. ¿Hay algo específico que quieras saber?';
    }
  };

  // Escuchar mensajes de RRHH
  useEffect(() => {
    if (!currentUser?.uid) return;

    const database = getDatabase();
    const messagesRef = ref(database, `botMessages/${currentUser.uid}`);
    
    const unsubscribe = onValue(messagesRef, async (snapshot) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const messagesList = Object.entries(messagesData)
          .map(([id, msg]) => ({ id, ...msg }))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setHrMessages(messagesList);
        
        // Contar mensajes no leídos
        const unread = messagesList.filter(msg => !msg.read).length;
        setUnreadCount(unread);
        
        // Si hay mensajes nuevos no leídos, agregarlos al chat
        const unreadMessages = messagesList.filter(msg => !msg.read);
        if (unreadMessages.length > 0) {
          const newMessages = unreadMessages.map(msg => ({
            id: `hr-${msg.id}`,
            type: 'bot',
            text: msg.text,
            isFromHR: true,
            hrName: msg.hrName,
            messageType: msg.type,
            timestamp: msg.timestamp
          }));
          
          setMessages(prev => [...prev, ...newMessages]);
          
          // Marcar como leídos
          const updates = {};
          unreadMessages.forEach(msg => {
            updates[`botMessages/${currentUser.uid}/${msg.id}/read`] = true;
          });
          await update(ref(database), updates);
        }
      }
    });

    return () => off(messagesRef, 'value', unsubscribe);
  }, [currentUser]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="bot-container">
      <div className="bot-header">
        <div className="bot-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 8V4l8 8-8 8v-4a8 8 0 01-8-8 8 8 0 018-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
        <div className="bot-info">
          <h2>Asistente Jobby</h2>
          <span className="bot-status">En línea</span>
        </div>
        {unreadCount > 0 && (
          <div className="unread-badge">{unreadCount} nuevos</div>
        )}
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type} ${message.isFromHR ? 'from-hr' : ''}`}>
            <div className="message-content">
              {message.isFromHR && (
                <div className="hr-message-header">
                  <span className="hr-badge">RRHH</span>
                  <span className="message-type">{message.messageType}</span>
                </div>
              )}
              {message.text}
              {message.timestamp && (
                <div className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message bot">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Escribe tu mensaje aquí..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="send-button" onClick={handleSendMessage}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Bot;