import { create } from 'zustand';

import { initialHospitalStaff } from '@/src/constants/hr-staff';
import type {
  CreateHospitalStaffPayload,
  HospitalStaff,
} from '@/src/types/hr';

type HrActionResult<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type HrState = {
  staff: HospitalStaff[];

  isCreatingStaff: boolean;

  createStaff: (
    payload: CreateHospitalStaffPayload,
  ) => Promise<HrActionResult<HospitalStaff>>;

  getStaffById: (
    staffId: string,
  ) => HospitalStaff | undefined;

  resetHrDemo: () => void;
};

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export const useHrStore = create<HrState>(
  (set, get) => ({
    staff: initialHospitalStaff,

    isCreatingStaff: false,

    createStaff: async (payload) => {
      set({
        isCreatingStaff: true,
      });

      try {
        await new Promise((resolve) =>
          setTimeout(resolve, 750),
        );

        if (!payload.fullName.trim()) {
          return {
            success: false,
            message: 'Enter the staff member’s full name.',
          };
        }

        if (!payload.employeeId.trim()) {
          return {
            success: false,
            message: 'Enter the employee ID.',
          };
        }

        const existingEmployee = get().staff.find(
          (staff) =>
            staff.employeeId.toLowerCase() ===
            payload.employeeId.trim().toLowerCase(),
        );

        if (existingEmployee) {
          return {
            success: false,
            message:
              'A staff member already uses this employee ID.',
          };
        }

        if (
          !payload.phoneNumber.trim() ||
          !payload.email.trim()
        ) {
          return {
            success: false,
            message:
              'Enter the staff phone number and email address.',
          };
        }

        const now = new Date().toISOString();

        const staff: HospitalStaff = {
          id: createId('hospital-staff'),

          fullName: payload.fullName.trim(),
          employeeId: payload.employeeId
            .trim()
            .toUpperCase(),

          role: payload.role,
          department: payload.department.trim(),
          designation: payload.designation.trim(),

          specialty:
            payload.specialty?.trim() || undefined,

          employmentDate: payload.employmentDate,
          employmentStatus: payload.employmentStatus,

          phoneNumber: payload.phoneNumber.trim(),
          email: payload.email.trim().toLowerCase(),
          address: payload.address.trim(),

          salaryGrade: payload.salaryGrade.trim(),

          nextOfKin: {
            fullName:
              payload.nextOfKinName.trim(),

            relationship:
              payload.nextOfKinRelationship.trim(),

            phoneNumber:
              payload.nextOfKinPhoneNumber.trim(),
          },

          qualifications: [],
          promotionHistory: [],

          attendanceStatus: 'off_duty',
          currentShift: 'off_duty',

          leaveStatus: 'none',
          leaveBalance: 30,

          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          staff: [staff, ...state.staff],
        }));

        return {
          success: true,
          message:
            'Staff record created successfully.',
          data: staff,
        };
      } catch {
        return {
          success: false,
          message:
            'The staff record could not be created.',
        };
      } finally {
        set({
          isCreatingStaff: false,
        });
      }
    },

    getStaffById: (staffId) => {
      return get().staff.find(
        (staff) => staff.id === staffId,
      );
    },

    resetHrDemo: () => {
      set({
        staff: initialHospitalStaff,
        isCreatingStaff: false,
      });
    },
  }),
);