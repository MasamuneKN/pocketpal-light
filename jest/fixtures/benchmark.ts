import {BenchmarkResult} from '../../src/utils/types';

export const mockResult: BenchmarkResult = {
  config: {
    pp: 512,
    tg: 256,
    pl: 1,
    nr: 3,
    label: 'Test Config',
  },
  modelDesc: 'Test Model',
  modelSize: 1000000,
  modelNParams: 7000000000,
  ppAvg: 20.5,
  ppStd: 1.2,
  tgAvg: 30.5,
  tgStd: 2.1,
  timestamp: '2024-03-20T10:00:00.000Z',
  modelId: 'test-model-id',
  modelName: 'Test Model',
  filename: 'test-model.gguf',
  uuid: 'test-uuid',
  peakMemoryUsage: {
    total: 1000000,
    used: 500000,
    percentage: 50,
  },
  wallTimeMs: 10000,
};
