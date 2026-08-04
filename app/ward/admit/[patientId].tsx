import { Ionicons } from '@expo/vector-icons';
import {
  router,
  useLocalSearchParams,
  type Href,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Alert,
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
import { useWardStore } from '@/src/store/ward.store';
import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme';
import { getPatientInitials } from '@/src/types/patient';

export default function AdmitPatientScreen() {
  const { patientId } = useLocalSearchParams<{
    patientId: string;
  }>();

  const patient = usePatientStore((state) =>
    state.getPatientById(patientId),
  );

  const consultations = useDoctorStore(
    (state) => state.consultations,
  );

  const consultation = useMemo(() => {
    return consultations
      .filter(
        (item) =>
          item.patientId === patientId &&
          item.disposition === 'admission',
      )
      .sort(
        (first, second) =>
          new Date(second.updatedAt).getTime() -
          new Date(first.updatedAt).getTime(),
      )[0];
  }, [consultations, patientId]);

  const beds = useWardStore(
    (state) => state.beds,
  );

  const admitPatient = useWardStore(
    (state) => state.admitPatient,
  );

  const isAdmittingPatient = useWardStore(
    (state) => state.isAdmittingPatient,
  );

  const [selectedBedId, setSelectedBedId] =
    useState('');

  const [admissionNote, setAdmissionNote] =
    useState('');

  const availableBeds = beds.filter(
    (bed) => bed.status === 'available',
  );

  if (!patient || !consultation) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={styles.notFoundTitle}>
          Admission case unavailable
        </Text>

        <AppButton
          onPress={() =>
            router.replace('/ward' as Href)
          }
          title="Return to ward"
        />
      </SafeAreaView>
    );
  }

  const submitAdmission = async () => {
    if (!selectedBedId) {
      Alert.alert(
        'Select a bed',
        'Choose an available ward bed for the patient.',
      );

      return;
    }

    const result = await admitPatient({
      patientId: patient.id,
      consultationId: consultation.id,

      diagnosis:
        consultation.definitiveDiagnosis ??
        'Admission diagnosis pending',

      admissionNote,
      bedId: selectedBedId,
    });

    if (!result.success || !result.data) {
      Alert.alert(
        'Admission not completed',
        result.message,
      );

      return;
    }

    const createdAdmission = result.data;

    Alert.alert(
      'Patient admitted',
      `${patient.fullName} has been allocated to ${createdAdmission.wardName}, Bed ${createdAdmission.bedNumber}.`,
      [
        {
          text: 'Open inpatient record',
          onPress: () =>
            router.replace({
              pathname: '/ward/[admissionId]',
              params: {
                admissionId: createdAdmission.id,
              },
            } as Href),
        },
        {
          text: 'Return to ward',
          onPress: () =>
            router.replace('/ward' as Href),
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
              Ward admission
            </Text>

            <Text style={styles.headerSubtitle}>
              Allocate ward and bed
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              color={colors.primary}
              name="bed-outline"
              size={21}
            />
          </View>
        </View>

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

            <View style={styles.admissionBadge}>
              <Text style={styles.admissionBadgeText}>
                ADMISSION
              </Text>
            </View>
          </View>

          <View style={styles.diagnosisCard}>
            <Text style={styles.diagnosisLabel}>
              DEFINITIVE DIAGNOSIS
            </Text>

            <Text style={styles.diagnosisValue}>
              {consultation.definitiveDiagnosis ??
                'Not recorded'}
            </Text>

            <Text style={styles.caseOwner}>
              Case owner: {consultation.caseOwnerName}
            </Text>
          </View>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionEyebrow}>
              BED ALLOCATION
            </Text>

            <Text style={styles.sectionTitle}>
              Available hospital beds
            </Text>

            <Text style={styles.sectionDescription}>
              Select a suitable ward and available bed for
              this patient.
            </Text>
          </View>

          <View style={styles.bedList}>
            {availableBeds.map((bed) => {
              const selected =
                selectedBedId === bed.id;

              return (
                <Pressable
                  key={bed.id}
                  onPress={() =>
                    setSelectedBedId(bed.id)
                  }
                  style={[
                    styles.bedCard,
                    selected &&
                      styles.selectedBedCard,
                  ]}
                >
                  <View
                    style={[
                      styles.bedIcon,
                      selected &&
                        styles.selectedBedIcon,
                    ]}
                  >
                    <Ionicons
                      color={
                        selected
                          ? colors.textOnPrimary
                          : colors.primary
                      }
                      name="bed-outline"
                      size={24}
                    />
                  </View>

                  <View style={styles.bedInformation}>
                    <Text style={styles.wardName}>
                      {bed.wardName}
                    </Text>

                    <Text style={styles.bedNumber}>
                      Bed {bed.bedNumber}
                    </Text>
                  </View>

                  <Ionicons
                    color={
                      selected
                        ? colors.primary
                        : colors.textMuted
                    }
                    name={
                      selected
                        ? 'checkmark-circle'
                        : 'ellipse-outline'
                    }
                    size={23}
                  />
                </Pressable>
              );
            })}
          </View>

          <View style={styles.noteCard}>
            <Text style={styles.fieldLabel}>
              Ward admission note
            </Text>

            <TextInput
              multiline
              onChangeText={setAdmissionNote}
              placeholder="Add initial ward instructions, isolation precautions or admission observations..."
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.primary}
              style={styles.textArea}
              textAlignVertical="top"
              value={admissionNote}
            />
          </View>

          <View style={styles.feedbackNotice}>
            <Ionicons
              color={colors.success}
              name="return-down-back-outline"
              size={23}
            />

            <Text style={styles.feedbackText}>
              Ward observations will remain connected to the
              doctor’s clinical case until discharge.
            </Text>
          </View>

          <View style={styles.actions}>
            <AppButton
              loading={isAdmittingPatient}
              onPress={submitAdmission}
              title="Complete ward admission"
            />

            <AppButton
              onPress={() => router.back()}
              title="Cancel admission"
              variant="ghost"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
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

  admissionBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.round,
    backgroundColor: colors.warningSoft,
  },

  admissionBadgeText: {
    color: colors.warning,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
  },

  diagnosisCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },

  diagnosisLabel: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 0.8,
  },

  diagnosisValue: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  caseOwner: {
    marginTop: spacing.sm,
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

  bedList: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  bedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  selectedBedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  bedIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  selectedBedIcon: {
    backgroundColor: colors.primary,
  },

  bedInformation: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  wardName: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  bedNumber: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  noteCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  fieldLabel: {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
  },

  textArea: {
    minHeight: 120,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.textPrimary,
    fontSize: typography.size.body,
  },

  feedbackNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.successSoft,
  },

  feedbackText: {
    flex: 1,
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