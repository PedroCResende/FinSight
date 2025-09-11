'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './auth-context';
import { getAchievements, unlockAchievement } from '@/services/firestore';
import type { UserAchievement, Achievement } from '@/lib/types';
import { ALL_ACHIEVEMENTS } from '@/lib/achievements-data';
import { useToast } from '@/hooks/use-toast';

interface AchievementsContextType {
  unlockedAchievements: UserAchievement[];
  checkAndUnlockAchievement: (condition: Achievement['condition'], context?: any) => void;
  loading: boolean;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export function AchievementsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unlockedAchievements, setUnlockedAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchAchievements = async () => {
        setLoading(true);
        const userAchievements = await getAchievements(user.uid);
        setUnlockedAchievements(userAchievements);
        setLoading(false);
      };
      fetchAchievements();
    } else {
      setUnlockedAchievements([]);
      setLoading(false);
    }
  }, [user]);

  const checkAndUnlockAchievement = useCallback(async (condition: Achievement['condition'], context?: any) => {
    if (!user) return;

    const achievementToUnlock = ALL_ACHIEVEMENTS.find(a => a.condition === condition);
    
    if (achievementToUnlock && !unlockedAchievements.some(ua => ua.achievementId === achievementToUnlock.id)) {
      
      // Here you can add logic based on the condition and context if needed
      // For now, we'll assume the check is done before calling this function
      // e.g. for 'categorized100Transactions', the component would count them first.
      
      try {
        const newAchievementId = await unlockAchievement(user.uid, achievementToUnlock.id);
        const newAchievement: UserAchievement = {
            id: newAchievementId,
            achievementId: achievementToUnlock.id,
            unlockedAt: new Date() // Optimistic update
        };
        setUnlockedAchievements(prev => [...prev, newAchievement]);
        toast({
          title: '🏆 Conquista Desbloqueada!',
          description: `Você ganhou: "${achievementToUnlock.title}"`,
        });
      } catch (error) {
        console.error("Failed to unlock achievement:", error);
      }
    }
  }, [user, unlockedAchievements, toast]);

  const value = {
    unlockedAchievements,
    checkAndUnlockAchievement,
    loading,
  };

  return <AchievementsContext.Provider value={value}>{children}</AchievementsContext.Provider>;
}

export function useAchievements() {
  const context = useContext(AchievementsContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  return context;
}
