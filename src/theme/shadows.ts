import { Platform, ViewStyle } from 'react-native';

export const shadows: Record<'small' | 'medium' | 'large', ViewStyle> = {
  small: Platform.select({
    ios: {
      shadowColor: '#001F1A',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),

  medium: Platform.select({
    ios: {
      shadowColor: '#001F1A',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.1,
      shadowRadius: 16,
    },
    android: {
      elevation: 5,
    },
    default: {},
  }),

  large: Platform.select({
    ios: {
      shadowColor: '#001F1A',
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 0.15,
      shadowRadius: 24,
    },
    android: {
      elevation: 10,
    },
    default: {},
  }),
};