export type UserRole =
  | 'administrator'
  | 'director'
  | 'records_officer'
  | 'outpatient_nurse'
  | 'ward_nurse'
  | 'doctor'
  | 'laboratory_scientist'
  | 'pharmacist'
  | 'accounts_officer'
  | 'human_resources'
  | 'environmental_officer'
  | 'store_officer';

export type AuthUser = {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
  designation: string;
  avatarUrl?: string;
};

export type DemoAccount = AuthUser & {
  password: string;
};

export type LoginPayload = {
  employeeId: string;
  password: string;
  role: UserRole;
};