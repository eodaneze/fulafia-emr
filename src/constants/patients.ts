import type { Patient } from '@/src/types/patient';

export const initialPatients: Patient[] = [
  {
    id: 'patient-001',
    hospitalNumber: 'FULCH-2026-00128',
    studentRegistrationNumber: 'FUL/CSC/21/1045',

    firstName: 'Ibrahim',
    middleName: 'Sani',
    lastName: 'Musa',
    fullName: 'Ibrahim Sani Musa',

    dateOfBirth: '2002-04-15',
    age: 24,
    sex: 'male',
    patientType: 'student',

    phoneNumber: '08035550142',
    email: 'ibrahim.musa@student.fulafia.edu.ng',

    address: 'Federal University of Lafia Student Hostel',
    stateOfOrigin: 'Nasarawa',
    localGovernmentArea: 'Lafia',

    nextOfKinName: 'Sani Musa',
    nextOfKinRelationship: 'Father',
    nextOfKinPhoneNumber: '08035550190',

    bloodGroup: 'O+',
    genotype: 'AA',
    allergies: [],

    status: 'active',
    queueStatus: 'waiting_for_vitals',

    lastVisitAt: '2026-08-03T08:20:00.000Z',
    totalVisits: 3,

    createdAt: '2026-02-14T09:30:00.000Z',
    updatedAt: '2026-08-03T08:20:00.000Z',
  },
  {
    id: 'patient-002',
    hospitalNumber: 'FULCH-2026-00119',

    firstName: 'Amina',
    lastName: 'Abdullahi',
    fullName: 'Amina Abdullahi',

    dateOfBirth: '1997-09-21',
    age: 28,
    sex: 'female',
    patientType: 'staff',
    staffNumber: 'FUL/STAFF/0842',

    phoneNumber: '08061234001',
    email: 'amina.abdullahi@fulafia.edu.ng',

    address: 'Bukan Sidi, Lafia',
    stateOfOrigin: 'Nasarawa',
    localGovernmentArea: 'Lafia',

    nextOfKinName: 'Haruna Abdullahi',
    nextOfKinRelationship: 'Husband',
    nextOfKinPhoneNumber: '08061234091',

    bloodGroup: 'A+',
    genotype: 'AA',
    allergies: ['Penicillin'],

    status: 'active',
    queueStatus: 'waiting_for_doctor',

    lastVisitAt: '2026-08-03T07:54:00.000Z',
    totalVisits: 8,

    createdAt: '2025-09-11T10:20:00.000Z',
    updatedAt: '2026-08-03T07:54:00.000Z',
  },
  {
    id: 'patient-003',
    hospitalNumber: 'FULCH-2026-00097',
    studentRegistrationNumber: 'FUL/MCB/22/0712',

    firstName: 'Grace',
    middleName: 'Ola',
    lastName: 'Peter',
    fullName: 'Grace Ola Peter',

    dateOfBirth: '2004-01-08',
    age: 22,
    sex: 'female',
    patientType: 'student',

    phoneNumber: '07044553118',
    email: 'grace.peter@student.fulafia.edu.ng',

    address: 'Federal University of Lafia Student Hostel',
    stateOfOrigin: 'Benue',
    localGovernmentArea: 'Makurdi',

    nextOfKinName: 'Peter Ola',
    nextOfKinRelationship: 'Father',
    nextOfKinPhoneNumber: '07044553188',

    bloodGroup: 'B+',
    genotype: 'AS',
    allergies: [],

    status: 'active',
    queueStatus: 'lab_result_ready',

    lastVisitAt: '2026-08-03T07:12:00.000Z',
    totalVisits: 2,

    createdAt: '2026-01-22T11:10:00.000Z',
    updatedAt: '2026-08-03T07:12:00.000Z',
  },
  {
    id: 'patient-004',
    hospitalNumber: 'FULCH-2026-00074',

    firstName: 'David',
    lastName: 'John',
    fullName: 'David John',

    dateOfBirth: '1986-06-13',
    age: 40,
    sex: 'male',
    patientType: 'public',

    phoneNumber: '08120113345',

    address: 'Shabu, Lafia',
    stateOfOrigin: 'Nasarawa',
    localGovernmentArea: 'Lafia',

    nextOfKinName: 'Rebecca John',
    nextOfKinRelationship: 'Wife',
    nextOfKinPhoneNumber: '08120113370',

    bloodGroup: 'O-',
    genotype: 'AA',
    allergies: [],

    status: 'active',
    queueStatus: 'discharged',

    lastVisitAt: '2026-08-02T15:42:00.000Z',
    totalVisits: 5,

    createdAt: '2025-12-03T08:40:00.000Z',
    updatedAt: '2026-08-02T15:42:00.000Z',
  },
];