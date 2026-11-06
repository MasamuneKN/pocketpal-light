import React from 'react';
import {runInAction} from 'mobx';

import {render} from '../../../../jest/test-utils';
import {chatSessionStore, modelStore, serverStore} from '../../../store';
import type {ServerType} from '../../../utils/serverTypes';
import {ChatGenerationSettingsSheet} from '../ChatGenerationSettingsSheet';

const MODEL_ID = 'srv-1/remote-model';
const URL = 'http://localhost:8080';

const startSession = (serverType: ServerType) => {
  runInAction(() => {
    chatSessionStore.activeSessionId = 'session-1';
    chatSessionStore.sessions = [
      {
        id: 'session-1',
        title: 'Server defaults',
        date: new Date().toISOString(),
        messages: [],
        completionSettings: chatSessionStore.newChatCompletionSettings,
        settingsSource: 'custom',
      },
    ];
    serverStore.servers = [{id: 'srv-1', name: 'llama', url: URL, serverType}];
    serverStore.userSelectedModels = [
      {serverId: 'srv-1', remoteModelId: 'remote-model'},
    ];
    modelStore.activeModelId = MODEL_ID;
    modelStore.activeRemoteBinding = {
      modelId: MODEL_ID,
      serverId: 'srv-1',
      remoteModelId: 'remote-model',
      url: URL,
      serverType,
    };
    serverStore.remoteCaps = {
      [MODEL_ID]: {samplerDefaults: {top_k: 20}, probedUrl: URL},
    };
  });
};

describe('ChatGenerationSettingsSheet server defaults', () => {
  const models = modelStore.models;
  const selectedModels = serverStore.userSelectedModels;
  const servers = serverStore.servers;
  const sessions = chatSessionStore.sessions;
  const activeSessionId = chatSessionStore.activeSessionId;

  afterEach(() => {
    runInAction(() => {
      modelStore.models = models;
      chatSessionStore.sessions = sessions;
      chatSessionStore.activeSessionId = activeSessionId;
      serverStore.userSelectedModels = selectedModels;
      serverStore.servers = servers;
      modelStore.activeModelId = undefined;
      modelStore.activeRemoteBinding = undefined;
      serverStore.remoteCaps = {};
    });
  });

  it('shows a llama.cpp server its own defaults', () => {
    startSession('llama.cpp');
    const {getByTestId} = render(
      <ChatGenerationSettingsSheet isVisible onClose={jest.fn()} />,
    );

    expect(getByTestId('top_k-server-default')).toBeTruthy();
  });

  it.each<ServerType>(['OpenAI', 'Ollama', 'LM Studio', 'vLLM', 'unknown'])(
    'shows a %s session no server-default row',
    serverType => {
      startSession(serverType);
      const {queryAllByTestId, getByTestId} = render(
        <ChatGenerationSettingsSheet isVisible onClose={jest.fn()} />,
      );

      expect(getByTestId('top_k-slider')).toBeTruthy();
      expect(queryAllByTestId(/server-default/)).toHaveLength(0);
    },
  );
});
