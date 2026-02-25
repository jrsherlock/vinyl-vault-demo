'use client';

import { useState, useEffect } from 'react';
import { Lock, ArrowRight, ArrowLeft, Loader2, Mail, RefreshCw } from 'lucide-react';
import { telemetry } from '@/lib/telemetry';
import { supabase } from '@/lib/supabase/client';

interface LeadGateFormProps {
  onComplete: () => void;
}

export default function LeadGateForm({ onComplete }: LeadGateFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');

  const [step, setStep] = useState<'form' | 'verifying'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const sendOtp = async () => {
    setError('');
    setIsLoading(true);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      });

      if (otpError) {
        if (otpError.status === 429 || otpError.message?.includes('rate')) {
          setError('Too many attempts. Please wait a few minutes.');
        } else {
          setError(otpError.message || 'Unable to send verification code.');
        }
        return;
      }

      setStep('verifying');
      setResendCooldown(60);
    } catch {
      setError('Unable to send verification code. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email');
      return;
    }
    sendOtp();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode.trim(),
        type: 'email',
      });

      if (verifyError) {
        setError('Code expired or incorrect. Please request a new one.');
        setIsLoading(false);
        return;
      }

      // Store the verified lead — don't block the player if this fails
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            name: name.trim(),
            company: company.trim() || undefined,
            role: role || undefined,
          }),
        });
      } catch (leadErr) {
        console.error('Failed to store lead (non-blocking):', leadErr);
      }

      telemetry.gateCompleted({
        email: email.trim(),
        company: company.trim() || undefined,
        role: role || undefined,
      });

      onComplete();
    } catch {
      setError('Verification failed. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setOtpCode('');
    setError('');
    sendOtp();
  };

  const handleBack = () => {
    setStep('form');
    setOtpCode('');
    setError('');
  };

  // ─── Step 2: Code Entry ────────────────────────────────────────────────
  if (step === 'verifying') {
    return (
      <div className="p-6 animate-in fade-in duration-500">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-purple-100">
            <Mail className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Check your email
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
            We sent a 6-digit code to{' '}
            <span className="font-medium text-slate-700">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-3">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            value={otpCode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              setOtpCode(val);
              setError('');
            }}
            disabled={isLoading}
            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-2xl text-center font-mono text-slate-900 tracking-[0.5em] placeholder:text-slate-300 placeholder:tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 disabled:opacity-50"
            autoFocus
          />

          {error && (
            <p className="text-xs text-red-500 font-medium text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || otpCode.length < 6}
            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify & Unlock
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handleBack}
            disabled={isLoading}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            <ArrowLeft className="h-3 w-3" />
            Different email
          </button>

          <button
            onClick={handleResend}
            disabled={isLoading || resendCooldown > 0}
            className="text-xs text-purple-500 hover:text-purple-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="h-3 w-3" />
            {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend code'}
          </button>
        </div>

        <p className="text-[10px] text-slate-400 text-center mt-4">
          Provided by ProCircular — we help companies deploy AI safely.
        </p>
      </div>
    );
  }

  // ─── Step 1: Info Collection ───────────────────────────────────────────
  return (
    <div className="p-6 animate-in fade-in duration-500">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-purple-100">
          <Lock className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          You cracked the basics!
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
          Levels 3-6 feature advanced AI defenses. Verify your email to unlock the full challenge.
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Your name *"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 disabled:opacity-50"
        />
        <input
          type="email"
          placeholder="Email address *"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 disabled:opacity-50"
        />
        <input
          type="text"
          placeholder="Company (optional)"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 disabled:opacity-50"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 disabled:opacity-50"
        >
          <option value="">Role (optional)</option>
          <option value="Executive">Executive</option>
          <option value="IT/Security">IT / Security</option>
          <option value="Developer">Developer</option>
          <option value="Other">Other</option>
        </select>

        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending code...
            </>
          ) : (
            <>
              Send Verification Code
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-[10px] text-slate-400 text-center mt-4">
        Provided by ProCircular — we help companies deploy AI safely.
      </p>
    </div>
  );
}
