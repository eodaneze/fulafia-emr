import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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
import { laboratoryTestCatalogue } from '@/src/constants/laboratory-tests';
import { useDoctorStore } from '@/src/store/doctor.store';
import { useNursingStore } from '@/src/store/nursing.store';
import { usePatientStore } from '@/src/store/patient.store';
import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme';
import type {
  DifferentialDiagnosis,
  ExaminationFinding,
  ExaminationSystem,
  LaboratoryTestOption,
} from '@/src/types/doctor';
import { getPatientInitials } from '@/src/types/patient';

type WorkspaceTab =
  | 'summary'
  | 'history'
  | 'examination'
  | 'diagnosis'
  | 'laboratory';

type ConsultationForm = {
  presentingComplaint: string;
  historyOfPresentIllness: string;
  previousMedicalHistory: string;
  drugHistory: string;
  familyHistory: string;
  allergyHistory: string;
};

const initialForm: ConsultationForm = {
  presentingComplaint: '',
  historyOfPresentIllness: '',
  previousMedicalHistory: '',
  drugHistory: '',
  familyHistory: '',
  allergyHistory: '',
};

const examinationSystems: Array<{
  value: ExaminationSystem;
  label: string;
}> = [
  {
    value: 'general',
    label: 'General',
  },
  {
    value: 'cardiovascular',
    label: 'Cardiovascular',
  },
  {
    value: 'respiratory',
    label: 'Respiratory',
  },
  {
    value: 'abdomen',
    label: 'Abdomen',
  },
  {
    value: 'neurological',
    label: 'Neurological',
  },
  {
    value: 'musculoskeletal',
    label: 'Musculoskeletal',
  },
  {
    value: 'other',
    label: 'Other',
  },
];

export default function DoctorConsultationScreen() {
  const { patientId } = useLocalSearchParams<{
    patientId: string;
  }>();

  const patient = usePatientStore((state) =>
    state.getPatientById(patientId),
  );

  const latestVitals = useNursingStore((state) =>
    state.getLatestVitalSignsForPatient(patientId),
  );

  const consultation = useDoctorStore((state) =>
    state.getConsultationByPatientId(patientId),
  );

  const startConsultation = useDoctorStore(
    (state) => state.startConsultation,
  );

  const saveConsultation = useDoctorStore(
    (state) => state.saveConsultation,
  );

  const createLaboratoryRequest = useDoctorStore(
    (state) => state.createLaboratoryRequest,
  );

  const isSavingConsultation = useDoctorStore(
    (state) => state.isSavingConsultation,
  );

  const isCreatingLabRequest = useDoctorStore(
    (state) => state.isCreatingLabRequest,
  );

  const [activeTab, setActiveTab] =
    useState<WorkspaceTab>('summary');

  const [form, setForm] =
    useState<ConsultationForm>(initialForm);

  const [examinationFindings, setExaminationFindings] =
    useState<ExaminationFinding[]>([]);

  const [selectedExaminationSystem, setSelectedExaminationSystem] =
    useState<ExaminationSystem>('general');

  const [examinationText, setExaminationText] =
    useState('');

  const [diagnosisText, setDiagnosisText] =
    useState('');

  const [differentialDiagnoses, setDifferentialDiagnoses] =
    useState<DifferentialDiagnosis[]>([]);

  const [selectedTests, setSelectedTests] = useState<
    LaboratoryTestOption[]
  >([]);

  const [laboratoryPriority, setLaboratoryPriority] =
    useState<'routine' | 'urgent'>('routine');

  const [laboratoryNote, setLaboratoryNote] =
    useState('');

  useEffect(() => {
    void startConsultation(patientId);
  }, [patientId, startConsultation]);

  useEffect(() => {
    if (!consultation) {
      return;
    }

    setForm({
      presentingComplaint:
        consultation.presentingComplaint,
      historyOfPresentIllness:
        consultation.historyOfPresentIllness,
      previousMedicalHistory:
        consultation.previousMedicalHistory ?? '',
      drugHistory: consultation.drugHistory ?? '',
      familyHistory: consultation.familyHistory ?? '',
      allergyHistory:
        consultation.allergyHistory ?? '',
    });

    setExaminationFindings(
      consultation.examinationFindings,
    );

    setDifferentialDiagnoses(
      consultation.differentialDiagnoses,
    );
  }, [consultation]);

  const completionPercentage = useMemo(() => {
    const checks = [
      Boolean(form.presentingComplaint.trim()),
      Boolean(form.historyOfPresentIllness.trim()),
      examinationFindings.length > 0,
      differentialDiagnoses.length > 0,
    ];

    return Math.round(
      (checks.filter(Boolean).length / checks.length) *
        100,
    );
  }, [
    differentialDiagnoses,
    examinationFindings,
    form,
  ]);

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
          onPress={() => router.replace('/doctor')}
          title="Return to doctor queue"
        />
      </SafeAreaView>
    );
  }

  const updateForm = <Key extends keyof ConsultationForm>(
    key: Key,
    value: ConsultationForm[Key],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const addExaminationFinding = () => {
    if (!examinationText.trim()) {
      Alert.alert(
        'Examination finding required',
        'Enter the physical examination finding.',
      );

      return;
    }

    setExaminationFindings((current) => [
      ...current,
      {
        system: selectedExaminationSystem,
        finding: examinationText.trim(),
      },
    ]);

    setExaminationText('');
  };

  const removeExaminationFinding = (
    indexToRemove: number,
  ) => {
    setExaminationFindings((current) =>
      current.filter(
        (_, index) => index !== indexToRemove,
      ),
    );
  };

  const addDiagnosis = () => {
    if (!diagnosisText.trim()) {
      Alert.alert(
        'Diagnosis required',
        'Enter a differential diagnosis.',
      );

      return;
    }

    const diagnosis: DifferentialDiagnosis = {
      id: `diagnosis-${Date.now()}`,
      diagnosis: diagnosisText.trim(),
      isPrimary: differentialDiagnoses.length === 0,
    };

    setDifferentialDiagnoses((current) => [
      ...current,
      diagnosis,
    ]);

    setDiagnosisText('');
  };

  const markPrimaryDiagnosis = (diagnosisId: string) => {
    setDifferentialDiagnoses((current) =>
      current.map((diagnosis) => ({
        ...diagnosis,
        isPrimary: diagnosis.id === diagnosisId,
      })),
    );
  };

  const removeDiagnosis = (diagnosisId: string) => {
    setDifferentialDiagnoses((current) => {
      const remaining = current.filter(
        (diagnosis) =>
          diagnosis.id !== diagnosisId,
      );

      if (
        remaining.length > 0 &&
        !remaining.some(
          (diagnosis) => diagnosis.isPrimary,
        )
      ) {
        remaining[0] = {
          ...remaining[0],
          isPrimary: true,
        };
      }

      return remaining;
    });
  };

  const toggleLaboratoryTest = (
    test: LaboratoryTestOption,
  ) => {
    setSelectedTests((current) => {
      const exists = current.some(
        (item) => item.code === test.code,
      );

      if (exists) {
        return current.filter(
          (item) => item.code !== test.code,
        );
      }

      return [...current, test];
    });
  };

  const handleSaveConsultation = async () => {
    if (!form.presentingComplaint.trim()) {
      Alert.alert(
        'Presenting complaint required',
        'Enter the patient’s presenting complaint.',
      );

      setActiveTab('history');
      return;
    }

    if (!form.historyOfPresentIllness.trim()) {
      Alert.alert(
        'Clinical history required',
        'Enter the history of the present illness.',
      );

      setActiveTab('history');
      return;
    }

    const result = await saveConsultation({
      patientId: patient.id,

      presentingComplaint:
        form.presentingComplaint,

      historyOfPresentIllness:
        form.historyOfPresentIllness,

      previousMedicalHistory:
        form.previousMedicalHistory,

      drugHistory: form.drugHistory,
      familyHistory: form.familyHistory,
      allergyHistory: form.allergyHistory,

      examinationFindings,
      differentialDiagnoses,
    });

    Alert.alert(
      result.success
        ? 'Consultation saved'
        : 'Unable to save consultation',
      result.message,
    );
  };

  const submitLaboratoryRequest = async () => {
    if (!consultation) {
      Alert.alert(
        'Save consultation first',
        'Save the consultation before requesting laboratory investigations.',
      );

      return;
    }

    if (!selectedTests.length) {
      Alert.alert(
        'Select investigations',
        'Select at least one laboratory test.',
      );

      return;
    }

    const saveResult = await saveConsultation({
      patientId: patient.id,

      presentingComplaint:
        form.presentingComplaint,

      historyOfPresentIllness:
        form.historyOfPresentIllness,

      previousMedicalHistory:
        form.previousMedicalHistory,

      drugHistory: form.drugHistory,
      familyHistory: form.familyHistory,
      allergyHistory: form.allergyHistory,

      examinationFindings,
      differentialDiagnoses,
    });

    if (!saveResult.success) {
      Alert.alert(
        'Consultation not saved',
        saveResult.message,
      );

      return;
    }

    const result = await createLaboratoryRequest({
      patientId: patient.id,
      consultationId: consultation.id,
      tests: selectedTests,
      clinicalNote: laboratoryNote,
      priority: laboratoryPriority,
    });

    if (!result.success) {
      Alert.alert(
        'Request not submitted',
        result.message,
      );

      return;
    }

    Alert.alert(
      'Laboratory request submitted',
      `${selectedTests.length} investigation${
        selectedTests.length === 1 ? '' : 's'
      } sent to the laboratory. The patient remains under your clinical case.`,
      [
        {
          text: 'Return to queue',
          onPress: () => router.replace('/doctor'),
        },
        {
          text: 'Stay on case',
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
              Clinical case
            </Text>

            <Text style={styles.headerSubtitle}>
              {patient.hospitalNumber}
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
              <View style={styles.patientAvatar}>
                <Text style={styles.patientAvatarText}>
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

                <Text style={styles.patientMeta}>
                  {patient.age} years ·{' '}
                  {patient.sex === 'male'
                    ? 'Male'
                    : 'Female'}
                </Text>
              </View>

              <View style={styles.caseOwnerBadge}>
                <Ionicons
                  color={colors.secondary}
                  name="shield-checkmark"
                  size={15}
                />

                <Text style={styles.caseOwnerText}>
                  CASE OWNER
                </Text>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.tabs}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <WorkspaceTabButton
                active={activeTab === 'summary'}
                icon="document-text-outline"
                label="Summary"
                onPress={() => setActiveTab('summary')}
              />

              <WorkspaceTabButton
                active={activeTab === 'history'}
                icon="time-outline"
                label="History"
                onPress={() => setActiveTab('history')}
              />

              <WorkspaceTabButton
                active={activeTab === 'examination'}
                icon="fitness-outline"
                label="Examination"
                onPress={() =>
                  setActiveTab('examination')
                }
              />

              <WorkspaceTabButton
                active={activeTab === 'diagnosis'}
                icon="medical-outline"
                label="Diagnosis"
                onPress={() => setActiveTab('diagnosis')}
              />

              <WorkspaceTabButton
                active={activeTab === 'laboratory'}
                icon="flask-outline"
                label="Laboratory"
                onPress={() =>
                  setActiveTab('laboratory')
                }
              />
            </ScrollView>

            {activeTab === 'summary' ? (
              <SummarySection
                latestVitals={latestVitals}
                patient={patient}
              />
            ) : null}

            {activeTab === 'history' ? (
              <HistorySection
                form={form}
                updateForm={updateForm}
              />
            ) : null}

            {activeTab === 'examination' ? (
              <ExaminationSection
                examinationFindings={
                  examinationFindings
                }
                examinationText={examinationText}
                onAdd={addExaminationFinding}
                onRemove={removeExaminationFinding}
                selectedSystem={
                  selectedExaminationSystem
                }
                setExaminationText={
                  setExaminationText
                }
                setSelectedSystem={
                  setSelectedExaminationSystem
                }
              />
            ) : null}

            {activeTab === 'diagnosis' ? (
              <DiagnosisSection
                diagnosisText={diagnosisText}
                diagnoses={differentialDiagnoses}
                onAdd={addDiagnosis}
                onMarkPrimary={markPrimaryDiagnosis}
                onRemove={removeDiagnosis}
                setDiagnosisText={setDiagnosisText}
              />
            ) : null}

            {activeTab === 'laboratory' ? (
              <LaboratorySection
                laboratoryNote={laboratoryNote}
                priority={laboratoryPriority}
                selectedTests={selectedTests}
                setLaboratoryNote={setLaboratoryNote}
                setPriority={setLaboratoryPriority}
                toggleTest={toggleLaboratoryTest}
              />
            ) : null}

            <View style={styles.actions}>
              {activeTab === 'laboratory' ? (
                <AppButton
                  loading={isCreatingLabRequest}
                  onPress={submitLaboratoryRequest}
                  title="Submit laboratory request"
                />
              ) : (
                <AppButton
                  loading={isSavingConsultation}
                  onPress={handleSaveConsultation}
                  title="Save clinical case"
                />
              )}

              <AppButton
                onPress={() => router.back()}
                title="Return to doctor queue"
                variant="ghost"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}


type PatientRecord = NonNullable<
  ReturnType<
    typeof usePatientStore.getState
  >['patients'][number]
>;

function SummarySection({
  patient,
  latestVitals,
}: {
  patient: PatientRecord;
  latestVitals:
    | ReturnType<
        typeof useNursingStore.getState
      >['vitalSigns'][number]
    | undefined;
}) {
  return (
    <View style={styles.sectionCard}>
      <SectionHeading
        description="Review the patient’s current clinical information."
        icon="document-text-outline"
        title="Patient summary"
      />

      <View style={styles.summaryRows}>
        <InformationRow
          label="Hospital number"
          value={patient.hospitalNumber}
        />

        <InformationRow
          label="Patient category"
          value={patient.patientType}
        />

        <InformationRow
          label="Phone number"
          value={patient.phoneNumber}
        />

        <InformationRow
          label="Known allergies"
          value={
            patient.allergies?.length
              ? patient.allergies.join(', ')
              : 'No known allergies'
          }
        />
      </View>

      <Text style={styles.subsectionTitle}>
        Latest vital signs
      </Text>

      {latestVitals ? (
        <View style={styles.vitalsGrid}>
          <VitalCard
            label="Blood pressure"
            value={`${latestVitals.systolicBloodPressure}/${latestVitals.diastolicBloodPressure}`}
            suffix="mmHg"
          />

          <VitalCard
            label="Temperature"
            value={String(latestVitals.temperature)}
            suffix="°C"
          />

          <VitalCard
            label="Pulse"
            value={String(latestVitals.pulseRate)}
            suffix="bpm"
          />

          <VitalCard
            label="Oxygen"
            value={String(
              latestVitals.oxygenSaturation,
            )}
            suffix="%"
          />

          <VitalCard
            label="Respiration"
            value={String(
              latestVitals.respiratoryRate,
            )}
            suffix="/min"
          />

          <VitalCard
            label="Pain"
            value={String(latestVitals.painScore)}
            suffix="/10"
          />
        </View>
      ) : (
        <Text style={styles.noDataText}>
          No nursing assessment has been recorded.
        </Text>
      )}

      {latestVitals?.presentingComplaint ? (
        <>
          <Text style={styles.subsectionTitle}>
            Nursing complaint
          </Text>

          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              {latestVitals.presentingComplaint}
            </Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

function HistorySection({
  form,
  updateForm,
}: {
  form: ConsultationForm;
  updateForm: <Key extends keyof ConsultationForm>(
    key: Key,
    value: ConsultationForm[Key],
  ) => void;
}) {
  return (
    <View style={styles.sectionCard}>
      <SectionHeading
        description="Document the patient’s presenting complaint and relevant history."
        icon="time-outline"
        title="Clinical history"
      />

      <View style={styles.fieldGap}>
        <ClinicalTextArea
          label="Presenting complaint *"
          onChangeText={(value) =>
            updateForm('presentingComplaint', value)
          }
          placeholder="Example: Fever, headache and weakness..."
          value={form.presentingComplaint}
        />

        <ClinicalTextArea
          label="History of present illness *"
          onChangeText={(value) =>
            updateForm(
              'historyOfPresentIllness',
              value,
            )
          }
          placeholder="Describe onset, duration, progression and associated symptoms..."
          value={form.historyOfPresentIllness}
        />

        <ClinicalTextArea
          label="Previous medical history"
          onChangeText={(value) =>
            updateForm(
              'previousMedicalHistory',
              value,
            )
          }
          placeholder="Previous diagnoses, admissions and procedures..."
          value={form.previousMedicalHistory}
        />

        <ClinicalTextArea
          label="Drug history"
          onChangeText={(value) =>
            updateForm('drugHistory', value)
          }
          placeholder="Current and recently used medications..."
          value={form.drugHistory}
        />

        <ClinicalTextArea
          label="Family history"
          onChangeText={(value) =>
            updateForm('familyHistory', value)
          }
          placeholder="Relevant family medical history..."
          value={form.familyHistory}
        />

        <ClinicalTextArea
          label="Allergy history"
          onChangeText={(value) =>
            updateForm('allergyHistory', value)
          }
          placeholder="Drug, food and environmental allergies..."
          value={form.allergyHistory}
        />
      </View>
    </View>
  );
}

function ExaminationSection({
  selectedSystem,
  setSelectedSystem,
  examinationText,
  setExaminationText,
  examinationFindings,
  onAdd,
  onRemove,
}: {
  selectedSystem: ExaminationSystem;
  setSelectedSystem: (
    system: ExaminationSystem,
  ) => void;
  examinationText: string;
  setExaminationText: (value: string) => void;
  examinationFindings: ExaminationFinding[];
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <View style={styles.sectionCard}>
      <SectionHeading
        description="Record structured physical examination findings."
        icon="fitness-outline"
        title="Physical examination"
      />

      <Text style={styles.fieldLabel}>
        Examination system
      </Text>

      <ScrollView
        contentContainerStyle={styles.systemOptions}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {examinationSystems.map((system) => {
          const isSelected =
            selectedSystem === system.value;

          return (
            <Pressable
              key={system.value}
              onPress={() =>
                setSelectedSystem(system.value)
              }
              style={[
                styles.systemOption,
                isSelected &&
                  styles.selectedSystemOption,
              ]}
            >
              <Text
                style={[
                  styles.systemOptionText,
                  isSelected &&
                    styles.selectedSystemOptionText,
                ]}
              >
                {system.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ClinicalTextArea
        label="Finding"
        onChangeText={setExaminationText}
        placeholder="Enter examination findings..."
        value={examinationText}
      />

      <Pressable
        onPress={onAdd}
        style={styles.addButton}
      >
        <Ionicons
          color={colors.primary}
          name="add-circle-outline"
          size={21}
        />

        <Text style={styles.addButtonText}>
          Add examination finding
        </Text>
      </Pressable>

      {examinationFindings.length ? (
        <View style={styles.entryList}>
          {examinationFindings.map(
            (finding, index) => (
              <View
                key={`${finding.system}-${index}`}
                style={styles.entryCard}
              >
                <View style={styles.entryText}>
                  <Text style={styles.entryLabel}>
                    {finding.system
                      .replaceAll('_', ' ')
                      .toUpperCase()}
                  </Text>

                  <Text style={styles.entryDescription}>
                    {finding.finding}
                  </Text>
                </View>

                <Pressable
                  hitSlop={10}
                  onPress={() => onRemove(index)}
                >
                  <Ionicons
                    color={colors.danger}
                    name="trash-outline"
                    size={20}
                  />
                </Pressable>
              </View>
            ),
          )}
        </View>
      ) : null}
    </View>
  );
}

function DiagnosisSection({
  diagnosisText,
  setDiagnosisText,
  diagnoses,
  onAdd,
  onMarkPrimary,
  onRemove,
}: {
  diagnosisText: string;
  setDiagnosisText: (value: string) => void;
  diagnoses: DifferentialDiagnosis[];
  onAdd: () => void;
  onMarkPrimary: (diagnosisId: string) => void;
  onRemove: (diagnosisId: string) => void;
}) {
  return (
    <View style={styles.sectionCard}>
      <SectionHeading
        description="Add possible diagnoses and select the leading working diagnosis."
        icon="medical-outline"
        title="Differential diagnosis"
      />

      <View style={styles.diagnosisInputRow}>
        <TextInput
          onChangeText={setDiagnosisText}
          placeholder="Enter a possible diagnosis"
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          style={styles.diagnosisInput}
          value={diagnosisText}
        />

        <Pressable
          onPress={onAdd}
          style={styles.diagnosisAddButton}
        >
          <Ionicons
            color={colors.textOnPrimary}
            name="add"
            size={23}
          />
        </Pressable>
      </View>

      {diagnoses.length ? (
        <View style={styles.entryList}>
          {diagnoses.map((diagnosis) => (
            <View
              key={diagnosis.id}
              style={[
                styles.diagnosisCard,
                diagnosis.isPrimary &&
                  styles.primaryDiagnosisCard,
              ]}
            >
              <Pressable
                hitSlop={10}
                onPress={() =>
                  onMarkPrimary(diagnosis.id)
                }
              >
                <Ionicons
                  color={
                    diagnosis.isPrimary
                      ? colors.primary
                      : colors.textMuted
                  }
                  name={
                    diagnosis.isPrimary
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={22}
                />
              </Pressable>

              <View style={styles.diagnosisText}>
                <Text style={styles.diagnosisName}>
                  {diagnosis.diagnosis}
                </Text>

                <Text style={styles.diagnosisStatus}>
                  {diagnosis.isPrimary
                    ? 'Primary working diagnosis'
                    : 'Differential diagnosis'}
                </Text>
              </View>

              <Pressable
                hitSlop={10}
                onPress={() =>
                  onRemove(diagnosis.id)
                }
              >
                <Ionicons
                  color={colors.danger}
                  name="close-circle-outline"
                  size={21}
                />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noDataText}>
          No differential diagnoses have been added.
        </Text>
      )}
    </View>
  );
}

function LaboratorySection({
  selectedTests,
  toggleTest,
  priority,
  setPriority,
  laboratoryNote,
  setLaboratoryNote,
}: {
  selectedTests: LaboratoryTestOption[];
  toggleTest: (test: LaboratoryTestOption) => void;
  priority: 'routine' | 'urgent';
  setPriority: (priority: 'routine' | 'urgent') => void;
  laboratoryNote: string;
  setLaboratoryNote: (value: string) => void;
}) {
  return (
    <View style={styles.sectionCard}>
      <SectionHeading
        description="Select one or more investigations for the laboratory."
        icon="flask-outline"
        title="Laboratory request"
      />

      <View style={styles.priorityOptions}>
        <Pressable
          onPress={() => setPriority('routine')}
          style={[
            styles.priorityOption,
            priority === 'routine' &&
              styles.selectedPriorityOption,
          ]}
        >
          <Ionicons
            color={
              priority === 'routine'
                ? colors.textOnPrimary
                : colors.success
            }
            name="time-outline"
            size={19}
          />

          <Text
            style={[
              styles.priorityOptionText,
              priority === 'routine' &&
                styles.selectedPriorityOptionText,
            ]}
          >
            Routine
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setPriority('urgent')}
          style={[
            styles.priorityOption,
            priority === 'urgent' &&
              styles.urgentPriorityOption,
          ]}
        >
          <Ionicons
            color={
              priority === 'urgent'
                ? colors.textOnPrimary
                : colors.danger
            }
            name="alert-circle-outline"
            size={19}
          />

          <Text
            style={[
              styles.priorityOptionText,
              priority === 'urgent' &&
                styles.selectedPriorityOptionText,
            ]}
          >
            Urgent
          </Text>
        </Pressable>
      </View>

      <Text style={styles.selectedCount}>
        {selectedTests.length} investigation
        {selectedTests.length === 1 ? '' : 's'} selected
      </Text>

      <View style={styles.testList}>
        {laboratoryTestCatalogue.map((test) => {
          const isSelected = selectedTests.some(
            (item) => item.code === test.code,
          );

          return (
            <Pressable
              key={test.code}
              onPress={() => toggleTest(test)}
              style={[
                styles.testCard,
                isSelected &&
                  styles.selectedTestCard,
              ]}
            >
              <View
                style={[
                  styles.checkbox,
                  isSelected &&
                    styles.selectedCheckbox,
                ]}
              >
                {isSelected ? (
                  <Ionicons
                    color={colors.textOnPrimary}
                    name="checkmark"
                    size={15}
                  />
                ) : null}
              </View>

              <View style={styles.testText}>
                <Text style={styles.testName}>
                  {test.name}
                </Text>

                <Text style={styles.testMeta}>
                  {test.category} · {test.specimen}
                </Text>
              </View>

              <Text style={styles.testCode}>
                {test.code}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ClinicalTextArea
        label="Laboratory note"
        onChangeText={setLaboratoryNote}
        placeholder="Add information required by the laboratory without revealing the diagnosis..."
        value={laboratoryNote}
      />

      <View style={styles.blindLabNotice}>
        <Ionicons
          color={colors.info}
          name="eye-off-outline"
          size={22}
        />

        <Text style={styles.blindLabText}>
          The laboratory receives the patient’s biodata and
          requested investigations, but not the doctor’s
          diagnosis or complete vital signs.
        </Text>
      </View>
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
      <View style={styles.sectionIcon}>
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

function ClinicalTextArea({
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
        style={styles.textArea}
        textAlignVertical="top"
        value={value}
      />
    </View>
  );
}

function InformationRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.informationRow}>
      <Text style={styles.informationLabel}>
        {label}
      </Text>

      <Text style={styles.informationValue}>
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
      <Text style={styles.vitalLabel}>{label}</Text>

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

  patientAvatar: {
    width: 54,
    height: 54,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  patientAvatarText: {
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

  patientMeta: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.55)',
    fontSize: typography.size.caption,
  },

  caseOwnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  caseOwnerText: {
    color: colors.secondary,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
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

  sectionIcon: {
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

  summaryRows: {
    marginTop: spacing.lg,
  },

  informationRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  informationLabel: {
    color: colors.textMuted,
    fontSize: typography.size.caption,
  },

  informationValue: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
  },

  subsectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
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

  noteBox: {
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },

  noteText: {
    color: colors.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },

  fieldGap: {
    gap: spacing.lg,
    marginTop: spacing.lg,
  },

  fieldLabel: {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
  },

  textArea: {
    minHeight: 112,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    backgroundColor: colors.surface,
  },

  systemOptions: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
    paddingRight: spacing.xl,
  },

  systemOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
  },

  selectedSystemOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  systemOptionText: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },

  selectedSystemOptionText: {
    color: colors.textOnPrimary,
  },

  addButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },

  addButtonText: {
    color: colors.primary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  entryList: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },

  entryText: {
    flex: 1,
    marginRight: spacing.md,
  },

  entryLabel: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: typography.weight.extraBold,
  },

  entryDescription: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },

  diagnosisInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  diagnosisInput: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.textPrimary,
    fontSize: typography.size.label,
  },

  diagnosisAddButton: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  diagnosisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },

  primaryDiagnosisCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  diagnosisText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  diagnosisName: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  diagnosisStatus: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  noDataText: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    color: colors.textSecondary,
    fontSize: typography.size.label,
    textAlign: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },

  priorityOptions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  priorityOption: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },

  selectedPriorityOption: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },

  urgentPriorityOption: {
    borderColor: colors.danger,
    backgroundColor: colors.danger,
  },

  priorityOptionText: {
    color: colors.textSecondary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  selectedPriorityOptionText: {
    color: colors.textOnPrimary,
  },

  selectedCount: {
    marginTop: spacing.lg,
    color: colors.primary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },

  testList: {
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },

  testCard: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },

  selectedTestCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  selectedCheckbox: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  testText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  testName: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  testMeta: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  testCode: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: typography.weight.extraBold,
  },

  blindLabNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.infoSoft,
  },

  blindLabText: {
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