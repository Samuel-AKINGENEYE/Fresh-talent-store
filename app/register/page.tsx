'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Zap } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setError(error.message);
    } else {
      fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: fullName }),
      }).catch(console.error);

      router.push('/login?message=Check your email to confirm your account');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/8 border border-slate-100 overflow-hidden">

          {/* Branded header */}
          <div className="bg-slate-900 px-8 pt-8 pb-10">
            <Link href="/" className="flex items-center gap-2.5 mb-7">
              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Zap className="h-5 w-5 text-white fill-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-extrabold text-white tracking-tight">
                  Fresh<span className="text-amber-400">Talent</span>
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-semibold mt-0.5">Store</span>
              </div>
            </Link>
            <h1 className="text-2xl font-extrabold text-white">Create your account</h1>
            <p className="text-slate-400 text-sm mt-1">Join shoppers in Kigali 🇷🇼</p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="px-8 py-8 space-y-5" noValidate>

            {error && (
              <div role="alert" className="bg-red-50 border border-red-100 rounded-xl p-3.5 flex items-start gap-2.5">
                <div className="h-4 w-4 rounded-full bg-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-red-700 text-sm font-semibold">{error}</p>
              </div>
            )}

            <fieldset className="space-y-4">
              <legend className="sr-only">Personal information</legend>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="register-name" className="block text-sm font-bold text-slate-800">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                  <input
                    id="register-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm font-medium bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-150"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="register-email" className="block text-sm font-bold text-slate-800">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                  <input
                    id="register-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm font-medium bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-150"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="register-password" className="block text-sm font-bold text-slate-800">
                  Password{' '}
                  <span className="text-slate-400 font-normal text-xs">(min. 6 characters)</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm font-medium bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-150"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-0.5"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </fieldset>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-md shadow-blue-700/20 hover:shadow-blue-600/30 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Fine print */}
            <p className="text-center text-xs text-slate-400 leading-relaxed">
              By creating an account you agree to our{' '}
              <span className="text-blue-600 font-semibold cursor-pointer">Terms of Service</span>
              {' '}and{' '}
              <span className="text-blue-600 font-semibold cursor-pointer">Privacy Policy</span>.
            </p>

            {/* Login link */}
            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-700 font-bold hover:text-blue-600 hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </div>

        {/* Help */}
        <p className="text-center text-xs text-slate-400 mt-5">
          Need help?{' '}
          <a
            href="https://wa.me/250790663921"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 font-semibold hover:underline"
          >
            WhatsApp +250 790 663 921
          </a>
        </p>
      </div>
    </div>
  );
}
