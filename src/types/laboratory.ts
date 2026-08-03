import type {
  LaboratoryRequest,
  LaboratoryTestOption,
} from '@/src/types/doctor';

export type LaboratoryResultStatus =
  | 'draft'
  | 'completed'
  | 'validated';

export type LaboratoryFindingStatus =
  | 'normal'
  | 'abnormal'
  | 'critical'
  | 'positive'
  | 'negative';

export type SpecimenCollectionStatus =
  | 'not_collected'
  | 'collected'
  | 'rejected';

export type LaboratoryTestResult = {
  id: string;
  testCode: string;
  testName: string;

  finding: string;
  result: string;
  unit?: string;
  referenceRange?: string;
  comment?: string;

  findingStatus: LaboratoryFindingStatus;
};

export type LaboratoryResult = {
  id: string;
  requestId: string;
  patientId: string;
  consultationId: string;

  specimenCollectionStatus: SpecimenCollectionStatus;
  specimenCollectedAt?: string;

  results: LaboratoryTestResult[];

  status: LaboratoryResultStatus;

  completedBy?: {
    id: string;
    fullName: string;
    employeeId: string;
  };

  validatedBy?: {
    id: string;
    fullName: string;
    employeeId: string;
  };

  completedAt?: string;
  validatedAt?: string;

  createdAt: string;
  updatedAt: string;
};

export type SaveLaboratoryResultPayload = {
  request: LaboratoryRequest;
  results: LaboratoryTestResult[];
};

export type LaboratoryRequestWithResult = {
  request: LaboratoryRequest;
  result?: LaboratoryResult;
};

export type LaboratoryTestResultForm = {
  test: LaboratoryTestOption;

  finding: string;
  result: string;
  unit: string;
  referenceRange: string;
  comment: string;

  findingStatus: LaboratoryFindingStatus;
};