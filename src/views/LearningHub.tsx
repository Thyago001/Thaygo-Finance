/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Quote, ExternalLink, Calculator, BookOpen, Copy, Check } from 'lucide-react';
import { storage } from '../lib/storage';
import { useTranslation } from '../lib/i18n';
import { LearningCard as LearningCardType } from '../types';

// ─── Fórmulas ──────────────────────────────────────────────────────────────
interface Formula {
  id: string;
  label: string;
  title: string;
  expression: React.ReactNode;
  expressionRaw: string;
  legend: { var: string; label: string; desc: string; color: string }[];
}

const FORMULAS: Formula[] = [
  {
    id: 'compound',
    label: 'Juros Compostos',
    title: 'Juros Compostos (A)',
    expressionRaw: 'A = P * (1 + r/n)^(n*t)',
    expression: (
      <span>
        <span className="text-secondary">A</span>
        {' = '}
        <span className="text-tertiary">P</span>
        {' × (1 + '}
        <span className="text-primary">r</span>
        {'/'}
        <span className="text-outline">n</span>
        {')^('}
        <span className="text-outline">n</span>
        {' × '}
        <span className="text-outline-variant">t</span>
        {')'}
      </span>
    ),
    legend: [
      { var: 'A', label: 'Montante Final', desc: 'Valor total acumulado', color: 'text-secondary' },
      { var: 'P', label: 'Principal', desc: 'Capital inicial investido', color: 'text-tertiary' },
      { var: 'r', label: 'Taxa de Juros', desc: 'Taxa anual (ex: 0,12)', color: 'text-primary' },
      { var: 'n', label: 'Frequência', desc: 'Composições por ano', color: 'text-outline' },
      { var: 't', label: 'Tempo', desc: 'Período em anos', color: 'text-outline-variant' },
    ],
  },
  {
    id: 'pv',
    label: 'Valor Presente',
    title: 'Valor Presente (VP)',
    expressionRaw: 'VP = VF / (1 + r)^n',
    expression: (
      <span>
        <span className="text-secondary">VP</span>
        {' = '}
        <span className="text-tertiary">VF</span>
        {' ÷ (1 + '}
        <span className="text-primary">r</span>
        {')^'}
        <span className="text-outline">n</span>
      </span>
    ),
    legend: [
      { var: 'VP', label: 'Valor Presente', desc: 'Valor hoje do dinheiro futuro', color: 'text-secondary' },
      { var: 'VF', label: 'Valor Futuro', desc: 'Valor que você quer no futuro', color: 'text-tertiary' },
      { var: 'r', label: 'Taxa de Desconto', desc: 'Taxa de juros por período', color: 'text-primary' },
      { var: 'n', label: 'Períodos', desc: 'Número de períodos', color: 'text-outline' },
    ],
  },
  {
    id: 'roi',
    label: 'ROI',
    title: 'Retorno sobre Investimento (ROI)',
    expressionRaw: 'ROI = (Ganho - Custo) / Custo × 100',
    expression: (
      <span>
        <span className="text-secondary">ROI</span>
        {' = ('}
        <span className="text-tertiary">Ganho</span>
        {' − '}
        <span className="text-primary">Custo</span>
        {') ÷ '}
        <span className="text-primary">Custo</span>
        {' × 100'}
      </span>
    ),
    legend: [
      { var: 'ROI', label: 'Retorno (%)', desc: 'Percentual de retorno', color: 'text-secondary' },
      { var: 'Ganho', label: 'Retorno Bruto', desc: 'Valor recebido no fim', color: 'text-tertiary' },
      { var: 'Custo', label: 'Investimento', desc: 'Capital aplicado inicial', color: 'text-primary' },
    ],
  },
  {
    id: 'sharpe',
    label: 'Índice de Sharpe',
    title: 'Índice de Sharpe',
    expressionRaw: 'S = (Rp - Rf) / σp',
    expression: (
      <span>
        <span className="text-secondary">S</span>
        {' = ('}
        <span className="text-tertiary">Rp</span>
        {' − '}
        <span className="text-outline">Rf</span>
        {') ÷ '}
        <span className="text-primary">σp</span>
      </span>
    ),
    legend: [
      { var: 'S', label: 'Sharpe', desc: 'Retorno por unidade de risco', color: 'text-secondary' },
      { var: 'Rp', label: 'Retorno da Carteira', desc: 'Rendimento do ativo', color: 'text-tertiary' },
      { var: 'Rf', label: 'Taxa Livre de Risco', desc: 'Ex: Selic ou CDI', color: 'text-outline' },
      { var: 'σp', label: 'Desvio Padrão', desc: 'Volatilidade da carteira', color: 'text-primary' },
    ],
  },
];

// ─── LearningHub ──────────────────────────────────────────────────────────────
export default function LearningHub() {
  const { t } = useTranslation();
  const [concepts] = useState<LearningCardType[]>(storage.getLearningCards());
  const [activeFormula, setActiveFormula] = useState(FORMULAS[0].id);
  const [copied, setCopied] = useState(false);

  const formula = FORMULAS.find(f => f.id === activeFormula) || FORMULAS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(formula.expressionRaw).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="border-b border-outline-variant pb-6">
        <h1 className="text-3xl font-bold text-primary font-mono tracking-tighter uppercase">{t('learn_title')}</h1>
        <p className="text-sm font-mono text-outline mt-2 opacity-80">{t('learn_subtitle')}</p>
      </header>

      {/* Citação */}
      <section className="bg-black border border-outline-variant p-8 relative overflow-hidden group hover:border-primary transition-all duration-500">
        <div className="absolute top-2 right-2 text-[10px] font-mono text-outline-variant">/sys/quotes/smith.log</div>
        <div className="relative z-10 flex gap-6 items-start">
          <Quote size={40} className="text-primary opacity-30 mt-1 shrink-0" />
          <div className="space-y-3">
            <p className="text-xl font-mono leading-relaxed text-on-surface group-hover:text-white transition-colors">
              "O preço real de qualquer coisa é o trabalho e o esforço para adquiri-la."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-tertiary" />
              <span className="text-sm font-bold font-mono text-tertiary tracking-widest uppercase">Adam Smith</span>
            </div>
          </div>
        </div>
      </section>

      {/* Biblioteca de Conceitos */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-tertiary" />
          <h2 className="text-lg font-bold font-mono uppercase tracking-widest">{t('learn_concept_lib')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {concepts.map((c) => (
            <ConceptCard key={c.id} {...c} t={t} />
          ))}
        </div>
      </div>

      {/* Guia de Fórmulas — FUNCIONAL */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Calculator size={16} className="text-secondary" />
          <h2 className="text-lg font-bold font-mono uppercase tracking-widest">{t('learn_formula_cheat')}</h2>
        </div>

        <div className="border border-outline-variant bg-black flex flex-col md:flex-row min-h-[280px]">
          {/* Tabs */}
          <div className="md:w-56 border-b md:border-b-0 md:border-r border-outline-variant p-3 flex md:flex-col gap-1">
            {FORMULAS.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFormula(f.id)}
                className={`text-left font-mono text-xs p-3 transition-all rounded-sm ${
                  f.id === activeFormula
                    ? 'bg-surface-container border-l-2 border-primary text-primary'
                    : 'text-outline hover:text-on-surface hover:bg-surface-container/50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 p-6 md:p-8 bg-surface-container/30">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-bold font-mono">{formula.title}</h3>
              <button
                onClick={handleCopy}
                className="text-[10px] font-mono border border-outline-variant px-3 py-1.5 hover:text-primary hover:border-primary transition-all flex items-center gap-1.5"
              >
                {copied ? <><Check size={10} /> COPIADO!</> : <><Copy size={10} /> COPIAR</>}
              </button>
            </div>

            {/* Fórmula */}
            <div className="bg-black border border-outline-variant p-5 font-mono text-xl md:text-2xl mb-6 overflow-x-auto whitespace-nowrap">
              {formula.expression}
            </div>

            {/* Legenda */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
              {formula.legend.map(l => (
                <div key={l.var} className="border-l-2 border-outline-variant pl-3">
                  <span className={`${l.color} font-bold text-sm block mb-0.5`}>{l.var} — {l.label}</span>
                  <span className="text-outline">{l.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ConceptCard({ title, tag, desc, status, read, t }: any) {
  const statusPt: Record<string, string> = {
    ACTIVE: 'ATIVO', SECURE: 'SEGURO', DAILY: 'DIÁRIO', RISK: 'RISCO', MACRO: 'MACRO',
  };
  return (
    <div className="bg-surface-container border border-outline-variant p-5 group hover:border-primary cursor-pointer transition-all flex flex-col justify-between hover:glow-primary">
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="text-[10px] bg-tertiary text-black px-2 py-0.5 font-bold font-mono tracking-widest">{tag}</span>
          <ExternalLink size={13} className="text-outline-variant group-hover:text-primary transition-colors" />
        </div>
        <h3 className="text-xl font-bold font-mono text-primary mb-2">{title}</h3>
        <p className="text-outline text-xs leading-relaxed font-mono">{desc}</p>
      </div>
      <div className="mt-6 pt-3 border-t border-outline-variant flex justify-between items-center text-[10px] font-mono">
        <span className="text-secondary font-bold uppercase">
          [ {t('learn_status')}: {statusPt[status] || status} ]
        </span>
        <span className="text-outline-variant group-hover:text-outline transition-colors">leitura: {read}</span>
      </div>
    </div>
  );
}
