import Dexie, { type Table } from 'dexie';
import { Cattle, MilkYield, Vaccination, BreedingCycle, Profile } from '../types';

export class GoSevaDatabase extends Dexie {
  cattle!: Table<Cattle>;
  milkYields!: Table<MilkYield>;
  vaccinations!: Table<Vaccination>;
  breedingCycles!: Table<BreedingCycle>;
  users!: Table<Profile>;

  constructor() {
    super('GoSevaDB');
    this.version(1).stores({
      cattle: '++id, earTagId, name, ownerId, status',
      milkYields: '++id, cattleId, date, ownerId',
      vaccinations: '++id, cattleId, vaccineName, ownerId',
      breedingCycles: '++id, cattleId, status, ownerId',
      users: 'uid, contactNumber'
    });
  }
}

export const db = new GoSevaDatabase();
