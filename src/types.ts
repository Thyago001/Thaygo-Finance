/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  timestamp: number;
}

export interface BudgetItem {
  id: string;
  category: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'PENDING';
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  targetDate: string;
  coverImage?: string;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  label: string;
  status: 'ACHIEVED' | 'IN_PROGRESS' | 'PENDING';
}

export interface LearningCard {
  id: string;
  title: string;
  tag: string;
  desc: string;
  status: string;
  read: string;
}

export interface UserProfile {
  email: string;
  name: string;
  avatar?: string; // base64 or DiceBear seed
  avatarCustom?: boolean; // true = custom upload, false = dicebear
}

export interface AppSettings {
  language: 'pt' | 'en';
  initialBalance: number;
}

export type View = 'DASHBOARD' | 'BUDGET' | 'SAVINGS' | 'LEARNING_HUB' | 'SETTINGS';
