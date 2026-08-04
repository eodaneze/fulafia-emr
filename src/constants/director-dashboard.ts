import type {
  DailyVisitRecord,
  DepartmentActivity,
  EquipmentSummary,
  ExecutiveAlert,
  StaffAvailability,
} from '@/src/types/director';

export const weeklyPatientVisits: DailyVisitRecord[] = [
  {
    day: 'Mon',
    visits: 68,
  },
  {
    day: 'Tue',
    visits: 84,
  },
  {
    day: 'Wed',
    visits: 74,
  },
  {
    day: 'Thu',
    visits: 96,
  },
  {
    day: 'Fri',
    visits: 88,
  },
  {
    day: 'Sat',
    visits: 52,
  },
  {
    day: 'Sun',
    visits: 39,
  },
];

export const departmentActivities: DepartmentActivity[] = [
  {
    id: 'department-records',
    department: 'Records',
    waiting: 4,
    completed: 38,
    total: 42,
    icon: 'folder-open-outline',
    tone: 'primary',
  },
  {
    id: 'department-nursing',
    department: 'Outpatient Nursing',
    waiting: 6,
    completed: 31,
    total: 37,
    icon: 'medkit-outline',
    tone: 'success',
  },
  {
    id: 'department-doctor',
    department: 'Doctor Consultation',
    waiting: 8,
    completed: 26,
    total: 34,
    icon: 'medical-outline',
    tone: 'warning',
  },
  {
    id: 'department-laboratory',
    department: 'Laboratory',
    waiting: 5,
    completed: 19,
    total: 24,
    icon: 'flask-outline',
    tone: 'info',
  },
  {
    id: 'department-pharmacy',
    department: 'Pharmacy',
    waiting: 7,
    completed: 23,
    total: 30,
    icon: 'bandage-outline',
    tone: 'primary',
  },
];

export const staffAvailability: StaffAvailability[] = [
  {
    role: 'doctor',
    label: 'Doctors',
    total: 18,
    available: 11,
    onDuty: 14,
    onLeave: 2,
  },
  {
    role: 'outpatient_nurse',
    label: 'Nurses',
    total: 32,
    available: 21,
    onDuty: 25,
    onLeave: 4,
  },
  {
    role: 'laboratory_scientist',
    label: 'Laboratory Scientists',
    total: 8,
    available: 5,
    onDuty: 6,
    onLeave: 1,
  },
  {
    role: 'pharmacist',
    label: 'Pharmacists',
    total: 7,
    available: 4,
    onDuty: 5,
    onLeave: 1,
  },
];

export const equipmentSummary: EquipmentSummary = {
  working: 68,
  underRepair: 5,
  maintenanceDue: 7,
  retired: 3,
};

export const executiveAlerts: ExecutiveAlert[] = [
  {
    id: 'alert-lab',
    title: 'Urgent laboratory requests',
    description:
      'Three urgent investigations are awaiting processing.',
    time: '8 minutes ago',
    severity: 'critical',
    icon: 'flask-outline',
  },
  {
    id: 'alert-bed',
    title: 'Observation ward occupancy',
    description:
      'Only one bed remains available in the observation ward.',
    time: '21 minutes ago',
    severity: 'warning',
    icon: 'bed-outline',
  },
  {
    id: 'alert-equipment',
    title: 'Equipment maintenance due',
    description:
      'Seven hospital assets are due for scheduled maintenance.',
    time: '1 hour ago',
    severity: 'warning',
    icon: 'construct-outline',
  },
  {
    id: 'alert-staff',
    title: 'Night shift roster updated',
    description:
      'The ward nursing night-duty roster was updated successfully.',
    time: '2 hours ago',
    severity: 'information',
    icon: 'people-outline',
  },
];