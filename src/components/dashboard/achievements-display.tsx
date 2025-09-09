'use client';

import type { Achievement } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Award, Trophy } from 'lucide-react';

interface AchievementsDisplayProps {
  allAchievements: Achievement[];
  unlockedAchievementIds: string[];
}

export function AchievementsDisplay({
  allAchievements,
  unlockedAchievementIds,
}: AchievementsDisplayProps) {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-4">
        {allAchievements.map((achievement) => {
          const isUnlocked = unlockedAchievementIds.includes(achievement.id);
          const Icon = achievement.icon;

          return (
            <Tooltip key={achievement.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 p-2 rounded-lg border-2 transition-all',
                    isUnlocked
                      ? 'border-accent bg-accent/10'
                      : 'border-dashed border-muted bg-transparent opacity-50'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-8 w-8',
                      isUnlocked ? 'text-accent' : 'text-muted-foreground'
                    )}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex flex-col gap-1 p-2 max-w-xs">
                  <p className="font-bold text-base flex items-center gap-2">
                    <Icon className="h-5 w-5" /> {achievement.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                  {isUnlocked ? (
                    <Badge variant="default" className="mt-2 w-fit bg-green-600">
                      <Trophy className="mr-1 h-3 w-3" />
                      Desbloqueada
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="mt-2 w-fit">
                      Bloqueada
                    </Badge>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
