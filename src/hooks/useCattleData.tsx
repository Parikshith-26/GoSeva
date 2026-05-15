import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useAuth } from '@/hooks/useAuth';

export function useCattleData() {
  const { user } = useAuth();

  const cattle = useLiveQuery(
    () => user ? db.cattle.where('ownerId').equals(user.uid).toArray() : [],
    [user]
  ) || [];

  const recentYields = useLiveQuery(
    () => user ? db.milkYields
      .where('ownerId').equals(user.uid)
      .reverse()
      .limit(30)
      .toArray() : [],
    [user]
  ) || [];

  const pendingVaccinations = useLiveQuery(
    () => user ? db.vaccinations
      .where('ownerId').equals(user.uid)
      .filter(v => v.status === 'pending' || v.status === 'overdue')
      .toArray() : [],
    [user]
  ) || [];

  const todayYield = useLiveQuery(
    () => {
      const today = new Date().toISOString().split('T')[0];
      return user 
        ? db.milkYields
            .where('ownerId').equals(user.uid)
            .filter(y => y.date === today)
            .toArray()
            .then(yields => yields.reduce((acc, y) => acc + y.total, 0))
        : 0;
    },
    [user]
  ) ?? 0;

  const loading = user === undefined || cattle === undefined;

  return { cattle, recentYields, pendingVaccinations, todayYield, loading: !user ? false : loading };
}
