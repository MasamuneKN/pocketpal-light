/**
 * Android deep-link handling for chat links and E2E automation routes.
 */

import {useCallback, useEffect} from 'react';
import {Alert, Linking} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {deepLinkStore} from '../store';
import {ROUTES} from '../utils/navigationConstants';
import type {DeepLinkParams} from '../utils/deepLinkTypes';

const parseDeepLink = (urlString: string): DeepLinkParams | null => {
  try {
    const url = new URL(urlString);
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    return {
      url: urlString,
      scheme: url.protocol.replace(':', ''),
      host: url.hostname,
      queryParams,
    };
  } catch {
    return null;
  }
};

export const useDeepLinking = () => {
  const navigation = useNavigation();

  const handleChatDeepLink = useCallback(
    async (message?: string) => {
      try {
        if (message) {
          deepLinkStore.setPendingMessage(message);
        }
        (navigation as any).navigate(ROUTES.CHAT);
      } catch (error) {
        console.error('Error handling chat deep link:', error);
        Alert.alert(
          'Error Opening Chat',
          'An error occurred while trying to open the chat. Please try again.',
          [{text: 'OK'}],
        );
      }
    },
    [navigation],
  );

  const handleDeepLink = useCallback(
    async (url: string) => {
      const params = parseDeepLink(url);
      if (!params) {
        return;
      }

      // Automation dispatch is compiled out of production builds.
      if (__E2E__) {
        const {dispatchAutomationDeepLink} = require('../__automation__');
        if (await dispatchAutomationDeepLink(params, navigation)) {
          return;
        }
      }

      if (params.host === 'chat') {
        await handleChatDeepLink(params.queryParams?.message);
      }
    },
    [handleChatDeepLink, navigation],
  );

  useEffect(() => {
    let mounted = true;

    Linking.getInitialURL()
      .then(url => {
        if (mounted && url) {
          void handleDeepLink(url);
        }
      })
      .catch(() => {
        // Initial URL lookup can fail on some Android launch surfaces.
      });

    const subscription = Linking.addEventListener('url', ({url}) => {
      void handleDeepLink(url);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [handleDeepLink]);
};

export const usePendingMessage = () => ({
  pendingMessage: deepLinkStore.pendingMessage,
  clearPendingMessage: () => deepLinkStore.clearPendingMessage(),
});
