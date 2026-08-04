import type { UserRole } from '@/src/types/auth';

export type EmploymentStatus =
  | 'active'
  | 'probation'
  | 'suspended'
  | 'retired'
  | 'resigned';

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'off_duty'
  | 'on_leave';

export type LeaveStatus =
  | 'none'
  | 'pending'
  | 'approved'
  | 'rejected';

export type StaffShift =
  | 'morning'
  | 'afternoon'
  | 'night'
  | 'on_call'
  | 'off_duty';

export type StaffQualification = {
  id: string;
  qualification: string;
  institution: string;
  yearObtained: number;
};

export type PromotionRecord = {
  id: string;
  previousDesignation: string;
  newDesignation: string;
  previousSalaryGrade: string;
  newSalaryGrade: string;
  effectiveDate: string;
};

export type HospitalStaff = {
  id: string;

  fullName: string;
  employeeId: string;

  role: UserRole;
  department: string;
  designation: string;
  specialty?: string;

  employmentDate: string;
  employmentStatus: EmploymentStatus;

  phoneNumber: string;
  email: string;
  address: string;

  salaryGrade: string;

  nextOfKin: {
    fullName: string;
    relationship: string;
    phoneNumber: string;
  };

  qualifications: StaffQualification[];
  promotionHistory: PromotionRecord[];

  attendanceStatus: AttendanceStatus;
  currentShift: StaffShift;

  leaveStatus: LeaveStatus;
  leaveBalance: number;

  callDutyDate?: string;

  createdAt: string;
  updatedAt: string;
};

export type CreateHospitalStaffPayload = {
  fullName: string;
  employeeId: string;

  role: UserRole;
  department: string;
  designation: string;
  specialty?: string;

  employmentDate: string;
  employmentStatus: EmploymentStatus;

  phoneNumber: string;
  email: string;
  address: string;

  salaryGrade: string;

  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinPhoneNumber: string;
};