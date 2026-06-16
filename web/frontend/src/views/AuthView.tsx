import { KeyRound, LogIn, Mail, UserPlus } from 'lucide-react';
import { useState } from 'react';

type AuthMode = 'login' | 'register';

export function AuthView() {
  const [mode, setMode] = useState<AuthMode>('login');

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

        <form className="auth-form">
          {mode === 'register' && (
            <label>
              <span>Name</span>
              <div className="input-shell">
                <UserPlus size={17} aria-hidden="true" />
                <input type="text" placeholder="Patient name" />
              </div>
            </label>
          )}

          <label>
            <span>Email</span>
            <div className="input-shell">
              <Mail size={17} aria-hidden="true" />
              <input type="email" placeholder="patient@example.com" />
            </div>
          </label>

          <label>
            <span>Password</span>
            <div className="input-shell">
              <KeyRound size={17} aria-hidden="true" />
              <input type="password" placeholder="Password" />
            </div>
          </label>

          <button className="primary-action" type="button">
            {mode === 'login' ? (
              <LogIn size={18} aria-hidden="true" />
            ) : (
              <UserPlus size={18} aria-hidden="true" />
            )}
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </section>
  );
}
