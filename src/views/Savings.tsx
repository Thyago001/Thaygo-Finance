/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { CheckCircle2, TrendingUp, Circle, Edit2, X, Save, Plus, Trash2, Image, ArrowDownCircle } from 'lucide-react';
import { storage } from '../lib/storage';
import { Goal, Milestone, Transaction } from '../types';
import { useTranslation } from '../lib/i18n';

function MilestoneItem({ label, status, t }: any) {
  return (
    <div className="flex items-center gap-4 text-sm font-mono border-b border-outline-variant/30 pb-3 last:border-0 last:pb-0">
      {status === 'ACHIEVED' ? (
        <CheckCircle2 size={16} className="text-secondary flex-shrink-0" />
      ) : status === 'IN_PROGRESS' ? (
        <TrendingUp size={16} className="text-primary flex-shrink-0" />
      ) : (
        <Circle size={16} className="text-outline-variant flex-shrink-0" />
      )}
      <span className={`flex-1 ${status === 'ACHIEVED' ? 'text-outline line-through' : 'text-on-surface'}`}>
        {label}
      </span>
      <span className={`text-[10px] font-bold flex-shrink-0 ${
        status === 'ACHIEVED' ? 'text-secondary' : 
        status === 'IN_PROGRESS' ? 'text-primary' : 'text-outline'
      }`}>
        [{status === 'ACHIEVED' ? t('savings_achieved') : status === 'IN_PROGRESS' ? t('savings_in_progress') : 'PENDING'}]
      </span>
    </div>
  );
}

export default function Savings() {
  const { t } = useTranslation();
  const [goals, setGoals] = useState<Goal[]>(storage.getGoals());
  const [activeGoalId, setActiveGoalId] = useState(goals[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeGoal = goals.find(g => g.id === activeGoalId) || goals[0];

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<Goal>>({});

  // New goal form
  const [newGoal, setNewGoal] = useState({ title: '', target: '', current: '', targetDate: '' });
  // Deposit state
  const [depositAmount, setDepositAmount] = useState('');
  const [depositSuccess, setDepositSuccess] = useState(false);
  // New milestone form
  const [newMilestone, setNewMilestone] = useState('');

  const startEdit = () => {
    setEditForm({ ...activeGoal });
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!editForm.title || !activeGoal) return;
    storage.updateGoal(activeGoal.id, editForm);
    setGoals(storage.getGoals());
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (isEditing) {
        setEditForm(prev => ({ ...prev, coverImage: dataUrl }));
      } else if (activeGoal) {
        storage.updateGoal(activeGoal.id, { coverImage: dataUrl });
        setGoals(storage.getGoals());
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddMilestone = () => {
    if (!newMilestone.trim() || !activeGoal) return;
    const milestone: Milestone = {
      id: `m_${Date.now()}`,
      label: newMilestone,
      status: 'PENDING'
    };
    const updatedMilestones = [...(editForm.milestones || activeGoal.milestones), milestone];
    setEditForm(prev => ({ ...prev, milestones: updatedMilestones }));
    setNewMilestone('');
  };

  const handleMilestoneStatus = (milestoneId: string, status: Milestone['status']) => {
    const milestones = (editForm.milestones || []).map(m =>
      m.id === milestoneId ? { ...m, status } : m
    );
    setEditForm(prev => ({ ...prev, milestones }));
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    const milestones = (editForm.milestones || []).filter(m => m.id !== milestoneId);
    setEditForm(prev => ({ ...prev, milestones }));
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.target) return;
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title.toUpperCase().replace(/\s+/g, '_'),
      target: parseFloat(newGoal.target),
      current: parseFloat(newGoal.current) || 0,
      targetDate: newGoal.targetDate || new Date().toISOString().split('T')[0],
      milestones: []
    };
    storage.addGoal(goal);
    const updated = storage.getGoals();
    setGoals(updated);
    setActiveGoalId(goal.id);
    setIsAddingGoal(false);
    setNewGoal({ title: '', target: '', current: '', targetDate: '' });
  };

  const handleDeleteGoal = (id: string) => {
    storage.deleteGoal(id);
    const updated = storage.getGoals();
    setGoals(updated);
    setActiveGoalId(updated[0]?.id || '');
  };

  if (!activeGoal && !isAddingGoal) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-outline font-mono">Nenhuma meta encontrada.</p>
        <button
          onClick={() => setIsAddingGoal(true)}
          className="border border-primary text-primary font-mono text-xs px-6 py-2 hover:bg-primary/10 transition-all flex items-center gap-2"
        >
          <Plus size={14} /> CRIAR NOVA META
        </button>
      </div>
    );
  }

  const currentPercent = activeGoal ? Math.min(((activeGoal.current / activeGoal.target) * 100), 100).toFixed(1) : '0';
  const remaining = activeGoal ? Math.max(activeGoal.target - activeGoal.current, 0) : 0;
  const today = new Date();
  const targetDate = activeGoal ? new Date(activeGoal.targetDate) : today;
  const daysRemaining = Math.max(Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)), 0);
  const monthlyRequired = daysRemaining > 0 ? Math.round(remaining / (daysRemaining / 30)) : 0;

  const coverImage = (isEditing ? editForm.coverImage : activeGoal?.coverImage) ||
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="border-b border-outline-variant pb-6 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary font-mono tracking-tighter uppercase">{t('savings_title')}</h1>
          <p className="text-sm font-mono text-outline mt-2 opacity-80">{t('savings_subtitle')}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Goal tabs */}
          {goals.map(g => (
            <button
              key={g.id}
              onClick={() => { setActiveGoalId(g.id); setIsEditing(false); }}
              className={`text-[10px] font-mono px-3 py-1.5 border transition-all ${
                g.id === activeGoalId
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-outline-variant text-outline hover:border-on-surface'
              }`}
            >
              {g.title.slice(0, 16)}{g.title.length > 16 ? '…' : ''}
            </button>
          ))}
          <button
            onClick={() => setIsAddingGoal(true)}
            className="text-[10px] font-mono px-3 py-1.5 border border-dashed border-outline-variant text-outline hover:border-primary hover:text-primary transition-all flex items-center gap-1"
          >
            <Plus size={10} /> NOVA
          </button>
        </div>
      </header>

      {/* New Goal Form */}
      {isAddingGoal && (
        <div className="border border-primary/40 bg-black p-6 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono font-bold uppercase text-primary tracking-widest">Nova_Meta.init</span>
            <button onClick={() => setIsAddingGoal(false)} className="text-outline hover:text-on-surface"><X size={16} /></button>
          </div>
          <form onSubmit={handleCreateGoal} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 relative">
              <label className="absolute -top-2.5 left-2 bg-black px-1 text-[10px] text-outline font-mono uppercase">TÍTULO</label>
              <input type="text" value={newGoal.title} onChange={e => setNewGoal(p => ({...p, title: e.target.value}))}
                placeholder="Tokyo Trip 2025" required
                className="w-full bg-transparent border-b border-outline-variant focus:border-primary transition-colors focus:ring-0 font-mono text-sm py-2 px-1" />
            </div>
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-black px-1 text-[10px] text-outline font-mono uppercase">META (R$)</label>
              <input type="number" step="0.01" value={newGoal.target} onChange={e => setNewGoal(p => ({...p, target: e.target.value}))}
                placeholder="5000" required
                className="w-full bg-transparent border-b border-outline-variant focus:border-primary transition-colors focus:ring-0 font-mono text-sm py-2 px-1" />
            </div>
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-black px-1 text-[10px] text-outline font-mono uppercase">JÁ ECONOMIZOU (R$)</label>
              <input type="number" step="0.01" value={newGoal.current} onChange={e => setNewGoal(p => ({...p, current: e.target.value}))}
                placeholder="0"
                className="w-full bg-transparent border-b border-outline-variant focus:border-primary transition-colors focus:ring-0 font-mono text-sm py-2 px-1" />
            </div>
            <div className="col-span-2 relative">
              <label className="absolute -top-2.5 left-2 bg-black px-1 text-[10px] text-outline font-mono uppercase">DATA ALVO</label>
              <input type="date" value={newGoal.targetDate} onChange={e => setNewGoal(p => ({...p, targetDate: e.target.value}))}
                className="w-full bg-transparent border-b border-outline-variant focus:border-primary transition-colors focus:ring-0 font-mono text-sm py-2 px-1 text-on-surface" />
            </div>
            <button type="submit"
              className="col-span-2 border border-primary text-primary font-mono text-xs py-3 hover:bg-primary/10 transition-all uppercase tracking-widest font-bold">
              CRIAR META
            </button>
          </form>
        </div>
      )}

      {activeGoal && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Progress Panel */}
          <div className="md:col-span-8 bg-black border border-outline-variant relative h-[360px] overflow-hidden group flex flex-col justify-end p-8">
            <div
              className="absolute inset-0 opacity-40 mix-blend-luminosity bg-cover bg-center grayscale group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-700"
              style={{ backgroundImage: `url(${coverImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

            {/* Image upload button */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-black/60 border border-outline-variant text-outline hover:text-primary hover:border-primary transition-all p-2 text-[10px] font-mono flex items-center gap-1"
                title="Alterar imagem de fundo"
              >
                <Image size={12} /> IMAGEM
              </button>
              {isEditing ? (
                <>
                  <button onClick={saveEdit} className="bg-secondary/20 border border-secondary text-secondary hover:bg-secondary/30 transition-all p-2 flex items-center gap-1 text-[10px] font-mono">
                    <Save size={12} /> SALVAR
                  </button>
                  <button onClick={cancelEdit} className="bg-black/60 border border-outline-variant text-outline hover:text-error transition-all p-2">
                    <X size={12} />
                  </button>
                </>
              ) : (
                <button onClick={startEdit} className="bg-black/60 border border-outline-variant text-outline hover:text-primary hover:border-primary transition-all p-2 text-[10px] font-mono flex items-center gap-1">
                  <Edit2 size={12} /> EDITAR
                </button>
              )}
              <button
                onClick={() => handleDeleteGoal(activeGoal.id)}
                className="bg-black/60 border border-outline-variant text-outline hover:text-error hover:border-error transition-all p-2"
                title="Excluir meta"
              >
                <Trash2 size={12} />
              </button>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-mono text-outline uppercase block mb-1">
                    {isEditing ? 'TÍTULO:' : activeGoal.title}
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.title || ''}
                      onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                      className="bg-transparent border-b border-primary text-white font-mono text-xl font-bold focus:ring-0 p-0 w-full"
                    />
                  ) : (
                    <div className="text-5xl font-bold text-white tracking-tighter font-mono">
                      R$ {activeGoal.current.toLocaleString('pt-BR')}
                      <span className="text-tertiary">,00</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-outline uppercase block mb-1">Meta:</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.target || ''}
                      onChange={e => setEditForm(p => ({ ...p, target: parseFloat(e.target.value) }))}
                      className="bg-transparent border-b border-primary text-white font-mono text-lg font-bold focus:ring-0 p-0 w-32 text-right"
                    />
                  ) : (
                    <div className="text-2xl font-bold font-mono">R$ {activeGoal.target.toLocaleString('pt-BR')}</div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-outline uppercase block mb-1">Economizado (R$)</span>
                    <input
                      type="number"
                      value={editForm.current ?? ''}
                      onChange={e => setEditForm(p => ({ ...p, current: parseFloat(e.target.value) }))}
                      className="bg-transparent border-b border-primary text-white font-mono text-sm focus:ring-0 p-0 w-28"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-outline uppercase block mb-1">Data Alvo</span>
                    <input
                      type="date"
                      value={editForm.targetDate || ''}
                      onChange={e => setEditForm(p => ({ ...p, targetDate: e.target.value }))}
                      className="bg-transparent border-b border-primary text-white font-mono text-sm focus:ring-0 p-0"
                    />
                  </div>
                </div>
              )}

              <div className="w-full h-3 bg-surface-container/50 border border-outline-variant overflow-hidden">
                <div
                  className="h-full bg-tertiary relative shadow-[0_0_15px_rgba(250,189,0,0.4)] transition-all duration-500"
                  style={{ width: `${currentPercent}%` }}
                >
                  <div className="absolute -right-2 top-0 translate-y-[-125%] bg-black border border-outline-variant px-2 text-[10px] font-mono text-tertiary">
                    {currentPercent}%
                  </div>
                </div>
              </div>

              <div className="flex justify-between font-mono text-[10px] text-outline uppercase tracking-wider">
                <span>STATUS: {parseFloat(currentPercent) >= 100 ? 'COMPLETE' : 'ON_TRACK'}</span>
                <span>{daysRemaining}_DAYS_REMAINING</span>
              </div>
            </div>
          </div>

          {/* Smart Calc Panel */}
          <aside className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-black border border-outline-variant p-6 flex flex-col h-full">
              <div className="flex items-center gap-2 border-b border-outline-variant pb-2 mb-6">
                <span className="text-[10px] font-mono font-bold uppercase text-primary tracking-widest">Smart_Calc</span>
              </div>
              <div className="space-y-6 flex-1">
                <div className="border-b border-outline-variant pb-1">
                  <label className="text-[10px] font-mono text-outline uppercase block mb-1">Target_Date</label>
                  <span className="text-on-surface font-mono text-sm">{activeGoal.targetDate}</span>
                </div>
                <div className="border-b border-outline-variant pb-1">
                  <label className="text-[10px] font-mono text-outline uppercase block mb-1">Remaining_Amount</label>
                  <span className="text-on-surface font-mono text-sm">R$ {remaining.toLocaleString('pt-BR')},00</span>
                </div>
                <div className="mt-auto bg-surface-container border border-primary/20 p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  <span className="text-[10px] font-mono text-primary uppercase block mb-1 font-bold">{'>'} REQ_MONTHLY_SAVE</span>
                  <div className="text-3xl font-bold font-mono">
                    R$ {monthlyRequired.toLocaleString('pt-BR')}
                    <span className="text-xs text-primary">,00</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Milestones Section */}
          <section className="md:col-span-12 bg-black border border-outline-variant overflow-hidden">
            <div className="p-4 border-b border-outline-variant bg-surface-container flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest">MILESTONES</h3>
              <span className="text-[10px] font-mono text-secondary bg-secondary/10 px-2 py-1 border border-secondary/20">
                [{(isEditing ? editForm.milestones : activeGoal.milestones)?.filter(m => m.status === 'ACHIEVED').length || 0} / {(isEditing ? editForm.milestones : activeGoal.milestones)?.length || 0} COMPLETED]
              </span>
            </div>

            {/* ── Deposit Panel ── */}
            {!isEditing && (
              <div className="p-4 border-b border-outline-variant bg-surface-container/30 flex flex-col sm:flex-row items-start sm:items-end gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-mono text-outline uppercase block mb-1">
                    <ArrowDownCircle size={10} className="inline mr-1" />
                    DEPOSITAR PARA ESTA META (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-transparent border-b border-outline-variant focus:border-secondary transition-colors focus:ring-0 font-mono text-lg py-1 px-1 text-on-surface"
                  />
                </div>
                <button
                  onClick={() => {
                    const val = parseFloat(depositAmount);
                    if (isNaN(val) || val <= 0 || !activeGoal) return;
                    // Update goal current amount
                    const newCurrent = activeGoal.current + val;
                    storage.updateGoal(activeGoal.id, { current: newCurrent });
                    // Register as EXPENSE — dinheiro saiu do saldo para a poupança
                    const tx: Transaction = {
                      id: `goal_${activeGoal.id}_${Date.now()}`,
                      type: 'expense',
                      amount: val,
                      description: `Poupança: ${activeGoal.title}`,
                      category: 'poupança',
                      timestamp: Date.now()
                    };
                    storage.saveTransaction(tx);
                    setGoals(storage.getGoals());
                    setDepositAmount('');
                    setDepositSuccess(true);
                    setTimeout(() => setDepositSuccess(false), 2500);
                  }}
                  className={`px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest border transition-all ${
                    depositSuccess
                      ? 'border-secondary text-secondary bg-secondary/10'
                      : 'border-primary text-primary hover:bg-primary/10'
                  }`}
                >
                  {depositSuccess ? '✓ GUARDADO!' : 'GUARDAR'}
                </button>
                <p className="text-[10px] font-mono text-outline sm:self-end pb-2">
                  Desconta do saldo e adiciona ao progresso da meta.
                </p>
              </div>
            )}

            {isEditing && (
              <div className="p-4 border-b border-outline-variant bg-surface-container/50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMilestone}
                    onChange={e => setNewMilestone(e.target.value)}
                    placeholder="Descreva o marco..."
                    className="flex-1 bg-transparent border-b border-outline-variant focus:border-primary transition-colors focus:ring-0 font-mono text-sm py-1 px-1"
                  />
                  <button
                    onClick={handleAddMilestone}
                    className="border border-primary text-primary font-mono text-[10px] px-3 py-1 hover:bg-primary/10 transition-all"
                  >
                    + ADICIONAR
                  </button>
                </div>
              </div>
            )}

            <div className="divide-y divide-outline-variant">
              {(isEditing ? editForm.milestones : activeGoal.milestones)?.map((milestone) => {
                // Cycle status on click (view mode): PENDING → IN_PROGRESS → ACHIEVED → PENDING
                const cycleStatus = (current: Milestone['status']): Milestone['status'] => {
                  if (current === 'PENDING') return 'IN_PROGRESS';
                  if (current === 'IN_PROGRESS') return 'ACHIEVED';
                  return 'PENDING';
                };
                const statusLabel = {
                  ACHIEVED: 'CONCLUÍDO',
                  IN_PROGRESS: 'EM ANDAMENTO',
                  PENDING: 'PENDENTE',
                }[milestone.status];

                return (
                  <div
                    key={milestone.id}
                    className={`flex items-center justify-between p-4 group transition-colors ${
                      milestone.status === 'ACHIEVED' ? 'bg-surface-container/50' : 'bg-black hover:bg-surface-container'
                    } ${!isEditing ? 'cursor-pointer' : ''}`}
                    onClick={() => {
                      if (isEditing) return;
                      const next = cycleStatus(milestone.status);
                      // Persist directly to goal in storage
                      const updatedMilestones = activeGoal.milestones.map(m =>
                        m.id === milestone.id ? { ...m, status: next } : m
                      );
                      storage.updateGoal(activeGoal.id, { milestones: updatedMilestones });
                      setGoals(storage.getGoals());
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`font-mono text-lg leading-none ${
                        milestone.status === 'ACHIEVED' ? 'text-secondary' :
                        milestone.status === 'IN_PROGRESS' ? 'text-primary' : 'text-outline-variant'
                      }`}>
                        {milestone.status === 'ACHIEVED' ? '[✓]' : milestone.status === 'IN_PROGRESS' ? '[~]' : '[ ]'}
                      </span>
                      <span className={`font-mono text-sm ${
                        milestone.status === 'ACHIEVED' ? 'line-through text-outline' : 'text-on-surface'
                      }`}>
                        {milestone.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <select
                            value={milestone.status}
                            onChange={e => handleMilestoneStatus(milestone.id, e.target.value as Milestone['status'])}
                            onClick={e => e.stopPropagation()}
                            className="bg-surface-container border border-outline-variant text-[10px] font-mono p-1 focus:ring-0 focus:border-primary"
                          >
                            <option value="PENDING">PENDENTE</option>
                            <option value="IN_PROGRESS">EM ANDAMENTO</option>
                            <option value="ACHIEVED">CONCLUÍDO</option>
                          </select>
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteMilestone(milestone.id); }}
                            className="text-outline hover:text-error transition-colors p-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      ) : (
                        <span className={`text-[10px] font-mono uppercase tracking-widest ${
                          milestone.status === 'ACHIEVED' ? 'text-secondary' :
                          milestone.status === 'IN_PROGRESS' ? 'text-primary animate-pulse' : 'text-outline-variant'
                        }`}>
                          {statusLabel}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {(isEditing ? editForm.milestones : activeGoal.milestones)?.length === 0 && (
                <div className="p-6 text-center text-outline font-mono text-xs">
                  {isEditing ? 'Adicione marcos acima.' : 'Nenhum marco definido. Clique em EDITAR para adicionar.'}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
