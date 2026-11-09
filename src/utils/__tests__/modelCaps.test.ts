import {CapabilityEnv, resolveModelCaps} from '../modelCaps';
import {Model, ModelOrigin} from '../types';

const env = (overrides: Partial<CapabilityEnv> = {}): CapabilityEnv => ({
  isMultimodalActive: false,
  activeContextSettings: undefined,
  activeModelId: undefined,
  ...overrides,
});

const localModel = (overrides: Partial<Model> = {}): Model =>
  ({id: 'local-1', origin: ModelOrigin.LOCAL, ...overrides}) as Model;

describe('resolveModelCaps for on-device models', () => {
  it('reports unknown for no model', () => {
    expect(resolveModelCaps(undefined, env())).toEqual({
      vision: 'unknown',
      visionActive: false,
    });
  });

  it.each([
    [true, 'yes'],
    [false, 'no'],
    [undefined, 'unknown'],
  ])('maps local multimodal support %p to %s', (supportsMultimodal, vision) => {
    expect(
      resolveModelCaps(localModel({supportsMultimodal}), env()).vision,
    ).toBe(vision);
  });

  it('prefers the Hugging Face context window over GGUF metadata', () => {
    const model = localModel({
      hfModel: {specs: {gguf: {context_length: 8192}}} as any,
      ggufMetadata: {context_length: 4096} as any,
    });
    expect(resolveModelCaps(model, env()).contextLength).toBe(8192);
  });

  it('falls through to GGUF metadata when the Hugging Face window is zero', () => {
    const model = localModel({
      hfModel: {specs: {gguf: {context_length: 0}}} as any,
      ggufMetadata: {context_length: 4096} as any,
    });
    expect(resolveModelCaps(model, env()).contextLength).toBe(4096);
  });

  it('reports an absent window rather than zero', () => {
    const model = localModel({ggufMetadata: {context_length: 0} as any});
    expect(resolveModelCaps(model, env()).contextLength).toBeUndefined();
  });

  it('reports live session state only for the active model', () => {
    const model = localModel({id: 'local-1'});
    const caps = resolveModelCaps(
      model,
      env({
        activeModelId: 'local-1',
        isMultimodalActive: true,
        activeContextSettings: {n_ctx: 4096} as any,
      }),
    );
    expect(caps.visionActive).toBe(true);
    expect(caps.effectiveContextLength).toBe(4096);
  });

  it('never borrows the active session state for another model', () => {
    const caps = resolveModelCaps(
      localModel({id: 'local-2'}),
      env({
        activeModelId: 'local-1',
        isMultimodalActive: true,
        activeContextSettings: {n_ctx: 4096} as any,
      }),
    );
    expect(caps.visionActive).toBe(false);
    expect(caps.effectiveContextLength).toBeUndefined();
  });

  it('treats a zero session window as absent', () => {
    const caps = resolveModelCaps(
      localModel(),
      env({activeModelId: 'local-1', activeContextSettings: {n_ctx: 0} as any}),
    );
    expect(caps.effectiveContextLength).toBeUndefined();
  });
});
