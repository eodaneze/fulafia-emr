import type { HospitalStaff } from '@/src/types/hr';

export const initialHospitalStaff: HospitalStaff[] = [
  {
    id: 'staff-doctor-001',

    fullName: 'Dr. Amina Yusuf',
    employeeId: 'FULCH-DOC-001',

    role: 'doctor',
    department: 'Medical Services',
    designation: 'Medical Officer',
    specialty: 'General Medicine',

    employmentDate: '2021-04-12',
    employmentStatus: 'active',

    phoneNumber: '08031234567',
    email: 'amina.yusuf@fulafia.edu.ng',
    address: 'Lafia, Nasarawa State',

    salaryGrade: 'CONMESS 3',

    nextOfKin: {
      fullName: 'Yusuf Ibrahim',
      relationship: 'Spouse',
      phoneNumber: '08039876543',
    },

    qualifications: [
      {
        id: 'qualification-doctor-001',
        qualification: 'MBBS',
        institution: 'University of Jos',
        yearObtained: 2017,
      },
    ],

    promotionHistory: [
      {
        id: 'promotion-doctor-001',
        previousDesignation: 'House Officer',
        newDesignation: 'Medical Officer',
        previousSalaryGrade: 'CONMESS 1',
        newSalaryGrade: 'CONMESS 3',
        effectiveDate: '2023-01-01',
      },
    ],

    attendanceStatus: 'present',
    currentShift: 'morning',

    leaveStatus: 'none',
    leaveBalance: 18,

    callDutyDate: '2026-08-05',

    createdAt: '2021-04-12T08:00:00.000Z',
    updatedAt: '2026-08-04T06:30:00.000Z',
  },

  {
    id: 'staff-ward-nurse-001',

    fullName: 'Nurse Grace John',
    employeeId: 'FULCH-WARD-001',

    role: 'ward_nurse',
    department: 'Ward Nursing',
    designation: 'Senior Nursing Officer',

    employmentDate: '2020-09-14',
    employmentStatus: 'active',

    phoneNumber: '08044556677',
    email: 'grace.john@fulafia.edu.ng',
    address: 'Shabu, Lafia',

    salaryGrade: 'CONHESS 9',

    nextOfKin: {
      fullName: 'John Daniel',
      relationship: 'Brother',
      phoneNumber: '08066778899',
    },

    qualifications: [
      {
        id: 'qualification-nurse-001',
        qualification: 'Registered Nurse',
        institution: 'School of Nursing, Lafia',
        yearObtained: 2015,
      },
    ],

    promotionHistory: [
      {
        id: 'promotion-nurse-001',
        previousDesignation: 'Nursing Officer',
        newDesignation: 'Senior Nursing Officer',
        previousSalaryGrade: 'CONHESS 7',
        newSalaryGrade: 'CONHESS 9',
        effectiveDate: '2024-03-01',
      },
    ],

    attendanceStatus: 'present',
    currentShift: 'morning',

    leaveStatus: 'none',
    leaveBalance: 21,

    createdAt: '2020-09-14T08:00:00.000Z',
    updatedAt: '2026-08-04T06:40:00.000Z',
  },

  {
    id: 'staff-lab-001',

    fullName: 'Mr. Emmanuel Danladi',
    employeeId: 'FULCH-LAB-001',

    role: 'laboratory_scientist',
    department: 'Medical Laboratory',
    designation: 'Medical Laboratory Scientist',

    employmentDate: '2022-02-07',
    employmentStatus: 'active',

    phoneNumber: '08055667788',
    email: 'emmanuel.danladi@fulafia.edu.ng',
    address: 'Bukan Sidi, Lafia',

    salaryGrade: 'CONHESS 8',

    nextOfKin: {
      fullName: 'Mary Danladi',
      relationship: 'Spouse',
      phoneNumber: '08077889900',
    },

    qualifications: [
      {
        id: 'qualification-lab-001',
        qualification: 'BMLS',
        institution: 'University of Maiduguri',
        yearObtained: 2019,
      },
    ],

    promotionHistory: [],

    attendanceStatus: 'late',
    currentShift: 'morning',

    leaveStatus: 'none',
    leaveBalance: 16,

    createdAt: '2022-02-07T08:00:00.000Z',
    updatedAt: '2026-08-04T07:15:00.000Z',
  },

  {
    id: 'staff-pharmacy-001',

    fullName: 'Pharm. Fatima Abdullahi',
    employeeId: 'FULCH-PHA-001',

    role: 'pharmacist',
    department: 'Pharmacy',
    designation: 'Senior Pharmacist',

    employmentDate: '2019-06-03',
    employmentStatus: 'active',

    phoneNumber: '08066778811',
    email: 'fatima.abdullahi@fulafia.edu.ng',
    address: 'Lafia, Nasarawa State',

    salaryGrade: 'CONHESS 10',

    nextOfKin: {
      fullName: 'Abdullahi Musa',
      relationship: 'Spouse',
      phoneNumber: '08055443322',
    },

    qualifications: [
      {
        id: 'qualification-pharmacy-001',
        qualification: 'B.Pharm',
        institution: 'Ahmadu Bello University',
        yearObtained: 2016,
      },
    ],

    promotionHistory: [],

    attendanceStatus: 'present',
    currentShift: 'afternoon',

    leaveStatus: 'none',
    leaveBalance: 14,

    createdAt: '2019-06-03T08:00:00.000Z',
    updatedAt: '2026-08-04T06:50:00.000Z',
  },

  {
    id: 'staff-records-001',

    fullName: 'Mrs. Ruth Audu',
    employeeId: 'FULCH-REC-001',

    role: 'records_officer',
    department: 'Health Records',
    designation: 'Health Records Officer',

    employmentDate: '2023-01-16',
    employmentStatus: 'active',

    phoneNumber: '08022998877',
    email: 'ruth.audu@fulafia.edu.ng',
    address: 'Akurba, Lafia',

    salaryGrade: 'CONHESS 7',

    nextOfKin: {
      fullName: 'James Audu',
      relationship: 'Spouse',
      phoneNumber: '08011887766',
    },

    qualifications: [
      {
        id: 'qualification-records-001',
        qualification: 'HND Health Information Management',
        institution: 'Federal Polytechnic Nasarawa',
        yearObtained: 2021,
      },
    ],

    promotionHistory: [],

    attendanceStatus: 'on_leave',
    currentShift: 'off_duty',

    leaveStatus: 'approved',
    leaveBalance: 8,

    createdAt: '2023-01-16T08:00:00.000Z',
    updatedAt: '2026-08-02T09:00:00.000Z',
  },

  {
    id: 'staff-environmental-001',

    fullName: 'Mr. Samuel Luka',
    employeeId: 'FULCH-ENV-001',

    role: 'environmental_officer',
    department: 'Environmental Services',
    designation: 'Environmental Health Officer',

    employmentDate: '2021-11-01',
    employmentStatus: 'active',

    phoneNumber: '08044882211',
    email: 'samuel.luka@fulafia.edu.ng',
    address: 'Mararaba Akunza, Lafia',

    salaryGrade: 'CONHESS 6',

    nextOfKin: {
      fullName: 'Luka Peter',
      relationship: 'Father',
      phoneNumber: '08077221144',
    },

    qualifications: [
      {
        id: 'qualification-environmental-001',
        qualification: 'B.Sc. Environmental Health',
        institution: 'Nasarawa State University',
        yearObtained: 2018,
      },
    ],

    promotionHistory: [],

    attendanceStatus: 'present',
    currentShift: 'morning',

    leaveStatus: 'pending',
    leaveBalance: 12,

    createdAt: '2021-11-01T08:00:00.000Z',
    updatedAt: '2026-08-04T06:55:00.000Z',
  },
];