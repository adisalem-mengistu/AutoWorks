import { useState } from 'react';
import { X, Mail, Lock, Chrome, AlertCircle } from 'lucide-react';
import { signInWithGoogle, signInWithEmail, registerWithEmail, isConfigured } from '../lib/firebase';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <div className="mb-6">
          <h2 className="text-white text-xl font-bold mb-1">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-gray-400 text-sm">
            Sign in to save your profile and access all features.
          </p>
        </div>

        {!isConfigured && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4 flex gap-2">
            <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
            <p className="text-amber-300 text-xs">
              Firebase is not configured. Add your Firebase keys to <code className="bg-amber-500/20 px-1 rounded">.env</code> to enable auth.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 flex gap-2">
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-300 text-xs">{error}</p>
          </div>
        )}

        <button
          onClick={handleGoogle}
          disabled={loading || !isConfigured}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-900 font-medium py-2.5 rounded-lg text-sm transition-colors mb-4"
        >
          <Chrome size={16} />
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-gray-500 text-xs">or email</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !isConfigured}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-4">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setMode(mode === 'signin' ? 'register' : 'signin')}
            className="text-cyan-400 hover:underline"
          >
            {mode === 'signin' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
