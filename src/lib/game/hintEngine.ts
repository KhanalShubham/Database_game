import type { HintConfig } from './levels';

export function getHint(hints: HintConfig, stage: number): { text: string; stage: number; exhausted: boolean } {
  const texts = [hints.level1, hints.level2, hints.level3];
  const i = Math.min(Math.max(stage, 0), texts.length - 1);
  return {
    text: texts[i],
    stage: i,
    exhausted: stage >= texts.length - 1,
  };
}
