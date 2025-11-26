import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../../api/profile';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [profileData, setProfileData] = useState({
    id: null,
    username: '',
    email: '',
    created_at: ''
  });
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getProfile();
      setProfileData(data);
      setFormData({
        username: data.username,
        email: data.email
      });
    } catch (err) {
      setError('Ошибка загрузки профиля');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      setError('Имя пользователя не может быть пустым');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('Email не может быть пустым');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess(false);
      const data = await updateProfile(formData.username, formData.email);
      setProfileData(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.username) {
          setError(errorData.username[0]);
        } else if (errorData.email) {
          setError(errorData.email[0]);
        } else {
          setError('Ошибка сохранения профиля');
        }
      } else {
        setError('Ошибка сохранения профиля');
      }
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (username) => {
    if (!username) return '?';
    const parts = username.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="profile-container" data-easytag="id1-react/src/components/Profile/index.jsx">
        <div className="profile-loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="profile-container" data-easytag="id1-react/src/components/Profile/index.jsx">
      <div className="profile-card">
        <div className="profile-header">
          <button className="back-button" onClick={() => navigate('/chat')}>
            ← Назад в чат
          </button>
        </div>

        <div className="profile-avatar">
          <div className="avatar-circle">
            {getInitials(profileData.username)}
          </div>
        </div>

        <div className="profile-info">
          <div className="registration-date">
            Зарегистрирован: {formatDate(profileData.created_at)}
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Введите имя пользователя"
              disabled={saving}
              minLength={3}
              maxLength={150}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Введите email"
              disabled={saving}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">Профиль успешно обновлен!</div>}

          <button type="submit" className="save-button" disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;