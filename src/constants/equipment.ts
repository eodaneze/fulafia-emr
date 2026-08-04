import type { HospitalEquipment } from '@/src/types/equipment';

export const initialHospitalEquipment: HospitalEquipment[] =
  [
    {
      id: 'equipment-ecg-001',

      name: '12-Lead ECG Machine',
      serialNumber: 'FULCH-ECG-2022-001',
      category: 'Diagnostic Equipment',

      department: 'Medical Services',
      assignedOfficer: 'Dr. Amina Yusuf',
      location: 'Consultation Room 2',

      purchaseDate: '2022-03-14',
      warrantyExpiry: '2027-03-14',

      lastMaintenanceDate: '2026-06-01',
      nextServiceDate: '2026-09-01',

      status: 'working',

      createdAt: '2022-03-14T08:00:00.000Z',
      updatedAt: '2026-06-01T08:00:00.000Z',
    },

    {
      id: 'equipment-microscope-001',

      name: 'Binocular Microscope',
      serialNumber: 'FULCH-LAB-2021-004',
      category: 'Laboratory Equipment',

      department: 'Medical Laboratory',
      assignedOfficer: 'Mr. Emmanuel Danladi',
      location: 'Main Laboratory',

      purchaseDate: '2021-07-22',

      lastMaintenanceDate: '2026-04-10',
      nextServiceDate: '2026-08-10',

      status: 'maintenance_due',

      notes:
        'Routine optical calibration is required.',

      createdAt: '2021-07-22T08:00:00.000Z',
      updatedAt: '2026-04-10T08:00:00.000Z',
    },

    {
      id: 'equipment-centrifuge-001',

      name: 'Digital Centrifuge',
      serialNumber: 'FULCH-LAB-2023-002',
      category: 'Laboratory Equipment',

      department: 'Medical Laboratory',
      assignedOfficer: 'Mr. Emmanuel Danladi',
      location: 'Main Laboratory',

      purchaseDate: '2023-01-18',
      warrantyExpiry: '2026-01-18',

      lastMaintenanceDate: '2026-07-15',
      nextServiceDate: '2026-10-15',

      status: 'working',

      createdAt: '2023-01-18T08:00:00.000Z',
      updatedAt: '2026-07-15T08:00:00.000Z',
    },

    {
      id: 'equipment-bp-monitor-001',

      name: 'Digital BP Monitor',
      serialNumber: 'FULCH-NUR-2024-011',
      category: 'Monitoring Equipment',

      department: 'Outpatient Nursing',
      assignedOfficer: 'Nurse Grace John',
      location: 'Triage Bay',

      purchaseDate: '2024-02-12',
      warrantyExpiry: '2027-02-12',

      lastMaintenanceDate: '2026-05-20',
      nextServiceDate: '2026-11-20',

      status: 'working',

      createdAt: '2024-02-12T08:00:00.000Z',
      updatedAt: '2026-05-20T08:00:00.000Z',
    },

    {
      id: 'equipment-xray-001',

      name: 'Mobile X-Ray Machine',
      serialNumber: 'FULCH-RAD-2020-001',
      category: 'Radiology Equipment',

      department: 'Radiology',
      assignedOfficer: 'Mr. Musa Ibrahim',
      location: 'Radiology Unit',

      purchaseDate: '2020-09-03',

      lastMaintenanceDate: '2026-02-11',
      nextServiceDate: '2026-08-11',

      status: 'under_repair',

      notes:
        'Power-control board replacement is currently in progress.',

      createdAt: '2020-09-03T08:00:00.000Z',
      updatedAt: '2026-08-01T08:00:00.000Z',
    },

    {
      id: 'equipment-bed-001',

      name: 'Adjustable Hospital Bed',
      serialNumber: 'FULCH-WARD-2018-021',
      category: 'Ward Equipment',

      department: 'Ward Nursing',
      assignedOfficer: 'Nurse Grace John',
      location: 'Equipment Store',

      purchaseDate: '2018-05-09',

      lastMaintenanceDate: '2025-12-05',

      status: 'retired',

      notes:
        'Frame damage was identified and the bed has been removed from clinical use.',

      createdAt: '2018-05-09T08:00:00.000Z',
      updatedAt: '2026-07-29T08:00:00.000Z',
    },

    {
      id: 'equipment-oxygen-001',

      name: 'Oxygen Concentrator',
      serialNumber: 'FULCH-WARD-2023-007',
      category: 'Respiratory Equipment',

      department: 'Ward Nursing',
      assignedOfficer: 'Nurse Grace John',
      location: 'Observation Ward',

      purchaseDate: '2023-08-17',
      warrantyExpiry: '2026-08-17',

      lastMaintenanceDate: '2026-06-22',
      nextServiceDate: '2026-09-22',

      status: 'working',

      createdAt: '2023-08-17T08:00:00.000Z',
      updatedAt: '2026-06-22T08:00:00.000Z',
    },

    {
      id: 'equipment-fridge-001',

      name: 'Pharmacy Medical Refrigerator',
      serialNumber: 'FULCH-PHA-2021-003',
      category: 'Cold Chain Equipment',

      department: 'Pharmacy',
      assignedOfficer: 'Pharm. Fatima Abdullahi',
      location: 'Main Pharmacy',

      purchaseDate: '2021-11-02',

      lastMaintenanceDate: '2026-03-18',
      nextServiceDate: '2026-08-18',

      status: 'maintenance_due',

      notes:
        'Temperature sensor calibration is due.',

      createdAt: '2021-11-02T08:00:00.000Z',
      updatedAt: '2026-03-18T08:00:00.000Z',
    },
  ];