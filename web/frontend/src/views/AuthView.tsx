import { KeyRound, LogIn, Mail, UserPlus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { AuthSession } from '../types/domain';

type AuthMode = 'login' | 'register';

interface AuthViewProps {
  session: AuthSession | null;
  onAuthenticate: (session: AuthSession) => void;
  onLogout: () => void;
}

export function AuthView({ session, onAuthenticate, onLogout }: AuthViewProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('Patient Demo');
  const [email, setEmail] = useState('patient@example.com');
  const [password, setPassword] = useState('password123');
  const [message, setMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onAuthenticate({
      name: mode === 'register' ? name : session?.name ?? 'Patient Demo',
      email,
      token: `mock-token-${Date.now()}`,
    });
    setMessage(
      mode === 'login'
        ? 'Signed in with a mock token.'
        : 'Account created in mock mode.',
    );
  }

  return (
    <section className="auth-layout" aria-label="Authentication">
      <div className="panel auth-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Account access</p>
            <h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
          </div>
          {mode === 'login' ? (
            <LogIn size={22} aria-hidden="true" />
          ) : (
            <UserPlus size={22} aria-hidden="true" />
          )}
        </div>

        {session && (
          <div className="session-card">
            <div>
              <span>Signed in as</span>
              <strong>{session.name}</strong>
              <small>{session.email}</small>
            </div>
            <button className="secondary-action" type="button" onClick={onLogout}>
              Sign out
            </button>
          </div>
        )}

        <div className="segmented-control" role="tablist" aria-label="Auth mode">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label>
              <span>Name</span>
              <div className="input-shell">
                <UserPlus size={17} aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Patient name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
            </label>
          )}

          <label>
            <span>Email</span>
            <div className="input-shell">
              <Mail size={17} aria-hidden="true" />
              <input
                type="email"
                placeholder="patient@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </label>

          <label>
            <span>Password</span>
            <div className="input-shell">
              <KeyRound size={17} aria-hidden="true" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </label>

          <button className="primary-action" type="submit" disabled={!email || !password}>
            {mode === 'login' ? (
              <LogIn size={18} aria-hidden="true" />
            ) : (
              <UserPlus size={18} aria-hidden="true" />
            )}
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
          {message && (
            <p className="success-note" role="status">
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
