export type TriageCategory =
  | 'routine'
  | 'priority'
  | 'urgent'
  | 'emergency';

export type ConsciousnessLevel =
  | 'alert'
  | 'responds_to_voice'
  | 'responds_to_pain'
  | 'unresponsive';

export type VitalSigns = {
  id: string;
  patientId: string;
  clinicalVisitId: string;

  systolicBloodPressure: number;
  diastolicBloodPressure: number;
  pulseRate: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  weight: number;
  height: number;
  painScore: number;

  triageCategory: TriageCategory;
  consciousnessLevel: ConsciousnessLevel;

  presentingComplaint?: string;
  nursingNote?: string;

  recordedBy: {
    id: string;
    fullName: string;
    employeeId: string;
  };

  recordedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateVitalSignsPayload = {
  patientId: string;

  systolicBloodPressure: number;
  diastolicBloodPressure: number;
  pulseRate: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  weight: number;
  height: number;
  painScore: number;

  triageCategory: TriageCategory;
  consciousnessLevel: ConsciousnessLevel;

  presentingComplaint?: string;
  nursingNote?: string;
};

export type VitalSignsAssessment = {
  label: string;
  status: 'normal' | 'warning' | 'critical';
  message: string;
};