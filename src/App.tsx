/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutGrid, 
  Wallet, 
  Rocket, 
  Terminal as TerminalIcon, 
  Settings as SettingsIcon, 
  LogOut, 
  Plus, 
  Bell, 
  CircleUser,
  Search,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from './lib/storage';
import { View, Transaction, UserProfile } from './types';

// Views
import Dashboard from './views/Dashboard';
import Budget from './views/Budget';
import Savings from './views/Savings';
import LearningHub from './views/LearningHub';
import Login from './views/Login';
import Register from './views/Register';
import Settings from './views/Settings';
import { useTranslation } from './lib/i18n';

// ─── Global Transaction Modal ───────────────────────────────────────────────
function TransactionModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const { t } = useTranslation();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    const tx: Transaction = {
      id: Date.now().toString(),
      type,
      amount: val,
      description: description || (type === 'income' ? 'Receita' : 'Despesa'),
      category: category || 'geral',
      timestamp: Date.now()
    };
    storage.saveTransaction(tx);
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-black border border-outline-variant z-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="border-b border-outline-variant p-4 bg-surface-container flex justify-between items-center">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">
            {type === 'income' ? '+ NOVA_RECEITA' : '- NOVA_DESPESA'}
          </span>
          <button onClick={onClose} className="text-outline hover:text-on-surface transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Type selector */}
        <div className="flex border-b border-outline-variant">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-mono text-xs font-bold uppercase transition-all ${
              type === 'income' ? 'bg-secondary/10 text-secondary border-b-2 border-secondary' : 'text-outline hover:text-on-surface'
            }`}
          >
            <ArrowUpCircle size={14} /> RECEITA
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-mono text-xs font-bold uppercase transition-all ${
              type === 'expense' ? 'bg-error/10 text-error border-b-2 border-error' : 'text-outline hover:text-on-surface'
            }`}
          >
            <ArrowDownCircle size={14} /> DESPESA
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="relative">
            <label className="absolute -top-2.5 left-2 bg-black px-1 text-[10px] text-outline font-mono uppercase">
              VALOR (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0,00"
              required
              className="w-full bg-transparent border-b border-outline-variant focus:border-primary transition-colors focus:ring-0 font-mono text-2xl py-2 px-1 text-on-surface"
            />
          </div>
          <div className="relative">
            <label className="absolute -top-2.5 left-2 bg-black px-1 text-[10px] text-outline font-mono uppercase">
              DESCRIÇÃO
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Almoço, Salário..."
              className="w-full bg-transparent border-b border-outline-variant focus:border-primary transition-colors focus:ring-0 font-mono text-sm py-2 px-1"
            />
          </div>
          <div className="relative">
            <label className="absolute -top-2.5 left-2 bg-black px-1 text-[10px] text-outline font-mono uppercase">
              CATEGORIA
            </label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="Ex: alimentação, salário..."
              className="w-full bg-transparent border-b border-outline-variant focus:border-primary transition-colors focus:ring-0 font-mono text-sm py-2 px-1"
            />
          </div>
          <button
            type="submit"
            className={`w-full py-3 font-mono font-bold text-sm uppercase tracking-widest transition-all ${
              type === 'income'
                ? 'bg-secondary text-black hover:bg-secondary/90'
                : 'bg-error text-black hover:bg-error/90'
            }`}
          >
            {type === 'income' ? 'REGISTRAR RECEITA' : 'REGISTRAR DESPESA'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(storage.getUser());
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { t } = useTranslation();

  // Sync auth state
  const handleLogin = (userData: UserProfile) => {
    storage.setUser(userData);
    setUser(userData);
  };

  const handleLogout = () => {
    storage.logout();
    setUser(null);
  };

  const handleTransactionSaved = useCallback(() => {
    setRefreshKey(k => k + 1);
    // Reload user to pick up any changes
    setUser(storage.getUser());
  }, []);

  // Keep user in sync with storage (for avatar/name updates)
  useEffect(() => {
    setUser(storage.getUser());
  }, [currentView]);

  if (!user) {
    return isRegistering ? (
      <Register onRegister={() => setIsRegistering(false)} onSwitchToLogin={() => setIsRegistering(false)} />
    ) : (
      <Login onLogin={handleLogin} onSwitchToRegister={() => setIsRegistering(true)} />
    );
  }

  const avatarSrc = user.avatarCustom && user.avatar
    ? user.avatar
    : `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.avatar || user.name || 'Felix'}`;

  const displayName = user.name?.toUpperCase().replace(/\s+/g, '_') || 'FIN_ARCHITECT';

  const renderView = () => {
    // key is a special React prop handled by createElement, not in Props types
    const DashboardAny = Dashboard as any;
    const BudgetAny = Budget as any;
    switch (currentView) {
      case 'DASHBOARD': return <DashboardAny key={refreshKey} onTransactionChange={handleTransactionSaved} />;
      case 'BUDGET': return <BudgetAny key={refreshKey} onTransactionChange={handleTransactionSaved} />;
      case 'SAVINGS': return <Savings />;
      case 'LEARNING_HUB': return <LearningHub />;
      case 'SETTINGS': return <Settings onUserUpdate={() => setUser(storage.getUser())} />;
      default: return <DashboardAny key={refreshKey} onTransactionChange={handleTransactionSaved} />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-on-surface font-sans overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className={`hidden md:flex flex-col border-r border-outline-variant bg-black transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 border-b border-outline-variant flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-primary overflow-hidden flex-shrink-0">
            <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <div className="text-primary font-mono text-sm font-bold truncate">{displayName}</div>
              <div className="text-outline text-[10px] uppercase tracking-widest">THAYGO_FINANCE</div>
            </div>
          )}
        </div>

        <div className="p-4">
          <button
            onClick={() => setShowTransactionModal(true)}
            className={`w-full bg-primary text-black font-mono text-sm font-bold py-2.5 rounded-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 ${!isSidebarOpen && 'px-0'}`}
          >
            <Plus size={16} /> {isSidebarOpen && t('nav_new_transaction')}
          </button>
        </div>

        <nav className="flex-1 py-2 flex flex-col gap-1 px-2">
          <NavItem icon={<LayoutGrid size={20} />} label={t('nav_dashboard')} active={currentView === 'DASHBOARD'} onClick={() => setCurrentView('DASHBOARD')} collapsed={!isSidebarOpen} />
          <NavItem icon={<Wallet size={20} />} label={t('nav_budget')} active={currentView === 'BUDGET'} onClick={() => setCurrentView('BUDGET')} collapsed={!isSidebarOpen} />
          <NavItem icon={<Rocket size={20} />} label={t('nav_savings')} active={currentView === 'SAVINGS'} onClick={() => setCurrentView('SAVINGS')} collapsed={!isSidebarOpen} />
          <NavItem icon={<TerminalIcon size={20} />} label={t('nav_learning')} active={currentView === 'LEARNING_HUB'} onClick={() => setCurrentView('LEARNING_HUB')} collapsed={!isSidebarOpen} />
        </nav>

        <div className="border-t border-outline-variant py-2 px-2">
          <NavItem icon={<SettingsIcon size={20} />} label={t('nav_settings')} active={currentView === 'SETTINGS'} onClick={() => setCurrentView('SETTINGS')} collapsed={!isSidebarOpen} />
          <NavItem icon={<LogOut size={20} />} label={t('nav_logout')} onClick={handleLogout} collapsed={!isSidebarOpen} />
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-outline hover:text-primary transition-colors flex justify-center border-t border-outline-variant"
        >
          {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-outline-variant flex items-center justify-between px-6 bg-black z-20">
          <div className="flex items-center gap-4">
            <div className="md:hidden text-primary font-mono font-bold text-sm">TF</div>
            <div className="hidden md:flex items-center border-b border-outline-variant gap-2 pb-1 focus-within:border-primary transition-colors group">
              <Search size={14} className="text-outline group-focus-within:text-primary" />
              <input 
                type="text" 
                placeholder={t('search_placeholder')} 
                className="bg-transparent border-none outline-none text-sm font-mono placeholder:text-outline-variant focus:ring-0 p-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-outline">
            <button 
              onClick={() => setShowTransactionModal(true)}
              className="md:hidden hover:text-primary transition-colors"
            >
              <Plus size={18} />
            </button>
            <button className="hover:text-primary transition-colors"><Bell size={18} /></button>
            <button 
              className="hover:text-primary transition-colors"
              onClick={() => setCurrentView('SETTINGS')}
            >
              <CircleUser size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 grid-bg relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-black border-t border-outline-variant flex justify-around items-center px-2 z-50">
          <MobileNavItem icon={<LayoutGrid size={24} />} label={t('nav_dashboard')} active={currentView === 'DASHBOARD'} onClick={() => setCurrentView('DASHBOARD')} />
          <MobileNavItem icon={<Wallet size={24} />} label={t('nav_budget')} active={currentView === 'BUDGET'} onClick={() => setCurrentView('BUDGET')} />
          <MobileNavItem icon={<Rocket size={24} />} label={t('nav_savings')} active={currentView === 'SAVINGS'} onClick={() => setCurrentView('SAVINGS')} />
          <MobileNavItem icon={<TerminalIcon size={24} />} label={t('nav_learning')} active={currentView === 'LEARNING_HUB'} onClick={() => setCurrentView('LEARNING_HUB')} />
        </nav>
      </div>

      {/* Global Transaction Modal */}
      <AnimatePresence>
        {showTransactionModal && (
          <TransactionModal
            onClose={() => setShowTransactionModal(false)}
            onSave={handleTransactionSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, collapsed }: { icon: any, label: string, active?: boolean, onClick: () => void, collapsed?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2.5 transition-all font-sans text-sm rounded-md relative mx-1
        ${active ? 'bg-surface-container text-primary font-medium' : 'text-outline hover:bg-surface-container/50 hover:text-on-surface'}
        ${collapsed ? 'justify-center mx-0 px-0' : ''}
      `}
    >
      <span className={active ? 'text-primary' : 'text-outline'}>{icon}</span>
      {!collapsed && <span>{label}</span>}
    </button>
  );
}

function MobileNavItem({ icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-1/4 h-full gap-1 transition-all ${active ? 'text-primary' : 'text-outline'}`}
    >
      <div className={`transition-all ${active ? 'scale-110' : ''}`}>{icon}</div>
      <span className="text-[10px] font-mono font-bold uppercase">{label}</span>
      {active && <div className="absolute top-0 w-8 h-1 bg-primary rounded-full" />}
    </button>
  );
}
