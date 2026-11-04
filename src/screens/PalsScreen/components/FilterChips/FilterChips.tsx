import React from 'react';
import {View, ScrollView} from 'react-native';
import {Chip} from 'react-native-paper';
import {useTheme} from '../../../../hooks';
import {createStyles} from './styles';

export type FilterType = 'all' | 'video';
interface FilterChipsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}
export const FilterChips: React.FC<FilterChipsProps> = ({activeFilter, onFilterChange}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {([{key: 'all', label: 'All local Pals'}, {key: 'video', label: 'Video Pals'}] as const).map(option => (
          <Chip
            key={option.key}
            mode={activeFilter === option.key ? 'flat' : 'outlined'}
            selected={activeFilter === option.key}
            onPress={() => onFilterChange(option.key)}
            style={[styles.chip, activeFilter === option.key && styles.activeChip]}
            textStyle={[styles.chipText, activeFilter === option.key && styles.activeChipText]}
            compact>
            {option.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
};
