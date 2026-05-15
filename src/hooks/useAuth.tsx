import { useState, useEffect, createContext, useContext } from 'react';
import { db } from '@/lib/db';
import { Profile } from '@/types';

interface User {
  uid: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const userProfile = await db.users.get(uid);
      if (userProfile) {
        setProfile(userProfile);
        setUser({ uid: userProfile.uid, email: (userProfile as any).email || '', displayName: userProfile.name });
      } else {
        setProfile(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch local profile:', error);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const savedUid = localStorage.getItem('goseva_uid');
      if (savedUid) {
        await fetchProfile(savedUid);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const signIn = async (email: string, name: string) => {
    const uid = 'local_' + btoa(email).slice(0, 8);
    const existingUser = await db.users.get(uid);
    
    if (!existingUser) {
      const newUser: Profile = {
        uid,
        name,
        farmName: 'My Farm',
        language: 'en',
        createdAt: Date.now()
      };
      await db.users.add(newUser);
    }
    
    localStorage.setItem('goseva_uid', uid);
    await fetchProfile(uid);
  };

  const signOut = async () => {
    localStorage.removeItem('goseva_uid');
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    const uid = localStorage.getItem('goseva_uid');
    if (uid) await fetchProfile(uid);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
