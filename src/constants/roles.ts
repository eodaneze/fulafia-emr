import type { DemoAccount, UserRole } from '@/src/types/auth';

export type RoleOption = {
  value: UserRole;
  label: string;
  shortLabel: string;
  department: string;
  icon:
    | 'shield-checkmark-outline'
    | 'analytics-outline'
    | 'folder-open-outline'
    | 'medkit-outline'
    | 'bed-outline'
    | 'medical-outline'
    | 'flask-outline'
    | 'bandage-outline'
    | 'receipt-outline'
    | 'people-outline'
    | 'leaf-outline'
    | 'cube-outline';
};

export const roleOptions: RoleOption[] = [
  {
    value: 'administrator',
    label: 'Administrator',
    shortLabel: 'Administrator',
    department: 'System Administration',
    icon: 'shield-checkmark-outline',
  },
  {
    value: 'director',
    label: 'Director',
    shortLabel: 'Director',
    department: 'Executive Management',
    icon: 'analytics-outline',
  },
  {
    value: 'records_officer',
    label: 'Records Officer',
    shortLabel: 'Records',
    department: 'Medical Records',
    icon: 'folder-open-outline',
  },
  {
    value: 'outpatient_nurse',
    label: 'Outpatient Nurse',
    shortLabel: 'Nurse',
    department: 'Outpatient Nursing',
    icon: 'medkit-outline',
  },
  {
    value: 'ward_nurse',
    label: 'Ward Nurse',
    shortLabel: 'Ward Nurse',
    department: 'Ward',
    icon: 'bed-outline',
  },
  {
    value: 'doctor',
    label: 'Doctor',
    shortLabel: 'Doctor',
    department: 'Clinical Services',
    icon: 'medical-outline',
  },
  {
    value: 'laboratory_scientist',
    label: 'Laboratory Scientist',
    shortLabel: 'Laboratory',
    department: 'Laboratory',
    icon: 'flask-outline',
  },
  {
    value: 'pharmacist',
    label: 'Pharmacist',
    shortLabel: 'Pharmacy',
    department: 'Pharmacy',
    icon: 'bandage-outline',
  },
  {
    value: 'accounts_officer',
    label: 'Accounts Officer',
    shortLabel: 'Accounts',
    department: 'Accounts',
    icon: 'receipt-outline',
  },
  {
    value: 'human_resources',
    label: 'Human Resources',
    shortLabel: 'HR',
    department: 'Human Resources',
    icon: 'people-outline',
  },
  {
    value: 'environmental_officer',
    label: 'Environmental Officer',
    shortLabel: 'Environmental',
    department: 'Environmental Services',
    icon: 'leaf-outline',
  },
  {
    value: 'store_officer',
    label: 'Store Officer',
    shortLabel: 'Store',
    department: 'Inventory and Stores',
    icon: 'cube-outline',
  },
];

export const demoAccounts: DemoAccount[] = [
  {
    id: 'demo-admin-001',
    employeeId: 'FULCH-ADM-001',
    fullName: 'Grace Ahmed',
    email: 'admin@fulafia-hospital.local',
    password: 'password',
    role: 'administrator',
    department: 'System Administration',
    designation: 'System Administrator',
  },
  {
    id: 'demo-director-001',
    employeeId: 'FULCH-DIR-001',
    fullName: 'Professor Musa Abdullahi',
    email: 'director@fulafia-hospital.local',
    password: 'password',
    role: 'director',
    department: 'Executive Management',
    designation: 'Hospital Director',
  },
  {
    id: 'demo-records-001',
    employeeId: 'FULCH-REC-001',
    fullName: 'Mary Joseph',
    email: 'records@fulafia-hospital.local',
    password: 'password',
    role: 'records_officer',
    department: 'Medical Records',
    designation: 'Records Officer',
  },
  {
    id: 'demo-nurse-001',
    employeeId: 'FULCH-NUR-001',
    fullName: 'Nurse Ruth David',
    email: 'nurse@fulafia-hospital.local',
    password: 'password',
    role: 'outpatient_nurse',
    department: 'Outpatient Nursing',
    designation: 'Outpatient Nurse',
  },
  
  {
    id: 'staff-ward-nurse-001',
    employeeId: 'FULCH-WARD-001',
    fullName: 'Nurse Grace John',
    email: 'ward-nurse@fulafia-hospital.local',
    password: 'password',
    role: 'ward_nurse',
    department: 'Ward Nursing',
    designation: 'Ward Nurse',
  },
  {
    id: 'staff-doctor-001',
    employeeId: 'FULCH-DOC-001',
    fullName: 'Dr. Sarah Emmanuel',
    email: 'doctor@fulafia-hospital.local',
    password: 'password',
    role: 'doctor',
    department: 'Clinical Services',
    designation: 'Medical Officer',
  },
  {
    id: 'demo-doctor-001',
    employeeId: 'FULCH-DOC-001',
    fullName: 'Dr. Sarah Emmanuel',
    email: 'doctor@fulafia-hospital.local',
    password: 'password',
    role: 'doctor',
    department: 'Clinical Services',
    designation: 'Medical Officer',
  },
  {
    id: 'demo-lab-001',
    employeeId: 'FULCH-LAB-001',
    fullName: 'Samuel Adamu',
    email: 'laboratory@fulafia-hospital.local',
    password: 'password',
    role: 'laboratory_scientist',
    department: 'Laboratory',
    designation: 'Laboratory Scientist',
  },
  {
    id: 'demo-pharmacy-001',
    employeeId: 'FULCH-PHA-001',
    fullName: 'Pharm. Blessing James',
    email: 'pharmacy@fulafia-hospital.local',
    password: 'password',
    role: 'pharmacist',
    department: 'Pharmacy',
    designation: 'Pharmacist',
  },
  {
     id: 'staff-human-resources-001',
     employeeId: 'FULCH-HR-001',
     fullName: 'Mrs. Mary Adamu',
     email: 'human-resources@fulafia-hospital.local',
     password: 'password',
     role: 'human_resources',
     department: 'Human Resources',
    designation: 'Human Resources Officer',
  },
];

const fallbackRoleOption: RoleOption = {
  value: 'administrator',
  label: 'Administrator',
  shortLabel: 'Administrator',
  department: 'System Administration',
  icon: 'shield-checkmark-outline',
};

export function getRoleOption(role: UserRole): RoleOption {
  return (
    roleOptions.find((item) => item.value === role) ??
    fallbackRoleOption
  );
}