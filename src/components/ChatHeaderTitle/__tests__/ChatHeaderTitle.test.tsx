import React from 'react';
import {render} from '../../../../jest/test-utils';
import {ChatHeaderTitle} from '../ChatHeaderTitle';
import {chatSessionStore, modelStore} from '../../../store';
import {runInAction} from 'mobx';
import {basicModel, downloadedModel} from '../../../../jest/fixtures/models';

const availableBasicModel = {...basicModel, isDownloaded: true};

describe('ChatHeaderTitle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Chat" when no active session exists', () => {
    runInAction(() => {
      chatSessionStore.resetActiveSession();
      chatSessionStore.sessions = [];
    });
    const {getByText} = render(<ChatHeaderTitle />);
    expect(getByText('Chat')).toBeTruthy();
  });

  it('renders session title when active session exists', () => {
    const mockSession = {
      id: '123',
      title: 'Test Session',
      date: new Date().toISOString(),
      messages: [],
    };
    runInAction(() => {
      Object.assign(chatSessionStore, {
        activeSessionId: mockSession.id,
        sessions: [mockSession],
      });
    });

    const {getByText} = render(<ChatHeaderTitle />);
    expect(getByText('Test Session')).toBeTruthy();
  });

  it('renders model name when active model exists', () => {
    runInAction(() => {
      modelStore.models = [availableBasicModel];
      modelStore.setActiveModel(availableBasicModel.id);
    });

    const {getByText} = render(<ChatHeaderTitle />);
    expect(getByText('basic model')).toBeTruthy();
  });

  it('updates when active model changes', () => {
    // Initial model is available to the user.
    runInAction(() => {
      modelStore.models = [availableBasicModel];
      modelStore.setActiveModel(availableBasicModel.id);
    });

    const {getByText, rerender} = render(<ChatHeaderTitle />);
    expect(getByText('basic model')).toBeTruthy();

    // Change to another available model.
    runInAction(() => {
      modelStore.models = [downloadedModel];
      modelStore.setActiveModel(downloadedModel.id);
    });

    rerender(<ChatHeaderTitle />);
    expect(getByText('downloaded model')).toBeTruthy();
  });
});
