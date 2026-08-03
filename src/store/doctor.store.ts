import { create } from 'zustand';

import { useAuthStore } from '@/src/store/auth.store';
import { usePatientStore } from '@/src/store/patient.store';
import type {
  Consultation,
  CreateLaboratoryRequestPayload,
  LaboratoryRequest,
  SaveConsultationPayload,
} from '@/src/types/doctor';

type StoreResult<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type DoctorState = {
  consultations: Consultation[];
  laboratoryRequests: LaboratoryRequest[];

  isSavingConsultation: boolean;
  isCreatingLabRequest: boolean;

  startConsultation: (
    patientId: string,
  ) => Promise<StoreResult<Consultation>>;

  saveConsultation: (
    payload: SaveConsultationPayload,
  ) => Promise<StoreResult<Consultation>>;

  createLaboratoryRequest: (
    payload: CreateLaboratoryRequestPayload,
  ) => Promise<StoreResult<LaboratoryRequest>>;

  getConsultationByPatientId: (
    patientId: string,
  ) => Consultation | undefined;

  getLaboratoryRequestsByPatientId: (
    patientId: string,
  ) => LaboratoryRequest[];

  resetDoctorDemo: () => void;
};

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export const useDoctorStore = create<DoctorState>(
  (set, get) => ({
    consultations: [],
    laboratoryRequests: [],

    isSavingConsultation: false,
    isCreatingLabRequest: false,

    startConsultation: async (patientId) => {
      const patient =
        usePatientStore.getState().getPatientById(patientId);

      const currentUser = useAuthStore.getState().user;

      if (!patient) {
        return {
          success: false,
          message: 'The selected patient could not be found.',
        };
      }

      if (!currentUser) {
        return {
          success: false,
          message: 'Your hospital session has expired.',
        };
      }

      const existingConsultation =
        get().consultations.find(
          (consultation) =>
            consultation.patientId === patientId &&
            consultation.status !== 'discharged',
        );

      if (existingConsultation) {
        return {
          success: true,
          message: 'Existing consultation opened.',
          data: existingConsultation,
        };
      }

      const now = new Date().toISOString();

      const consultation: Consultation = {
        id: createId('consultation'),
        patientId,

        caseOwnerId: currentUser.id,
        caseOwnerName: currentUser.fullName,

        status: 'in_progress',

        presentingComplaint: '',
        historyOfPresentIllness: '',
        previousMedicalHistory: '',
        drugHistory: '',
        familyHistory: '',
        allergyHistory: '',

        examinationFindings: [],
        differentialDiagnoses: [],

        createdAt: now,
        updatedAt: now,
      };

      set((state) => ({
        consultations: [
          consultation,
          ...state.consultations,
        ],
      }));

      usePatientStore.setState((state) => ({
        patients: state.patients.map((item) =>
          item.id === patientId
            ? {
                ...item,
                queueStatus: 'under_consultation',
                updatedAt: now,
              }
            : item,
        ),
      }));

      return {
        success: true,
        message: 'Consultation started.',
        data: consultation,
      };
    },

    saveConsultation: async (payload) => {
      set({
        isSavingConsultation: true,
      });

      try {
        await new Promise((resolve) =>
          setTimeout(resolve, 750),
        );

        const currentUser = useAuthStore.getState().user;

        if (!currentUser) {
          return {
            success: false,
            message: 'Your hospital session has expired.',
          };
        }

        const now = new Date().toISOString();

        let consultation =
          get().getConsultationByPatientId(
            payload.patientId,
          );

        if (!consultation) {
          const startResult =
            await get().startConsultation(
              payload.patientId,
            );

          consultation = startResult.data;
        }

        if (!consultation) {
          return {
            success: false,
            message:
              'The consultation could not be created.',
          };
        }

        const updatedConsultation: Consultation = {
          ...consultation,

          presentingComplaint:
            payload.presentingComplaint.trim(),

          historyOfPresentIllness:
            payload.historyOfPresentIllness.trim(),

          previousMedicalHistory:
            payload.previousMedicalHistory?.trim() ||
            undefined,

          drugHistory:
            payload.drugHistory?.trim() || undefined,

          familyHistory:
            payload.familyHistory?.trim() || undefined,

          allergyHistory:
            payload.allergyHistory?.trim() || undefined,

          examinationFindings:
            payload.examinationFindings,

          differentialDiagnoses:
            payload.differentialDiagnoses,

          status: 'in_progress',
          updatedAt: now,
        };

        set((state) => ({
          consultations: state.consultations.map(
            (item) =>
              item.id === updatedConsultation.id
                ? updatedConsultation
                : item,
          ),
        }));

        return {
          success: true,
          message: 'Consultation saved successfully.',
          data: updatedConsultation,
        };
      } finally {
        set({
          isSavingConsultation: false,
        });
      }
    },

    createLaboratoryRequest: async (payload) => {
      set({
        isCreatingLabRequest: true,
      });

      try {
        await new Promise((resolve) =>
          setTimeout(resolve, 750),
        );

        const currentUser = useAuthStore.getState().user;

        if (!currentUser) {
          return {
            success: false,
            message: 'Your hospital session has expired.',
          };
        }

        if (!payload.tests.length) {
          return {
            success: false,
            message:
              'Select at least one laboratory investigation.',
          };
        }

        const now = new Date().toISOString();

        const request: LaboratoryRequest = {
          id: createId('lab-request'),

          patientId: payload.patientId,
          consultationId: payload.consultationId,

          requestedBy: {
            id: currentUser.id,
            fullName: currentUser.fullName,
            employeeId: currentUser.employeeId,
          },

          tests: payload.tests,

          clinicalNote:
            payload.clinicalNote?.trim() || undefined,

          priority: payload.priority,
          status: 'requested',

          requestedAt: now,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          laboratoryRequests: [
            request,
            ...state.laboratoryRequests,
          ],

          consultations: state.consultations.map(
            (consultation) =>
              consultation.id === payload.consultationId
                ? {
                    ...consultation,
                    status: 'waiting_for_lab',
                    updatedAt: now,
                  }
                : consultation,
          ),
        }));

        usePatientStore.setState((state) => ({
          patients: state.patients.map((patient) =>
            patient.id === payload.patientId
              ? {
                  ...patient,
                  queueStatus: 'waiting_for_lab',
                  updatedAt: now,
                }
              : patient,
          ),
        }));

        return {
          success: true,
          message:
            'Laboratory request submitted successfully.',
          data: request,
        };
      } finally {
        set({
          isCreatingLabRequest: false,
        });
      }
    },

    getConsultationByPatientId: (patientId) => {
      return get()
        .consultations.filter(
          (consultation) =>
            consultation.patientId === patientId,
        )
        .sort(
          (first, second) =>
            new Date(second.updatedAt).getTime() -
            new Date(first.updatedAt).getTime(),
        )[0];
    },

    getLaboratoryRequestsByPatientId: (
      patientId,
    ) => {
      return get()
        .laboratoryRequests.filter(
          (request) =>
            request.patientId === patientId,
        )
        .sort(
          (first, second) =>
            new Date(second.requestedAt).getTime() -
            new Date(first.requestedAt).getTime(),
        );
    },

    resetDoctorDemo: () => {
      set({
        consultations: [],
        laboratoryRequests: [],
        isSavingConsultation: false,
        isCreatingLabRequest: false,
      });
    },
  }),
);