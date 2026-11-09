import {NativeModules, NativeEventEmitter} from 'react-native';

import * as RNFS from '@dr.pogodin/react-native-fs';

import {basicModel} from '../../../../jest/fixtures/models';

import {DownloadManager} from '../DownloadManager';
import {ensureNotificationPermission} from '../../../utils/androidPermission';

jest.mock('../../../utils/androidPermission', () => ({
  ensureNotificationPermission: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native', () => {
  // Create a shared mock for DownloadModule inside the factory
  const mockDownloadModule = {
    startDownload: jest.fn(),
    cancelDownload: jest.fn(),
    getActiveDownloads: jest.fn(),
    reattachDownloadObserver: jest.fn(),
    addListener: jest.fn(),
    removeListeners: jest.fn(),
    pauseDownload: jest.fn(),
    resumeDownload: jest.fn(),
    retryDownload: jest.fn(),
    logDownloadDatabase: jest.fn(),
  };

  return {
    NativeModules: {
      DownloadModule: mockDownloadModule,
    },
    NativeEventEmitter: jest.fn(),
    Appearance: {
      getColorScheme: jest.fn(() => 'light'),
    },
    TurboModuleRegistry: {
      getEnforcing: jest.fn((name: string) => {
        if (name === 'DownloadModule') {
          return mockDownloadModule;
        }
        return null;
      }),
    },
  };
});

describe('DownloadManager', () => {
  let downloadManager: DownloadManager;
  let mockEventEmitter: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock event emitter
    mockEventEmitter = {
      addListener: jest.fn(),
      removeAllListeners: jest.fn(),
    };
    (NativeEventEmitter as jest.Mock).mockReturnValue(mockEventEmitter);

    downloadManager = new DownloadManager();
  });

  it('initializes correctly', () => {
    expect(downloadManager).toBeDefined();
    expect(NativeEventEmitter).toHaveBeenCalled();
    expect(mockEventEmitter.addListener).toHaveBeenCalledWith(
      'onDownloadProgress',
      expect.any(Function),
    );
    expect(mockEventEmitter.addListener).toHaveBeenCalledWith(
      'onDownloadComplete',
      expect.any(Function),
    );
    expect(mockEventEmitter.addListener).toHaveBeenCalledWith(
      'onDownloadFailed',
      expect.any(Function),
    );
  });

  it('starts a download on Android', async () => {
    NativeModules.DownloadModule.startDownload.mockResolvedValue({
      downloadId: 'download123',
    });

    const callbacks = {
      onStart: jest.fn(),
      onProgress: jest.fn(),
      onComplete: jest.fn(),
      onError: jest.fn(),
    };

    downloadManager.setCallbacks(callbacks);

    await downloadManager.startDownload(basicModel, '/path/to/model.bin');

    expect(RNFS.mkdir).toHaveBeenCalledWith('/path/to');
    expect(NativeModules.DownloadModule.startDownload).toHaveBeenCalledWith(
      basicModel.downloadUrl,
      expect.objectContaining({
        destination: '/path/to/model.bin',
      }),
    );
    expect(callbacks.onStart).toHaveBeenCalledWith('model-1');
    expect(downloadManager.isDownloading('model-1')).toBe(true);
  });

  it('asks for notification permission before starting on Android', async () => {
    const order: string[] = [];
    (ensureNotificationPermission as jest.Mock).mockImplementation(async () => {
      order.push('permission');
    });
    NativeModules.DownloadModule.startDownload.mockImplementation(async () => {
      order.push('start');
      return {downloadId: 'download123'};
    });

    await downloadManager.startDownload(basicModel, '/path/to/model.bin');

    expect(order).toEqual(['permission', 'start']);
  });

  it('passes the progress Android kept to onError on failure', async () => {
    NativeModules.DownloadModule.startDownload.mockResolvedValue({
      downloadId: 'download123',
    });
    const onError = jest.fn();
    downloadManager.setCallbacks({onError});
    await downloadManager.startDownload(basicModel, '/path/to/model.bin');
    const [, emitFailure] = mockEventEmitter.addListener.mock.calls.find(
      ([name]: [string]) => name === 'onDownloadFailed',
    );

    emitFailure({downloadId: 'download123', error: 'stalled', progress: 40});

    expect(onError).toHaveBeenCalledWith('model-1', expect.any(Error), 40);
    expect(downloadManager.isDownloading('model-1')).toBe(false);
  });

  it('does not forward the HF auth token to the native module for a non-HF URL (Android)', async () => {
    NativeModules.DownloadModule.startDownload.mockResolvedValue({
      downloadId: 'download-off-host',
    });

    const offHostModel = {
      ...basicModel,
      id: 'off-host-model',
      downloadUrl: 'https://evil.example.com/test/test-model-1',
    };

    await downloadManager.startDownload(
      offHostModel,
      '/path/to/model.bin',
      'secret-token',
    );

    const config = NativeModules.DownloadModule.startDownload.mock.calls[0][1];
    expect(config.authToken).toBeUndefined();
  });
});
