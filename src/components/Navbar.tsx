'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        Task Tracker
      </Link>
      
      <div className="navbar-nav">
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