import {Platform, StyleSheet} from 'react-native';
import type {Theme} from '../../utils/types';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
      padding: 16,
    },
    card: {
      marginBottom: 16,
    },
    description: {
      flex: 1,
      color: theme.colors.onSurfaceVariant,
      paddingRight: 8,
      fontSize: 12,
    },
    warning: {
      color: theme.colors.error,
      marginVertical: 8,
      textAlign: 'center',
    },
    button: {
      marginVertical: 6,
    },
    loadingContainer: {
      alignItems: 'center',
      marginVertical: 8,
    },
    loadingText: {
      marginTop: 8,
      color: theme.colors.onSurfaceVariant,
    },
    modelSelectorContent: {
      justifyContent: 'space-between',
      flexDirection: 'row-reverse',
      alignItems: 'center',
    },
    presetContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      justifyContent: 'space-around',
      flexWrap: 'wrap',
      gap: 8,
    },
    presetButton: {
      flex: 1,
      minWidth: 100,
      marginHorizontal: 4,
    },
    slidersContainer: {
      marginTop: 16,
    },
    sliderDescriptionContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    settingItem: {
      marginBottom: 16,
    },
    settingLabel: {
      color: theme.colors.primary,
      marginBottom: 0,
    },
    settingValue: {
      textAlign: 'right',
      color: theme.colors.onSurface,
      marginTop: 0,
      minWidth: 40,
      marginLeft: 8,
    },
    slider: {
      //height: 40,
      ...Platform.select({
        android: {
          marginLeft: -12,
          marginRight: -10,
        },
      }),
    },
    sectionTitle: {
      color: theme.colors.primary,
      marginBottom: 8,
    },
    advancedButton: {
      marginBottom: 6,
    },
    advancedDescription: {
      marginBottom: 16,
      color: theme.colors.onSurfaceVariant,
      fontSize: 12,
    },
    warningContainer: {
      backgroundColor: theme.colors.errorContainer,
      padding: 16,
      borderRadius: 8,
      marginBottom: 16,
    },
    warningList: {
      marginTop: 8,
      paddingLeft: 8,
    },
    warningText: {
      color: theme.colors.error,
      marginVertical: 4,
    },
    resultsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 8,
    },
    resultsCard: {
      marginTop: 16,
      padding: 0,
    },
    resultItem: {
      marginBottom: 16,
    },
    errorText: {
      marginTop: 16,
      color: theme.colors.error,
    },
    maxValueHint: {
      color: theme.colors.onSurfaceVariant,
      fontStyle: 'italic',
    },
  });
