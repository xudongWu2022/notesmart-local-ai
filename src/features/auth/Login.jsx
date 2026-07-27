import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login, testCredentials } = useAuth();
  const { t } = useTranslation();
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login({ password: '123456' });
      navigate('/dashboard');
    } catch (error) {
      setError(t('auth.loginFailed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-bg">
      <div className="max-w-md w-full space-y-8 p-8 bg-surface-card rounded-xl shadow-lg border border-border-subtle">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-content-primary">
            {t('auth.signIn')}
          </h2>
          {error && (
            <p className="mt-2 text-center text-sm text-red-600">{error}</p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg
              shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
              transition-colors"
          >
            {t('auth.testLogin')}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-content-secondary">
          <p>{t('auth.testCredentials')}</p>
          <p>{t('auth.password')} {testCredentials.password}</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
