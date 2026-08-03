import { Ionicons } from '@expo/vector-icons';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { colors, radius, spacing, typography } from '@/src/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

type AppInputProps = TextInputProps & {
  label: string;
  icon?: IoniconName;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
};

export function AppInput({
  label,
  icon,
  error,
  style,
  ...inputProps
}: AppInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.inputContainer, error && styles.inputError]}>
        {icon ? (
          <Ionicons
            name={icon}
            size={20}
            color={colors.textSecondary}
            style={styles.icon}
          />
        ) : null}

        <TextInput
          {...inputProps}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          style={[styles.input, style]}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.sm,
  },

  label: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.lineHeight.label,
  },

  inputContainer: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },

  inputError: {
    borderColor: colors.danger,
  },

  icon: {
    marginRight: spacing.md,
  },

  input: {
    flex: 1,
    minHeight: 54,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.size.body,
  },

  errorText: {
    color: colors.danger,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
});