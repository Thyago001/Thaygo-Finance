/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Terminal, ShieldCheck, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';

export default function Register({ onRegister, onSwitchToLogin }: { onRegister: () => void, onSwitchToLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black grid-bg relative p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md border border-outline-variant bg-black p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-2 text-[10px] font-mono text-outline-variant">INIT_SEQUENCE_v1.0.4</div>
        
        <div className="flex items-center gap-3 mb-8">
          <UserPlus className="text-secondary" size={32} />
          <h1 className="text-2xl font-bold font-mono tracking-tighter text-secondary">REGISTER_IDENTITY</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-outline tracking-widest block">IDENTIFIER</label>
            <div className="flex items-center border-b border-outline-variant focus-within:border-secondary transition-colors pb-2 gap-3 group">
              <span className="text-outline group-focus-within:text-secondary font-mono text-sm">@</span>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="choose_nickname"
                className="bg-transparent border-none outline-none w-full text-on-surface font-mono text-sm placeholder:text-outline-variant focus:ring-0 p-0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-outline tracking-widest block">SECURE_EMAIL</label>
            <div className="flex items-center border-b border-outline-variant focus-within:border-secondary transition-colors pb-2 gap-3 group">
              <ShieldCheck size={18} className="text-outline group-focus-within:text-secondary" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="verify@identity.sys"
                className="bg-transparent border-none outline-none w-full text-on-surface font-mono text-sm placeholder:text-outline-variant focus:ring-0 p-0"
                required
              />
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <button 
              type="submit"
              className="w-full bg-secondary text-black font-mono font-bold py-3 hover:glow-secondary transition-all active:scale-[0.98] uppercase tracking-widest"
            >
              COMMIT_IDENTITY
            </button>
            <button 
              type="button"
              onClick={onSwitchToLogin}
              className="w-full border border-outline-variant text-outline font-mono text-xs py-2 hover:border-on-surface hover:text-on-surface transition-all uppercase tracking-widest"
            >
              RETURN_TO_LOGIN
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-outline-variant flex justify-between text-[10px] font-mono text-outline-variant uppercase">
          <span>ENCRYPTION: AES-256</span>
          <span>INTEGRITY: VERIFIED</span>
        </div>
      </motion.div>
    </div>
  );
}
