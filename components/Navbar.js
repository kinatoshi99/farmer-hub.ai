import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient'; // Corrected path
import { useRouter } from 'next/router';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!supabase) return;

    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    
    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      // If user logs out, redirect to home. If they log in, they'll likely be redirected from auth page.
      if (event === 'SIGNED_OUT') {
        router.push('/');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
      // Optionally show an error message to the user
    } else {
      // setUser(null); // Handled by onAuthStateChange
      // router.push('/auth'); // Or let onAuthStateChange handle redirect to '/'
    }
  };

  // Basic inline styles for demonstration
  const navStyle = {
    background: '#333',
    padding: '1rem',
  };
  const ulStyle = {
    listStyle: 'none',
    display: 'flex',
    justifyContent: 'space-around',
    margin: 0,
    padding: 0,
  };
  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
  };
   const buttonStyle = {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'inherit',
    fontSize: 'inherit',
  };
  const userInfoStyle = {
    color: 'white',
    marginRight: '1rem', // Add some spacing
  };


  return (
    <nav style={navStyle}>
      <ul style={ulStyle}>
        <li><Link href="/" style={linkStyle}>Home</Link></li>
        <li><Link href="/planning" style={linkStyle}>Crop Planning</Link></li>
        <li><Link href="/tasks" style={linkStyle}>Tasks</Link></li>
        <li><Link href="/profile" style={linkStyle}>Profile</Link></li>
        <li><Link href="/knowledgebase" style={linkStyle}>Knowledge Base</Link></li>
        
        {user ? (
          <>
            <li style={userInfoStyle}>Welcome, {user.email}</li>
            <li>
              <button onClick={handleLogout} style={{...linkStyle, ...buttonStyle}}>Logout</button>
            </li>
          </>
        ) : (
          <li><Link href="/auth" style={linkStyle}>Login/Sign Up</Link></li>
        )}
      </ul>
    </nav>
  );
}
