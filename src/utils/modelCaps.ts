import type {ContextInitParams, Model} from './types';

/**
 * Effective capabilities of an on-device model. Declared model facts and
 * current native-session facts remain separate so inactive cards never borrow
 * another model's loaded context state.
 */
export interface ModelCapabilityView {
  vision: 'yes' | 'no' | 'unknown';
  visionActive: boolean;
  contextLength?: number;
  effectiveContextLength?: number;
}

export interface CapabilityEnv {
  isMultimodalActive: boolean;
  activeContextSettings: ContextInitParams | undefined;
  activeModelId: string | undefined;
}

const UNKNOWN: ModelCapabilityView = {
  vision: 'unknown',
  visionActive: false,
};

const positive = (value: number | undefined): number | undefined =>
  value !== undefined && value > 0 ? value : undefined;

const triState = (value: boolean | undefined): 'yes' | 'no' | 'unknown' => {
  if (value === undefined) return 'unknown';
  return value ? 'yes' : 'no';
};

export function resolveModelCaps(
  model: Model | undefined,
  env: CapabilityEnv,
): ModelCapabilityView {
  if (!model) return UNKNOWN;
  const isActiveModel = model.id === env.activeModelId;
  return {
    vision: triState(model.supportsMultimodal),
    visionActive: isActiveModel && env.isMultimodalActive,
    contextLength:
      positive(model.hfModel?.specs?.gguf?.context_length) ??
      positive(model.ggufMetadata?.context_length),
    effectiveContextLength: isActiveModel
      ? positive(env.activeContextSettings?.n_ctx)
      : undefined,
  };
}
