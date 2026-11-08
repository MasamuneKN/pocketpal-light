import * as RNFS from '@dr.pogodin/react-native-fs';
import {
  persistChatImages,
  removeUnreferencedChatImages,
} from '../chatImageStorage';

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

describe('removeUnreferencedChatImages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('removes orphaned managed images but preserves shared references', async () => {
    const orphan = 'file:///documents/chat-images/orphan.jpg';
    const shared = 'file:///documents/chat-images/shared.png';
    mockExists.mockResolvedValue(true);

    await removeUnreferencedChatImages([orphan, shared, orphan], [shared]);

    expect(mockUnlink).toHaveBeenCalledTimes(1);
    expect(mockUnlink).toHaveBeenCalledWith(
      '/documents/chat-images/orphan.jpg',
    );
  });

  it('never deletes files outside the managed directory or nested paths', async () => {
    mockExists.mockResolvedValue(true);

    await removeUnreferencedChatImages(
      [
        'file:///documents/private.jpg',
        'file:///documents/chat-images/nested/photo.jpg',
        'file:///documents/chat-images/../private.jpg',
        'content://media/external/images/1',
      ],
      [],
    );

    expect(mockUnlink).not.toHaveBeenCalled();
  });

  it('does not unlink a candidate that no longer exists', async () => {
    mockExists.mockResolvedValue(false);

    await removeUnreferencedChatImages(
      ['file:///documents/chat-images/missing.jpg'],
      [],
    );

    expect(mockUnlink).not.toHaveBeenCalled();
  });

  it('continues cleanup when an individual file cannot be removed', async () => {
    mockExists.mockResolvedValue(true);
    mockUnlink
      .mockRejectedValueOnce(new Error('permission denied'))
      .mockResolvedValueOnce(undefined);
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    await removeUnreferencedChatImages(
      [
        'file:///documents/chat-images/first.jpg',
        'file:///documents/chat-images/second.jpg',
      ],
      [],
    );

    expect(mockUnlink).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
