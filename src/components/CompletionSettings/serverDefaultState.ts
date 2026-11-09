import {COMPLETION_PARAMS_METADATA} from '../../utils/modelSettings';
import type {SamplerParam} from '../../utils/samplerParams';

export const stepOf = (name: string): number =>
  COMPLETION_PARAMS_METADATA[name as SamplerParam]?.step ?? 0.01;
