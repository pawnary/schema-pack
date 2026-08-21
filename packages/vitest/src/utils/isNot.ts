import type { MatcherState } from 'vitest';

export default function isNot(state: MatcherState): string {
  if (state.isNot) {
    return 'not ';
  }

  return '';
}
