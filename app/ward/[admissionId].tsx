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
import { useWardStore } from '@/src/store/ward.store';
import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme';
import type {
  FluidEntryType,
  MedicationAdministrationStatus,
  WardObservationType,
} from '@/src/types/ward';
import { getPatientInitials } from '@/src/types/patient';

type WorkspaceTab =
  | 'overview'
  | 'vitals'
  | 'notes'
  | 'fluids'
  | 'medications';

type VitalSignsForm = {
  systolicBloodPressure: string;
  diastolicBloodPressure: string;
  pulseRate: string;
  temperature: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  painScore: string;
  observationType: WardObservationType;
  note: string;
};

type NursingNoteForm = {
  shift: 'morning' | 'afternoon' | 'night';
  note: string;
};

type FluidForm = {
  type: FluidEntryType;
  description: string;
  volume: string;
};

type MedicationForm = {
  medicationName: string;
  strength: string;
  dose: string;
  route: string;
  status: MedicationAdministrationStatus;
  comment: string;
  scheduledAt: string;
};

const initialVitalSignsForm: VitalSignsForm = {
  systolicBloodPressure: '',
  diastolicBloodPressure: '',
  pulseRate: '',
  temperature: '',
  respiratoryRate: '',
  oxygenSaturation: '',
  painScore: '',
  observationType: 'routine',
  note: '',
};

const initialNursingNoteForm: NursingNoteForm = {
  shift: 'morning',
  note: '',
};

const initialFluidForm: FluidForm = {
  type: 'input',
  description: '',
  volume: '',
};

const initialMedicationForm: MedicationForm = {
  medicationName: '',
  strength: '',
  dose: '',
  route: 'Oral',
  status: 'administered',
  comment: '',
  scheduledAt: '',
};

const medicationStatuses: Array<{
  value: MedicationAdministrationStatus;
  label: string;
}> = [
  {
    value: 'administered',
    label: 'Administered',
  },
  {
    value: 'missed',
    label: 'Missed',
  },
  {
    value: 'refused',
    label: 'Refused',
  },
  {
    value: 'withheld',
    label: 'Withheld',
  },
  {
    value: 'not_available',
    label: 'Not available',
  },
];

const medicationRoutes = [
  'Oral',
  'Intravenous',
  'Intramuscular',
  'Subcutaneous',
  'Topical',
  'Inhalation',
];

export default function WardAdmissionWorkspaceScreen() {
  const { admissionId } = useLocalSearchParams<{
    admissionId: string;
  }>();

  const admissions = useWardStore(
    (state) => state.admissions,
  );

  const admission = useMemo(() => {
    return admissions.find(
      (item) => item.id === admissionId,
    );
  }, [admissionId, admissions]);

  const patients = usePatientStore(
    (state) => state.patients,
  );

  const patient = useMemo(() => {
    if (!admission) {
      return undefined;
    }

    return patients.find(
      (item) => item.id === admission.patientId,
    );
  }, [admission, patients]);

  const consultations = useDoctorStore(
    (state) => state.consultations,
  );

  const consultation = useMemo(() => {
    if (!admission) {
      return undefined;
    }

    return consultations.find(
      (item) => item.id === admission.consultationId,
    );
  }, [admission, consultations]);

  const allWardVitalSigns = useWardStore(
    (state) => state.vitalSigns,
  );

  const allNursingNotes = useWardStore(
    (state) => state.nursingNotes,
  );

  const allFluidEntries = useWardStore(
    (state) => state.fluidEntries,
  );

  const allMedicationAdministrations = useWardStore(
    (state) => state.medicationAdministrations,
  );

  const saveVitalSigns = useWardStore(
    (state) => state.saveVitalSigns,
  );

  const saveNursingNote = useWardStore(
    (state) => state.saveNursingNote,
  );

  const saveFluidEntry = useWardStore(
    (state) => state.saveFluidEntry,
  );

  const saveMedicationAdministration = useWardStore(
    (state) => state.saveMedicationAdministration,
  );

  const isSavingWardActivity = useWardStore(
    (state) => state.isSavingWardActivity,
  );

  const wardVitalSigns = useMemo(() => {
    return allWardVitalSigns
      .filter(
        (item) => item.admissionId === admissionId,
      )
      .sort(
        (first, second) =>
          new Date(second.recordedAt).getTime() -
          new Date(first.recordedAt).getTime(),
      );
  }, [admissionId, allWardVitalSigns]);

  const nursingNotes = useMemo(() => {
    return allNursingNotes
      .filter(
        (item) => item.admissionId === admissionId,
      )
      .sort(
        (first, second) =>
          new Date(second.recordedAt).getTime() -
          new Date(first.recordedAt).getTime(),
      );
  }, [admissionId, allNursingNotes]);

  const fluidEntries = useMemo(() => {
    return allFluidEntries
      .filter(
        (item) => item.admissionId === admissionId,
      )
      .sort(
        (first, second) =>
          new Date(second.recordedAt).getTime() -
          new Date(first.recordedAt).getTime(),
      );
  }, [admissionId, allFluidEntries]);

  const medicationAdministrations = useMemo(() => {
    return allMedicationAdministrations
      .filter(
        (item) => item.admissionId === admissionId,
      )
      .sort(
        (first, second) =>
          new Date(second.administeredAt).getTime() -
          new Date(first.administeredAt).getTime(),
      );
  }, [
    admissionId,
    allMedicationAdministrations,
  ]);

  const latestVitals = wardVitalSigns[0];

  const totalFluidInput = fluidEntries
    .filter((item) => item.type === 'input')
    .reduce(
      (total, item) => total + item.volume,
      0,
    );

  const totalFluidOutput = fluidEntries
    .filter((item) => item.type === 'output')
    .reduce(
      (total, item) => total + item.volume,
      0,
    );

  const fluidBalance =
    totalFluidInput - totalFluidOutput;

  const [activeTab, setActiveTab] =
    useState<WorkspaceTab>('overview');

  const [vitalSignsForm, setVitalSignsForm] =
    useState<VitalSignsForm>(
      initialVitalSignsForm,
    );

  const [nursingNoteForm, setNursingNoteForm] =
    useState<NursingNoteForm>(
      initialNursingNoteForm,
    );

  const [fluidForm, setFluidForm] =
    useState<FluidForm>(initialFluidForm);

  const [medicationForm, setMedicationForm] =
    useState<MedicationForm>(
      initialMedicationForm,
    );

  if (!admission || !patient) {
    return (
      <SafeAreaView style={styles.notFound}>
        <View style={styles.notFoundIcon}>
          <Ionicons
            color={colors.primary}
            name="bed-outline"
            size={38}
          />
        </View>

        <Text style={styles.notFoundTitle}>
          Admission unavailable
        </Text>

        <Text style={styles.notFoundDescription}>
          The selected inpatient admission record could not
          be found.
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

  const parseNumber = (value: string): number => {
    return Number(value.trim());
  };

  const updateVitalSignsForm = <
    Key extends keyof VitalSignsForm,
  >(
    key: Key,
    value: VitalSignsForm[Key],
  ) => {
    setVitalSignsForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateNursingNoteForm = <
    Key extends keyof NursingNoteForm,
  >(
    key: Key,
    value: NursingNoteForm[Key],
  ) => {
    setNursingNoteForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateFluidForm = <
    Key extends keyof FluidForm,
  >(
    key: Key,
    value: FluidForm[Key],
  ) => {
    setFluidForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateMedicationForm = <
    Key extends keyof MedicationForm,
  >(
    key: Key,
    value: MedicationForm[Key],
  ) => {
    setMedicationForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const submitVitalSigns = async () => {
    const requiredValues = [
      vitalSignsForm.systolicBloodPressure,
      vitalSignsForm.diastolicBloodPressure,
      vitalSignsForm.pulseRate,
      vitalSignsForm.temperature,
      vitalSignsForm.respiratoryRate,
      vitalSignsForm.oxygenSaturation,
      vitalSignsForm.painScore,
    ];

    if (
      requiredValues.some(
        (value) => !value.trim(),
      )
    ) {
      Alert.alert(
        'Complete vital signs',
        'Enter all required ward vital-sign measurements.',
      );

      return;
    }

    const oxygenSaturation = parseNumber(
      vitalSignsForm.oxygenSaturation,
    );

    const painScore = parseNumber(
      vitalSignsForm.painScore,
    );

    if (
      Number.isNaN(oxygenSaturation) ||
      oxygenSaturation < 1 ||
      oxygenSaturation > 100
    ) {
      Alert.alert(
        'Invalid oxygen saturation',
        'Oxygen saturation must be between 1 and 100%.',
      );

      return;
    }

    if (
      Number.isNaN(painScore) ||
      painScore < 0 ||
      painScore > 10
    ) {
      Alert.alert(
        'Invalid pain score',
        'Pain score must be between 0 and 10.',
      );

      return;
    }

    const result = await saveVitalSigns({
      admissionId: admission.id,
      patientId: patient.id,

      systolicBloodPressure: parseNumber(
        vitalSignsForm.systolicBloodPressure,
      ),

      diastolicBloodPressure: parseNumber(
        vitalSignsForm.diastolicBloodPressure,
      ),

      pulseRate: parseNumber(
        vitalSignsForm.pulseRate,
      ),

      temperature: parseNumber(
        vitalSignsForm.temperature,
      ),

      respiratoryRate: parseNumber(
        vitalSignsForm.respiratoryRate,
      ),

      oxygenSaturation,
      painScore,

      observationType:
        vitalSignsForm.observationType,

      note: vitalSignsForm.note,
    });

    if (!result.success) {
      Alert.alert(
        'Vital signs not saved',
        result.message,
      );

      return;
    }

    setVitalSignsForm(initialVitalSignsForm);

    Alert.alert(
      'Ward observation saved',
      result.message,
    );
  };

  const submitNursingNote = async () => {
    if (!nursingNoteForm.note.trim()) {
      Alert.alert(
        'Nursing note required',
        'Enter the nursing observation before saving.',
      );

      return;
    }

    const result = await saveNursingNote({
      admissionId: admission.id,
      patientId: patient.id,

      note: nursingNoteForm.note,
      shift: nursingNoteForm.shift,
    });

    if (!result.success) {
      Alert.alert(
        'Nursing note not saved',
        result.message,
      );

      return;
    }

    setNursingNoteForm((current) => ({
      ...initialNursingNoteForm,
      shift: current.shift,
    }));

    Alert.alert(
      'Nursing note saved',
      result.message,
    );
  };

  const submitFluidEntry = async () => {
    const volume = Number(
      fluidForm.volume.trim(),
    );

    if (!fluidForm.description.trim()) {
      Alert.alert(
        'Fluid description required',
        'Enter the type of fluid input or output.',
      );

      return;
    }

    if (Number.isNaN(volume) || volume <= 0) {
      Alert.alert(
        'Invalid fluid volume',
        'Enter a fluid volume greater than zero.',
      );

      return;
    }

    const result = await saveFluidEntry({
      admissionId: admission.id,
      patientId: patient.id,

      type: fluidForm.type,
      description: fluidForm.description,
      volume,
    });

    if (!result.success) {
      Alert.alert(
        'Fluid entry not saved',
        result.message,
      );

      return;
    }

    setFluidForm((current) => ({
      ...initialFluidForm,
      type: current.type,
    }));

    Alert.alert(
      'Fluid entry saved',
      result.message,
    );
  };

  const submitMedicationAdministration =
    async () => {
      if (
        !medicationForm.medicationName.trim()
      ) {
        Alert.alert(
          'Medication required',
          'Enter the medication name.',
        );

        return;
      }

      if (!medicationForm.dose.trim()) {
        Alert.alert(
          'Dose required',
          'Enter the administered or scheduled dose.',
        );

        return;
      }

      if (!medicationForm.route.trim()) {
        Alert.alert(
          'Route required',
          'Select the medication route.',
        );

        return;
      }

      const result =
        await saveMedicationAdministration({
          admissionId: admission.id,
          patientId: patient.id,

          medicationName:
            medicationForm.medicationName,

          strength: medicationForm.strength,
          dose: medicationForm.dose,
          route: medicationForm.route,

          status: medicationForm.status,

          comment: medicationForm.comment,

          scheduledAt:
            medicationForm.scheduledAt ||
            undefined,
        });

      if (!result.success) {
        Alert.alert(
          'Medication record not saved',
          result.message,
        );

        return;
      }

      setMedicationForm(
        initialMedicationForm,
      );

      Alert.alert(
        'Medication activity saved',
        result.message,
      );
    };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Return to ward dashboard"
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
              Inpatient record
            </Text>

            <Text style={styles.headerSubtitle}>
              {admission.wardName} · Bed{' '}
              {admission.bedNumber}
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              color={colors.success}
              name="bed"
              size={21}
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
                    : 'Female'}
                </Text>
              </View>

              <View style={styles.admittedBadge}>
                <View style={styles.admittedDot} />

                <Text style={styles.admittedText}>
                  ADMITTED
                </Text>
              </View>
            </View>

            <View style={styles.admissionSummary}>
              <View style={styles.admissionSummaryIcon}>
                <Ionicons
                  color={colors.primary}
                  name="medical-outline"
                  size={23}
                />
              </View>

              <View style={styles.admissionSummaryText}>
                <Text
                  style={styles.admissionSummaryLabel}
                >
                  Admission diagnosis
                </Text>

                <Text
                  style={styles.admissionSummaryValue}
                >
                  {admission.diagnosis}
                </Text>

                <Text
                  style={styles.admissionCaseOwner}
                >
                  Case owner:{' '}
                  {consultation?.caseOwnerName ??
                    'Assigned doctor'}
                </Text>
              </View>
            </View>

            <View style={styles.feedbackNotice}>
              <View style={styles.feedbackIcon}>
                <Ionicons
                  color={colors.success}
                  name="return-down-back-outline"
                  size={23}
                />
              </View>

              <View style={styles.feedbackText}>
                <Text style={styles.feedbackTitle}>
                  Continuous clinical feedback
                </Text>

                <Text
                  style={styles.feedbackDescription}
                >
                  All ward activities remain attached to the
                  doctor’s clinical case until discharge.
                </Text>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.tabs}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <WorkspaceTabButton
                active={activeTab === 'overview'}
                icon="grid-outline"
                label="Overview"
                onPress={() =>
                  setActiveTab('overview')
                }
              />

              <WorkspaceTabButton
                active={activeTab === 'vitals'}
                icon="pulse-outline"
                label="Vitals"
                onPress={() =>
                  setActiveTab('vitals')
                }
              />

              <WorkspaceTabButton
                active={activeTab === 'notes'}
                icon="document-text-outline"
                label="Notes"
                onPress={() =>
                  setActiveTab('notes')
                }
              />

              <WorkspaceTabButton
                active={activeTab === 'fluids'}
                icon="water-outline"
                label="Fluids"
                onPress={() =>
                  setActiveTab('fluids')
                }
              />

              <WorkspaceTabButton
                active={
                  activeTab === 'medications'
                }
                icon="bandage-outline"
                label="Medication"
                onPress={() =>
                  setActiveTab('medications')
                }
              />
            </ScrollView>

            {activeTab === 'overview' ? (
              <OverviewSection
                admissionDate={admission.admittedAt}
                fluidBalance={fluidBalance}
                latestVitals={latestVitals}
                medicationCount={
                  medicationAdministrations.length
                }
                nursingNoteCount={
                  nursingNotes.length
                }
                totalFluidInput={totalFluidInput}
                totalFluidOutput={totalFluidOutput}
              />
            ) : null}

            {activeTab === 'vitals' ? (
              <VitalSignsSection
                form={vitalSignsForm}
                history={wardVitalSigns}
                isSaving={isSavingWardActivity}
                onSubmit={submitVitalSigns}
                updateForm={
                  updateVitalSignsForm
                }
              />
            ) : null}

            {activeTab === 'notes' ? (
              <NursingNotesSection
                form={nursingNoteForm}
                history={nursingNotes}
                isSaving={isSavingWardActivity}
                onSubmit={submitNursingNote}
                updateForm={
                  updateNursingNoteForm
                }
              />
            ) : null}

            {activeTab === 'fluids' ? (
              <FluidBalanceSection
                fluidBalance={fluidBalance}
                form={fluidForm}
                history={fluidEntries}
                isSaving={isSavingWardActivity}
                onSubmit={submitFluidEntry}
                totalInput={totalFluidInput}
                totalOutput={totalFluidOutput}
                updateForm={updateFluidForm}
              />
            ) : null}

            {activeTab === 'medications' ? (
              <MedicationSection
                form={medicationForm}
                history={
                  medicationAdministrations
                }
                isSaving={isSavingWardActivity}
                onSubmit={
                  submitMedicationAdministration
                }
                updateForm={
                  updateMedicationForm
                }
              />
            ) : null}

            <View style={styles.returnAction}>
              <AppButton
                onPress={() =>
                  router.replace('/ward' as Href)
                }
                title="Return to ward dashboard"
                variant="ghost"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function OverviewSection({
  latestVitals,
  nursingNoteCount,
  medicationCount,
  totalFluidInput,
  totalFluidOutput,
  fluidBalance,
  admissionDate,
}: {
  latestVitals:
    | ReturnType<
        typeof useWardStore.getState
      >['vitalSigns'][number]
    | undefined;

  nursingNoteCount: number;
  medicationCount: number;

  totalFluidInput: number;
  totalFluidOutput: number;
  fluidBalance: number;

  admissionDate: string;
}) {
  return (
    <View>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionEyebrow}>
          INPATIENT OVERVIEW
        </Text>

        <Text style={styles.sectionTitle}>
          Current patient status
        </Text>

        <Text style={styles.sectionDescription}>
          Review the latest ward activities and clinical
          observations.
        </Text>
      </View>

      <View style={styles.overviewGrid}>
        <OverviewCard
          icon="pulse-outline"
          label="Observations"
          tone="primary"
          value={
            latestVitals
              ? formatDateTime(
                  latestVitals.recordedAt,
                )
              : 'Not recorded'
          }
        />

        <OverviewCard
          icon="document-text-outline"
          label="Nursing notes"
          tone="info"
          value={String(nursingNoteCount)}
        />

        <OverviewCard
          icon="bandage-outline"
          label="Medication records"
          tone="success"
          value={String(medicationCount)}
        />

        <OverviewCard
          icon="calendar-outline"
          label="Admission date"
          tone="warning"
          value={formatShortDate(admissionDate)}
        />
      </View>

      <View style={styles.sectionCard}>
        <SectionHeader
          description="Most recently recorded inpatient measurements."
          icon="pulse-outline"
          title="Latest ward vital signs"
        />

        {latestVitals ? (
          <>
            <View style={styles.vitalsGrid}>
              <VitalCard
                label="Blood pressure"
                suffix="mmHg"
                value={`${latestVitals.systolicBloodPressure}/${latestVitals.diastolicBloodPressure}`}
              />

              <VitalCard
                label="Temperature"
                suffix="°C"
                value={String(
                  latestVitals.temperature,
                )}
              />

              <VitalCard
                label="Pulse"
                suffix="bpm"
                value={String(
                  latestVitals.pulseRate,
                )}
              />

              <VitalCard
                label="Oxygen"
                suffix="%"
                value={String(
                  latestVitals.oxygenSaturation,
                )}
              />

              <VitalCard
                label="Respiration"
                suffix="/min"
                value={String(
                  latestVitals.respiratoryRate,
                )}
              />

              <VitalCard
                label="Pain"
                suffix="/10"
                value={String(
                  latestVitals.painScore,
                )}
              />
            </View>

            <View style={styles.latestObservation}>
              <View
                style={[
                  styles.observationIndicator,
                  {
                    backgroundColor:
                      getObservationColor(
                        latestVitals.observationType,
                      ),
                  },
                ]}
              />

              <View style={styles.latestObservationText}>
                <Text
                  style={styles.latestObservationTitle}
                >
                  {formatObservationType(
                    latestVitals.observationType,
                  )}{' '}
                  observation
                </Text>

                <Text
                  style={
                    styles.latestObservationDescription
                  }
                >
                  Recorded by{' '}
                  {latestVitals.recordedBy.fullName}
                </Text>
              </View>

              <Text
                style={styles.latestObservationTime}
              >
                {formatDateTime(
                  latestVitals.recordedAt,
                )}
              </Text>
            </View>
          </>
        ) : (
          <EmptySection
            description="Record ward vital signs to begin continuous monitoring."
            icon="pulse-outline"
            title="No ward observations"
          />
        )}
      </View>

      <View style={styles.sectionCard}>
        <SectionHeader
          description="Fluid input and output recorded during admission."
          icon="water-outline"
          title="Fluid balance"
        />

        <View style={styles.fluidSummaryGrid}>
          <FluidSummaryCard
            icon="arrow-down-outline"
            label="Input"
            tone="success"
            value={`${totalFluidInput} ml`}
          />

          <FluidSummaryCard
            icon="arrow-up-outline"
            label="Output"
            tone="info"
            value={`${totalFluidOutput} ml`}
          />

          <FluidSummaryCard
            icon="swap-vertical-outline"
            label="Balance"
            tone={
              fluidBalance < 0
                ? 'danger'
                : 'primary'
            }
            value={`${fluidBalance} ml`}
          />
        </View>
      </View>
    </View>
  );
}

function VitalSignsSection({
  form,
  history,
  updateForm,
  onSubmit,
  isSaving,
}: {
  form: VitalSignsForm;

  history: ReturnType<
    typeof useWardStore.getState
  >['vitalSigns'];

  updateForm: <
    Key extends keyof VitalSignsForm,
  >(
    key: Key,
    value: VitalSignsForm[Key],
  ) => void;

  onSubmit: () => void;
  isSaving: boolean;
}) {
  return (
    <View>
      <View style={styles.sectionCard}>
        <SectionHeader
          description="Record the patient’s current inpatient observations."
          icon="pulse-outline"
          title="Ward vital signs"
        />

        <View style={styles.inputGrid}>
          <NumberField
            label="Systolic BP"
            onChangeText={(value) =>
              updateForm(
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
              updateForm(
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
              updateForm('pulseRate', value)
            }
            suffix="bpm"
            value={form.pulseRate}
          />

          <NumberField
            decimal
            label="Temperature"
            onChangeText={(value) =>
              updateForm('temperature', value)
            }
            suffix="°C"
            value={form.temperature}
          />

          <NumberField
            label="Respiratory rate"
            onChangeText={(value) =>
              updateForm(
                'respiratoryRate',
                value,
              )
            }
            suffix="/min"
            value={form.respiratoryRate}
          />

          <NumberField
            label="Oxygen saturation"
            onChangeText={(value) =>
              updateForm(
                'oxygenSaturation',
                value,
              )
            }
            suffix="%"
            value={form.oxygenSaturation}
          />
        </View>

        <Text style={styles.fieldLabel}>
          Pain score: {form.painScore || '0'}/10
        </Text>

        <View style={styles.painOptions}>
          {Array.from(
            {
              length: 11,
            },
            (_, index) => (
              <Pressable
                key={index}
                onPress={() =>
                  updateForm(
                    'painScore',
                    String(index),
                  )
                }
                style={[
                  styles.painOption,
                  form.painScore ===
                    String(index) &&
                    styles.selectedPainOption,
                ]}
              >
                <Text
                  style={[
                    styles.painOptionText,
                    form.painScore ===
                      String(index) &&
                      styles.selectedPainOptionText,
                  ]}
                >
                  {index}
                </Text>
              </Pressable>
            ),
          )}
        </View>

        <Text style={styles.fieldLabel}>
          Observation priority
        </Text>

        <View style={styles.observationOptions}>
          <ChoiceOption
            active={
              form.observationType === 'routine'
            }
            label="Routine"
            onPress={() =>
              updateForm(
                'observationType',
                'routine',
              )
            }
          />

          <ChoiceOption
            active={
              form.observationType === 'priority'
            }
            label="Priority"
            onPress={() =>
              updateForm(
                'observationType',
                'priority',
              )
            }
          />

          <ChoiceOption
            active={
              form.observationType === 'urgent'
            }
            danger
            label="Urgent"
            onPress={() =>
              updateForm(
                'observationType',
                'urgent',
              )
            }
          />
        </View>

        <Text style={styles.fieldLabel}>
          Observation note
        </Text>

        <TextInput
          multiline
          onChangeText={(value) =>
            updateForm('note', value)
          }
          placeholder="Add relevant clinical observations for the doctor..."
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          style={styles.textArea}
          textAlignVertical="top"
          value={form.note}
        />

        <View style={styles.formAction}>
          <AppButton
            loading={isSaving}
            onPress={onSubmit}
            title="Save ward observation"
          />
        </View>
      </View>

      <HistorySectionHeader
        count={history.length}
        title="Vital-sign history"
      />

      {history.length ? (
        <View style={styles.historyList}>
          {history.map((item) => (
            <View
              key={item.id}
              style={styles.historyCard}
            >
              <View style={styles.historyHeader}>
                <View
                  style={[
                    styles.historyIcon,
                    {
                      backgroundColor: `${getObservationColor(
                        item.observationType,
                      )}18`,
                    },
                  ]}
                >
                  <Ionicons
                    color={getObservationColor(
                      item.observationType,
                    )}
                    name="pulse-outline"
                    size={21}
                  />
                </View>

                <View style={styles.historyIdentity}>
                  <Text style={styles.historyTitle}>
                    {formatObservationType(
                      item.observationType,
                    )}{' '}
                    observation
                  </Text>

                  <Text style={styles.historyMeta}>
                    {formatDateTime(
                      item.recordedAt,
                    )}
                  </Text>
                </View>
              </View>

              <View style={styles.historyVitals}>
                <HistoryVital
                  label="BP"
                  value={`${item.systolicBloodPressure}/${item.diastolicBloodPressure}`}
                />

                <HistoryVital
                  label="Temp"
                  value={`${item.temperature}°C`}
                />

                <HistoryVital
                  label="Pulse"
                  value={`${item.pulseRate} bpm`}
                />

                <HistoryVital
                  label="Oxygen"
                  value={`${item.oxygenSaturation}%`}
                />
              </View>

              {item.note ? (
                <Text style={styles.historyNote}>
                  {item.note}
                </Text>
              ) : null}

              <Text style={styles.recordedBy}>
                Recorded by {item.recordedBy.fullName}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <EmptySection
          description="Saved ward observations will appear here."
          icon="pulse-outline"
          title="No observations recorded"
        />
      )}
    </View>
  );
}

function NursingNotesSection({
  form,
  history,
  updateForm,
  onSubmit,
  isSaving,
}: {
  form: NursingNoteForm;

  history: ReturnType<
    typeof useWardStore.getState
  >['nursingNotes'];

  updateForm: <
    Key extends keyof NursingNoteForm,
  >(
    key: Key,
    value: NursingNoteForm[Key],
  ) => void;

  onSubmit: () => void;
  isSaving: boolean;
}) {
  return (
    <View>
      <View style={styles.sectionCard}>
        <SectionHeader
          description="Record daily observations and nursing progress notes."
          icon="document-text-outline"
          title="Daily nursing note"
        />

        <Text style={styles.fieldLabel}>
          Nursing shift
        </Text>

        <View style={styles.shiftOptions}>
          <ChoiceOption
            active={form.shift === 'morning'}
            label="Morning"
            onPress={() =>
              updateForm('shift', 'morning')
            }
          />

          <ChoiceOption
            active={form.shift === 'afternoon'}
            label="Afternoon"
            onPress={() =>
              updateForm('shift', 'afternoon')
            }
          />

          <ChoiceOption
            active={form.shift === 'night'}
            label="Night"
            onPress={() =>
              updateForm('shift', 'night')
            }
          />
        </View>

        <Text style={styles.fieldLabel}>
          Nursing observation
        </Text>

        <TextInput
          multiline
          onChangeText={(value) =>
            updateForm('note', value)
          }
          placeholder="Example: Patient remained stable during the shift, tolerated oral feeding and medications..."
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          style={styles.largeTextArea}
          textAlignVertical="top"
          value={form.note}
        />

        <View style={styles.formAction}>
          <AppButton
            loading={isSaving}
            onPress={onSubmit}
            title="Save nursing note"
          />
        </View>
      </View>

      <HistorySectionHeader
        count={history.length}
        title="Nursing-note history"
      />

      {history.length ? (
        <View style={styles.historyList}>
          {history.map((item) => (
            <View
              key={item.id}
              style={styles.noteHistoryCard}
            >
              <View style={styles.noteHistoryHeader}>
                <View style={styles.noteShiftBadge}>
                  <Ionicons
                    color={colors.primary}
                    name={getShiftIcon(item.shift)}
                    size={16}
                  />

                  <Text
                    style={styles.noteShiftText}
                  >
                    {item.shift.toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.noteHistoryTime}>
                  {formatDateTime(item.recordedAt)}
                </Text>
              </View>

              <Text style={styles.noteHistoryText}>
                {item.note}
              </Text>

              <Text style={styles.recordedBy}>
                Recorded by {item.recordedBy.fullName}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <EmptySection
          description="Daily inpatient nursing notes will appear here."
          icon="document-text-outline"
          title="No nursing notes"
        />
      )}
    </View>
  );
}

function FluidBalanceSection({
  form,
  history,
  updateForm,
  onSubmit,
  isSaving,
  totalInput,
  totalOutput,
  fluidBalance,
}: {
  form: FluidForm;

  history: ReturnType<
    typeof useWardStore.getState
  >['fluidEntries'];

  updateForm: <Key extends keyof FluidForm>(
    key: Key,
    value: FluidForm[Key],
  ) => void;

  onSubmit: () => void;
  isSaving: boolean;

  totalInput: number;
  totalOutput: number;
  fluidBalance: number;
}) {
  return (
    <View>
      <View style={styles.fluidSummaryGrid}>
        <FluidSummaryCard
          icon="arrow-down-outline"
          label="Input"
          tone="success"
          value={`${totalInput} ml`}
        />

        <FluidSummaryCard
          icon="arrow-up-outline"
          label="Output"
          tone="info"
          value={`${totalOutput} ml`}
        />

        <FluidSummaryCard
          icon="swap-vertical-outline"
          label="Balance"
          tone={
            fluidBalance < 0
              ? 'danger'
              : 'primary'
          }
          value={`${fluidBalance} ml`}
        />
      </View>

      <View style={styles.sectionCard}>
        <SectionHeader
          description="Record oral, intravenous and measured fluid movement."
          icon="water-outline"
          title="Fluid input and output"
        />

        <Text style={styles.fieldLabel}>
          Entry type
        </Text>

        <View style={styles.fluidTypeOptions}>
          <Pressable
            onPress={() =>
              updateForm('type', 'input')
            }
            style={[
              styles.fluidTypeOption,
              form.type === 'input' &&
                styles.selectedFluidTypeOption,
            ]}
          >
            <Ionicons
              color={
                form.type === 'input'
                  ? colors.textOnPrimary
                  : colors.success
              }
              name="arrow-down-outline"
              size={21}
            />

            <Text
              style={[
                styles.fluidTypeText,
                form.type === 'input' &&
                  styles.selectedFluidTypeText,
              ]}
            >
              Fluid input
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              updateForm('type', 'output')
            }
            style={[
              styles.fluidTypeOption,
              form.type === 'output' &&
                styles.selectedFluidTypeOption,
            ]}
          >
            <Ionicons
              color={
                form.type === 'output'
                  ? colors.textOnPrimary
                  : colors.info
              }
              name="arrow-up-outline"
              size={21}
            />

            <Text
              style={[
                styles.fluidTypeText,
                form.type === 'output' &&
                  styles.selectedFluidTypeText,
              ]}
            >
              Fluid output
            </Text>
          </Pressable>
        </View>

        <Text style={styles.fieldLabel}>
          Description
        </Text>

        <TextInput
          onChangeText={(value) =>
            updateForm('description', value)
          }
          placeholder={
            form.type === 'input'
              ? 'Example: Normal saline, oral water'
              : 'Example: Urine, vomitus, drain output'
          }
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          style={styles.input}
          value={form.description}
        />

        <Text style={styles.fieldLabel}>
          Volume
        </Text>

        <View style={styles.volumeInput}>
          <TextInput
            keyboardType="number-pad"
            onChangeText={(value) =>
              updateForm(
                'volume',
                value.replace(/\D/g, ''),
              )
            }
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
            style={styles.volumeTextInput}
            value={form.volume}
          />

          <Text style={styles.volumeSuffix}>
            ml
          </Text>
        </View>

        <View style={styles.formAction}>
          <AppButton
            loading={isSaving}
            onPress={onSubmit}
            title="Save fluid entry"
          />
        </View>
      </View>

      <HistorySectionHeader
        count={history.length}
        title="Fluid-balance history"
      />

      {history.length ? (
        <View style={styles.historyList}>
          {history.map((item) => (
            <View
              key={item.id}
              style={styles.fluidHistoryCard}
            >
              <View
                style={[
                  styles.fluidHistoryIcon,
                  {
                    backgroundColor:
                      item.type === 'input'
                        ? colors.successSoft
                        : colors.infoSoft,
                  },
                ]}
              >
                <Ionicons
                  color={
                    item.type === 'input'
                      ? colors.success
                      : colors.info
                  }
                  name={
                    item.type === 'input'
                      ? 'arrow-down-outline'
                      : 'arrow-up-outline'
                  }
                  size={21}
                />
              </View>

              <View style={styles.fluidHistoryText}>
                <Text
                  style={styles.fluidHistoryTitle}
                >
                  {item.description}
                </Text>

                <Text
                  style={styles.fluidHistoryMeta}
                >
                  {formatDateTime(item.recordedAt)}
                </Text>

                <Text style={styles.recordedBy}>
                  Recorded by{' '}
                  {item.recordedBy.fullName}
                </Text>
              </View>

              <Text
                style={[
                  styles.fluidHistoryVolume,
                  {
                    color:
                      item.type === 'input'
                        ? colors.success
                        : colors.info,
                  },
                ]}
              >
                {item.type === 'input' ? '+' : '-'}
                {item.volume} ml
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <EmptySection
          description="Saved fluid input and output entries will appear here."
          icon="water-outline"
          title="No fluid entries"
        />
      )}
    </View>
  );
}

function MedicationSection({
  form,
  history,
  updateForm,
  onSubmit,
  isSaving,
}: {
  form: MedicationForm;

  history: ReturnType<
    typeof useWardStore.getState
  >['medicationAdministrations'];

  updateForm: <
    Key extends keyof MedicationForm,
  >(
    key: Key,
    value: MedicationForm[Key],
  ) => void;

  onSubmit: () => void;
  isSaving: boolean;
}) {
  return (
    <View>
      <View style={styles.sectionCard}>
        <SectionHeader
          description="Record administered, missed, refused or unavailable medication."
          icon="bandage-outline"
          title="Medication administration"
        />

        <Text style={styles.fieldLabel}>
          Medication name
        </Text>

        <TextInput
          autoCapitalize="words"
          onChangeText={(value) =>
            updateForm('medicationName', value)
          }
          placeholder="Example: Ceftriaxone"
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          style={styles.input}
          value={form.medicationName}
        />

        <View style={styles.twoColumns}>
          <View style={styles.column}>
            <Text style={styles.fieldLabel}>
              Strength
            </Text>

            <TextInput
              onChangeText={(value) =>
                updateForm('strength', value)
              }
              placeholder="1 g"
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.primary}
              style={styles.input}
              value={form.strength}
            />
          </View>

          <View style={styles.column}>
            <Text style={styles.fieldLabel}>
              Dose
            </Text>

            <TextInput
              onChangeText={(value) =>
                updateForm('dose', value)
              }
              placeholder="1 vial"
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.primary}
              style={styles.input}
              value={form.dose}
            />
          </View>
        </View>

        <Text style={styles.fieldLabel}>
          Route
        </Text>

        <ScrollView
          contentContainerStyle={styles.routeOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {medicationRoutes.map((route) => {
            const active =
              form.route === route;

            return (
              <Pressable
                key={route}
                onPress={() =>
                  updateForm('route', route)
                }
                style={[
                  styles.routeOption,
                  active &&
                    styles.selectedRouteOption,
                ]}
              >
                <Text
                  style={[
                    styles.routeOptionText,
                    active &&
                      styles.selectedRouteOptionText,
                  ]}
                >
                  {route}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.fieldLabel}>
          Administration status
        </Text>

        <View style={styles.medicationStatusOptions}>
          {medicationStatuses.map((status) => {
            const active =
              form.status === status.value;

            return (
              <Pressable
                key={status.value}
                onPress={() =>
                  updateForm(
                    'status',
                    status.value,
                  )
                }
                style={[
                  styles.medicationStatusOption,
                  active &&
                    styles.selectedMedicationStatusOption,

                  active &&
                    status.value !==
                      'administered' &&
                    styles.warningMedicationStatusOption,
                ]}
              >
                <Text
                  style={[
                    styles.medicationStatusText,
                    active &&
                      styles.selectedMedicationStatusText,
                  ]}
                >
                  {status.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.fieldLabel}>
          Scheduled time
        </Text>

        <TextInput
          onChangeText={(value) =>
            updateForm('scheduledAt', value)
          }
          placeholder="Example: 08:00 AM"
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          style={styles.input}
          value={form.scheduledAt}
        />

        <Text style={styles.fieldLabel}>
          Medication comment
        </Text>

        <TextInput
          multiline
          onChangeText={(value) =>
            updateForm('comment', value)
          }
          placeholder="Add administration observations or reason for a missed, refused or withheld dose..."
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          style={styles.textArea}
          textAlignVertical="top"
          value={form.comment}
        />

        <View style={styles.formAction}>
          <AppButton
            loading={isSaving}
            onPress={onSubmit}
            title="Save medication activity"
          />
        </View>
      </View>

      <HistorySectionHeader
        count={history.length}
        title="Medication history"
      />

      {history.length ? (
        <View style={styles.historyList}>
          {history.map((item) => {
            const statusTone =
              getMedicationStatusTone(item.status);

            return (
              <View
                key={item.id}
                style={styles.medicationHistoryCard}
              >
                <View
                  style={[
                    styles.medicationHistoryIcon,
                    {
                      backgroundColor:
                        statusTone.background,
                    },
                  ]}
                >
                  <Ionicons
                    color={statusTone.color}
                    name="bandage-outline"
                    size={22}
                  />
                </View>

                <View
                  style={styles.medicationHistoryText}
                >
                  <Text
                    style={styles.medicationHistoryName}
                  >
                    {item.medicationName}
                  </Text>

                  <Text
                    style={styles.medicationHistoryDose}
                  >
                    {item.strength
                      ? `${item.strength} · `
                      : ''}
                    {item.dose} · {item.route}
                  </Text>

                  <Text
                    style={styles.medicationHistoryMeta}
                  >
                    {formatDateTime(
                      item.administeredAt,
                    )}
                  </Text>

                  {item.comment ? (
                    <Text
                      style={
                        styles.medicationHistoryComment
                      }
                    >
                      {item.comment}
                    </Text>
                  ) : null}

                  <Text style={styles.recordedBy}>
                    Recorded by{' '}
                    {item.administeredBy.fullName}
                  </Text>
                </View>

                <View
                  style={[
                    styles.medicationHistoryStatus,
                    {
                      backgroundColor:
                        statusTone.background,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.medicationHistoryStatusText,
                      {
                        color: statusTone.color,
                      },
                    ]}
                  >
                    {item.status
                      .replaceAll('_', ' ')
                      .toUpperCase()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <EmptySection
          description="Medication-administration records will appear here."
          icon="bandage-outline"
          title="No medication records"
        />
      )}
    </View>
  );
}

function WorkspaceTabButton({
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
        styles.tabButton,
        active && styles.activeTabButton,
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
          styles.tabButtonText,
          active && styles.activeTabButtonText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SectionHeader({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderIcon}>
        <Ionicons
          color={colors.primary}
          name={icon}
          size={22}
        />
      </View>

      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionHeaderTitle}>
          {title}
        </Text>

        <Text
          style={styles.sectionHeaderDescription}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

function OverviewCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'primary' | 'info' | 'success' | 'warning';
}) {
  const tones = {
    primary: {
      background: colors.primarySoft,
      color: colors.primary,
    },

    info: {
      background: colors.infoSoft,
      color: colors.info,
    },

    success: {
      background: colors.successSoft,
      color: colors.success,
    },

    warning: {
      background: colors.warningSoft,
      color: colors.warning,
    },
  };

  const selectedTone = tones[tone];

  return (
    <View style={styles.overviewCard}>
      <View
        style={[
          styles.overviewCardIcon,
          {
            backgroundColor:
              selectedTone.background,
          },
        ]}
      >
        <Ionicons
          color={selectedTone.color}
          name={icon}
          size={21}
        />
      </View>

      <Text style={styles.overviewCardLabel}>
        {label}
      </Text>

      <Text
        numberOfLines={2}
        style={styles.overviewCardValue}
      >
        {value}
      </Text>
    </View>
  );
}

function FluidSummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone:
    | 'primary'
    | 'success'
    | 'info'
    | 'danger';
}) {
  const tones = {
    primary: {
      background: colors.primarySoft,
      color: colors.primary,
    },

    success: {
      background: colors.successSoft,
      color: colors.success,
    },

    info: {
      background: colors.infoSoft,
      color: colors.info,
    },

    danger: {
      background: colors.dangerSoft,
      color: colors.danger,
    },
  };

  const selectedTone = tones[tone];

  return (
    <View style={styles.fluidSummaryCard}>
      <View
        style={[
          styles.fluidSummaryIcon,
          {
            backgroundColor:
              selectedTone.background,
          },
        ]}
      >
        <Ionicons
          color={selectedTone.color}
          name={icon}
          size={20}
        />
      </View>

      <Text style={styles.fluidSummaryLabel}>
        {label}
      </Text>

      <Text style={styles.fluidSummaryValue}>
        {value}
      </Text>
    </View>
  );
}

function VitalCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix: string;
}) {
  return (
    <View style={styles.vitalCard}>
      <Text style={styles.vitalLabel}>
        {label}
      </Text>

      <Text style={styles.vitalValue}>
        {value}
        <Text style={styles.vitalSuffix}>
          {' '}
          {suffix}
        </Text>
      </Text>
    </View>
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

function ChoiceOption({
  label,
  active,
  danger = false,
  onPress,
}: {
  label: string;
  active: boolean;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.choiceOption,

        active &&
          (danger
            ? styles.dangerChoiceOption
            : styles.selectedChoiceOption),
      ]}
    >
      <Text
        style={[
          styles.choiceOptionText,
          active &&
            styles.selectedChoiceOptionText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function HistorySectionHeader({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <View style={styles.historySectionHeader}>
      <Text style={styles.historySectionTitle}>
        {title}
      </Text>

      <View style={styles.historyCount}>
        <Text style={styles.historyCountText}>
          {count}
        </Text>
      </View>
    </View>
  );
}

function HistoryVital({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.historyVital}>
      <Text style={styles.historyVitalLabel}>
        {label}
      </Text>

      <Text style={styles.historyVitalValue}>
        {value}
      </Text>
    </View>
  );
}

function EmptySection({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.emptySection}>
      <View style={styles.emptySectionIcon}>
        <Ionicons
          color={colors.primary}
          name={icon}
          size={29}
        />
      </View>

      <Text style={styles.emptySectionTitle}>
        {title}
      </Text>

      <Text
        style={styles.emptySectionDescription}
      >
        {description}
      </Text>
    </View>
  );
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString([], {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatShortDate(value: string): string {
  return new Date(value).toLocaleDateString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatObservationType(
  observationType: WardObservationType,
): string {
  return (
    observationType.charAt(0).toUpperCase() +
    observationType.slice(1)
  );
}

function getObservationColor(
  observationType: WardObservationType,
): string {
  const tones = {
    routine: colors.success,
    priority: colors.warning,
    urgent: colors.danger,
  };

  return tones[observationType];
}

function getShiftIcon(
  shift: 'morning' | 'afternoon' | 'night',
): keyof typeof Ionicons.glyphMap {
  switch (shift) {
    case 'morning':
      return 'sunny-outline';

    case 'afternoon':
      return 'partly-sunny-outline';

    case 'night':
      return 'moon-outline';
  }
}

function getMedicationStatusTone(
  status: MedicationAdministrationStatus,
): {
  background: string;
  color: string;
} {
  const tones = {
    administered: {
      background: colors.successSoft,
      color: colors.success,
    },

    missed: {
      background: colors.dangerSoft,
      color: colors.danger,
    },

    refused: {
      background: colors.warningSoft,
      color: colors.warning,
    },

    withheld: {
      background: colors.infoSoft,
      color: colors.info,
    },

    not_available: {
      background: colors.dangerSoft,
      color: colors.danger,
    },
  };

  return tones[status];
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  safeArea: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },

  header: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal,
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
    backgroundColor: colors.successSoft,
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

  admittedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  admittedDot: {
    width: 7,
    height: 7,
    borderRadius: radius.round,
    backgroundColor: colors.secondary,
  },

  admittedText: {
    color: colors.secondary,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
  },

  admissionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },

  admissionSummaryIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  admissionSummaryText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  admissionSummaryLabel: {
    color: colors.textMuted,
    fontSize: 10,
  },

  admissionSummaryValue: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  admissionCaseOwner: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  feedbackNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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

  tabs: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
    paddingRight: spacing.xl,
  },

  tabButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },

  activeTabButton: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  tabButtonText: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },

  activeTabButtonText: {
    color: colors.textOnPrimary,
  },

  sectionHeading: {
    marginTop: spacing.xl,
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

  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  overviewCard: {
    width: '47.8%',
    minHeight: 135,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  overviewCardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  overviewCardLabel: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  overviewCardValue: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.extraBold,
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
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  sectionHeaderIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  sectionHeaderText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  sectionHeaderTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  sectionHeaderDescription: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  vitalCard: {
    width: '47.8%',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },

  vitalLabel: {
    color: colors.textSecondary,
    fontSize: 10,
  },

  vitalValue: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.extraBold,
  },

  vitalSuffix: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: typography.weight.regular,
  },

  latestObservation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },

  observationIndicator: {
    width: 9,
    height: 42,
    borderRadius: radius.round,
  },

  latestObservationText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  latestObservationTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  latestObservationDescription: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  latestObservationTime: {
    maxWidth: 90,
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 13,
    textAlign: 'right',
  },

  fluidSummaryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  fluidSummaryCard: {
    flex: 1,
    minHeight: 116,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  fluidSummaryIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fluidSummaryLabel: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 10,
  },

  fluidSummaryValue: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.extraBold,
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

  fieldLabel: {
    marginTop: spacing.lg,
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

  observationOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  shiftOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  choiceOption: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },

  selectedChoiceOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  dangerChoiceOption: {
    borderColor: colors.danger,
    backgroundColor: colors.danger,
  },

  choiceOptionText: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },

  selectedChoiceOptionText: {
    color: colors.textOnPrimary,
  },

  textArea: {
    minHeight: 105,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    backgroundColor: colors.surface,
  },

  largeTextArea: {
    minHeight: 155,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    backgroundColor: colors.surface,
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

  formAction: {
    marginTop: spacing.lg,
  },

  historySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },

  historySectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  historyCount: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  historyCountText: {
    color: colors.primary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.extraBold,
  },

  historyList: {
    gap: spacing.md,
  },

  historyCard: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  historyIdentity: {
    flex: 1,
    marginLeft: spacing.md,
  },

  historyTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  historyMeta: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  historyVitals: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  historyVital: {
    minWidth: '47%',
    flex: 1,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },

  historyVitalLabel: {
    color: colors.textMuted,
    fontSize: 9,
  },

  historyVitalValue: {
    marginTop: 3,
    color: colors.textPrimary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },

  historyNote: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    backgroundColor: colors.primarySoft,
  },

  recordedBy: {
    marginTop: spacing.md,
    color: colors.textMuted,
    fontSize: 9,
  },

  noteHistoryCard: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  noteHistoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  noteShiftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.round,
    backgroundColor: colors.primarySoft,
  },

  noteShiftText: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
  },

  noteHistoryTime: {
    color: colors.textMuted,
    fontSize: 9,
  },

  noteHistoryText: {
    marginTop: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },

  fluidTypeOptions: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  fluidTypeOption: {
    flex: 1,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },

  selectedFluidTypeOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  fluidTypeText: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },

  selectedFluidTypeText: {
    color: colors.textOnPrimary,
  },

  volumeInput: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },

  volumeTextInput: {
    flex: 1,
    minHeight: 52,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  volumeSuffix: {
    color: colors.textMuted,
    fontSize: typography.size.label,
  },

  fluidHistoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  fluidHistoryIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fluidHistoryText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  fluidHistoryTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  fluidHistoryMeta: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  fluidHistoryVolume: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.extraBold,
  },

  twoColumns: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  column: {
    flex: 1,
  },

  routeOptions: {
    gap: spacing.sm,
    paddingRight: spacing.xl,
  },

  routeOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
  },

  selectedRouteOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  routeOptionText: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },

  selectedRouteOptionText: {
    color: colors.textOnPrimary,
  },

  medicationStatusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  medicationStatusOption: {
    minHeight: 42,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedMedicationStatusOption: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },

  warningMedicationStatusOption: {
    borderColor: colors.warning,
    backgroundColor: colors.warning,
  },

  medicationStatusText: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },

  selectedMedicationStatusText: {
    color: colors.textOnPrimary,
  },

  medicationHistoryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  medicationHistoryIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  medicationHistoryText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  medicationHistoryName: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  medicationHistoryDose: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  medicationHistoryMeta: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: 9,
  },

  medicationHistoryComment: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    backgroundColor: colors.surfaceMuted,
  },

  medicationHistoryStatus: {
    maxWidth: 90,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.round,
  },

  medicationHistoryStatusText: {
    fontSize: 7,
    fontWeight: typography.weight.extraBold,
    textAlign: 'center',
  },

  emptySection: {
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.xxl,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  emptySectionIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  emptySectionTitle: {
    marginTop: spacing.lg,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },

  emptySectionDescription: {
    maxWidth: 290,
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    textAlign: 'center',
  },

  returnAction: {
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

  notFoundIcon: {
    width: 76,
    height: 76,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  notFoundTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.sectionTitle,
    fontWeight: typography.weight.bold,
  },

  notFoundDescription: {
    color: colors.textSecondary,
    fontSize: typography.size.label,
    textAlign: 'center',
  },

  pressed: {
    opacity: 0.7,
  },
});