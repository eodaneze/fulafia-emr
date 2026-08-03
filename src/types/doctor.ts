export type ConsultationStatus =
  | 'draft'
  | 'in_progress'
  | 'waiting_for_lab'
  | 'lab_result_ready'
  | 'waiting_for_pharmacy'
  | 'admitted'
  | 'discharged';

export type PatientDisposition =
  | 'undecided'
  | 'outpatient'
  | 'admission'
  | 'discharged';

export type PrescriptionStatus =
  | 'pending'
  | 'partially_dispensed'
  | 'dispensed'
  | 'out_of_stock'
  | 'cancelled';

export type MedicationFrequency =
  | 'once_daily'
  | 'twice_daily'
  | 'three_times_daily'
  | 'four_times_daily'
  | 'at_night'
  | 'when_required'
  | 'stat'
  | 'other';

export type MedicationRoute =
  | 'oral'
  | 'intravenous'
  | 'intramuscular'
  | 'subcutaneous'
  | 'topical'
  | 'inhalation'
  | 'rectal'
  | 'other';

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

  definitiveDiagnosis?: string;
  disposition: PatientDisposition;
  reviewNote?: string;

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

export type PrescriptionItem = {
  id: string;

  drugName: string;
  strength: string;
  dose: string;

  frequency: MedicationFrequency;
  customFrequency?: string;

  route: MedicationRoute;
  duration: string;
  quantity: number;

  instruction?: string;

  dispensedQuantity: number;
  dispensingStatus:
    | 'pending'
    | 'partial'
    | 'dispensed'
    | 'out_of_stock';
};

export type Prescription = {
  id: string;

  patientId: string;
  consultationId: string;

  definitiveDiagnosis: string;
  disposition: PatientDisposition;

  items: PrescriptionItem[];
  generalInstruction?: string;

  prescribedBy: {
    id: string;
    fullName: string;
    employeeId: string;
  };

  status: PrescriptionStatus;

  prescribedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type CompleteDoctorReviewPayload = {
  patientId: string;
  consultationId: string;

  definitiveDiagnosis: string;
  disposition: PatientDisposition;
  reviewNote?: string;
};

export type CreatePrescriptionPayload = {
  patientId: string;
  consultationId: string;

  definitiveDiagnosis: string;
  disposition: PatientDisposition;

  items: Omit<
    PrescriptionItem,
    'dispensedQuantity' | 'dispensingStatus'
  >[];

  generalInstruction?: string;
};