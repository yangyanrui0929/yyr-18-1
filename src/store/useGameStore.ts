import { create } from 'zustand';
import type { GameState, GameAction, Position, SymbolCategory, RestorationRecord, TabletFragment, Symbol } from '../types';
import { initialGameState, mockFragments, mockSymbols } from '../data/mockData';
import { verifyRestoration } from '../utils/verification';
import { restorationStorage, reputationStorage, calculateLevel, checkAchievements } from '../utils/storage';

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SELECT_FRAGMENT':
      return { ...state, selectedFragmentId: action.payload };

    case 'SELECT_SYMBOL':
      return { ...state, selectedSymbolId: action.payload };

    case 'PLACE_FRAGMENT': {
      const { id, position, rotation } = action.payload;
      return {
        ...state,
        fragments: state.fragments.map(f =>
          f.id === id
            ? { ...f, currentPosition: position, currentRotation: rotation, isPlaced: true }
            : f
        ),
      };
    }

    case 'ROTATE_FRAGMENT': {
      const { id, rotation } = action.payload;
      return {
        ...state,
        fragments: state.fragments.map(f =>
          f.id === id ? { ...f, currentRotation: rotation } : f
        ),
      };
    }

    case 'REMOVE_FRAGMENT': {
      return {
        ...state,
        fragments: state.fragments.map(f =>
          f.id === action.payload
            ? { ...f, currentPosition: undefined, currentRotation: 0, isPlaced: false }
            : f
        ),
        selectedFragmentId: state.selectedFragmentId === action.payload ? null : state.selectedFragmentId,
      };
    }

    case 'ASSOCIATE_SYMBOL': {
      const { symbolId, fragmentId } = action.payload;
      return {
        ...state,
        symbols: state.symbols.map(s =>
          s.id === symbolId ? { ...s, associatedFragmentId: fragmentId } : s
        ),
      };
    }

    case 'INDEX_SYMBOL': {
      return {
        ...state,
        symbols: state.symbols.map(s =>
          s.id === action.payload ? { ...s, isIndexed: true } : s
        ),
      };
    }

    case 'SET_ERA_ORDER':
      return { ...state, currentEraOrder: action.payload };

    case 'SET_SYMBOL_FILTER':
      return { ...state, symbolFilter: action.payload };

    case 'START_VERIFICATION': {
      const result = verifyRestoration(
        state.fragments,
        state.symbols,
        state.eras,
        state.currentEraOrder,
        state.startTime
      );
      return {
        ...state,
        isVerificationMode: true,
        showVerification: true,
        fragments: state.fragments.map(f => {
          if (!f.isPlaced || !f.currentPosition) return f;
          const isCorrect =
            f.currentPosition.x === f.correctPosition.x &&
            f.currentPosition.y === f.correctPosition.y &&
            (f.currentRotation || 0) === f.correctRotation;
          return { ...f, isCorrectlyPlaced: isCorrect };
        }),
      };
    }

    case 'SUBMIT_RESTORATION': {
      restorationStorage.save(action.payload);
      
      const currentRep = reputationStorage.get();
      const newAchievements = checkAchievements(action.payload, currentRep);
      const newPoints = currentRep.totalPoints + action.payload.reputationEarned;
      const { level, levelName } = calculateLevel(newPoints);
      
      const updatedRep = {
        ...currentRep,
        totalPoints: newPoints,
        level,
        levelName,
        achievements: [...new Set([...currentRep.achievements, ...newAchievements])],
        totalRestorations: currentRep.totalRestorations + 1,
        perfectRestorations: currentRep.perfectRestorations + (action.payload.accuracyScore >= 95 ? 1 : 0),
      };
      
      reputationStorage.save(updatedRep);
      
      return {
        ...state,
        showVerification: false,
        isVerificationMode: false,
      };
    }

    case 'CLOSE_VERIFICATION':
      return {
        ...state,
        showVerification: false,
        isVerificationMode: false,
        fragments: state.fragments.map(f => ({ ...f, isCorrectlyPlaced: undefined })),
      };

    case 'RESET_WORKSPACE':
      return {
        ...initialGameState,
        fragments: mockFragments.map(f => ({ ...f, currentRotation: 0, isPlaced: false })),
        symbols: mockSymbols.map(s => ({ ...s, isIndexed: false })),
        startTime: Date.now(),
      };

    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

interface GameStore extends GameState {
  dispatch: (action: GameAction) => void;
  selectFragment: (id: string | null) => void;
  selectSymbol: (id: string | null) => void;
  placeFragment: (id: string, position: Position, rotation: number) => void;
  rotateFragment: (id: string, rotation: number) => void;
  removeFragment: (id: string) => void;
  associateSymbol: (symbolId: string, fragmentId: string) => void;
  indexSymbol: (symbolId: string) => void;
  setEraOrder: (order: string[]) => void;
  setSymbolFilter: (filter: SymbolCategory | 'all') => void;
  startVerification: () => void;
  submitRestoration: (record: RestorationRecord) => void;
  closeVerification: () => void;
  resetWorkspace: () => void;
  getSelectedFragment: () => TabletFragment | undefined;
  getSelectedSymbol: () => Symbol | undefined;
  getPlacedFragments: () => TabletFragment[];
  getUnplacedFragments: () => TabletFragment[];
  getFilteredSymbols: () => Symbol[];
  getCompletionPercentage: () => number;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialGameState,

  dispatch: (action) => set(state => gameReducer(state, action)),

  selectFragment: (id) => set(state => gameReducer(state, { type: 'SELECT_FRAGMENT', payload: id })),
  selectSymbol: (id) => set(state => gameReducer(state, { type: 'SELECT_SYMBOL', payload: id })),
  
  placeFragment: (id, position, rotation) => 
    set(state => gameReducer(state, { type: 'PLACE_FRAGMENT', payload: { id, position, rotation } })),
  
  rotateFragment: (id, rotation) =>
    set(state => gameReducer(state, { type: 'ROTATE_FRAGMENT', payload: { id, rotation } })),
  
  removeFragment: (id) =>
    set(state => gameReducer(state, { type: 'REMOVE_FRAGMENT', payload: id })),
  
  associateSymbol: (symbolId, fragmentId) =>
    set(state => gameReducer(state, { type: 'ASSOCIATE_SYMBOL', payload: { symbolId, fragmentId } })),
  
  indexSymbol: (symbolId) =>
    set(state => gameReducer(state, { type: 'INDEX_SYMBOL', payload: symbolId })),
  
  setEraOrder: (order) =>
    set(state => gameReducer(state, { type: 'SET_ERA_ORDER', payload: order })),
  
  setSymbolFilter: (filter) =>
    set(state => gameReducer(state, { type: 'SET_SYMBOL_FILTER', payload: filter })),
  
  startVerification: () =>
    set(state => gameReducer(state, { type: 'START_VERIFICATION' })),
  
  submitRestoration: (record) =>
    set(state => gameReducer(state, { type: 'SUBMIT_RESTORATION', payload: record })),
  
  closeVerification: () =>
    set(state => gameReducer(state, { type: 'CLOSE_VERIFICATION' })),
  
  resetWorkspace: () =>
    set(state => gameReducer(state, { type: 'RESET_WORKSPACE' })),

  getSelectedFragment: () => {
    const state = get();
    return state.fragments.find(f => f.id === state.selectedFragmentId);
  },

  getSelectedSymbol: () => {
    const state = get();
    return state.symbols.find(s => s.id === state.selectedSymbolId);
  },

  getPlacedFragments: () => {
    return get().fragments.filter(f => f.isPlaced);
  },

  getUnplacedFragments: () => {
    return get().fragments.filter(f => !f.isPlaced);
  },

  getFilteredSymbols: () => {
    const state = get();
    if (state.symbolFilter === 'all') return state.symbols;
    return state.symbols.filter(s => s.category === state.symbolFilter);
  },

  getCompletionPercentage: () => {
    const state = get();
    const placedCount = state.fragments.filter(f => f.isPlaced).length;
    const indexedCount = state.symbols.filter(s => s.isIndexed).length;
    const eraComplete = state.currentEraOrder.length === state.eras.length;

    return Math.round(
      (placedCount / state.fragments.length) * 40 +
      (indexedCount / state.symbols.length) * 30 +
      (eraComplete ? 30 : 0)
    );
  },
}));
