import React, {useMemo, useState} from 'react';
import {View, FlatList, TextInput, useWindowDimensions} from 'react-native';
import {Text} from 'react-native-paper';
import {observer} from 'mobx-react-lite';

import {PlusIcon} from '../../assets/icons';
import {useTheme} from '../../hooks';
import {createStyles} from './styles';
import {chunkIntoRows, computePalGridLayout} from './palGridLayout';
import {PalGridRow} from './components/PalGridRow';
import {BottomActionBar} from './components/BottomActionBar';
import {PalSheet} from '../../components/PalsSheets';
import {
  createNewAssistantPal,
  createNewRoleplayPal,
  createNewVideoPal,
  preparePalForEditing,
} from '../../utils/pal-templates';
import {palStore} from '../../store/PalStore';
import type {Pal} from '../../types/pal';
import {hasVideoCapability} from '../../utils/pal-capabilities';

export const PalsScreen: React.FC = observer(() => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const {width} = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [videoOnly, setVideoOnly] = useState(false);
  const [showPalSheet, setShowPalSheet] = useState(false);
  const [currentPal, setCurrentPal] = useState<Partial<Pal> | null>(null);

  const pals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return palStore.getLocalPals().filter(pal => {
      const matchesQuery =
        !normalizedQuery ||
        pal.name.toLowerCase().includes(normalizedQuery) ||
        (pal.description ?? '').toLowerCase().includes(normalizedQuery);
      return matchesQuery && (!videoOnly || hasVideoCapability(pal));
    });
  }, [query, videoOnly, palStore.pals.length, palStore.ready]);

  const handleCreatePal = (type: 'assistant' | 'roleplay' | 'video') => {
    const newPal =
      type === 'roleplay'
        ? createNewRoleplayPal()
        : type === 'video'
          ? createNewVideoPal()
          : createNewAssistantPal();
    setCurrentPal(newPal);
    setShowPalSheet(true);
  };

  const handleEditPal = (pal: Pal) => {
    setCurrentPal(preparePalForEditing(pal));
    setShowPalSheet(true);
  };

  const {columns, cardWidth} = computePalGridLayout(width);
  const rows = chunkIntoRows(pals, columns);

  return (
    <View style={styles.container}>
      <View style={{paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12}}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search your local Pals"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          style={{
            color: theme.colors.onSurface,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
          accessibilityLabel="Search local Pals"
        />
        <View
          style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
          <Text
            onPress={() => setVideoOnly(false)}
            style={{
              color: !videoOnly
                ? theme.colors.primary
                : theme.colors.onSurfaceVariant,
              marginRight: 18,
            }}>
            All local Pals
          </Text>
          <Text
            onPress={() => setVideoOnly(true)}
            style={{
              color: videoOnly
                ? theme.colors.primary
                : theme.colors.onSurfaceVariant,
            }}>
            Video Pals
          </Text>
        </View>
      </View>
      <FlatList
        data={rows}
        keyExtractor={row => row.key}
        renderItem={({item}) => (
          <PalGridRow
            row={item}
            cardWidth={cardWidth}
            onPalPress={pal => handleEditPal(pal as Pal)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <PlusIcon
              stroke={theme.colors.onSurfaceVariant}
              width={48}
              height={48}
            />
            <Text style={styles.emptyStateText}>
              {query || videoOnly
                ? 'No matching local Pals.'
                : 'No Pals yet. Create your first local Pal using the + button.'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        testID="pals-flat-list"
      />
      <BottomActionBar onCreatePal={handleCreatePal} />
      {showPalSheet && currentPal && (
        <PalSheet
          isVisible={showPalSheet}
          onClose={() => {
            setShowPalSheet(false);
            setCurrentPal(null);
          }}
          pal={currentPal}
        />
      )}
    </View>
  );
});

export default PalsScreen;
