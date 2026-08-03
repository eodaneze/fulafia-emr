import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, radius, shadows } from '@/src/theme';

type BrandMarkProps = {
  size?: number;
  compact?: boolean;
};

export function BrandMark({
  size = 92,
  compact = false,
}: BrandMarkProps) {
  const iconSize = compact ? size * 0.5 : size * 0.46;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: compact ? radius.lg : size / 2,
        },
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            width: size * 0.76,
            height: size * 0.76,
            borderRadius: compact ? radius.md : size / 2,
          },
        ]}
      >
        <Ionicons
          name="medical"
          size={iconSize}
          color={colors.textOnPrimary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    ...shadows.medium,
  },

  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
  },
});