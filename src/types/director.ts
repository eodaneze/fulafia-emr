import type {
  UserRole,
} from '@/src/types/auth';

export type ExecutiveMetricTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export type ExecutiveMetric = {
  id: string;
  label: string;
  value: string;
  change?: string;
  description: string;
  icon: string;
  tone: ExecutiveMetricTone;
};

export type DailyVisitRecord = {
  day: string;
  visits: number;
};

export type DepartmentActivity = {
  id: string;
  department: string;
  waiting: number;
  completed: number;
  total: number;
  icon: string;
  tone: ExecutiveMetricTone;
};

export type StaffAvailability = {
  role: UserRole;
  label: string;
  total: number;
  available: number;
  onDuty: number;
  onLeave: number;
};

export type EquipmentSummary = {
  working: number;
  underRepair: number;
  maintenanceDue: number;
  retired: number;
};

export type ExecutiveAlert = {
  id: string;
  title: string;
  description: string;
  time: string;
  severity: 'information' | 'warning' | 'critical';
  icon: string;
};