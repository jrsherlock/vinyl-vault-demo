'use client';

import { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { telemetry } from '@/lib/telemetry';

interface LeadGateFormProps {
  onComplete: () => void;
}

export default function LeadGateForm({ onComplete }: LeadGateFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    telemetry.gateCompleted({
      email: email.trim(),
      company: company.trim() || undefined,
      role: role || undefined,
    });

    onComplete();
  };

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
          Levels 3-6 feature advanced AI defenses. Enter your info to unlock the full challenge.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Your name *"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300"
        />
        <input
          type="email"
          placeholder="Email address *"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300"
        />
        <input
          type="text"
          placeholder="Company (optional)"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300"
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
          className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
        >
          Unlock Advanced Levels
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <p className="text-[10px] text-slate-400 text-center mt-4">
        Provided by ProCircular — we help companies deploy AI safely.
      </p>
    </div>
  );
}
