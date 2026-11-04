/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Terminal as TerminalIcon, 
  TrendingUp, 
  TrendingDown,
  Trash2,
  RefreshCw,
  Lightbulb,
  BarChart2
} from 'lucide-react';
import { storage } from '../lib/storage';
import { Transaction, LearningCard } from '../types';
import { useTranslation } from '../lib/i18n';

interface DashboardProps {
  onTransactionChange?: () => void;
}

// ─── Monthly Chart ────────────────────────────────────────────────────────────
function MonthlyChart({ transactions }: { transactions: Transaction[] }) {
  const months = useMemo(() => {
    const now = new Date();
    const result: { label: string; income: number; expense: number; key: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
      result.push({ label, key, income: 0, expense: 0 });
    }
    transactions.forEach(tx => {
      const d = new Date(tx.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const month = result.find(m => m.key === key);
      if (month) {
        if (tx.type === 'income') month.income += tx.amount;
        else month.expense += tx.amount;
      }
    });
    return result;
  }, [transactions]);

  const maxVal = Math.max(...months.flatMap(m => [m.income, m.expense]), 1);
  const chartH = 100;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${months.length * 60} ${chartH + 32}`} className="w-full" style={{ height: '140px' }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map(f => (
          <line
            key={f}
            x1="0" y1={chartH - chartH * f}
            x2={months.length * 60} y2={chartH - chartH * f}
            stroke="#1a1a1a" strokeWidth="1"
          />
        ))}
        {months.map((m, i) => {
          const x = i * 60 + 10;
          const barW = 16;
          const gap = 4;
          const incH = (m.income / maxVal) * chartH;
          const expH = (m.expense / maxVal) * chartH;
          return (
            <g key={m.key}>
              {/* Income bar */}
              <rect
                x={x} y={chartH - incH}
                width={barW} height={incH}
                fill="#66df75" fillOpacity="0.7"
                rx="1"
              />
              {/* Expense bar */}
              <rect
                x={x + barW + gap} y={chartH - expH}
                width={barW} height={expH}
                fill="#ff2d2d" fillOpacity="0.7"
                rx="1"
              />
              {/* Month label */}
              <text
                x={x + barW} y={chartH + 14}
                textAnchor="middle"
                fill="#444444" fontSize="8"
                fontFamily="Fira Code, monospace"
              >
                {m.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-4 mt-1">
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-secondary">
          <span className="w-2 h-2 bg-secondary/70 inline-block" /> RECEITA
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-primary">
          <span className="w-2 h-2 bg-primary/70 inline-block" /> DESPESA
        </span>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard({ onTransactionChange }: DashboardProps) {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>(storage.getTransactions());
  const [cards] = useState<LearningCard[]>(storage.getLearningCards());
  const [flashcard, setFlashcard] = useState<LearningCard | null>(null);
  const [initialBalance, setInitialBalance] = useState(storage.getSettings().initialBalance || 0);
  const [inputCommand, setInputCommand] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '> THAYGO_FINANCE v2.0 iniciado.',
    `> Digite 'add expense 50 descricao' ou 'add income 500 descricao'`,
  ]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cards.length > 0) setFlashcard(cards[Math.floor(Math.random() * cards.length)]);
  }, [cards]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  useEffect(() => {
    setTransactions(storage.getTransactions());
    setInitialBalance(storage.getSettings().initialBalance || 0);
  }, []);

  const stats = useMemo(() => transactions.reduce(
    (acc, tx) => {
      if (tx.type === 'income') acc.income += tx.amount;
      else acc.expense += tx.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  ), [transactions]);

  const totalBalance = initialBalance + stats.income - stats.expense;

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCommand.trim()) return;
    const cmd = inputCommand.trim().toLowerCase();
    const parts = cmd.split(' ');
    const logs = [...terminalLogs, `> ${inputCommand}`];

    if (cmd === 'clear') { setTerminalLogs(['> Logs limpos.']); setInputCommand(''); return; }
    if (cmd === 'help') {
      logs.push("  add income  <valor> <desc>  — registra receita");
      logs.push("  add expense <valor> <desc>  — registra despesa");
      logs.push("  clear                       — limpa o terminal");
    } else if (parts.length >= 3 && parts[0] === 'add' && (parts[1] === 'income' || parts[1] === 'expense')) {
      const type = parts[1] as 'income' | 'expense';
      const amount = parseFloat(parts[2]);
      const desc = parts.slice(3).join(' ') || (type === 'income' ? 'Receita' : 'Despesa');
      if (!isNaN(amount) && amount > 0) {
        storage.saveTransaction({ id: Date.now().toString(), type, amount, description: desc, category: 'terminal', timestamp: Date.now() });
        const updated = storage.getTransactions();
        setTransactions(updated);
        onTransactionChange?.();
        const newStats = updated.reduce((a, t) => { if (t.type === 'income') a.income += t.amount; else a.expense += t.amount; return a; }, { income: 0, expense: 0 });
        const bal = (storage.getSettings().initialBalance || 0) + newStats.income - newStats.expense;
        logs.push(type === 'income' ? `[OK] +R$ ${amount.toFixed(2)} adicionado.` : `[OK] -R$ ${amount.toFixed(2)} debitado.`);
        logs.push(`[SALDO] R$ ${bal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      } else logs.push('[ERRO] Valor inválido.');
    } else logs.push('[ERRO] Comando não reconhecido. Digite help.');

    setTerminalLogs(logs);
    setInputCommand('');
  };

  const handleDelete = (id: string) => {
    storage.deleteTransaction(id);
    setTransactions(storage.getTransactions());
    onTransactionChange?.();
  };

  const recent = transactions.slice(0, 6);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* ── Balance Header ── */}
      <div className="border border-outline-variant bg-surface p-5 flex flex-col md:flex-row justify-between gap-4 glow-red-border">
        <div>
          <p className="text-[10px] font-mono text-outline uppercase tracking-widest mb-1">{t('dash_total_balance')}</p>
          <div className={`text-5xl font-bold font-mono tabular-nums ${totalBalance >= 0 ? 'text-on-surface' : 'text-primary'}`}>
            <span className="text-outline text-2xl mr-1">R$</span>
            {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          {initialBalance !== 0 && (
            <p className="text-[10px] font-mono text-outline mt-1">
              base R${initialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} · +R${stats.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} · −R${stats.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>
        <div className="flex gap-3 items-start">
          <Chip label={t('dash_income_30d')} value={`+R$ ${stats.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} color="text-secondary" />
          <Chip label={t('dash_expense_30d')} value={`−R$ ${stats.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} color="text-primary" />
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

        {/* Terminal */}
        <section className="md:col-span-5 border border-outline-variant bg-surface flex flex-col h-[320px]">
          <SectionHeader icon={<TerminalIcon size={12} />} label="TERMINAL.exe" color="text-primary" dots />
          <div className="flex-1 p-3 font-mono text-xs overflow-y-auto space-y-1">
            {terminalLogs.map((log, i) => (
              <div key={i} className={
                log.startsWith('>') ? 'text-outline-variant'
                : log.startsWith('[OK]') ? 'text-secondary'
                : log.startsWith('[SALDO]') ? 'text-primary font-bold'
                : log.startsWith('[ERRO]') ? 'text-error'
                : 'text-outline'
              }>{log}</div>
            ))}
            <form onSubmit={handleCommand} className="flex items-center gap-2 pt-1">
              <span className="text-primary font-bold">$</span>
              <input
                type="text" autoFocus value={inputCommand}
                onChange={e => setInputCommand(e.target.value)}
                placeholder={t('dash_terminal_placeholder')}
                className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-on-surface font-mono text-xs placeholder:text-outline-variant/50"
              />
              <div className="w-1.5 h-4 bg-primary terminal-blink" />
            </form>
            <div ref={logsEndRef} />
          </div>
        </section>

        {/* Monthly Chart */}
        <section className="md:col-span-7 border border-outline-variant bg-surface flex flex-col h-[320px]">
          <SectionHeader icon={<BarChart2 size={12} />} label="FLUXO_MENSAL.chart" color="text-outline" />
          <div className="flex-1 p-4 flex flex-col justify-end">
            {transactions.length === 0 ? (
              <p className="text-outline font-mono text-xs text-center m-auto">
                Nenhuma transação. Adicione via terminal ou "+ Nova Transação".
              </p>
            ) : (
              <MonthlyChart transactions={transactions} />
            )}
          </div>
        </section>

        {/* Flashcard */}
        <section className="md:col-span-4 border border-outline-variant bg-surface flex flex-col">
          <SectionHeader icon={<Lightbulb size={12} />} label={t('dash_flashcard_title')} color="text-tertiary" />
          <div className="p-4 flex-1 flex flex-col">
            <span className="text-[9px] font-mono bg-tertiary text-black px-2 py-0.5 w-max mb-3 font-bold">
              {t('dash_flashcard_day')}
            </span>
            {flashcard ? (
              <>
                <p className="text-base font-bold font-mono mb-2 text-on-surface">{flashcard.title}</p>
                <p className="text-xs text-outline font-mono leading-relaxed flex-1">{flashcard.desc}</p>
              </>
            ) : (
              <p className="text-outline font-mono text-xs">Nenhum cartão disponível.</p>
            )}
            <button
              onClick={() => cards.length > 0 && setFlashcard(cards[Math.floor(Math.random() * cards.length)])}
              className="mt-3 w-full border border-outline-variant text-outline font-mono text-[10px] py-1.5 hover:border-tertiary hover:text-tertiary transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={10} /> PRÓXIMO
            </button>
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="md:col-span-8 border border-outline-variant bg-surface overflow-hidden">
          <SectionHeader icon={<TrendingDown size={12} />} label="TRANSAÇÕES_RECENTES" color="text-outline" extra={`${transactions.length} total`} />
          {recent.length === 0 ? (
            <p className="p-6 text-outline font-mono text-xs text-center">
              Sem transações ainda.
            </p>
          ) : (
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-outline-variant">
                <tr className="text-outline">
                  {['TIPO','DESCRIÇÃO','CATEGORIA','DATA','VALOR',''].map(h => (
                    <th key={h} className="px-4 py-2 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {recent.map(tx => (
                  <tr key={tx.id} className="group hover:bg-outline-variant/10 transition-colors">
                    <td className="px-4 py-2.5">
                      {tx.type === 'income'
                        ? <span className="text-secondary text-[10px] font-bold flex items-center gap-1"><TrendingUp size={10} />REC</span>
                        : <span className="text-primary text-[10px] font-bold flex items-center gap-1"><TrendingDown size={10} />EXP</span>
                      }
                    </td>
                    <td className="px-4 py-2.5 text-on-surface max-w-[140px] truncate">{tx.description}</td>
                    <td className="px-4 py-2.5 text-outline">{tx.category}</td>
                    <td className="px-4 py-2.5 text-outline">{new Date(tx.timestamp).toLocaleDateString('pt-BR')}</td>
                    <td className={`px-4 py-2.5 font-bold tabular-nums ${tx.type === 'income' ? 'text-secondary' : 'text-primary'}`}>
                      {tx.type === 'income' ? '+' : '−'}R${tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="opacity-0 group-hover:opacity-100 text-outline hover:text-primary transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionHeader({ icon, label, color, dots, extra }: {
  icon: React.ReactNode; label: string; color?: string; dots?: boolean; extra?: string;
}) {
  return (
    <div className="border-b border-outline-variant px-4 py-2 flex items-center justify-between bg-surface-container">
      <div className="flex items-center gap-2">
        <span className={color}>{icon}</span>
        <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${color}`}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {extra && <span className="text-[10px] font-mono text-outline">{extra}</span>}
        {dots && (
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-tertiary/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-secondary/60" />
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="border border-outline-variant bg-surface-container px-3 py-2 min-w-[130px]">
      <span className="text-[9px] font-mono text-outline block mb-0.5 uppercase">{label}</span>
      <span className={`font-mono text-sm font-bold ${color}`}>{value}</span>
    </div>
  );
}
