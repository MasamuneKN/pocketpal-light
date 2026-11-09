import React, {useContext, useState} from 'react';
import {View, ScrollView, TouchableOpacity, Alert} from 'react-native';

import DeviceInfo from 'react-native-device-info';
import Clipboard from '@react-native-clipboard/clipboard';
import {Text, Button} from 'react-native-paper';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {BuildInfo} from 'llama.rn';

import {CopyIcon, ChevronRightIcon} from '../../assets/icons';
import {useTheme} from '../../hooks';
import {createStyles} from './styles';
import {L10nContext} from '../../utils';
import {uiStore} from '../../store';

const ChevronRightButtonIcon = ({color}: {color: string}) => (
  <ChevronRightIcon stroke={color} />
);

export const AboutScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);
  const l10n = useContext(L10nContext);
  const [appInfo, setAppInfo] = useState({version: '', build: ''});

  React.useEffect(() => {
    setAppInfo({
      version: DeviceInfo.getVersion(),
      build: DeviceInfo.getBuildNumber(),
    });
  }, []);

  const copyVersionToClipboard = () => {
    Clipboard.setString(`Version ${appInfo.version} (${appInfo.build})`);
    Alert.alert(
      l10n.about.versionCopiedTitle,
      l10n.about.versionCopiedDescription,
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text variant="titleLarge" style={styles.title}>
                PocketPal AI
              </Text>
              <Text variant="bodyMedium" style={styles.description}>
                {l10n.about.description}
              </Text>
              <View style={styles.versionContainer}>
                <TouchableOpacity
                  style={styles.versionButton}
                  onPress={copyVersionToClipboard}>
                  <Text style={styles.versionText}>
                    v{appInfo.version} ({appInfo.build})
                  </Text>
                  <CopyIcon
                    width={16}
                    height={16}
                    stroke={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.llamaBuildText}>
                llama.cpp {BuildInfo.number} ({BuildInfo.commit.substring(0, 7)})
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{l10n.about.tour}</Text>
            <Text variant="bodyMedium" style={styles.description}>
              {l10n.about.tourDescription}
            </Text>
            <Button
              mode="outlined"
              onPress={() => uiStore.replayOnboarding()}
              style={styles.actionButton}
              icon={ChevronRightButtonIcon}>
              {l10n.about.showIntroButton}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
