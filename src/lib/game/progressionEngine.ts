import { worlds } from './levels';

export function worldForLevel(id: number) {
  return worlds.find((w) => id >= w.levelRange[0] && id <= w.levelRange[1]);
}

export function isLevelUnlocked(levelId: number, unlockedLevelId: number) {
  return levelId <= unlockedLevelId;
}

export function isLevelCompleted(levelId: number, unlockedLevelId: number) {
  return levelId < unlockedLevelId;
}
