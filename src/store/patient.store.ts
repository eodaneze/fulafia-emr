import { create } from 'zustand';

import { initialPatients } from '@/src/constants/patients';
import type {
  CreatePatientPayload,
  Patient,
  PatientType,
} from '@/src/types/patient';

type PatientFilter = 'all' | PatientType;

type CreatePatientResult = {
  success: boolean;
  message: string;
  patient?: Patient;
};

type PatientState = {
  patients: Patient[];
  searchQuery: string;
  selectedFilter: PatientFilter;

  setSearchQuery: (query: string) => void;
  setSelectedFilter: (filter: PatientFilter) => void;

  createPatient: (
    payload: CreatePatientPayload,
  ) => Promise<CreatePatientResult>;

  getPatientById: (patientId: string) => Patient | undefined;
  resetDemoPatients: () => void;
};

function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference =
    today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return Math.max(age, 0);
}

function generateHospitalNumber(
  existingPatients: Patient[],
): string {
  const currentYear = new Date().getFullYear();

  const highestNumber = existingPatients.reduce(
    (currentHighest, patient) => {
      const patientNumber = Number(
        patient.hospitalNumber.split('-').at(-1),
      );

      if (Number.isNaN(patientNumber)) {
        return currentHighest;
      }

      return Math.max(currentHighest, patientNumber);
    },
    0,
  );

  return `FULCH-${currentYear}-${String(
    highestNumber + 1,
  ).padStart(5, '0')}`;
}

function createId(): string {
  return `patient-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export const usePatientStore = create<PatientState>(
  (set, get) => ({
    patients: initialPatients,
    searchQuery: '',
    selectedFilter: 'all',

    setSearchQuery: (query) => {
      set({
        searchQuery: query,
      });
    },

    setSelectedFilter: (filter) => {
      set({
        selectedFilter: filter,
      });
    },

    createPatient: async (payload) => {
      await new Promise((resolve) =>
        setTimeout(resolve, 900),
      );

      const patients = get().patients;

      const duplicateRegistrationNumber =
        payload.studentRegistrationNumber &&
        patients.some(
          (patient) =>
            patient.studentRegistrationNumber
              ?.trim()
              .toLowerCase() ===
            payload.studentRegistrationNumber
              ?.trim()
              .toLowerCase(),
        );

      if (duplicateRegistrationNumber) {
        return {
          success: false,
          message:
            'A patient with this student registration number already exists.',
        };
      }

      const duplicateStaffNumber =
        payload.staffNumber &&
        patients.some(
          (patient) =>
            patient.staffNumber?.trim().toLowerCase() ===
            payload.staffNumber?.trim().toLowerCase(),
        );

      if (duplicateStaffNumber) {
        return {
          success: false,
          message:
            'A patient with this staff number already exists.',
        };
      }

      const now = new Date().toISOString();

      const fullName = [
        payload.firstName.trim(),
        payload.middleName?.trim(),
        payload.lastName.trim(),
      ]
        .filter(Boolean)
        .join(' ');

      const patient: Patient = {
        id: createId(),
        hospitalNumber: generateHospitalNumber(patients),

        firstName: payload.firstName.trim(),
        middleName: payload.middleName?.trim(),
        lastName: payload.lastName.trim(),
        fullName,

        dateOfBirth: payload.dateOfBirth,
        age: calculateAge(payload.dateOfBirth),
        sex: payload.sex,
        patientType: payload.patientType,

        studentRegistrationNumber:
          payload.studentRegistrationNumber?.trim() ||
          undefined,

        staffNumber:
          payload.staffNumber?.trim() || undefined,

        phoneNumber: payload.phoneNumber.trim(),
        email: payload.email?.trim() || undefined,

        address: payload.address.trim(),
        stateOfOrigin:
          payload.stateOfOrigin?.trim() || undefined,
        localGovernmentArea:
          payload.localGovernmentArea?.trim() || undefined,

        nextOfKinName: payload.nextOfKinName.trim(),
        nextOfKinRelationship:
          payload.nextOfKinRelationship.trim(),
        nextOfKinPhoneNumber:
          payload.nextOfKinPhoneNumber.trim(),

        bloodGroup: payload.bloodGroup || undefined,
        genotype: payload.genotype || undefined,
        allergies: payload.allergies ?? [],

        status: 'active',
        queueStatus: 'waiting_for_vitals',

        totalVisits: 1,
        lastVisitAt: now,

        createdAt: now,
        updatedAt: now,
      };

      set((state) => ({
        patients: [patient, ...state.patients],
      }));

      return {
        success: true,
        message:
          'Patient registered successfully and added to the nursing queue.',
        patient,
      };
    },

    getPatientById: (patientId) => {
      return get().patients.find(
        (patient) => patient.id === patientId,
      );
    },

    resetDemoPatients: () => {
      set({
        patients: initialPatients,
        searchQuery: '',
        selectedFilter: 'all',
      });
    },
  }),
);