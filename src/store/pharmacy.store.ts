import { create } from 'zustand';

import { useAuthStore } from '@/src/store/auth.store';
import { useDoctorStore } from '@/src/store/doctor.store';
import { usePatientStore } from '@/src/store/patient.store';
import type {
  DispensePrescriptionPayload,
  PharmacyDispensingRecord,
} from '@/src/types/pharmacy';

type PharmacyActionResult<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type PharmacyState = {
  dispensingRecords: PharmacyDispensingRecord[];

  isDispensing: boolean;

  dispensePrescription: (
    payload: DispensePrescriptionPayload,
  ) => Promise<
    PharmacyActionResult<PharmacyDispensingRecord>
  >;

  getDispensingRecordByPrescriptionId: (
    prescriptionId: string,
  ) => PharmacyDispensingRecord | undefined;

  getDispensingRecordsByPatientId: (
    patientId: string,
  ) => PharmacyDispensingRecord[];

  resetPharmacyDemo: () => void;
};

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export const usePharmacyStore = create<PharmacyState>(
  (set, get) => ({
    dispensingRecords: [],
    isDispensing: false,

    dispensePrescription: async (payload) => {
      set({
        isDispensing: true,
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

        if (!payload.items.length) {
          return {
            success: false,
            message:
              'The prescription does not contain any medication.',
          };
        }

        const incompleteItem = payload.items.find(
          (item) => {
            if (item.status === 'out_of_stock') {
              return false;
            }

            return (
              item.dispensedQuantity < 0 ||
              item.dispensedQuantity >
                item.prescribedQuantity
            );
          },
        );

        if (incompleteItem) {
          return {
            success: false,
            message: `Enter a valid dispensed quantity for ${incompleteItem.drugName}.`,
          };
        }

        const allDispensed = payload.items.every(
          (item) =>
            item.status === 'dispensed' &&
            item.dispensedQuantity ===
              item.prescribedQuantity,
        );

        const allOutOfStock = payload.items.every(
          (item) => item.status === 'out_of_stock',
        );

        const finalStatus = allDispensed
          ? 'dispensed'
          : allOutOfStock
            ? 'out_of_stock'
            : 'partially_dispensed';

        const now = new Date().toISOString();

        const existingRecord =
          get().getDispensingRecordByPrescriptionId(
            payload.prescription.id,
          );

        const dispensingRecord: PharmacyDispensingRecord = {
          id:
            existingRecord?.id ??
            createId('pharmacy-dispensing'),

          prescriptionId: payload.prescription.id,
          patientId: payload.prescription.patientId,

          consultationId:
            payload.prescription.consultationId,

          items: payload.items,

          status: finalStatus,

          generalComment:
            payload.generalComment?.trim() ||
            undefined,

          dispensedBy: {
            id: currentUser.id,
            fullName: currentUser.fullName,
            employeeId: currentUser.employeeId,
          },

          dispensedAt: now,

          createdAt:
            existingRecord?.createdAt ?? now,

          updatedAt: now,
        };

        set((state) => ({
          dispensingRecords: existingRecord
            ? state.dispensingRecords.map(
                (record) =>
                  record.id === dispensingRecord.id
                    ? dispensingRecord
                    : record,
              )
            : [
                dispensingRecord,
                ...state.dispensingRecords,
              ],
        }));

        useDoctorStore.setState((state) => ({
          prescriptions: state.prescriptions.map(
            (prescription) =>
              prescription.id ===
              payload.prescription.id
                ? {
                    ...prescription,

                    status: finalStatus,

                    items: prescription.items.map(
                      (prescriptionItem) => {
                        const dispensingItem =
                          payload.items.find(
                            (item) =>
                              item.prescriptionItemId ===
                              prescriptionItem.id,
                          );

                        if (!dispensingItem) {
                          return prescriptionItem;
                        }

                        return {
                          ...prescriptionItem,

                          dispensedQuantity:
                            dispensingItem.dispensedQuantity,

                          dispensingStatus:
                            dispensingItem.status,
                        };
                      },
                    ),

                    updatedAt: now,
                  }
                : prescription,
          ),
        }));

        usePatientStore.setState((state) => ({
          patients: state.patients.map((patient) =>
            patient.id ===
            payload.prescription.patientId
              ? {
                  ...patient,

                  queueStatus:
                    finalStatus === 'dispensed'
                      ? 'discharged'
                      : 'waiting_for_pharmacy',

                  updatedAt: now,
                }
              : patient,
          ),
        }));

        return {
          success: true,

          message:
            finalStatus === 'dispensed'
              ? 'All medications were dispensed successfully. The update has been returned to the doctor.'
              : finalStatus === 'out_of_stock'
                ? 'All prescribed medications are out of stock. The doctor has been notified.'
                : 'The prescription was partially dispensed. The update has been returned to the doctor.',

          data: dispensingRecord,
        };
      } catch {
        return {
          success: false,
          message:
            'The prescription could not be dispensed.',
        };
      } finally {
        set({
          isDispensing: false,
        });
      }
    },

    getDispensingRecordByPrescriptionId: (
      prescriptionId,
    ) => {
      return get().dispensingRecords.find(
        (record) =>
          record.prescriptionId === prescriptionId,
      );
    },

    getDispensingRecordsByPatientId: (
      patientId,
    ) => {
      return get()
        .dispensingRecords.filter(
          (record) =>
            record.patientId === patientId,
        )
        .sort(
          (first, second) =>
            new Date(second.updatedAt).getTime() -
            new Date(first.updatedAt).getTime(),
        );
    },

    resetPharmacyDemo: () => {
      set({
        dispensingRecords: [],
        isDispensing: false,
      });
    },
  }),
);