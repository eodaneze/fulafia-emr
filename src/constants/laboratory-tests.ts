import type { LaboratoryTestOption } from '@/src/types/doctor';

export const laboratoryTestCatalogue: LaboratoryTestOption[] = [
  {
    code: 'MP',
    name: 'Malaria Parasite',
    category: 'Haematology',
    specimen: 'Blood',
  },
  {
    code: 'FBC',
    name: 'Full Blood Count',
    category: 'Haematology',
    specimen: 'Blood',
  },
  {
    code: 'PCV',
    name: 'Packed Cell Volume',
    category: 'Haematology',
    specimen: 'Blood',
  },
  {
    code: 'WIDAL',
    name: 'Widal Test',
    category: 'Serology',
    specimen: 'Blood',
  },
  {
    code: 'HIV',
    name: 'HIV Screening',
    category: 'Serology',
    specimen: 'Blood',
  },
  {
    code: 'HBsAg',
    name: 'Hepatitis B Surface Antigen',
    category: 'Serology',
    specimen: 'Blood',
  },
  {
    code: 'URINALYSIS',
    name: 'Urinalysis',
    category: 'Clinical Chemistry',
    specimen: 'Urine',
  },
  {
    code: 'RBS',
    name: 'Random Blood Sugar',
    category: 'Clinical Chemistry',
    specimen: 'Blood',
  },
  {
    code: 'FBS',
    name: 'Fasting Blood Sugar',
    category: 'Clinical Chemistry',
    specimen: 'Blood',
  },
  {
    code: 'UREA',
    name: 'Urea and Electrolytes',
    category: 'Clinical Chemistry',
    specimen: 'Blood',
  },
];