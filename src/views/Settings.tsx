/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Settings as SettingsIcon, Database, Languages, Plus, Trash2, ShieldAlert, User, Upload, DollarSign, Download, RotateCcw } from 'lucide-react';
import { storage } from '../lib/storage';
import { useTranslation } from '../lib/i18n';
import { LearningCard, UserProfile } from '../types';

interface SettingsProps {
  onUserUpdate?: () => void;
}

export default function Settings({ onUserUpdate }: SettingsProps) {
  const { t, lang, setLang } = useTranslation();
  const [cards, setCards] = useState<LearningCard[]>(storage.getLearningCards());
  const [newCard, setNewCard] = useState({ title: '', desc: '', tag: '' });
  const currentUser = storage.getUser();
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    currentUser?.avatarCustom ? currentUser?.avatar : undefined
  );
  const [initialBalance, setInitialBalance] = useState(
    storage.getSettings().initialBalance?.toString() || '0'
  );
  const [balanceSaved, setBalanceSaved] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  // ── Backup / Restore ─────────────────────────────────────────
  const handleExportBackup = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('fin_terminal'));
    const data: Record<string, any> = {};
    keys.forEach(k => {
      try { data[k] = JSON.parse(localStorage.getItem(k) || 'null'); } catch { data[k] = null; }
    });
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thaygo-finance-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
        setCards(storage.getLearningCards());
        alert('Backup restaurado com sucesso! Recarregue a página para ver todas as mudanças.');
      } catch {
        alert('Arquivo inválido. Selecione um backup válido do Thaygo Finance.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setAvatarPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    if (!currentUser) return;
    const updates: Partial<UserProfile> = { name: profileName };
    if (avatarPreview) {
      updates.avatar = avatarPreview;
      updates.avatarCustom = true;
    }
    storage.updateUser(updates);
    onUserUpdate?.();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleSaveBalance = () => {
    const val = parseFloat(initialBalance);
    storage.updateSettings({ initialBalance: isNaN(val) ? 0 : val });
    setBalanceSaved(true);
    setTimeout(() => setBalanceSaved(false), 2000);
  };

  const handleClearData = () => {
    if (confirm('Tem certeza? Isso vai apagar todas as transações, orçamentos e metas locais.')) {
      storage.clearAllData();
      setCards(storage.getLearningCards());
      alert('Dados limpos com sucesso.');
    }
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.title || !newCard.desc) return;
    const card: LearningCard = {
      id: Date.now().toString(),
      title: newCard.title.toUpperCase(),
      desc: newCard.desc,
      tag: newCard.tag.toUpperCase() || 'CONCEITO',
      status: 'ACTIVE',
      read: '5m'
    };
    storage.saveLearningCard(card);
    setCards(storage.getLearningCards());
    setNewCard({ title: '', desc: '', tag: '' });
  };

  const handleDeleteCard = (id: string) => {
    storage.deleteLearningCard(id);
    setCards(storage.getLearningCards());
  };

  const avatarSrc = avatarPreview ||
    `https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser?.avatar || currentUser?.name || 'Felix'}`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="border-b border-outline-variant pb-6">
        <h1 className="text-3xl font-bold text-primary font-mono tracking-tighter uppercase">{t('settings_title')}</h1>
        <p className="text-sm font-mono text-outline mt-2 opacity-80">{t('settings_subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-8">

          {/* Profile Section */}
          <section className="bg-black border border-outline-variant p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-outline-variant pb-4">
              <User className="text-primary" />
              <div>
                <h2 className="text-lg font-bold font-mono uppercase tracking-widest">Perfil</h2>
                <p className="text-xs text-outline font-mono">Edite seu nome e avatar</p>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-primary overflow-hidden bg-surface-container">
                  <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 bg-primary text-black rounded-full p-1.5 hover:bg-primary/80 transition-all"
                  title="Upload de avatar"
                >
                  <Upload size={12} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-mono text-outline uppercase block mb-2">NOME DE EXIBIÇÃO</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  placeholder="Seu nome..."
                  className="w-full bg-transparent border-b border-outline-variant focus:border-primary transition-colors focus:ring-0 font-mono text-sm py-2 px-1 text-on-surface"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className={`w-full py-2.5 font-mono text-xs font-bold uppercase tracking-widest transition-all border ${
                profileSaved
                  ? 'border-secondary text-secondary bg-secondary/10'
                  : 'border-primary text-primary hover:bg-primary/10'
              }`}
            >
              {profileSaved ? '✓ SALVO!' : 'SALVAR PERFIL'}
            </button>
          </section>

          {/* Initial Balance Section */}
          <section className="bg-black border border-outline-variant p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-outline-variant pb-4">
              <DollarSign className="text-tertiary" />
              <div>
                <h2 className="text-lg font-bold font-mono uppercase tracking-widest text-tertiary">Saldo Inicial</h2>
                <p className="text-xs text-outline font-mono">Define a base do seu saldo total no dashboard</p>
              </div>
            </div>

            <div className="relative mb-4">
              <label className="absolute -top-2.5 left-2 bg-black px-1 text-[10px] text-outline font-mono uppercase">SALDO BASE (R$)</label>
              <input
                type="number"
                step="0.01"
                value={initialBalance}
                onChange={e => setInitialBalance(e.target.value)}
                placeholder="0,00"
                className="w-full bg-transparent border-b border-outline-variant focus:border-primary transition-colors focus:ring-0 font-mono text-2xl py-2 px-1 text-on-surface"
              />
            </div>
            <p className="text-[10px] font-mono text-outline mb-4">
              Saldo Total = Saldo Base + Receitas − Despesas
            </p>

            <button
              onClick={handleSaveBalance}
              className={`w-full py-2.5 font-mono text-xs font-bold uppercase tracking-widest transition-all border ${
                balanceSaved
                  ? 'border-secondary text-secondary bg-secondary/10'
                  : 'border-tertiary text-tertiary hover:bg-tertiary/10'
              }`}
            >
              {balanceSaved ? '✓ SALDO ATUALIZADO!' : 'DEFINIR SALDO INICIAL'}
            </button>
          </section>

          {/* Language Section */}
          <section className="bg-black border border-outline-variant p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-outline-variant pb-4">
              <Languages className="text-primary" />
              <div>
                <h2 className="text-lg font-bold font-mono uppercase tracking-widest">{t('settings_lang')}</h2>
                <p className="text-xs text-outline font-mono">{t('settings_lang_desc')}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setLang('pt')}
                className={`flex-1 py-3 font-mono text-sm border transition-all ${lang === 'pt' ? 'bg-primary text-black border-primary font-bold' : 'border-outline-variant text-outline hover:border-primary'}`}
              >
                PORTUGUÊS (PT-BR)
              </button>
              <button
                onClick={() => setLang('en')}
                className={`flex-1 py-3 font-mono text-sm border transition-all ${lang === 'en' ? 'bg-primary text-black border-primary font-bold' : 'border-outline-variant text-outline hover:border-primary'}`}
              >
                ENGLISH (EN-US)
              </button>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-black border border-error/50 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-error/20 pb-4">
              <Database className="text-error" />
              <div>
                <h2 className="text-lg font-bold font-mono uppercase tracking-widest text-error">{t('settings_data')}</h2>
                <p className="text-xs text-error/70 font-mono">{t('settings_data_desc')}</p>
              </div>
            </div>

            {/* Backup / Restore */}
            <div className="space-y-3 mb-4">
              <p className="text-[10px] font-mono text-outline uppercase tracking-widest">Backup de dados</p>
              <button
                onClick={handleExportBackup}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-outline-variant text-on-surface hover:border-secondary hover:text-secondary transition-all font-mono text-sm uppercase"
              >
                <Download size={14} /> EXPORTAR BACKUP
              </button>
              <input ref={backupInputRef} type="file" accept=".json" className="hidden" onChange={handleImportBackup} />
              <button
                onClick={() => backupInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-outline-variant text-outline hover:border-primary hover:text-primary transition-all font-mono text-sm uppercase"
              >
                <RotateCcw size={14} /> RESTAURAR BACKUP
              </button>
            </div>

            <button
              onClick={handleClearData}
              className="w-full flex items-center justify-center gap-2 py-3 border border-error text-error hover:bg-error hover:text-black transition-all font-mono text-sm uppercase"
            >
              <ShieldAlert size={16} />
              {t('settings_clear_data')}
            </button>
          </section>
        </div>

        {/* RIGHT COLUMN — Learning Cards Management */}
        <section className="bg-black border border-outline-variant p-6 flex flex-col h-[700px]">
          <div className="flex items-center gap-3 mb-6 border-b border-outline-variant pb-4">
            <SettingsIcon className="text-secondary" />
            <div>
              <h2 className="text-lg font-bold font-mono uppercase tracking-widest">{t('settings_learning_cards')}</h2>
              <p className="text-xs text-outline font-mono">{t('settings_learning_cards_desc')}</p>
            </div>
          </div>

          <form onSubmit={handleAddCard} className="mb-6 space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder={t('settings_card_title')}
                value={newCard.title}
                onChange={e => setNewCard({ ...newCard, title: e.target.value })}
                className="flex-1 bg-surface-container border border-outline-variant p-2 text-sm font-mono focus:border-primary focus:ring-0 outline-none"
              />
              <input
                type="text"
                placeholder={t('settings_card_tag')}
                value={newCard.tag}
                onChange={e => setNewCard({ ...newCard, tag: e.target.value })}
                className="w-1/3 bg-surface-container border border-outline-variant p-2 text-sm font-mono focus:border-primary focus:ring-0 outline-none"
              />
            </div>
            <textarea
              placeholder={t('settings_card_desc')}
              value={newCard.desc}
              onChange={e => setNewCard({ ...newCard, desc: e.target.value })}
              className="w-full bg-surface-container border border-outline-variant p-2 text-sm font-mono h-20 resize-none focus:border-primary focus:ring-0 outline-none"
            />
            <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 bg-surface-container border border-outline-variant text-primary hover:border-primary transition-all font-mono text-sm uppercase">
              <Plus size={16} />
              {t('settings_add_card')}
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {cards.map(card => (
              <div key={card.id} className="border border-outline-variant p-3 bg-surface-container flex justify-between items-start group hover:border-primary/30 transition-all">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-primary font-bold font-mono text-sm">{card.title}</span>
                    <span className="text-[9px] bg-tertiary text-black px-1 font-mono font-bold">{card.tag}</span>
                  </div>
                  <p className="text-xs text-outline font-mono line-clamp-2">{card.desc}</p>
                </div>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  className="text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-all p-1 flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
