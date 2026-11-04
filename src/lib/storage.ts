/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, BudgetItem, Goal, LearningCard, AppSettings, UserProfile } from '../types';

const KEYS = {
  TRANSACTIONS: 'fin_terminal_transactions',
  BUDGET: 'fin_terminal_budget',
  GOALS: 'fin_terminal_goals',
  AUTH: 'fin_terminal_auth',
  SETTINGS: 'fin_terminal_settings',
  LEARNING_CARDS: 'fin_terminal_learning_cards'
};

// Generic helper to get from LocalStorage
function get<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

// Generic helper to set in LocalStorage
function set<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const storage = {
  // Transactions
  getTransactions: (): Transaction[] => get(KEYS.TRANSACTIONS, []),
  saveTransaction: (transaction: Transaction) => {
    const current = storage.getTransactions();
    set(KEYS.TRANSACTIONS, [transaction, ...current]);
  },
  deleteTransaction: (id: string) => {
    const current = storage.getTransactions();
    set(KEYS.TRANSACTIONS, current.filter(t => t.id !== id));
  },
  
  // Budget
  getBudget: (): BudgetItem[] => get(KEYS.BUDGET, [
    { id: '0x01', category: 'sys.housing.rent', amount: 2400, dueDate: new Date().toISOString().split('T')[0], status: 'PAID' },
    { id: '0x02', category: 'sys.utilities.internet', amount: 85, dueDate: new Date().toISOString().split('T')[0], status: 'PAID' },
    { id: '0x03', category: 'sys.transport.insurance', amount: 120, dueDate: new Date().toISOString().split('T')[0], status: 'PENDING' },
    { id: '0x04', category: 'sys.subs.software', amount: 45, dueDate: new Date().toISOString().split('T')[0], status: 'PENDING' },
    { id: '0x05', category: 'sys.health.insurance', amount: 350, dueDate: new Date().toISOString().split('T')[0], status: 'PENDING' },
  ]),
  saveBudgetItem: (item: BudgetItem) => {
    const current = storage.getBudget();
    set(KEYS.BUDGET, [...current, item]);
  },
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => {
    const current = storage.getBudget();
    const updated = current.map(item => item.id === id ? { ...item, ...updates } : item);
    set(KEYS.BUDGET, updated);
  },
  deleteBudgetItem: (id: string) => {
    const current = storage.getBudget();
    set(KEYS.BUDGET, current.filter(item => item.id !== id));
  },

  // Goals
  getGoals: (): Goal[] => get(KEYS.GOALS, [{
    id: '001',
    title: 'TOKYO_TRIP_2024',
    target: 3000,
    current: 1850,
    targetDate: '2024-12-31',
    coverImage: undefined,
    milestones: [
      { id: 'm1', label: 'Initial Deposit: R$ 500', status: 'ACHIEVED' },
      { id: 'm2', label: 'Reach R$ 1,500 mark', status: 'ACHIEVED' },
      { id: 'm3', label: 'Book Flights (Est. R$ 2,200 saved)', status: 'IN_PROGRESS' },
      { id: 'm4', label: 'Finalize Accommodation (R$ 3,000)', status: 'PENDING' }
    ]
  }]),
  saveGoals: (goals: Goal[]) => {
    set(KEYS.GOALS, goals);
  },
  updateGoal: (id: string, updates: Partial<Goal>) => {
    const current = storage.getGoals();
    const updated = current.map(g => g.id === id ? { ...g, ...updates } : g);
    set(KEYS.GOALS, updated);
  },
  addGoal: (goal: Goal) => {
    const current = storage.getGoals();
    set(KEYS.GOALS, [...current, goal]);
  },
  deleteGoal: (id: string) => {
    const current = storage.getGoals();
    set(KEYS.GOALS, current.filter(g => g.id !== id));
  },
  
  // Auth simulation
  getUser: (): UserProfile | null => get(KEYS.AUTH, null),
  setUser: (user: UserProfile) => set(KEYS.AUTH, user),
  updateUser: (updates: Partial<UserProfile>) => {
    const current = storage.getUser();
    if (current) {
      set(KEYS.AUTH, { ...current, ...updates });
    }
  },
  logout: () => localStorage.removeItem(KEYS.AUTH),

  // Settings
  getSettings: (): AppSettings => get(KEYS.SETTINGS, { language: 'pt', initialBalance: 0 }),
  updateSettings: (settings: Partial<AppSettings>) => {
    const current = storage.getSettings();
    set(KEYS.SETTINGS, { ...current, ...settings });
  },

  // Learning Cards
  getLearningCards: (): LearningCard[] => get(KEYS.LEARNING_CARDS, [
    { id: '1', title: 'SELIC', tag: 'MACRO', desc: 'A taxa básica de juros da economia brasileira. Influencia inflação e custos de crédito.', status: 'ACTIVE', read: '3m' },
    { id: '2', title: 'IPCA', tag: 'INFLAÇÃO', desc: 'Índice Nacional de Preços ao Consumidor Amplo. O termômetro oficial da inflação no Brasil.', status: 'ACTIVE', read: '2m' },
    { id: '3', title: 'CDB', tag: 'INVEST', desc: 'Certificado de Depósito Bancário. Título de renda fixa emitido por bancos para captar recursos.', status: 'SECURE', read: '5m' },
    { id: '4', title: 'CDI', tag: 'BENCHMARK', desc: 'Certificado de Depósito Interbancário. A principal referência para investimentos de renda fixa no Brasil.', status: 'DAILY', read: '4m' },
    { id: '5', title: 'TESOURO DIRETO', tag: 'INVEST', desc: 'Programa de venda de títulos públicos a pessoas físicas. Baixo risco garantido pelo governo.', status: 'SECURE', read: '4m' },
    { id: '6', title: 'FGC', tag: 'PROTEÇÃO', desc: 'Fundo Garantidor de Créditos. Protege investimentos em caso de falência da instituição financeira.', status: 'SECURE', read: '2m' },
    { id: '7', title: 'LIQUIDEZ', tag: 'CONCEITO', desc: 'A facilidade e velocidade com que um ativo pode ser convertido em dinheiro sem perda de valor.', status: 'ACTIVE', read: '3m' },
    { id: '8', title: 'JUROS COMPOSTOS', tag: 'MÁGICA', desc: 'Juros calculados sobre o valor inicial e sobre os juros acumulados de períodos anteriores.', status: 'ACTIVE', read: '4m' },
    { id: '9', title: 'AÇÕES', tag: 'RENDA VARIÁVEL', desc: 'A menor fração do capital social de uma empresa. Você se torna "sócio" do negócio.', status: 'RISK', read: '5m' },
    { id: '10', title: 'FIIs', tag: 'RENDA VARIÁVEL', desc: 'Fundos de Investimento Imobiliário. Permitem investir em imóveis sem precisar comprá-los.', status: 'RISK', read: '5m' }
  ]),
  saveLearningCard: (card: LearningCard) => {
    const current = storage.getLearningCards();
    set(KEYS.LEARNING_CARDS, [card, ...current]);
  },
  deleteLearningCard: (id: string) => {
    const current = storage.getLearningCards();
    set(KEYS.LEARNING_CARDS, current.filter(c => c.id !== id));
  },
  
  // Clear Data
  clearAllData: () => {
    localStorage.removeItem(KEYS.TRANSACTIONS);
    localStorage.removeItem(KEYS.BUDGET);
    localStorage.removeItem(KEYS.GOALS);
    localStorage.removeItem(KEYS.LEARNING_CARDS);
    // keeping AUTH and SETTINGS
  }
};
