import { Ionicons } from '@expo/vector-icons';
import {
  router,
  type Href,
} from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/src/components';
import { useEquipmentStore } from '@/src/store/equipment.store';
import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme';
import type {
  EquipmentStatus,
} from '@/src/types/equipment';

type EquipmentForm = {
  name: string;
  serialNumber: string;
  category: string;
  department: string;
  assignedOfficer: string;
  location: string;
  purchaseDate: string;
  warrantyExpiry: string;
  lastMaintenanceDate: string;
  nextServiceDate: string;
  status: EquipmentStatus;
  notes: string;
};

const initialForm: EquipmentForm = {
  name: '',
  serialNumber: '',
  category: '',
  department: '',
  assignedOfficer: '',
  location: '',
  purchaseDate: '',
  warrantyExpiry: '',
  lastMaintenanceDate: '',
  nextServiceDate: '',
  status: 'working',
  notes: '',
};

const equipmentStatuses: Array<{
  label: string;
  value: EquipmentStatus;
}> = [
  {
    label: 'Working',
    value: 'working',
  },
  {
    label: 'Under repair',
    value: 'under_repair',
  },
  {
    label: 'Maintenance due',
    value: 'maintenance_due',
  },
  {
    label: 'Retired',
    value: 'retired',
  },
];

export default function CreateEquipmentScreen() {
  const createEquipment =
    useEquipmentStore(
      (state) => state.createEquipment,
    );

  const isCreatingEquipment =
    useEquipmentStore(
      (state) =>
        state.isCreatingEquipment,
    );

  const [form, setForm] =
    useState<EquipmentForm>(initialForm);

  const updateForm = <
    Key extends keyof EquipmentForm,
  >(
    key: Key,
    value: EquipmentForm[Key],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const submitEquipment = async () => {
    if (!form.name.trim()) {
      Alert.alert(
        'Equipment name required',
        'Enter the equipment name.',
      );
      return;
    }

    if (!form.serialNumber.trim()) {
      Alert.alert(
        'Serial number required',
        'Enter a unique equipment serial number.',
      );
      return;
    }

    if (!form.category.trim()) {
      Alert.alert(
        'Category required',
        'Enter the equipment category.',
      );
      return;
    }

    if (!form.department.trim()) {
      Alert.alert(
        'Department required',
        'Enter the department assigned to this equipment.',
      );
      return;
    }

    if (!form.location.trim()) {
      Alert.alert(
        'Location required',
        'Enter the current equipment location.',
      );
      return;
    }

    if (!form.purchaseDate.trim()) {
      Alert.alert(
        'Purchase date required',
        'Enter the purchase date using YYYY-MM-DD.',
      );
      return;
    }

    const result =
      await createEquipment({
        name: form.name,
        serialNumber: form.serialNumber,
        category: form.category,

        department: form.department,
        assignedOfficer:
          form.assignedOfficer,
        location: form.location,

        purchaseDate: form.purchaseDate,
        warrantyExpiry:
          form.warrantyExpiry,

        lastMaintenanceDate:
          form.lastMaintenanceDate,

        nextServiceDate:
          form.nextServiceDate,

        status: form.status,
        notes: form.notes,
      });

    if (!result.success || !result.data) {
      Alert.alert(
        'Equipment record not created',
        result.message,
      );
      return;
    }

    const createdEquipment = result.data;

    Alert.alert(
      'Equipment record created',
      result.message,
      [
        {
          text: 'View equipment',
          onPress: () =>
            router.replace({
              pathname:
                '/equipment/[equipmentId]',
              params: {
                equipmentId:
                  createdEquipment.id,
              },
            } as Href),
        },
        {
          text: 'Return to register',
          onPress: () =>
            router.replace(
              '/equipment' as Href,
            ),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Return to equipment register"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            color={colors.textPrimary}
            name="arrow-back"
            size={23}
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Add equipment
          </Text>

          <Text style={styles.headerSubtitle}>
            Create hospital asset record
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            color={colors.primary}
            name="add-circle-outline"
            size={22}
          />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.notice}>
            <View style={styles.noticeIcon}>
              <Ionicons
                color={colors.primary}
                name="information-circle-outline"
                size={22}
              />
            </View>

            <Text style={styles.noticeText}>
              Equipment records help management
              track responsibility, service schedules
              and asset condition across hospital
              departments.
            </Text>
          </View>

          <FormSection
            icon="construct-outline"
            title="Equipment information"
          >
            <FormField
              label="Equipment name *"
              onChangeText={(value) =>
                updateForm('name', value)
              }
              placeholder="Example: ECG Machine"
              value={form.name}
            />

            <FormField
              autoCapitalize="characters"
              label="Serial number *"
              onChangeText={(value) =>
                updateForm(
                  'serialNumber',
                  value,
                )
              }
              placeholder="FULCH-ECG-2026-001"
              value={form.serialNumber}
            />

            <FormField
              label="Category *"
              onChangeText={(value) =>
                updateForm(
                  'category',
                  value,
                )
              }
              placeholder="Example: Diagnostic Equipment"
              value={form.category}
            />
          </FormSection>

          <FormSection
            icon="business-outline"
            title="Assignment"
          >
            <FormField
              label="Department *"
              onChangeText={(value) =>
                updateForm(
                  'department',
                  value,
                )
              }
              placeholder="Example: Medical Laboratory"
              value={form.department}
            />

            <FormField
              label="Assigned officer"
              onChangeText={(value) =>
                updateForm(
                  'assignedOfficer',
                  value,
                )
              }
              placeholder="Officer responsible"
              value={form.assignedOfficer}
            />

            <FormField
              label="Current location *"
              onChangeText={(value) =>
                updateForm(
                  'location',
                  value,
                )
              }
              placeholder="Example: Consultation Room 1"
              value={form.location}
            />
          </FormSection>

          <FormSection
            icon="calendar-outline"
            title="Purchase and maintenance"
          >
            <FormField
              label="Purchase date *"
              onChangeText={(value) =>
                updateForm(
                  'purchaseDate',
                  value,
                )
              }
              placeholder="YYYY-MM-DD"
              value={form.purchaseDate}
            />

            <FormField
              label="Warranty expiry"
              onChangeText={(value) =>
                updateForm(
                  'warrantyExpiry',
                  value,
                )
              }
              placeholder="YYYY-MM-DD"
              value={form.warrantyExpiry}
            />

            <FormField
              label="Last maintenance date"
              onChangeText={(value) =>
                updateForm(
                  'lastMaintenanceDate',
                  value,
                )
              }
              placeholder="YYYY-MM-DD"
              value={
                form.lastMaintenanceDate
              }
            />

            <FormField
              label="Next service date"
              onChangeText={(value) =>
                updateForm(
                  'nextServiceDate',
                  value,
                )
              }
              placeholder="YYYY-MM-DD"
              value={form.nextServiceDate}
            />
          </FormSection>

          <FormSection
            icon="pulse-outline"
            title="Condition"
          >
            <Text style={styles.fieldLabel}>
              Current equipment status
            </Text>

            <View style={styles.statusOptions}>
              {equipmentStatuses.map(
                (status) => {
                  const active =
                    form.status ===
                    status.value;

                  const tone =
                    getStatusTone(
                      status.value,
                    );

                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={status.value}
                      onPress={() =>
                        updateForm(
                          'status',
                          status.value,
                        )
                      }
                      style={[
                        styles.statusOption,
                        active && {
                          borderColor:
                            tone.color,
                          backgroundColor:
                            tone.background,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusOptionDot,
                          {
                            backgroundColor:
                              tone.color,
                          },
                        ]}
                      />

                      <Text
                        style={[
                          styles.statusOptionText,
                          active && {
                            color:
                              tone.color,
                          },
                        ]}
                      >
                        {status.label}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>

            <FormField
              label="Equipment notes"
              multiline
              onChangeText={(value) =>
                updateForm('notes', value)
              }
              placeholder="Add maintenance instructions, reported faults or usage notes..."
              value={form.notes}
            />
          </FormSection>

          <View style={styles.actions}>
            <AppButton
              loading={isCreatingEquipment}
              onPress={submitEquipment}
              title="Create equipment record"
            />

            <AppButton
              onPress={() => router.back()}
              title="Cancel"
              variant="ghost"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FormSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons
            color={colors.primary}
            name={icon}
            size={21}
          />
        </View>

        <Text style={styles.sectionTitle}>
          {title}
        </Text>
      </View>

      <View style={styles.fields}>
        {children}
      </View>
    </View>
  );
}

function FormField({
  label,
  value,
  placeholder,
  onChangeText,
  multiline = false,
  autoCapitalize = 'sentences',
}: {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;

  autoCapitalize?:
    | 'none'
    | 'sentences'
    | 'words'
    | 'characters';
}) {
  return (
    <View>
      <Text style={styles.fieldLabel}>
        {label}
      </Text>

      <TextInput
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        style={[
          styles.input,
          multiline && styles.textArea,
        ]}
        textAlignVertical={
          multiline ? 'top' : 'center'
        }
        value={value}
      />
    </View>
  );
}

function getStatusTone(
  status: EquipmentStatus,
): {
  background: string;
  color: string;
} {
  const tones = {
    working: {
      background: colors.successSoft,
      color: colors.success,
    },
    under_repair: {
      background: colors.dangerSoft,
      color: colors.danger,
    },
    maintenance_due: {
      background: colors.warningSoft,
      color: colors.warning,
    },
    retired: {
      background: colors.infoSoft,
      color: colors.info,
    },
  };

  return tones[status];
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  keyboardView: {
    flex: 1,
  },

  header: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal:
      spacing.screenHorizontal,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },

  headerText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.bold,
  },

  headerSubtitle: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  content: {
    padding: spacing.screenHorizontal,
    paddingBottom: spacing.massive,
  },

  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },

  noticeIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  noticeText: {
    flex: 1,
    marginLeft: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  sectionCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  sectionTitle: {
    marginLeft: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  fields: {
    gap: spacing.lg,
    marginTop: spacing.lg,
  },

  fieldLabel: {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
  },

  input: {
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    backgroundColor: colors.surface,
  },

  textArea: {
    minHeight: 120,
    paddingTop: spacing.lg,
  },

  statusOptions: {
    gap: spacing.sm,
  },

  statusOption: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },

  statusOptionDot: {
    width: 9,
    height: 9,
    borderRadius: radius.round,
  },

  statusOptionText: {
    marginLeft: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
  },

  actions: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  pressed: {
    opacity: 0.7,
  },
});