import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Logo } from './Logo.tsx';
import { UserProfile } from '../types/index.ts';
import { signInWithGoogle } from '../services/firebase.ts';

interface LoginModalProps {
  onLoginSuccess: (user: UserProfile) => void;
  availableUsers: UserProfile[];
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess, availableUsers }) => {
  const [email, setEmail] = useState('hazwansabo@gmail.com');
  const [password, setPassword] = useState('AlAmin@2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const fbUser = await signInWithGoogle();
      const userEmail = (fbUser.email || '').toLowerCase();
      const matched = availableUsers.find((u) => u.email.toLowerCase() === userEmail);
      if (matched) {
        onLoginSuccess(matched);
      } else {
        const isOwner = userEmail === 'hazwansabo@gmail.com';
        const dynamicUser: UserProfile = {
          id: fbUser.uid,
          full_name: fbUser.displayName || 'Firebase User',
          email: fbUser.email || '',
          role: isOwner ? 'owner' : 'marketing_staff',
          avatar_url: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
          is_active: true,
          created_at: new Date().toISOString(),
        };
        onLoginSuccess(dynamicUser);
      }
    } catch (err: unknown) {
      console.error('Google Sign-in failed:', err);
      const msg = err instanceof Error ? err.message : 'Google authentication failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Find user
      const matched = availableUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (matched && matched.is_active) {
        onLoginSuccess(matched);
      } else {
        // AUTH-06: Error message that doesn't reveal whether email exists
        setError('Invalid email or password. Please verify your credentials.');
      }
      setLoading(false);
    }, 450);
  };

  const handleSelectDemoUser = (user: UserProfile) => {
    setEmail(user.email);
    setPassword('AlAmin@2026!');
    setError('');
  };

  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
      {/* Two-Column Card as per PRD Section 7.4 */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/60">
        {/* Left Column: Turquoise Gradient & Branding */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#0E9F9A] via-[#0A726F] to-[#064e4c] p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -top-16 -right-16 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-[#E3F6F5]/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <Logo size="lg" light />
            <div className="mt-8 space-y-3">
              <h2 className="text-2xl md:text-3xl font-heading font-bold leading-tight">
                Marketing Control Center & LMS
              </h2>
              <p className="text-emerald-100/90 text-sm leading-relaxed">
                A unified hub to plan, manage editorial social media calendars, analyze marketing performance, and deploy the Oasis AI assistant.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/15 text-xs text-emerald-100/75 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <span>Role-based access control (Owner & Marketing Staff)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <span>Live database & Firebase synchronization</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <span>Gemini-powered Oasis assistant with official FAQ grounding</span>
            </div>
          </div>
        </div>

        {/* Right Column: Login Form */}
        <div className="md:w-7/12 p-8 md:p-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h3 className="text-2xl font-heading font-bold text-[#0A726F]">CMS Sign In</h3>
            <p className="text-gray-500 text-xs mt-1">
              Please enter your credentials to access the institution dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#E5484D] flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-in via Firebase */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 mb-4 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-3 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex py-1 items-center mb-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-3 text-xs text-gray-400 font-medium">Or sign in with email</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@alaminedu.com.my"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9F9A]/40 focus:bg-white transition"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-[#0E9F9A] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9F9A]/40 focus:bg-white transition"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0E9F9A] hover:bg-[#0A726F] text-white font-semibold rounded-xl text-sm shadow-lg shadow-[#0E9F9A]/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In Now</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registered System Accounts */}
          {availableUsers.length > 0 && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Active System Accounts:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectDemoUser(user)}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      email.toLowerCase() === user.email.toLowerCase()
                        ? 'border-[#0E9F9A] bg-[#E3F6F5]/50 ring-1 ring-[#0E9F9A]'
                        : 'border-gray-200 bg-gray-50/60 hover:bg-gray-100'
                    }`}
                  >
                    <img
                      src={user.avatar_url}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-gray-800 truncate">{user.full_name}</p>
                      <p className="text-[10px] text-[#0E9F9A] font-medium capitalize">
                        {user.role === 'owner' ? '👑 Owner' : '💼 Staff'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Modal (PRD AUTH-04) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-gray-100">
            <h4 className="text-lg font-heading font-bold text-[#0A726F]">
              Reset Password
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Enter your registered email address to receive a secure password reset link.
            </p>

            {forgotSuccess ? (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Password reset link sent to your email inbox!</span>
              </div>
            ) : (
              <form onSubmit={handleSendReset} className="mt-4 space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@alaminedu.com.my"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs bg-[#0E9F9A] text-white rounded-lg font-semibold hover:bg-[#0A726F]"
                  >
                    Send Email Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
