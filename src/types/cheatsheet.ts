export type CheatsheetCategory =
  | 'replication'
  | 'consistency'
  | 'loadBalancing'
  | 'caching'
  | 'messaging'
  | 'storage'
  | 'network'
  | 'advanced';

export interface CheatsheetOption {
  use: string;
  why: string;
}

export interface CheatsheetCard {
  id: string;
  category: CheatsheetCategory;
  title: string;
  when: string;
  options: CheatsheetOption[];
  tradeoff: string;
  interviewerProbe: string;
  relatedCaseIds: string[];
  conceptId: string | null;
}

export interface CheatsheetData {
  schemaVersion: number;
  cards: CheatsheetCard[];
}
