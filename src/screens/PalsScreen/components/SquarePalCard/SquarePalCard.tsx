import React, {useContext} from 'react';
import {View, TouchableOpacity, Image, Alert} from 'react-native';
import {observer} from 'mobx-react-lite';
import {useNavigation} from '@react-navigation/native';
import {Text, Card, IconButton} from 'react-native-paper';

import {ChatIcon, CameraIcon, TrashIcon, ShareIcon} from '../../../../assets/icons';
import {useTheme} from '../../../../hooks';
import {createStyles} from './styles';
import type {Pal} from '../../../../types/pal';
import {palStore} from '../../../../store/PalStore';
import {modelStore} from '../../../../store/ModelStore';
import {L10nContext} from '../../../../utils';
import {t} from '../../../../locales';
import {exportPal} from '../../../../utils/exportUtils';
import {activatePalWithModel} from '../../../../utils/activatePal';
import {getContrastColor} from '../../../../utils/colorUtils';
import {getFullThumbnailUri} from '../../../../utils/imageUtils';
import {hasVideoCapability} from '../../../../utils/pal-capabilities';

interface SquarePalCardProps {
  pal: Pal;
  onPress: () => void;
}

const generateParameterSummary = (pal: Pal): string => {
  if (!pal.parameters || typeof pal.parameters !== 'object') {
    return '';
  }
  return Object.values(pal.parameters)
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .slice(0, 3)
    .join(' • ');
};

const cleanSystemPrompt = (systemPrompt?: string): string => {
  if (!systemPrompt) return '';
  return systemPrompt
    .replace(/^You are\s+/i, '')
    .replace(/^You're\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const SquarePalCard: React.FC<SquarePalCardProps> = observer(({pal, onPress}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const l10n = useContext(L10nContext);
  const navigation = useNavigation();
  const shouldShowModelWarning =
    !!pal.defaultModel && !modelStore.isModelAvailable(pal.defaultModel.id);

  const handleStartChat = async () => {
    try {
      await activatePalWithModel(pal, navigation as any);
    } catch (error) {
      console.error('Error starting local Pal chat:', error);
      Alert.alert('Error', 'Could not start this Pal. Check that its model is downloaded.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      l10n.palsScreen.deletePal,
      t(l10n.palsScreen.deletePalConfirmation, {palName: pal.name}),
      [
        {text: l10n.common.cancel, style: 'cancel'},
        {
          text: l10n.common.delete,
          style: 'destructive',
          onPress: () => palStore.deletePal(pal.id),
        },
      ],
    );
  };

  const handleShare = async () => {
    try {
      await exportPal(pal.id);
    } catch (error) {
      console.error('Error exporting local Pal:', error);
      Alert.alert('Share Error', 'Failed to export this Pal. Please try again.');
    }
  };

  const description =
    pal.description || generateParameterSummary(pal) || cleanSystemPrompt(pal.systemPrompt) ||
    (hasVideoCapability(pal) ? 'Video AI Assistant' : 'AI Assistant');
  const colors = Array.isArray(pal.color) && pal.color.length >= 2 ? pal.color : ['#333333', '#e5e5e6'];
  const textColor = getContrastColor(colors[0]);
  const thumbnailUrl = pal.thumbnail_url ? getFullThumbnailUri(pal.thumbnail_url) : undefined;

  return (
    <View style={styles.cardOuter}>
      <TouchableOpacity
        testID={`local-pal-card-${pal.id}`}
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}>
        <Card elevation={0} style={[styles.card, {borderColor: colors[1], borderWidth: 0.5}]} contentStyle={styles.cardInner}>
          <View style={styles.cardContent}>
            <View style={[styles.thumbnail, {backgroundColor: colors[0]}]}>
              {thumbnailUrl ? (
                <Image source={{uri: thumbnailUrl}} style={styles.thumbnailImage} resizeMode="cover" />
              ) : (
                <Text style={[styles.thumbnailText, {color: textColor}]}>
                  {pal.name?.[0]?.toUpperCase() || 'P'}
                </Text>
              )}
              <TouchableOpacity style={styles.chatButton} onPress={handleStartChat}>
                {hasVideoCapability(pal) ? (
                  <CameraIcon stroke={theme.colors.primary} width={18} height={18} />
                ) : (
                  <ChatIcon stroke={theme.colors.primary} width={18} height={18} />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.nameSection}>
                  <Text style={styles.palName} numberOfLines={1}>{pal.name}</Text>
                </View>
                <View style={styles.headerActions}>
                  <IconButton
                    icon={() => <ShareIcon stroke={theme.colors.onSurface} width={16} height={16} />}
                    size={20}
                    style={styles.actionButton}
                    onPress={handleShare}
                  />
                  <IconButton
                    icon={() => <TrashIcon stroke={theme.colors.error} width={16} height={16} />}
                    size={20}
                    style={styles.actionButton}
                    onPress={handleDelete}
                  />
                </View>
              </View>
              <View style={styles.middleContent}>
                <Text style={styles.description} numberOfLines={shouldShowModelWarning ? 1 : 2}>
                  {description}
                </Text>
                {shouldShowModelWarning && (
                  <View style={styles.warningContainer}>
                    <IconButton icon="alert-circle-outline" iconColor={theme.colors.error} size={14} style={styles.warningIcon} />
                    <Text style={styles.warningText} numberOfLines={1}>
                      {l10n.components.modelNotAvailable.modelNotDownloadedShort}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </View>
  );
});
