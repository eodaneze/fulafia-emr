import type {
  Prescription,
  PrescriptionItem,
  PrescriptionStatus,
} from '@/src/types/doctor';

export type PharmacyDispensingItemStatus =
  | 'pending'
  | 'dispensed'
  | 'partial'
  | 'out_of_stock';

export type PharmacyDispensingItem = {
  prescriptionItemId: string;

  drugName: string;
  strength: string;
  prescribedQuantity: number;

  dispensedQuantity: number;
  status: PharmacyDispensingItemStatus;

  batchNumber?: string;
  expiryDate?: string;
  pharmacistComment?: string;
};

export type PharmacyDispensingRecord = {
  id: string;

  prescriptionId: string;
  patientId: string;
  consultationId: string;

  items: PharmacyDispensingItem[];

  status: PrescriptionStatus;

  generalComment?: string;

  dispensedBy: {
    id: string;
    fullName: string;
    employeeId: string;
  };

  dispensedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type DispensePrescriptionPayload = {
  prescription: Prescription;
  items: PharmacyDispensingItem[];
  generalComment?: string;
};

export type PharmacyPrescriptionWithRecord = {
  prescription: Prescription;
  dispensingRecord?: PharmacyDispensingRecord;
};

export type PharmacyMedicationForm = {
  item: PrescriptionItem;

  dispensedQuantity: string;
  status: PharmacyDispensingItemStatus;

  batchNumber: string;
  expiryDate: string;
  pharmacistComment: string;
};