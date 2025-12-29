import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Lock, Mail, Chrome, ScanFace } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login();
      navigate('/');
    }, 1000);
  };

  const handleBiometricLogin = () => {
    setBiometricLoading(true);
    // Simulate hardware biometric authentication delay
    setTimeout(() => {
      login();
      navigate('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-center px-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-brand-primary/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-brand-accent/20 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-400">Sign in to manage your portfolio</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                type="email" 
                placeholder="name@example.com" 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <a href="#" className="text-sm text-brand-primary hover:text-blue-400">Forgot Password?</a>
          </div>

          <Button type="submit" fullWidth disabled={loading || biometricLoading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-brand-dark text-slate-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleLogin} 
              className="flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
              disabled={loading || biometricLoading}
            >
              <Chrome size={20} />
              Google
            </Button>
            
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleBiometricLogin} 
              className="flex items-center justify-center gap-2 border border-brand-primary/30 bg-brand-primary/5 hover:bg-brand-primary/20 hover:border-brand-primary text-brand-primary transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              disabled={loading || biometricLoading}
            >
              <ScanFace size={20} className={biometricLoading ? "animate-pulse" : ""} />
              {biometricLoading ? 'Scanning...' : 'Face ID'}
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-slate-400 text-sm">
          Don't have an account? <Link to="/register" className="text-brand-primary font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};