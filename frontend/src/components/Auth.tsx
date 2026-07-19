import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Mail, 
  User, 
  Shield, 
  ArrowRight, 
  Sparkles, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Building2,
  CheckCircle2,
  Globe
} from 'lucide-react';

export interface UserSession {
  username: string;
  email: string;
  fullName: string;
}

interface AuthProps {
  onLoginSuccess: (session: UserSession) => void;
}

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Sign In inputs
  const [signInIdentifier, setSignInIdentifier] = useState(''); // can be username or email
  const [signInPassword, setSignInPassword] = useState('');
  
  // Sign Up inputs
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Default demo accounts seeded in localStorage if empty
  const getRegisteredUsers = () => {
    const saved = localStorage.getItem('NEXUS_REGISTERED_USERS');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    // Seed default admin account
    const defaultUsers = {
      'admin': {
        username: 'admin',
        email: 'admin@nexus.ai',
        fullName: 'Alex Karev',
        password: 'admin'
      }
    };
    localStorage.setItem('NEXUS_REGISTERED_USERS', JSON.stringify(defaultUsers));
    return defaultUsers;
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!signInIdentifier.trim() || !signInPassword) {
      setError('Please provide your username/email and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const users = getRegisteredUsers();
      const identifier = signInIdentifier.trim().toLowerCase();
      
      // Find user by username or email
      let matchedUser: any = null;
      for (const key of Object.keys(users)) {
        const u = users[key];
        if (u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier) {
          matchedUser = u;
          break;
        }
      }

      if (matchedUser && matchedUser.password === signInPassword) {
        // Log in
        const session: UserSession = {
          username: matchedUser.username,
          email: matchedUser.email,
          fullName: matchedUser.fullName
        };
        localStorage.setItem('NEXUS_CURRENT_USER', JSON.stringify(session));
        setSuccess('Authentication successful! Initializing sandbox workspace...');
        
        setTimeout(() => {
          onLoginSuccess(session);
        }, 800);
      } else {
        setError('Invalid credentials. If you are new, please Sign Up or use the quick access.');
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!signUpFullName.trim() || !signUpUsername.trim() || !signUpEmail.trim() || !signUpPassword || !signUpConfirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (signUpUsername.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    if (!signUpEmail.includes('@') || !signUpEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (signUpPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const users = getRegisteredUsers();
      const newUsername = signUpUsername.trim().toLowerCase();
      const newEmail = signUpEmail.trim().toLowerCase();

      // Check if username already exists
      if (users[newUsername]) {
        setError('Username is already taken.');
        setIsLoading(false);
        return;
      }

      // Check if email already exists
      for (const key of Object.keys(users)) {
        if (users[key].email.toLowerCase() === newEmail) {
          setError('Email address is already registered.');
          setIsLoading(false);
          return;
        }
      }

      // Add new user
      const newUser = {
        username: signUpUsername.trim(),
        email: signUpEmail.trim(),
        fullName: signUpFullName.trim(),
        password: signUpPassword
      };

      users[newUsername] = newUser;
      localStorage.setItem('NEXUS_REGISTERED_USERS', JSON.stringify(users));
      
      setSuccess('Account created successfully! Logging you in...');
      
      const session: UserSession = {
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName
      };
      
      localStorage.setItem('NEXUS_CURRENT_USER', JSON.stringify(session));

      setTimeout(() => {
        onLoginSuccess(session);
      }, 1000);
    }, 1200);
  };

  const handleQuickAccess = (role: 'admin' | 'guest') => {
    setError(null);
    setIsLoading(true);
    
    setTimeout(() => {
      let session: UserSession;
      if (role === 'admin') {
        session = {
          username: 'admin',
          email: 'admin@nexus.ai',
          fullName: 'Alex Karev'
        };
      } else {
        session = {
          username: 'guest_user',
          email: 'guest@enterprise.io',
          fullName: 'Guest Member'
        };
      }
      
      localStorage.setItem('NEXUS_CURRENT_USER', JSON.stringify(session));
      setSuccess(`Signing in as ${session.fullName}...`);
      
      setTimeout(() => {
        onLoginSuccess(session);
      }, 600);
    }, 400);
  };

  return (
    <div id="auth-container" className="grid grid-cols-1 lg:grid-cols-12 min-h-screen w-screen bg-[#F8FAFC]">
      
      {/* LEFT PANE - Clean form controls (5 columns) */}
      <div className="col-span-1 lg:col-span-5 flex flex-col justify-between p-8 sm:p-12 md:p-16 h-full min-h-screen bg-white z-10 shadow-lg lg:shadow-none">
        
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 select-none">
          <img src="/logo.png" alt="NexusAI Logo" className="h-10 w-auto object-contain" />
        </div>

        {/* Center Form Section */}
        <div className="my-auto py-12 max-w-[380px] w-full mx-auto space-y-7">
          <div className="space-y-1">
            <h2 className="font-sans font-extrabold text-2xl text-slate-800 tracking-tight">
              {isSignUp ? 'Create your account' : 'Log in to your account'}
            </h2>
            <p className="font-sans text-xs font-semibold text-slate-400">
              {isSignUp ? 'Please enter your details to sign up' : 'Please enter your details'}
            </p>
          </div>

          {/* Feedback states */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span className="font-medium">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login/Signup Dynamic Form */}
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {isSignUp ? (
              /* SIGN UP FLOW */
              <div className="space-y-3.5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="font-sans text-xs font-bold text-slate-700 block">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Enter your full name"
                      value={signUpFullName}
                      onChange={(e) => setSignUpFullName(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-lg text-sm text-slate-800 placeholder-slate-400 bg-transparent transition-all font-sans outline-none"
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="font-sans text-xs font-bold text-slate-700 block">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Choose a username"
                      value={signUpUsername}
                      onChange={(e) => setSignUpUsername(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-lg text-sm text-slate-800 placeholder-slate-400 bg-transparent transition-all font-sans outline-none"
                    />
                  </div>
                </div>

                {/* Work Email */}
                <div className="space-y-1.5">
                  <label className="font-sans text-xs font-bold text-slate-700 block">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input 
                      type="email" 
                      placeholder="Enter your email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-lg text-sm text-slate-800 placeholder-slate-400 bg-transparent transition-all font-sans outline-none"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="font-sans text-xs font-bold text-slate-700 block">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Create a password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-lg text-sm text-slate-800 placeholder-slate-400 bg-transparent transition-all font-mono outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="font-sans text-xs font-bold text-slate-700 block">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Shield className="w-4 h-4" />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Confirm your password"
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-lg text-sm text-slate-800 placeholder-slate-400 bg-transparent transition-all font-mono outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* SIGN IN FLOW */
              <div className="space-y-4">
                {/* Identifier */}
                <div className="space-y-1.5">
                  <label className="font-sans text-xs font-bold text-slate-700 block">Email or Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Enter your email or username"
                      value={signInIdentifier}
                      onChange={(e) => setSignInIdentifier(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-lg text-sm text-slate-800 placeholder-slate-400 bg-transparent transition-all font-sans outline-none"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="font-sans text-xs font-bold text-slate-700 block">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-lg text-sm text-slate-800 placeholder-slate-400 bg-transparent transition-all font-mono outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember/Forgot Section */}
                <div className="flex items-center justify-between text-xs font-sans mt-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="remember" 
                      className="w-4 h-4 text-blue-600 border-slate-200 rounded focus:ring-blue-500 cursor-pointer" 
                    />
                    <label htmlFor="remember" className="text-slate-500 font-semibold select-none cursor-pointer">
                      Remember for 30 days
                    </label>
                  </div>
                  <button 
                    type="button" 
                    className="text-blue-600 hover:text-blue-700 font-bold transition-colors cursor-pointer"
                  >
                    Forgot password
                  </button>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-75 text-white font-sans text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Register Account' : 'Log In'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* OR separator */}
          <div className="relative text-center select-none py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <span className="relative bg-white px-3 text-slate-400 text-[10px] font-bold font-sans tracking-wide uppercase">
              OR
            </span>
          </div>

          {/* Sandbox Demo Entries (SmartCard design match) */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickAccess('admin')}
              disabled={isLoading}
              className="w-full border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/10 text-slate-700 hover:text-blue-600 py-2.5 px-4 rounded-lg transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Log in with Admin Sandbox</span>
            </button>
            
            <button
              type="button"
              onClick={() => handleQuickAccess('guest')}
              disabled={isLoading}
              className="w-full border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/10 text-slate-700 hover:text-blue-600 py-2.5 px-4 rounded-lg transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4 text-violet-500" />
              <span>Log in with Guest Sandbox</span>
            </button>
          </div>

          {/* Flow toggle footer link */}
          <p className="text-center text-xs font-sans text-slate-500 pt-2">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
              }}
              className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all cursor-pointer"
            >
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Footer Terms Agreement */}
        <p className="text-[11px] font-sans text-slate-400 text-center leading-relaxed max-w-[320px] mx-auto mt-4">
          By creating an account, you agree to our <a href="#" className="text-slate-500 hover:text-blue-600 font-bold hover:underline transition-colors">Terms of Use</a> and acknowledge the privacy guidelines.
        </p>
      </div>

      {/* RIGHT PANE - Vibrant Showcase (7 columns) */}
      <div className="col-span-1 lg:col-span-7 bg-gradient-to-br from-[#0B409C] via-[#0D55C8] to-[#1266F1] p-12 lg:p-16 text-white relative overflow-hidden flex-col justify-between hidden lg:flex select-none">
        
        {/* Blurry circular background elements */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none -ml-20 -mb-20" />

        {/* Top Header Removed */}

        {/* Strategic Headline & 3D CSS Tablet Showcase */}
        <div className="my-auto max-w-xl space-y-6 z-10">
          <div className="space-y-3">
            <h1 className="font-sans text-4xl font-extrabold text-white leading-tight tracking-tight">
              Empowering secure enterprise intelligence.
            </h1>
            <p className="text-white/80 font-sans text-sm leading-relaxed max-w-md">
              Ingest regulatory files, index sparse vector indices, and execute highly grounded multi-agent RAG reasoning in a secure workspace sandbox.
            </p>
          </div>

          {/* Interactive 3D Mockup Container */}
          <div 
            className="relative mt-8 pt-4 transition-all duration-700 hover:scale-[1.015]"
            style={{
              perspective: '1200px',
            }}
          >
            {/* Tablet Chassis */}
            <div 
              className="w-full max-w-[490px] aspect-[4/3] bg-slate-950 border-[10px] border-slate-900 rounded-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden relative border-t-[14px] border-b-[14px]"
              style={{
                transform: 'rotateX(13deg) rotateY(-18deg) rotateZ(6deg)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Inner Tablet Screen */}
              <div className="w-full h-full bg-slate-50 flex text-slate-800 font-sans text-[9px] leading-normal select-none">
                
                {/* Tablet Sidebar */}
                <div className="w-1/4 bg-[#0a0e16] text-slate-400 p-2.5 flex flex-col justify-between border-r border-slate-800">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 px-1 pb-2 border-b border-white/5">
                      <div className="w-3.5 h-3.5 rounded bg-blue-500/20 flex items-center justify-center">
                        <Sparkles className="w-2 h-2 text-blue-400" />
                      </div>
                      <span className="font-bold text-[9px] text-white">NexusAI</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 p-1 rounded bg-white/5 text-white font-semibold">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span>Dashboard</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-1 rounded hover:bg-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                        <span>AI Chat</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-1 rounded hover:bg-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                        <span>Knowledge</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-[7px] text-slate-600 font-mono">v0.2.0 Sandbox</div>
                </div>
                
                {/* Tablet Content Viewport */}
                <div className="flex-1 bg-[#F8FAFC] p-3 flex flex-col overflow-hidden">
                  {/* Top bar inside mockup */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-800 text-[10px]">Active Workspace</h3>
                      <p className="text-[7.5px] text-slate-400 leading-none">Alex Karev · Admin</p>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[7px] font-bold font-mono">HEALTHY</span>
                  </div>
                  
                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-white border border-slate-100 p-2 rounded-lg shadow-2xs">
                      <span className="text-[7.5px] text-slate-400 font-medium block">Ingested Source Files</span>
                      <span className="text-[12px] font-bold text-slate-800 block mt-0.5">14 PDFs</span>
                    </div>
                    <div className="bg-white border border-slate-100 p-2 rounded-lg shadow-2xs">
                      <span className="text-[7.5px] text-slate-400 font-medium block">Grounding Index</span>
                      <span className="text-[12px] font-bold text-slate-800 block mt-0.5">98.4% Accuracy</span>
                    </div>
                  </div>
                  
                  {/* Mock Ingested List Table */}
                  <div className="mt-2.5 flex-1 bg-white border border-slate-100 rounded-lg p-2 flex flex-col justify-between overflow-hidden shadow-2xs">
                    <span className="text-[7px] text-slate-400 font-semibold block uppercase tracking-wider mb-1">Grounded Collections</span>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
                        <span className="font-semibold text-slate-700 truncate max-w-[80px]">soc2-compliance.pdf</span>
                        <span className="text-[7px] text-slate-400">Security</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5 border-b border-slate-50">
                        <span className="font-semibold text-slate-700 truncate max-w-[80px]">q4-revenue-audit.pdf</span>
                        <span className="text-[7px] text-slate-400">Finance</span>
                      </div>
                      <div className="flex items-center justify-between py-0.5">
                        <span className="font-semibold text-slate-700 truncate max-w-[80px]">operational-runbook.pdf</span>
                        <span className="text-[7px] text-slate-400">Ops</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tablet Realistic Shadow Element */}
            <div 
              className="absolute -bottom-8 left-12 right-12 h-6 bg-slate-950/40 blur-xl rounded-full"
              style={{
                transform: 'rotateX(13deg) rotateY(-18deg) rotateZ(6deg) translateZ(-20px)',
              }}
            />
          </div>
        </div>

        {/* Footer Details */}
        <div className="flex items-center justify-between text-xs text-white/40 font-mono z-10 pt-4">
          <div className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" />
            <span>Multi-Agent Sync</span>
          </div>
          <span>v0.2.0 Foundation</span>
        </div>
      </div>

    </div>
  );
}
