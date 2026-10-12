import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Reset Password</h2>
        <p className="text-xs text-slate-400 mt-1">
          Enter your registered email and we&apos;ll send you instructions to reset your password.
        </p>
      </div>

      {submitted ? (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">Reset Link Sent (Demo)</h3>
          <p className="text-xs text-slate-300">
            If an account exists for <span className="text-emerald-400">{email}</span>, a demo password reset link has been dispatched.
          </p>
          <Link
            to="/login"
            className="inline-block mt-2 py-2 px-4 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
          >
            Return to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.in"
                className="w-full bg-[#0B0F17] text-slate-200 text-sm rounded-xl pl-9 pr-4 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all"
          >
            Send Reset Link
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
