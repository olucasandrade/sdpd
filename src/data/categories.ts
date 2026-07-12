export interface CategoryDef {
  key: string;
  range: [number, number];
  color: 'amber' | 'cyan';
}

export const CATEGORIES: CategoryDef[] = [
  { key: 'category.replication', range: [1, 3], color: 'amber' },
  { key: 'category.consistency', range: [4, 8], color: 'cyan' },
  { key: 'category.loadBalancing', range: [9, 13], color: 'amber' },
  { key: 'category.caching', range: [14, 17], color: 'cyan' },
  { key: 'category.messaging', range: [18, 21], color: 'amber' },
  { key: 'category.storage', range: [22, 25], color: 'cyan' },
  { key: 'category.network', range: [26, 29], color: 'amber' },
  { key: 'category.advanced', range: [30, 33], color: 'cyan' },
];
