import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import SEO from '@/components/SEO';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setError('This is a frontend-only login page. Authentication is not implemented. Please connect a backend to enable staff login.');
    }, 1200);
  };

  return (
    <>
      <SEO title="Staff Login | X Beauty" description="Staff login portal for X Beauty." />
      <section className="pt-32 pb-20 min-h-screen flex items-center">
        <div className="container-x max-w-md">
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-full bg-charcoal flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-accent-300" />
              </div>
              <h1 className="text-2xl font-serif font-medium">Staff Login</h1>
              <p className="text-sm text-neutral-500 mt-1">Sign in to the X Beauty staff portal</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg p-4 mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label className="label-field" htmlFor="email">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="email"
                    type="email"
                    className="input-field pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="staff@xbeauty.in"
                  />
                </div>
              </div>
              <div>
                <label className="label-field" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pl-10 pr-10"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-neutral-300 text-accent-600 focus:ring-accent-400"
                    checked={formData.remember}
                    onChange={(e) => setFormData((prev) => ({ ...prev, remember: e.target.checked }))}
                  />
                  <span className="text-sm text-neutral-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-accent-600 hover:text-accent-700">Forgot password?</a>
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-neutral-500 hover:text-accent-600 transition-colors">
                Back to home
              </Link>
            </div>

            <p className="text-xs text-neutral-400 text-center mt-6">
              This is a frontend-only login page. No authentication is performed. Connect a backend to enable secure staff access.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
