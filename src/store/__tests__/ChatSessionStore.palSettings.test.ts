import {chatSessionStore, defaultCompletionSettings} from '../ChatSessionStore';

describe('ChatSessionStore completion settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    chatSessionStore.sessions = [];
    chatSessionStore.activeSessionId = null;
    chatSessionStore.newChatPalId = undefined;
    chatSessionStore.newChatCompletionSettings = {...defaultCompletionSettings};
    chatSessionStore.newChatThinkingOverride = undefined;
    chatSessionStore.newChatReasoningEffort = undefined;
  });

  describe('resolveCompletionSettings', () => {
    it('returns system defaults when no user settings are available', async () => {
      await expect(
        chatSessionStore.resolveCompletionSettings(),
      ).resolves.toEqual(defaultCompletionSettings);
    });

    it('applies global settings over system defaults', async () => {
      chatSessionStore.newChatCompletionSettings = {
        ...defaultCompletionSettings,
        temperature: 0.8,
        top_p: 0.9,
      };

      const result = await chatSessionStore.resolveCompletionSettings();

      expect(result.temperature).toBe(0.8);
      expect(result.top_p).toBe(0.9);
    });

    it('uses saved session settings over global settings', async () => {
      chatSessionStore.newChatCompletionSettings = {
        ...defaultCompletionSettings,
        temperature: 0.8,
        top_p: 0.9,
      };
      chatSessionStore.sessions = [
        {
          id: 'test-session',
          title: 'Test Session',
          date: '2024-01-01',
          messages: [],
          completionSettings: {
            ...defaultCompletionSettings,
            temperature: 0.3,
            n_predict: 200,
          },
        },
      ];

      const result =
        await chatSessionStore.resolveCompletionSettings('test-session');

      expect(result.temperature).toBe(0.3);
      expect(result.top_p).toBe(defaultCompletionSettings.top_p);
      expect(result.n_predict).toBe(200);
    });

    it('applies a new-chat thinking override without changing other global settings', async () => {
      chatSessionStore.newChatCompletionSettings = {
        ...defaultCompletionSettings,
        temperature: 0.7,
        enable_thinking: true,
      };
      chatSessionStore.newChatThinkingOverride = false;

      const result = await chatSessionStore.resolveCompletionSettings();

      expect(result.enable_thinking).toBe(false);
      expect(result.reasoning?.enabled).toBe(false);
      expect(result.temperature).toBe(0.7);
    });

    it('does not apply the new-chat override when resolving a saved session', async () => {
      chatSessionStore.sessions = [
        {
          id: 'test-session',
          title: 'Test Session',
          date: '2024-01-01',
          messages: [],
          completionSettings: {
            ...defaultCompletionSettings,
            enable_thinking: true,
          },
        },
      ];
      chatSessionStore.newChatThinkingOverride = false;

      const result =
        await chatSessionStore.resolveCompletionSettings('test-session');

      expect(result.enable_thinking).toBe(true);
    });
  });

  describe('getCurrentCompletionSettings', () => {
    it('uses global settings for a new chat even when a Pal is selected', async () => {
      chatSessionStore.newChatPalId = 'selected-pal';
      chatSessionStore.newChatCompletionSettings = {
        ...defaultCompletionSettings,
        temperature: 0.7,
      };

      const result = await chatSessionStore.getCurrentCompletionSettings();

      expect(result.temperature).toBe(0.7);
    });

    it('resolves the active session settings', async () => {
      chatSessionStore.activeSessionId = 'test-session';
      chatSessionStore.sessions = [
        {
          id: 'test-session',
          title: 'Test Session',
          date: '2024-01-01',
          messages: [],
          completionSettings: {
            ...defaultCompletionSettings,
            temperature: 0.9,
          },
        },
      ];

      const result = await chatSessionStore.getCurrentCompletionSettings();

      expect(result.temperature).toBe(0.9);
    });
  });
});
