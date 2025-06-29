'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useTheme } from '@/lib/useTheme';

export default function Navbar() {
  const { data: session, status } = useSession();
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        Task Tracker
      </Link>
      
      <div className="navbar-nav">
        {mounted && (
          <button
            onClick={toggleTheme}
            className="theme-switcher"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <span className="icon">
              {theme === 'light' ? '🌙' : '☀️'}
            </span>
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        )}
        
        {status === 'loading' ? (
          <span>Loading...</span>
        ) : session ? (
          <>
            <span>Welcome, {session.user.name}!</span>
            <button
              onClick={() => signOut()}
              className="btn-modern"
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/auth">
            <button className="btn-modern">
              Login
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
} 