import { StyleSheet, Text, View } from 'react-native';

import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme';
import type { PatientQueueStatus } from '@/src/types/patient';

type PatientStatusBadgeProps = {
  status: PatientQueueStatus;
};

const statusConfiguration: Record<
  PatientQueueStatus,
  {
    label: string;
    backgroundColor: string;
    color: string;
  }
> = {
  not_in_queue: {
    label: 'Not in queue',
    backgroundColor: colors.surfaceMuted,
    color: colors.textSecondary,
  },

  waiting_for_vitals: {
    label: 'Waiting for vitals',
    backgroundColor: colors.warningSoft,
    color: colors.warning,
  },

  waiting_for_doctor: {
    label: 'Waiting for doctor',
    backgroundColor: colors.infoSoft,
    color: colors.info,
  },

  under_consultation: {
    label: 'Under consultation',
    backgroundColor: colors.primarySoft,
    color: colors.primary,
  },

  waiting_for_lab: {
    label: 'Waiting for laboratory',
    backgroundColor: colors.warningSoft,
    color: colors.warning,
  },

  lab_result_ready: {
    label: 'Result ready',
    backgroundColor: colors.infoSoft,
    color: colors.info,
  },

  waiting_for_pharmacy: {
    label: 'Waiting at pharmacy',
    backgroundColor: colors.warningSoft,
    color: colors.warning,
  },

  admitted: {
    label: 'Admitted',
    backgroundColor: colors.primarySoft,
    color: colors.primary,
  },

  discharged: {
    label: 'Discharged',
    backgroundColor: colors.successSoft,
    color: colors.success,
  },
};

export function PatientStatusBadge({
  status,
}: PatientStatusBadgeProps) {
  const configuration = statusConfiguration[status];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor:
            configuration.backgroundColor,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            backgroundColor: configuration.color,
          },
        ]}
      />

      <Text
        numberOfLines={1}
        style={[
          styles.text,
          {
            color: configuration.color,
          },
        ]}
      >
        {configuration.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.round,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.round,
  },

  text: {
    fontSize: 9,
    fontWeight: typography.weight.bold,
  },
});