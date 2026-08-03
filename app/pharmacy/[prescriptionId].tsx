import { Ionicons } from '@expo/vector-icons';
import {
  router,
  useLocalSearchParams,
  type Href,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
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
import { useDoctorStore } from '@/src/store/doctor.store';
import { usePatientStore } from '@/src/store/patient.store';
import { usePharmacyStore } from '@/src/store/pharmacy.store';
import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme';
import type {
  PharmacyMedicationForm,
  PharmacyDispensingItemStatus,
} from '@/src/types/pharmacy';
import { getPatientInitials } from '@/src/types/patient';

const statusOptions: Array<{
  value: PharmacyDispensingItemStatus;
  label: string;
}> = [
  {
    value: 'dispensed',
    label: 'Dispensed',
  },
  {
    value: 'partial',
    label: 'Partial',
  },
  {
    value: 'out_of_stock',
    label: 'Out of stock',
  },
];

export default function DispensePrescriptionScreen() {
  const { prescriptionId } = useLocalSearchParams<{
    prescriptionId: string;
  }>();

  const prescription = useDoctorStore((state) =>
    state.prescriptions.find(
      (item) => item.id === prescriptionId,
    ),
  );

  const patient = usePatientStore((state) =>
    prescription
      ? state.getPatientById(
          prescription.patientId,
        )
      : undefined,
  );

  const existingRecord = usePharmacyStore(
    (state) =>
      state.getDispensingRecordByPrescriptionId(
        prescriptionId,
      ),
  );

  const dispensePrescription = usePharmacyStore(
    (state) => state.dispensePrescription,
  );

  const isDispensing = usePharmacyStore(
    (state) => state.isDispensing,
  );

  const [medicationForms, setMedicationForms] =
    useState<PharmacyMedicationForm[]>([]);

  const [generalComment, setGeneralComment] =
    useState('');

  useEffect(() => {
    if (!prescription) {
      return;
    }

    setMedicationForms(
      prescription.items.map((item) => {
        const savedItem =
          existingRecord?.items.find(
            (recordItem) =>
              recordItem.prescriptionItemId ===
              item.id,
          );

        return {
          item,

          dispensedQuantity: String(
            savedItem?.dispensedQuantity ??
              item.quantity,
          ),

          status:
            savedItem?.status ??
            item.dispensingStatus === 'pending'
              ? 'dispensed'
              : item.dispensingStatus,

          batchNumber:
            savedItem?.batchNumber ?? '',

          expiryDate:
            savedItem?.expiryDate ?? '',

          pharmacistComment:
            savedItem?.pharmacistComment ?? '',
        };
      }),
    );

    setGeneralComment(
      existingRecord?.generalComment ?? '',
    );
  }, [existingRecord, prescription]);

  const completionPercentage = useMemo(() => {
    if (!medicationForms.length) {
      return 0;
    }

    const completed = medicationForms.filter(
      (form) =>
        form.status === 'out_of_stock' ||
        Number(form.dispensedQuantity) >= 0,
    ).length;

    return Math.round(
      (completed / medicationForms.length) * 100,
    );
  }, [medicationForms]);

  if (!prescription || !patient) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Ionicons
          color={colors.primary}
          name="bandage-outline"
          size={50}
        />

        <Text style={styles.notFoundTitle}>
          Prescription unavailable
        </Text>

        <AppButton
          onPress={() =>
            router.replace('/pharmacy' as Href)
          }
          title="Return to pharmacy"
        />
      </SafeAreaView>
    );
  }

  const updateMedicationForm = (
    itemId: string,
    values: Partial<PharmacyMedicationForm>,
  ) => {
    setMedicationForms((current) =>
      current.map((form) =>
        form.item.id === itemId
          ? {
              ...form,
              ...values,
            }
          : form,
      ),
    );
  };

  const selectStatus = (
    form: PharmacyMedicationForm,
    status: PharmacyDispensingItemStatus,
  ) => {
    updateMedicationForm(form.item.id, {
      status,

      dispensedQuantity:
        status === 'dispensed'
          ? String(form.item.quantity)
          : status === 'out_of_stock'
            ? '0'
            : form.dispensedQuantity,
    });
  };

  const submitDispensing = async () => {
    const result = await dispensePrescription({
      prescription,

      items: medicationForms.map((form) => ({
        prescriptionItemId: form.item.id,

        drugName: form.item.drugName,
        strength: form.item.strength,

        prescribedQuantity: form.item.quantity,

        dispensedQuantity:
          form.status === 'out_of_stock'
            ? 0
            : Number(form.dispensedQuantity),

        status: form.status,

        batchNumber:
          form.batchNumber.trim() || undefined,

        expiryDate:
          form.expiryDate.trim() || undefined,

        pharmacistComment:
          form.pharmacistComment.trim() ||
          undefined,
      })),

      generalComment,
    });

    if (!result.success) {
      Alert.alert(
        'Dispensing not completed',
        result.message,
      );

      return;
    }

    Alert.alert(
      'Pharmacy update completed',
      result.message,
      [
        {
          text: 'Return to pharmacy',
          onPress: () =>
            router.replace('/pharmacy' as Href),
        },
        {
          text: 'Remain on prescription',
        },
      ],
    );
  };

  const isAlreadyCompleted =
    prescription.status === 'dispensed';

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
              Dispense prescription
            </Text>

            <Text style={styles.headerSubtitle}>
              {prescription.id}
            </Text>
          </View>

          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>
              {completionPercentage}%
            </Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${completionPercentage}%`,
              },
            ]}
          />
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

                <Text style={styles.patientMeta}>
                  {patient.age} years ·{' '}
                  {patient.sex === 'male'
                    ? 'Male'
                    : 'Female'}
                </Text>
              </View>

              <View style={styles.prescriptionBadge}>
                <Text
                  style={styles.prescriptionBadgeText}
                >
                  {prescription.status
                    .replaceAll('_', ' ')
                    .toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.diagnosisCard}>
              <View style={styles.diagnosisIcon}>
                <Ionicons
                  color={colors.primary}
                  name="medical-outline"
                  size={23}
                />
              </View>

              <View style={styles.diagnosisText}>
                <Text style={styles.diagnosisLabel}>
                  Definitive diagnosis
                </Text>

                <Text style={styles.diagnosisValue}>
                  {prescription.definitiveDiagnosis}
                </Text>
              </View>
            </View>

            <View style={styles.prescriberCard}>
              <InformationItem
                icon="person-outline"
                label="Prescribed by"
                value={
                  prescription.prescribedBy.fullName
                }
              />

              <InformationItem
                icon="time-outline"
                label="Prescribed at"
                value={new Date(
                  prescription.prescribedAt,
                ).toLocaleString()}
              />

              <InformationItem
                icon="bandage-outline"
                label="Medications"
                value={`${prescription.items.length} prescribed`}
              />
            </View>

            <View
                style={[
                    styles.allergyNotice,
                    Boolean(patient.allergies?.length) &&
                    styles.allergyWarning,
                ]}
             >
              <Ionicons
                color={
                  patient.allergies?.length
                    ? colors.danger
                    : colors.success
                }
                name="alert-circle-outline"
                size={23}
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
                MEDICATION DISPENSING
              </Text>

              <Text style={styles.sectionTitle}>
                Prescribed items
              </Text>

              <Text style={styles.sectionDescription}>
                Record the dispensing outcome for every
                prescribed medication.
              </Text>
            </View>

            <View style={styles.medicationList}>
              {medicationForms.map(
                (form, index) => (
                  <MedicationDispensingForm
                    disabled={isAlreadyCompleted}
                    form={form}
                    index={index}
                    key={form.item.id}
                    onSelectStatus={(status) =>
                      selectStatus(form, status)
                    }
                    onUpdate={(values) =>
                      updateMedicationForm(
                        form.item.id,
                        values,
                      )
                    }
                  />
                ),
              )}
            </View>

            {prescription.generalInstruction ? (
              <View style={styles.instructionCard}>
                <Text style={styles.instructionLabel}>
                  DOCTOR INSTRUCTION
                </Text>

                <Text style={styles.instructionText}>
                  {prescription.generalInstruction}
                </Text>
              </View>
            ) : null}

            <View style={styles.commentCard}>
              <Text style={styles.fieldLabel}>
                General pharmacy comment
              </Text>

              <TextInput
                editable={!isAlreadyCompleted}
                multiline
                onChangeText={setGeneralComment}
                placeholder="Add general dispensing information for the doctor..."
                placeholderTextColor={
                  colors.textMuted
                }
                selectionColor={colors.primary}
                style={[
                  styles.textArea,
                  isAlreadyCompleted &&
                    styles.disabledInput,
                ]}
                textAlignVertical="top"
                value={generalComment}
              />
            </View>

            <View style={styles.feedbackCard}>
              <View style={styles.feedbackIcon}>
                <Ionicons
                  color={colors.success}
                  name="return-down-back-outline"
                  size={23}
                />
              </View>

              <View style={styles.feedbackText}>
                <Text style={styles.feedbackTitle}>
                  Return status to doctor
                </Text>

                <Text
                  style={styles.feedbackDescription}
                >
                  The case owner will see which medications
                  were dispensed, supplied partially or
                  unavailable.
                </Text>
              </View>
            </View>

            {!isAlreadyCompleted ? (
              <View style={styles.actions}>
                <AppButton
                  loading={isDispensing}
                  onPress={submitDispensing}
                  title="Complete dispensing"
                />

                <AppButton
                  onPress={() => router.back()}
                  title="Return to pharmacy queue"
                  variant="ghost"
                />
              </View>
            ) : (
              <View style={styles.completedCard}>
                <Ionicons
                  color={colors.success}
                  name="checkmark-circle"
                  size={27}
                />

                <View style={styles.completedText}>
                  <Text style={styles.completedTitle}>
                    Prescription dispensed
                  </Text>

                  <Text
                    style={styles.completedDescription}
                  >
                    The doctor has received the completed
                    dispensing status.
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function MedicationDispensingForm({
  form,
  index,
  disabled,
  onUpdate,
  onSelectStatus,
}: {
  form: PharmacyMedicationForm;
  index: number;
  disabled: boolean;

  onUpdate: (
    values: Partial<PharmacyMedicationForm>,
  ) => void;

  onSelectStatus: (
    status: PharmacyDispensingItemStatus,
  ) => void;
}) {
  return (
    <View style={styles.medicationCard}>
      <View style={styles.medicationHeader}>
        <View style={styles.medicationNumber}>
          <Text style={styles.medicationNumberText}>
            {String(index + 1).padStart(2, '0')}
          </Text>
        </View>

        <View style={styles.medicationIdentity}>
          <Text style={styles.medicationName}>
            {form.item.drugName}
          </Text>

          <Text style={styles.medicationMeta}>
            {form.item.strength} · {form.item.dose}
          </Text>
        </View>
      </View>

      <View style={styles.prescriptionDetails}>
        <DetailItem
          label="Frequency"
          value={form.item.frequency.replaceAll(
            '_',
            ' ',
          )}
        />

        <DetailItem
          label="Route"
          value={form.item.route}
        />

        <DetailItem
          label="Duration"
          value={form.item.duration}
        />

        <DetailItem
          label="Quantity"
          value={String(form.item.quantity)}
        />
      </View>

      {form.item.instruction ? (
        <View style={styles.itemInstruction}>
          <Ionicons
            color={colors.info}
            name="information-circle-outline"
            size={19}
          />

          <Text
            style={styles.itemInstructionText}
          >
            {form.item.instruction}
          </Text>
        </View>
      ) : null}

      <Text style={styles.fieldLabel}>
        Dispensing status
      </Text>

      <ScrollView
        contentContainerStyle={styles.statusOptions}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {statusOptions.map((option) => {
          const active =
            form.status === option.value;

          return (
            <Pressable
              disabled={disabled}
              key={option.value}
              onPress={() =>
                onSelectStatus(option.value)
              }
              style={[
                styles.statusOption,
                active &&
                  styles.selectedStatusOption,

                option.value === 'out_of_stock' &&
                  active &&
                  styles.outOfStockOption,
              ]}
            >
              <Text
                style={[
                  styles.statusOptionText,
                  active &&
                    styles.selectedStatusOptionText,
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
          <Text style={styles.fieldLabel}>
            Dispensed quantity
          </Text>

          <TextInput
            editable={
              !disabled &&
              form.status !== 'out_of_stock'
            }
            keyboardType="number-pad"
            onChangeText={(value) =>
              onUpdate({
                dispensedQuantity:
                  value.replace(/\D/g, ''),
              })
            }
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
            style={[
              styles.input,
              form.status === 'out_of_stock' &&
                styles.disabledInput,
            ]}
            value={form.dispensedQuantity}
          />
        </View>

        <View style={styles.column}>
          <Text style={styles.fieldLabel}>
            Batch number
          </Text>

          <TextInput
            editable={!disabled}
            onChangeText={(value) =>
              onUpdate({
                batchNumber: value,
              })
            }
            placeholder="Batch number"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
            style={styles.input}
            value={form.batchNumber}
          />
        </View>
      </View>

      <Text style={styles.fieldLabel}>
        Expiry date
      </Text>

      <TextInput
        editable={!disabled}
        onChangeText={(value) =>
          onUpdate({
            expiryDate: value,
          })
        }
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        style={styles.input}
        value={form.expiryDate}
      />

      <Text style={styles.fieldLabel}>
        Pharmacist comment
      </Text>

      <TextInput
        editable={!disabled}
        multiline
        onChangeText={(value) =>
          onUpdate({
            pharmacistComment: value,
          })
        }
        placeholder="Add information about substitution, partial supply or stock..."
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        style={styles.itemComment}
        textAlignVertical="top"
        value={form.pharmacistComment}
      />
    </View>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

function InformationItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.informationItem}>
      <View style={styles.informationIcon}>
        <Ionicons
          color={colors.primary}
          name={icon}
          size={19}
        />
      </View>

      <View style={styles.informationText}>
        <Text style={styles.informationLabel}>
          {label}
        </Text>

        <Text style={styles.informationValue}>
          {value}
        </Text>
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
    color: colors.primary,
    fontSize: 10,
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
  },

  patientMeta: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
  },

  prescriptionBadge: {
    maxWidth: 90,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.round,
    backgroundColor: colors.warningSoft,
  },

  prescriptionBadgeText: {
    color: colors.warning,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
    textAlign: 'center',
  },

  diagnosisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },

  diagnosisIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  diagnosisText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  diagnosisLabel: {
    color: colors.textMuted,
    fontSize: 10,
  },

  diagnosisValue: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  prescriberCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  informationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  informationIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  informationText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  informationLabel: {
    color: colors.textMuted,
    fontSize: 10,
  },

  informationValue: {
    marginTop: 2,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
  },

  allergyNotice: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.successSoft,
  },

  allergyWarning: {
    backgroundColor: colors.dangerSoft,
  },

  allergyText: {
    flex: 1,
    marginLeft: spacing.md,
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

  sectionDescription: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
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

  medicationIdentity: {
    flex: 1,
    marginLeft: spacing.md,
  },

  medicationName: {
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  medicationMeta: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  prescriptionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  detailItem: {
    width: '47.8%',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },

  detailLabel: {
    color: colors.textMuted,
    fontSize: 10,
  },

  detailValue: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
    textTransform: 'capitalize',
  },

  itemInstruction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.infoSoft,
  },

  itemInstructionText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  fieldLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
  },

  statusOptions: {
    gap: spacing.sm,
    paddingRight: spacing.xl,
  },

  statusOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
  },

  selectedStatusOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  outOfStockOption: {
    borderColor: colors.danger,
    backgroundColor: colors.danger,
  },

  statusOptionText: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },

  selectedStatusOptionText: {
    color: colors.textOnPrimary,
  },

  twoColumns: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  column: {
    flex: 1,
  },

  input: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    backgroundColor: colors.surface,
  },

  itemComment: {
    minHeight: 92,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.textPrimary,
    fontSize: typography.size.label,
  },

  disabledInput: {
    backgroundColor: colors.surfaceMuted,
    color: colors.textSecondary,
  },

  instructionCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.infoSoft,
  },

  instructionLabel: {
    color: colors.info,
    fontSize: 9,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 0.8,
  },

  instructionText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },

  commentCard: {
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

  feedbackCard: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.successSoft,
  },

  feedbackIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  feedbackText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  feedbackTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  feedbackDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  actions: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#BDE6D2',
    borderRadius: radius.lg,
    backgroundColor: colors.successSoft,
  },

  completedText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  completedTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  completedDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
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