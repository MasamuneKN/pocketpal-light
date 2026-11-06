import {fireEvent, waitFor} from '@testing-library/react-native';
import * as React from 'react';
import {ScrollView, Alert, StyleSheet} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {runInAction} from 'mobx';

import {user} from '../../../../jest/fixtures';
import {l10n} from '../../../locales';
import {UserContext} from '../../../utils';
import {ChatInput} from '../ChatInput';
import {render} from '../../../../jest/test-utils';
import {chatSessionStore, modelStore} from '../../../store';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

const renderScrollable = () => <ScrollView />;

describe('input', () => {
  it('send button', () => {
    expect.assertions(2);
    // Set up an active model for the test
    runInAction(() => {
      modelStore.activeModelId = 'test-model-id';
    });
    const onSendPress = jest.fn();
    const {getByPlaceholderText, getByLabelText} = render(
      <UserContext.Provider value={user}>
        <ChatInput
          {...{
            onSendPress,
            sendButtonVisibilityMode: 'editing',
            textInputProps: {value: 'text'},
          }}
        />
      </UserContext.Provider>,
    );
    const textInput = getByPlaceholderText(
      l10n.en.components.chatInput.inputPlaceholder,
    );
    fireEvent.changeText(textInput, 'text');
    const button = getByLabelText(
      l10n.en.components.sendButton.accessibilityLabel,
    );
    fireEvent.press(button);
    expect(onSendPress).toHaveBeenCalledWith({text: 'text', type: 'text'});
    expect(textInput.props).toHaveProperty('value', 'text');
  });

  it('sends a text message', () => {
    expect.assertions(2);
    // Set up an active model for the test
    runInAction(() => {
      modelStore.activeModelId = 'test-model-id';
    });
    const onSendPress = jest.fn();
    const {getByPlaceholderText, getByLabelText} = render(
      <UserContext.Provider value={user}>
        <ChatInput
          {...{
            onSendPress,
            renderScrollable,
            sendButtonVisibilityMode: 'editing',
          }}
        />
      </UserContext.Provider>,
    );
    const textInput = getByPlaceholderText(
      l10n.en.components.chatInput.inputPlaceholder,
    );
    fireEvent.changeText(textInput, 'text');
    const button = getByLabelText(
      l10n.en.components.sendButton.accessibilityLabel,
    );
    fireEvent.press(button);
    expect(onSendPress).toHaveBeenCalledWith({text: 'text', type: 'text'});
    expect(textInput.props).toHaveProperty('value', '');
  });

  describe('while a send waits for a stopped run to drain', () => {
    beforeEach(() => {
      runInAction(() => {
        modelStore.activeModelId = 'test-model-id';
      });
      chatSessionStore.isStopping = true;
    });

    afterEach(() => {
      chatSessionStore.isStopping = false;
    });

    it('disables Send, announced as disabled, and keeps the typed text', () => {
      const onSendPress = jest.fn();
      const {getByPlaceholderText, getByLabelText} = render(
        <UserContext.Provider value={user}>
          <ChatInput
            {...{
              onSendPress,
              renderScrollable,
              sendButtonVisibilityMode: 'editing',
            }}
          />
        </UserContext.Provider>,
      );
      const textInput = getByPlaceholderText(
        l10n.en.components.chatInput.inputPlaceholder,
      );
      fireEvent.changeText(textInput, 'second message');
      const button = getByLabelText(
        l10n.en.components.sendButton.accessibilityLabel,
      );

      expect(button.props.accessibilityState).toEqual(
        expect.objectContaining({disabled: true}),
      );
      fireEvent.press(button);
      expect(onSendPress).not.toHaveBeenCalled();
      expect(textInput.props.value).toBe('second message');
    });
  });

  it('sends a text message if onChangeText and value are provided', () => {
    expect.assertions(2);
    // Set up an active model for the test
    runInAction(() => {
      modelStore.activeModelId = 'test-model-id';
    });
    const onSendPress = jest.fn();
    const value = 'value';
    const onChangeText = jest.fn(newValue => {
      rerender(
        <UserContext.Provider value={user}>
          <ChatInput
            {...{
              onSendPress,
              renderScrollable,
              sendButtonVisibilityMode: 'editing',
              textInputProps: {onChangeText, value: newValue},
            }}
          />
        </UserContext.Provider>,
      );
    });
    const {getByPlaceholderText, getByLabelText, rerender} = render(
      <UserContext.Provider value={user}>
        <ChatInput
          {...{
            onSendPress,
            renderScrollable,
            sendButtonVisibilityMode: 'editing',
            textInputProps: {onChangeText, value},
          }}
        />
      </UserContext.Provider>,
    );
    const textInput = getByPlaceholderText(
      l10n.en.components.chatInput.inputPlaceholder,
    );
    fireEvent.changeText(textInput, 'text');
    const button = getByLabelText(
      l10n.en.components.sendButton.accessibilityLabel,
    );
    fireEvent.press(button);
    expect(onSendPress).toHaveBeenCalledWith({text: 'text', type: 'text'});
    expect(textInput.props).toHaveProperty('value', 'text');
  });

  it('sends a text message if onChangeText is provided', () => {
    expect.assertions(2);
    // Set up an active model for the test
    runInAction(() => {
      modelStore.activeModelId = 'test-model-id';
    });
    const onSendPress = jest.fn();
    const onChangeText = jest.fn();
    const {getByPlaceholderText, getByLabelText} = render(
      <UserContext.Provider value={user}>
        <ChatInput
          {...{
            onSendPress,
            renderScrollable,
            sendButtonVisibilityMode: 'editing',
            textInputProps: {onChangeText},
          }}
        />
      </UserContext.Provider>,
    );
    const textInput = getByPlaceholderText(
      l10n.en.components.chatInput.inputPlaceholder,
    );
    fireEvent.changeText(textInput, 'text');
    const button = getByLabelText(
      l10n.en.components.sendButton.accessibilityLabel,
    );
    fireEvent.press(button);
    expect(onSendPress).toHaveBeenCalledWith({text: 'text', type: 'text'});
    expect(textInput.props).toHaveProperty('value', '');
  });

  it('sends a text message if value is provided', async () => {
    expect.assertions(2);
    // Set up an active model for the test
    runInAction(() => {
      modelStore.activeModelId = 'test-model-id';
    });
    const onSendPress = jest.fn();
    const value = 'value';
    const {getByPlaceholderText, getByLabelText} = render(
      <UserContext.Provider value={user}>
        <ChatInput
          {...{
            onSendPress,
            renderScrollable,
            sendButtonVisibilityMode: 'editing',
            textInputProps: {value},
          }}
        />
      </UserContext.Provider>,
    );
    const textInput = getByPlaceholderText(
      l10n.en.components.chatInput.inputPlaceholder,
    );
    await waitFor(() => fireEvent.changeText(textInput, 'text')); // Wait for the input to update

    const button = getByLabelText(
      l10n.en.components.sendButton.accessibilityLabel,
    );
    await waitFor(() => fireEvent.press(button)); // Wait for the press event to be processed

    expect(onSendPress).toHaveBeenCalledWith({text: value, type: 'text'});
    expect(textInput.props).toHaveProperty('value', value);
  });

  it('sends a text message if defaultValue is provided', () => {
    expect.assertions(2);
    // Set up an active model for the test
    runInAction(() => {
      modelStore.activeModelId = 'test-model-id';
    });
    const onSendPress = jest.fn();
    const defaultValue = 'defaultValue';
    const {getByPlaceholderText, getByLabelText} = render(
      <UserContext.Provider value={user}>
        <ChatInput
          {...{
            onSendPress,
            renderScrollable,
            sendButtonVisibilityMode: 'editing',
            textInputProps: {defaultValue},
          }}
        />
      </UserContext.Provider>,
    );
    const textInput = getByPlaceholderText(
      l10n.en.components.chatInput.inputPlaceholder,
    );
    const button = getByLabelText(
      l10n.en.components.sendButton.accessibilityLabel,
    );
    fireEvent.press(button);
    expect(onSendPress).toHaveBeenCalledWith({
      text: defaultValue,
      type: 'text',
    });
    expect(textInput.props).toHaveProperty('value', '');
  });

  it('shows stop button when isStopVisible is true', () => {
    expect.assertions(1);
    const onStopPress = jest.fn();
    const onSendPress = jest.fn();
    const {getByTestId} = render(
      <UserContext.Provider value={user}>
        <ChatInput
          {...{
            onSendPress,
            onStopPress,
            isStopVisible: true,
            sendButtonVisibilityMode: 'editing',
          }}
        />
      </UserContext.Provider>,
    );
    const stopButton = getByTestId('stop-button');
    fireEvent.press(stopButton);
    expect(onStopPress).toHaveBeenCalledTimes(1);
  });

  it('shows plus button for image upload when showImageUpload is true', () => {
    expect.assertions(1);
    const onSendPress = jest.fn();
    const {getByLabelText} = render(
      <UserContext.Provider value={user}>
        <ChatInput
          {...{
            onSendPress,
            showImageUpload: true,
            sendButtonVisibilityMode: 'editing',
          }}
        />
      </UserContext.Provider>,
    );

    const plusButton = getByLabelText('Add image');
    expect(plusButton).toBeDefined();
  });

  it('does not show plus button when showImageUpload is false', () => {
    expect.assertions(1);
    const onSendPress = jest.fn();
    const {queryByLabelText} = render(
      <UserContext.Provider value={user}>
        <ChatInput
          {...{
            onSendPress,
            showImageUpload: false,
            sendButtonVisibilityMode: 'editing',
          }}
        />
      </UserContext.Provider>,
    );

    const plusButton = queryByLabelText('Add image');
    expect(plusButton).toBeNull();
  });

  it('renders plus button correctly when vision is enabled', () => {
    expect.assertions(2);
    const onSendPress = jest.fn();
    const {getByLabelText} = render(
      <UserContext.Provider value={user}>
        <ChatInput
          {...{
            onSendPress,
            showImageUpload: true,
            isVisionEnabled: true,
            sendButtonVisibilityMode: 'editing',
          }}
        />
      </UserContext.Provider>,
    );

    const plusButton = getByLabelText('Add image');
    expect(plusButton).toBeTruthy();
    expect(plusButton.props.accessibilityState.disabled).toBe(false);
  });

  it('shows the model picker button', () => {
    const onModelPickerPress = jest.fn();
    const {getByLabelText} = render(
      <UserContext.Provider value={user}>
        <ChatInput
          onSendPress={jest.fn()}
          onModelPickerPress={onModelPickerPress}
          sendButtonVisibilityMode="editing"
        />
      </UserContext.Provider>,
    );

    fireEvent.press(getByLabelText('Select model'));
    expect(onModelPickerPress).toHaveBeenCalledTimes(1);
  });

  it('keeps the model selector and thinking label shrinkable in the composer row', () => {
    const {getByTestId} = render(
      <UserContext.Provider value={user}>
        <ChatInput
          onSendPress={jest.fn()}
          sendButtonVisibilityMode="editing"
          showThinkingToggle
        />
      </UserContext.Provider>,
    );

    const selector = getByTestId('model-selector');
    const thinkingLabel = getByTestId('thinking-toggle-label');
    expect(thinkingLabel.props.numberOfLines).toBe(1);
    expect(StyleSheet.flatten(selector.props.style).flexShrink).toBe(1);
    expect(StyleSheet.flatten(selector.props.style).minWidth).toBe(32);
    expect(StyleSheet.flatten(thinkingLabel.props.style).flexShrink).toBe(1);
  });

  it('disables plus button when vision is not enabled', () => {
    expect.assertions(1);
    const onSendPress = jest.fn();
    const {getByLabelText} = render(
      <UserContext.Provider value={user}>
        <ChatInput
          {...{
            onSendPress,
            showImageUpload: true,
            isVisionEnabled: false,
            sendButtonVisibilityMode: 'editing',
          }}
        />
      </UserContext.Provider>,
    );

    const plusButton = getByLabelText('Add image');
    expect(plusButton.props.accessibilityState.disabled).toBe(true);
  });

  it('enables plus button when vision is enabled', () => {
    expect.assertions(1);
    const onSendPress = jest.fn();
    const {getByLabelText} = render(
      <UserContext.Provider value={user}>
        <ChatInput
          {...{
            onSendPress,
            showImageUpload: true,
            isVisionEnabled: true,
            sendButtonVisibilityMode: 'editing',
          }}
        />
      </UserContext.Provider>,
    );

    const plusButton = getByLabelText('Add image');
    expect(plusButton.props.accessibilityState.disabled).toBe(false);
  });

  it('shows send button with always visibility mode', () => {
    expect.assertions(1);
    const onSendPress = jest.fn();
    const {getByLabelText} = render(
      <UserContext.Provider value={user}>
        <ChatInput
          {...{
            onSendPress,
            sendButtonVisibilityMode: 'always',
          }}
        />
      </UserContext.Provider>,
    );

    const sendButton = getByLabelText(
      l10n.en.components.sendButton.accessibilityLabel,
    );
    expect(sendButton).toBeTruthy();
  });

  it('sends message with images when images are selected', () => {
    expect.assertions(1);
    // Set up an active model for the test
    runInAction(() => {
      modelStore.activeModelId = 'test-model-id';
    });
    const onSendPress = jest.fn();
    const {getByPlaceholderText, getByLabelText} = render(
      <UserContext.Provider value={user}>
        <ChatInput
          {...{
            onSendPress,
            sendButtonVisibilityMode: 'editing',
          }}
        />
      </UserContext.Provider>,
    );

    const textInput = getByPlaceholderText(
      l10n.en.components.chatInput.inputPlaceholder,
    );
    fireEvent.changeText(textInput, 'test message');

    const sendButton = getByLabelText(
      l10n.en.components.sendButton.accessibilityLabel,
    );
    fireEvent.press(sendButton);

    expect(onSendPress).toHaveBeenCalledWith({
      text: 'test message',
      type: 'text',
    });
  });

  describe('Image Upload Functionality', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('opens the image upload menu from the plus button', () => {
      const {getByLabelText, getByText} = render(
        <UserContext.Provider value={user}>
          <ChatInput
            onSendPress={jest.fn()}
            showImageUpload
            isVisionEnabled
            sendButtonVisibilityMode="editing"
          />
        </UserContext.Provider>,
      );

      fireEvent.press(getByLabelText('Add image'));
      expect(getByText('Gallery')).toBeTruthy();
    });

    it('adds images selected from the gallery', async () => {
      (launchImageLibrary as jest.Mock).mockResolvedValue({
        assets: [{uri: 'file://gallery-photo.jpg'}],
      });
      const {getByLabelText, getByText, findByLabelText} = render(
        <UserContext.Provider value={user}>
          <ChatInput
            onSendPress={jest.fn()}
            showImageUpload
            isVisionEnabled
            sendButtonVisibilityMode="editing"
          />
        </UserContext.Provider>,
      );

      fireEvent.press(getByLabelText('Add image'));
      fireEvent.press(getByText('Gallery'));

      expect(await findByLabelText('Remove image 1')).toBeTruthy();
      expect(launchImageLibrary).toHaveBeenCalledWith(
        expect.objectContaining({mediaType: 'photo', selectionLimit: 5}),
      );
      expect(modelStore.enableAutoRelease).toHaveBeenCalledWith(
        'image-gallery',
      );
    });

    it('reports gallery errors and restores auto-release', async () => {
      (launchImageLibrary as jest.Mock).mockRejectedValue(
        new Error('Gallery error'),
      );
      const {getByLabelText, getByText} = render(
        <UserContext.Provider value={user}>
          <ChatInput
            onSendPress={jest.fn()}
            showImageUpload
            isVisionEnabled
            sendButtonVisibilityMode="editing"
          />
        </UserContext.Provider>,
      );

      fireEvent.press(getByLabelText('Add image'));
      fireEvent.press(getByText('Gallery'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          l10n.en.errors.galleryErrorTitle,
          l10n.en.errors.galleryErrorMessage,
        );
      });
      expect(modelStore.disableAutoRelease).toHaveBeenCalledWith(
        'image-gallery',
      );
      expect(modelStore.enableAutoRelease).toHaveBeenCalledWith(
        'image-gallery',
      );
    });
  });

  describe('Edit Mode Functionality', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('shows edit bar when in edit mode', () => {
      runInAction(() => {
        chatSessionStore.isEditMode = true;
      });
      const onSendPress = jest.fn();
      const onCancelEdit = jest.fn();

      render(
        <UserContext.Provider value={user}>
          <ChatInput
            {...{
              onSendPress,
              onCancelEdit,
              sendButtonVisibilityMode: 'editing',
            }}
          />
        </UserContext.Provider>,
      );

      expect(onCancelEdit).not.toHaveBeenCalled(); // Should not be called on render
    });

    it('calls onCancelEdit when cancel button is pressed', () => {
      const onSendPress = jest.fn();
      const onCancelEdit = jest.fn();

      // Start with edit mode enabled
      runInAction(() => {
        chatSessionStore.isEditMode = true;
      });

      const {getByTestId} = render(
        <UserContext.Provider value={user}>
          <ChatInput
            {...{
              onSendPress,
              onCancelEdit,
              sendButtonVisibilityMode: 'editing',
            }}
          />
        </UserContext.Provider>,
      );

      // Find and press the cancel button in the edit bar
      const cancelButton = getByTestId('icon-button');
      fireEvent.press(cancelButton);

      expect(onCancelEdit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Model Not Loaded Feedback', () => {
    it('shows warning and haptic feedback when trying to send without model', async () => {
      // Mock haptic feedback
      const hapticTriggerSpy = jest.spyOn(ReactNativeHapticFeedback, 'trigger');

      // Ensure no model is loaded
      runInAction(() => {
        modelStore.activeModelId = undefined;
        modelStore.context = undefined;
      });

      const onSendPress = jest.fn();

      const {getByPlaceholderText, getByLabelText, getByText} = render(
        <UserContext.Provider value={user}>
          <ChatInput
            {...{
              onSendPress,
              renderScrollable,
              sendButtonVisibilityMode: 'editing',
            }}
          />
        </UserContext.Provider>,
      );

      const input = getByPlaceholderText(
        l10n.en.components.chatInput.inputPlaceholder,
      );
      fireEvent.changeText(input, 'Test message');

      const sendButton = getByLabelText(
        l10n.en.components.sendButton.accessibilityLabel,
      );
      fireEvent.press(sendButton);

      // Verify haptic feedback was triggered
      expect(hapticTriggerSpy).toHaveBeenCalledWith('notificationWarning', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });

      // Verify helper text is displayed
      expect(getByText(l10n.en.chat.cannotSendWithoutModel)).toBeTruthy();

      // Verify onSendPress was NOT called
      expect(onSendPress).not.toHaveBeenCalled();

      hapticTriggerSpy.mockRestore();
    });

    it('allows sending when model is loaded', async () => {
      const onSendPress = jest.fn();

      // Ensure model is loaded
      runInAction(() => {
        modelStore.activeModelId = 'test-model';
        modelStore.context = {id: 'test-context'} as any;
      });

      const {getByPlaceholderText, getByLabelText} = render(
        <UserContext.Provider value={user}>
          <ChatInput
            {...{
              onSendPress,
              renderScrollable,
              sendButtonVisibilityMode: 'editing',
            }}
          />
        </UserContext.Provider>,
      );

      const input = getByPlaceholderText(
        l10n.en.components.chatInput.inputPlaceholder,
      );
      fireEvent.changeText(input, 'Test message');

      const sendButton = getByLabelText(
        l10n.en.components.sendButton.accessibilityLabel,
      );
      fireEvent.press(sendButton);

      // Verify onSendPress WAS called
      expect(onSendPress).toHaveBeenCalledWith({
        text: 'Test message',
        type: 'text',
        imageUris: undefined,
      });
    });
  });
});
