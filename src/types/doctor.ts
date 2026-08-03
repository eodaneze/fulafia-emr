export type ConsultationStatus =
  | 'draft'
  | 'in_progress'
  | 'waiting_for_lab'
  | 'lab_result_ready'
  | 'waiting_for_pharmacy'
  | 'admitted'
  | 'discharged';

export type LaboratoryRequestStatus =
  | 'requested'
  | 'sample_collected'
  | 'processing'
  | 'completed'
  | 'cancelled';

export type ExaminationSystem =
  | 'general'
  | 'cardiovascular'
  | 'respiratory'
  | 'abdomen'
  | 'neurological'
  | 'musculoskeletal'
  | 'other';

export type ExaminationFinding = {
  system: ExaminationSystem;
  finding: string;
};

export type DifferentialDiagnosis = {
  id: string;
  diagnosis: string;
  isPrimary: boolean;
};

export type Consultation = {
  id: string;
  patientId: string;
  caseOwnerId: string;
  caseOwnerName: string;

  status: ConsultationStatus;

  presentingComplaint: string;
  historyOfPresentIllness: string;
  previousMedicalHistory?: string;
  drugHistory?: string;
  familyHistory?: string;
  allergyHistory?: string;

  examinationFindings: ExaminationFinding[];
  differentialDiagnoses: DifferentialDiagnosis[];

  createdAt: string;
  updatedAt: string;
};

export type LaboratoryTestOption = {
  code: string;
  name: string;
  category: string;
  specimen: string;
};

export type LaboratoryRequest = {
  id: string;
  patientId: string;
  consultationId: string;

  requestedBy: {
    id: string;
    fullName: string;
    employeeId: string;
  };

  tests: LaboratoryTestOption[];
  clinicalNote?: string;
  priority: 'routine' | 'urgent';

  status: LaboratoryRequestStatus;

  requestedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type SaveConsultationPayload = {
  patientId: string;

  presentingComplaint: string;
  historyOfPresentIllness: string;
  previousMedicalHistory?: string;
  drugHistory?: string;
  familyHistory?: string;
  allergyHistory?: string;

  examinationFindings: ExaminationFinding[];
  differentialDiagnoses: DifferentialDiagnosis[];
};

export type CreateLaboratoryRequestPayload = {
  patientId: string;
  consultationId: string;
  tests: LaboratoryTestOption[];
  clinicalNote?: string;
  priority: 'routine' | 'urgent';
};