import DeviceInfo from 'react-native-device-info';

import NativeHardwareInfo from '../../../specs/NativeHardwareInfo';
import {readDeviceSignals} from '../signals';

describe('readDeviceSignals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (DeviceInfo.getTotalMemory as jest.Mock).mockResolvedValue(8 * 1e9);
  });

  it('reads ram + cpu signals on Android', async () => {
    (NativeHardwareInfo.getCPUInfo as jest.Mock).mockResolvedValue({
      cores: 8,
      socModel: 'Tensor G3',
      hardware: 'shiba',
      features: ['dotprod', 'i8mm'],
      maxFreqMhz: 2900,
    });

    const signals = await readDeviceSignals();

    expect(signals).toEqual({
      ramBytes: 8 * 1e9,
      socModel: 'Tensor G3',
      hardware: 'shiba',
      cpuFeatures: ['dotprod', 'i8mm'],
      maxFreqMhz: 2900,
    });
  });

  it('aliases asimddp to the dotprod feature name the rules match', async () => {
    (NativeHardwareInfo.getCPUInfo as jest.Mock).mockResolvedValue({
      cores: 8,
      socModel: 'MT6769V/CZ',
      hardware: 'qcom',
      features: ['asimd', 'asimddp'],
      maxFreqMhz: 2000,
    });

    const signals = await readDeviceSignals();

    expect(signals.cpuFeatures).toEqual(['asimd', 'asimddp', 'dotprod']);
  });

  it('degrades to a ram floor when the total-memory read throws', async () => {
    (DeviceInfo.getTotalMemory as jest.Mock).mockRejectedValue(
      new Error('mem boom'),
    );
    (NativeHardwareInfo.getCPUInfo as jest.Mock).mockRejectedValue(
      new Error('cpu boom'),
    );

    const signals = await readDeviceSignals();

    expect(signals.ramBytes).toBeGreaterThan(0);
    expect(signals.ramBytes).toBeLessThan(3 * 1024 * 1024 * 1024);
  });

  it('degrades to ram-only when the native CPU read throws', async () => {
    (NativeHardwareInfo.getCPUInfo as jest.Mock).mockRejectedValue(
      new Error('cpu boom'),
    );

    const signals = await readDeviceSignals();

    expect(signals).toEqual({ramBytes: 8 * 1e9});
  });
});
