export type WardType =
  | 'male_medical'
  | 'female_medical'
  | 'paediatric'
  | 'maternity'
  | 'observation'
  | 'isolation';

export type BedStatus =
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'maintenance';

export type AdmissionStatus =
  | 'awaiting_bed'
  | 'admitted'
  | 'transferred'
  | 'discharged';

export type WardObservationType =
  | 'routine'
  | 'priority'
  | 'urgent';

export type FluidEntryType =
  | 'input'
  | 'output';

export type MedicationAdministrationStatus =
  | 'administered'
  | 'missed'
  | 'refused'
  | 'withheld'
  | 'not_available';

export type WardBed = {
  id: string;
  ward: WardType;
  wardName: string;
  bedNumber: string;
  status: BedStatus;
  patientId?: string;
};

export type WardAdmission = {
  id: string;
  patientId: string;
  consultationId: string;

  diagnosis: string;
  admissionNote?: string;

  ward: WardType;
  wardName: string;

  bedId: string;
  bedNumber: string;

  status: AdmissionStatus;

  admittedBy: {
    id: string;
    fullName: string;
    employeeId: string;
  };

  admittedAt: string;

  dischargedAt?: string;
  dischargeNote?: string;

  createdAt: string;
  updatedAt: string;
};

export type WardVitalSigns = {
  id: string;
  admissionId: string;
  patientId: string;

  systolicBloodPressure: number;
  diastolicBloodPressure: number;
  pulseRate: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  painScore: number;

  observationType: WardObservationType;
  note?: string;

  recordedBy: {
    id: string;
    fullName: string;
    employeeId: string;
  };

  recordedAt: string;
};

export type WardNursingNote = {
  id: string;
  admissionId: string;
  patientId: string;

  note: string;
  shift: 'morning' | 'afternoon' | 'night';

  recordedBy: {
    id: string;
    fullName: string;
    employeeId: string;
  };

  recordedAt: string;
};

export type WardFluidEntry = {
  id: string;
  admissionId: string;
  patientId: string;

  type: FluidEntryType;
  description: string;
  volume: number;
  unit: 'ml';

  recordedBy: {
    id: string;
    fullName: string;
    employeeId: string;
  };

  recordedAt: string;
};

export type WardMedicationAdministration = {
  id: string;
  admissionId: string;
  patientId: string;

  medicationName: string;
  strength?: string;
  dose: string;
  route: string;

  status: MedicationAdministrationStatus;
  comment?: string;

  scheduledAt?: string;
  administeredAt: string;

  administeredBy: {
    id: string;
    fullName: string;
    employeeId: string;
  };
};

export type AdmitPatientPayload = {
  patientId: string;
  consultationId: string;

  diagnosis: string;
  admissionNote?: string;

  bedId: string;
};

export type SaveWardVitalSignsPayload = {
  admissionId: string;
  patientId: string;

  systolicBloodPressure: number;
  diastolicBloodPressure: number;
  pulseRate: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  painScore: number;

  observationType: WardObservationType;
  note?: string;
};

export type SaveWardNursingNotePayload = {
  admissionId: string;
  patientId: string;

  note: string;
  shift: 'morning' | 'afternoon' | 'night';
};

export type SaveWardFluidEntryPayload = {
  admissionId: string;
  patientId: string;

  type: FluidEntryType;
  description: string;
  volume: number;
};

export type SaveWardMedicationPayload = {
  admissionId: string;
  patientId: string;

  medicationName: string;
  strength?: string;
  dose: string;
  route: string;

  status: MedicationAdministrationStatus;
  comment?: string;
  scheduledAt?: string;
};