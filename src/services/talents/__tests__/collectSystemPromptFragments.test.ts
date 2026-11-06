import {collectSystemPromptFragments} from '../index';
import type {SystemPromptContext} from '../types';

const ctx: Omit<SystemPromptContext, 'activeTalents'> = {
  now: new Date('2026-07-15T12:00:00Z'),
  maxToolTurns: 5,
};

describe('collectSystemPromptFragments', () => {
  it('returns nothing for retained talents without a system prompt fragment', () => {
    expect(
      collectSystemPromptFragments(['calculate', 'datetime'], ctx),
    ).toEqual([]);
  });

  it('does not register retired internet-search talents', () => {
    expect(
      collectSystemPromptFragments(['web_search', 'read_url'], ctx),
    ).toEqual([]);
  });

  it('returns nothing when no talents are enabled', () => {
    expect(collectSystemPromptFragments([], ctx)).toEqual([]);
  });

  it('ignores unknown talent names', () => {
    expect(collectSystemPromptFragments(['not_a_real_talent'], ctx)).toEqual(
      [],
    );
  });
});
