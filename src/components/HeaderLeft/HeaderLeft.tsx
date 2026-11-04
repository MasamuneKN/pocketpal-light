import React, {useRef} from 'react';
import {TouchableOpacity, type HostInstance} from 'react-native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';

import {styles} from './styles';
import {MenuIcon} from '../../assets/icons';
import {useTheme} from '../../hooks/useTheme';

export const HeaderLeft: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const buttonRef = useRef<HostInstance>(null);

  return (
    <TouchableOpacity
      ref={buttonRef}
      style={[styles.menuIcon]}
      testID="menu-button"
      accessibilityLabel="Open drawer"
      onPress={() => navigation.openDrawer()}>
      <MenuIcon stroke={theme.colors.primary} />
    </TouchableOpacity>
  );
};
