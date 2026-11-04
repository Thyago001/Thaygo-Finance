/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Filter, Calculator, Database, Trash2, CheckCircle2 } from 'lucide-react';
import { storage } from '../lib/storage';
import { BudgetItem, Transaction } from '../types';
import { useTranslation } from '../lib/i18n';

interface BudgetProps {
  onTransactionChange?: () => void;
}

export default function Budget({ onTransactionChange }: BudgetProps) {
  const { t } = useTranslation();
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(storage.getBudget());
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');

  const handleAddObligation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory || !newAmount) return;

    const newItem: BudgetItem = {
      id: `0x${Date.now().toString(16)}`,
      category: newCategory,
      amount: parseFloat(newAmount),
      dueDate: newDueDate || new Date().toISOString().split('T')[0],
      status: 'PENDING'
    };

    storage.saveBudgetItem(newItem);
    setBudgetItems(storage.getBudget());
    setNewCategory('');
    setNewAmount('');
    setNewDueDate(new Date().toISOString().split('T')[0]);
  };

  const handleMarkPaid = (item: BudgetItem) => {
    // Mark as paid and register as expense transaction
    storage.updateBudgetItem(item.id, { status: 'PAID' });
    
    // Register as expense in transactions (reduces balance)
    const tx: Transaction = {
      id: `budget_${item.id}_${Date.now()}`,
      type: 'expense',
      amount: item.amount,
      description: `Budget: ${item.category}`,
      category: 'budget',
      timestamp: Date.now()
    };
    storage.saveTransaction(tx);
    onTransactionChange?.();
    
    setBudgetItems(storage.getBudget());
  };

  const handleDeleteItem = (id: string) => {
    storage.deleteBudgetItem(id);
    setBudgetItems(storage.getBudget());
  };

  const filteredItems = budgetItems.filter(item => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  const totalAllocated = budgetItems.reduce((acc, item) => acc + item.amount, 0);
  const totalCleared = budgetItems.filter(i => i.status === 'PAID').reduce((acc, item) => acc + item.amount, 0);
  const totalPending = totalAllocated - totalCleared;
  const progress = Math.round((totalCleared / totalAllocated) * 100) || 0;

  return (
    <div className="space-y-6">
      <header className="border-b border-outline-variant pb-6">
        <h1 className="text-3xl font-bold text-primary font-mono tracking-tighter uppercase">{t('budget_title')}</h1>
        <p className="text-sm font-mono text-outline mt-2 opacity-80">{t('budget_subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Section */}
        <section className="lg:col-span-8 bg-black border border-outline-variant overflow-hidden flex flex-col">
          <div className="border-b border-outline-variant p-4 flex justify-between items-center bg-surface-container">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2">
              <Database size={14} className="text-primary" /> Fixed_Obligations.log
            </h2>
            {/* Filter buttons */}
            <div className="flex gap-1">
              {(['ALL', 'PAID', 'PENDING'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`text-[10px] font-mono px-2 py-1 border transition-all ${
                    filterStatus === s
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-outline-variant text-outline hover:border-on-surface'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 overflow-x-auto flex-1 max-h-[460px] overflow-y-auto">
            <table className="w-full text-left font-mono text-sm">
              <thead className="text-outline border-b border-outline-variant sticky top-0 bg-black z-10">
                <tr>
                  <th className="pb-3 font-normal text-[10px] uppercase tracking-widest">CATEGORIA</th>
                  <th className="pb-3 font-normal text-[10px] uppercase tracking-widest">VENCIMENTO</th>
                  <th className="pb-3 font-normal text-[10px] uppercase tracking-widest text-right">VALOR</th>
                  <th className="pb-3 font-normal text-[10px] uppercase tracking-widest text-right">STATUS</th>
                  <th className="pb-3 font-normal text-[10px] uppercase tracking-widest text-right">AÇÃO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-outline text-xs">
                      Nenhum item encontrado.
                    </td>
                  </tr>
                )}
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container transition-colors group">
                    <td className="py-4 font-medium">{item.category}</td>
                    <td className="py-4 font-mono text-xs text-outline">{item.dueDate}</td>
                    <td className="py-4 text-right font-bold">
                      R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 text-right">
                      {item.status === 'PAID' ? (
                        <span className="text-secondary font-bold text-xs flex items-center justify-end gap-1">
                          <CheckCircle2 size={12} /> {t('budget_paid')}
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleMarkPaid(item)}
                          className="text-error font-bold text-xs hover:text-secondary transition-colors group-hover:underline decoration-dashed"
                          title="Marcar como pago (registra despesa no saldo)"
                        >
                          {t('budget_pending')} ↗
                        </button>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-outline hover:text-error transition-colors opacity-0 group-hover:opacity-100 p-1"
                        title="Excluir item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-outline-variant p-3 bg-surface-container">
            <p className="text-[10px] font-mono text-outline">
              💡 Ao marcar como PAGO, a despesa é automaticamente registrada e deduzida do seu saldo.
            </p>
          </div>
        </section>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-6">
          {/* Summary Card */}
          <section className="bg-black border border-outline-variant">
            <div className="border-b border-outline-variant p-4 bg-surface-container">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest">sys.summary.calc()</h2>
            </div>
            <div className="p-4 space-y-4 font-mono text-sm">
              <div className="flex justify-between border-b border-outline-variant pb-2">
                <span className="text-outline">Total_Alocado:</span>
                <span className="text-on-surface font-bold">R$ {totalAllocated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant pb-2">
                <span className="text-secondary">Total_Pago:</span>
                <span className="text-secondary font-bold">R$ {totalCleared.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant pb-2">
                <span className="text-error">Total_Pendente:</span>
                <span className="text-error font-bold">R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-2">
                <div className="flex justify-between mb-2 text-[10px] items-center">
                  <span className="text-outline tracking-wider uppercase">EXECUTION_PROGRESS</span>
                  <span className="text-primary font-bold">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container relative overflow-hidden border border-outline-variant">
                  <div 
                    className="h-full bg-primary transition-all duration-500 shadow-[0_0_8px_rgba(173,199,255,0.4)]" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* New Obligation Form */}
          <section className="bg-black border border-outline-variant">
            <div className="border-b border-outline-variant p-4 bg-surface-container flex justify-between items-center">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest">New_Obligation.init</h2>
              <Calculator size={14} className="text-outline" />
            </div>
            <form onSubmit={handleAddObligation} className="p-4 space-y-5">
              <div className="relative">
                <label className="absolute -top-2.5 left-2 bg-black px-1 text-[10px] text-outline font-mono uppercase">CATEGORIA</label>
                <input 
                  type="text" 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="ex: aluguel, internet..."
                  className="w-full bg-transparent border-b border-outline-variant focus:border-primary transition-colors focus:ring-0 font-mono text-sm py-2 px-1"
                />
              </div>
              <div className="relative">
                <label className="absolute -top-2.5 left-2 bg-black px-1 text-[10px] text-outline font-mono uppercase">VALOR (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0.01"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-transparent border-b border-outline-variant focus:border-primary transition-colors focus:ring-0 font-mono text-sm py-2 px-1"
                />
              </div>
              <div className="relative">
                <label className="absolute -top-2.5 left-2 bg-black px-1 text-[10px] text-outline font-mono uppercase">VENCIMENTO</label>
                <input 
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-transparent border-b border-outline-variant focus:border-primary transition-colors focus:ring-0 font-mono text-sm py-2 px-1 text-on-surface"
                />
              </div>
              <button 
                type="submit"
                className="w-full border border-primary text-primary font-mono text-xs py-3 hover:bg-primary/10 transition-all uppercase tracking-widest font-bold"
              >
                COMMIT_TO_LOG
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
