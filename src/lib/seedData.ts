import { db } from './db';

const SAMPLE_NAMES = ['Ganga', 'Yamuna', 'Lakshmi', 'Nandini', 'Gauri', 'Kamadhenu', 'Anandi', 'Bhavani', 'Durga', 'Saraswati'];
const SAMPLE_BREEDS = ['Gir', 'Sahiwal', 'Red Sindhi', 'Tharparkar', 'Jersey', 'Holstein-Friesian'];
const VACCINES = ['FMD', 'Brucellosis', 'HS', 'BQ', 'Anthrax'];

export async function seedCattleData(userId: string) {
  const cattlePromises = SAMPLE_NAMES.map(async (name, index) => {
    try {
      // 1. Create Cattle
      const cattleId = await db.cattle.add({
        ownerId: userId,
        earTagId: `TAG-${1000 + index}`,
        name: name,
        breed: SAMPLE_BREEDS[index % SAMPLE_BREEDS.length],
        dateOfBirth: '2021-06-15',
        gender: 'female',
        status: index % 3 === 0 ? 'pregnant' : (index % 5 === 0 ? 'sick' : 'healthy'),
        lastMilkYield: 8 + Math.random() * 10,
        createdAt: Date.now(),
      });

      // 2. Add Production History (Milk Yields) - Last 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const morning = Math.round((5 + Math.random() * 5) * 10) / 10;
        const evening = Math.round((4 + Math.random() * 4) * 10) / 10;
        await db.milkYields.add({
          cattleId,
          ownerId: userId,
          date: dateStr,
          morning,
          evening,
          total: Math.round((morning + evening) * 10) / 10,
          notes: 'Routine milking',
          createdAt: Date.now()
        });
      }

      // 3. Add Vaccination History
      const vaccRecords = VACCINES.slice(0, 2 + (index % 3)).map(vaccine => ({
        cattleId,
        ownerId: userId,
        vaccineName: vaccine,
        date: '2023-12-10',
        administeredBy: 'Dr. Sharma',
        nextDueDate: '2024-06-10',
        notes: 'Annual dose',
        status: 'completed' as const,
        createdAt: Date.now()
      }));
      await db.vaccinations.bulkAdd(vaccRecords);

      // 4. Add Breeding Cycles (for some)
      if (index % 2 === 0) {
        await db.breedingCycles.add({
          cattleId,
          ownerId: userId,
          heatStartDate: '2024-03-01',
          breedingDate: '2024-03-02',
          bullName: 'Bull-092',
          status: index % 3 === 0 ? 'pregnant' : 'bred',
          notes: 'First cycle',
          createdAt: Date.now()
        });
      }
    } catch (error) {
      console.error('Failed to seed cattle:', name, error);
      throw error;
    }
  });

  await Promise.all(cattlePromises);
}
