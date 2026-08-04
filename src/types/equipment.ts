export type EquipmentStatus =
  | 'working'
  | 'under_repair'
  | 'maintenance_due'
  | 'retired';

export type HospitalEquipment = {
  id: string;

  name: string;
  serialNumber: string;
  category: string;

  department: string;
  assignedOfficer: string;
  location: string;

  purchaseDate: string;
  warrantyExpiry?: string;

  lastMaintenanceDate?: string;
  nextServiceDate?: string;

  status: EquipmentStatus;

  notes?: string;

  createdAt: string;
  updatedAt: string;
};

export type CreateEquipmentPayload = {
  name: string;
  serialNumber: string;
  category: string;

  department: string;
  assignedOfficer: string;
  location: string;

  purchaseDate: string;
  warrantyExpiry?: string;

  lastMaintenanceDate?: string;
  nextServiceDate?: string;

  status: EquipmentStatus;

  notes?: string;
};