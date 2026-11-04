import React from 'react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../../../hooks';
import {createStyles} from './styles';
import {AddPalMenu} from '../AddPalMenu';

interface BottomActionBarProps {
  onCreatePal: (type: 'assistant' | 'roleplay' | 'video') => void;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({onCreatePal}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);
  return (
    <View style={styles.container}>
      <View style={styles.actionBar}>
        <AddPalMenu
          iconColor={theme.colors.primary}
          iconSize={26}
          onCreatePal={onCreatePal}
        />
      </View>
    </View>
  );
};
