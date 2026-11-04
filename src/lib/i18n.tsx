import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from './storage';

type Language = 'pt' | 'en';

export const translations = {
  pt: {
    // Navigation
    nav_dashboard: 'PAINEL',
    nav_budget: 'ORÇAMENTO',
    nav_savings: 'METAS',
    nav_learning: 'ESTUDOS',
    nav_settings: 'CONFIGURAÇÕES',
    nav_logout: 'SAIR',
    nav_new_transaction: 'NOVA_TRANSAÇÃO',
    
    // Header
    search_placeholder: 'SISTEMA_BUSCA...',

    // Dashboard
    dash_total_balance: 'SISTEMA.SALDO.TOTAL',
    dash_income_30d: 'RECEITA_30D',
    dash_expense_30d: 'DESPESA_30D',
    dash_terminal_title: 'TERMINAL_LOGGER.exe',
    dash_terminal_placeholder: "add expense 50 'almoço'",
    dash_flashcard_title: 'CONCEPT_DB.query',
    dash_flashcard_day: 'CARTÃO_DO_DIA',
    dash_mark_read: 'MARCAR_COMO_LIDO',
    dash_market_pulse: 'MERCADO.viz',

    // Terminal responses
    term_init: '> THAYGO_FINANCE v2.0 iniciado. Aguardando comando.',
    term_help: "Digite 'add income <valor> <desc>' ou 'add expense <valor> <desc>' ou 'clear'",
    term_error: "Comando não reconhecido. Tente 'add income 500 salário'",
    term_success_income: "[SUCESSO] Receita adicionada. Saldo atualizado.",
    term_success_expense: "[SUCESSO] Despesa registrada. Saldo atualizado.",
    term_cleared: "[SISTEMA] Logs limpos.",

    // Settings
    settings_title: '>> CONFIGURAÇÕES.exe',
    settings_subtitle: '// Ajuste os parâmetros do sistema...',
    settings_lang: 'Idioma do Sistema',
    settings_lang_desc: 'Altere o idioma da interface',
    settings_data: 'Gerenciamento de Dados',
    settings_data_desc: 'Controle seus dados locais',
    settings_clear_data: 'LIMPAR_DADOS',
    settings_learning_cards: 'Cartões de Aprendizado',
    settings_learning_cards_desc: 'Adicione ou remova conceitos do seu banco de dados',
    settings_add_card: 'ADICIONAR_CARTÃO',
    settings_card_title: 'Título',
    settings_card_desc: 'Descrição',
    settings_card_tag: 'Tag (ex: MACRO)',
    
    // Learning Hub
    learn_title: '>> BIBLIOTECA_ESTUDOS.exe',
    learn_subtitle: '// Inicializando sequência da base de conhecimento...',
    learn_concept_lib: 'Biblioteca de Conceitos',
    learn_formula_cheat: 'Guia de Fórmulas',
    learn_status: 'STATUS',

    // Budget
    budget_title: '>> GERENCIADOR_ORÇAMENTO.exe',
    budget_subtitle: '// Rastreamento de fluxo de caixa mensal...',
    budget_paid: 'PAGO',
    budget_pending: 'PENDENTE',

    // Savings
    savings_title: '>> METAS_POUPANÇA.exe',
    savings_subtitle: '// Rastreamento de objetivos a longo prazo...',
    savings_achieved: 'CONCLUÍDO',
    savings_in_progress: 'EM ANDAMENTO'
  },
  en: {
    // Navigation
    nav_dashboard: 'DASHBOARD',
    nav_budget: 'BUDGET',
    nav_savings: 'GOALS',
    nav_learning: 'LEARNING',
    nav_settings: 'SETTINGS',
    nav_logout: 'LOGOUT',
    nav_new_transaction: 'NEW_TRANSACTION',
    
    // Header
    search_placeholder: 'QUERY_SYSTEM...',

    // Dashboard
    dash_total_balance: 'SYS.BALANCE.TOTAL',
    dash_income_30d: 'INCOME_30D',
    dash_expense_30d: 'EXPENSE_30D',
    dash_terminal_title: 'TERMINAL_LOGGER.exe',
    dash_terminal_placeholder: "add expense 50 'lunch'",
    dash_flashcard_title: 'CONCEPT_DB.query',
    dash_flashcard_day: 'FLASHCARD_OF_THE_DAY',
    dash_mark_read: 'MARK_AS_READ',
    dash_market_pulse: 'MARKET_PULSE.viz',

    // Terminal responses
    term_init: 'SYS_INIT v1.0.4 loaded. Ready for input.',
    term_help: "Type 'add income <amount> <desc>' or 'add expense <amount> <desc>' or 'clear'",
    term_error: "Command not recognized. Try 'add income 500 salary'",
    term_success_income: "[SUCCESS] Income added. Balance updated.",
    term_success_expense: "[SUCCESS] Expense added. Balance updated.",
    term_cleared: "[SYSTEM] Logs cleared.",

    // Settings
    settings_title: '>> SETTINGS.exe',
    settings_subtitle: '// Adjust system parameters...',
    settings_lang: 'System Language',
    settings_lang_desc: 'Change the interface language',
    settings_data: 'Data Management',
    settings_data_desc: 'Control your local data',
    settings_clear_data: 'CLEAR_DATA',
    settings_learning_cards: 'Learning Cards',
    settings_learning_cards_desc: 'Add or remove concepts from your database',
    settings_add_card: 'ADD_CARD',
    settings_card_title: 'Title',
    settings_card_desc: 'Description',
    settings_card_tag: 'Tag (e.g., MACRO)',

    // Learning Hub
    learn_title: '>> LEARNING_HUB.exe',
    learn_subtitle: '// Initialize knowledge base sequence...',
    learn_concept_lib: 'Concept Library',
    learn_formula_cheat: 'Formula Cheat Sheet',
    learn_status: 'STATUS',

    // Budget
    budget_title: '>> BUDGET_MANAGER.exe',
    budget_subtitle: '// Tracking monthly cash flow...',
    budget_paid: 'PAID',
    budget_pending: 'PENDING',

    // Savings
    savings_title: '>> SAVINGS_GOALS.exe',
    savings_subtitle: '// Tracking long-term objectives...',
    savings_achieved: 'ACHIEVED',
    savings_in_progress: 'IN_PROGRESS'
  }
};

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
};

const defaultContext: LanguageContextType = {
  lang: 'pt',
  setLang: () => {},
  t: (key) => key,
};

export const LanguageContext = createContext<LanguageContextType>(defaultContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('pt');

  useEffect(() => {
    const savedLang = storage.getSettings().language as Language;
    if (savedLang === 'en' || savedLang === 'pt') {
      setLangState(savedLang);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    storage.updateSettings({ language: newLang });
  };

  const t = (key: keyof typeof translations['en']): string => {
    return translations[lang][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
