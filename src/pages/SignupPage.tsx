import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

const GOOGLE_ICON = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

function getFirebaseError(code: string): string {
  const errors: Record<string, string> = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/popup-closed-by-user': 'Google sign-in popup was closed.',
    'auth/popup-blocked': 'Sign-in popup was blocked by browser. Please enable popups.',
    'auth/unauthorized-domain': 'This domain is not added to Firebase Authorized Domains. Logged in as Demo User.',
    'auth/operation-not-allowed': 'Google Sign-In is not enabled in Firebase Console. Logged in as Demo User.',
  };
  return errors[code] || 'Authentication error. Continuing with Demo Mode.';
}

export default function SignupPage() {
  const { signInWithGoogle, signUpWithEmail, signInAsDemoUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGoogle() {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      navigate('/onboarding');
    } catch (e: any) {
      setError(getFirebaseError(e.code || ''));
      await signInAsDemoUser(name || 'Demo Event Organizer', email || 'organizer@utsavcycle.ai');
      navigate('/onboarding');
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!email) { setError('Please enter your email.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await signUpWithEmail(email, password, name);
      navigate('/onboarding');
    } catch (e: any) {
      setError(getFirebaseError(e.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8faf5] dark:bg-[#0d1510] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/utsavcycle-logo.png" alt="UtsavCycle AI" className="w-9 h-9 rounded-full object-cover" />
          <span className="font-bold text-brand-green dark:text-green-400 text-sm">UtsavCycle AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-green dark:hover:text-green-400 font-medium transition-colors">
            Already have an account? Sign in
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-[#1a2018] rounded-3xl shadow-card-hover p-8">
          <div className="text-center mb-8">
            <img src="/utsavcycle-logo.png" alt="" className="w-16 h-16 rounded-full object-cover mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create your account</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join UtsavCycle AI — free for event organisers</p>
          </div>

          <Button
            variant="outline"
            className="w-full mb-6 border-gray-200 dark:border-[#2a3828] text-gray-700 dark:text-gray-200 hover:border-brand-green hover:text-brand-green"
            onClick={handleGoogle}
            loading={googleLoading}
            icon={!googleLoading ? GOOGLE_ICON : undefined}
          >
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-[#2a3828]" /></div>
            <div className="relative flex justify-center"><span className="px-3 bg-white dark:bg-[#1a2018] text-xs text-gray-400 dark:text-gray-500">or sign up with email</span></div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-4 border border-red-100">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full name" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} icon={<User size={16} />} />
            <Input label="Email address" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} icon={<Mail size={16} />} />
            <Input label="Password" type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} icon={<Lock size={16} />} />
            <Button type="submit" className="w-full" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-green font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
