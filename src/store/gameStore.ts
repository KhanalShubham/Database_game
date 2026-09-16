import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GameState = 'INTRO' | 'MAP' | 'LEVEL';

export interface GameStore {
  gameState: GameState;
  currentLevelId: number | null;
  unlockedLevelId: number;
  xp: number;
  health: number;
  unlockedConcepts: string[];

  setGameState: (state: GameState) => void;
  startLevel: (id: number) => void;
  completeLevel: (id: number, xpGained: number, unlocks?: string[], healthChange?: number) => void;
  addXP: (amount: number) => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      gameState: 'INTRO',
      currentLevelId: null,
      unlockedLevelId: 1,
      xp: 0,
      health: 37,
      unlockedConcepts: [],

      setGameState: (state) => set({ gameState: state }),

      startLevel: (id) =>
        set({
          gameState: 'LEVEL',
          currentLevelId: id,
        }),

      completeLevel: (id, xpGained, unlocks = [], healthChange = 5) =>
        set((state) => ({
          unlockedLevelId: Math.max(state.unlockedLevelId, id + 1),
          xp: state.xp + xpGained,
          unlockedConcepts: [...new Set([...state.unlockedConcepts, ...unlocks])],
          health: Math.min(100, Math.max(0, state.health + healthChange)),
          gameState: 'MAP',
          currentLevelId: null,
        })),

      addXP: (amount) => set((state) => ({ xp: state.xp + amount })),

      takeDamage: (amount) =>
        set((state) => ({
          health: Math.max(0, state.health - amount),
        })),

      heal: (amount) =>
        set((state) => ({
          health: Math.min(100, state.health + amount),
        })),
    }),
    {
      name: 'database-zero-progress',
      partialize: (state) => ({
        unlockedLevelId: state.unlockedLevelId,
        xp: state.xp,
        health: state.health,
        unlockedConcepts: state.unlockedConcepts,
        gameState: state.gameState === 'LEVEL' ? 'MAP' : state.gameState,
      }),
    },
  ),
);
