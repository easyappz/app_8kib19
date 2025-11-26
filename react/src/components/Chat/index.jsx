import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMessages, sendMessage } from '../../api/messages';
import { logout, getToken } from '../../api/auth';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const data = await getMessages(100, 0);
      setMessages(data.results || []);
      
      if (data.results && data.results.length > 0) {
        const firstMessage = data.results.find(msg => msg.author);
        if (firstMessage && firstMessage.author) {
          const token = getToken();
          if (token) {
            setCurrentUser(firstMessage.author);
          }
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    loadMessages();

    const interval = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || isSending) {
      return;
    }

    setIsSending(true);
    try {
      const newMessage = await sendMessage(messageText);
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      
      if (!currentUser && newMessage.author) {
        setCurrentUser(newMessage.author);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      navigate('/login');
    }
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const getInitials = (username) => {
    if (!username) return '?';
    return username.substring(0, 2).toUpperCase();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const isMyMessage = (message) => {
    if (!currentUser || !message.author) return false;
    return message.author.id === currentUser.id;
  };

  if (isLoading) {
    return (
      <div className="chat-container" data-easytag="id1-react/src/components/Chat/index.jsx">
        <div className="chat-loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="chat-container" data-easytag="id1-react/src/components/Chat/index.jsx">
      <div className="chat-header">
        <h1 className="chat-title">Групповой чат</h1>
        <div className="chat-header-buttons">
          <button onClick={handleProfile} className="chat-header-btn" title="Профиль">
            👤 Профиль
          </button>
          <button onClick={handleLogout} className="chat-header-btn" title="Выход">
            🚪 Выход
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">Нет сообщений. Начните общение!</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${isMyMessage(message) ? 'message-own' : 'message-other'}`}
            >
              <div className="message-avatar">
                {getInitials(message.author?.username)}
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-author">
                    {message.author?.username || 'Неизвестный'}
                  </span>
                  <span className="message-time">
                    {formatTime(message.created_at)}
                  </span>
                </div>
                <div className="message-text">{message.text}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Введите сообщение..."
          className="chat-input"
          disabled={isSending}
          maxLength={5000}
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!messageText.trim() || isSending}
        >
          {isSending ? '...' : '📤 Отправить'}
        </button>
      </form>
    </div>
  );
};

export default Chat;