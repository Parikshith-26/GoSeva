export interface Profile {
  uid: string;
  name: string;
  farmName: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  phoneNumber?: string;
  language: 'en' | 'hi' | 'kn' | 'ta' | 'te';
  createdAt: string | number;
}

export interface Cattle {
  id?: string | number;
  ownerId: string;
  earTagId: string;
  name: string;
  breed: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  photoUrl?: string;
  status: 'healthy' | 'sick' | 'pregnant' | 'sold' | 'deceased';
  lastMilkYield?: number;
  createdAt: string | number;
}

export interface MilkYield {
  id?: string | number;
  cattleId: string | number;
  ownerId: string;
  date: string;
  morning: number;
  evening: number;
  total: number;
  notes?: string;
  createdAt: string | number;
}

export interface HealthRecord {
  id?: string | number;
  cattleId: string | number;
  ownerId: string;
  date: string;
  type: 'checkup' | 'illness' | 'injury' | 'treatment';
  description: string;
  medication?: string;
  veterinarian?: string;
  cost?: number;
  createdAt: string | number;
}

export interface Vaccination {
  id?: string | number;
  cattleId: string | number;
  ownerId: string;
  vaccineName: string;
  dateAdministered?: string;
  date?: string;
  nextDueDate: string;
  administeredBy?: string;
  veterinarian?: string;
  status: 'completed' | 'pending' | 'overdue';
  createdAt: string | number;
}

export interface BreedingCycle {
  id?: string | number;
  cattleId: string | number;
  ownerId: string;
  heatStartDate: string;
  breedingDate?: string;
  bullName?: string;
  status: 'heat' | 'bred' | 'pregnant' | 'heat-missed';
  notes?: string;
  createdAt: string | number;
}
