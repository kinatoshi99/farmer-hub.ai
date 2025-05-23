import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient'; // Corrected path
import { useRouter } from 'next/router';

export default function AuthPage() {
  const router = useRouter();

  // State for forms
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // For sign-up

  // State for loading and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(''); // For success messages like "Check your email"

  // Redirect if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/'); // Redirect to home if logged in
      }
    };
    checkUser();
    
    // Listen for auth state changes (e.g., after OAuth redirect)
    const { data: authListener } = supabase?.auth?.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);


  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage('');
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    if (!supabase) {
        setError("Supabase client is not available. Check console for details.");
        setLoading(false);
        return;
    }
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) {
      setError(signUpError.message);
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      // This case might indicate email confirmation is required but user already exists without confirmation.
      // Supabase behavior might vary. Check if user needs to confirm email.
      setMessage("User already registered. Please confirm your email or try logging in.");
    } else if (data.session) {
      // User is signed up and logged in (auto-confirm or already confirmed)
      setMessage("Sign up successful! Redirecting...");
      router.push('/');
    } 
     else if (data.user) {
      // User is signed up but requires email confirmation
       setMessage("Sign up successful! Please check your email to confirm your account.");
    }
    else {
       setError("An unexpected error occurred during sign up.");
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage('');
    setLoading(true);
    if (!supabase) {
        setError("Supabase client is not available. Check console for details.");
        setLoading(false);
        return;
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
    } else {
      setMessage("Login successful! Redirecting...");
      router.push('/'); // Redirect to home or dashboard
    }
    setLoading(false);
  };

  const handleOAuthLogin = async (provider) => {
    setError(null);
    setMessage('');
    setLoading(true);
    if (!supabase) {
        setError("Supabase client is not available. Check console for details.");
        setLoading(false);
        return;
    }
    const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider });
    if (oauthError) {
      setError(oauthError.message);
    }
    // Supabase handles the redirect, so no direct router.push here unless there's an immediate error.
    setLoading(false);
  };


  // --- Styles (copied from previous version for consistency) ---
  const sectionStyle = {
    width: '100%',
    maxWidth: '400px',
    padding: '20px',
    border: '1px solid #eee',
    borderRadius: '5px',
    marginBottom: '30px',
  };
  const formGroupStyle = { marginBottom: '15px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
  const buttonStyle = { width: '100%', padding: '10px 15px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px', disabled: loading };
  const oauthButtonStyle = { ...buttonStyle, backgroundColor: '#f0f0f0', color: '#333', border: '1px solid #ccc', disabled: loading };
  const pageContainerStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
  const errorStyle = { color: 'red', marginBottom: '10px' };
  const messageStyle = { color: 'green', marginBottom: '10px' };

  if (!supabase) {
    return (
      <Layout>
        <div style={pageContainerStyle}>
          <p style={errorStyle}>Supabase client is not initialized. Please check your environment variables and console.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={pageContainerStyle}>
        {error && <p style={errorStyle}>{error}</p>}
        {message && <p style={messageStyle}>{message}</p>}

        <div style={sectionStyle}>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div style={formGroupStyle}>
              <label htmlFor="loginEmail" style={labelStyle}>Email</label>
              <input type="email" id="loginEmail" name="loginEmail" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div style={formGroupStyle}>
              <label htmlFor="loginPassword" style={labelStyle}>Password</label>
              <input type="password" id="loginPassword" name="loginPassword" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>

        <div style={sectionStyle}>
          <h2>Sign Up</h2>
          <form onSubmit={handleSignUp}>
            <div style={formGroupStyle}>
              <label htmlFor="signupEmail" style={labelStyle}>Email</label>
              <input type="email" id="signupEmail" name="signupEmail" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div style={formGroupStyle}>
              <label htmlFor="signupPassword" style={labelStyle}>Password</label>
              <input type="password" id="signupPassword" name="signupPassword" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div style={formGroupStyle}>
              <label htmlFor="confirmPassword" style={labelStyle}>Confirm Password</label>
              <input type="password" id="confirmPassword" name="confirmPassword" style={inputStyle} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        </div>

        <div style={sectionStyle}>
          <h2>Or sign in with OAuth</h2>
          <button style={oauthButtonStyle} onClick={() => handleOAuthLogin('google')} disabled={loading}>
            {loading ? 'Processing...' : 'Sign in with Google'}
          </button>
          <button style={oauthButtonStyle} onClick={() => handleOAuthLogin('github')} disabled={loading}>
            {loading ? 'Processing...' : 'Sign in with GitHub'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
