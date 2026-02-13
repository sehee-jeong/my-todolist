import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as authService from '../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (authService.getToken()) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login({ email, password });
      navigate('/');
    } catch (err: unknown) {
      const e = err as { status?: number };
      if (e.status === 401) {
        setError(t('auth.invalidCredentials'));
      } else {
        setError(t('auth.loginFailed'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <h1>{t('auth.login')}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">{t('auth.email')}</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">{t('auth.password')}</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? t('common.processing') : t('auth.login')}
        </button>
      </form>
      <p>
        {t('auth.noAccount')} <Link to="/signup">{t('auth.signup')}</Link>
      </p>
    </div>
  );
}
