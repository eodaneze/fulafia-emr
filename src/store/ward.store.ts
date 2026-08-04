import { create } from 'zustand';

import { initialWardBeds } from '@/src/constants/ward-beds';
import { useAuthStore } from '@/src/store/auth.store';
import { useDoctorStore } from '@/src/store/doctor.store';
import { usePatientStore } from '@/src/store/patient.store';
import type {
  AdmitPatientPayload,
  SaveWardFluidEntryPayload,
  SaveWardMedicationPayload,
  SaveWardNursingNotePayload,
  SaveWardVitalSignsPayload,
  WardAdmission,
  WardBed,
  WardFluidEntry,
  WardMedicationAdministration,
  WardNursingNote,
  WardVitalSigns,
} from '@/src/types/ward';

type WardActionResult<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type WardState = {
  beds: WardBed[];
  admissions: WardAdmission[];

  vitalSigns: WardVitalSigns[];
  nursingNotes: WardNursingNote[];
  fluidEntries: WardFluidEntry[];
  medicationAdministrations: WardMedicationAdministration[];

  isAdmittingPatient: boolean;
  isSavingWardActivity: boolean;

  admitPatient: (
    payload: AdmitPatientPayload,
  ) => Promise<WardActionResult<WardAdmission>>;

  saveVitalSigns: (
    payload: SaveWardVitalSignsPayload,
  ) => Promise<WardActionResult<WardVitalSigns>>;

  saveNursingNote: (
    payload: SaveWardNursingNotePayload,
  ) => Promise<WardActionResult<WardNursingNote>>;

  saveFluidEntry: (
    payload: SaveWardFluidEntryPayload,
  ) => Promise<WardActionResult<WardFluidEntry>>;

  saveMedicationAdministration: (
    payload: SaveWardMedicationPayload,
  ) => Promise<
    WardActionResult<WardMedicationAdministration>
  >;

  getAdmissionByPatientId: (
    patientId: string,
  ) => WardAdmission | undefined;

  getAdmissionById: (
    admissionId: string,
  ) => WardAdmission | undefined;

  resetWardDemo: () => void;
};

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function getCurrentStaff() {
  const user = useAuthStore.getState().user;

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    fullName: user.fullName,
    employeeId: user.employeeId,
  };
}

export const useWardStore = create<WardState>(
  (set, get) => ({
    beds: initialWardBeds,
    admissions: [],

    vitalSigns: [],
    nursingNotes: [],
    fluidEntries: [],
    medicationAdministrations: [],

    isAdmittingPatient: false,
    isSavingWardActivity: false,

    admitPatient: async (payload) => {
      set({
        isAdmittingPatient: true,
      });

      try {
        await new Promise((resolve) =>
          setTimeout(resolve, 800),
        );

        const staff = getCurrentStaff();

        if (!staff) {
          return {
            success: false,
            message:
              'Your hospital session has expired.',
          };
        }

        const patient =
          usePatientStore
            .getState()
            .getPatientById(payload.patientId);

        if (!patient) {
          return {
            success: false,
            message:
              'The selected patient could not be found.',
          };
        }

        const consultation =
          useDoctorStore
            .getState()
            .consultations.find(
              (item) =>
                item.id === payload.consultationId,
            );

        if (!consultation) {
          return {
            success: false,
            message:
              'The patient consultation could not be found.',
          };
        }

        const bed = get().beds.find(
          (item) => item.id === payload.bedId,
        );

        if (!bed) {
          return {
            success: false,
            message:
              'The selected hospital bed could not be found.',
          };
        }

        if (bed.status !== 'available') {
          return {
            success: false,
            message:
              'The selected bed is no longer available.',
          };
        }

        const activeAdmission =
          get().admissions.find(
            (admission) =>
              admission.patientId ===
                payload.patientId &&
              admission.status === 'admitted',
          );

        if (activeAdmission) {
          return {
            success: false,
            message:
              'This patient already has an active ward admission.',
          };
        }

        const now = new Date().toISOString();

        const admission: WardAdmission = {
          id: createId('ward-admission'),

          patientId: payload.patientId,
          consultationId: payload.consultationId,

          diagnosis: payload.diagnosis.trim(),

          admissionNote:
            payload.admissionNote?.trim() ||
            undefined,

          ward: bed.ward,
          wardName: bed.wardName,

          bedId: bed.id,
          bedNumber: bed.bedNumber,

          status: 'admitted',

          admittedBy: staff,
          admittedAt: now,

          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          admissions: [
            admission,
            ...state.admissions,
          ],

          beds: state.beds.map((item) =>
            item.id === bed.id
              ? {
                  ...item,
                  status: 'occupied',
                  patientId: payload.patientId,
                }
              : item,
          ),
        }));

        usePatientStore.setState((state) => ({
          patients: state.patients.map((item) =>
            item.id === payload.patientId
              ? {
                  ...item,
                  queueStatus: 'admitted',
                  updatedAt: now,
                }
              : item,
          ),
        }));

        useDoctorStore.setState((state) => ({
          consultations: state.consultations.map(
            (item) =>
              item.id === payload.consultationId
                ? {
                    ...item,
                    status: 'admitted',
                    disposition: 'admission',
                    updatedAt: now,
                  }
                : item,
          ),
        }));

        return {
          success: true,
          message:
            'Patient admitted successfully and assigned to a ward bed.',
          data: admission,
        };
      } catch {
        return {
          success: false,
          message:
            'The patient could not be admitted.',
        };
      } finally {
        set({
          isAdmittingPatient: false,
        });
      }
    },

    saveVitalSigns: async (payload) => {
      set({
        isSavingWardActivity: true,
      });

      try {
        await new Promise((resolve) =>
          setTimeout(resolve, 600),
        );

        const staff = getCurrentStaff();

        if (!staff) {
          return {
            success: false,
            message:
              'Your hospital session has expired.',
          };
        }

        const admission =
          get().getAdmissionById(payload.admissionId);

        if (!admission) {
          return {
            success: false,
            message:
              'The ward admission could not be found.',
          };
        }

        const now = new Date().toISOString();

        const vitalSigns: WardVitalSigns = {
          id: createId('ward-vitals'),

          admissionId: payload.admissionId,
          patientId: payload.patientId,

          systolicBloodPressure:
            payload.systolicBloodPressure,

          diastolicBloodPressure:
            payload.diastolicBloodPressure,

          pulseRate: payload.pulseRate,
          temperature: payload.temperature,

          respiratoryRate:
            payload.respiratoryRate,

          oxygenSaturation:
            payload.oxygenSaturation,

          painScore: payload.painScore,

          observationType:
            payload.observationType,

          note:
            payload.note?.trim() || undefined,

          recordedBy: staff,
          recordedAt: now,
        };

        set((state) => ({
          vitalSigns: [
            vitalSigns,
            ...state.vitalSigns,
          ],

          admissions: state.admissions.map(
            (item) =>
              item.id === payload.admissionId
                ? {
                    ...item,
                    updatedAt: now,
                  }
                : item,
          ),
        }));

        return {
          success: true,
          message:
            'Ward vital signs saved and returned to the doctor.',
          data: vitalSigns,
        };
      } finally {
        set({
          isSavingWardActivity: false,
        });
      }
    },

    saveNursingNote: async (payload) => {
      set({
        isSavingWardActivity: true,
      });

      try {
        await new Promise((resolve) =>
          setTimeout(resolve, 550),
        );

        const staff = getCurrentStaff();

        if (!staff) {
          return {
            success: false,
            message:
              'Your hospital session has expired.',
          };
        }

        if (!payload.note.trim()) {
          return {
            success: false,
            message:
              'Enter the ward nursing note.',
          };
        }

        const now = new Date().toISOString();

        const note: WardNursingNote = {
          id: createId('ward-note'),

          admissionId: payload.admissionId,
          patientId: payload.patientId,

          note: payload.note.trim(),
          shift: payload.shift,

          recordedBy: staff,
          recordedAt: now,
        };

        set((state) => ({
          nursingNotes: [
            note,
            ...state.nursingNotes,
          ],

          admissions: state.admissions.map(
            (item) =>
              item.id === payload.admissionId
                ? {
                    ...item,
                    updatedAt: now,
                  }
                : item,
          ),
        }));

        return {
          success: true,
          message:
            'Ward nursing note saved and returned to the doctor.',
          data: note,
        };
      } finally {
        set({
          isSavingWardActivity: false,
        });
      }
    },

    saveFluidEntry: async (payload) => {
      set({
        isSavingWardActivity: true,
      });

      try {
        await new Promise((resolve) =>
          setTimeout(resolve, 500),
        );

        const staff = getCurrentStaff();

        if (!staff) {
          return {
            success: false,
            message:
              'Your hospital session has expired.',
          };
        }

        if (!payload.description.trim()) {
          return {
            success: false,
            message:
              'Enter a description for the fluid entry.',
          };
        }

        if (payload.volume <= 0) {
          return {
            success: false,
            message:
              'Fluid volume must be greater than zero.',
          };
        }

        const now = new Date().toISOString();

        const fluidEntry: WardFluidEntry = {
          id: createId('ward-fluid'),

          admissionId: payload.admissionId,
          patientId: payload.patientId,

          type: payload.type,
          description: payload.description.trim(),
          volume: payload.volume,
          unit: 'ml',

          recordedBy: staff,
          recordedAt: now,
        };

        set((state) => ({
          fluidEntries: [
            fluidEntry,
            ...state.fluidEntries,
          ],
        }));

        return {
          success: true,
          message:
            'Fluid balance entry saved successfully.',
          data: fluidEntry,
        };
      } finally {
        set({
          isSavingWardActivity: false,
        });
      }
    },

    saveMedicationAdministration: async (
      payload,
    ) => {
      set({
        isSavingWardActivity: true,
      });

      try {
        await new Promise((resolve) =>
          setTimeout(resolve, 600),
        );

        const staff = getCurrentStaff();

        if (!staff) {
          return {
            success: false,
            message:
              'Your hospital session has expired.',
          };
        }

        if (!payload.medicationName.trim()) {
          return {
            success: false,
            message:
              'Enter the medication name.',
          };
        }

        if (!payload.dose.trim()) {
          return {
            success: false,
            message:
              'Enter the medication dose.',
          };
        }

        const now = new Date().toISOString();

        const medicationAdministration:
          WardMedicationAdministration = {
          id: createId('ward-medication'),

          admissionId: payload.admissionId,
          patientId: payload.patientId,

          medicationName:
            payload.medicationName.trim(),

          strength:
            payload.strength?.trim() || undefined,

          dose: payload.dose.trim(),
          route: payload.route.trim(),

          status: payload.status,

          comment:
            payload.comment?.trim() || undefined,

          scheduledAt:
            payload.scheduledAt || undefined,

          administeredAt: now,
          administeredBy: staff,
        };

        set((state) => ({
          medicationAdministrations: [
            medicationAdministration,
            ...state.medicationAdministrations,
          ],

          admissions: state.admissions.map(
            (item) =>
              item.id === payload.admissionId
                ? {
                    ...item,
                    updatedAt: now,
                  }
                : item,
          ),
        }));

        return {
          success: true,
          message:
            'Medication administration recorded and returned to the doctor.',
          data: medicationAdministration,
        };
      } finally {
        set({
          isSavingWardActivity: false,
        });
      }
    },

    getAdmissionByPatientId: (patientId) => {
      return get()
        .admissions.filter(
          (admission) =>
            admission.patientId === patientId,
        )
        .sort(
          (first, second) =>
            new Date(second.updatedAt).getTime() -
            new Date(first.updatedAt).getTime(),
        )[0];
    },

    getAdmissionById: (admissionId) => {
      return get().admissions.find(
        (admission) =>
          admission.id === admissionId,
      );
    },

    resetWardDemo: () => {
      set({
        beds: initialWardBeds,
        admissions: [],

        vitalSigns: [],
        nursingNotes: [],
        fluidEntries: [],
        medicationAdministrations: [],

        isAdmittingPatient: false,
        isSavingWardActivity: false,
      });
    },
  }),
);