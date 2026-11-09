/**
 * Flash Attention Compatibility Tests
 * Based on FLASH_ATTN_TEST_MATRIX.md
 */

import {
  inferBackendType,
  isCacheTypeVSafe,
  isCacheTypeKSafe,
  getAllowedCacheTypeVOptions,
  getAllowedCacheTypeKOptions,
  BackendType,
  FlashAttnType,
} from '../flashAttnCompatibility';
import {CacheType} from '../types';

describe('flashAttnCompatibility', () => {
  describe('inferBackendType', () => {
    describe('Android platform', () => {
      it('infers CPU, OpenCL, and Hexagon backends from Android devices', async () => {
        expect(await inferBackendType(['CPU'])).toBe('cpu');
        expect(await inferBackendType([])).toBe('cpu');
        expect(await inferBackendType(undefined)).toBe('cpu');
        expect(await inferBackendType(['GPU'])).toBe('opencl');
        expect(await inferBackendType(['GPU:0'])).toBe('opencl');
        expect(await inferBackendType(['HTP'])).toBe('hexagon');
        expect(await inferBackendType(['HTP:0'])).toBe('hexagon');
      });
    });
  });

  describe('isCacheTypeVSafe', () => {
    describe('Non-quantized cache types (f16/f32) - Always Safe', () => {
      const testCases: Array<{
        cacheType: CacheType | string;
        flashAttn: FlashAttnType;
        backend: BackendType;
      }> = [
        {cacheType: CacheType.F32, flashAttn: 'auto', backend: 'opencl'},
        {cacheType: CacheType.F32, flashAttn: 'on', backend: 'cpu'},
        {cacheType: CacheType.F32, flashAttn: 'off', backend: 'hexagon'},
        {cacheType: 'f16', flashAttn: 'auto', backend: 'blas'},
      ];

      testCases.forEach(({cacheType, flashAttn, backend}) => {
        it(`should be safe for ${cacheType} with flash_attn=${flashAttn} on ${backend}`, () => {
          const result = isCacheTypeVSafe(cacheType, flashAttn, backend);
          expect(result.safe).toBe(true);
        });
      });
    });

    describe('Quantized V with flash_attn=off - Always Unsafe', () => {
      const testCases: Array<{
        cacheType: CacheType;
        backend: BackendType;
      }> = [
        {cacheType: CacheType.Q4_0, backend: 'opencl'},
        {cacheType: CacheType.Q5_0, backend: 'cpu'},
        {cacheType: CacheType.Q5_1, backend: 'hexagon'},
        {cacheType: CacheType.IQ4_NL, backend: 'blas'},
      ];

      testCases.forEach(({cacheType, backend}) => {
        it(`should be unsafe for ${cacheType} with flash_attn=off on ${backend}`, () => {
          const result = isCacheTypeVSafe(cacheType, 'off', backend);
          expect(result.safe).toBe(false);
          expect(result.reason).toContain('requires flash attention');
        });
      });
    });

    describe('Quantized V with flash_attn=on', () => {
;

      it('should be safe for CPU backend', () => {
        const result = isCacheTypeVSafe(CacheType.Q8_0, 'on', 'cpu');
        expect(result.safe).toBe(true);
      });

      it('should be safe for BLAS backend', () => {
        const result = isCacheTypeVSafe(CacheType.Q8_0, 'on', 'blas');
        expect(result.safe).toBe(true);
      });

      it('should be unsafe for OpenCL backend', () => {
        const result = isCacheTypeVSafe(CacheType.Q8_0, 'on', 'opencl');
        expect(result.safe).toBe(false);
        expect(result.reason).toContain(
          'OpenCL does not support flash attention',
        );
      });

      it('should be unsafe for Hexagon backend', () => {
        const result = isCacheTypeVSafe(CacheType.Q8_0, 'on', 'hexagon');
        expect(result.safe).toBe(false);
        expect(result.reason).toContain(
          'Hexagon flash attention support varies',
        );
      });
    });

    describe('Quantized V with flash_attn=auto', () => {
;

      it('should be safe for CPU backend', () => {
        const result = isCacheTypeVSafe(CacheType.Q8_0, 'auto', 'cpu');
        expect(result.safe).toBe(true);
      });

      it('should be safe for BLAS backend', () => {
        const result = isCacheTypeVSafe(CacheType.Q8_0, 'auto', 'blas');
        expect(result.safe).toBe(true);
      });

      it('should be unsafe for OpenCL backend', () => {
        const result = isCacheTypeVSafe(CacheType.Q8_0, 'auto', 'opencl');
        expect(result.safe).toBe(false);
        expect(result.reason).toContain('OpenCL auto-disables flash attention');
      });

      it('should be unsafe for Hexagon backend', () => {
        const result = isCacheTypeVSafe(CacheType.Q8_0, 'auto', 'hexagon');
        expect(result.safe).toBe(false);
        expect(result.reason).toContain('varies by device');
      });

;

      it('should handle all quantized types with auto on OpenCL as unsafe', () => {
        const quantizedTypes = [
          CacheType.Q8_0,
          CacheType.Q4_0,
          CacheType.IQ4_NL,
        ];

        quantizedTypes.forEach(cacheType => {
          const result = isCacheTypeVSafe(cacheType, 'auto', 'opencl');
          expect(result.safe).toBe(false);
        });
      });
    });
  });

  describe('isCacheTypeKSafe', () => {
    it('should always return safe for any combination', () => {
      const cacheTypes = [
        CacheType.F16,
        CacheType.F32,
        CacheType.Q8_0,
        CacheType.Q4_0,
        CacheType.IQ4_NL,
      ];
      const flashAttnTypes: FlashAttnType[] = ['auto', 'on', 'off'];
      const backends: BackendType[] = [
        'opencl',
        'cpu',
        'hexagon',
        'blas',
      ];

      cacheTypes.forEach(cacheType => {
        flashAttnTypes.forEach(flashAttn => {
          backends.forEach(backend => {
            const result = isCacheTypeKSafe(cacheType, flashAttn, backend);
            expect(result.safe).toBe(true);
          });
        });
      });
    });
  });

  describe('getAllowedCacheTypeVOptions', () => {
    it('should disable quantized options when flash_attn=off', () => {
      const options = getAllowedCacheTypeVOptions('off', 'cpu');
      const f16Option = options.find(o => o.value === CacheType.F16);
      const f32Option = options.find(o => o.value === CacheType.F32);
      const q8Option = options.find(o => o.value === CacheType.Q8_0);
      const q4Option = options.find(o => o.value === CacheType.Q4_0);

      expect(f16Option?.disabled).toBe(false);
      expect(f32Option?.disabled).toBe(false);
      expect(q8Option?.disabled).toBe(true);
      expect(q4Option?.disabled).toBe(true);
    });

    it('should enable all options for CPU with flash_attn=on', () => {
      const options = getAllowedCacheTypeVOptions('on', 'cpu');

      options.forEach(option => {
        expect(option.disabled).toBe(false);
      });
    });

    it('should disable quantized options for OpenCL with flash_attn=on', () => {
      const options = getAllowedCacheTypeVOptions('on', 'opencl');
      const f16Option = options.find(o => o.value === CacheType.F16);
      const q8Option = options.find(o => o.value === CacheType.Q8_0);

      expect(f16Option?.disabled).toBe(false);
      expect(q8Option?.disabled).toBe(true);
      expect(q8Option?.reason).toContain('OpenCL does not support');
    });

    it('should disable quantized options for OpenCL with flash_attn=auto', () => {
      const options = getAllowedCacheTypeVOptions('auto', 'opencl');
      const f16Option = options.find(o => o.value === CacheType.F16);
      const q8Option = options.find(o => o.value === CacheType.Q8_0);

      expect(f16Option?.disabled).toBe(false);
      expect(q8Option?.disabled).toBe(true);
      expect(q8Option?.reason).toContain('auto-disables flash attention');
    });

    it('should enable all options for CPU with flash_attn=auto', () => {
      const options = getAllowedCacheTypeVOptions('auto', 'cpu');

      options.forEach(option => {
        expect(option.disabled).toBe(false);
      });
    });

    it('should disable quantized options for Hexagon with flash_attn=auto', () => {
      const options = getAllowedCacheTypeVOptions('auto', 'hexagon');
      const f16Option = options.find(o => o.value === CacheType.F16);
      const q8Option = options.find(o => o.value === CacheType.Q8_0);

      expect(f16Option?.disabled).toBe(false);
      expect(q8Option?.disabled).toBe(true);
      expect(q8Option?.reason).toContain('varies by device');
    });
  });

  describe('getAllowedCacheTypeKOptions', () => {
    it('should never disable any options', () => {
      const flashAttnTypes: FlashAttnType[] = ['auto', 'on', 'off'];
      const backends: BackendType[] = [
        'metal',
        'opencl',
        'cpu',
        'hexagon',
        'blas',
      ];

      flashAttnTypes.forEach(flashAttn => {
        backends.forEach(backend => {
          const options = getAllowedCacheTypeKOptions(flashAttn, backend);
          options.forEach(option => {
            expect(option.disabled).toBe(false);
          });
        });
      });
    });

    it('should return all cache type options', () => {
      const options = getAllowedCacheTypeKOptions('auto', 'cpu');

      expect(options.length).toBeGreaterThan(0);
      expect(options.some(o => o.value === CacheType.F16)).toBe(true);
      expect(options.some(o => o.value === CacheType.F32)).toBe(true);
      expect(options.some(o => o.value === CacheType.Q8_0)).toBe(true);
      expect(options.some(o => o.value === CacheType.Q4_0)).toBe(true);
    });
  });

  describe('Android-safe configurations', () => {
    describe('Android OpenCL GPU', () => {
      it('should validate Recommended configuration as safe', () => {
        const kResult = isCacheTypeKSafe(CacheType.F16, 'off', 'opencl');
        const vResult = isCacheTypeVSafe(CacheType.F16, 'off', 'opencl');

        expect(kResult.safe).toBe(true);
        expect(vResult.safe).toBe(true);
      });

      it('should validate K Optimized configuration as safe', () => {
        const kResult = isCacheTypeKSafe(CacheType.Q8_0, 'off', 'opencl');
        const vResult = isCacheTypeVSafe(CacheType.F16, 'off', 'opencl');

        expect(kResult.safe).toBe(true);
        expect(vResult.safe).toBe(true);
      });

      it('should validate Bad Config 1 (quantized V with off) as unsafe', () => {
        const vResult = isCacheTypeVSafe(CacheType.Q8_0, 'off', 'opencl');
        expect(vResult.safe).toBe(false);
      });

      it('should validate Bad Config 2 (quantized V with auto) as unsafe', () => {
        const vResult = isCacheTypeVSafe(CacheType.Q8_0, 'auto', 'opencl');
        expect(vResult.safe).toBe(false);
      });
    });

    describe('Android Hexagon HTP', () => {
      it('should validate Conservative configuration as safe', () => {
        const kResult = isCacheTypeKSafe(CacheType.F16, 'off', 'hexagon');
        const vResult = isCacheTypeVSafe(CacheType.F16, 'off', 'hexagon');

        expect(kResult.safe).toBe(true);
        expect(vResult.safe).toBe(true);
      });

      it('should validate K Optimized configuration as safe', () => {
        const kResult = isCacheTypeKSafe(CacheType.Q8_0, 'off', 'hexagon');
        const vResult = isCacheTypeVSafe(CacheType.F16, 'off', 'hexagon');

        expect(kResult.safe).toBe(true);
        expect(vResult.safe).toBe(true);
      });

      it('should validate Experimental configuration as risky', () => {
        const vResult = isCacheTypeVSafe(CacheType.Q8_0, 'auto', 'hexagon');
        expect(vResult.safe).toBe(false);
      });
    });

    describe('Android CPU Fallback', () => {
      const testConfigs = [
        {
          name: 'Default',
          flashAttn: 'auto' as FlashAttnType,
          cacheK: CacheType.F16,
          cacheV: CacheType.F16,
        },
        {
          name: 'Memory Optimized',
          flashAttn: 'auto' as FlashAttnType,
          cacheK: CacheType.Q8_0,
          cacheV: CacheType.Q8_0,
        },
      ];

      testConfigs.forEach(({name, flashAttn, cacheK, cacheV}) => {
        it(`should validate ${name} configuration as safe`, () => {
          const kResult = isCacheTypeKSafe(cacheK, flashAttn, 'cpu');
          const vResult = isCacheTypeVSafe(cacheV, flashAttn, 'cpu');

          expect(kResult.safe).toBe(true);
          expect(vResult.safe).toBe(true);
        });
      });
    });
  });
});
