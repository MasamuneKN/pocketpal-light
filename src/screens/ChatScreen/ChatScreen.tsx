import React, {useRef, ReactNode, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {observer} from 'mobx-react';
import {runInAction} from 'mobx';

import {Bubble} from '../../components/Bubble';
import {ChatView} from '../../components/ChatView';
import {ErrorSnackbar} from '../../components/ErrorSnackbar';

import {useChatSession} from '../../hooks/useChatSession';
import {usePendingMessage} from '../../hooks/useDeepLinking';

import {chatSessionStore, modelStore, uiStore} from '../../store';

import {L10nContext} from '../../utils';
import {
  clampEffort,
  resolveReasoningCapability,
} from '../../utils/reasoningCapability';
import {MessageType} from '../../utils/types';
import {user, assistant} from '../../utils/chat';

const renderBubble = ({
  child,
  message,
  nextMessageInGroup,
  scale,
}: {
  child: ReactNode;
  message: MessageType.Any;
  nextMessageInGroup: boolean;
  scale?: any;
}) => (
  <Bubble
    child={child}
    message={message}
    nextMessageInGroup={nextMessageInGroup}
    scale={scale}
  />
);

export const ChatScreen: React.FC = observer(() => {
  const currentMessageInfo = useRef<{
    createdAt: number;
    id: string;
    sessionId: string;
  } | null>(null);
  const l10n = React.useContext(L10nContext);

  const {handleSendPress, handleStopPress} = useChatSession(
    currentMessageInfo,
    user,
    assistant,
  );

  // Handle deep linking for message prefill
  const {pendingMessage, clearPendingMessage} = usePendingMessage();

  const visionEnabled = modelStore.activeModelCaps.visionActive;
  const chatCovered = false;

  // Resolver is the single source of truth for reasoning capability.
  // Pill is reachable whenever the model is not known to be non-reasoning
  // (fail-open on 'unknown' so remote + missed-local models are reachable).
  const reasoningCapability = resolveReasoningCapability(
    modelStore.activeModel,
    {},
  );
  const thinkingSupported =
    !!modelStore.activeModel && reasoningCapability.isReasoning !== 'no';

  const [thinkingEnabled, setThinkingEnabled] = useState(true);
  const [storedEffort, setStoredEffort] = useState<string | undefined>(
    undefined,
  );
  const reasoningEffort = clampEffort(
    storedEffort,
    reasoningCapability.effortValues,
  );
  const activeSession = chatSessionStore.sessions.find(
    s => s.id === chatSessionStore.activeSessionId,
  );
  React.useEffect(() => {
    let cancelled = false;
    chatSessionStore.getCurrentCompletionSettings().then(settings => {
      if (!cancelled) {
        setThinkingEnabled(settings.enable_thinking ?? true);
        setStoredEffort(settings.reasoning?.effort);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chatSessionStore.activeSessionId,
    activeSession?.settingsSource,
    activeSession?.completionSettings,
    chatSessionStore.newChatCompletionSettings,
    chatSessionStore.newChatThinkingOverride,
    chatSessionStore.newChatReasoningEffort,
  ]);

  // Persist the on/off intent (and optional effort) onto both the local
  // enable_thinking flag and the reasoning carrier so the remote wire path
  // (the profile in src/api/servers/) and the local hook both see it.
  // Preserves pal overrides. No active session: stage on the new-chat
  // override field — the resolver applies it as the last layer and session
  // creation bakes it in, without touching newChatCompletionSettings.
  const persistReasoning = async (enabled: boolean, effort?: string) => {
    const currentSession = chatSessionStore.sessions.find(
      s => s.id === chatSessionStore.activeSessionId,
    );
    if (currentSession) {
      const resolvedSettings =
        await chatSessionStore.getCurrentCompletionSettings();
      await chatSessionStore.updateSessionCompletionSettings({
        ...resolvedSettings,
        enable_thinking: enabled,
        reasoning: {enabled, effort},
      });
    } else {
      runInAction(() => {
        chatSessionStore.newChatThinkingOverride = enabled;
        chatSessionStore.newChatReasoningEffort = effort;
      });
    }
  };

  // Simple on/off pill (effortless models): carries the on/off intent on the
  // reasoning carrier (effort undefined) so remote OFF is not a no-op.
  const handleThinkingToggle = async (enabled: boolean) => {
    await persistReasoning(enabled);
  };

  // Graded pill cycle: off -> values[0] -> ... -> values[n] -> off.
  const handleEffortCycle = async () => {
    const values = reasoningCapability.effortValues;
    if (values.length === 0) {
      return;
    }
    let nextEnabled: boolean;
    let nextEffort: string | undefined;
    if (!thinkingEnabled) {
      nextEnabled = true;
      nextEffort = values[0];
    } else {
      const idx = reasoningEffort ? values.indexOf(reasoningEffort) : -1;
      if (idx < 0 || idx >= values.length - 1) {
        nextEnabled = false;
        nextEffort = undefined;
      } else {
        nextEnabled = true;
        nextEffort = values[idx + 1];
      }
    }
    setThinkingEnabled(nextEnabled);
    setStoredEffort(nextEffort);
    await persistReasoning(nextEnabled, nextEffort);
  };

  // Otherwise, show the regular chat view
  return (
    <>
      <View
        style={styles.chat}
        importantForAccessibility={chatCovered ? 'no-hide-descendants' : 'auto'}
        accessibilityElementsHidden={chatCovered}>
        <ChatView
          renderBubble={renderBubble}
          messages={chatSessionStore.currentSessionMessages}
          onSendPress={handleSendPress}
          onStopPress={handleStopPress}
          user={user}
          isStopVisible={modelStore.inferencing}
          isStreaming={modelStore.isStreaming}
          sendButtonVisibilityMode="always"
          showImageUpload={true}
          isVisionEnabled={visionEnabled}
          initialInputText={pendingMessage || undefined}
          onInitialTextConsumed={clearPendingMessage}
          inputProps={{
            showThinkingToggle: thinkingSupported,
            isThinkingEnabled: thinkingEnabled,
            onThinkingToggle: handleThinkingToggle,
            supportsEffort: reasoningCapability.supportsEffort,
            effortValues: reasoningCapability.effortValues,
            reasoningEffort,
            onEffortCycle: handleEffortCycle,
          }}
          textInputProps={{
            placeholder: !modelStore.engine
              ? modelStore.isContextLoading
                ? l10n.chat.loadingModel
                : l10n.chat.modelNotLoaded
              : l10n.chat.typeYourMessage,
          }}
        />
      </View>
      {uiStore.chatWarning && (
        <ErrorSnackbar
          error={uiStore.chatWarning}
          onDismiss={() => uiStore.clearChatWarning()}
        />
      )}
      {modelStore.modelLoadError && (
        <ErrorSnackbar
          error={modelStore.modelLoadError}
          onDismiss={() => modelStore.clearModelLoadError()}
        />
      )}
    </>
  );
});

const styles = StyleSheet.create({
  chat: {
    flex: 1,
  },
});
