'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful, now sign in
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError('Registration successful but login failed. Please try logging in manually.');
        } else {
          router.push('/');
        }
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="flip-card-container">
        <div className={`flip-card ${!isLogin ? 'flipped' : ''}`}>
          {/* Login Form */}
          <div className="flip-card-front">
            <h1 className="auth-title">Welcome Back! 👋</h1>
            
            <div className="auth-toggle">
              <button 
                type="button"
                className={isLogin ? 'active' : ''}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button 
                type="button"
                className={!isLogin ? 'active' : ''}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </div>

            <form className="auth-form" onSubmit={handleLogin}>
              <input 
                className="form-input" 
                name="email" 
                placeholder="Email address" 
                type="email"
                required
                disabled={isLoading}
              />
              <input 
                className="form-input" 
                name="password" 
                placeholder="Password" 
                type="password"
                required
                disabled={isLoading}
              />
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                className="btn-modern"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
          
          {/* Register Form */}
          <div className="flip-card-back">
            <h1 className="auth-title">Join Us! 🚀</h1>
            
            <div className="auth-toggle">
              <button 
                type="button"
                className={isLogin ? 'active' : ''}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button 
                type="button"
                className={!isLogin ? 'active' : ''}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </div>

            <form className="auth-form" onSubmit={handleRegister}>
              <input 
                className="form-input" 
                name="name"
                placeholder="Full name" 
                type="text"
                required
                disabled={isLoading}
              />
              <input 
                className="form-input" 
                name="email" 
                placeholder="Email address" 
                type="email"
                required
                disabled={isLoading}
              />
              <input 
                className="form-input" 
                name="password" 
                placeholder="Password (min 6 characters)" 
                type="password"
                required
                minLength={6}
                disabled={isLoading}
              />
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                className="btn-modern"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </div>   
    </div>
  );
} 