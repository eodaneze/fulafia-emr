import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
import { usePatientStore } from '@/src/store/patient.store';
import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme';
import type {
  PatientSex,
  PatientType,
} from '@/src/types/patient';

type FormState = {
  firstName: string;
  middleName: string;
  lastName: string;

  dateOfBirth: string;
  sex: PatientSex;
  patientType: PatientType;

  studentRegistrationNumber: string;
  staffNumber: string;

  phoneNumber: string;
  email: string;

  address: string;
  stateOfOrigin: string;
  localGovernmentArea: string;

  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinPhoneNumber: string;

  bloodGroup: string;
  genotype: string;
  allergies: string;
};

const initialForm: FormState = {
  firstName: '',
  middleName: '',
  lastName: '',

  dateOfBirth: '',
  sex: 'male',
  patientType: 'student',

  studentRegistrationNumber: '',
  staffNumber: '',

  phoneNumber: '',
  email: '',

  address: '',
  stateOfOrigin: '',
  localGovernmentArea: '',

  nextOfKinName: '',
  nextOfKinRelationship: '',
  nextOfKinPhoneNumber: '',

  bloodGroup: '',
  genotype: '',
  allergies: '',
};

export default function RegisterPatientScreen() {
  const createPatient = usePatientStore(
    (state) => state.createPatient,
  );

  const [form, setForm] =
    useState<FormState>(initialForm);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const progress = useMemo(() => {
    const requiredValues = [
      form.firstName,
      form.lastName,
      form.dateOfBirth,
      form.phoneNumber,
      form.address,
      form.nextOfKinName,
      form.nextOfKinRelationship,
      form.nextOfKinPhoneNumber,
    ];

    const completedValues = requiredValues.filter(
      (value) => value.trim().length > 0,
    );

    return Math.round(
      (completedValues.length / requiredValues.length) *
        100,
    );
  }, [form]);

  const updateField = <Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  };

  const validate = (): string | null => {
    if (!form.firstName.trim()) {
      return 'Enter the patient’s first name.';
    }

    if (!form.lastName.trim()) {
      return 'Enter the patient’s last name.';
    }

    if (!form.dateOfBirth.trim()) {
      return 'Enter the patient’s date of birth.';
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(form.dateOfBirth)) {
      return 'Date of birth must use YYYY-MM-DD format.';
    }

    if (
      form.patientType === 'student' &&
      !form.studentRegistrationNumber.trim()
    ) {
      return 'Enter the student registration number.';
    }

    if (
      form.patientType === 'staff' &&
      !form.staffNumber.trim()
    ) {
      return 'Enter the staff number.';
    }

    if (!form.phoneNumber.trim()) {
      return 'Enter the patient’s phone number.';
    }

    if (!form.address.trim()) {
      return 'Enter the patient’s residential address.';
    }

    if (!form.nextOfKinName.trim()) {
      return 'Enter the next of kin’s name.';
    }

    if (!form.nextOfKinRelationship.trim()) {
      return 'Enter the next of kin relationship.';
    }

    if (!form.nextOfKinPhoneNumber.trim()) {
      return 'Enter the next of kin phone number.';
    }

    return null;
  };

  const submitPatient = async () => {
    const validationMessage = validate();

    if (validationMessage) {
      Alert.alert(
        'Complete patient information',
        validationMessage,
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createPatient({
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,

        dateOfBirth: form.dateOfBirth,
        sex: form.sex,
        patientType: form.patientType,

        studentRegistrationNumber:
          form.patientType === 'student'
            ? form.studentRegistrationNumber
            : undefined,

        staffNumber:
          form.patientType === 'staff'
            ? form.staffNumber
            : undefined,

        phoneNumber: form.phoneNumber,
        email: form.email,

        address: form.address,
        stateOfOrigin: form.stateOfOrigin,
        localGovernmentArea:
          form.localGovernmentArea,

        nextOfKinName: form.nextOfKinName,
        nextOfKinRelationship:
          form.nextOfKinRelationship,
        nextOfKinPhoneNumber:
          form.nextOfKinPhoneNumber,

        bloodGroup: form.bloodGroup,
        genotype: form.genotype,

        allergies: form.allergies
          .split(',')
          .map((allergy) => allergy.trim())
          .filter(Boolean),
      });

      if (!result.success || !result.patient) {
        Alert.alert(
          'Registration unsuccessful',
          result.message,
        );

        return;
      }

      Alert.alert(
        'Patient registered',
        `${result.patient.fullName} has been assigned hospital number ${result.patient.hospitalNumber} and added to the nursing queue.`,
        [
          {
            text: 'View patient',
            onPress: () =>
              router.replace(
                `/patient/${result.patient?.id}`,
              ),
          },
          {
            text: 'Return to patients',
            onPress: () =>
              router.replace('/(app)/patients'),
          },
        ],
      );
    } finally {
      setIsSubmitting(false);
    }
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
              Register patient
            </Text>

            <Text style={styles.headerSubtitle}>
              Create a new medical record
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
            <View style={styles.notice}>
              <View style={styles.noticeIcon}>
                <Ionicons
                  color={colors.primary}
                  name="information-circle-outline"
                  size={23}
                />
              </View>

              <Text style={styles.noticeText}>
                A unique hospital number will be generated
                automatically after registration.
              </Text>
            </View>

            <FormSection
              description="Basic personal and institutional information."
              icon="person-outline"
              title="Patient information"
            >
              <View style={styles.fieldGap}>
                <AppInput
                  autoCapitalize="words"
                  icon="person-outline"
                  label="First name *"
                  onChangeText={(value) =>
                    updateField('firstName', value)
                  }
                  placeholder="Enter first name"
                  value={form.firstName}
                />

                <AppInput
                  autoCapitalize="words"
                  icon="person-outline"
                  label="Middle name"
                  onChangeText={(value) =>
                    updateField('middleName', value)
                  }
                  placeholder="Enter middle name"
                  value={form.middleName}
                />

                <AppInput
                  autoCapitalize="words"
                  icon="person-outline"
                  label="Last name *"
                  onChangeText={(value) =>
                    updateField('lastName', value)
                  }
                  placeholder="Enter last name"
                  value={form.lastName}
                />

                <AppInput
                  autoCapitalize="none"
                  icon="calendar-outline"
                  label="Date of birth *"
                  onChangeText={(value) =>
                    updateField('dateOfBirth', value)
                  }
                  placeholder="YYYY-MM-DD"
                  value={form.dateOfBirth}
                />

                <ChoiceField
                  label="Sex *"
                  onChange={(value) =>
                    updateField('sex', value)
                  }
                  options={[
                    {
                      label: 'Male',
                      value: 'male',
                      icon: 'male-outline',
                    },
                    {
                      label: 'Female',
                      value: 'female',
                      icon: 'female-outline',
                    },
                  ]}
                  value={form.sex}
                />

                <ChoiceField
                  label="Patient category *"
                  onChange={(value) =>
                    updateField('patientType', value)
                  }
                  options={[
                    {
                      label: 'Student',
                      value: 'student',
                      icon: 'school-outline',
                    },
                    {
                      label: 'Staff',
                      value: 'staff',
                      icon: 'briefcase-outline',
                    },
                    {
                      label: 'Dependant',
                      value: 'dependent',
                      icon: 'people-outline',
                    },
                    {
                      label: 'Public',
                      value: 'public',
                      icon: 'globe-outline',
                    },
                  ]}
                  value={form.patientType}
                />

                {form.patientType === 'student' ? (
                  <AppInput
                    autoCapitalize="characters"
                    icon="school-outline"
                    label="Student registration number *"
                    onChangeText={(value) =>
                      updateField(
                        'studentRegistrationNumber',
                        value,
                      )
                    }
                    placeholder="FUL/CSC/21/1045"
                    value={
                      form.studentRegistrationNumber
                    }
                  />
                ) : null}

                {form.patientType === 'staff' ? (
                  <AppInput
                    autoCapitalize="characters"
                    icon="briefcase-outline"
                    label="Staff number *"
                    onChangeText={(value) =>
                      updateField('staffNumber', value)
                    }
                    placeholder="FUL/STAFF/0001"
                    value={form.staffNumber}
                  />
                ) : null}
              </View>
            </FormSection>

            <FormSection
              description="Patient contact and residential details."
              icon="call-outline"
              title="Contact information"
            >
              <View style={styles.fieldGap}>
                <AppInput
                  icon="call-outline"
                  keyboardType="phone-pad"
                  label="Phone number *"
                  onChangeText={(value) =>
                    updateField('phoneNumber', value)
                  }
                  placeholder="08000000000"
                  value={form.phoneNumber}
                />

                <AppInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  icon="mail-outline"
                  keyboardType="email-address"
                  label="Email address"
                  onChangeText={(value) =>
                    updateField('email', value)
                  }
                  placeholder="patient@example.com"
                  value={form.email}
                />

                <MultilineInput
                  label="Residential address *"
                  onChangeText={(value) =>
                    updateField('address', value)
                  }
                  placeholder="Enter complete residential address"
                  value={form.address}
                />

                <AppInput
                  autoCapitalize="words"
                  icon="location-outline"
                  label="State of origin"
                  onChangeText={(value) =>
                    updateField('stateOfOrigin', value)
                  }
                  placeholder="Nasarawa"
                  value={form.stateOfOrigin}
                />

                <AppInput
                  autoCapitalize="words"
                  icon="map-outline"
                  label="Local government area"
                  onChangeText={(value) =>
                    updateField(
                      'localGovernmentArea',
                      value,
                    )
                  }
                  placeholder="Lafia"
                  value={form.localGovernmentArea}
                />
              </View>
            </FormSection>

            <FormSection
              description="Emergency contact for the patient."
              icon="people-outline"
              title="Next of kin"
            >
              <View style={styles.fieldGap}>
                <AppInput
                  autoCapitalize="words"
                  icon="person-outline"
                  label="Full name *"
                  onChangeText={(value) =>
                    updateField('nextOfKinName', value)
                  }
                  placeholder="Enter full name"
                  value={form.nextOfKinName}
                />

                <AppInput
                  autoCapitalize="words"
                  icon="people-outline"
                  label="Relationship *"
                  onChangeText={(value) =>
                    updateField(
                      'nextOfKinRelationship',
                      value,
                    )
                  }
                  placeholder="Father, mother, spouse..."
                  value={form.nextOfKinRelationship}
                />

                <AppInput
                  icon="call-outline"
                  keyboardType="phone-pad"
                  label="Phone number *"
                  onChangeText={(value) =>
                    updateField(
                      'nextOfKinPhoneNumber',
                      value,
                    )
                  }
                  placeholder="08000000000"
                  value={form.nextOfKinPhoneNumber}
                />
              </View>
            </FormSection>

            <FormSection
              description="Optional clinical identifiers and known allergies."
              icon="medical-outline"
              title="Medical information"
            >
              <View style={styles.fieldGap}>
                <AppInput
                  autoCapitalize="characters"
                  icon="water-outline"
                  label="Blood group"
                  onChangeText={(value) =>
                    updateField('bloodGroup', value)
                  }
                  placeholder="O+"
                  value={form.bloodGroup}
                />

                <AppInput
                  autoCapitalize="characters"
                  icon="fitness-outline"
                  label="Genotype"
                  onChangeText={(value) =>
                    updateField('genotype', value)
                  }
                  placeholder="AA"
                  value={form.genotype}
                />

                <MultilineInput
                  label="Known allergies"
                  onChangeText={(value) =>
                    updateField('allergies', value)
                  }
                  placeholder="Separate multiple allergies with commas"
                  value={form.allergies}
                />
              </View>
            </FormSection>

            <View style={styles.submissionNotice}>
              <Ionicons
                color={colors.success}
                name="git-network-outline"
                size={24}
              />

              <View style={styles.submissionNoticeText}>
                <Text style={styles.submissionNoticeTitle}>
                  Automatic nursing queue
                </Text>

                <Text
                  style={styles.submissionNoticeDescription}
                >
                  After registration, the patient will be
                  added automatically to the outpatient
                  nursing queue for vital signs.
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <AppButton
                loading={isSubmitting}
                onPress={submitPatient}
                title="Register patient"
              />

              <AppButton
                onPress={() => router.back()}
                title="Cancel registration"
                variant="ghost"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

type FormSectionProps = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
};

function FormSection({
  title,
  description,
  icon,
  children,
}: FormSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons
            color={colors.primary}
            name={icon}
            size={22}
          />
        </View>

        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionTitle}>{title}</Text>

          <Text style={styles.sectionDescription}>
            {description}
          </Text>
        </View>
      </View>

      <View style={styles.sectionFields}>{children}</View>
    </View>
  );
}

type ChoiceOption<Value extends string> = {
  label: string;
  value: Value;
  icon: keyof typeof Ionicons.glyphMap;
};

type ChoiceFieldProps<Value extends string> = {
  label: string;
  value: Value;
  options: ChoiceOption<Value>[];
  onChange: (value: Value) => void;
};

function ChoiceField<Value extends string>({
  label,
  value,
  options,
  onChange,
}: ChoiceFieldProps<Value>) {
  return (
    <View style={styles.choiceField}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={styles.choiceOptions}>
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.choiceOption,
                isSelected &&
                  styles.selectedChoiceOption,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                color={
                  isSelected
                    ? colors.textOnPrimary
                    : colors.textSecondary
                }
                name={option.icon}
                size={18}
              />

              <Text
                style={[
                  styles.choiceOptionText,
                  isSelected &&
                    styles.selectedChoiceOptionText,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type MultilineInputProps = {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
};

function MultilineInput({
  label,
  value,
  placeholder,
  onChangeText,
}: MultilineInputProps) {
  return (
    <View style={styles.multilineField}>
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

  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },

  noticeIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  noticeText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },

  section: {
    marginTop: spacing.xl,
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

  sectionFields: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  fieldGap: {
    gap: spacing.lg,
  },

  choiceField: {
    gap: spacing.sm,
  },

  fieldLabel: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
  },

  choiceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  choiceOption: {
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

  selectedChoiceOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  choiceOptionText: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },

  selectedChoiceOptionText: {
    color: colors.textOnPrimary,
    fontWeight: typography.weight.bold,
  },

  multilineField: {
    gap: spacing.sm,
  },

  multilineInput: {
    minHeight: 104,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    backgroundColor: colors.surface,
  },

  submissionNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#BDE6D2',
    borderRadius: radius.lg,
    backgroundColor: colors.successSoft,
  },

  submissionNoticeText: {
    flex: 1,
  },

  submissionNoticeTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  submissionNoticeDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  actions: {
    gap: spacing.md,
    marginTop: spacing.xxl,
  },

  pressed: {
    opacity: 0.7,
  },
});