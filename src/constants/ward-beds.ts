import type { WardBed } from '@/src/types/ward';

export const initialWardBeds: WardBed[] = [
  {
    id: 'bed-male-01',
    ward: 'male_medical',
    wardName: 'Male Medical Ward',
    bedNumber: 'MM-01',
    status: 'available',
  },
  {
    id: 'bed-male-02',
    ward: 'male_medical',
    wardName: 'Male Medical Ward',
    bedNumber: 'MM-02',
    status: 'available',
  },
  {
    id: 'bed-male-03',
    ward: 'male_medical',
    wardName: 'Male Medical Ward',
    bedNumber: 'MM-03',
    status: 'maintenance',
  },

  {
    id: 'bed-female-01',
    ward: 'female_medical',
    wardName: 'Female Medical Ward',
    bedNumber: 'FM-01',
    status: 'available',
  },
  {
    id: 'bed-female-02',
    ward: 'female_medical',
    wardName: 'Female Medical Ward',
    bedNumber: 'FM-02',
    status: 'available',
  },

  {
    id: 'bed-paediatric-01',
    ward: 'paediatric',
    wardName: 'Paediatric Ward',
    bedNumber: 'PD-01',
    status: 'available',
  },
  {
    id: 'bed-paediatric-02',
    ward: 'paediatric',
    wardName: 'Paediatric Ward',
    bedNumber: 'PD-02',
    status: 'available',
  },

  {
    id: 'bed-observation-01',
    ward: 'observation',
    wardName: 'Observation Ward',
    bedNumber: 'OBS-01',
    status: 'available',
  },
  {
    id: 'bed-observation-02',
    ward: 'observation',
    wardName: 'Observation Ward',
    bedNumber: 'OBS-02',
    status: 'available',
  },

  {
    id: 'bed-isolation-01',
    ward: 'isolation',
    wardName: 'Isolation Ward',
    bedNumber: 'ISO-01',
    status: 'available',
  },

  {
    id: 'bed-maternity-01',
    ward: 'maternity',
    wardName: 'Maternity Ward',
    bedNumber: 'MAT-01',
    status: 'available',
  },
];