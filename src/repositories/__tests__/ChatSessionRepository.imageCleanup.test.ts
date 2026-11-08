let database: typeof import('../../database').database;
let chatSessionRepository: typeof import('../ChatSessionRepository').chatSessionRepository;
let mockGetCollection: jest.Mock;
let mockRemoveImages: jest.Mock;

const createQuery = (messages: unknown[]) => ({
  fetch: jest.fn().mockResolvedValue(messages),
});

describe('ChatSessionRepository chat image cleanup', () => {
  const deletedImage = 'file:///documents/chat-images/deleted.jpg';
  const sharedImage = 'file:///documents/chat-images/shared.jpg';

  const session = {
    destroyPermanently: jest.fn().mockResolvedValue(undefined),
  };
  const deletedMessage = (imageUris: string[]) => ({
    metadata: JSON.stringify({imageUris}),
    destroyPermanently: jest.fn().mockResolvedValue(undefined),
  });

  let sessions: {find: jest.Mock};
  let messages: {find: jest.Mock; query: jest.Mock};
  let settings: {query: jest.Mock};

  beforeAll(() => {
    // The global Jest setup mocks this repository and database for most tests.
    // Replace those setup mocks explicitly so these tests exercise the real
    // repository with isolated database and filesystem-cleanup dependencies.
    jest.resetModules();
    jest.doMock('../../database', () => ({
      database: {
        write: jest.fn(async (callback: () => Promise<void>) => callback()),
        collections: {
          get: jest.fn(),
        },
      },
    }));
    jest.doMock('../../utils/chatImageStorage', () => ({
      removeUnreferencedChatImages: jest.fn().mockResolvedValue(undefined),
    }));
    jest.doMock('../ChatSessionRepository', () =>
      jest.requireActual('../ChatSessionRepository'),
    );

    database = require('../../database').database;
    mockGetCollection = database.collections.get as jest.Mock;
    mockRemoveImages =
      require('../../utils/chatImageStorage').removeUnreferencedChatImages;
    chatSessionRepository =
      require('../ChatSessionRepository').chatSessionRepository;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    sessions = {find: jest.fn()};
    messages = {find: jest.fn(), query: jest.fn()};
    settings = {query: jest.fn()};
    mockGetCollection.mockImplementation((name: string) => {
      if (name === 'chat_sessions') return sessions;
      if (name === 'messages') return messages;
      if (name === 'completion_settings') return settings;
      throw new Error(`Unexpected collection: ${name}`);
    });
    session.destroyPermanently.mockResolvedValue(undefined);
    settings.query.mockReturnValue(createQuery([]));
  });

  it('cleans up images after deleting one message and preserves surviving references', async () => {
    messages.find.mockResolvedValue(
      deletedMessage([deletedImage, sharedImage]),
    );
    messages.query.mockReturnValue(
      createQuery([{metadata: JSON.stringify({imageUris: [sharedImage]})}]),
    );

    await chatSessionRepository.deleteMessage('message-1');

    expect(mockRemoveImages).toHaveBeenCalledWith(
      [deletedImage, sharedImage],
      [sharedImage],
    );
  });

  it('cleans up session images only after checking messages in other sessions', async () => {
    sessions.find.mockResolvedValue(session);
    messages.query
      .mockReturnValueOnce(
        createQuery([deletedMessage([deletedImage, sharedImage])]),
      )
      .mockReturnValueOnce(
        createQuery([{metadata: JSON.stringify({imageUris: [sharedImage]})}]),
      );

    await chatSessionRepository.deleteSession('session-1');

    expect(mockRemoveImages).toHaveBeenCalledWith(
      [deletedImage, sharedImage],
      [sharedImage],
    );
  });

  it('collects image candidates across bulk-deleted sessions and preserves surviving references', async () => {
    sessions.find.mockResolvedValue(session);
    messages.query
      .mockReturnValueOnce(createQuery([deletedMessage([deletedImage])]))
      .mockReturnValueOnce(createQuery([deletedMessage([sharedImage])]))
      .mockReturnValueOnce(
        createQuery([{metadata: JSON.stringify({imageUris: [sharedImage]})}]),
      );

    await chatSessionRepository.deleteSessions(['session-1', 'session-2']);

    expect(mockRemoveImages).toHaveBeenCalledWith(
      [deletedImage, sharedImage],
      [sharedImage],
    );
  });

  it('skips file cleanup when surviving message metadata is malformed', async () => {
    messages.find.mockResolvedValue(deletedMessage([deletedImage]));
    messages.query.mockReturnValue(createQuery([{metadata: '{invalid-json'}]));
    const warn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    await chatSessionRepository.deleteMessage('message-1');

    expect(mockRemoveImages).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
