import * as RNFS from '@dr.pogodin/react-native-fs';
import {persistChatImages} from '../chatImageStorage';

jest.mock('@dr.pogodin/react-native-fs', () => ({
  DocumentDirectoryPath: '/documents',
  exists: jest.fn(),
  mkdir: jest.fn(),
  copyFile: jest.fn(),
  unlink: jest.fn(),
}));

const mockExists = RNFS.exists as jest.Mock;
const mockMkdir = RNFS.mkdir as jest.Mock;
const mockCopyFile = RNFS.copyFile as jest.Mock;
const mockUnlink = RNFS.unlink as jest.Mock;

describe('persistChatImages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExists.mockImplementation(
      async (path: string) =>
        path === '/cache/photo.jpg' || path === '/cache/second.png',
    );
    mockMkdir.mockResolvedValue(undefined);
    mockCopyFile.mockResolvedValue(undefined);
    mockUnlink.mockResolvedValue(undefined);
  });

  it('copies selected images into persistent Documents storage', async () => {
    const result = await persistChatImages([
      'file:///cache/photo.jpg',
      'file:///cache/second.png',
    ]);

    expect(mockMkdir).toHaveBeenCalledWith('/documents/chat-images');
    expect(mockCopyFile).toHaveBeenCalledTimes(2);
    expect(mockCopyFile).toHaveBeenNthCalledWith(
      1,
      '/cache/photo.jpg',
      expect.stringMatching(/^\/documents\/chat-images\/.+\.jpg$/),
    );
    expect(mockCopyFile).toHaveBeenNthCalledWith(
      2,
      '/cache/second.png',
      expect.stringMatching(/^\/documents\/chat-images\/.+\.png$/),
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toMatch(/^file:\/\/\/documents\/chat-images\/.+\.jpg$/);
    expect(result[1]).toMatch(/^file:\/\/\/documents\/chat-images\/.+\.png$/);
  });

  it('does not create storage when a selected source is missing', async () => {
    mockExists.mockResolvedValue(false);

    await expect(
      persistChatImages(['file:///cache/missing.jpg']),
    ).rejects.toThrow('Selected gallery image does not exist');

    expect(mockMkdir).not.toHaveBeenCalled();
    expect(mockCopyFile).not.toHaveBeenCalled();
  });

  it('removes partial copies if a later image fails', async () => {
    mockCopyFile
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('copy failed'));

    await expect(
      persistChatImages([
        'file:///cache/photo.jpg',
        'file:///cache/second.png',
      ]),
    ).rejects.toThrow('copy failed');

    expect(mockUnlink).toHaveBeenCalledTimes(2);
    expect(mockUnlink).toHaveBeenCalledWith(mockCopyFile.mock.calls[0][1]);
    expect(mockUnlink).toHaveBeenCalledWith(mockCopyFile.mock.calls[1][1]);
  });

  it('rejects non-file URIs rather than persisting an unusable path', async () => {
    await expect(
      persistChatImages(['content://media/external/images/1']),
    ).rejects.toThrow('Unsupported gallery image URI');

    expect(mockCopyFile).not.toHaveBeenCalled();
  });
});
