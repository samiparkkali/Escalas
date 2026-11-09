import { useState } from 'react';
import { errorMessage, login } from '../utils/api';

const Login = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError('Enter your username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      onSuccess(await login(username.trim(), password));
    } catch (err) {
      setError(errorMessage(err, 'Login failed'));
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="tab-panel login-panel" onSubmit={handleSubmit}>
        <div className="tab-header">
          <h2>Sign in</h2>
        </div>

        {error && <div className="alert error" role="alert">{error}</div>}

        <div className="form-group">
          <label className="form-label" htmlFor="username">Username</label>
          <input
            id="username"
            className="form-input"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="form-input"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn-primary btn-block" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default Login;
