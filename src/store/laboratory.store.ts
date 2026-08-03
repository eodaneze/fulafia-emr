import { create } from 'zustand';

import { useAuthStore } from '@/src/store/auth.store';
import { useDoctorStore } from '@/src/store/doctor.store';
import { usePatientStore } from '@/src/store/patient.store';
import type {
  LaboratoryResult,
  LaboratoryTestResult,
  SaveLaboratoryResultPayload,
} from '@/src/types/laboratory';

type LaboratoryActionResult<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type LaboratoryState = {
  laboratoryResults: LaboratoryResult[];

  isCollectingSpecimen: boolean;
  isSavingResults: boolean;
  isValidatingResults: boolean;

  collectSpecimen: (
    requestId: string,
  ) => Promise<LaboratoryActionResult<LaboratoryResult>>;

  saveDraftResults: (
    payload: SaveLaboratoryResultPayload,
  ) => Promise<LaboratoryActionResult<LaboratoryResult>>;

  completeAndValidateResults: (
    payload: SaveLaboratoryResultPayload,
  ) => Promise<LaboratoryActionResult<LaboratoryResult>>;

  getResultByRequestId: (
    requestId: string,
  ) => LaboratoryResult | undefined;

  getResultsByPatientId: (
    patientId: string,
  ) => LaboratoryResult[];

  resetLaboratoryDemo: () => void;
};

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function buildEmptyLaboratoryResult(
  requestId: string,
  patientId: string,
  consultationId: string,
): LaboratoryResult {
  const now = new Date().toISOString();

  return {
    id: createId('laboratory-result'),
    requestId,
    patientId,
    consultationId,

    specimenCollectionStatus: 'not_collected',

    results: [],
    status: 'draft',

    createdAt: now,
    updatedAt: now,
  };
}

export const useLaboratoryStore =
  create<LaboratoryState>((set, get) => ({
    laboratoryResults: [],

    isCollectingSpecimen: false,
    isSavingResults: false,
    isValidatingResults: false,

    collectSpecimen: async (requestId) => {
      set({
        isCollectingSpecimen: true,
      });

      try {
        await new Promise((resolve) =>
          setTimeout(resolve, 650),
        );

        const request =
          useDoctorStore
            .getState()
            .laboratoryRequests.find(
              (item) => item.id === requestId,
            );

        if (!request) {
          return {
            success: false,
            message:
              'The selected laboratory request could not be found.',
          };
        }

        const existingResult =
          get().getResultByRequestId(requestId);

        const now = new Date().toISOString();

        const result: LaboratoryResult = existingResult
          ? {
              ...existingResult,
              specimenCollectionStatus: 'collected',
              specimenCollectedAt: now,
              updatedAt: now,
            }
          : {
              ...buildEmptyLaboratoryResult(
                request.id,
                request.patientId,
                request.consultationId,
              ),
              specimenCollectionStatus: 'collected',
              specimenCollectedAt: now,
              updatedAt: now,
            };

        set((state) => ({
          laboratoryResults: existingResult
            ? state.laboratoryResults.map((item) =>
                item.id === result.id ? result : item,
              )
            : [result, ...state.laboratoryResults],
        }));

        useDoctorStore.setState((state) => ({
          laboratoryRequests:
            state.laboratoryRequests.map((item) =>
              item.id === requestId
                ? {
                    ...item,
                    status: 'sample_collected',
                    updatedAt: now,
                  }
                : item,
            ),
        }));

        return {
          success: true,
          message:
            'Specimen collection recorded successfully.',
          data: result,
        };
      } catch {
        return {
          success: false,
          message:
            'The specimen collection could not be recorded.',
        };
      } finally {
        set({
          isCollectingSpecimen: false,
        });
      }
    },

    saveDraftResults: async (payload) => {
      set({
        isSavingResults: true,
      });

      try {
        await new Promise((resolve) =>
          setTimeout(resolve, 700),
        );

        const existingResult =
          get().getResultByRequestId(
            payload.request.id,
          );

        const now = new Date().toISOString();

        const laboratoryResult: LaboratoryResult =
          existingResult
            ? {
                ...existingResult,
                results: payload.results,
                status: 'draft',
                updatedAt: now,
              }
            : {
                ...buildEmptyLaboratoryResult(
                  payload.request.id,
                  payload.request.patientId,
                  payload.request.consultationId,
                ),
                specimenCollectionStatus: 'collected',
                specimenCollectedAt: now,
                results: payload.results,
                status: 'draft',
                updatedAt: now,
              };

        set((state) => ({
          laboratoryResults: existingResult
            ? state.laboratoryResults.map((item) =>
                item.id === laboratoryResult.id
                  ? laboratoryResult
                  : item,
              )
            : [
                laboratoryResult,
                ...state.laboratoryResults,
              ],
        }));

        useDoctorStore.setState((state) => ({
          laboratoryRequests:
            state.laboratoryRequests.map((item) =>
              item.id === payload.request.id
                ? {
                    ...item,
                    status: 'processing',
                    updatedAt: now,
                  }
                : item,
            ),
        }));

        return {
          success: true,
          message:
            'Laboratory results saved as a draft.',
          data: laboratoryResult,
        };
      } catch {
        return {
          success: false,
          message:
            'The laboratory results could not be saved.',
        };
      } finally {
        set({
          isSavingResults: false,
        });
      }
    },

    completeAndValidateResults: async (payload) => {
      set({
        isValidatingResults: true,
      });

      try {
        await new Promise((resolve) =>
          setTimeout(resolve, 850),
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

        const incompleteResult =
          payload.results.find(
            (result) =>
              !result.finding.trim() ||
              !result.result.trim(),
          );

        if (incompleteResult) {
          return {
            success: false,
            message: `Complete the finding and result for ${incompleteResult.testName}.`,
          };
        }

        const existingResult =
          get().getResultByRequestId(
            payload.request.id,
          );

        const now = new Date().toISOString();

        const result: LaboratoryResult = {
          ...(existingResult ??
            buildEmptyLaboratoryResult(
              payload.request.id,
              payload.request.patientId,
              payload.request.consultationId,
            )),

          specimenCollectionStatus: 'collected',

          specimenCollectedAt:
            existingResult?.specimenCollectedAt ??
            now,

          results: payload.results,

          status: 'validated',

          completedBy: {
            id: currentUser.id,
            fullName: currentUser.fullName,
            employeeId: currentUser.employeeId,
          },

          validatedBy: {
            id: currentUser.id,
            fullName: currentUser.fullName,
            employeeId: currentUser.employeeId,
          },

          completedAt: now,
          validatedAt: now,
          updatedAt: now,
        };

        set((state) => ({
          laboratoryResults: existingResult
            ? state.laboratoryResults.map((item) =>
                item.id === result.id
                  ? result
                  : item,
              )
            : [result, ...state.laboratoryResults],
        }));

        useDoctorStore.setState((state) => ({
          laboratoryRequests:
            state.laboratoryRequests.map((item) =>
              item.id === payload.request.id
                ? {
                    ...item,
                    status: 'completed',
                    updatedAt: now,
                  }
                : item,
            ),

          consultations:
            state.consultations.map(
              (consultation) =>
                consultation.id ===
                payload.request.consultationId
                  ? {
                      ...consultation,
                      status: 'lab_result_ready',
                      updatedAt: now,
                    }
                  : consultation,
            ),
        }));

        usePatientStore.setState((state) => ({
          patients: state.patients.map((patient) =>
            patient.id === payload.request.patientId
              ? {
                  ...patient,
                  queueStatus: 'lab_result_ready',
                  updatedAt: now,
                }
              : patient,
          ),
        }));

        return {
          success: true,
          message:
            'Results validated and returned to the requesting doctor.',
          data: result,
        };
      } catch {
        return {
          success: false,
          message:
            'The results could not be completed.',
        };
      } finally {
        set({
          isValidatingResults: false,
        });
      }
    },

    getResultByRequestId: (requestId) => {
      return get().laboratoryResults.find(
        (result) => result.requestId === requestId,
      );
    },

    getResultsByPatientId: (patientId) => {
      return get()
        .laboratoryResults.filter(
          (result) =>
            result.patientId === patientId,
        )
        .sort(
          (first, second) =>
            new Date(second.updatedAt).getTime() -
            new Date(first.updatedAt).getTime(),
        );
    },

    resetLaboratoryDemo: () => {
      set({
        laboratoryResults: [],
        isCollectingSpecimen: false,
        isSavingResults: false,
        isValidatingResults: false,
      });
    },
  }));