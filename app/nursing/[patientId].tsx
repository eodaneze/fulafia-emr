import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
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

import { AppButton, AppInput } from '@/src/components';
import { useNursingStore } from '@/src/store/nursing.store';
import { usePatientStore } from '@/src/store/patient.store';
import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme';
import type {
  ConsciousnessLevel,
  TriageCategory,
} from '@/src/types/nursing';
import { getPatientInitials } from '@/src/types/patient';

type VitalsForm = {
  systolicBloodPressure: string;
  diastolicBloodPressure: string;
  pulseRate: string;
  temperature: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  weight: string;
  height: string;
  painScore: string;

  triageCategory: TriageCategory;
  consciousnessLevel: ConsciousnessLevel;

  presentingComplaint: string;
  nursingNote: string;
};

const initialForm: VitalsForm = {
  systolicBloodPressure: '',
  diastolicBloodPressure: '',
  pulseRate: '',
  temperature: '',
  respiratoryRate: '',
  oxygenSaturation: '',
  weight: '',
  height: '',
  painScore: '',

  triageCategory: 'routine',
  consciousnessLevel: 'alert',

  presentingComplaint: '',
  nursingNote: '',
};

export default function RecordVitalSignsScreen() {
  const { patientId } = useLocalSearchParams<{
    patientId: string;
  }>();

  const patient = usePatientStore((state) =>
    state.getPatientById(patientId),
  );

  const saveVitalSigns = useNursingStore(
    (state) => state.saveVitalSigns,
  );

  const isSaving = useNursingStore(
    (state) => state.isSaving,
  );

  const [form, setForm] =
    useState<VitalsForm>(initialForm);

  const [activeSection, setActiveSection] =
    useState<'vitals' | 'triage' | 'notes'>('vitals');

  const progress = useMemo(() => {
    const requiredFields = [
      form.systolicBloodPressure,
      form.diastolicBloodPressure,
      form.pulseRate,
      form.temperature,
      form.respiratoryRate,
      form.oxygenSaturation,
      form.weight,
      form.height,
      form.painScore,
    ];

    const completedFields = requiredFields.filter(
      Boolean,
    );

    return Math.round(
      (completedFields.length / requiredFields.length) *
        100,
    );
  }, [form]);

  if (!patient) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Ionicons
          color={colors.primary}
          name="person-outline"
          size={52}
        />

        <Text style={styles.notFoundTitle}>
          Patient unavailable
        </Text>

        <AppButton
          onPress={() => router.replace('/nursing')}
          title="Return to nursing queue"
        />
      </SafeAreaView>
    );
  }

  const updateField = <Key extends keyof VitalsForm>(
    key: Key,
    value: VitalsForm[Key],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const parseNumber = (value: string): number => {
    return Number(value.trim());
  };

  const validate = (): string | null => {
    const requiredFields: Array<{
      label: string;
      value: string;
    }> = [
      {
        label: 'systolic blood pressure',
        value: form.systolicBloodPressure,
      },
      {
        label: 'diastolic blood pressure',
        value: form.diastolicBloodPressure,
      },
      {
        label: 'pulse rate',
        value: form.pulseRate,
      },
      {
        label: 'temperature',
        value: form.temperature,
      },
      {
        label: 'respiratory rate',
        value: form.respiratoryRate,
      },
      {
        label: 'oxygen saturation',
        value: form.oxygenSaturation,
      },
      {
        label: 'weight',
        value: form.weight,
      },
      {
        label: 'height',
        value: form.height,
      },
      {
        label: 'pain score',
        value: form.painScore,
      },
    ];

    const missingField = requiredFields.find(
      (field) => !field.value.trim(),
    );

    if (missingField) {
      return `Enter the patient’s ${missingField.label}.`;
    }

    const values = requiredFields.map((field) =>
      Number(field.value),
    );

    if (values.some((value) => Number.isNaN(value))) {
      return 'All vital-sign values must be valid numbers.';
    }

    const oxygenSaturation = parseNumber(
      form.oxygenSaturation,
    );

    if (
      oxygenSaturation < 1 ||
      oxygenSaturation > 100
    ) {
      return 'Oxygen saturation must be between 1 and 100%.';
    }

    const painScore = parseNumber(form.painScore);

    if (painScore < 0 || painScore > 10) {
      return 'Pain score must be between 0 and 10.';
    }

    return null;
  };

  const submitVitals = async () => {
    const validationMessage = validate();

    if (validationMessage) {
      Alert.alert(
        'Complete vital signs',
        validationMessage,
      );

      return;
    }

    const result = await saveVitalSigns({
      patientId: patient.id,

      systolicBloodPressure: parseNumber(
        form.systolicBloodPressure,
      ),

      diastolicBloodPressure: parseNumber(
        form.diastolicBloodPressure,
      ),

      pulseRate: parseNumber(form.pulseRate),
      temperature: parseNumber(form.temperature),

      respiratoryRate: parseNumber(
        form.respiratoryRate,
      ),

      oxygenSaturation: parseNumber(
        form.oxygenSaturation,
      ),

      weight: parseNumber(form.weight),
      height: parseNumber(form.height),
      painScore: parseNumber(form.painScore),

      triageCategory: form.triageCategory,

      consciousnessLevel:
        form.consciousnessLevel,

      presentingComplaint:
        form.presentingComplaint,

      nursingNote: form.nursingNote,
    });

    if (!result.success || !result.vitalSigns) {
      Alert.alert(
        'Assessment not saved',
        result.message,
      );

      return;
    }

    const triageLabel =
      result.vitalSigns.triageCategory
        .charAt(0)
        .toUpperCase() +
      result.vitalSigns.triageCategory.slice(1);

    Alert.alert(
      'Assessment completed',
      `${patient.fullName} has been classified as ${triageLabel} and moved to the doctor queue.`,
      [
        {
          text: 'Return to queue',
          onPress: () => router.replace('/nursing'),
        },
        {
          text: 'View patient',
          onPress: () =>
            router.replace(`/patient/${patient.id}`),
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            hitSlop={10}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              color={colors.textPrimary}
              name="arrow-back"
              size={23}
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              Record vital signs
            </Text>

            <Text style={styles.headerSubtitle}>
              Nursing assessment
            </Text>
          </View>

          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>
              {progress}%
            </Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
              },
            ]}
          />
        </View>

        <KeyboardAvoidingView
          behavior={
            Platform.OS === 'ios' ? 'padding' : undefined
          }
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.patientCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getPatientInitials(patient)}
                </Text>
              </View>

              <View style={styles.patientIdentity}>
                <Text
                  numberOfLines={1}
                  style={styles.patientName}
                >
                  {patient.fullName}
                </Text>

                <Text style={styles.hospitalNumber}>
                  {patient.hospitalNumber}
                </Text>

                <Text style={styles.patientMeta}>
                  {patient.age} years ·{' '}
                  {patient.sex === 'male'
                    ? 'Male'
                    : 'Female'}{' '}
                  · {patient.phoneNumber}
                </Text>
              </View>

              <View style={styles.waitingBadge}>
                <View style={styles.waitingDot} />

                <Text style={styles.waitingText}>
                  WAITING
                </Text>
              </View>
            </View>

            <View style={styles.sectionTabs}>
              <SectionTab
                active={activeSection === 'vitals'}
                icon="pulse-outline"
                label="Vitals"
                onPress={() =>
                  setActiveSection('vitals')
                }
              />

              <SectionTab
                active={activeSection === 'triage'}
                icon="alert-circle-outline"
                label="Triage"
                onPress={() =>
                  setActiveSection('triage')
                }
              />

              <SectionTab
                active={activeSection === 'notes'}
                icon="document-text-outline"
                label="Notes"
                onPress={() =>
                  setActiveSection('notes')
                }
              />
            </View>

            {activeSection === 'vitals' ? (
              <VitalSignsSection
                form={form}
                updateField={updateField}
              />
            ) : null}

            {activeSection === 'triage' ? (
              <TriageSection
                form={form}
                updateField={updateField}
              />
            ) : null}

            {activeSection === 'notes' ? (
              <NursingNotesSection
                form={form}
                updateField={updateField}
              />
            ) : null}

            <View style={styles.autoQueueNotice}>
              <View style={styles.autoQueueIcon}>
                <Ionicons
                  color={colors.success}
                  name="git-network-outline"
                  size={23}
                />
              </View>

              <View style={styles.autoQueueText}>
                <Text style={styles.autoQueueTitle}>
                  Automatic doctor queue
                </Text>

                <Text style={styles.autoQueueDescription}>
                  The patient will move immediately to the
                  doctor queue after this assessment is saved.
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <AppButton
                loading={isSaving}
                onPress={submitVitals}
                title="Complete nursing assessment"
              />

              <AppButton
                onPress={() => router.back()}
                title="Save as draft"
                variant="ghost"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

type FormUpdateFunction = <
  Key extends keyof VitalsForm,
>(
  key: Key,
  value: VitalsForm[Key],
) => void;

function VitalSignsSection({
  form,
  updateField,
}: {
  form: VitalsForm;
  updateField: FormUpdateFunction;
}) {
  return (
    <View style={styles.sectionCard}>
      <SectionHeading
        description="Capture the patient's current physiological measurements."
        icon="pulse-outline"
        title="Vital signs"
      />

      <View style={styles.inputGrid}>
        <NumberField
          label="Systolic BP"
          onChangeText={(value) =>
            updateField(
              'systolicBloodPressure',
              value,
            )
          }
          suffix="mmHg"
          value={form.systolicBloodPressure}
        />

        <NumberField
          label="Diastolic BP"
          onChangeText={(value) =>
            updateField(
              'diastolicBloodPressure',
              value,
            )
          }
          suffix="mmHg"
          value={form.diastolicBloodPressure}
        />

        <NumberField
          label="Pulse rate"
          onChangeText={(value) =>
            updateField('pulseRate', value)
          }
          suffix="bpm"
          value={form.pulseRate}
        />

        <NumberField
          decimal
          label="Temperature"
          onChangeText={(value) =>
            updateField('temperature', value)
          }
          suffix="°C"
          value={form.temperature}
        />

        <NumberField
          label="Respiratory rate"
          onChangeText={(value) =>
            updateField('respiratoryRate', value)
          }
          suffix="/min"
          value={form.respiratoryRate}
        />

        <NumberField
          label="Oxygen saturation"
          onChangeText={(value) =>
            updateField('oxygenSaturation', value)
          }
          suffix="%"
          value={form.oxygenSaturation}
        />

        <NumberField
          decimal
          label="Weight"
          onChangeText={(value) =>
            updateField('weight', value)
          }
          suffix="kg"
          value={form.weight}
        />

        <NumberField
          decimal
          label="Height"
          onChangeText={(value) =>
            updateField('height', value)
          }
          suffix="cm"
          value={form.height}
        />
      </View>

      <View style={styles.painSection}>
        <Text style={styles.fieldLabel}>
          Pain score: {form.painScore || '0'}/10
        </Text>

        <View style={styles.painOptions}>
          {Array.from({ length: 11 }, (_, index) => (
            <Pressable
              key={index}
              onPress={() =>
                updateField(
                  'painScore',
                  String(index),
                )
              }
              style={[
                styles.painOption,
                form.painScore === String(index) &&
                  styles.selectedPainOption,
              ]}
            >
              <Text
                style={[
                  styles.painOptionText,
                  form.painScore === String(index) &&
                    styles.selectedPainOptionText,
                ]}
              >
                {index}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function TriageSection({
  form,
  updateField,
}: {
  form: VitalsForm;
  updateField: FormUpdateFunction;
}) {
  return (
    <View style={styles.sectionCard}>
      <SectionHeading
        description="Assign urgency and record the patient's level of consciousness."
        icon="alert-circle-outline"
        title="Triage assessment"
      />

      <Text style={styles.fieldLabel}>
        Triage category
      </Text>

      <View style={styles.triageOptions}>
        <TriageOption
          active={form.triageCategory === 'routine'}
          color={colors.success}
          description="Stable condition"
          label="Routine"
          onPress={() =>
            updateField('triageCategory', 'routine')
          }
        />

        <TriageOption
          active={form.triageCategory === 'priority'}
          color={colors.warning}
          description="Requires earlier review"
          label="Priority"
          onPress={() =>
            updateField('triageCategory', 'priority')
          }
        />

        <TriageOption
          active={form.triageCategory === 'urgent'}
          color={colors.danger}
          description="Requires urgent review"
          label="Urgent"
          onPress={() =>
            updateField('triageCategory', 'urgent')
          }
        />

        <TriageOption
          active={form.triageCategory === 'emergency'}
          color="#9B1C1C"
          description="Immediate intervention"
          label="Emergency"
          onPress={() =>
            updateField(
              'triageCategory',
              'emergency',
            )
          }
        />
      </View>

      <Text style={styles.consciousnessLabel}>
        Level of consciousness
      </Text>

      <View style={styles.consciousnessOptions}>
        <ChoiceButton
          active={
            form.consciousnessLevel === 'alert'
          }
          label="Alert"
          onPress={() =>
            updateField(
              'consciousnessLevel',
              'alert',
            )
          }
        />

        <ChoiceButton
          active={
            form.consciousnessLevel ===
            'responds_to_voice'
          }
          label="Responds to voice"
          onPress={() =>
            updateField(
              'consciousnessLevel',
              'responds_to_voice',
            )
          }
        />

        <ChoiceButton
          active={
            form.consciousnessLevel ===
            'responds_to_pain'
          }
          label="Responds to pain"
          onPress={() =>
            updateField(
              'consciousnessLevel',
              'responds_to_pain',
            )
          }
        />

        <ChoiceButton
          active={
            form.consciousnessLevel ===
            'unresponsive'
          }
          label="Unresponsive"
          onPress={() =>
            updateField(
              'consciousnessLevel',
              'unresponsive',
            )
          }
        />
      </View>

      <View style={styles.automaticTriageNotice}>
        <Ionicons
          color={colors.info}
          name="information-circle-outline"
          size={21}
        />

        <Text style={styles.automaticTriageText}>
          Critical vital-sign readings can automatically
          increase the triage priority when the assessment is
          saved.
        </Text>
      </View>
    </View>
  );
}

function NursingNotesSection({
  form,
  updateField,
}: {
  form: VitalsForm;
  updateField: FormUpdateFunction;
}) {
  return (
    <View style={styles.sectionCard}>
      <SectionHeading
        description="Record the patient's complaint and relevant nursing observations."
        icon="document-text-outline"
        title="Nursing notes"
      />

      <MultilineInput
        label="Presenting complaint"
        onChangeText={(value) =>
          updateField('presentingComplaint', value)
        }
        placeholder="Example: Fever, headache and weakness for three days..."
        value={form.presentingComplaint}
      />

      <View style={styles.notesGap} />

      <MultilineInput
        label="Nursing observation"
        onChangeText={(value) =>
          updateField('nursingNote', value)
        }
        placeholder="Add relevant observations for the doctor..."
        value={form.nursingNote}
      />
    </View>
  );
}

function SectionHeading({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionHeadingIcon}>
        <Ionicons
          color={colors.primary}
          name={icon}
          size={22}
        />
      </View>

      <View style={styles.sectionHeadingText}>
        <Text style={styles.sectionTitle}>{title}</Text>

        <Text style={styles.sectionDescription}>
          {description}
        </Text>
      </View>
    </View>
  );
}

function SectionTab({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.sectionTab,
        active && styles.activeSectionTab,
      ]}
    >
      <Ionicons
        color={
          active
            ? colors.textOnPrimary
            : colors.textSecondary
        }
        name={icon}
        size={18}
      />

      <Text
        style={[
          styles.sectionTabText,
          active && styles.activeSectionTabText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function NumberField({
  label,
  value,
  suffix,
  decimal = false,
  onChangeText,
}: {
  label: string;
  value: string;
  suffix: string;
  decimal?: boolean;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.numberField}>
      <Text style={styles.numberFieldLabel}>
        {label}
      </Text>

      <View style={styles.numberInputContainer}>
        <TextInput
          keyboardType={
            decimal ? 'decimal-pad' : 'number-pad'
          }
          onChangeText={onChangeText}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          style={styles.numberInput}
          value={value}
        />

        <Text style={styles.numberSuffix}>
          {suffix}
        </Text>
      </View>
    </View>
  );
}

function TriageOption({
  label,
  description,
  active,
  color,
  onPress,
}: {
  label: string;
  description: string;
  active: boolean;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.triageOption,
        active && {
          borderColor: color,
          backgroundColor: `${color}12`,
        },
      ]}
    >
      <View
        style={[
          styles.triageDot,
          {
            backgroundColor: color,
          },
        ]}
      />

      <View style={styles.triageText}>
        <Text style={styles.triageLabel}>
          {label}
        </Text>

        <Text style={styles.triageDescription}>
          {description}
        </Text>
      </View>

      <Ionicons
        color={active ? color : colors.textMuted}
        name={
          active
            ? 'checkmark-circle'
            : 'ellipse-outline'
        }
        size={22}
      />
    </Pressable>
  );
}

function ChoiceButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.choiceButton,
        active && styles.activeChoiceButton,
      ]}
    >
      <Text
        style={[
          styles.choiceButtonText,
          active && styles.activeChoiceButtonText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function MultilineInput({
  label,
  value,
  placeholder,
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TextInput
        multiline
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        style={styles.multilineInput}
        textAlignVertical="top"
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  safeArea: {
    flex: 1,
  },

  header: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal,
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

  progressBadge: {
    minWidth: 48,
    height: 32,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  progressText: {
    color: colors.primary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },

  progressTrack: {
    height: 3,
    backgroundColor: colors.border,
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },

  keyboardView: {
    flex: 1,
  },

  content: {
    padding: spacing.screenHorizontal,
    paddingBottom: spacing.massive,
  },

  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryDark,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  avatarText: {
    color: colors.textOnPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.extraBold,
  },

  patientIdentity: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  patientName: {
    color: colors.textOnPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  hospitalNumber: {
    marginTop: 2,
    color: colors.secondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },

  patientMeta: {
    marginTop: 5,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
  },

  waitingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  waitingDot: {
    width: 6,
    height: 6,
    borderRadius: radius.round,
    backgroundColor: colors.warning,
  },

  waitingText: {
    color: colors.warning,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
  },

  sectionTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },

  sectionTab: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
  },

  activeSectionTab: {
    backgroundColor: colors.primary,
  },

  sectionTabText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: typography.weight.semibold,
  },

  activeSectionTabText: {
    color: colors.textOnPrimary,
    fontWeight: typography.weight.bold,
  },

  sectionCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  sectionHeadingIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  sectionHeadingText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  sectionDescription: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  numberField: {
    width: '47.8%',
  },

  numberFieldLabel: {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },

  numberInputContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },

  numberInput: {
    flex: 1,
    minHeight: 52,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  numberSuffix: {
    color: colors.textMuted,
    fontSize: 10,
  },

  painSection: {
    marginTop: spacing.xl,
  },

  fieldLabel: {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
  },

  painOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  painOption: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  selectedPainOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  painOptionText: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },

  selectedPainOptionText: {
    color: colors.textOnPrimary,
  },

  triageOptions: {
    gap: spacing.sm,
  },

  triageOption: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },

  triageDot: {
    width: 10,
    height: 10,
    borderRadius: radius.round,
  },

  triageText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  triageLabel: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  triageDescription: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  consciousnessLabel: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
  },

  consciousnessOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  choiceButton: {
    minHeight: 42,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeChoiceButton: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  choiceButtonText: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },

  activeChoiceButtonText: {
    color: colors.textOnPrimary,
  },

  automaticTriageNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.infoSoft,
  },

  automaticTriageText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  multilineInput: {
    minHeight: 120,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    backgroundColor: colors.surface,
  },

  notesGap: {
    height: spacing.lg,
  },

  autoQueueNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#BDE6D2',
    borderRadius: radius.lg,
    backgroundColor: colors.successSoft,
  },

  autoQueueIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  autoQueueText: {
    flex: 1,
  },

  autoQueueTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  autoQueueDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  actions: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },

  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xxl,
    backgroundColor: colors.background,
  },

  notFoundTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.sectionTitle,
    fontWeight: typography.weight.bold,
  },
});