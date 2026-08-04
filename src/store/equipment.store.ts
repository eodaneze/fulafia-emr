import { create } from 'zustand';

import { initialHospitalEquipment } from '@/src/constants/equipment';
import type {
  CreateEquipmentPayload,
  HospitalEquipment,
} from '@/src/types/equipment';

type EquipmentActionResult<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type EquipmentState = {
  equipment: HospitalEquipment[];

  isCreatingEquipment: boolean;

  createEquipment: (
    payload: CreateEquipmentPayload,
  ) => Promise<
    EquipmentActionResult<HospitalEquipment>
  >;

  getEquipmentById: (
    equipmentId: string,
  ) => HospitalEquipment | undefined;

  resetEquipmentDemo: () => void;
};

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export const useEquipmentStore =
  create<EquipmentState>((set, get) => ({
    equipment: initialHospitalEquipment,

    isCreatingEquipment: false,

    createEquipment: async (payload) => {
      set({
        isCreatingEquipment: true,
      });

      try {
        await new Promise((resolve) =>
          setTimeout(resolve, 700),
        );

        if (!payload.name.trim()) {
          return {
            success: false,
            message:
              'Enter the equipment name.',
          };
        }

        if (!payload.serialNumber.trim()) {
          return {
            success: false,
            message:
              'Enter the equipment serial number.',
          };
        }

        if (!payload.category.trim()) {
          return {
            success: false,
            message:
              'Enter the equipment category.',
          };
        }

        if (!payload.department.trim()) {
          return {
            success: false,
            message:
              'Enter the department where the equipment is assigned.',
          };
        }

        if (!payload.location.trim()) {
          return {
            success: false,
            message:
              'Enter the equipment location.',
          };
        }

        if (!payload.purchaseDate.trim()) {
          return {
            success: false,
            message:
              'Enter the equipment purchase date.',
          };
        }

        const existingEquipment =
          get().equipment.find(
            (equipment) =>
              equipment.serialNumber.toLowerCase() ===
              payload.serialNumber
                .trim()
                .toLowerCase(),
          );

        if (existingEquipment) {
          return {
            success: false,
            message:
              'An equipment record already uses this serial number.',
          };
        }

        const now = new Date().toISOString();

        const equipment: HospitalEquipment = {
          id: createId('equipment'),

          name: payload.name.trim(),

          serialNumber:
            payload.serialNumber
              .trim()
              .toUpperCase(),

          category: payload.category.trim(),

          department:
            payload.department.trim(),

          assignedOfficer:
            payload.assignedOfficer.trim(),

          location: payload.location.trim(),

          purchaseDate:
            payload.purchaseDate.trim(),

          warrantyExpiry:
            payload.warrantyExpiry?.trim() ||
            undefined,

          lastMaintenanceDate:
            payload.lastMaintenanceDate?.trim() ||
            undefined,

          nextServiceDate:
            payload.nextServiceDate?.trim() ||
            undefined,

          status: payload.status,

          notes:
            payload.notes?.trim() || undefined,

          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          equipment: [
            equipment,
            ...state.equipment,
          ],
        }));

        return {
          success: true,
          message:
            'Equipment record created successfully.',
          data: equipment,
        };
      } catch {
        return {
          success: false,
          message:
            'The equipment record could not be created.',
        };
      } finally {
        set({
          isCreatingEquipment: false,
        });
      }
    },

    getEquipmentById: (equipmentId) => {
      return get().equipment.find(
        (equipment) =>
          equipment.id === equipmentId,
      );
    },

    resetEquipmentDemo: () => {
      set({
        equipment:
          initialHospitalEquipment,

        isCreatingEquipment: false,
      });
    },
  }));