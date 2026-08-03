export type PatientSex = 'male' | 'female';

export type PatientType =
  | 'student'
  | 'staff'
  | 'dependent'
  | 'public';

export type PatientStatus =
  | 'active'
  | 'inactive'
  | 'deceased';

export type PatientQueueStatus =
  | 'not_in_queue'
  | 'waiting_for_vitals'
  | 'waiting_for_doctor'
  | 'under_consultation'
  | 'waiting_for_lab'
  | 'lab_result_ready'
  | 'waiting_for_pharmacy'
  | 'admitted'
  | 'discharged';

export type Patient = {
  id: string;
  hospitalNumber: string;
  studentRegistrationNumber?: string;
  staffNumber?: string;

  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;

  dateOfBirth: string;
  age: number;
  sex: PatientSex;
  patientType: PatientType;

  phoneNumber: string;
  email?: string;

  address: string;
  stateOfOrigin?: string;
  localGovernmentArea?: string;

  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinPhoneNumber: string;

  bloodGroup?: string;
  genotype?: string;
  allergies?: string[];

  status: PatientStatus;
  queueStatus: PatientQueueStatus;

  lastVisitAt?: string;
  totalVisits: number;

  createdAt: string;
  updatedAt: string;
};

export type CreatePatientPayload = {
  firstName: string;
  middleName?: string;
  lastName: string;

  dateOfBirth: string;
  sex: PatientSex;
  patientType: PatientType;

  studentRegistrationNumber?: string;
  staffNumber?: string;

  phoneNumber: string;
  email?: string;

  address: string;
  stateOfOrigin?: string;
  localGovernmentArea?: string;

  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinPhoneNumber: string;

  bloodGroup?: string;
  genotype?: string;
  allergies?: string[];
};

export function getPatientInitials(patient: Patient): string {
  return `${patient.firstName.charAt(0)}${patient.lastName.charAt(
    0,
  )}`.toUpperCase();
}