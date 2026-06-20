export interface EdgePatterns {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

export interface Position {
  x: number;
  y: number;
}

export type Rarity = 'common' | 'rare' | 'legendary';
export type SymbolCategory = 'astronomy' | 'ritual' | 'technology' | 'biology' | 'unknown';

export interface TabletFragment {
  id: string;
  name: string;
  eraId: string;
  correctPosition: Position;
  correctRotation: number;
  edgePatterns: EdgePatterns;
  symbolIds: string[];
  texture: string;
  rarity: Rarity;
  currentPosition?: Position;
  currentRotation?: number;
  isPlaced?: boolean;
  isCorrectlyPlaced?: boolean;
}

export interface Symbol {
  id: string;
  name: string;
  meaning: string;
  category: SymbolCategory;
  icon: string;
  eraAssociations: string[];
  significance: number;
  isIndexed?: boolean;
  associatedFragmentId?: string;
}

export interface Era {
  id: string;
  name: string;
  order: number;
  yearStart: number;
  yearEnd: number;
  description: string;
  color: string;
}

export interface School {
  id: string;
  name: string;
  founder: string;
  philosophy: string;
  color: string;
}

export interface Controversy {
  id: string;
  tabletId: string;
  schoolId: string;
  viewpoint: string;
  supportCount: number;
  evidence: string;
}

export interface RestorationRecord {
  id: string;
  timestamp: number;
  completionScore: number;
  accuracyScore: number;
  placedFragments: string[];
  symbolAssociations: Record<string, string>;
  eraOrdering: string[];
  reputationEarned: number;
  timeSpent: number;
}

export interface Reputation {
  id: string;
  totalPoints: number;
  level: number;
  levelName: string;
  achievements: string[];
  totalRestorations: number;
  perfectRestorations: number;
}

export interface GameState {
  fragments: TabletFragment[];
  symbols: Symbol[];
  eras: Era[];
  schools: School[];
  controversies: Controversy[];
  selectedFragmentId: string | null;
  selectedSymbolId: string | null;
  currentEraOrder: string[];
  isVerificationMode: boolean;
  startTime: number;
  showVerification: boolean;
  symbolFilter: SymbolCategory | 'all';
}

export type GameAction =
  | { type: 'SELECT_FRAGMENT'; payload: string | null }
  | { type: 'SELECT_SYMBOL'; payload: string | null }
  | { type: 'PLACE_FRAGMENT'; payload: { id: string; position: Position; rotation: number } }
  | { type: 'ROTATE_FRAGMENT'; payload: { id: string; rotation: number } }
  | { type: 'REMOVE_FRAGMENT'; payload: string }
  | { type: 'ASSOCIATE_SYMBOL'; payload: { symbolId: string; fragmentId: string } }
  | { type: 'INDEX_SYMBOL'; payload: string }
  | { type: 'SET_ERA_ORDER'; payload: string[] }
  | { type: 'SET_SYMBOL_FILTER'; payload: SymbolCategory | 'all' }
  | { type: 'START_VERIFICATION' }
  | { type: 'SUBMIT_RESTORATION'; payload: RestorationRecord }
  | { type: 'CLOSE_VERIFICATION' }
  | { type: 'RESET_WORKSPACE' }
  | { type: 'LOAD_STATE'; payload: Partial<GameState> };

export interface VerificationResult {
  completionScore: number;
  accuracyScore: number;
  fragmentAccuracy: number;
  symbolAccuracy: number;
  eraAccuracy: number;
  matchedEdges: number;
  totalEdges: number;
  errors: string[];
  reputationEarned: number;
}

export const STORAGE_KEYS = {
  TABLETS: 'xenoarch_data_tablets',
  SYMBOLS: 'xenoarch_data_symbols',
  ERAS: 'xenoarch_data_eras',
  SCHOOLS: 'xenoarch_data_schools',
  RESTORATIONS: 'xenoarch_record_restorations',
  REPUTATION: 'xenoarch_record_reputation',
} as const;

export const LEVEL_NAMES = [
  '学徒考古学家',
  '初级考古学家',
  '中级考古学家',
  '高级考古学家',
  '首席考古学家',
  '星际考古大师',
  '文明破译师',
  '历史守望者',
  '时空学者',
  '万古传承者',
];
