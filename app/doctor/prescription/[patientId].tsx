import { Ionicons } from '@expo/vector-icons';
import {
  router,
  useLocalSearchParams,
  type Href,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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

import { AppButton, AppInput } from '@/src/components';
import { useDoctorStore } from '@/src/store/doctor.store';
import { usePatientStore } from '@/src/store/patient.store';
import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme';
import type {
  MedicationFrequency,
  MedicationRoute,
  PrescriptionItem,
} from '@/src/types/doctor';
import { getPatientInitials } from '@/src/types/patient';

type PrescriptionDraftItem = Omit<
  PrescriptionItem,
  'dispensedQuantity' | 'dispensingStatus'
>;

const frequencyOptions: Array<{
  value: MedicationFrequency;
  label: string;
}> = [
  {
    value: 'once_daily',
    label: 'Once daily',
  },
  {
    value: 'twice_daily',
    label: 'Twice daily',
  },
  {
    value: 'three_times_daily',
    label: '3 times daily',
  },
  {
    value: 'four_times_daily',
    label: '4 times daily',
  },
  {
    value: 'at_night',
    label: 'At night',
  },
  {
    value: 'when_required',
    label: 'When required',
  },
  {
    value: 'stat',
    label: 'STAT',
  },
];

const routeOptions: Array<{
  value: MedicationRoute;
  label: string;
}> = [
  {
    value: 'oral',
    label: 'Oral',
  },
  {
    value: 'intravenous',
    label: 'IV',
  },
  {
    value: 'intramuscular',
    label: 'IM',
  },
  {
    value: 'topical',
    label: 'Topical',
  },
  {
    value: 'inhalation',
    label: 'Inhalation',
  },
];

function createEmptyMedication(): PrescriptionDraftItem {
  return {
    id: `medication-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`,

    drugName: '',
    strength: '',
    dose: '',

    frequency: 'twice_daily',
    customFrequency: undefined,

    route: 'oral',
    duration: '',
    quantity: 1,

    instruction: '',
  };
}

export default function CreatePrescriptionScreen() {
  const { patientId } = useLocalSearchParams<{
    patientId: string;
  }>();

  const patient = usePatientStore((state) =>
    state.getPatientById(patientId),
  );

  const consultation = useDoctorStore((state) =>
    state.getConsultationByPatientId(patientId),
  );

  const createPrescription = useDoctorStore(
    (state) => state.createPrescription,
  );

  const isCreatingPrescription = useDoctorStore(
    (state) => state.isCreatingPrescription,
  );

  const [medications, setMedications] = useState<
    PrescriptionDraftItem[]
  >([createEmptyMedication()]);

  const [generalInstruction, setGeneralInstruction] =
    useState('');

  if (!patient || !consultation) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={styles.notFoundTitle}>
          Clinical case unavailable
        </Text>

        <AppButton
          onPress={() =>
            router.replace('/doctor' as Href)
          }
          title="Return to doctor queue"
        />
      </SafeAreaView>
    );
  }

  const updateMedication = (
    medicationId: string,
    values: Partial<PrescriptionDraftItem>,
  ) => {
    setMedications((current) =>
      current.map((medication) =>
        medication.id === medicationId
          ? {
              ...medication,
              ...values,
            }
          : medication,
      ),
    );
  };

  const addMedication = () => {
    setMedications((current) => [
      ...current,
      createEmptyMedication(),
    ]);
  };

  const removeMedication = (
    medicationId: string,
  ) => {
    if (medications.length === 1) {
      Alert.alert(
        'Medication required',
        'A prescription must contain at least one medication.',
      );

      return;
    }

    setMedications((current) =>
      current.filter(
        (medication) =>
          medication.id !== medicationId,
      ),
    );
  };

  const submitPrescription = async () => {
    const result = await createPrescription({
      patientId: patient.id,
      consultationId: consultation.id,

      definitiveDiagnosis:
        consultation.definitiveDiagnosis ?? '',

      disposition:
        consultation.disposition === 'undecided'
          ? 'outpatient'
          : consultation.disposition,

      items: medications,
      generalInstruction,
    });

    if (!result.success) {
      Alert.alert(
        'Prescription not submitted',
        result.message,
      );

      return;
    }

    Alert.alert(
      'Prescription sent to pharmacy',
      `${medications.length} medication${
        medications.length === 1 ? '' : 's'
      } have been added to the pharmacy queue.`,
      [
        {
          text: 'Return to doctor queue',
          onPress: () =>
            router.replace('/doctor' as Href),
        },
        {
          text: 'View patient',
          onPress: () =>
            router.replace({
              pathname: '/doctor/[patientId]',
              params: {
                patientId: patient.id,
              },
            } as Href),
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
              Create prescription
            </Text>

            <Text style={styles.headerSubtitle}>
              Outpatient medication order
            </Text>
          </View>

          <View style={styles.medicationCount}>
            <Text style={styles.medicationCountText}>
              {medications.length}
            </Text>
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
            <View style={styles.patientCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getPatientInitials(patient)}
                </Text>
              </View>

              <View style={styles.patientIdentity}>
                <Text style={styles.patientName}>
                  {patient.fullName}
                </Text>

                <Text style={styles.hospitalNumber}>
                  {patient.hospitalNumber}
                </Text>

                <Text style={styles.diagnosis}>
                  {consultation.definitiveDiagnosis ??
                    'Diagnosis not recorded'}
                </Text>
              </View>
            </View>

            <View style={styles.allergyNotice}>
              <Ionicons
                color={
                  patient.allergies?.length
                    ? colors.danger
                    : colors.success
                }
                name="alert-circle-outline"
                size={22}
              />

              <View style={styles.allergyText}>
                <Text style={styles.allergyTitle}>
                  Allergy status
                </Text>

                <Text
                  style={styles.allergyDescription}
                >
                  {patient.allergies?.length
                    ? patient.allergies.join(', ')
                    : 'No known allergies'}
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionEyebrow}>
                MEDICATION ORDER
              </Text>

              <Text style={styles.sectionTitle}>
                Prescribed medications
              </Text>
            </View>

            <View style={styles.medicationList}>
              {medications.map(
                (medication, index) => (
                  <MedicationForm
                    index={index}
                    key={medication.id}
                    medication={medication}
                    onRemove={() =>
                      removeMedication(
                        medication.id,
                      )
                    }
                    onUpdate={(values) =>
                      updateMedication(
                        medication.id,
                        values,
                      )
                    }
                  />
                ),
              )}
            </View>

            <Pressable
              onPress={addMedication}
              style={styles.addMedicationButton}
            >
              <Ionicons
                color={colors.primary}
                name="add-circle-outline"
                size={22}
              />

              <Text
                style={styles.addMedicationText}
              >
                Add another medication
              </Text>
            </Pressable>

            <View style={styles.instructionCard}>
              <Text style={styles.fieldLabel}>
                General prescription instruction
              </Text>

              <TextInput
                multiline
                onChangeText={setGeneralInstruction}
                placeholder="Example: Take medications after meals and return if symptoms worsen..."
                placeholderTextColor={
                  colors.textMuted
                }
                selectionColor={colors.primary}
                style={styles.textArea}
                textAlignVertical="top"
                value={generalInstruction}
              />
            </View>

            <View style={styles.pharmacyNotice}>
              <View style={styles.pharmacyIcon}>
                <Ionicons
                  color={colors.success}
                  name="bandage-outline"
                  size={23}
                />
              </View>

              <View style={styles.pharmacyText}>
                <Text style={styles.pharmacyTitle}>
                  Automatic pharmacy queue
                </Text>

                <Text
                  style={
                    styles.pharmacyDescription
                  }
                >
                  Submitting this prescription sends the
                  medication order directly to the pharmacy.
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <AppButton
                loading={isCreatingPrescription}
                onPress={submitPrescription}
                title="Submit prescription"
              />

              <AppButton
                onPress={() => router.back()}
                title="Return to doctor review"
                variant="ghost"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function MedicationForm({
  medication,
  index,
  onUpdate,
  onRemove,
}: {
  medication: PrescriptionDraftItem;
  index: number;
  onUpdate: (
    values: Partial<PrescriptionDraftItem>,
  ) => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.medicationCard}>
      <View style={styles.medicationHeader}>
        <View style={styles.medicationNumber}>
          <Text
            style={styles.medicationNumberText}
          >
            {String(index + 1).padStart(2, '0')}
          </Text>
        </View>

        <View style={styles.medicationHeaderText}>
          <Text style={styles.medicationTitle}>
            Medication {index + 1}
          </Text>

          <Text
            style={styles.medicationSubtitle}
          >
            Complete all required dosage information
          </Text>
        </View>

        <Pressable
          hitSlop={10}
          onPress={onRemove}
        >
          <Ionicons
            color={colors.danger}
            name="trash-outline"
            size={21}
          />
        </Pressable>
      </View>

      <View style={styles.fields}>
        <AppInput
          autoCapitalize="words"
          icon="bandage-outline"
          label="Drug name *"
          onChangeText={(value) =>
            onUpdate({
              drugName: value,
            })
          }
          placeholder="Example: Artemether/Lumefantrine"
          value={medication.drugName}
        />

        <View style={styles.twoColumns}>
          <View style={styles.column}>
            <AppInput
              autoCapitalize="none"
              label="Strength *"
              onChangeText={(value) =>
                onUpdate({
                  strength: value,
                })
              }
              placeholder="20/120 mg"
              value={medication.strength}
            />
          </View>

          <View style={styles.column}>
            <AppInput
              autoCapitalize="none"
              label="Dose *"
              onChangeText={(value) =>
                onUpdate({
                  dose: value,
                })
              }
              placeholder="4 tablets"
              value={medication.dose}
            />
          </View>
        </View>

        <Text style={styles.fieldLabel}>
          Frequency *
        </Text>

        <ScrollView
          contentContainerStyle={styles.options}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {frequencyOptions.map((option) => {
            const active =
              medication.frequency ===
              option.value;

            return (
              <Pressable
                key={option.value}
                onPress={() =>
                  onUpdate({
                    frequency: option.value,
                  })
                }
                style={[
                  styles.option,
                  active &&
                    styles.selectedOption,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    active &&
                      styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.fieldLabel}>
          Route *
        </Text>

        <ScrollView
          contentContainerStyle={styles.options}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {routeOptions.map((option) => {
            const active =
              medication.route === option.value;

            return (
              <Pressable
                key={option.value}
                onPress={() =>
                  onUpdate({
                    route: option.value,
                  })
                }
                style={[
                  styles.option,
                  active &&
                    styles.selectedOption,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    active &&
                      styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.twoColumns}>
          <View style={styles.column}>
            <AppInput
              label="Duration *"
              onChangeText={(value) =>
                onUpdate({
                  duration: value,
                })
              }
              placeholder="3 days"
              value={medication.duration}
            />
          </View>

          <View style={styles.column}>
            <AppInput
              keyboardType="number-pad"
              label="Quantity *"
              onChangeText={(value) =>
                onUpdate({
                  quantity:
                    Number(
                      value.replace(/\D/g, ''),
                    ) || 0,
                })
              }
              placeholder="24"
              value={
                medication.quantity
                  ? String(
                      medication.quantity,
                    )
                  : ''
              }
            />
          </View>
        </View>

        <View>
          <Text style={styles.fieldLabel}>
            Special instruction
          </Text>

          <TextInput
            multiline
            onChangeText={(value) =>
              onUpdate({
                instruction: value,
              })
            }
            placeholder="Example: Take after meals"
            placeholderTextColor={
              colors.textMuted
            }
            selectionColor={colors.primary}
            style={styles.medicationInstruction}
            textAlignVertical="top"
            value={medication.instruction}
          />
        </View>
      </View>
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

  medicationCount: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  medicationCountText: {
    color: colors.primary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.extraBold,
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
    marginLeft: spacing.md,
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
  },

  diagnosis: {
    marginTop: 5,
    color: 'rgba(255,255,255,0.58)',
    fontSize: 10,
  },

  allergyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.warningSoft,
  },

  allergyText: {
    flex: 1,
  },

  allergyTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  allergyDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  sectionHeading: {
    marginTop: spacing.xxxl,
  },

  sectionEyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 1.3,
  },

  sectionTitle: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.cardTitle,
    fontWeight: typography.weight.bold,
  },

  medicationList: {
    gap: spacing.lg,
    marginTop: spacing.lg,
  },

  medicationCard: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  medicationNumber: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  medicationNumberText: {
    color: colors.textOnPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.extraBold,
  },

  medicationHeaderText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  medicationTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  medicationSubtitle: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  fields: {
    gap: spacing.lg,
    marginTop: spacing.lg,
  },

  twoColumns: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  column: {
    flex: 1,
  },

  fieldLabel: {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
  },

  options: {
    gap: spacing.sm,
    paddingRight: spacing.xl,
  },

  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
  },

  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  optionText: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },

  selectedOptionText: {
    color: colors.textOnPrimary,
  },

  medicationInstruction: {
    minHeight: 90,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.textPrimary,
    fontSize: typography.size.body,
  },

  addMedicationButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },

  addMedicationText: {
    color: colors.primary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  instructionCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  textArea: {
    minHeight: 110,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.textPrimary,
    fontSize: typography.size.body,
  },

  pharmacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.successSoft,
  },

  pharmacyIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  pharmacyText: {
    flex: 1,
  },

  pharmacyTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  pharmacyDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  actions: {
    gap: spacing.md,
    marginTop: spacing.lg,
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