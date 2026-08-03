import { create } from 'zustand';

import { useAuthStore } from '@/src/store/auth.store';
import { usePatientStore } from '@/src/store/patient.store';
import type {
  CreateVitalSignsPayload,
  TriageCategory,
  VitalSigns,
} from '@/src/types/nursing';

type SaveVitalSignsResult = {
  success: boolean;
  message: string;
  vitalSigns?: VitalSigns;
};

type NursingState = {
  vitalSigns: VitalSigns[];
  isSaving: boolean;

  saveVitalSigns: (
    payload: CreateVitalSignsPayload,
  ) => Promise<SaveVitalSignsResult>;

  getLatestVitalSignsForPatient: (
    patientId: string,
  ) => VitalSigns | undefined;

  getVitalSignsHistoryForPatient: (
    patientId: string,
  ) => VitalSigns[];

  resetNursingDemo: () => void;
};

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function determineAutomaticTriage(
  payload: CreateVitalSignsPayload,
): TriageCategory {
  const hasEmergencyReading =
    payload.oxygenSaturation < 90 ||
    payload.temperature >= 40 ||
    payload.systolicBloodPressure >= 180 ||
    payload.systolicBloodPressure < 80 ||
    payload.pulseRate >= 140 ||
    payload.pulseRate < 40 ||
    payload.respiratoryRate >= 35 ||
    payload.consciousnessLevel === 'unresponsive';

  if (hasEmergencyReading) {
    return 'emergency';
  }

  const hasUrgentReading =
    payload.oxygenSaturation < 94 ||
    payload.temperature >= 39 ||
    payload.systolicBloodPressure >= 160 ||
    payload.systolicBloodPressure < 90 ||
    payload.pulseRate >= 120 ||
    payload.pulseRate < 50 ||
    payload.respiratoryRate >= 28 ||
    payload.painScore >= 8 ||
    payload.consciousnessLevel === 'responds_to_pain';

  if (hasUrgentReading) {
    return 'urgent';
  }

  const hasPriorityReading =
    payload.temperature >= 37.8 ||
    payload.systolicBloodPressure >= 140 ||
    payload.pulseRate >= 100 ||
    payload.respiratoryRate >= 22 ||
    payload.painScore >= 5 ||
    payload.consciousnessLevel === 'responds_to_voice';

  if (hasPriorityReading) {
    return 'priority';
  }

  return payload.triageCategory;
}

export const useNursingStore = create<NursingState>(
  (set, get) => ({
    vitalSigns: [],
    isSaving: false,

    saveVitalSigns: async (payload) => {
      set({
        isSaving: true,
      });

      try {
        await new Promise((resolve) =>
          setTimeout(resolve, 900),
        );

        const patient =
          usePatientStore
            .getState()
            .getPatientById(payload.patientId);

        if (!patient) {
          return {
            success: false,
            message:
              'The selected patient record could not be found.',
          };
        }

        const currentUser = useAuthStore.getState().user;

        if (!currentUser) {
          return {
            success: false,
            message:
              'Your hospital session has expired. Sign in again.',
          };
        }

        const now = new Date().toISOString();

        const finalTriageCategory =
          determineAutomaticTriage(payload);

        const vitalSigns: VitalSigns = {
          id: createId('vitals'),
          patientId: patient.id,
          clinicalVisitId: createId('visit'),

          systolicBloodPressure:
            payload.systolicBloodPressure,

          diastolicBloodPressure:
            payload.diastolicBloodPressure,

          pulseRate: payload.pulseRate,
          temperature: payload.temperature,
          respiratoryRate: payload.respiratoryRate,
          oxygenSaturation: payload.oxygenSaturation,
          weight: payload.weight,
          height: payload.height,
          painScore: payload.painScore,

          triageCategory: finalTriageCategory,

          consciousnessLevel:
            payload.consciousnessLevel,

          presentingComplaint:
            payload.presentingComplaint?.trim() ||
            undefined,

          nursingNote:
            payload.nursingNote?.trim() || undefined,

          recordedBy: {
            id: currentUser.id,
            fullName: currentUser.fullName,
            employeeId: currentUser.employeeId,
          },

          recordedAt: now,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          vitalSigns: [
            vitalSigns,
            ...state.vitalSigns,
          ],
        }));

        usePatientStore.setState((state) => ({
          patients: state.patients.map((item) =>
            item.id === patient.id
              ? {
                  ...item,
                  queueStatus: 'waiting_for_doctor',
                  updatedAt: now,
                  lastVisitAt: now,
                }
              : item,
          ),
        }));

        return {
          success: true,
          message:
            'Vital signs recorded successfully. The patient has been moved to the doctor queue.',
          vitalSigns,
        };
      } catch {
        return {
          success: false,
          message:
            'The nursing assessment could not be saved. Please try again.',
        };
      } finally {
        set({
          isSaving: false,
        });
      }
    },

    getLatestVitalSignsForPatient: (patientId) => {
      return get()
        .vitalSigns.filter(
          (item) => item.patientId === patientId,
        )
        .sort(
          (first, second) =>
            new Date(second.recordedAt).getTime() -
            new Date(first.recordedAt).getTime(),
        )[0];
    },

    getVitalSignsHistoryForPatient: (patientId) => {
      return get()
        .vitalSigns.filter(
          (item) => item.patientId === patientId,
        )
        .sort(
          (first, second) =>
            new Date(second.recordedAt).getTime() -
            new Date(first.recordedAt).getTime(),
        );
    },

    resetNursingDemo: () => {
      set({
        vitalSigns: [],
        isSaving: false,
      });
    },
  }),
);