import { create } from 'zustand';

import { useAuthStore } from '@/src/store/auth.store';
import { usePatientStore } from '@/src/store/patient.store';
import type {
  CompleteDoctorReviewPayload,
  Consultation,
  CreateLaboratoryRequestPayload,
  CreatePrescriptionPayload,
  LaboratoryRequest,
  Prescription,
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
  prescriptions: Prescription[];

  isSavingConsultation: boolean;
  isCreatingLabRequest: boolean;
  isCompletingReview: boolean;
  isCreatingPrescription: boolean;

  startConsultation: (
    patientId: string,
  ) => Promise<StoreResult<Consultation>>;

  saveConsultation: (
    payload: SaveConsultationPayload,
  ) => Promise<StoreResult<Consultation>>;

  createLaboratoryRequest: (
    payload: CreateLaboratoryRequestPayload,
  ) => Promise<StoreResult<LaboratoryRequest>>;

  completeDoctorReview: (
    payload: CompleteDoctorReviewPayload,
  ) => Promise<StoreResult<Consultation>>;

  createPrescription: (
    payload: CreatePrescriptionPayload,
  ) => Promise<StoreResult<Prescription>>;

  getConsultationByPatientId: (
    patientId: string,
  ) => Consultation | undefined;

  getLaboratoryRequestsByPatientId: (
    patientId: string,
  ) => LaboratoryRequest[];

  getPrescriptionByPatientId: (
    patientId: string,
  ) => Prescription | undefined;

  getPrescriptionsByPatientId: (
    patientId: string,
  ) => Prescription[];

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
    prescriptions: [],

    isSavingConsultation: false,
    isCreatingLabRequest: false,
    isCompletingReview: false,
    isCreatingPrescription: false,

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
        previousMedicalHistory: undefined,
        drugHistory: undefined,
        familyHistory: undefined,
        allergyHistory: undefined,

        examinationFindings: [],
        differentialDiagnoses: [],

        definitiveDiagnosis: undefined,
        disposition: 'undecided',
        reviewNote: undefined,

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
      } catch {
        return {
          success: false,
          message:
            'The consultation could not be saved.',
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
          get().consultations.find(
            (item) =>
              item.id === payload.consultationId,
          );

        if (!consultation) {
          return {
            success: false,
            message:
              'The active consultation could not be found.',
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
            (item) =>
              item.id === payload.consultationId
                ? {
                    ...item,
                    status: 'waiting_for_lab',
                    updatedAt: now,
                  }
                : item,
          ),
        }));

        usePatientStore.setState((state) => ({
          patients: state.patients.map((item) =>
            item.id === payload.patientId
              ? {
                  ...item,
                  queueStatus: 'waiting_for_lab',
                  updatedAt: now,
                }
              : item,
          ),
        }));

        return {
          success: true,
          message:
            'Laboratory request submitted successfully.',
          data: request,
        };
      } catch {
        return {
          success: false,
          message:
            'The laboratory request could not be submitted.',
        };
      } finally {
        set({
          isCreatingLabRequest: false,
        });
      }
    },

    completeDoctorReview: async (payload) => {
      set({
        isCompletingReview: true,
      });

      try {
        await new Promise((resolve) =>
          setTimeout(resolve, 700),
        );

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
          get().consultations.find(
            (item) =>
              item.id === payload.consultationId,
          );

        if (!consultation) {
          return {
            success: false,
            message:
              'The active consultation could not be found.',
          };
        }

        if (!payload.definitiveDiagnosis.trim()) {
          return {
            success: false,
            message:
              'Enter the definitive diagnosis before completing the review.',
          };
        }

        if (
          payload.disposition !== 'outpatient' &&
          payload.disposition !== 'admission'
        ) {
          return {
            success: false,
            message:
              'Select outpatient treatment or admission.',
          };
        }

        const now = new Date().toISOString();

        const updatedConsultation: Consultation = {
          ...consultation,

          definitiveDiagnosis:
            payload.definitiveDiagnosis.trim(),

          disposition: payload.disposition,

          reviewNote:
            payload.reviewNote?.trim() || undefined,

          status:
            payload.disposition === 'admission'
              ? 'admitted'
              : 'in_progress',

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

        if (payload.disposition === 'admission') {
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
        }

        return {
          success: true,
          message:
            payload.disposition === 'admission'
              ? 'Doctor review completed. The patient is ready for ward admission.'
              : 'Doctor review completed. You can now create the outpatient prescription.',
          data: updatedConsultation,
        };
      } catch {
        return {
          success: false,
          message:
            'The doctor review could not be completed.',
        };
      } finally {
        set({
          isCompletingReview: false,
        });
      }
    },

    createPrescription: async (payload) => {
      set({
        isCreatingPrescription: true,
      });

      try {
        await new Promise((resolve) =>
          setTimeout(resolve, 800),
        );

        const currentUser =
          useAuthStore.getState().user;

        if (!currentUser) {
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
          get().consultations.find(
            (item) =>
              item.id === payload.consultationId,
          );

        if (!consultation) {
          return {
            success: false,
            message:
              'The active consultation could not be found.',
          };
        }

        if (!payload.definitiveDiagnosis.trim()) {
          return {
            success: false,
            message:
              'Enter the definitive diagnosis.',
          };
        }

        if (payload.disposition !== 'outpatient') {
          return {
            success: false,
            message:
              'Only outpatient cases can be sent to the pharmacy queue from this screen.',
          };
        }

        if (!payload.items.length) {
          return {
            success: false,
            message:
              'Add at least one medication to the prescription.',
          };
        }

        const invalidItem = payload.items.find(
          (item) =>
            !item.drugName.trim() ||
            !item.strength.trim() ||
            !item.dose.trim() ||
            !item.duration.trim() ||
            item.quantity <= 0,
        );

        if (invalidItem) {
          return {
            success: false,
            message:
              'Complete the drug name, strength, dose, duration and quantity for every medication.',
          };
        }

        const now = new Date().toISOString();

        const prescription: Prescription = {
          id: createId('prescription'),

          patientId: payload.patientId,
          consultationId: payload.consultationId,

          definitiveDiagnosis:
            payload.definitiveDiagnosis.trim(),

          disposition: payload.disposition,

          items: payload.items.map((item) => ({
            ...item,

            drugName: item.drugName.trim(),
            strength: item.strength.trim(),
            dose: item.dose.trim(),
            duration: item.duration.trim(),

            customFrequency:
              item.customFrequency?.trim() ||
              undefined,

            instruction:
              item.instruction?.trim() || undefined,

            dispensedQuantity: 0,
            dispensingStatus: 'pending',
          })),

          generalInstruction:
            payload.generalInstruction?.trim() ||
            undefined,

          prescribedBy: {
            id: currentUser.id,
            fullName: currentUser.fullName,
            employeeId: currentUser.employeeId,
          },

          status: 'pending',

          prescribedAt: now,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          prescriptions: [
            prescription,
            ...state.prescriptions,
          ],

          consultations: state.consultations.map(
            (item) =>
              item.id === payload.consultationId
                ? {
                    ...item,

                    definitiveDiagnosis:
                      payload.definitiveDiagnosis.trim(),

                    disposition: payload.disposition,
                    status: 'waiting_for_pharmacy',
                    updatedAt: now,
                  }
                : item,
          ),
        }));

        usePatientStore.setState((state) => ({
          patients: state.patients.map((item) =>
            item.id === payload.patientId
              ? {
                  ...item,
                  queueStatus:
                    'waiting_for_pharmacy',
                  updatedAt: now,
                }
              : item,
          ),
        }));

        return {
          success: true,
          message:
            'Prescription submitted successfully and sent to the pharmacy queue.',
          data: prescription,
        };
      } catch {
        return {
          success: false,
          message:
            'The prescription could not be created.',
        };
      } finally {
        set({
          isCreatingPrescription: false,
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

    getPrescriptionByPatientId: (patientId) => {
      return get()
        .prescriptions.filter(
          (prescription) =>
            prescription.patientId === patientId,
        )
        .sort(
          (first, second) =>
            new Date(second.prescribedAt).getTime() -
            new Date(first.prescribedAt).getTime(),
        )[0];
    },

    getPrescriptionsByPatientId: (patientId) => {
      return get()
        .prescriptions.filter(
          (prescription) =>
            prescription.patientId === patientId,
        )
        .sort(
          (first, second) =>
            new Date(second.prescribedAt).getTime() -
            new Date(first.prescribedAt).getTime(),
        );
    },

    resetDoctorDemo: () => {
      set({
        consultations: [],
        laboratoryRequests: [],
        prescriptions: [],

        isSavingConsultation: false,
        isCreatingLabRequest: false,
        isCompletingReview: false,
        isCreatingPrescription: false,
      });
    },
  }),
);