/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Terminal, Lock, User } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login({ onLogin, onSwitchToRegister }: { onLogin: (user: any) => void, onSwitchToRegister: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pre-calculated hash for "root" authentication feel
    onLogin({ email, name: email.split('@')[0], avatar: 'Felix' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black grid-bg relative p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md border border-outline-variant bg-black p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-2 text-[10px] font-mono text-outline-variant">AUTH_SEQUENCE_v1.0.4</div>
        
        <div className="flex items-center gap-3 mb-8">
          <Terminal className="text-primary" size={32} />
          <h1 className="text-2xl font-bold font-mono tracking-tighter text-primary">THAYGO_FINANCE</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-outline tracking-widest block">USER_EMAIL</label>
            <div className="flex items-center border-b border-outline-variant focus-within:border-primary transition-colors pb-2 gap-3 group">
              <User size={18} className="text-outline group-focus-within:text-primary" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter@identity.sys"
                className="bg-transparent border-none outline-none w-full text-on-surface font-mono text-sm placeholder:text-outline-variant focus:ring-0 p-0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-outline tracking-widest block">ACCESS_KEY</label>
            <div className="flex items-center border-b border-outline-variant focus-within:border-primary transition-colors pb-2 gap-3 group">
              <Lock size={18} className="text-outline group-focus-within:text-primary" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent border-none outline-none w-full text-on-surface font-mono text-sm placeholder:text-outline-variant focus:ring-0 p-0"
                required
              />
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <button 
              type="submit"
              className="w-full bg-primary text-black font-mono font-bold py-3 hover:glow-primary transition-all active:scale-[0.98] uppercase tracking-widest"
            >
              ESTABLISH_CONNECTION
            </button>
            <button 
              type="button"
              onClick={onSwitchToRegister}
              className="w-full border border-outline-variant text-outline font-mono text-xs py-2 hover:border-on-surface hover:text-on-surface transition-all uppercase tracking-widest"
            >
              INITIALIZE_NEW_IDENTITY
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-outline-variant flex justify-between text-[10px] font-mono text-outline-variant uppercase">
          <span>SECURE_IO: ACTIVE</span>
          <span>LATENCY: 12ms</span>
        </div>
      </motion.div>
    </div>
  );
}
