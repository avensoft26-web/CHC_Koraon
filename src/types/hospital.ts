export type PortalRole = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'STAFF' | 'DEVELOPER';

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'DOCTOR' 
  | 'NURSE' 
  | 'RECEPTIONIST' 
  | 'PHARMACIST' 
  | 'LAB_TECH'
  | 'DEVELOPER';

export type PatientStatus = 'Outpatient' | 'Admitted' | 'Discharged' | 'In ICU' | 'Emergency';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type PriorityLevel = 'Routine' | 'Urgent' | 'Critical';

export interface Patient {
  id: string;
  uhid: string; // Unique Hospital Identification
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: BloodGroup;
  contact: string;
  email: string;
  address: string;
  status: PatientStatus;
  primaryDoctor: string;
  wardOrRoom?: string;
  admittedAt?: string;
  allergies?: string[];
  diagnosisSummary?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  roomNo: string;
  availability: 'Available' | 'In Surgery' | 'On Break' | 'Offline';
  opdFee: number;
  phone: string;
  avatarUrl: string;
  opdQueueCount: number;
}

export interface Appointment {
  id: string;
  tokenNo: number;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female';
  doctorId: string;
  doctorName: string;
  department: string;
  dateTime: string;
  type: 'OPD Consultation' | 'Follow Up' | 'Emergency' | 'Checkup';
  status: 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending';
}

export interface Bed {
  id: string;
  bedNumber: string;
  wardName: 'ICU' | 'General Ward A' | 'General Ward B' | 'Private Suite' | 'Emergency Triage' | 'Female General Ward' | 'Male General Ward' | string;
  floor: number;
  isOccupied: boolean;
  patientName?: string;
  patientUhid?: string;
  doctorInCharge?: string;
  admittedDate?: string;
  category: 'ICU' | 'General' | 'Deluxe' | 'Oxygen Supported' | string;
}

export interface Medicine {
  id: string;
  name: string;
  brand: string;
  category: 'Antibiotic' | 'Analgesic' | 'Cardiac' | 'Diabetic' | 'Antiviral' | 'IV Fluid' | 'Antacid' | string;
  stock: number;
  unit: string;
  batchNo: string;
  expiryDate: string;
  unitPrice: number;
  status: 'In Stock' | 'Low Stock' | 'Expired';
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  patientUhid: string;
  patientName: string;
  billDate: string;
  department: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  totalAmount: number;
  taxAmount: number;
  finalPayable: number;
  status: 'Paid' | 'Unpaid' | 'Claim Processing';
  paymentMethod?: 'Cash' | 'Credit Card' | 'UPI' | 'TPA Insurance';
}

export interface HospitalStaff {
  id: string;
  empId: string;
  name: string;
  role: 'Head Nurse' | 'Staff Nurse' | 'Pharmacist' | 'Lab Technician' | 'Receptionist' | 'Ward Incharge' | 'Developer' | 'Doctor' | string;
  department: string;
  shift: 'Morning (08:00 - 16:00)' | 'Evening (16:00 - 00:00)' | 'Night (00:00 - 08:00)' | 'General (10:00 - 19:00)' | 'General (09:00 - 18:00)' | string;
  status: 'On Duty' | 'Off Duty' | 'On Leave';
  contact: string;
}

export interface LabReport {
  id: string;
  testName: string;
  patientName: string;
  uhid: string;
  doctor: string;
  date: string;
  status: 'Completed' | 'Sample Collected' | 'Analyzing';
  findings: string;
  flag: 'Normal' | 'Abnormal' | 'Critical';
}

export interface VitalRecord {
  id: string;
  patientName: string;
  uhid: string;
  bedNo: string;
  recordedAt: string;
  bp: string;
  pulse: number;
  temp: number;
  spo2: number;
  ivInfusion: string;
  nurseName: string;
}
