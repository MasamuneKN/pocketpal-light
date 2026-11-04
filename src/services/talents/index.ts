import {RenderHtmlEngine} from './RenderHtmlEngine';
import {CalculateEngine} from './CalculateEngine';
import {DatetimeEngine} from './DatetimeEngine';
import {talentRegistry} from './TalentRegistry';
import type {ToolDefinition, SystemPromptContext} from './types';

export {TalentRegistry, talentRegistry} from './TalentRegistry';
export {TalentUIRegistry, talentUIRegistry} from './TalentUIRegistry';
export type {TalentUI} from './TalentUIRegistry';
export {RenderHtmlEngine} from './RenderHtmlEngine';
export {CalculateEngine} from './CalculateEngine';
export {DatetimeEngine} from './DatetimeEngine';
export type {
  TalentEngine,
  TalentResult,
  ToolDefinition,
  SystemPromptContext,
} from './types';

let registered = false;

/**
 * Register built-in talent engines. UI renderers register separately via
 * `registerDefaultTalentUIs` — keeps the talent UI out of this service module's
 * graph so engine-logic consumers don't load the bottom-sheet tree.
 */
export function registerDefaultTalents(): void {
  if (registered) {
    return;
  }
  talentRegistry.register(new RenderHtmlEngine());
  talentRegistry.register(new CalculateEngine());
  talentRegistry.register(new DatetimeEngine());
  registered = true;
}

/**
 * Derive OpenAI-format tool schemas from registered engines.
 *
 * When `talentNames` is provided, only engines matching those names are
 * included — this ensures a Pal's completionSettings.tools matches its
 * pact.talents (the single source of truth for what the Pal advertises
 * to the model and what the dispatch loop will accept).
 *
 * Calls registerDefaultTalents() internally (idempotent).
 */
export function deriveToolSchemas(talentNames?: string[]): ToolDefinition[] {
  registerDefaultTalents();
  const engines = talentRegistry.getAll();
  if (!talentNames) {
    return engines.map(engine => engine.toToolDefinition());
  }
  const wanted = new Set(talentNames);
  return engines
    .filter(engine => wanted.has(engine.name))
    .map(engine => engine.toToolDefinition());
}

/**
 * Fragments are folded into the single leading system message by
 * `assembleMessages`; a talent never emits its own system message.
 */
export function collectSystemPromptFragments(
  talentNames: string[],
  ctx: Omit<SystemPromptContext, 'activeTalents'>,
): string[] {
  registerDefaultTalents();
  const wanted = new Set(talentNames);
  const engineCtx: SystemPromptContext = {...ctx, activeTalents: wanted};
  return talentRegistry
    .getAll()
    .filter(engine => wanted.has(engine.name))
    .map(engine => engine.systemPromptFragment?.(engineCtx))
    .filter((fragment): fragment is string => !!fragment && !!fragment.trim());
}

/**
 * Test helper: reset the `registered` guard so `registerDefaultTalents()` will
 * re-register engines after a `talentRegistry.reset()` call in test teardown.
 */
export function resetRegisteredFlag(): void {
  registered = false;
}
